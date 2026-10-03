# Obsidian Portfolio Content

This folder is the **Obsidian Vault** for the portfolio.

## Daily workflow
1. Open this `portfolio-content` folder as a vault in Obsidian.
2. Put your note in the correct week/day folder.
3. Paste screenshots normally with `Ctrl+V`. Because of `.obsidian/app.json`, attachments are saved beside the note.
4. Use normal Markdown or Obsidian image embeds such as `![[my-screenshot.png]]`.
5. Obsidian Git can commit/push changes automatically.
6. GitHub Actions compiles the notes into static pages under `Blogs/`.

## Folder naming
`Week_00` through `Week_19`

Inside each week:
- `01_Monday`
- `02_Tuesday`
- `03_Wednesday`
- `04_Thursday`
- `05_Friday`
- `06_Saturday`

The compiler sorts folders/files by these numeric prefixes.

## Publishing
Do not edit generated files in `Blogs/`. Treat them as build output.
Your source of truth is this folder.
