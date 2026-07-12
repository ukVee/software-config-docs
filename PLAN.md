# soft-fig docs — master plan

> Drives the multi-session build of the soft-fig documentation site. **Every work
> session starts by reading this file.** Update the session ledger at the bottom
> before committing.

Last updated: 2026-07-12 (session 1)

## What this repo is

The documentation site for **soft-fig**, kept separate from the code repo
([ukVee/software-config-garden](https://github.com/ukVee/software-config-garden),
which is public) so drafts stay private until launch. This repo becomes
`ukVee/softfig-docs` (private) on GitHub.

Note for Claude sessions: this directory has its own Claude memory, separate from
the garden's. The handoff prompts in `handoffs/` exist precisely to carry context
across sessions — trust them and this file over assumptions.

## Locked decisions

- **Content architecture: Diátaxis, applied within areas.** Top-level sections by
  subject (Garden / Growlight / Codebase / …), with each page typed as tutorial,
  how-to, reference, or explanation per [diataxis.fr](https://diataxis.fr/).
- **Tool: Astro Starlight** (product-grade polish, official GitHub Pages action).
  Chosen over mdBook (plainer) and Material for MkDocs (maintenance mode since
  Nov 2025; successor Zensical too young). The Node toolchain lives in this repo,
  never in the Rust workspace.
- **Hosting: GitHub Pages, gated.** `withastro/action` workflow triggered by
  `workflow_dispatch` ONLY — no auto-publish. On the GitHub Free plan, Pages
  cannot publish from a private repo at all; going live = flip the repo public,
  then run the workflow. Until then, preview with `npm run dev`.
- **The code repo's README shrinks last.** The current 331-line README is the
  content donor for many pages; it gets rewritten into a short landing page
  (pitch, status, quickstart, link here, license) in the final session.

## Grounding — voice and framing rules

1. **The garden is the product.** soft-fig the program exists to serve the
   garden. **Growlight is a tool the garden ships** — significant, but
   supporting cast. Never present them as co-equal halves.
2. **Encourage ownership.** The docs should push readers to customize the garden
   and make it their own. The scaffolded skeleton is a starting point, not a
   standard to comply with.
3. **Teach the Claude-native practice.** Always open Claude from the garden root
   (its CLAUDE.md is the always-loaded map; sub-CLAUDE.md files load on demand).
   Recommend a shell alias (e.g. `alias garden='cd ~/soft-fig_garden && claude'`).
   Starter prompts are first-class documentation.
4. **Current state vs vision, clearly separated.** Never imply unbuilt things
   work. Keep the honesty of the current code-repo README ("single-author work
   in progress, not a released tool").
5. **The story pages are ukv's own voice.** Claude helps outline and edit; it
   does not ghost-write them.
6. **Commentary, not copies — in docs too.** Describe and deep-link to the code
   repo rather than pasting file contents that will rot. The docs describe the
   *product* garden (what `softfig onboard` scaffolds); ukv's personal garden is
   the worked example, not the spec.

## Information architecture

Sidebar groups → pages. Type tags: [tut] tutorial, [how] how-to, [ref] reference,
[exp] explanation. "S#" = the session that writes it.

```
Start Here
  index.mdx                      splash: pitch, status, where to go      S1 stub, S9 final
  start/install.md               build-from-source install         [how] S5
  start/first-garden.md          onboard a first garden, end to end [tut] S5

The Story                        (ukv's voice)
  story/why.md                   the reasoning for the project     [exp] S8
  story/evolution.md             how the idea grew                 [exp] S8

The Garden                       (the product)
  garden/today.md                what a garden is + where it stands [exp] S2
  garden/conventions.md          built-in standards & conventions   [ref] S2
  garden/working-with-claude.md  the Claude practice + alias        [how] S3
  garden/starter-prompts.md      prompt cookbook for garden tasks   [how] S3
  garden/make-it-your-own.md     customizing & growing your garden  [how] S2
  garden/vision-roadmap.md       five pillars, built vs planned     [exp] S2

Growlight                        (a tool the garden ships)
  growlight/overview.md          the autonomous work loop           [exp] S4
  growlight/running.md           init/start, the fleet daemon       [how] S4
  growlight/customizing.md       make the loop your own             [how] S4

Guides
  guides/secrets.md              seal & reveal (Layer B vault)      [how] S5
  guides/deploy-dotfiles.md      deploy.toml + softfig deploy       [how] S5
  guides/claude-mcp.md           register softfig-mcp with Claude   [how] S5

Reference
  reference/cli.md               the softfig CLI                    [ref] S6
  reference/mcp-verbs.md         the MCP verb surface               [ref] S6
  reference/garden-schema.md     reserved filenames + layout        [ref] S6
  reference/config-files.md      keeper.toml, deploy.toml, peers…   [ref] S6
  reference/crypto.md            primitives table, two layers       [ref] S6

The Codebase
  internals/architecture.md      workspace, crates, data flow       [exp] S7
  internals/daemon-and-fuse.md   keeperd, watcher, plaintext view   [exp] S7
  internals/vcs.md               ciphertext store, signed commits   [exp] S7
  internals/vault.md             Layer A/B, keys, trust             [exp] S7
  internals/status.md            where the code is today            [ref] S7
```

Overlap rule: `reference/crypto.md` holds the facts (primitive tables, key
derivation chart); `internals/vault.md` explains how and why it works. Same
split between `reference/garden-schema.md` and `garden/conventions.md`.

## Where the current README's content lands

| README section (code repo) | Destination page |
|---|---|
| The idea | story/why.md (raw material) + garden/today.md |
| The five pillars / Keeper | garden/vision-roadmap.md |
| Status + Roadmap | garden/vision-roadmap.md + internals/status.md |
| How the encryption works | reference/crypto.md + internals/vault.md |
| Repository layout | internals/architecture.md |
| Manual installation | start/install.md + start/first-garden.md |
| CLI surface | reference/cli.md |
| Design: where the thinking lives | garden/vision-roadmap.md + story/evolution.md |

## Sources of truth

- **The garden** `~/soft-fig_garden/` — root `CLAUDE.md` (the map),
  `meta/conventions.md`, `meta/reserved-filenames.md`, `meta/program-vision.md`,
  `meta/spec-*.md`, `journal/decisions/`, `growlight/`.
  Reads are plain filesystem ops; docs work should never need garden *writes*
  (those go through softfig-mcp from a garden session).
- **The code repo** `~/projects/software-config_garden/` — `README.md` (content
  donor), `CLAUDE.md` (architecture), `docs/onboard-laptop.md` (install runbook),
  `crates/` (the truth for CLI/MCP surfaces).

## Session ledger

Update status + date + one-line result as sessions complete.

| # | Handoff | Scope | Status |
|---|---|---|---|
| 1 | handoffs/session-01-scaffold.md | Starlight scaffold, sidebar, stubs, gated deploy | done 2026-07-12 — scaffold moved to repo root, sidebar per IA, 26 stubs + splash, dispatch-only deploy.yml, build+dev verified |
| 2 | handoffs/session-02-garden.md | Garden core pages (today, conventions, ownership, roadmap) | pending |
| 3 | handoffs/session-03-claude-workflow.md | Working with Claude + starter prompts | pending |
| 4 | handoffs/session-04-growlight.md | Growlight area | pending |
| 5 | handoffs/session-05-start-guides.md | Install, first-garden tutorial, task guides | pending |
| 6 | handoffs/session-06-reference.md | CLI, MCP verbs, schema, config, crypto | pending |
| 7 | handoffs/session-07-internals.md | Codebase architecture + subsystem pages | pending |
| 8 | handoffs/session-08-story.md | Why + evolution (ukv writes, Claude edits) | pending |
| 9 | handoffs/session-09-readme-launch.md | Splash polish, code-repo README rewrite, launch checklist | pending |
