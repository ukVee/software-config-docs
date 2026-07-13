---
title: Starter Prompts
description: A copy-paste prompt cookbook for everyday garden tasks — and what each one fires.
---

These are starting points, not a fixed menu. Each entry pairs a plain-language
prompt with what it *causes* — which [write verb](../../reference/mcp-verbs/)
fires and what convention gets stamped — so you can see the machinery and then
adapt the wording to your own machine. Open Claude from the garden root first
(see [Working with Claude](../working-with-claude/)); the root map is what routes
each request to the folder that owns it.

:::note[Phrasing isn't magic]
You don't need these exact words. Claude routes on intent, not keywords — copy
one, change the specifics, and it still lands in the right place.
:::

## Record a decision

> We've settled on `systemd-resolved` for DNS instead of hand-managed
> `resolv.conf`, mainly for split-DNS on the VPN. Write that down as a decision.

- **Fires** `log_decision` → a stamped `journal/decisions/decision-<slug>.md`
  (`# decision:` heading + `Date:` header, your reasoning below), in one
  `decision_logged` commit.
- **When** you've made a choice about how the machine — or the garden itself — is
  set up and the *why* is worth keeping. Decisions are referenced by name, so
  the date lives in the file, not the filename.

## Log an incident

> The touchpad stopped waking from suspend after today's kernel update;
> downgrading `libinput` fixed it. Log the incident — what broke, what I tried,
> what worked.

- **Fires** `log_incident` → `journal/incidents/incident-YYYYMMDD-<slug>.md` with
  a stamped `# <date> — <summary>` header, `incident_logged` commit.
- **When** something broke and got fixed. This chronological record complements a
  domain's `troubleshooting/` folder (the "fixes I'll need again" reference); a
  nasty one often earns an entry in both.

## File a loose note where it belongs

> Note that the Surface pen needs its firmware re-paired after a battery swap or
> the tip pressure goes dead. Put it wherever that belongs.

- **Fires** `add_note` into the routed accretive folder (here, `input/notes/`) →
  `NNN-slug.md`, the next number pulled from the folder's `.seq`, with the
  `# title` and `> Last reviewed:` lines stamped.
- **When** you have a device-specific quirk or gotcha. You don't pick the folder
  or the number — Claude routes via the boundary table, the daemon assigns the
  number. If there's no obvious home, see *Route a question* below.

## Triage the inbox

> Go through everything in `inbox/` and file each item where it actually
> belongs.

- **Fires** *(no single verb)* — Claude reads the `inbox/` placeholders natively,
  then refiles each through whichever verb matches its destination
  (`log_decision`, `add_note`, `log_incident`, …) and `archive`s the emptied
  placeholder.
- **When** you've been dropping quick captures into `inbox/` and want them sorted
  into their real homes. Triage is a routing pass, not one command — anything
  with no clear home stays in `inbox/` for next time.

## Refresh a snapshot

> Refresh the pacman package snapshot.

- **Fires** `refresh_snapshot` → Claude runs the data-gathering command itself,
  then writes the formatted result under `snapshots/…` in a `snapshot_refresh`
  commit. (The daemon never runs commands for you — it only stores what Claude
  produces.)
- **When** the recorded state of something mutable — installed packages, enabled
  services — has drifted from reality. The concept folder holds the stable
  knowledge; the matching snapshot holds the refreshed data.

## Check something for staleness

> Re-check the NetworkManager notes against the live `/etc/NetworkManager/`
> config and mark them reviewed if they still hold.

- **Fires** `set_reviewed` → bumps the doc's `> Last reviewed:` line to today
  (zero content; the daemon owns the date).
- **When** a file carries a `Last reviewed:` header and enough time has passed to
  distrust it. The point is the *re-reading*: confirm the commentary still
  matches its source, then stamp — never bump the date blind. If it no longer
  matches, that's an `edit_section` first, then the stamp.

## Start a new area

> We've started doing PC gaming on this machine. Add a `gaming/` area, describe
> what it's for, and route it in the boundary table.

- **Fires** — for a **code project**, `add_project` scaffolds `projects/<name>/`
  with its reserved-name stubs in one commit. For a general concept dir it's a
  small structural pass: write the new `CLAUDE.md` (`replace_file`, the one
  break-glass case — a fresh monolithic navigator), extend the root boundary
  table (`append_to_section` / `edit_section`), and record the reasoning
  (`log_decision`).
- **When** a real question arrives that no existing folder should own. Grow
  structure from pressure, not up front — see
  [Make It Your Own](../make-it-your-own/).

## Route a question (read-only)

> Where should notes about the flaky USB-C dock port go — `hardware/`,
> `services/`, or somewhere else?

- **Fires** *nothing* — this is a pure read. Claude consults the root boundary
  table and names the owning directory (plus the cross-references that point at
  it).
- **When** you're unsure where something belongs and want the map's answer before
  you write. If the honest answer is "nowhere yet," the move is a placeholder in
  `inbox/`, not a forced fit.

## Grow your own cookbook

This list is a seed. The best prompts are the ones shaped to *your* machine and
the way you actually talk about it — so when you find a phrasing that reliably
lands a task in the right place, keep it. A `starter-prompts` note in your own
garden, or a running list in the inbox, turns each good prompt into one you never
have to reinvent. The scaffold is a starting point; make it yours.
