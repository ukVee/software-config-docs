---
title: Cryptography
description: The primitive choices, the key-derivation chain, and the two encryption layers — as facts.
---

The cryptographic facts: which primitives soft-fig uses, how keys are derived,
and what the two encryption layers are. This page is reference — the *how and
why* it fits together is [Internals → Vault](../../internals/vault/), and the
day-to-day sealing workflow is the [Secrets guide](../../guides/secrets/).

## Primitives

| Concern | Choice |
|---|---|
| AEAD | XChaCha20-Poly1305 (24-byte nonce, 16-byte tag) |
| Content hashing (object / tree / commit addresses) | BLAKE3 (32-byte) |
| Password KDF | Argon2id — OWASP 2023: `m = 64 MiB, t = 3, p = 4` |
| Subkey derivation | HKDF-SHA-256 |
| Commit signing | Ed25519 (per-device identity key) |
| Recovery phrase | BIP39, 12 words, shown once at setup |
| Canonicalization | RFC 8785 JCS (`serde_jcs`) for everything hashed or signed |

:::note[Test cost is deliberately low]
The production Argon2id cost is `m = 64 MiB, t = 3, p = 4`. The test suite uses a
minimal cost (`m = 8 KiB, t = 1, p = 1`) so `cargo test` runs in seconds — this
is a test fixture, not the shipped parameter.
:::

## Key derivation

One passphrase gates everything; every working key descends from it.

```
passphrase ──Argon2id(random 16B salt)──▶ KEK ──unwraps──▶ master key M
                                            │                    │
                                            └── unwraps ──▶ Ed25519 identity key
                                                                 │
                              M ──HKDF-SHA-256──▶ per-blob keys      (Layer A)
                                                 per-file / per-region keys (Layer B)
```

- **`passphrase → KEK`.** Argon2id over the passphrase with a fresh random 16-byte
  salt yields the 32-byte key-encryption key.
- **`KEK` wraps** the master key `M` and the device's Ed25519 identity key on disk
  (domain-separated by AEAD associated-data labels).
- **`M → subkeys`.** HKDF-SHA-256 expands the master key into per-blob keys
  (Layer A) and per-file / per-region keys (Layer B, salted by path and region
  id).
- **Recovery.** The BIP39 phrase is an alternate path to the same `M`: it derives
  a recovery passphrase that unwraps a recovery-wrapped copy of the master key,
  letting you re-wrap `M` under a new passphrase without the old one.

## The two layers

Two encryption layers with two threat models, both rooted in the same master key
`M`:

| | Layer A | Layer B |
|---|---|---|
| **Scope** | every blob in the store, at rest | selected files (glob) and inline `<vault id="…">` regions |
| **Subkey** | per-blob, `HKDF(M, salt = nonce)` | per-file / per-region, `HKDF(M, salt = path [‖ id])` |
| **Nonce** | `BLAKE3-keyed(key, plaintext)[..24]` | same construction |
| **In the mount** | plaintext — decrypted at read time inside the daemon | placeholder — `[sealed:<path>]` or `<vault id="x">[encrypted]</vault>` |
| **Defends against** | stolen disk, stolen backup, compromised replica | prompt injection, accidental AI / app exposure |

Layer A is always on; Layer B is opt-in per path. Because Layer B seals stay
encrypted *past* Layer A's decryption, a sealed secret never appears in the
mounted tree — which is what keeps it out of a Claude session. The reveal path is
CLI- and human-only; see [Secrets](../../guides/secrets/).

## Convergent encryption

Blob encryption is **master-keyed convergent**: the AEAD nonce is derived
deterministically from the content and the master key —
`nonce = BLAKE3-keyed(M, plaintext)[..24]` — so identical plaintext under the same
`M` produces identical ciphertext, and therefore an identical BLAKE3 address. That
lets the VCS content-address ciphertext blobs and dedup them, while the bytes stay
indistinguishable from random without `M`.

## What gets signed

Commits and trees are canonicalized with RFC 8785 JCS before hashing, so the
BLAKE3 address is stable regardless of field order. A commit's BLAKE3 hash is then
signed with the device's Ed25519 identity key, and verified with `verify_strict`
on read. The signed, intent-classified commit chain is
[Internals → VCS](../../internals/vcs/).

---

Related: [Internals → Vault](../../internals/vault/) (how the layers are built and
why), [Secrets](../../guides/secrets/) (sealing and revealing), and
[Internals → VCS](../../internals/vcs/) (the signed commit chain).
