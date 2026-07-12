# Session 7 — the Codebase (internals)

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first. This session writes the Codebase area: how the
implementation actually works, for readers who want to understand or
contribute — explanation pages, written from the code.

Sources: `~/projects/software-config_garden/` — `CLAUDE.md` (architecture
notes), `crates/*` (eleven crates), `Cargo.toml`, plus the garden's
`meta/spec-*.md` files where the design intent adds context (link to the
"specs live in the garden" idea rather than copying spec text).

- `internals/architecture.md` — the workspace map: each crate's job, how data
  flows (watcher → daemon → store; CLI/TUI/MCP → IPC → daemon), where the
  boundaries are and why (frontend-neutral cores, daemon owns all writes).
- `internals/daemon-and-fuse.md` — softfig-keeperd: the watcher pipeline and
  intent classifier, the FUSE plaintext view (born-in-FUSE, why plaintext
  never lands on disk), lock/unlock lifecycle, IPC surface.
- `internals/vcs.md` — content-addressed ciphertext blobs, trees, signed
  commits, intent classification, the SQLite index, fsck; what "replacing git
  for this use case" means concretely.
- `internals/vault.md` — Layer A vs Layer B with their distinct threat models,
  key hierarchy and derivation, convergent encryption trade-off, recovery,
  device identity + the trust direction for sync.
- `internals/status.md` — where the code is today: shipped milestones, test
  count, known-unbuilt list. Keep it regenerable — date it (`Last reviewed:`)
  and keep it short enough to refresh per release.

When done: `npm run build` green, update the PLAN.md ledger, commit on main.
