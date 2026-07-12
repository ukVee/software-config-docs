---
title: The Garden Today
description: What a garden is, and an honest account of where soft-fig stands.
---

A **garden** is the set of files that describe one machine — how it's
configured, what's installed, why each choice was made, what broke and how it
got fixed. Most people scatter that across dotfile repos, wiki pages, shell
history, and memory. soft-fig treats it as one first-class object with a shape
a person or an LLM can navigate without being told.

This page is about the idea and its current reality. For the rules a garden
follows, see [Conventions](../conventions/); for the bigger picture, see the
[Vision & Roadmap](../vision-roadmap/).

## One machine, described in place

A garden documents the device it lives on, and only that device. It is a tree
of small, semantically-named directories — `packages/pacman/`,
`services/network/`, `hardware/` — each holding a `CLAUDE.md` that says what the
directory is and a handful of reserved-name files that mean the same thing in
every folder.

You get one garden per machine. Cloning the program to a new device moves the
*schema* — the empty concept folders and the conventions — never another
device's *content*. Each garden is a standalone account of its own hardware,
its own quirks, its own history.

## What makes it a garden

Four properties separate a garden from a pile of notes.

### The layout is the schema

There is no database and no front-matter taxonomy to learn. Knowledge lives in
concept folders, and the reserved filenames carry the meaning: `CLAUDE.md` is
"what this dir is and how to behave here," `notes/` holds device-specific
quirks, `troubleshooting/` holds fixes you'll need again. Because the names are
predictable, navigation is too — you (and Claude) always know where to look.
The full set is in [Conventions](../conventions/) and, exhaustively, in the
[garden schema reference](../../reference/garden-schema/).

### Commentary, not copies

When a real file outside the garden is the source of truth — `/etc/pacman.conf`,
a systemd unit, a dotfile manager's source — the garden does **not** copy it. It
stores the *commentary*: why the choice was made, what was tried, what to watch
for when it breaks again, under a `Last reviewed:` date so staleness is visible.
A copy rots silently; commentary with a review date tells you when to distrust
it.

### History is part of the value

Nothing is deleted. Things that age out are archived, not thrown away — an
abandoned project, an obsolete decision, and the reasoning that led to a
replaced setup are all worth keeping. Underneath, every change is a typed,
signed commit you can query by intent, so "what decisions did I make this month"
and "everything that ever touched this project" are answerable questions. This
history is managed by soft-fig itself, not git; see
[The Codebase → VCS](../../internals/vcs/).

### Encrypted at rest, plaintext on demand

The on-disk store is ciphertext. The working tree you read and edit is a FUSE
mount the daemon serves only while the garden is unlocked. Secrets can be sealed
even *within* that otherwise-plaintext view — a whole file or an inline
`<vault>` region — so an assistant reading the garden never sees them. Two
layers, two threat models; the details are in
[Guides → Secrets](../../guides/secrets/) and
[Reference → Crypto](../../reference/crypto/).

## Opened from the root, read by Claude

The intended way to work in a garden is to open Claude Code from the garden
root. The root `CLAUDE.md` is always in context and acts as the map; the
per-directory `CLAUDE.md` files load on demand as Claude routes to them. This is
the practice the whole layout is built around — it gets its own page in
[Working with Claude](../working-with-claude/).

## Where the project stands

soft-fig is a **single-author work in progress, not a released tool.** The idea
has been running as one person's real Arch laptop garden for long enough to
prove it out; the program that generalizes it is being built in the open, and
these docs are honest about the seam between what works and what is still a
plan.

Built and self-hosting today:

- the **Vault** (encryption at rest plus selective, in-view secrets) and the
  integrated **VCS** (content-addressed ciphertext, signed commits);
- the **daemon**, the **FUSE** plaintext view, and the file watcher;
- **`softfig onboard`**, the first-run wizard that scaffolds a fresh garden;
- the Keeper's agent and human surfaces — the **MCP** write verbs and the
  **`softfig-tui`** terminal UI;
- the **static deploy spine** (`softfig deploy`, milestone M4a), the first slice
  of the dotfile-manager pillar.

Not started yet: template rendering, cross-device sync, a GUI, and AUR
packaging. The [Vision & Roadmap](../vision-roadmap/) lays out the five pillars
and the built-versus-planned split in full, and
[The Codebase → Status](../../internals/status/) tracks where the code actually
is. The [source repository](https://github.com/ukVee/software-config-garden) is
the current source of truth.
