# Session 6 — Reference

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first. This session writes the Reference area: facts, tables,
lookup material — no narrative, no persuasion (Diátaxis reference discipline).
Accuracy beats completeness: derive surfaces from the code, not from memory.

Sources — the code is the truth: `~/projects/software-config_garden/crates/`
(`softfig-cli` for the CLI, `softfig-mcp` for verbs, `softfig-vault` for
crypto choices), the repo `CLAUDE.md`, and
`~/soft-fig_garden/meta/reserved-filenames.md` for the schema.

- `reference/cli.md` — every `softfig` subcommand with flags, grouped as in
  the current README's CLI surface block; note daemon auto-detect routing.
- `reference/mcp-verbs.md` — the full verb surface: name, purpose, what
  convention it stamps, read vs write, what is deliberately absent (vault
  operations).
- `reference/garden-schema.md` — reserved filenames and their meanings, the
  concept-dir / snapshots mirror, naming rules, time-prefixed file patterns.
- `reference/config-files.md` — `keeper.toml`, `deploy.toml`, `peers.toml`:
  location, purpose, key fields (mark unbuilt/planned fields as such).
- `reference/crypto.md` — the primitives table (AEAD, BLAKE3, Argon2id, HKDF,
  Ed25519, BIP39, JCS), the two-layer model summarized as facts, convergent
  encryption note. The *why* lives in `internals/vault.md` — link, don't repeat.

When done: `npm run build` green, update the PLAN.md ledger, commit on main.
