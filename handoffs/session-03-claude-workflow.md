# Session 3 — working with Claude + starter prompts

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first (grounding rule 3: the Claude-native practice is
first-class documentation). This session writes two pages.

Sources: `~/soft-fig_garden/CLAUDE.md` (the "How to behave when working in the
garden" section), the MCP verb surface in
`~/projects/software-config_garden/crates/softfig-mcp/` and the code-repo
README's Keeper section, and the garden's real `journal/` for example shapes.

- `garden/working-with-claude.md` — the practice: **always open Claude from the
  garden root** (its CLAUDE.md is the always-loaded map; sub-CLAUDE.md files
  are read on demand via the routing table), set up a shell alias (e.g.
  `alias garden='cd ~/soft-fig_garden && claude'`), how reads stay native
  filesystem ops while writes go through the typed MCP verbs that stamp
  conventions server-side, and the hard boundary: vault reveals and key
  operations are never exposed to the model.
- `garden/starter-prompts.md` — a copy-paste prompt cookbook. For each entry:
  the prompt, what it causes (which MCP verb fires, what convention gets
  stamped), and when to use it. Cover at least: log an incident, record a
  decision, file a loose note in the right place, triage the inbox, refresh a
  snapshot, check something for staleness, start a new concept dir, review
  where a question should be routed. Invite readers to grow their own cookbook
  (grounding rule 2).

When done: `npm run build` green, update the PLAN.md ledger, commit on main.
