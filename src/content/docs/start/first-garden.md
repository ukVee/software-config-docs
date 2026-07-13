---
title: Your First Garden
description: Scaffold a garden with softfig onboard, unlock it, and take your first look around.
---

With the [binaries installed](../install/), one command turns an empty machine
into a working garden: `softfig onboard`. This walkthrough runs it end to end —
the passphrase, the recovery phrase you write down once, the encrypted genesis
commit, unlocking the daemon, and a first look at the tree. By the end you'll
have a real garden and a Claude session that already knows its shape.

:::caution[Set aside a few uninterrupted minutes]
`softfig onboard` prints a **12-word recovery phrase exactly once** and never
again. Have something to write it on before you start.
:::

## 1. Run the wizard

`softfig onboard` is interactive — it prompts for a passphrase at the terminal,
so it can't be fully scripted. The bare command uses sensible defaults:

```bash
softfig onboard
```

The defaults it will use, all overridable by flag:

| Flag | Default | Meaning |
|---|---|---|
| `--garden-root PATH` | `~/soft-fig_garden` | where the garden's plaintext view mounts |
| `--state-root PATH` | `~/.local/share/softfig/<garden-dir-name>/` | where the encrypted `.softfig/` store lives |
| `--machine NAME` | system hostname | the machine identity stamped into the skeleton |
| `--customize` | — | interactively toggle which concept dirs to include |
| `--yes` | — | accept the full default layout, skip the dir prompts |

If you want to hand-pick which parts of the scaffold you get, add `--customize`;
otherwise the defaults give you the full layout.

## 2. Set the passphrase and save the recovery phrase

The wizard inits the Vault first. It asks for a **master passphrase twice**, then
prints a **12-word BIP39 recovery phrase — once.**

- The **passphrase** is what you type to unlock the garden day to day.
- The **recovery phrase** is the only way back in if you forget the passphrase.
  It is never stored in plaintext anywhere. Write it down offline now; if it
  scrolls off, there is no second chance to see it.

:::danger[This is the one irreversible step]
Lose both the passphrase and the recovery phrase and the garden's contents are
unrecoverable — that's the point of encryption at rest. Record the recovery
phrase somewhere physical before continuing.
:::

## 3. What onboard just did

The scaffold is **born in FUSE** — no plaintext ever touches the garden root on
disk. In order, the wizard:

1. Resolved the garden root, state root, and machine identity.
2. Initialized the Vault (the passphrase + recovery phrase from step 2).
3. Stamped the embedded default skeleton into a throwaway tempdir, substituting
   `{{machine}}` and `{{date}}` placeholders.
4. Wrote the genesis `init` commit, encrypting that skeleton straight into
   `state_root/.softfig/`, then discarded the plaintext staging.
5. Wrote the `keeper.toml` pointer at the garden root that tells the daemon where
   the encrypted state lives.

So the moment onboarding finishes, the only thing at `~/soft-fig_garden` is that
`keeper.toml` pointer. The actual files appear when the daemon mounts them.

## 4. Start the daemon and unlock

If you let `onboard-device.sh` enable the systemd unit, the daemon is already
running (booted **locked**); otherwise start it yourself. Either way, unlocking
is what mounts the garden:

```bash
# if the unit is enabled:
systemctl --user status softfig-keeperd    # should be running, LOCKED

# …or start it directly:
softfig daemon start --garden ~/soft-fig_garden

# then, once per boot:
softfig daemon unlock                        # prompts your passphrase
```

`unlock` reads `keeper.toml`, finds the encrypted state, enters FUSE mode, and
mounts the decrypted garden at the garden root. You do this **once per boot** —
the garden stays mounted until the daemon stops or the machine sleeps off.

## 5. The smoke check

The proof it worked is that the tree is suddenly *there*:

```bash
ls ~/soft-fig_garden
# CLAUDE.md  meta/  journal/  packages/  services/  …  (the scaffold)
```

Before unlock, that same `ls` shows only `keeper.toml`. After unlock, the full
scaffolded tree is readable and writable through the mount. Stop the daemon and
it collapses back to the lone pointer — the plaintext only ever exists through
the mount, never on disk.

:::note[FUSE needs a real machine]
The mount uses the kernel's FUSE support, which can't come up inside a
sandboxed/container build. Run the `ls` smoke check on the actual device.
:::

## 6. Look around

Open the tree and read the root map first — it's the always-loaded guide to
everything else:

```bash
cd ~/soft-fig_garden
cat CLAUDE.md          # the map: the boundary table that routes any question
ls meta/               # how the garden itself works + the conventions
```

The scaffold is a **starting point, not a standard to obey** — most concept
directories are deliberately thin stubs waiting for your machine's real details.
Growing them is the whole practice; see
[Make It Your Own](../../garden/make-it-your-own/).

## 7. Your first Claude session

The payoff: open Claude Code **from the garden root**, so its always-loaded
`CLAUDE.md` gives the session the map immediately.

```bash
cd ~/soft-fig_garden && claude
```

Make that a habit with a shell alias:

```bash
alias garden='cd ~/soft-fig_garden && claude'
```

From there, Claude can read the whole garden natively and — once you've wired up
the write path — help you fill it. The reading/writing practice is
[Working with Claude](../../garden/working-with-claude/); the one-time write-path
setup is [Register softfig-mcp](../../guides/claude-mcp/).

---

You now have a live, encrypted, single-device garden. Where to go next:

- **Fill it** — [Working with Claude](../../garden/working-with-claude/) and the
  [Starter Prompts](../../garden/starter-prompts/) cookbook.
- **Protect secrets** — [Seal & Reveal](../../guides/secrets/).
- **Deploy dotfiles from it** — [Deploy Dotfiles](../../guides/deploy-dotfiles/).
