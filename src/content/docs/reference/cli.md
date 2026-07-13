---
title: CLI Reference
description: Every softfig subcommand and its flags, grouped by what it touches.
---

The `softfig` binary is the command surface over the [five
pillars](../../garden/vision-roadmap/). This page catalogs each subcommand and
its flags. It documents the **built, self-hosting** surface first; commands
belonging to pillars still in development are grouped under [In
development](#in-development) and marked as such.

## Conventions

Two flags recur across almost every command:

- **`--garden <path>`** — the garden root. Omit it and the command uses the
  current directory (or the nearest ancestor containing a `.softfig/`).
- **`--socket <path>`** — the daemon's Unix socket. Defaults to
  `$XDG_RUNTIME_DIR/softfig-keeperd.sock`.

Commands that read or write history auto-detect a running daemon and route
through it; see [Daemon routing](#daemon-routing) below.

## First run

| Command | Purpose |
|---|---|
| `softfig onboard [--garden-root P] [--state-root P] [--machine NAME] [--customize] [--yes]` | Scaffold a fresh garden from the embedded skeleton, init the Vault, and write a *born-in-FUSE* genesis commit. Prompts for a passphrase and prints a 12-word recovery phrase **once**. |

Onboard flags: `--garden-root` (default `~/soft-fig_garden`), `--state-root`
(default `$XDG_DATA_HOME/softfig/<garden-dir>/`), `--machine` (default: system
hostname), `--customize` (interactively pick which concept dirs to include),
`--yes` (accept the default layout, skip the dir prompts). The full walk-through
is the [first-garden tutorial](../../start/first-garden/).

## The Vault

Local key-lifecycle commands run in **direct mode** — no daemon needed. The Layer
B commands (`seal`/`unseal`/`list-sealed`) and `reveal` require the daemon.

| Command | Purpose |
|---|---|
| `softfig vault init [--garden P]` | Initialize a fresh vault under `<garden>/.softfig/vault/`. |
| `softfig vault status [--garden P]` | Print vault status — active key id, key generations on disk, identity fingerprint. |
| `softfig vault rotate-key [--garden P]` | Generate a new master-key generation and make it active. |
| `softfig vault recover [--garden P]` | Unlock with the recovery phrase and re-wrap the master key under a new passphrase. |
| `softfig vault seal <pattern> [--socket P]` | Append a glob to the sealed-paths list; the daemon commits the change and auto-encrypts every matching tracked file (Layer B). |
| `softfig vault unseal <pattern> [--socket P]` | Remove a glob from the sealed set. Does **not** bulk-decrypt blobs already sealed on disk. |
| `softfig vault list-sealed [--socket P]` | Print the active globs and the tracked files that currently match them. |
| `softfig reveal <path> [--id <region-id>]… [--socket P]` | Decrypt a sealed file's plaintext to a `0600` temp file under `$XDG_RUNTIME_DIR` and print only the **path** — never to stdout. `--id` reveals a single inline `<vault id="…">` region (repeat for several; one temp file per id). Records an audit commit. |

The day-to-day workflow for these is the [Secrets
guide](../../guides/secrets/). Note there is deliberately **no MCP verb** for any
vault operation — see [MCP Verbs](../mcp-verbs/).

## History

The VCS surface over the content-addressed ciphertext store.

| Command | Purpose |
|---|---|
| `softfig init [--garden P]` | Write a genesis commit over an existing vault (onboard does this for you). |
| `softfig commit --intent <name> [-m <msg>] [-f <path>]… [--kv k=v]… [--payload-json <json>] [--garden P]` | Snapshot the working tree as a new commit. `--intent` is a closed enum (`softfig commit --help` lists the values); `-f`/`--kv` attach related paths and free-form metadata. |
| `softfig log [--limit N] [--garden P]` | Print commit history from the tip. `--limit 0` (the default) means no limit. |
| `softfig show [<hex>] [--garden P]` | Show a single commit and its root-tree entries. Defaults to the tip. |
| `softfig fsck [--garden P]` | Verify object hashes, tree hashes, signatures, and reachability. |

## The daemon

The per-device daemon owns all writes, runs the filesystem watcher, and serves
the FUSE plaintext view.

| Command | Purpose |
|---|---|
| `softfig daemon start [--garden P] [--socket P]` | Run the daemon in the foreground until killed. Reads `<garden>/.softfig/keeper.toml`, and if a `state_root` is set, enters FUSE mode and mounts the decrypted garden. |
| `softfig daemon stop [--socket P]` | Send `shutdown` to a running daemon. |
| `softfig daemon status [--socket P]` | Query the daemon's current state (locked/unlocked, mount, etc.). |
| `softfig daemon unlock [--socket P]` | Prompt for the vault passphrase and forward it to the daemon — once per boot; mounts the FUSE view. |

In normal use the daemon runs as the `softfig-keeperd` systemd user unit rather
than `daemon start` in a terminal.

## Deploy

| Command | Purpose |
|---|---|
| `softfig deploy [--garden-root P] [--cache-root P] [--dry-run] [--force]` | Materialize the garden's `config/deploy.toml` source→target table onto the filesystem — the `bombadil link` replacement (M4a static spine). Requires the garden unlocked. |

`--dry-run` prints the plan and exits. `--force` backs a conflicting target up to
`<target>.softfig-bak` and overwrites, instead of refusing. See the
[Deploy Dotfiles guide](../../guides/deploy-dotfiles/) and
[config-files → `deploy.toml`](../config-files/#deploytoml).

## Migrate

| Command | Purpose |
|---|---|
| `softfig migrate [--garden P]` | With no subcommand, print the current migration phase — what `finalize` would do. |
| `softfig migrate prepare [--garden P] [--state-root P]` | Phase 1: copy `.softfig/` to the XDG state dir and write `keeper.toml`. No deletion; refuses if a daemon is reachable. |
| `softfig migrate finalize [--socket P]` | Phase 3: ask the running daemon to delete the orphan plaintext tree and legacy `.softfig/`, then remount FUSE. |

Two one-time migrations also live here: `migrate split` (rewrite legacy
`notes.md`/`troubleshooting.md` monoliths into numbered-note folders) and
`migrate config` (lift post-unlock policy into the in-garden `config/keeper.toml`).
Both are dry-run unless `--apply` is passed.

## Daemon routing

`commit`, `log`, `show`, and `fsck` **auto-detect** a running daemon and route
through the IPC socket — no per-command passphrase prompt. They fall back to
direct mode *only* when the socket is absent.

The split, precisely:

- **Direct mode, no daemon** — `vault init | status | rotate-key | recover`
  (local key operations).
- **Daemon if present, else direct** — `commit | log | show | fsck`.
- **Daemon required** (no direct fallback, because they mutate the mounted view
  or need the unlocked key) — `vault seal | unseal | list-sealed`, `reveal`,
  `deploy`, `migrate finalize | split | config`, and every command in [In
  development](#in-development).

Daemon-side errors (e.g. `vault_locked`) surface verbatim rather than falling
back.

## In development

These commands exist in the binary but back pillars that are **not yet stable**.
They are listed for completeness; treat them as early. See the
[roadmap](../../garden/vision-roadmap/) for status.

**Cross-device sync (M5, partial).** Device pairing and backup have landed;
union-mounted shared subtrees are unmerged/experimental.

| Command | Purpose |
|---|---|
| `softfig pair [<fingerprint>] [--endpoint H:P] [--yes] [--socket P]` | Pair with another device over the trust ring (Noise `XX` handshake + SAS confirmation). Omit the fingerprint to pick a discovered device by name. |
| `softfig peers [--socket P]` | List paired devices and any pending pairings. |
| `softfig unpair <fingerprint> [--socket P]` | Remove a device from the ring. |
| `softfig replica <grant\|revoke\|status> …` | Grant/revoke which paired hosts may back up this device's chain, and show backup health. |
| `softfig shared-subtree <add\|remove\|enable\|disable\|list> …` | *(experimental, unmerged)* Ring-shared subtrees with a per-device enable toggle. |

**Growlight.** The autonomous work-loop pillar adds `softfig growlight <init |
start | status | watch | stop | pause | resume | say | resources>` and the
relock-support daemon subcommands `daemon cycle | relock-arm | relock`. These are
documented in their own area — see [Growlight → Running](../../growlight/running/).

---

Related: [MCP Verbs](../mcp-verbs/) (the assistant-facing write surface),
[Config Files](../config-files/) (what `keeper.toml` / `deploy.toml` hold), and
[Install](../../start/install/) (building the binary).
