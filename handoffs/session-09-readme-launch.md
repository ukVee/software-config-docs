# Session 9 — splash polish, code-repo README rewrite, launch checklist

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` first. This is the closing session; it assumes sessions 1–8 are
done (check the ledger — if not, stop and tell me what's missing).

1. **Polish the splash page** (`index.mdx`): hero pitch, the garden-first
   framing, cards into the main areas, honest status line.
2. **Full-site pass**: every sidebar link resolves, no leftover TODO stubs, no
   Starlight demo remnants, consistent heading style, `npm run build` clean.
3. **Rewrite the code repo's README** (`~/projects/software-config_garden/`,
   normal git, commit on main, I push): shrink the 331-line README to a short
   landing page — pitch paragraph, status banner, 5-minute quickstart
   (install + onboard, condensed), a prominent link to the docs site, license.
   Everything else now lives in the docs; delete it from the README rather
   than duplicating. Keep the PLAN.md "content donor" table in mind — verify
   each dropped section actually exists in the docs before dropping it.
4. **Launch checklist** (write it as `LAUNCH.md`, don't execute it): flip
   `softfig-docs` public → run the gated Pages workflow
   (`workflow_dispatch`) → enable Pages in repo settings → verify
   `https://ukvee.github.io/softfig-docs` → merge the README rewrite → then,
   optionally, custom domain.

When done: update the PLAN.md ledger (all nine rows), commit on main in both
repos; I do the pushes and the actual launch steps.
