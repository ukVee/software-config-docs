---
title: Working with Claude
description: The Claude-native practice — open from the garden root, read natively, write through verbs.
---

A garden is built to be worked *with* an assistant, not merely stored near one.
The whole layout — the always-loaded map, the reserved filenames, the boundary
table — exists so Claude Code can navigate the machine without a tour. This page
is the practice: where to open Claude, how reading and writing differ, and the
one hard line the model never crosses.

## Always open Claude from the garden root

The root `CLAUDE.md` is the map, and it is the **only** one loaded
automatically. It carries the boundary decision table that routes any question
to the directory that owns it; the per-directory `CLAUDE.md` files load on
demand as Claude follows those pointers. Open Claude anywhere else and it starts
without the map — it can still read files, but it has lost the routing that makes
the garden legible.

So make the root the default. A shell alias is enough:

```bash
alias garden='cd ~/soft-fig_garden && claude'
```

Then `garden` drops you into a session that already knows the shape of the
machine. (Point the path at wherever your garden actually lives.)

:::tip[Why the root matters]
The map is what turns "where do notes about the flaky USB-C dock go?" into a
one-hop answer instead of a directory crawl. Keep the boundary table current as
you add domains — see [Make It Your Own](../make-it-your-own/) — and every future
session inherits the routing.
:::

## Reads are native; writes go through verbs

This asymmetry is the core of working in a garden.

**Reading is ordinary.** While the garden is unlocked, its plaintext view is a
normal directory tree — the daemon serves it over FUSE. Claude reads, greps, and
globs it with the same tools it uses on any codebase; nothing special is needed
to *read* a garden. Point it at a folder's `CLAUDE.md` and it descends from
there.

**Writing is typed.** Changes never go through raw `mv`, `sed`, or a text
editor. They go through soft-fig's write verbs — exposed to Claude as the
[softfig-mcp](../../reference/mcp-verbs/) server, and to you as the
`softfig-tui`. The daemon owns every mechanical field: the next note number, the
`Last reviewed:` date, the stamped header, the index table, the backlinks, and
the typed commit. Claude supplies only the irreducible new content; soft-fig
stamps the conventions server-side.

That division is deliberate. A note lands correctly numbered and dated whether a
human or an assistant wrote it, and the garden's history stays a clean sequence
of typed, intentional commits rather than a pile of editor saves. The guiding
rule is *the unit of change equals the unit of output* — asking to "add one
line" costs one line, not a whole-file rewrite. The full verb surface is
catalogued in the [MCP verb reference](../../reference/mcp-verbs/); wiring the
server into Claude is a one-time step in
[Register softfig-mcp](../../guides/claude-mcp/).

## The hard boundary: secrets and keys

One line the model never crosses: **it never sees secrets or key material.**

- **Sealed content is opaque to Claude.** A vault-sealed file — or an inline
  `<vault>…</vault>` region inside an otherwise-plaintext file — reads as
  ciphertext, and the write verbs *refuse* sealed targets outright.
- **Reveals are yours alone.** Turning ciphertext back into plaintext is a
  user-initiated `softfig reveal`; it is never wired to the assistant.
- **Key operations are out of band.** Unlocking the garden, rotating keys, and
  sealing new secrets are human actions at the CLI — no verb exposes them to the
  model.

So you can hand Claude the run of the garden without handing it your API tokens.
What it can read is exactly the plaintext view minus every sealed region; what
it can change is exactly the typed write surface minus anything sealed. The two
encryption layers behind this are explained in
[Guides → Secrets](../../guides/secrets/) and
[Reference → Crypto](../../reference/crypto/).

## What a session actually looks like

Working in a garden is a conversation, not a form. You describe what happened or
what you decided in plain language, and Claude routes it through the boundary
table to the right folder and the right verb:

- "Wi-Fi dropped after the last kernel bump — here's what fixed it. Log it." → an
  incident in `journal/incidents/`.
- "We've settled on systemd-resolved for DNS; write down why." → a decision in
  `journal/decisions/`.
- "Refresh the list of installed pacman packages." → a snapshot refresh under
  `snapshots/`.

None of these ask you to remember a filename, a number, or a date — that is the
daemon's job. The [Starter Prompts](../starter-prompts/) page collects
ready-to-paste versions of the most common ones, and pushes you to grow your
own.

:::note[Reads work without the MCP server; writes need it]
You don't strictly need the MCP server registered to *ask questions* about a
garden — Claude reads it as plain files either way. You need it to let Claude
*write* through the conventions. Without it, writes fall to you at the TUI.
Registering it once is the setup that makes the full practice fluent. The
one-time wiring is in [Register softfig-mcp](../../guides/claude-mcp/).
:::
