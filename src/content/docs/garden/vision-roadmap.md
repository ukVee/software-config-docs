---
title: Vision & Roadmap
description: The five pillars, what is built and what is planned, and where the design lives.
---

The garden is the product. soft-fig exists to make that one object — the files
that describe a machine — memorable, deployable, versioned, and safe. It does
that through **five pillars** that share one config and one CLI, so you adopt the
tool once instead of stitching four together. This page is the map of that
ambition and an honest ledger of how much of it is real today.

## The five pillars

| Pillar | What it does | Instead of |
|---|---|---|
| **Machine memory** | The `CLAUDE.md` + concept-folder + snapshots schema as a first-class abstraction. This is the garden you live in. | ad-hoc notes and wikis |
| **Templating + theming** | Render source files into deployable configs with profile-scoped variables; secrets resolved at render time. | the [toml-bombadil](https://github.com/oknozor/toml-bombadil) render side |
| **Symlink deployment** | A declarative source→target table that materializes a system from its sources. | `bombadil link`, GNU Stow |
| **Integrated VCS** | Linear, signed, intent-classified history over content-addressed ciphertext blobs and a queryable index. | git, for this use case |
| **Vault** | Encryption at rest, key management, secrets, and a trust system that lets devices unlock each other. | LUKS + GPG + `pass`, partially |

Machine memory is the pillar you spend your time in; the other four are what let
the garden also deploy your dotfiles, keep its own history, and stay encrypted —
without a second tool. The [Keeper](#the-keeper) is the client that ties them
together. The [source repository](https://github.com/ukVee/software-config-garden#the-five-pillars)
carries the canonical table.

### The Keeper

The **Keeper** is the user-facing client over the pillars: a per-device daemon
that owns all writes and serves the FUSE mount, an **MCP server** so any local
Claude session can propose garden writes through typed, convention-stamping
verbs (reads stay native filesystem ops; Vault operations are deliberately never
exposed to the model), a shipped **TUI** for headless boxes, and a planned GUI.
Cross-device sync — one garden per device, daemons mirroring peer gardens
read-only — is a Keeper responsibility that is designed but not yet built.

## Built vs. planned

soft-fig is a single-author work in progress. The split below is kept
scrupulously honest; when in doubt, [The Codebase → Status](../../internals/status/)
and the repository's [Status](https://github.com/ukVee/software-config-garden#status)
and [Roadmap](https://github.com/ukVee/software-config-garden#roadmap) sections
are the source of truth.

### Built and self-hosting

- **Vault** — Layer A whole-garden encryption at rest, and Layer B selective
  secrets (whole-file seals and inline `<vault>` regions), with a user-initiated
  reveal flow.
- **VCS** — a content-addressed ciphertext store with signed, intent-classified
  commits and a queryable metadata index.
- **The daemon, the FUSE plaintext view, and the watcher** — the engine that
  serves the garden and records every change.
- **`softfig onboard`** — the first-run wizard that scaffolds a fresh garden and
  writes a born-in-FUSE genesis commit, so no plaintext ever touches the garden
  root.
- **The Keeper's write surface** — the MCP verbs that stamp conventions
  server-side, and **`softfig-tui`**, a ratatui frontend over the daemon.
- **Static deploy spine (M4a)** — the first slice of the templating/symlink
  pillar: a declarative `deploy.toml` source→target table materialized onto the
  filesystem, dry-run and conflict-safe. See
  [Guides → Deploy dotfiles](../../guides/deploy-dotfiles/).
- **Growlight** — the autonomous work-loop the garden ships. Significant, but
  supporting cast; it has [its own section](../../growlight/overview/).

### Designed, not yet started

- **M4b / M4c — template rendering.** MiniJinja rendering with profile-scoped
  variables, then render-time Vault secrets and posthooks — the rest of the
  bombadil replacement.
- **M5 — cross-device sync.** Device pairing, the trust matrix, peer-assisted
  unlock, and read-only peer mirroring over a WireGuard LAN. Single owner per
  garden; no multi-master merging.
- **M7 — packaging + post-install automation.** A real package (AUR first, with
  `.deb`/`.rpm`/Homebrew as equivalents) to retire the manual onboarding
  runbook.
- **GUI.** A desktop frontend (tentatively Iced) with parity to the shipped TUI.

Smaller deferred follow-ons — inline-region reveals inside the TUI, TPM-backed
unlock, replica-only mode — are tracked in the roadmap.

## Where the design thinking lives

soft-fig's *implementation* is the [code repository](https://github.com/ukVee/software-config-garden).
Its *design* — the per-pillar spec playgrounds and the dated decision log — lives
in the garden the program is a prototype for, alongside the conventions that
shaped the schema. Each milestone has a `decision-softfig-*.md` recording the
locked picks and the as-built deltas.

That's deliberate: the specs are thinking surfaces, allowed to be incomplete and
to contradict each other, not contracts. It also means they live inside a private
garden rather than on the public web — the repository's
[Design](https://github.com/ukVee/software-config-garden#design-where-the-thinking-lives)
section explains the arrangement, and these docs surface the parts of it that are
settled.
