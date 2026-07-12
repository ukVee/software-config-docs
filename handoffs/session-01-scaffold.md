# Session 1 — scaffold the site

Paste into a fresh Claude Code session opened at `~/projects/softfig-docs`:

---

Read `PLAN.md` and `CLAUDE.md` in this repo first — they carry all context from
the planning session. This session scaffolds the Starlight site; no real
documentation writing yet.

1. Scaffold Astro Starlight (`npm create astro@latest -- --template starlight`).
   create-astro wants an empty directory, so scaffold into a temp dir and move
   the generated files into the repo root alongside `PLAN.md`/`handoffs/`.
   Node v26 is already installed.
2. Configure `astro.config.mjs`: title "soft-fig", sidebar groups exactly per
   PLAN.md's information architecture, and `site`/`base` set for GitHub Pages
   project hosting (`https://ukvee.github.io/softfig-docs`).
3. Create a stub for every page in the IA: frontmatter title + one-line
   description + a `<!-- TODO: written in session N -->` marker per the ledger.
   Delete the Starlight demo content.
4. Replace the splash page (`index.mdx`) with a minimal real landing: the
   one-paragraph pitch from the code repo's current README intro, the
   work-in-progress status warning, and a short "where to go" section.
5. Add `.github/workflows/deploy.yml` using `withastro/action`, trigger
   `workflow_dispatch` ONLY — the site must not auto-publish (see PLAN.md
   "Hosting"; the repo stays private until launch).
6. Rewrite this repo's `README.md` (if the scaffold created one, replace it):
   what this repo is, how to preview (`npm run dev`), pointer to PLAN.md.
7. Verify `npm run build` passes and `npm run dev` serves.
8. GitHub: `gh` is not installed here. Ask me to create the **private** repo
   `softfig-docs` on github.com, then wire it as `origin`. I do the pushes.
9. Update PLAN.md's session ledger and commit on main.
