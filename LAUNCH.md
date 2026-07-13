# Launch checklist

> The gated, manual steps to take soft-fig's docs live. **Nothing here runs
> automatically** — the Pages deploy is `workflow_dispatch`-only by design (see
> `PLAN.md` → Hosting). Work top to bottom; each step is the human's to do.

## Pre-flight (before going public)

- [ ] **Repo name is `software-config-docs`.** `astro.config.mjs` sets
      `base: "/software-config-docs"`, so GitHub project Pages will only resolve
      if the repo is named `software-config-docs` (URL
      `https://ukvee.github.io/software-config-docs/`). Some handoff/notes text
      says `softfig-docs` as shorthand — the executable truth is
      `software-config-docs`. If you'd rather the repo be `softfig-docs`, change
      `base` (and every absolute docs link in the code-repo README) to match
      first.
- [ ] **Create the private remote.** `ukVee/software-config-docs` doesn't exist
      yet. Create it **private**, add it as `origin`, push `main`.
- [ ] **Story pages.** `story/why.md` and `story/evolution.md` are still
      "coming soon" placeholders (they're written in your own voice, by hand —
      not by Claude). Either write them first, or accept that they ship as
      placeholders at launch.
- [ ] **Build is clean.** `npm run build` completes with no errors and no
      leftover stubs outside the two story pages.
- [ ] **README rewrite is on `main` in the code repo.** The shrunk
      `~/projects/software-config_garden/README.md` was rewritten while that
      repo was checked out on `feat/m5c-union-mount` and left **uncommitted** —
      it must land on `main` (see "Merge the README rewrite" below) so the
      public front door points at the live docs.

## Go live

1. [ ] **Flip `software-config-docs` public.** GitHub → repo → Settings →
       General → Danger Zone → Change visibility → Public. (On the Free plan,
       Pages cannot publish from a private repo at all — this unblocks it.)
2. [ ] **Enable Pages.** Settings → Pages → Build and deployment → Source:
       **GitHub Actions**.
3. [ ] **Run the gated deploy.** Actions → "Deploy to GitHub Pages" → **Run
       workflow** (the `workflow_dispatch` trigger). Wait for the `build` and
       `deploy` jobs to go green.
4. [ ] **Verify the live site.** Open
       <https://ukvee.github.io/software-config-docs> — check the splash, the
       sidebar (all seven areas), a few cross-area links, and search.

## Land the README

5. [ ] **Merge the README rewrite** into the code repo's `main` and push.
       Because the working copy was edited on `feat/m5c-union-mount`, move just
       that one file onto `main` — e.g. stash it, `git switch main`, restore
       `README.md`, commit, push (do **not** merge the whole M5c branch). Its
       docs links go live only once step 4 is verified, so land it after, not
       before.

## Optional, later

6. [ ] **Custom domain.** If desired, add a `CNAME` + configure the domain in
       Settings → Pages, then update `site`/`base` in `astro.config.mjs` and the
       absolute docs URLs in the code-repo README accordingly.
