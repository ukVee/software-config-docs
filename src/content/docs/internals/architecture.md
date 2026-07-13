---
title: Architecture
description: The Rust workspace — what each crate does, how data flows, and where the boundaries are.
---

soft-fig is a Cargo workspace of small Rust crates. This page is the map of that
workspace: what each crate is responsible for, how a change flows from your editor
to a signed commit, and the two boundaries that shape everything —
**frontend-neutral cores** and **the daemon owns all writes**.

It describes the code as built. The *design* behind it — the per-pillar spec
playgrounds and the dated decision log — lives in the garden, as
[explained on the roadmap page](../../garden/vision-roadmap/#where-the-design-thinking-lives).
The [code repository](https://github.com/ukVee/software-config-garden) is the
authority when this page and the code disagree.

## The two boundaries

Two rules explain why the crates are split the way they are.

**Frontend-neutral cores.** The crates that do the real work — crypto, storage,
version control, sync, deployment, scaffolding — know nothing about any user
interface and don't depend on the daemon. They expose plain library entry points.
The daemon calls them today; a future MCP tool, GUI, or test harness calls the same
functions unchanged. `softfig onboard` (a CLI command) and a future `onboard` MCP
tool both wrap the one `softfig-onboard::onboard()` entry point.

**The daemon owns all writes.** When the per-device daemon is running it is the
*sole writer* to the store. Every mutation — whether it arrives as an IPC verb, a
write through the FUSE mount, or a file the watcher noticed — funnels through one
classifier and one signer inside `softfig-keeperd`. Frontends never touch the
object store directly. The CLI keeps a direct-mode fallback for `commit`/`log`/
`show`/`fsck`, but it engages **only** when no daemon socket is present; a
reachable-but-erroring daemon is surfaced verbatim, never bypassed, so the
single-writer invariant always holds.

## The crates

The workspace has fifteen member crates, grouped by role.

### Cores (frontend-neutral)

| Crate | Job |
|---|---|
| `softfig-vault` | Crypto and key lifecycle: master key, passphrase + recovery unlock, key rotation, the Ed25519 identity key, content-addressable blob encryption, the two Layer-B subkey derivations. |
| `softfig-store` | The low-level store: the ciphertext object directory (`objects/<aa>/<rest>`) plus the SQLite metadata database. |
| `softfig-vcs` | Version-control operations over the store: the garden walker, tree builder, commit creator + Ed25519 signer, `log`, and `fsck`. |
| `softfig-net` | Cross-device transport and control plane: a Noise tunnel over TCP, a protobuf control plane, pairing, the trust ring, mDNS discovery, the relay, and the replication data plane. |
| `softfig-deploy` | The dotfile deploy spine: reads `config/deploy.toml` and plans/applies source→target symlinks or stamped copies. |
| `softfig-onboard` | The scaffold core: materializes a fresh garden from an embedded skeleton and inits the vault, born-in-FUSE. |

### The daemon and its mount

| Crate | Job |
|---|---|
| `softfig-keeperd` | The per-device daemon binary. Holds the unlocked vault session in RAM, serves the IPC socket, runs the watcher pipeline, hosts the FUSE mount, and hosts the `softfig-net` instance. All writes are classified, committed, and signed here. |
| `softfig-fuse` | The FUSE filesystem: projects the encrypted store as a plaintext view at the garden root, decrypting blobs at read time and redacting Layer-B secrets to placeholders. |

### The protocol

| Crate | Job |
|---|---|
| `softfig-ipc` | The JSON-Lines protocol: the request/reply envelope, the typed verb args and replies, the error kinds, and a synchronous Unix-socket client. Every frontend speaks this. |

### Frontends

| Crate | Job |
|---|---|
| `softfig-cli` | The `softfig` binary: vault, VCS, daemon, migrate, deploy, pairing, replica, and growlight subcommands. Bridges to the daemon when present. |
| `softfig-tui` | A [ratatui](https://ratatui.rs/) terminal UI over the daemon: Browse / History / Actions / Vault / Peers, with in-app unlock. |
| `softfig-mcp` | A stateless stdio bridge that translates [Model Context Protocol](../../guides/claude-mcp/) JSON-RPC into IPC verbs, so a Claude session can maintain the garden through typed tools. |

### The growlight fleet

| Crate | Job |
|---|---|
| `softfig-growlightd` | The multi-agent orchestrator daemon: owns the agent fleet and serves its own control-plane IPC. It is itself a `keeperd` client. |
| `softfig-growlightd-client` | A thin, reconnecting `subscribe` client over the growlightd IPC, shared by the CLI `watch` path and the GUI. |
| `softfig-growlight-gui` | The Elm-style view-model (state + reducer + render-model) over the growlightd IPC. The [iced](https://iced.rs/) render binding is deferred. |

The three growlight crates are the *loop's* control plane, distinct from the
garden's own daemon. The autonomous work loop itself is
[documented in the Growlight area](../../growlight/overview/).

## How a change flows

There are two ways a mutation reaches a signed commit, and they share one pipeline.

**Through a frontend (typed write).** A frontend builds a verb — `log_decision`,
`add_note`, `commit`, `replica_grant` — and sends it as one JSON line over the Unix
socket. The daemon authenticates the caller (a `SO_PEERCRED` UID-match on a `0600`
socket), validates the arguments, stamps the garden conventions (path, header,
intent), and writes exactly one commit. The daemon stamping the conventions is what
lets any Claude session write a correctly-formed file without having learned them.

**Through the FUSE mount (native write).** You (or a tool, or an editor) write a
file inside the garden as if it were an ordinary directory. The write lands in the
FUSE overlay; the watcher's accumulator notices it, debounces (200 ms), and the
**intent classifier** decides what kind of change it was — `decision_logged`,
`incident_logged`, `archive_move`, or the `manual_edit` fallback — before the daemon
commits it.

Both paths feed the **same** dirty-set accumulator and the **same** classifier, so
there is exactly one code path that turns dirt into a signed commit regardless of
where it came from. That pipeline is [Daemon & FUSE](../daemon-and-fuse/) in detail.

```
              ┌── CLI ──┐   ┌── TUI ──┐   ┌── MCP ──┐
  typed write │  verb   │   │  verb   │   │  verb   │
              └────┬────┘   └────┬────┘   └────┬────┘
                   └─────────────┼─────────────┘
                                 ▼  JSON-Lines / Unix socket (softfig-ipc)
                          ┌───────────────┐
   native write ─FUSE──▶  │  softfig-     │ ─▶ classify ─▶ sign ─▶ commit
   (editor, tool)         │   keeperd     │       (softfig-vcs → softfig-store)
                          └──────┬────────┘
                                 │ decrypt at read time
   native read ◀──FUSE──────────┘
```

**Reads** take two forms too: native filesystem reads through the FUSE mount (blobs
decrypted in the daemon at read time, Layer-B secrets projected as placeholders), or
the read-only `list_tree` / `read_file` IPC verbs, which walk the committed tip and
apply the *same* redaction the FUSE read path uses — so a frontend can browse the
garden without ever seeing sealed plaintext.

## On-disk shape

The daemon's canonical state lives under a **state root** (default
`~/.local/share/softfig/<repo_id>/.softfig/`), separate from the garden root you
edit:

```
<state_root>/.softfig/
├── vault/                  # softfig-vault: master keys, identity, KEK wrappings
├── objects/<aa>/<rest>     # ciphertext blobs, addressed by BLAKE3(ciphertext)
├── db.sqlite               # commits / trees / tree_entries / refs / meta
└── keeper.toml             # bootstrap pointer (state_root + a few pre-unlock flags)
```

No plaintext is ever written at the garden root — the daemon serves it via FUSE on
unlock, and it vanishes on lock. The per-garden *configuration* (network, relay,
replica, reveal policy) lives **inside** the garden under `config/`, so it is
encrypted at rest and versioned like everything else; only a tiny bootstrap pointer
stays in plaintext beside the vault. See [Config files](../../reference/config-files/).

---

Related: [Daemon & FUSE](../daemon-and-fuse/) (the watcher, the mount, unlock),
[Version Control](../vcs/) (the store and signed commits), [The Vault](../vault/)
(the two encryption layers and cross-device trust), and [Code Status](../status/)
(what is built today).
