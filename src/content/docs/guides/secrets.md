---
title: Seal & Reveal Secrets
description: Keep secrets encrypted inside the plaintext view with the Layer B vault — seal, list, and reveal.
---

A garden is encrypted at rest, but the moment it's unlocked the whole plaintext
view is readable — by you, by your editor, by a Claude session. That's fine for
notes and config commentary; it's wrong for an API token. **Layer B** is the
answer: it keeps chosen secrets encrypted *even inside the unlocked view*, so
they never appear in the mounted tree and never reach the assistant. This guide
is the day-to-day mechanics of sealing and revealing them.

:::note[Two layers, briefly]
Layer A encrypts the *whole* garden on disk; unlocking decrypts it into the FUSE
mount. Layer B seals *specific* things so they stay encrypted **past** that
decryption. The full model is in [Reference → Crypto](../../reference/crypto/)
and [Internals → Vault](../../internals/vault/); this page is the how-to.
:::

## Two granularities

You can seal at two levels, and they compose:

- **Whole files**, matched by glob — the entire file is Layer-B ciphertext.
- **Inline regions** inside an otherwise-plaintext file — wrap a single secret in
  `<vault id="…">…</vault>` and only that span is sealed, while the rest of the
  file stays readable.

Inline regions are the ones to reach for most: you keep a file legible and
reviewable, with just the credential blacked out. Wrap the secret in the tag,
giving it an id you'll use later to reveal it:

```text
# an .env-style file — readable, except the one secret
API_ENDPOINT=https://api.example.com
API_KEY=<vault id="example-key">sk-live-abc123…</vault>
```

## What the unlocked view shows

Once sealed, the FUSE mount never shows the plaintext. Instead you see
placeholders:

- a sealed **file** reads as `[sealed:<path>]`;
- a sealed **region** reads as `<vault id="x">[encrypted]</vault>`.

That's exactly what a Claude session sees too. The write verbs also **refuse**
sealed targets outright, so an assistant can neither read a secret nor
accidentally clobber one. (The boundary from the assistant's side is described in
[Working with Claude](../../garden/working-with-claude/).)

## Seal a file

`softfig vault seal` appends a glob to the vault's sealed-paths list; the daemon
commits the change and auto-encrypts every tracked file that matches.

```bash
softfig vault seal 'secrets/**'
```

Globs support `**`, `*`, `?`, `[…]`, and `{a,b}`. **Quote them** so your shell
doesn't expand them first. The command reports the schema change, the seal
commit, and every file newly sealed:

```text
schema_change   3f9a…
vault_seal      c17b…
newly sealed (2):
  secrets/tokens.toml
  secrets/deploy.env
```

If no tracked file matches yet, it just records the glob — anything you add later
that matches gets sealed automatically.

## List what's sealed

```bash
softfig vault list-sealed
```

Prints the active globs and the tracked files currently matching them — your
audit of what Layer B is protecting.

## Reveal (for you, never for the assistant)

Turning a secret back into plaintext is a deliberate, human-only action:

```bash
softfig reveal secrets/tokens.toml
```

It does **not** print the secret. It writes the plaintext to a mode-`0600` temp
file under `$XDG_RUNTIME_DIR` and prints only that **path** — keeping the secret
out of your shell history, terminal scrollback, and any log forwarder. You then
open, `less`, or pipe the file yourself:

```bash
less "$(softfig reveal secrets/tokens.toml)"
```

To reveal a single inline region instead of a whole file, name its id — repeat
`--id` for several, and you get one temp file per id in the order given:

```bash
softfig reveal services/example.env --id example-key
```

`reveal` prompts for your master password once per invocation and requires the
**daemon to be running** — Layer B has no direct, daemon-less path by design.

:::caution[Reveal is never wired to Claude]
There is no MCP verb for revealing, unlocking, sealing, or rotating keys. Those
are CLI actions you take at a terminal. Handing a garden to an assistant never
hands it your secrets — that separation is structural, not a matter of trust.
:::

## Unseal

Removing a glob stops *future* matches from being sealed, but does **not**
bulk-decrypt blobs that are already sealed on disk:

```bash
softfig vault unseal 'secrets/**'
```

If you want the Layer-A bytes back for a file that was sealed, rewrite it through
the FUSE mount after unsealing. `unseal` on a pattern that isn't present is a
no-op.

## When a pointer beats a seal

Sometimes the cleanest move isn't to seal a secret into the garden at all, but to
keep it *out* and point at where it really lives — an encrypted `secrets.toml` in
your dotfiles, a password manager, a hardware token. The garden convention is
**pointer-or-seal, never plaintext**: either seal it with Layer B, or store a
one-line note saying where the real thing is. Reach for a seal when the secret
genuinely belongs in the garden's history; reach for a pointer when it belongs
somewhere else and the garden only needs to remember that.

---

Related: [Deploy Dotfiles](../deploy-dotfiles/) (which can render sealed secrets
at deploy time — planned), [Reference → Crypto](../../reference/crypto/) for the
primitives, and [Internals → Vault](../../internals/vault/) for how the two
layers are built.
