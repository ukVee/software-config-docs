# Session 4 — Growlight

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first — grounding rule 1 is the key framing: **growlight is a
tool the garden ships, not a co-equal product**. The garden stays the hero;
growlight is what makes it grow while you're away.

Sources: `~/soft-fig_garden/growlight/` (protocol, backlog, baton log),
`~/soft-fig_garden/meta/spec-growlight.md` and
`meta/spec-growlight-orchestrator.md`, and the growlightd crate in
`~/projects/software-config_garden/`.

- `growlight/overview.md` — what it is: the autonomous work loop over a
  backlog of milestones/tasks, the append-only baton log that hands context
  between sessions, budgets, and why a knowledge garden benefits from one.
- `growlight/running.md` — `softfig growlight init` / `start`, the growlightd
  fleet daemon (single-agent = a fleet of one), what the human owes the loop
  (reviewing the baton, answering owed-human items, keeping the backlog real).
- `growlight/customizing.md` — shaping the backlog to your garden, adjusting
  the protocol, budgets and pacing, and making the loop your own (grounding
  rule 2).

Honesty check (grounding rule 4): the fleet runs live on ukv's machine, but
this is pre-release software — say so.

When done: `npm run build` green, update the PLAN.md ledger, commit on main.
