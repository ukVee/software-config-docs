// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// GitHub Pages project hosting: https://ukvee.github.io/softfig-docs
export default defineConfig({
  site: "https://ukvee.github.io",
  base: "/softfig-docs",
  integrations: [
    starlight({
      title: "soft-fig",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ukVee/software-config-garden",
        },
      ],
      // Sidebar mirrors PLAN.md "Information architecture" — labels come from
      // each page's frontmatter title.
      sidebar: [
        {
          label: "Start Here",
          items: ["start/install", "start/first-garden"],
        },
        {
          label: "The Story",
          items: ["story/why", "story/evolution"],
        },
        {
          label: "The Garden",
          items: [
            "garden/today",
            "garden/conventions",
            "garden/working-with-claude",
            "garden/starter-prompts",
            "garden/make-it-your-own",
            "garden/vision-roadmap",
          ],
        },
        {
          label: "Growlight",
          items: [
            "growlight/overview",
            "growlight/running",
            "growlight/customizing",
          ],
        },
        {
          label: "Guides",
          items: [
            "guides/secrets",
            "guides/deploy-dotfiles",
            "guides/claude-mcp",
          ],
        },
        {
          label: "Reference",
          items: [
            "reference/cli",
            "reference/mcp-verbs",
            "reference/garden-schema",
            "reference/config-files",
            "reference/crypto",
          ],
        },
        {
          label: "The Codebase",
          items: [
            "internals/architecture",
            "internals/daemon-and-fuse",
            "internals/vcs",
            "internals/vault",
            "internals/status",
          ],
        },
      ],
    }),
  ],
});
