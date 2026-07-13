---
title: Daemon & FUSE
description: How keeperd holds the unlocked vault, watches for changes, and serves the garden as a plaintext view that never touches disk.
---

`softfig-keeperd` is the per-device daemon. It is the one process that holds the
unlocked vault, the one writer to the store, and the one thing that turns your edits
into signed commits. This page explains its three moving parts: the **watcher**
pipeline that classifies changes, the **FUSE** view that shows you plaintext without
ever writing plaintext, and the **lock/unlock** lifecycle that governs when any of
it is possible.

For the workspace-wide picture see [Architecture](../architecture/); for the
committed data structures see [Version Control](../vcs/).

## Born in FUSE

The defining trick: **plaintext never lands on disk.** The canonical state under the
state root is all ciphertext — encrypted blobs, a SQLite index, wrapped keys. On
unlock, the daemon mounts a [FUSE](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)
filesystem at your garden root and *projects* the decrypted content there. When you
`cat` a file, the bytes are decrypted in the daemon's memory at read time and handed
to the kernel; they exist as plaintext only in RAM, only for that read. On lock, the
mount goes away and the garden root is empty again.

This is why a freshly onboarded garden is "born in FUSE": `softfig onboard` writes
the first commit straight into the encrypted state-root layout and never materializes
a plaintext tree to convert. There is no plaintext copy to leak, back up by accident,
or forget to clean up.

## The watcher pipeline

Writes don't always come through a verb — you can edit a file in the mount with any
editor. The watcher is what notices, and it feeds the *same* commit path the typed
verbs use.

```
inotify ─▶ notify-debouncer-full ─▶ DirtyEvent ─▶ accumulator ─▶ classify ─▶ commit
  (200 ms debounce)                                  │
FUSE write ─▶ AccumulatorSink ─────────────────────┘  (same accumulator)
```

- **Two sources, one accumulator.** A source-agnostic `DirtySetAccumulator` collects
  change events. An `InotifyDriver` (built on the `notify` + `notify-debouncer-full`
  crates) feeds it filesystem events with a **200 ms debounce**; FUSE writes feed the
  *same* accumulator through an `AccumulatorSink` adapter. So a change made by an
  editor and a change made through the mount reach one identical classifier — a
  single pipeline, not two.
- **Self-write suppression.** When the daemon itself writes (a verb commit, a reveal
  temp file), it registers those paths in a suppress window (~500 ms) so its own I/O
  doesn't bounce back as a spurious "manual edit."
