---
title: The Vault
description: How the two encryption layers are built, how the key hierarchy hangs together, how recovery works, and how devices come to trust each other.
---

`softfig-vault` is the crypto core: it mints and guards the keys, encrypts and
decrypts blobs, signs commits, and holds the unlocked session in the daemon's memory.
This page explains **how the pieces fit and why** — the two encryption layers and
their threat models, the key hierarchy, recovery, and how two devices come to trust
each other.

The bare primitive choices (which cipher, which KDF, which curve) are the
[Cryptography reference](../../reference/crypto/); this page assumes them and explains
the construction. The day-to-day sealing workflow is the
[Secrets guide](../../guides/secrets/).

## Two layers, two threat models

soft-fig encrypts at two independent layers, both rooted in one master key `M`.

**Layer A — everything, at rest.** Every blob in the store is encrypted under a
per-blob subkey derived from `M`. This is always on, and it defends against an
attacker with your *disk*: a stolen laptop, a lifted backup, a compromised replica.
Without `M`, the object store is bytes indistinguishable from random. But Layer A is
transparent once the vault is unlocked — the whole point of the FUSE mount is to show
you plaintext — so it does nothing against a threat that reads the *mounted* garden.

**Layer B — selected secrets, even when unlocked.** Layer B seals specific things:
whole files (matched by globs in `sealed-paths.toml`) and inline `<vault id="…">`
regions inside otherwise-plain files. Its subkeys are also derived from `M`, but its
job is different — a Layer-B secret stays encrypted *past* Layer A's decryption, so it
never appears in the plaintext mount at all. That is what defends against the threats a
memory garden actually invites: a prompt-injected Claude session, an app or tool that
reads a file it shouldn't, an accidental paste. The mount shows `[sealed:<path>]` or
`[encrypted]` where the secret would be, and the only way to the plaintext is the
CLI-and-human-only `softfig reveal`.

The two layers use domain-separated subkeys so ciphertext from one can never be
decrypted as the other, and Layer B files carry a marker byte that distinguishes them
on the wire. Both derive per-item subkeys, so compromising one item's subkey never
leaks another's. The [reference table](../../reference/crypto/#the-two-layers) lays the
two side by side.

## The key hierarchy

One passphrase gates everything, and every working key descends from it.

```
passphrase ──Argon2id(random 16B salt)──▶ derived key ──wraps──▶ KEK
                                                                   │
                       KEK unwraps ────┬──▶ master key M   (master/<id>.key)
                                       ├──▶ Ed25519 identity key  (identity.key)
                                       └──▶ X25519 transport key  (transport.key)
                                                                   │
                       M ──HKDF-SHA-256──▶ per-blob keys           (Layer A)
                                           per-file / per-region   (Layer B)
```

