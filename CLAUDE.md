# softfig-docs

The documentation site for soft-fig (Astro Starlight → GitHub Pages), kept as a
separate **private** repo so drafts stay unpublished until launch. The code repo
([ukVee/software-config-garden](https://github.com/ukVee/software-config-garden))
is public and stays docs-free apart from its landing-page README.

- **Read `PLAN.md` before doing anything** — locked decisions, information
  architecture, voice/grounding rules, and the session ledger live there.
- Work proceeds session-by-session; the paste-able prompts live in `handoffs/`.
- Sources of truth are the code repo (`~/projects/software-config_garden`) and
  the live garden (`~/soft-fig_garden`). Commentary and links, never copies.
- This directory's Claude memory is separate from the garden's — PLAN.md and
  the handoffs are the context carriers between sessions.
- Normal git repo: commit on main after each completed chunk; the user pushes.
- Do NOT enable auto-deploy: the Pages workflow stays `workflow_dispatch`-only
  until launch (see PLAN.md "Hosting").
