# M114: Let a plugin's owner add a screenshot

**Status:** done (2026-11-07, PR #863 https://github.com/jmgirard/zotdex/pull/863)

**Goal:** A plugin's repository owner can ask for one screenshot through an issue form, the maintainer checks and
applies it with `pnpm screenshot-request`, and the plugin page shows it under the icon.

**Outcome:** `.github/ISSUE_TEMPLATE/screenshot.yml` (label `screenshot`), linked from the page's owner line.
`pnpm screenshot-request` (`src/screenshot-request/`) shares `readOwnerRequest` (`src/text-request/owner.ts`), reads
only an `<img>` tag's own `src` or a Markdown image outside comments and code, downloads with the reader's
`downloader` and a per-URL `check` (`SCREENSHOT_HOSTS`, https) under 10 MiB, checks PNG/JPEG/WebP, 8000 px, and the
description rules, and writes the WebP copy (1600×2400, no metadata, 1 MiB) as a preview file to look at. `--apply`
writes `plugins/<id>/screenshot.webp` and `index.json`'s `screenshot`, or removes both; `--file` replaces the download.
`pnpm check` adds `screenshot-file`; the build writes `v1/screenshots/<sha256>.webp` and the record's `screenshot`
(`file`, `alt`) in both v1 schemas. The page head is two columns above 62.5rem, the screenshot under the icon.
Propose keeps and names a replaced entry's screenshot. About "Icons and screenshots", license line, docs, CHANGELOG.

**Decisions:** D-081 (owner screenshots that a maintainer looks at as the command's own copy; annotates D-049,
D-062, D-063, and D-080).

**Review:** Four-lens fan-out, three passes. Pass 1 returned (a non-https link exited 2; `--file` skipped the link's
host); pass 2 returned (a `src` inside another attribute, or an image in a comment, could apply an image the page does
not show), fixed by attribute parsing and the preview copy; pass 3 fixed 15, rejected 9, filed 1 row. Red CI (an
unhandled EPIPE in propose) fixed before merge. Rows: "Give screenshot images their pixel size" [low], "Escape raw format
characters in tests" [low]. Lessons: 7 marked used M114, 1 captured, M091's evicted by rank.