- **Passphrase → KEK.** The passphrase runs through Argon2id (a fresh 16-byte random
  salt) to a derived key, which wraps the 32-byte **key-encryption key**. The Argon2id
  parameters live in a plaintext `params.toml` beside the vault, so a vault created on a
  strong machine still unlocks on a weaker one, and the [production cost is
  deliberately high](../../reference/crypto/#primitives) while the test suite uses a
  minimal cost.
- **KEK wraps the long-lived keys.** The master key `M`, the Ed25519 identity key, and
  the X25519 transport key are each stored on disk *wrapped under the KEK*, with
  distinct associated-data labels so one wrapped blob can't be swapped for another. `M`
  is generational — rotating the key writes a new `master/<id>.key` and bumps the active
  id — which is why every commit records the `master_key_id` that encrypted it.
- **M → subkeys.** HKDF-SHA-256 expands `M` into per-blob keys (Layer A, salted by the
  blob nonce) and per-file / per-region keys (Layer B, salted by path, and by region id
  for inline regions).

Everything sensitive is held in `Zeroizing` wrappers, so keys are wiped from memory
when the session drops — which is what "lock" does. The daemon holds exactly one
unlocked session; see [Daemon & FUSE → Lock and unlock](../daemon-and-fuse/#lock-and-unlock).

## Convergent encryption and its trade-off

Layer A blobs use **master-keyed convergent** encryption, and it is the hinge that lets
the [VCS content-address ciphertext](../vcs/#the-content-addressed-store). The nonce is
derived deterministically from the content and the master key —
`nonce = BLAKE3-keyed(M, plaintext)[..24]` — and the per-blob key is
`HKDF(salt = nonce, ikm = M)`. So identical plaintext under the same `M` yields
identical ciphertext, hence an identical `BLAKE3` address, hence automatic dedup — all
without the store ever seeing plaintext.

The trade-off is honest and bounded: deterministic ciphertext reveals plaintext
*equality* to an attacker who can read the object store (they can tell two blobs hold
the same content, though not what it is). That attacker already has your disk, which is
squarely inside Layer A's threat model, and a different master key produces entirely
different ciphertext — so key rotation breaks the correlation. The dedup and the
content-addressing are worth the leak of equality-under-a-key.

## Recovery and rotation

At vault creation you're shown a **BIP39 12-word recovery phrase, exactly once**, and
it's never persisted in plaintext. It is a second, independent path to the same `M`.

On disk the KEK is wrapped twice: once under your passphrase (`k.self`) and once under
a key derived from the recovery phrase (`k.recovery`), with different associated-data
labels so neither blob can stand in for the other. Both unwrap to the *same* KEK, which
unwraps the *same* master key. So:

- **Forgot the passphrase?** Unlock with the recovery phrase — it unwraps `k.recovery`
  to the KEK and, from there, `M`.
- **Rotating the passphrase** doesn't need the old one: recovering with the phrase plus
  a new passphrase re-wraps the KEK under the new passphrase (a fresh `k.self`) and
  leaves `k.recovery` untouched. The old passphrase stops working; the recovery phrase
  keeps working; the new passphrase works.

Because recovery re-wraps the *same* KEK, none of the underlying data has to be
re-encrypted — only the small wrapping blobs change.

## Device identity and trust

Each device holds two long-lived keys (both wrapped under its KEK): the **Ed25519
identity key**, whose public half *is* the device's identity and which signs every
commit, and the **X25519 transport key**, the static key for the encrypted channel
between devices. The transport key is minted alongside the identity at vault init (and
generated transparently on first unlock for vaults that predate it).

**Pairing** establishes a mutually-authenticated channel between two devices:

1. A **Noise `XX`** handshake over TCP exchanges and authenticates both static
   transport keys on first contact (no prior knowledge). Reconnects use the faster
   `IK` pattern, since each side already holds the other's key.
2. An **Ed25519 attestation** binds each device's identity key to its transport static,
   so a peer proves the transport key really belongs to that identity.
3. A **six-digit SAS** is derived from the handshake hash and shown on both screens.
   You compare them out of band; a man-in-the-middle on the LAN produces mismatched
   codes and is caught. No camera, no PKI.
4. On a match, each device records the other in a signed **trust ring** (`peers.toml`),
   whose every row's attestation is re-verified on load — a tampered ring is rejected,
   not silently trusted.

The crucial discipline is that **pairing grants nothing but recognition.** soft-fig
keeps three trust questions strictly separate:

| Question | Answered by | State |
|---|---|---|
| "Can I talk to this device securely?" | the network ring (`peers.toml`) | **shipped** (M5a) |
| "May this device back up my chain?" | an owner-minted replica grant | **shipped** (M5b) |
| "May this device unlock / read a shared subtree?" | the unlock ACL / subtree membership | **in development** |

**Backup trust flows one way, blindly.** The shipped cross-device slice (M5b) is
zero-knowledge replication: a chain owner pushes its signed, content-addressed
*ciphertext* to an authorized backup host that **verifies and stores but cannot
decrypt** it (the host never has `M`). It takes two-sided consent — the host opts in
via config *and* the owner mints a signed grant naming that peer — and it is
fast-forward-only, so a single honest owner's history can never be forked or rolled
back by a host. Reading a *peer's* documents (not just backing them up) needs a
chain-scoped read key and is deliberately deferred. The trust ring, the replica grant,
and future subtree membership are three different keys to three different doors; the
code never conflates them.

---

Related: [Cryptography reference](../../reference/crypto/) (the primitive facts),
[Version Control](../vcs/) (what the signing key signs and how ciphertext is
addressed), [Daemon & FUSE](../daemon-and-fuse/) (where the unlocked session lives),
and the [Secrets guide](../../guides/secrets/) (sealing and revealing Layer B).
