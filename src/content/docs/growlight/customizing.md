---
title: Customizing Growlight
description: Shape the backlog, tune the budgets, adjust the pacing, and adapt the protocol — the scaffolded loop is a starting point, not a standard.
---

The loop `growlight init` scaffolds is a *default*, not a specification to comply
with. It runs one agent, on two conservative budgets, against a fixed protocol —
sensible starting points, all of them yours to change. This page is the knobs, in
rough order of how often you'll reach for them. The theme is the same one that
runs through the whole garden: [make it your own](../../garden/make-it-your-own/).

## Shape the backlog

The backlog is the main lever. The loop drains exactly what you queue, so
curating it *is* directing the loop — far more than any config value. You shape it
the same way you write anything else in the garden: through soft-fig's write
verbs, from a Claude session or the TUI, never by hand-editing the queue table.

- **Add a task** for a single, self-contained piece of work. Add a **milestone**
  for a larger effort, then break it into **ordered slices** the loop takes one at
  a time.
- **Order matters.** The loop pulls the top `queued` item; reordering the queue
  reprioritizes the loop. Put the thing you want done next, next.
- **Status is the control surface.** An item moves through `queued` → `active` →
  `done`. Park it `deferred` when the loop has finished everything it can and only
  a human step remains (a hardware test, a review, a merge). Reserve `blocked` for
  when the loop genuinely can't proceed without a decision from you.

The relevant verbs — `add_backlog_item`, `add_slice`, `set_item_status`,
`reorder_backlog_item` — are catalogued in the
[MCP verb reference](../../reference/mcp-verbs/). In practice you just describe the
work to Claude and it fires the right one, exactly like the everyday tasks in the
[Starter Prompts](../../garden/starter-prompts/) cookbook.

:::tip[Write items the loop can actually finish]
An unattended agent does best with work that has a clear finish line it can verify
on its own — "refresh the pacman snapshot and note any surprises," not "make the
audio setup better." Where a step needs a human (a second device, a merge), say
so in the item; the protocol will park it `deferred` and roll on instead of
stalling.
:::

## Multiple queues

By default there's one queue, drained from the garden root. You can add more, each
**bound to a repo path**, so a queue's work runs in that repo's directory. This is
how one loop maintains the garden *and* builds a project without the two streams
colliding — the garden queue writes through MCP, a project queue commits to its
own git repo. Bind a queue with `add_queue`, then file items into it. A fleet
member can be pinned to a queue in [`config/growlight.toml`](../../reference/config-files/),
or left free to pull from whichever queue has ready work.

Keeping a repo's work in its own queue is also a safety boundary: an armed fleet
draining the default queue won't wander into a queue you've reserved for
human-present, semi-auto work.

## Tune the budgets

The two clocks that pace the loop live in `growlight/session-policy.md` — a plain,
editable policy file:

| Budget | Default | What it does |
|---|---|---|
| **Context** (per session) | roll at ~50%, hard at ~60% | Ends the session on a clean baton before the window fills and quality degrades. |
| **Session** (5-hour rolling) | reserve at 85% | Stops *starting* new work near the account limit, leaving room to write a tidy handoff instead of getting cut off. |
| **Weekly** | guard at 90% | The outer backstop for a longer pause. |

Lower the context roll if you want shorter, more frequent handoffs; raise the 5h
reserve if you'd rather the loop pack more into each window. The
[session-policy](../../reference/config-files/) file is the one place these
numbers live, and the protocol enforces whatever you set there.

## Adjust the pacing

How *many* agents run, and how hard each may push the machine, is device-scaled on
purpose — the same code should behave on a 2-core tablet and a workstation:

- **Concurrency.** `max_concurrent_agents` caps how many agents run at once.
  Start low (one or two) on a small device — the contention is builds, not
  thinking, since agents spend most of their time waiting on the API. Raise it on
  a bigger box.
- **Build resources.** `softfig growlight resources set` adjusts each agent's
  build caps *live* — a gentle throttle (fewer parallel build jobs, a memory-high
  ceiling), never a hard kill, so a compile storm slows down instead of taking the
  daemon out.

## Adapt the protocol — carefully

`growlight/protocol.md` is the operating contract injected into every session. It
is deliberately *fixed within a run* — a constant rhythm is what lets a fresh
session pick up instantly from a small baton. But the file is yours. If your
garden needs a different cadence — a tighter context band, a different handoff
ritual, an extra standing rule — edit it, knowing every future session inherits
the change. Treat it the way you'd treat any load-bearing convention: change it
on purpose, and write down why.

## Make it fit your machine

None of these defaults are sacred. A garden on a beefy always-on desktop might run
several agents on generous budgets; one on a travel tablet might run a single
agent on tight ones and stay semi-auto for anything risky. The loop is a tool the
garden ships — bend it to how *you* work, not the other way around. When a choice
is worth remembering, record it as a decision in the garden so future-you (and the
loop) knows the reasoning.

Back to [Overview](../overview/) · [Running Growlight](../running/).
