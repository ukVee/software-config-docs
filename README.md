# software-config-docs

The documentation site for [soft-fig](https://github.com/ukVee/software-config-garden),
built with [Astro Starlight](https://starlight.astro.build/). Kept as a separate
**private** repo so drafts stay unpublished until launch; the code repo stays
docs-free apart from its landing-page README.

## Working on the docs

**Read [`PLAN.md`](PLAN.md) first** — it holds the locked decisions, the
information architecture, the voice/grounding rules, and the session ledger.
Work proceeds session by session; the paste-able prompts live in
[`handoffs/`](handoffs/).

## Preview locally

```sh
npm install
npm run dev       # serves at http://localhost:4321/software-config-docs/
```

`npm run build` writes the production site to `dist/`;
`npm run preview` serves that build.

## Deploying

`.github/workflows/deploy.yml` publishes to GitHub Pages via `withastro/action`,
but only on a manual `workflow_dispatch` — the site must not auto-publish
before launch (see PLAN.md "Hosting"). On the GitHub Free plan, Pages cannot
publish from a private repo at all: going live means flipping the repo public,
then running the workflow.
