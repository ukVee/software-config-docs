---
title: Code Status
description: A dated snapshot of what is built, what is in development, and what is untouched.
---

soft-fig is a **single-author work in progress, not a released tool.** This page is a
point-in-time snapshot of where the code actually is — kept short and dated on purpose,
so it's cheap to refresh per release rather than left to rot. When it disagrees with
the [code repository](https://github.com/ukVee/software-config-garden), trust the repo.

**Last reviewed:** 2026-07-12 · fifteen-crate workspace · over 1,100 `#[test]`
functions across the crates.

## What's built

Shipped on the main line and self-hosting — this garden runs on it:

- **The engine.** The vault (Layer A whole-store encryption, Layer B whole-file and
  inline-region secrets, key rotation, BIP39 recovery), the content-addressed
  ciphertext store, the signed intent-classified VCS with `fsck`, and the FUSE
  plaintext mount — driven by the `softfig-keeperd` daemon. See
  [Architecture](../architecture/).
- **First-run.** `softfig onboard` scaffolds a fresh garden born-in-FUSE from an
  embedded skeleton; a three-phase `migrate` converts a legacy plaintext garden.
- **The Keeper surfaces.** The `softfig` CLI, the MCP bridge (the typed tool surface a
  Claude session uses), and the ratatui TUI (Browse / History / Actions / Vault / Peers)
  — all over the one daemon, all seeing daemon-side redaction of sealed content.
- **The deploy spine (M4a).** `softfig deploy` materializes `config/deploy.toml`
  source→target dotfiles as symlinks-to-cache or stamped copies. `$HOME` targets and
  regular files only, for now.
- **Cross-device foundation (M5a + M5b).** Two daemons discover each other (mDNS),
  pair with a Noise handshake confirmed by a six-digit SAS, and persist a signed trust
  ring; a chain owner can then push **zero-knowledge** ciphertext backups to authorized
  hosts that verify but cannot decrypt. See [The Vault → Device identity and trust](../vault/#device-identity-and-trust).
- **Growlight.** The autonomous work loop (curated-baton `/clear`-reseed) plus the
  multi-agent orchestrator fleet that drives it. See [Growlight](../../growlight/overview/).

## In development

Real code exists but it is not on the main line, or the milestone is only partly built:

- **M5c — multi-ref union-mount / shared subtrees.** Composing several chains (a device
  chain plus shared subtrees) into one garden namespace and routing writes to the owning
  chain. It lives on an unmerged branch and is **actively hardening** — a review turned
  up an overlay-absorption data-loss family that is being fixed slice by slice before it
  can merge.
- **M4b / M4c — templating and secret-resolving deploy.** MiniJinja template rendering,
  Vault secret resolution and post-hooks, and `/etc` targets. The deploy spine is built;
  these layers on top are not.

## Not started

Designed in the garden's specs, no code yet:

- **M5b-view** — reading a *peer's* documents (not just backing them up), via a
  chain-scoped read key rather than the master key.
- **M5d / M5e** — shared-subtree keying and write-turn sync between devices.
- **The GUI render binding.** The growlight fleet console exists as an Elm-style
  view-model; the `iced` window render is the deferred live-wiring step.
- **The trust matrix** — a peer-unlock ACL (`trust.toml`), panic counter, and TPM-backed
  self-unlock path, all distinct from the network ring.
- **AUR packaging** — the intended distribution channel.

## How this page stays honest

The two rules that keep it from drifting: describe the code as built (not as the specs
hope), and separate **shipped** from **in development** from **not started** rather than
blurring them into "coming soon." The counts above regenerate from the workspace
(`cargo test`, the crate list); the milestone status regenerates from the code repo's
own `## Status` section and its decision log. Refresh this page, and its date, whenever
a milestone lands.

---

Related: [Architecture](../architecture/) (the crates behind these milestones),
[The Vault](../vault/) (the cross-device trust model), and the
[roadmap](../../garden/vision-roadmap/) (the five-pillar vision these milestones climb
toward).
