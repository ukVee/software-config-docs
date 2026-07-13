---
title: Version Control
description: A content-addressed ciphertext store with signed, intent-classified commits — what "replacing git for this use case" means concretely.
---

soft-fig keeps its own version history instead of using git. That sounds
presumptuous until you see the constraint: the working tree is a FUSE projection that
*doesn't exist on disk*, and everything at rest is ciphertext. Git assumes a plaintext
working tree it can diff and a `.git` directory it can stage into — neither holds here.
So `softfig-vcs` and `softfig-store` implement a small, purpose-built VCS: a
content-addressed store of encrypted blobs, and a chain of signed, intent-labelled
commits over them.

This page explains how that store and that commit chain work. The crypto primitives
are [The Vault](../vault/); the daemon that drives commits is
[Daemon & FUSE](../daemon-and-fuse/).

## The content-addressed store

`softfig-store` is the bottom layer: loose ciphertext objects plus a SQLite index.

**Objects.** Every blob is stored at `objects/<aa>/<rest>`, where the whole path is
the hex `BLAKE3` hash of the **ciphertext** — `<aa>` is the first byte (a two-char
fanout so directories don't grow unbounded) and `<rest>` is the remaining 31 bytes.
Because the address is the hash of the encrypted bytes, writing an object is
idempotent: same address, same file, write once.

**Deduplication comes for free** from the encryption scheme. Blobs use master-keyed
*convergent* encryption — identical plaintext under the same master key produces
identical ciphertext, hence an identical address. Two files with the same content are
stored once, and the store never has to see plaintext to know they match. The trade-off
(deterministic ciphertext reveals plaintext *equality* to someone with disk access) is
covered in [The Vault → Convergent encryption](../vault/#convergent-encryption-and-its-trade-off).

**The index.** `db.sqlite` (opened in WAL mode) holds the metadata the object files
don't:

| Table | Holds |
|---|---|
| `meta` | format version, repo id, creation time |
| `refs` | each named tip → its commit hash |
| `commits` | one row per commit (fields below) |
| `trees` | which tree hashes exist |
| `tree_entries` | a tree's children: `name`, `kind` (blob/tree), `mode`, `target` hash |

Indexes on commit timestamp, commit intent, and tree-entry target keep history walks
and reachability scans fast. The objects are the source of truth for *content*; the
index is the source of truth for *structure and history*.

## Trees and commits

A commit is a signed snapshot of the whole garden at a point in time.

**Building a tree.** To commit, the walker reads the working tree into memory as a
nested structure (directories and files, with Unix modes), skipping VCS-internal dirs
and symlinks. Each file is encrypted and written to the object store; each directory
becomes a `tree` whose entries name its children by hash. A tree's own hash is the
`BLAKE3` of its **canonical** form — entries sorted by name, serialized as
[RFC 8785 JCS](https://www.rfc-editor.org/rfc/rfc8785) JSON — so the same directory
contents always hash the same way regardless of insertion order. Blobs are written to
disk first, then the trees and the commit row go in inside a single SQLite transaction,
so a half-written commit can't leave a dangling reference.

**What a commit contains.** Each commit row carries:

```
parent          # the previous commit's hash (null for genesis)
root_tree       # hash of the root directory snapshot
author_device   # the hostname that authored it
author_pubkey   # the device's Ed25519 public key
timestamp       # unix seconds
intent          # a name from the closed intent enum (see below)
payload         # a JSON object with intent-specific structured detail
master_key_id   # which master-key generation encrypted this commit's blobs
signature       # Ed25519 signature over the commit hash
```

**Signing.** The commit's identity hash is `BLAKE3(JCS({parent, root_tree,
author_device, author_pubkey, intent, payload, master_key_id, timestamp}))`, and the
signature is that hash signed with the device's Ed25519 identity key. Verification
re-canonicalizes, re-hashes, and checks both that the hash matches the stored row and
that the signature verifies under `author_pubkey`. Canonicalizing *before* hashing is
what makes the address stable and the signature meaningful.

## Every commit has an intent

Git commits carry a free-text message. soft-fig commits carry a **typed intent** —
a name drawn from a closed enum plus a structured JSON payload. `decision_logged`,
`incident_logged`, `note_added`, `archive_move`, `config_migrated`, `peers_changed`,
`vault_seal`, `manual_edit`, the growlight backlog intents, and a couple dozen more.
The name is validated against the `KNOWN_INTENTS` list at commit time, and the payload
must be a JSON object — an unknown intent or a non-object payload is rejected, not
stored.

This is deliberate. Because each mutation is *classified* — either by the
[watcher](../daemon-and-fuse/#the-watcher-pipeline) or by the verb that made it — the
history is queryable by *kind of change*, not just by prose. Adding a new intent is a
schema change: you update the spec, write a decision file, then extend the enum. It's
not something a caller can invent on the fly.

## Reading history and checking it

**`log`** walks the `parent` chain from a tip back toward genesis — a linear history,
no merge graph to resolve. **`show`** renders a single commit.

**`fsck`** is the integrity check, and it verifies the whole structure end to end:

- **Commits** — each commit's stored hash matches a fresh canonicalize-and-hash, its
  Ed25519 signature verifies, and its `parent` and `root_tree` exist.
- **Trees** — each tree's stored hash matches its canonical form, and every entry's
  target (blob or subtree) exists.
- **Objects** — each loose object file on disk hashes back to its own filename, so
  bit-rot is caught even for objects nothing points at.
- **Orphans** — objects on disk that no reachable tree references are reported (v1
  reports; it does not yet garbage-collect them).

Because the address of everything is a hash of its content, fsck can detect any
silent corruption: a flipped bit changes an address, and the mismatch surfaces.

## What "replacing git" means concretely

Put plainly, this VCS drops the parts of git that assume a plaintext working tree and
manual curation, and keeps the parts that give you durable, verifiable history:

- **No staging area.** There is no `git add`, no index. A commit is a snapshot of the
  full tracked state at that instant.
- **Auto-commit per mutation.** The daemon commits changes as they settle (after
  debounce), each with a classified intent — you don't author commits by hand, though
  `softfig commit` exists for direct use. History accretes rather than being sculpted.
- **The message is structured, not prose.** Intent + payload replaces the commit
  message, so the log is machine-readable.
- **Linear, signed, content-addressed.** One chain per ref, every commit signed by a
  device identity, every object addressed by its hash. Immutable once written — a
  mutation is a new commit, never a rewrite.
- **The store is encrypted.** git's objects are plaintext-at-rest; these are
  ciphertext, addressable without being readable.

:::note[Multiple chains are in development]
The shipped model is one linear device chain (the `tip` ref). The `refs` table and the
per-chain `fsck`/reachability machinery already anticipate **multiple chains** —
a device chain plus shared subtrees union-mounted into one garden — but that
multi-ref work (M5c) is on an unmerged branch and still hardening. See
[Code Status](../status/).
:::

---

Related: [The Vault](../vault/) (blob encryption and the signing key),
[Daemon & FUSE](../daemon-and-fuse/) (what triggers a commit),
[Architecture](../architecture/) (where the store sits), and
[Cryptography reference](../../reference/crypto/) (the primitive table).
