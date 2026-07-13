---
title: Deploy Dotfiles
description: Materialize a garden's config sources onto the filesystem with config/deploy.toml and softfig deploy.
---

A garden can hold your dotfile *sources* and put them where they belong on the
machine — the job GNU Stow or `bombadil link` does. You declare a source→target
table in `config/deploy.toml`; `softfig deploy` materializes it, conflict-safe
and dry-runnable. This is the **static deploy spine** (milestone M4a): it moves
files as-is. Templating and secret-rendering are later slices — see
[the limits](#current-limits) before you plan around them.

## The table: `config/deploy.toml`

Deploy sources live under `config/source/` in the garden; the table maps each one
to a target. The schema is deliberately small — a `[dots]` table of named
entries:

```toml
[dots]
bashrc   = { source = "bashrc",       target = ".bashrc" }
wayfire  = { source = "wayfire.ini",  target = ".config/wayfire.ini" }
weather  = { source = "weather.conf", target = ".config/weather/weather.conf", method = "copy" }
```

- **`source`** is relative to `config/source/`.
- **`target`** is relative to `$HOME` (or an absolute path *under* `$HOME`).
- **`method`** is `symlink` (the default) or `copy`.

Entries are keyed by name, and the plan is reported in name order.

## Symlink vs copy

**`symlink` (default).** The source is materialized into a stable deploy-cache
and the target becomes a symlink to it. Why the cache? The garden's plaintext is
a FUSE mount that vanishes the instant the garden locks — a link straight into it
would dangle. The cache (`0700`/`0600`, under your data dir) is the durable thing
the link points at, so your dotfiles survive a locked garden.

**`copy`.** The bytes are written straight to the target with a
`managed by softfig` stamp in a leading comment, e.g.:

```text
# managed by softfig — edits will be overwritten (source: config/source/weather.conf)
```

Use `copy` for the handful of apps that refuse to follow a symlinked config. The
stamp is a warning to future-you: edits to the target get overwritten on the next
deploy, because the source is the truth.

## Preview, then apply

Always dry-run first. It prints the plan and touches nothing:

```bash
softfig deploy --dry-run
```

```text
Plan (3 dot(s)):
   symlink  bashrc   →  /home/you/.bashrc
   symlink  wayfire  →  /home/you/.config/wayfire.ini
      copy  weather  →  /home/you/.config/weather/weather.conf

(dry run — nothing changed)
```

Each row's verb is the action `apply` would take: `symlink`, `copy`, `replace`
(refresh a managed target), `skip` (already up to date), or `CONFLICT`. When the
plan looks right, drop the flag:

```bash
softfig deploy
```

It reports what it did — created, replaced, copied, skipped, forced — and any
conflicts.

## Conflicts and `--force`

`deploy` will not silently clobber a file it doesn't manage. If a target already
exists as an unmanaged file, a foreign symlink, or a directory, that row is
marked `CONFLICT` and skipped, and the command exits non-zero. To take over such
targets, back them up and overwrite in one step:

```bash
softfig deploy --force
```

`--force` moves each conflicting target to `<target>.softfig-bak` before writing
the new one, so nothing is lost — you can inspect or restore the `.softfig-bak`
copy afterward.

## Paths and flags

```text
softfig deploy [--dry-run] [--force] [--garden-root PATH] [--cache-root PATH]
```

- `--garden-root` defaults to `~/soft-fig_garden` (the FUSE mount to read sources
  and the table from).
- `--cache-root` defaults to `$XDG_DATA_HOME/softfig/deployed` (i.e.
  `~/.local/share/softfig/deployed`) — where `symlink` targets point.

:::note[Unlock first]
The table lives at `config/deploy.toml` inside the plaintext view, so `deploy`
needs the garden **unlocked**. If it's locked, the file isn't there and you'll
get a clear "is the garden unlocked? run `softfig daemon unlock` first" hint
rather than a confusing error.
:::

## Current limits

This is the static spine, and it's honest about its edges:

- **`$HOME` file targets only.** Absolute targets outside `$HOME` (the `/etc`
  case) are deferred to a separate slice and rejected for now.
- **Files, not directories.** A `source` must be a single file; directory sources
  aren't supported in M4a.
- **No templating yet.** Sources deploy verbatim. MiniJinja rendering with
  profile-scoped variables (M4b) and render-time Vault secrets + posthooks (M4c)
  are planned but **not built** — don't design a `deploy.toml` around `{{ }}`
  variables expecting them to render.
- **A fresh garden has nothing to deploy.** `softfig onboard` scaffolds no
  `config/` tree; you add `config/source/` files and the `[dots]` table yourself
  when you're ready to manage a dotfile from the garden.

---

Related: [Seal & Reveal](../secrets/) for the secrets that M4c will one day render
into deployed configs, and the [CLI reference](../../reference/cli/) for the full
command surface.
