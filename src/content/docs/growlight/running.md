---
title: Running Growlight
description: Scaffold the pillar with init, drive it semi-automatically or as an unattended fleet, and know what the loop owes you and what you owe it.
---

Growlight has two ways to run: **semi-auto**, where you sit with it and clear the
session between handoffs, and **unattended**, where a background daemon rolls
sessions on its own. Start with the first to see the rhythm; reach for the second
once you trust it. Both drain the same [backlog](../overview/#the-pieces) through
the same protocol.

:::note[Prerequisites]
The garden must be **unlocked**, and [softfig-mcp](../../guides/claude-mcp/) must
be registered so the loop can write through the verbs. If you haven't set up a
garden yet, start at [Install](../../start/install/) and
[Your first garden](../../start/first-garden/).
:::

## Scaffold the pillar: `softfig growlight init`

Run once per garden:

```bash
softfig growlight init
```

This materializes the `growlight/` pillar — the fixed operating protocol, the
session-policy budgets, an empty backlog and baton-log, and the navigation
wiring in the garden's root map. It is **idempotent**: re-running it fills only
what's missing and commits nothing if there's nothing to add. After it, you have
a place to put work but no work yet — add items as described in
[Customizing](../customizing/#shape-the-backlog).

## Semi-auto: `softfig growlight start`

```bash
softfig growlight start
```

This sets up the loop's runtime (its hooks, its isolated Claude settings, the
seed baton) under `$XDG_CONFIG_HOME/softfig/growlight/`, then launches an
interactive Claude session already primed with the protocol and the current
baton. You watch it work. When it reaches a handoff it tells you it's ready; you
`/clear` and the next fresh session reseeds itself from the rewritten baton.

Semi-auto is the honest way to *learn* the loop: you see every step, you approve
what it does, and nothing runs while you're not looking. It's also the right mode
for work that shouldn't be fully unattended — anything touching the vault, the
FUSE core, or a separate repo you want to review closely. (These docs, for
instance, are built semi-auto.)

## Unattended: the fleet daemon

For work that should proceed while you're away, soft-fig runs a control-plane
daemon, **growlightd** (`softfig-growlightd.service`). It is to the fleet what the
Keeper daemon is to the vault: a long-lived supervisor that owns session
lifecycle, so closing a window or logging out never kills the work.

A single autonomous agent is just a **fleet of one** — the same daemon, one
member. That keeps one code path whether you run one agent or several. The daemon
is **armed** through the garden's own config, at
[`config/growlight.toml`](../../reference/config-files/):

```toml
fleet_enabled = true

[[fleet]]
id = "a"
# optionally pin a member to a specific queue
```

Arming is a deliberate act. Leave `fleet_enabled = false` and the daemon claims
nothing; flip it to `true` (and cycle the daemon) only when you mean to point the
loop at real work. Because the gate lives in the garden, arming is itself a
versioned, intentional change — not a hidden switch.

:::tip[Bind a queue to a repo]
A backlog queue can be bound to a repo path, so the fleet drains a *project's*
work from that project's directory while the default queue handles the garden.
That's how one loop can maintain the garden and build a codebase without the two
streams colliding. See [Customizing → Queues](../customizing/#multiple-queues).
:::

### Observing and steering a running fleet

The daemon exposes a small client surface (all subcommands of `softfig
growlight`; the full list is in the [CLI reference](../../reference/cli/)):

| Command | What it does |
|---|---|
| `status` | One-shot: fleet state, the admission gate, roster, active agents. |
| `watch` | Tail the live event stream — agent thoughts, tool calls, budget and lease changes. |
| `pause` / `resume` | Engage or clear the admission gate: `pause` stops new and rolling agents; `resume` lets them flow again. |
| `resume <item>` | Un-park a single `blocked` backlog item (flip it back to `queued`). |
| `stop --level <after-slice\|after-iteration\|hard-kill>` | Stop one agent gracefully at the next boundary, or hard-kill it now. |
| `say` | Post a message into the coordination bus **as the human** — the loop reads it at its next boot. |
| `resources show` / `resources set` | Inspect or adjust the per-agent build-resource caps live (throttle, never kill). |

`pause`/`resume` are your calm brake and release; `say` is how you answer or
redirect a running loop without stopping it — your message rides the next baton.

### Redeploying when the loop rebuilds soft-fig

When the loop rebuilds a soft-fig binary it is running against, the daemon has to
restart onto the new build — but the garden is encrypted and a cold restart would
demand your passphrase. `softfig daemon cycle` handles this: it bounces the daemon
and resumes the unlocked session **without** the passphrase, holding a one-time
relock token in the daemon's own memory. It requires you to have opted in with
`allow_relock = true` in the keeper config — that's your switch to set, never the
loop's.

## What the loop owes you, and what you owe it

The protocol is built around a division of labour. The loop keeps its side:

- It **rewrites its baton** and **logs an entry** at every handoff, so state is
  always current and the history is auditable.
- It **never merges and never pushes.** Code work lands on a branch; the loop
  stops there.
- It **escalates instead of guessing.** Genuine decisions go to a *For the human*
  list with a proposed default; a truly blocking one parks the item rather than
  spinning.

Your side — the standing responsibilities of running a loop:

- **Review the baton at each handoff.** It's the honest record of what happened
  and what's next; skimming it is how you stay in control of an autonomous
  process.
- **Answer the owed-human items.** The loop parks questions rather than inventing
  answers. Clearing them is what keeps it unblocked.
- **Keep the backlog real.** The loop drains what you queue; a stale or
  fantastical backlog produces stale or fantastical work. Curating it is the main
  lever you have — see [Customizing](../customizing/).
- **Review, merge, and push.** The loop deliberately stops at the branch. Landing
  the work — and pushing anything — stays your call.

Next: [Customizing Growlight](../customizing/) — shaping the backlog, tuning the
budgets, and adapting the protocol to your own garden.
