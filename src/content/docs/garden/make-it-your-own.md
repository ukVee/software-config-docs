---
title: Make It Your Own
description: Customizing and growing your garden beyond the scaffold.
---

The layout a fresh garden ships with is a **starting point, not a standard to
comply with.** `softfig onboard` gives you a coherent skeleton so you're not
staring at an empty directory; everything past that is yours to shape. This page
is about doing that deliberately — what to change, when, and what a handful of
tools quietly rely on staying put.

## Choose the shape at onboard time

Most of the top-level concept directories are empty stubs, there in case you
want them. If you already know some don't apply to a machine, prune them as you
scaffold:

```bash
softfig onboard --customize   # interactively pick which concept dirs to include
```

Without `--customize` you get the full default layout; with it you accept only
the folders you'll actually use. Either way the choice isn't permanent — adding
and removing directories later is ordinary garden work. See the
[install guide](../../start/install/) and
[grow your first garden](../../start/first-garden/) for the full first-run flow.

## Grow from real questions, not up-front taxonomy

The temptation with a fresh knowledge base is to design the perfect category
tree before writing anything. Resist it. The scaffolded folders are stubs for a
reason: a concept folder earns its detail the first time you have a real
question it should answer, or a real quirk worth recording.

When you hit "where does *this* go and there's no home for it," don't force it
into an ill-fitting folder — drop a placeholder in `inbox/` and triage later.
New structure should be a response to accumulated pressure, not a guess made in
advance.

:::tip[The worked example]
The garden soft-fig grew out of didn't start with a `shell/` directory or a
`code-reviews/` convention — both were added once real use made the gap obvious,
and each arrived with a decision note explaining why. It also split console
emulation and native PC gaming into sibling `emulation/` and `gaming/`
directories rather than one blurry `games/`. Your garden's shape should tell the
same kind of story about *your* machine.
:::

## Write your own conventions and decisions

The `meta/` directory is not read-only. When you settle a rule for how *your*
garden works — a naming choice, a new top-level directory, an exception to the
source-of-truth rule — write it down:

- Record the reasoning as a `journal/decisions/decision-<slug>.md`.
- If the decision changes a standing rule, update `meta/conventions.md` first,
  then propagate the change to the directories it affects.

This is the same discipline the [built-in conventions](../conventions/) follow.
A garden that records *why* it's shaped the way it is stays legible to the next
person to open it — including future you, and including Claude.

## Safe to reshape vs. what the tools assume

Almost everything about a garden's *shape* is yours to change. A few things the
tooling depends on are not.

**Reshape freely:**

- Add, rename, remove, split, or merge concept directories.
- Extend the boundary table in the root `CLAUDE.md` as you add domains.
- Add accretive folders (`notes/`, `troubleshooting/`, `backlog.md`) wherever a
  directory earns them.
- Rewrite the conventions to match how you actually work.

**Leave the meanings intact:**

- **Reserved filenames** carry a fixed meaning everywhere — `CLAUDE.md`,
  `notes/`, `troubleshooting/`, and the rest. You can add new directories that
  contain them, but don't repurpose the names for something else, or navigation
  (yours and Claude's) breaks. The full set is in the
  [garden schema reference](../../reference/garden-schema/).
- **`snapshots/` mirrors the concept tree** and is where mutating, script-refreshed
  state lives. Keep scripts and auto-generated data out of concept folders.
- **soft-fig owns history and mechanics.** There's no `.git` in a garden, and
  structural changes still go through the write path (the MCP verbs or the TUI),
  not raw `mv`/`sed` — the daemon is what stamps numbers, headers, and commits.
  See the [conventions](../conventions/#small-files-written-through-soft-fig).

## Do it with Claude

The natural way to reshape a garden is a conversation with Claude Code opened at
the garden root — "we've started gaming on this machine, add a `gaming/` folder
and route it in the boundary table" is a normal request, not a special one. The
[Working with Claude](../working-with-claude/) page covers the practice, and
[Starter Prompts](../starter-prompts/) collects prompts for exactly these
customizing and grooming tasks.
