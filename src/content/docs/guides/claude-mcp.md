---
title: Register softfig-mcp with Claude
description: Wire the softfig-mcp server into Claude Code so a session can write to the garden through the typed verbs.
---

Claude can *read* a garden with no setup — it's just files. To let it *write*
through soft-fig's conventions, you register **softfig-mcp**, a small stdio
bridge that exposes the daemon's typed write verbs to a Claude session. This is a
one-time step per machine. Once it's done, the full
[Working with Claude](../../garden/working-with-claude/) practice — describe a
change in plain language, Claude routes it to the right verb — is live.

:::note[What the server is]
`softfig-mcp` is a stateless bridge: it speaks MCP to Claude and IPC to the
running `softfig-keeperd`. It never holds state of its own, and it exposes only
the *write* verbs — reads stay native filesystem ops, and Vault operations
(reveal, unlock, seal, key rotation) are deliberately **never** exposed to the
model. The verb catalog is [Reference → MCP verbs](../../reference/mcp-verbs/).
:::

## Register it

The easiest path is the one `onboard-device.sh` offers — say yes when it asks, or
run the same command yourself anytime:

```bash
claude mcp add softfig-mcp ~/.local/bin/softfig-mcp
```

That writes an entry into `~/.claude.json` pointing Claude Code at the binary.
Point the path wherever you installed it if not `~/.local/bin`.

### By hand

If you'd rather edit the config directly, add a stdio server entry to
`~/.claude.json` — roughly this shape (the `claude mcp add` command writes the
same thing):

```json
{
  "mcpServers": {
    "softfig-mcp": {
      "command": "/home/you/.local/bin/softfig-mcp"
    }
  }
}
```

Use the CLI when you can — it keeps the exact schema correct as Claude Code
evolves.

## Verify the verbs appear

Open Claude Code **from the garden root** (the always-loaded `CLAUDE.md` is the
map — see [Working with Claude](../../garden/working-with-claude/)):

```bash
cd ~/soft-fig_garden && claude
```

Then confirm the server connected and its verbs are available — check `/mcp`
inside the session, or just ask Claude to list the soft-fig tools it can see. If
they show up, you're wired. If they don't, the usual causes are a wrong binary
path in `~/.claude.json` or the daemon not running (the verbs need
`softfig-keeperd` up, since the bridge just relays to it).

:::caution[Restart Claude Code after upgrading the MCP binary]
When you rebuild and reinstall `softfig-mcp`, an already-open Claude Code session
is still bound to the **old** binary — the connection points at a stale inode and
the verbs will misbehave. After any upgrade of the MCP binary (or a daemon
cycle), **restart Claude Code** so it re-launches the new server. This is the
single most common "it suddenly broke" gotcha.
:::

## Reads without it

You don't need the server registered to *ask questions* about a garden — Claude
reads it as plain files regardless. Registration is purely what lets Claude
*write* through the conventions; without it, writes fall to you at the
`softfig-tui`. Doing this one-time wiring is what makes the whole
read-native/write-typed practice fluent.

---

Next: [Working with Claude](../../garden/working-with-claude/) for the practice,
the [Starter Prompts](../../garden/starter-prompts/) cookbook for ready-to-paste
requests, and [Reference → MCP verbs](../../reference/mcp-verbs/) for the full
write surface.
