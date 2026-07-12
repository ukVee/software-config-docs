---
title: Conventions
description: The built-in standards a fresh garden ships with.
---

A fresh garden arrives with a small set of conventions already written into its
`meta/` directory. They are what keep the tree coherent as it grows — the reason
any folder is legible without a tour. This page describes the standards a
scaffold ships with and why each exists. For the exhaustive reserved-name table
and the directory layout, see the
[garden schema reference](../../reference/garden-schema/); to change or extend
any of this, see [Make It Your Own](../make-it-your-own/).

:::note
These are the garden's own conventions, kept in `meta/conventions.md` and
`meta/reserved-filenames.md` inside every garden. They are yours to edit — the
rule is to change the convention file first, then propagate. Nothing here is a
standard you must comply with; it's a starting point that already hangs
together.
:::

## Source of truth: commentary, not copies

When a real file outside the garden is the canonical thing — `/etc/…`, a systemd
unit, a dotfile manager's source — the garden does not duplicate it. It writes
the *commentary*: why a choice was made, what was tried, the gotchas, what to
look for when it breaks again.

Any file that references mutable external state opens with a review header so
staleness is visible:

```
> Last reviewed: 2026-07-12
> Source: /etc/pacman.conf
```

Reviewing means re-reading the source and confirming the commentary still
applies — not just bumping the date.

## Reserved filenames

Certain names recur across the garden with **the same meaning everywhere**.
Predictability beats expressiveness: you should always know where to look, and
so should Claude. Don't reuse these names for anything else.

| Name | What it holds |
|---|---|
| `CLAUDE.md` | The navigator for its directory: what the dir is, what each child is for, how to behave here, cross-refs to adjacent domains. Every meaningful directory has one. |
| `instructions.md` | How to *use* the thing this dir represents — commands, workflows, day-to-day verbs. |
| `notes/` | Device-specific observations, quirks, and gotchas — the stuff a reader of the upstream wiki wouldn't already know. |
| `troubleshooting/` | How things broke in this domain and what fixed them — "fixes I'll need again," distinct from the chronological `journal/incidents/`. |
| `refs.md` | External pointers: URLs, paths to source-of-truth files elsewhere on disk, vendor docs. |
| `last_updated.md` | A dir's staleness dashboard — pointers to sibling/snapshot files and when each was last reviewed. |
| `backlog.md` / `backlog-archive.md` | Forward-looking open work for a project, and a terse log of what's been closed. |

The full table, including reserved-but-not-yet-used names, lives in the
[garden schema reference](../../reference/garden-schema/).

### `CLAUDE.md` in every directory

Every meaningful directory carries a `CLAUDE.md` that (1) says what the directory
is, (2) maps each child, (3) states how to behave here, and (4) cross-references
the domains that touch this one. Only the root `CLAUDE.md` is auto-loaded when
Claude opens the garden; the per-directory files are read on demand, so each one
must explicitly tell Claude when to descend into a sub-`CLAUDE.md`.

## Concept folders vs. snapshots

Two kinds of directory, deliberately kept apart:

- A **concept folder** (`packages/pacman/`) holds *stable knowledge* — how to
  use a thing, what's quirky about it here, links to canonical sources. No
  scripts, no auto-refreshed data.
- A **snapshot folder** (`snapshots/packages/pacman/`) holds *mutating state*
  plus the script that refreshes it. `snapshots/` mirrors the concept tree.

Refresh scripts produce formatted markdown — a header with timestamp and source
command, grouped sections — not raw command dumps.

## Naming

- Lowercase, ASCII, no spaces; `-` between words (`pacman-packages.md`).
- Reserved names recur with a fixed meaning; freeform-semantic names when a
  folder holds many like-kind items (one file per package, per service, per
  ssid).
- Time-prefix the time-sensitive: `incident-YYYYMMDD-<slug>.md`. Decisions are
  referenced by name, so their date lives in the file, not the filename.

## The boundary rule

**Own each concept once; cross-reference from any other domain that touches it.**
If two directories could plausibly own the same thing, the root `CLAUDE.md`
decides, and the loser points to the winner. This is what stops the same fact
from being written — and going stale — in three places.

## Don't delete, archive

Things that are no longer current go to `journal/archive/<slug>/`, not the
trash. Abandoned projects, obsolete decisions, retired hardware notes — all
kept. The garden's history is part of its value.

## Small files, written through soft-fig

The two **accretive** reserved names are folders, not monolithic files: `notes/`
and `troubleshooting/` hold single-fact docs named `NNN-slug.md`. Each folder
owns an independent, never-reused numbering sequence; a note's number, slug, and
title are fixed for life, which is what keeps `[[NNN-slug]]` cross-references
stable. To "rename," you archive the note and add a new one.

Because of that machinery, **garden mutations go through soft-fig's write verbs**
(via the MCP server or the TUI), never raw `mv`/`sed`/editor writes. The daemon
owns every mechanical field — dates, numbers, headers, filenames, index tables,
backlinks, and the commit — so a write costs only the irreducible new content.
The north-star rule: *the unit of change equals the unit of output.* The verbs
themselves are catalogued in the [MCP verb reference](../../reference/mcp-verbs/).

:::tip[Headings are addresses, not content]
The section verbs address a section by its heading text and keep that line
verbatim — there is no "rename heading." So never bake a mutable value
(a percentage, version, date, count, path) into a heading; it would go stale the
moment it changed and could only be fixed with a break-glass whole-file rewrite.
Write headings as stable topics and keep the value in the first body line.
:::

## Version history without git

A garden's history, encryption-at-rest, and secret-sealing are all handled by
soft-fig — there is no `.git` inside a garden. The `.softfig/` store is the
canonical history, and every write auto-commits. Don't add a parallel
`git init`. How it works is covered in [The Codebase → VCS](../../internals/vcs/).

## No secrets in plaintext

A file that would need a real secret gets a pointer ("the API key lives in an
encrypted source") or the secret is sealed with the Vault's Layer B — a
whole-file seal (`softfig vault seal '<glob>'`) or an inline
`<vault id="…">…</vault>` region. Reveals are user-initiated
(`softfig reveal`) and never expose plaintext to Claude. See
[Guides → Secrets](../../guides/secrets/).