- **The intent classifier.** Before committing, the daemon labels the change. The
  classifier only assigns a specific intent when the dirty set is homogeneous and
  matches a rule — a single new `journal/decisions/decision-<slug>.md` →
  `decision_logged`, a new `incident-…` → `incident_logged`, renames into
  `journal/archive/**` → `archive_move` — and otherwise falls back to `manual_edit`.
  Typed verbs skip the guessing: each carries its own intent (`note_added`,
  `config_migrated`, …). Intents are a closed enum; see
  [Version Control → Intent](../vcs/#every-commit-has-an-intent).

## The FUSE view in detail

The mount is more than "decrypt on read" — it also carries Layer B's redaction and an
in-memory overlay for writes.

**Reads.** For a normal file the daemon looks it up in the committed tip, decrypts the
Layer-A blob with the in-RAM `VaultSession`, and returns the bytes. Two Layer-B cases
intercept that:

- A **whole-file sealed** path (matched by a glob in `sealed-paths.toml`) never
  decrypts through the mount. It returns the placeholder `[sealed:<path>]` instead,
  computed on the fly, never stored.
- A file containing **inline `<vault id="…">` regions** decrypts its Layer-A body,
  then has each sealed region replaced with `[encrypted]` before the bytes leave the
  daemon.

Because the redaction happens *inside* the daemon, a sealed secret is invisible to
anything reading through the mount — including a Claude session. The only way to see
the plaintext is the CLI-and-human-only `softfig reveal`, covered in the
[Secrets guide](../../guides/secrets/). The read-only IPC browse verbs
(`list_tree` / `read_file`) apply this exact same redaction, so the TUI and MCP see
placeholders too.

**Writes.** A write through the mount does not commit immediately. It lands in an
in-memory **overlay** (a write buffer with a generation counter); the overlay fires a
dirty event into the accumulator; and the daemon's flush later folds the overlay into
one commit. When a new tip is published, the overlay and the read caches are
invalidated. Building the commit reads from the daemon's in-memory snapshot rather
than by walking the mounted directory — otherwise the commit walk would read through
its own FUSE mount and deadlock.

:::note[The mount serves a single chain today]
On the shipped line, the mount projects one device chain. The multi-ref
**union-mount** — composing several chains (device + shared subtrees) into one
namespace and routing writes to the owning chain — is the in-development M5c work; see
[Code Status](../status/).
:::

## Lock and unlock

The daemon boots **Locked**. In that state only two IPC verbs answer — `status` and
`unlock`; everything else is refused until a session exists.

- **Unlock** takes the passphrase, runs it through the vault to produce a
  `VaultSession` (the decryption keys, held in RAM), opens the repo, and — for a
  FUSE-configured garden — mounts the plaintext view. The session is shared (behind an
  `Arc`) with the FUSE layer so reads can decrypt without contending on the daemon's
  main lock. The [key derivation](../vault/#the-key-hierarchy) is entirely inside the
  vault.
- **Lock / shutdown** drops the session, repo, and mount. Dropping the mount handle
  unmounts it; dropping the session zeroizes the keys. The garden root is plaintext-free
  again.

**Relock (daemon cycle).** Sometimes the daemon must restart while staying unlocked —
you rebuilt the binary, say. Rather than re-prompting for the passphrase, `softfig
daemon cycle` uses a one-time **relock token**: the outgoing daemon wraps its live key
under a fresh random token written to a `$XDG_RUNTIME_DIR` (tmpfs) blob, and the
incoming daemon redeems it to re-establish the session without the passphrase. The
token is single-use, time-boxed (a short TTL, bound into the wrap's associated data),
and scoped to that exact vault by fingerprint — a different vault's daemon cannot
redeem it. The mechanism lives in the vault; the [Vault page](../vault/) covers the
key math.

## The IPC surface

Frontends talk to the daemon over a **JSON-Lines** protocol on a Unix domain socket at
`$XDG_RUNTIME_DIR/softfig-keeperd.sock`. Each request is one line —
`{"v":1,"op":"<verb>","args":{…}}` — and each reply is one line, either
`{"ok":true,"data":…}` or `{"ok":false,"error":"…","kind":"…"}`. Every accept is
authenticated twice over: the socket is mode `0600`, and the daemon checks the peer's
UID with `SO_PEERCRED` on each connection.

The verb set spans the whole feature surface — status/unlock, `commit`/`log`/`show`,
the typed document verbs (`log_decision`, `add_note`, `add_section`, …), the read-only
browse verbs, Layer-B `vault_*`, pairing `pair_*`, replica `replica_*`, and the
growlight backlog verbs. The full catalogue is [MCP verbs](../../reference/mcp-verbs/)
(the MCP bridge is a thin translation of it) and [the CLI](../../reference/cli/).

:::note[The replication data plane is not on this socket]
Cross-device backup (M5b) rides the peer-to-peer Noise sessions, not the local IPC
socket. The daemon hosts that listener separately on unlock. See
[The Vault → Cross-device trust](../vault/#device-identity-and-trust).
:::

---

Related: [Architecture](../architecture/) (the crate map and the write pipeline),
[Version Control](../vcs/) (what a commit contains), [The Vault](../vault/) (the keys
the session holds), and the [Secrets guide](../../guides/secrets/) (reveal, the only
way past Layer B).
