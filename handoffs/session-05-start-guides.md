# Session 5 — Start Here + task guides

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first. This session writes the practical entry path: one
tutorial, one install page, three task guides. Diátaxis discipline matters
here: the tutorial guarantees a first win step-by-step; the guides assume a
competent user with a goal.

Sources: `~/projects/software-config_garden/README.md` (Manual installation +
CLI sections), `docs/onboard-laptop.md` (the deep runbook),
`scripts/onboard-device.sh`, and the deploy/vault/MCP crates for exact flags.

- `start/install.md` — build from source: prerequisites (Rust ≥ 1.85, fuse3,
  `~/.local/bin` on PATH), clone/build/test, `onboard-device.sh` or the manual
  install line. Note the planned `softfig-install` helper as future (rule 4).
- `start/first-garden.md` — tutorial: `softfig onboard` end to end — the
  passphrase and the write-it-down-once recovery phrase, the born-in-FUSE
  genesis commit, starting + unlocking the daemon, the `ls` smoke check, first
  look around the scaffolded tree, first Claude session from the garden root.
- `guides/secrets.md` — seal & reveal: whole-file seals, inline `<vault>`
  regions, `softfig reveal` (never to stdout), what the FUSE view shows.
- `guides/deploy-dotfiles.md` — `config/deploy.toml` source→target table,
  `softfig deploy --dry-run` / `--force`, symlink-to-cache vs stamped copy,
  current limits ($HOME file targets only; rendering is M4b, not built).
- `guides/claude-mcp.md` — register softfig-mcp with Claude Code (what
  `onboard-device.sh` offers, or by hand in `~/.claude.json`), verify the
  verbs appear, restart Claude Code after upgrading the MCP binary.

When done: `npm run build` green, update the PLAN.md ledger, commit on main.
