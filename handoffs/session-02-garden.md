# Session 2 — the Garden core pages

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first — especially the grounding rules ("the garden is the
product", "encourage ownership", "commentary, not copies"). This session writes
the four core Garden pages as real content, replacing their stubs.

Sources: `~/soft-fig_garden/CLAUDE.md` (the map), `~/soft-fig_garden/meta/`
(`conventions.md`, `reserved-filenames.md`, `program-vision.md`), the code
repo's README (`~/projects/software-config_garden/README.md`) for the pillar
and status material, and `templates/default-garden/` in the code repo for what
`softfig onboard` actually scaffolds.

- `garden/today.md` — what a garden *is* (the set of files that describe a
  machine, layout-as-schema, commentary-not-copies, history-as-value,
  encrypted-at-rest) and an honest statement of where the project stands.
- `garden/conventions.md` — the built-in standards a fresh garden ships with:
  reserved filenames and their meanings, `Last reviewed:` headers, concept
  folders vs `snapshots/`, archive-don't-delete, the boundary rule (own each
  concept once), naming rules. Generalize — strip ukv-machine specifics; use
  his garden only as the worked example.
- `garden/make-it-your-own.md` — customizing: `onboard --customize`, growing
  concept dirs from real questions rather than up-front taxonomy, writing your
  own conventions and decision files, what's safe to reshape vs what the tools
  assume (reserved names).
- `garden/vision-roadmap.md` — the five pillars in brief, what's built vs
  planned (keep the built/planned split scrupulously honest), and where the
  design thinking lives (specs in the garden, decisions journal).

Deep-link to the code repo instead of pasting anything that will rot. When
done: `npm run build` green, update the PLAN.md ledger, commit on main.
