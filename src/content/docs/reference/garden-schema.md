---
title: Garden Schema
description: Reserved filenames, the directory kinds, and the naming rules a garden follows.
---

The lookup tables for a garden's structure: the reserved filenames and what each
means, the directory kinds, and the naming rules. This is the *what*; the
narrative *why* lives in [Conventions](../../garden/conventions/), and the verbs
that stamp all of this server-side are in the
[MCP verb reference](../mcp-verbs/).

:::note[This is the scaffold, not a mandate]
Every garden ships these conventions in its own `meta/conventions.md` and
`meta/reserved-filenames.md`. They are what a fresh `softfig onboard` writes
out — yours to edit. The rule is to change the convention file first, then
propagate. See [Make It Your Own](../../garden/make-it-your-own/).
:::

## Reserved filenames

These names recur across the garden with **the same meaning everywhere** — so you
(and Claude) always know where to look. Don't reuse them for anything else.

| Name | Purpose | Required where |
|---|---|---|
| `CLAUDE.md` | Navigator for its directory: what the dir is, what each child is for, how to behave here, cross-refs to adjacent domains. | Every meaningful directory. |
| `instructions.md` | How to *use* the thing the dir represents — commands, workflows, day-to-day verbs. | When there's a "how do I do X" for the domain. |
| `notes/` | Device-specific observations, quirks, gotchas — the stuff an upstream wiki wouldn't tell you. A **folder** of `NNN-slug.md` docs (see below). | When there's a "watch out for X" worth recording. |
| `troubleshooting/` | How things broke here and what fixed them — "fixes I'll need again," distinct from the chronological garden-wide `journal/incidents/`. A **folder** of `NNN-slug.md` docs. | Optional. |
| `code-reviews/` | Durable code-review records for a project — scope, verdict, gaps, deferred checks. Primary home `projects/<project>/code-reviews/`; name reserved garden-wide. A **folder** of `NNN-slug.md` records. | Optional. |
| `refs.md` | External pointers: URLs, paths to source-of-truth files elsewhere on disk (`/etc/…`), vendor docs. | When the dir cites many external sources. |
| `last_updated.md` | The dir's staleness dashboard — pointers to sibling/snapshot files and when each was last reviewed. | Required for concept dirs whose snapshots auto-refresh; optional otherwise. |
| `backlog.md` / `backlog-archive.md` | Forward-looking open work for a project, and a terse log of what's been closed. | Optional, paired. |

### Reserved but not yet in use

Held for future meaning — don't repurpose them: `history.md` (per-folder change
log), `glossary.md` (domain term definitions), `index.md` (an explicit child
outline when a `CLAUDE.md` is too dense to also be the navigator).

## Accretive folders: `NNN-slug.md`

The three **accretive** reserved names are folders of numbered single-fact docs,
not monolithic files: `notes/`, `troubleshooting/`, and `code-reviews/`. Each
file is one fact, named `NNN-slug.md` (e.g. `services/waydroid/notes/001-container-networking.md`).

- **Per-folder numbering.** Monotonic `+1`, 3-digit zero-padded, never reused.
  The number is a creation-order stamp — highest present is newest. Each folder is
  an independent sequence backed by a daemon-owned `.seq` high-water counter
  (never hand-edited); `notes/`, `troubleshooting/`, and `code-reviews/` in the
  same directory count separately, each from `001`.
- **Immutable address.** A doc's number, slug, and title are fixed for life. To
  "rename," you archive the doc and add a new one — which is what keeps
  `[[NNN-slug]]` cross-references stable. Archiving leaves a gap; numbers are
  never recycled.
- **Written through verbs only.** Add entries with `add_note` /
  `add_code_review`, never by hand — the daemon owns the number, header,
  filename, and commit.

The monolithic reserved files — `CLAUDE.md`, `instructions.md`, `refs.md` — are
unchanged; they're read whole, so they stay whole.

## Cross-references and managed regions

Links between docs use `[[NNN-slug]]` or `[[path]]`. The daemon maintains
backlink sections and per-folder index tables inside **managed regions** —
fenced, daemon-owned spans you never hand-edit. Headings are treated as immutable
addresses (the section verbs keep the heading line verbatim), so a mutable value
never belongs in a heading — it goes in the first body line. The reasoning is in
[Conventions](../../garden/conventions/).

## Directory kinds

A garden is a tree of small, semantically-named directories. Two kinds are kept
deliberately apart:

- **Concept folder** (`packages/pacman/`, `services/network/`) — *stable
  knowledge*: how to use a thing, what's quirky about it here, links to canonical
  sources. No scripts, no auto-refreshed data.
- **Snapshot folder** (`snapshots/packages/pacman/`) — *mutating state* plus the
  script that refreshes it. `snapshots/` mirrors the concept tree; a refresh
  script emits formatted markdown (timestamped header, grouped sections), not raw
  command output.

Which concept dirs exist is your choice — `softfig onboard --customize` picks the
starting set, and the tree grows from real questions.

### The standing spine

Beyond the concept dirs, a scaffolded garden carries a fixed spine:

| Directory | Holds |
|---|---|
| `meta/` | Docs about the garden itself — `conventions.md`, `reserved-filenames.md`, and the design specs. |
| `journal/` | Dated history: `decisions/`, `incidents/`, and `archive/` (nothing is deleted). |
| `inbox/` | The triage drawer — unfiled notes, sorted later. |
| `snapshots/` | The mutating-state mirror of the concept tree. |
| `growlight/` | The autonomous work-loop pillar (see [Growlight reserved names](#growlight-reserved-names)). Present once `softfig growlight init` runs. |
| `.softfig/` | The VCS + vault store (ciphertext objects, SQLite index). Not content — the engine. See [Internals → VCS](../../internals/vcs/). |

## Naming rules

- **Lowercase, ASCII, no spaces**; `-` between words (`pacman-packages.md`, not
  `Pacman_Packages.md`).
- Reserved names recur with a fixed meaning. Use **freeform-semantic** names when
  a folder holds many like-kind items — one file per package, per service, per
  SSID.
- **Time-prefix** the time-sensitive:

| Pattern | Used for |
|---|---|
| `incident-YYYYMMDD-<slug>.md` | Journal incidents. |
| `decision-<slug>.md` | Decisions — referenced by name, so the date lives in the file, not the filename. |
| `journal/<bucket>/YYYY-MM-DD-<slug>.md` | Dated journal entries. |

## Growlight reserved names

The growlight pillar reserves four more names *within `growlight/`*:

| Name | Purpose |
|---|---|
| `backlog/` | The work queue — milestones + tasks; status and order live in a managed queue table. |
| `baton-log/` | Append-only numbered iteration entries (audit trail; never re-injected into a session). |
| `protocol.md` | The fixed loop operating contract, injected each session. |
| `session-policy.md` | The editable two-budget (context + session) policy. |

## Excluding paths: `.softfigignore`

An optional file at the **garden root** lists extra top-level names to exclude
from the VCS, on top of the built-in `.softfig` and `.claude` (which can't be
un-ignored). One name per line; `#` comments and blank lines ignored; a single
trailing `/` tolerated. v1 matches **top-level names only**. The file is itself
tracked, so the ignore set versions and replicates with the garden, and it's read
fresh on each commit — no daemon restart needed.

---

Related: [Conventions](../../garden/conventions/) (the why behind every rule
here), [MCP Verbs](../mcp-verbs/) (the write surface that stamps these
conventions), and [Internals → VCS](../../internals/vcs/) (the `.softfig` store).
