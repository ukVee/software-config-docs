---
title: Growlight Overview
description: The autonomous work loop the garden ships — what it is, how the baton carries state, and why a knowledge garden benefits from one.
---

A garden is never finished. Packages drift from their notes, a decision goes
unrecorded, a snapshot goes stale, an incident never gets written up. Most of
that upkeep is small, well-shaped, and exactly the kind of work that piles up
while you are doing something else. **Growlight** is soft-fig's answer: an
autonomous work loop that drains a backlog of that work — session after session,
while you are away.

It is a *tool the garden ships*, not a second product. The garden is the thing
you own and live in; growlight is what keeps it growing in the dark. Everything
below is in service of that one job.

## The core bet: a curated baton beats a lossy summary

A long assistant session rots. Context fills with dead ends, the model loses the
thread, and compacting it into a summary throws away the very details you needed.
Growlight refuses that trade. It never `/compact`s. Instead each iteration is a
**fresh session** that `/clear`-reseeds from a small **baton** — a handful of
lines that *point at* durable state rather than carrying it:

- the garden itself, read through [softfig-mcp](../../reference/mcp-verbs/);
- the code repos, read through git.

The baton says what was just done, what to do next, and what the human still owes
an answer on. Because it points instead of accumulates, controlled re-reading
replaces context rot: every session starts clean and reads exactly what the next
step needs. That single idea — *a curated baton beats a lossy summary* — is the
whole design in one sentence.

## The pieces

**The backlog.** The work queue lives in the garden at
[`growlight/backlog/`](../../reference/garden-schema/). Each item is either a
**milestone** (a body of work broken into ordered *slices*) or a standalone
**task**. A queue table owns status and order; the loop drains it top-down,
pulling the next `queued` item when the current one finishes. Items can be marked
`done`, `deferred` (finished except for something only a human can do — a
hardware smoke test, a merge), or `blocked` (the loop genuinely can't proceed
without you).

**The protocol.** A fixed operating contract — injected at the top of every
session — that never changes between iterations. It sets the rhythm: *boot* (read
the baton), *check budgets*, *do one coherent chunk of work*, *hand off* (rewrite
the baton, log an entry, persist the results), and the escape hatches for being
stuck or hitting a limit. The baton changes each roll; the protocol is constant.

**The baton-log.** An append-only, numbered record of every iteration, kept in
the garden at `growlight/baton-log/`. It is audit history — never re-injected —
so you can reconstruct exactly what the loop did and why, long after the fact.

**Budgets.** Two clocks keep the loop honest. A **context** budget rolls the
session to a fresh baton before the window fills (well before quality degrades).
A **5-hour session** budget makes it stop *starting* new work once it nears the
account's rolling limit, leaving headroom to write a clean handoff rather than
getting cut off mid-thought. A weekly budget is the outer guard. The numbers are
yours to tune — see [Customizing](../customizing/).

:::note[Where the churn lives]
Durable state — the backlog, the baton-log, decisions the loop records — lives in
the garden. The *runtime* churn (the live baton, the usage clock, the pending
questions) lives **outside** the garden, under
`$XDG_CONFIG_HOME/softfig/growlight/`, so the loop's minute-to-minute bookkeeping
never becomes garden history.
:::

## Why a knowledge garden benefits from a loop

Not every codebase suits an unattended agent. A garden does, for two structural
reasons:

- **The work is legible and bite-sized.** A garden is a pile of small,
  semantically-named files with a map at the root and a backlog of upkeep. That
  is precisely the shape a patient loop can chip away at one slice at a time,
  without needing to hold the whole system in its head.
- **Writes are typed, so autonomy is safe.** The [Claude
  practice](../../garden/working-with-claude/) already routes every change through
  soft-fig's write verbs, which stamp the conventions and record an intentional
  commit. An unattended loop inherits that safety for free: it can only mutate the
  garden through the same typed surface a human does, and it never touches sealed
  secrets or keys. The house rule *mutations via MCP only* stops being mere
  discipline and becomes the thing that makes a fleet of writers safe.

The upshot: the garden that is easy for *you* to keep with an assistant is, for
the same reasons, safe to let an assistant keep on its own.

## What it can drain

The loop is not limited to tidying the garden. Because a backlog item binds to a
repo, growlight also drives real project work — the soft-fig codebase itself is
built this way, with the loop implementing slices on feature branches while the
human reviews and merges. A garden backlog and a code backlog are the same
machinery pointed at different repos. **The loop never merges and never
pushes** — landing work is always a human's call.

:::caution[Pre-release, and honest about it]
Growlight runs live on the author's machine and has built much of soft-fig
itself — but soft-fig is single-author, pre-release software, not a released
tool. Treat this section as a description of something real and working, not a
supported product with guarantees. The honest built-vs-planned ledger is in
[Vision & Roadmap](../../garden/vision-roadmap/).
:::

## Next

- [Running Growlight](../running/) — `init`, `start`, the fleet daemon, and what
  the loop asks of you in return.
- [Customizing Growlight](../customizing/) — shape the backlog, tune the budgets,
  and make the loop your own.
