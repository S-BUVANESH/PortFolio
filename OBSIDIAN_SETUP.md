# Obsidian → Portfolio Auto-Publish

This project keeps the Obsidian vault as the source of truth for the weekly engineering archive.

## Workflow

Obsidian
→ Obsidian Git
→ GitHub
→ GitHub Actions
→ `scripts/build-templates.js`
→ standalone `Blogs/Week_XX.html` dossiers
→ portfolio archive preview / direct blog page

## Obsidian

Open `portfolio-content/` as an Obsidian vault.

The included `.obsidian/` configuration keeps the existing Obsidian Git workflow and attachment behaviour.

Install / keep the **Obsidian Git** community plugin configured to periodically commit and push.

## Generated output

The GitHub Action generates:

- `Blogs/Week_XX.html` — one standalone page per week
- `Blogs/archive.css` / `Blogs/archive.js` — shared weekly-page theme and reading behaviour
- `Blogs/assets/weekly/Week_XX/...` — copied weekly images / GLB assets
- `Blogs/manifest.json` — metadata for the generated dossiers
- `public/archive/...` — preview media used by the portfolio archive
- `src/generated/archive.ts` — archive metadata consumed by the homepage

Treat generated files as build output. Edit the Markdown under `portfolio-content/` instead.

## Important behaviour

The archive preview on the homepage contains only week metadata and preview imagery.

Opening a week navigates to its separate HTML dossier under `Blogs/`.

The standalone dossier uses the same visual world as the main cinematic portfolio, including:

- typography
- colour language
- paper / ink atmosphere
- red accent
- motion / reading progress
- interactive 3D artefacts when present

Markdown images, Obsidian embeds, tables, lists, links, code blocks, quotes and local media are converted during generation.

## GitHub permissions

Repository Settings → Actions → General → Workflow permissions → allow read and write permissions.

Do not manually edit `Blogs/Week_XX.html` or generated archive metadata.
