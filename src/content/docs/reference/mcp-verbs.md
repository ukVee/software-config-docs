---
title: MCP Verbs
description: The typed, convention-stamping write surface softfig-mcp exposes to a Claude session.
---

`softfig-mcp` is the bridge that lets a Claude session **propose garden writes**.
It is a stateless stdio server, spawned per session, that forwards each verb to
the running `softfig-keeperd` daemon over its IPC socket. Reads of the garden are
plain filesystem operations — Claude just reads the mounted tree — so the verbs
below are the *write* surface plus a few coordination reads. Registering the
server is covered in [Register softfig-mcp](../../guides/claude-mcp/); the
practice of working through it is [Working with
Claude](../../garden/working-with-claude/).

## The stamping principle

Every write verb is **convention-stamping**: the daemon owns all the mechanical
fields — dates, sequence numbers, `# title` and `> Last reviewed:` headers,
filenames, index tables, `[[…]]` backlinks — and the commit. The caller emits
only the irreducible new content. Each successful write is one typed commit whose
*intent* classifies it (`decision_logged`, `note_added`, …), which is what makes
history queryable by what changed.

:::note[Writes are mediated, never direct]
The MCP server holds no persistent connection — it reconnects to the daemon per
request with bounded-backoff retry, so it rides out a daemon restart. Failures
*before* a request is sent are retried; a drop *after* the request is sent is
surfaced distinctly, so a committing verb is never blindly double-applied. The
section and `replace_file` verbs also **refuse vault-sealed targets** outright.
:::

## Write verbs — journal & records

| Verb | Purpose | Daemon stamps |
|---|---|---|
| `log_decision` | Record a decision → `journal/decisions/decision-<slug>.md`. | `# decision: <title>` + Date header; intent `decision_logged`. |
| `log_incident` | Record an incident → `journal/incidents/incident-<date>-<slug>.md`. | `# <YYYY-MM-DD> — <summary>` header; intent `incident_logged`. |
| `add_note` | Append a numbered note `NNN-slug.md` to a `notes/` or `troubleshooting/` folder. | `.seq` number, `# title`, `> Last reviewed:`; intent `note_added`. |
| `revise_note` | Replace the **body** of an existing numbered note; re-stamp the reviewed date. Number, slug, title stay fixed. | Reviewed date; intent `note_revised`. |
| `add_code_review` | Append a numbered record to a `code-reviews/` folder (same machinery as `add_note`). | `.seq` number, header, reviewed date; intent `code_review_added`. |
| `add_project` | Scaffold `projects/<name>/` with its reserved-name stubs in one commit. | Stub set; intent `project_added`. |
| `refresh_snapshot` | Write caller-supplied content to `snapshots/<path>`. The daemon never runs your data-gathering command — you run it and pass the result. | intent `snapshot_refresh`. |
| `archive` | Move a tracked path under `journal/archive/<name>/` (name defaults to the basename). | intent `archive_move`. |

## Write verbs — markdown sections

Address a section by its **heading text** (level-agnostic); the heading line is
kept verbatim. Optional `expected_version` + `editor` fields give compare-and-swap
protection against concurrent writers.

| Verb | Purpose | Daemon stamps |
|---|---|---|
| `add_section` | Append a brand-new section to the end of a doc. Caller gives heading text (leading `#`s set the level, default `##`) + body; the heading must not already exist. | intent `section_added`. |
| `edit_section` | Replace the body of an existing section, keeping the heading. | intent `section_edited`. |
| `append_to_section` | Add a row/bullet/line to the end of a section's body. | intent `section_appended`. |
| `set_reviewed` | Bump a doc's `Last reviewed:` line to today. Zero content — the daemon owns the date. | intent `reviewed_stamped`. |
| `replace_file` | **Break-glass.** Overwrite a file with verbatim bytes — no stamping. Discouraged; reach for it only when no structural verb fits (e.g. a monolithic `CLAUDE.md` rewrite). | intent `memory_edit`. |

## Write verbs — growlight backlog & loop

| Verb | Purpose | Daemon stamps |
|---|---|---|
| `add_backlog_item` | Seed a backlog item (milestone or task) and enqueue it (`queued`). | Folder/doc scaffold; queue-table row; intent `backlog_item_added`. |
| `add_queue` | Register a named work-stream queue bound to a repo path (the fleet's multi-queue model). | Registry + per-queue table; intent `queue_added`. |
| `add_slice` | Append a numbered slice `NNN-slug.md` under a milestone. | `.seq` number, header, slices index; intent `slice_added`. |
| `set_item_status` | Set an item's status (`queued\|active\|done\|blocked\|deferred`) in the authoritative queue table. Enforces at-most-one `active`. | intent `item_status_set`. |
| `reorder_backlog_item` | Move an item's row (top/bottom/before/after) without changing status. | intent `backlog_item_reordered` (no-op moves make no commit). |
| `log_baton` | Append a numbered iteration entry to `baton-log/` (append-only audit; excluded from the backlink graph). | `.seq` number, iteration metadata block; intent `baton_logged`. |

## Write verbs — coordination bus

| Verb | Purpose | Daemon stamps |
|---|---|---|
| `post_message` | Post to the fleet coordination bus — addressed to an agent slug, `@all`, or `@human`; kind `info\|coord-request\|lease-request\|question\|alert\|restart-request`. | Message number + wall-clock `ts`; intent `chat_message_posted`. |

## Read & coordination verbs

These return data or arbitrate coordination; they don't stamp garden content.

| Verb | Purpose |
|---|---|
| `file_provenance` | Who last edited a path and its recent edit history (from the commit chain) — check before editing a hot file. |
| `read_inbox` | Read this agent's unread bus messages (direct + `@all`), advancing a cursor so the next read returns only newer ones. |
| `request_lease` | Request a supervisor-arbitrated lease over a shared resource before a dangerous shared action. Returns `granted\|waiting\|denied`. Ephemeral — no commit. |
| `release_lease` | Release a held lease, promoting the head waiter. Ephemeral — no commit. |

## Deliberately absent: the Vault

There is **no MCP verb** for any vault operation — no reveal, seal, unseal,
list-sealed, unlock, key rotation, or trust change. The verb registry contains no
such entry; the only mention of the vault in the surface is the guard that
*refuses* edits to sealed targets.

This is structural, not a matter of trust. Vault actions require the unlocked key
and human-only policy that live in the daemon; they are CLI actions you take at a
terminal (see [`softfig reveal` / `vault seal`](../cli/#the-vault)). Handing a
garden to an assistant never hands it your secrets.

---

Related: [Register softfig-mcp](../../guides/claude-mcp/) (setup),
[Working with Claude](../../garden/working-with-claude/) (the practice),
[CLI Reference](../cli/) (the human-facing surface), and
[Conventions](../../garden/conventions/) (what the stamping enforces).
