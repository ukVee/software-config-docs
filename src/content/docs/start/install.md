---
title: Install
description: Build soft-fig from source and put softfig on your PATH.
---

There's no package yet, so soft-fig installs by building from source. It's a
plain Rust workspace: clone, build, drop the binaries on your `PATH`. This page
gets you to a working `softfig` command; the next one,
[Your first garden](../first-garden/), turns it into an actual garden.

:::note[What installing gives you — and what it doesn't]
Building from this repo installs the **program** — the schema, the daemon, the
CLI. It does **not** copy anyone else's garden *content*. Cloning to a new device
moves the tooling; each machine grows its own standalone garden that documents
*that* machine. (Cross-device sync is a later milestone; today a garden stands
alone.)
:::

## Prerequisites

- **A Rust toolchain**, ≥ 1.85 (the workspace is edition 2024). Install via
  [rustup](https://rustup.rs/) if you don't have it.
- **`fuse3`** — the daemon serves the decrypted garden through a FUSE mount, so
  this is not optional. On Arch: `sudo pacman -S fuse3`.
- **`~/.local/bin` on your `PATH`** — where the binaries land. Add it to your
  shell profile if it isn't already there.
- *(optional)* **`wl-clipboard`** — only for the TUI's "copy a reveal" key on
  Wayland; skip it if you won't use that.

## 1. Clone the repo

```bash
git clone https://github.com/ukVee/software-config-garden.git \
  ~/projects/software-config_garden
cd ~/projects/software-config_garden
```

The path is only a suggestion — the repo can live anywhere. It is the *program*
source, kept separate from the garden it will later scaffold.

## 2. (optional) Verify the build

Not required, but a fast way to confirm your toolchain is healthy before you
install:

```bash
cargo build  --workspace
cargo test   --workspace     # ~3s — the suite runs at minimum Argon2 cost
cargo clippy --workspace --all-targets -- -D warnings
```

## 3. Build and install the binaries

The repo ships a helper that does the mechanical parts:

```bash
./scripts/onboard-device.sh
```

It builds `--release` and installs the binaries to `~/.local/bin`
**automatically**, and checks that `fuse3` is present. Two steps it will only do
after **asking** — both reversible, both your call:

- enabling the `softfig-keeperd` systemd user unit, and
- registering `softfig-mcp` with Claude Code (writes `~/.claude.json`).

Say no to either and it prints the exact command to run later. The MCP step is
covered on its own in [Register softfig-mcp](../../guides/claude-mcp/).

Prefer to do it by hand? The whole of step 3 is just:

```bash
cargo build --release
install -m0755 \
  target/release/{softfig,softfig-keeperd,softfig-mcp,softfig-tui,softfig-growlightd} \
  ~/.local/bin/
```

That installs five binaries:

| Binary | What it is |
|---|---|
| `softfig` | the CLI — everything you drive by hand |
| `softfig-keeperd` | the per-device daemon: owns writes, runs the watcher, serves the FUSE mount |
| `softfig-mcp` | the MCP bridge that lets a Claude session propose garden writes |
| `softfig-tui` | a terminal UI over the daemon (Browse / History / Vault) |
| `softfig-growlightd` | the [Growlight](../../growlight/overview/) fleet daemon (only needed if you run the loop) |

:::note[The helper script does not scaffold the garden]
`onboard-device.sh` stops at "binaries installed." Creating the garden itself is
`softfig onboard`, which needs a passphrase at an interactive terminal — that's
[the next page](../first-garden/).
:::

## What's still manual

Packaging is a planned milestone, not a shipped one. A cross-distro
`softfig-install` helper and an AUR package are on the roadmap to retire this
build-from-source runbook — but they don't exist yet. Until they do, the steps
above are the supported path. Nothing here implies a one-command install that
isn't built.

Next: [Your first garden](../first-garden/) — scaffold, unlock, and look around.
