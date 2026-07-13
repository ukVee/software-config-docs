---
title: Config Files
description: keeper.toml, deploy.toml, and peers.toml — location, purpose, and fields.
---

soft-fig is configured by a handful of TOML files. Most of a garden's behavior is
convention, not configuration — these files hold the few things that genuinely
vary per device or per deployment. Fields that back pillars still in development
are marked **(planned)** or grouped under [Cross-device](#cross-device-in-development).

## keeper.toml

The daemon's configuration is split across **two** files, by when it's read:

- **`<garden>/.softfig/keeper.toml`** — a small **plaintext pointer** beside the
  store, read *before* unlock. It holds only what the daemon needs to boot and
  the one security opt-in.
- **`<garden>/config/keeper.toml`** — the **post-unlock policy**, stored
  *inside* the garden (encrypted, versioned, replicated), so it survives
  migrations and travels with the garden.

### The bootstrap pointer

| Field | Type | Default | Meaning |
|---|---|---|---|
| `state_root` | path | *(unset)* | Absolute path to the relocated `.softfig/` state root. When set, the daemon runs in FUSE mode and mounts the decrypted garden at the root. |
| `reveal.idle_seconds` | integer | `0` | Seconds after a successful `reveal` during which the next reveal may skip the master-password prompt. `0` = always re-prompt. |
| `growlight.allow_relock` | bool | `false` | Permit the one-time relock token that resumes an already-unlocked vault across an unattended daemon restart. A security opt-in — **human-set only**. See [Growlight → Running](../../growlight/running/). |

The pointer enforces strict field-checking to catch typos, with one exception:
the `[growlight]` table is shared with `softfig-growlightd` (the fleet daemon),
so it tolerates the extra fleet keys that daemon reads.

### The in-garden policy

`config/keeper.toml` carries the post-unlock daemon policy: the same `[reveal]`
table as above, plus the `[net]` and `[relay]` networking tables and the
`[replica]` backup opt-in described under [Cross-device](#cross-device-in-development).
It's written by `softfig migrate config` and thereafter versioned with the
garden.

## deploy.toml

**Location:** `<garden>/config/deploy.toml` (encrypted, versioned). **Purpose:**
the declarative source→target table [`softfig deploy`](../cli/#deploy)
materializes — the `bombadil link` replacement (M4a static spine).

A single `[dots]` table of named entries. Named (not a list) so plan and report
order is stable:

```toml
[dots]
bashrc   = { source = "bashrc",        target = ".bashrc" }
wayfire  = { source = "wayfire.ini",   target = ".config/wayfire.ini", method = "symlink" }
mimeapps = { source = "mimeapps.list", target = ".config/mimeapps.list", method = "copy" }
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `source` | string | *(required)* | Path within `config/source/`. |
| `target` | string | *(required)* | `$HOME`-relative (or absolute-under-`$HOME`) destination. |
| `method` | enum | `symlink` | `symlink` — materialize to a stable deploy-cache and link the target to it (the FUSE view is ephemeral, so the link points at the cache); or `copy` — write bytes straight to the target with a `# managed by softfig` stamp, for apps that reject symlinks. |

**Planned (not in the schema yet):** template rendering with profile-scoped
variables (M4b), and render-time Vault secrets + posthooks (M4c). Today's schema
is the static source→target spine only. See [Deploy
Dotfiles](../../guides/deploy-dotfiles/).

## peers.toml

**Location:** `<garden>/config/peers.toml` (encrypted, versioned; also mirrored to
`<state_root>/.softfig/peers.toml` as runtime state). **Purpose:** the network
**trust ring** — "I recognize this device and hold its keys." Populated when
`softfig pair` completes an SAS-confirmed handshake.

```toml
version = 1

[[peer]]
device_id        = "…"  # peer's Ed25519 identity pubkey (hex)
name             = "…"  # human-readable device name (not security-bearing)
transport_pubkey = "…"  # peer's X25519 transport static (hex)
endpoints        = []   # reachable host:port list; filled by discovery
attestation      = "…"  # peer's signature over its own transport key (hex)
paired_at        = 0    # Unix seconds
```

| Field | Type | Meaning |
|---|---|---|
| `version` | integer | On-disk schema version (currently `1`). |
| `device_id` | hex string | Peer's stable Ed25519 identity public key. |
| `name` | string | Advertised device name — convenience, not trusted for security. |
| `transport_pubkey` | hex string | Peer's X25519 transport static, used to key reconnects. |
| `endpoints` | list | Reachable `host:port`s; empty at pairing, refreshed by mDNS/relay discovery. |
| `attestation` | hex string | Peer's signature over its own transport key; verified on load to detect tampering. |
| `paired_at` | integer | When pairing happened (Unix seconds). |

## Cross-device (in development)

The networking config below feeds the [cross-device sync
pillar](../../garden/vision-roadmap/), which is landing incrementally — pairing
has arrived; replication is early. Treat these fields as not-yet-stable. They
live in both `keeper.toml` files' `[net]`, `[relay]`, and `[replica]` tables:

- **`[net]`** — this device's own network host: `enabled` (default `true`),
  `listen` (default `0.0.0.0:9100`), `device_name` (defaults to hostname),
  `advertise_name` (default `true`; publish the name over mDNS).
- **`[relay]`** — blind-relay hosting and reach, two independent halves:
  `enabled` (default `false`), `listen`, `endpoint`, `static_key`.
- **`[replica]`** — `host` (default `false`): opt in to storing ciphertext
  backups for granted ring members. **(planned)** — the backup loop is not yet
  built.

---

Related: [CLI Reference](../cli/) (the commands that read these),
[Garden Schema](../garden-schema/) (the `.softfigignore` file and layout), and
[Deploy Dotfiles](../../guides/deploy-dotfiles/).
