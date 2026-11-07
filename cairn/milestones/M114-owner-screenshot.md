# M114: Let a plugin's owner add a screenshot

- **Status:** in-progress
- **Priority:** normal
- **Depends on:** M113
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — owners gain a request form and plugin pages show the screenshot
- **Branch/PR:** m114-owner-screenshot

## Goal

A plugin's repository owner can ask for one screenshot through an issue form, the maintainer checks and applies it
with `pnpm screenshot-request`, and the plugin page shows it under the icon.

## Scope

**In:** a `screenshot` label and issue form; `pnpm screenshot-request` with the text request's owner check, image
download and checks, `--file`, `--apply`, and removal; `plugins/<id>/screenshot.webp` and `index.json`'s
`screenshot`; `pnpm check` rules; the build's `v1/screenshots/<sha>.webp` and the record's `screenshot`; the page
head's right column with the icon above the screenshot; the approved lines; docs, a D-entry, DESIGN, and CHANGELOG.

**Out:** more than one screenshot (the user chose one); a bot that answers requests → the parked row "Let a bot
check text requests at once" holds the same idea for text; icons → M113.

## Acceptance criteria

- [ ] AC1: The repo has a `screenshot` label, and `.github/ISSUE_TEMPLATE/screenshot.yml` adds a form with that
      label and the fields Plugin id, Screenshot (an image attached to the issue), and Description of the
      screenshot; each plugin page links to it with the plugin id filled in, which a site test checks.
- [ ] AC2: `pnpm screenshot-request <issue> --data <file>` reads an open issue labeled `screenshot` and runs the same
      owner check as `pnpm text-request`. A Screenshot field that is blank or `_No response_` makes the request a
      removal, and the description is then ignored. Otherwise it exits 1 naming the problem when the field holds no
      image link or more than one; when the link or any redirect leaves the hosts in `SCREENSHOT_HOSTS`; when the
      download passes 10 MiB; when the bytes are not PNG, JPEG, or WebP; when sharp's metadata gives a width or
      height over 8000 px; or when `textProblems("description", text, shownName)` refuses the description. One
      test for each problem named here, with recorded responses.
- [ ] AC3: With `--apply`, the command re-encodes the image with sharp as WebP, fit within 1600×2400 px with no
      metadata, exits 1 and writes nothing when the result is over 1 MiB, and otherwise writes
      `plugins/<id>/screenshot.webp` and sets `index.json`'s `screenshot` to the description and a reason naming
      the issue; a removal deletes both. `--file <path>` replaces only the download, and every other check of AC2
      still runs. Tests cover apply, the over-1 MiB result, removal, and `--file`.
- [ ] AC4: `schemas/index.v1.schema.json` defines the optional `screenshot` object, and `pnpm check` fails an entry
      when `index.json` names a screenshot and `screenshot.webp` is missing, when `screenshot.webp` exists and
      `index.json` names none, or when the file is not WebP, is wider than 1600 px or taller than 2400 px, or is
      over 1 MiB. Schema tests pass with and without the field, and one check test covers each failure.
- [ ] AC5: `pnpm build` copies each entry's screenshot to `v1/screenshots/<sha>.webp`, `<sha>` the SHA-256 of its
      bytes, and sets the record's optional `screenshot` to `{ "file": "screenshots/<sha>.webp", "alt": "<text>" }`;
      `schemas/plugins.v1.schema.json` defines the field, and the schema test passes with and without it.
- [ ] AC6: The plugin page of a record with `screenshot` shows one `<a data-screenshot>` whose `href` is
      `${BASE}v1/` followed by `screenshot.file`, holding an `<img>` whose `alt` is `screenshot.alt`. At viewport
      widths of 1024 px and 1280 px, the image's left edge is right of the right edge of each head text element
      the page has (`h1`, repo line, description, categories, `.actions`), its right edge is within `.page-head`'s,
      and its top is below the icon tile's bottom, or within 1 px of the `h1`'s top when the record has no icon. At
      375 px and 1000 px it comes after `.actions` and before `.install-note`, or before the version card when the
      page has no install note, no wider than the page's content box, and the page has no horizontal scroll at
      375 px. A browser-pane look in the Review checks these with one wide and one tall image; site tests check the
      attributes and the element order. A record without the field has no `[data-screenshot]` element.
- [ ] AC7: Each line that `cairn/references/plain-words-copy.md` records for M114 appears word for word on the
      built site (the plugin page's owner line, the About section "Icons and screenshots", and the license line);
      `docs/requests.md` documents the form and the command, `docs/data.md` the two `screenshot` fields, and
      `docs/license.md` says screenshots keep their owners' terms.
- [ ] AC8: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T4
- AC5 → T5
- AC6 → T6
- AC7 → T1, T7
- AC8 → T1, T2, T3, T4, T5, T6, T7

## Tasks

- [x] T1: Run `gh label create screenshot` (granted at the question set); add `screenshot.yml` after
      `.github/ISSUE_TEMPLATE/text-change.yml`, a `screenshotHref` beside `textChangeHref` (`site/src/data.ts:220`),
      and the approved owner line at `site/src/pages/plugins/[id]/index.astro:388`, with a site test.
- [x] T2: Add `src/screenshot-request/` on the shape of `src/text-request/` (`request.ts` :72-148, `parse.ts`):
      reuse the owner check, find image links in the field, and download with a host check on each redirect and a
      byte cap (export `downloader` and `readCapped` from `src/upstream/reader.ts`, or share them); check the
      format by magic bytes and the size by sharp's metadata; tests with recorded responses
      (`test/support/fixture-fetch.ts`).
- [x] T3: Add `--apply`, removal, and `--file` to the command, re-encoding with sharp; tests.
- [x] T4: Add `screenshot` to `schemas/index.v1.schema.json` and the file rules to `src/check/check.ts` (`checkEntry`
      :143 reads only the two JSON files today); tests.
- [ ] T5: Copy screenshots in `src/build/build.ts` `writeData` and add the record field and plugins.v1 schema entry;
      tests, with the fixed output of `test/build.test.ts` in mind (lesson 2026-11-02, M075).
- [ ] T6: Make `.page-head` two columns above 62.5rem, the icon over the screenshot on the right, and put the
      screenshot below `.actions` at 62.5rem and under; site tests and a fixture with a screenshot (lesson
      2026-10-30, M061); look at 375, 1000, 1024, and 1280 px in light and dark (lessons 2026-10-29 M048,
      2026-11-06 M108).
- [ ] T7: Rename the About section and add its sentence, change the license line, document the form and command
      in `docs/requests.md` (after "Changing a plugin's name or description", :165), the fields in `docs/data.md`,
      and terms in `docs/license.md`; update DESIGN's sources and add a D-entry for owner screenshots, annotating
      D-049, D-062, and D-063; add the CHANGELOG entry.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — new request command, files, data field, and page layout.
- 2026-11-07: idea vet: gap — images from random repos can show harm; reading taken: only owner requests that the maintainer applies by hand, re-encoded by sharp. gap — a hotlinked image can change after approval; reading taken: the index commits and serves its own copy. gap — D-063 licenses text only; reading taken: screenshots keep their owners' terms. No one outside asked yet, as for D-049; the user asked for it.
- 2026-11-07: lessons used: 2026-10-29 (M048), 2026-10-30 (M061), 2026-11-02 (M075), 2026-11-06 (M108).
- 2026-11-07: question set: screenshots per plugin — one, under the icon at the top right of the page head.
- 2026-11-07: question set: page wording — approved as drafted, recorded in `cairn/references/plain-words-copy.md`.
- 2026-11-07: question set: creating the `screenshot` label on GitHub — granted.
- 2026-11-07: plan gate chose owner requests that the maintainer applies over reading images from READMEs because the build cannot tell a screenshot from other images and the user did not want unreviewed images; falsified by owners who do not use the form while their READMEs hold screenshots.
- 2026-11-07: plan chose committing a re-encoded copy over linking the attachment because the owner could replace a linked file after approval; falsified by repo size growth that slows clones.
- 2026-11-07: criteria audit (full mode, fresh Opus reader), with M113: a blank Screenshot field is a removal, not an error; apply refuses a result over the check's 1 MiB and fits height too; `--file` keeps every other check; the description uses `textProblems("description", …)` and no second 200 limit; the label must exist; the wide layout starts above 1000 px; `index.v1` gains the field; instrument wording moved out of the promises.
- 2026-11-07: criteria re-audit after the layout answer: AC6 anchors on every head text element, not the optional description; names the slot before `.install-note`; keeps the image inside `.page-head`; a 1 px tolerance; a wide and a tall image in the look; exact `href`.
- 2026-11-07: inbox sweep: 0 open issues; 10 open PRs, all bot "Add <repo>" PRs, none overlapping.
- 2026-11-07: sizing: 8 criteria pass the ~7 tripwire only through the verify-slot criterion (AC8), so no split; tasks are 6 to 7.
- 2026-11-07: implement started on branch m114-owner-screenshot.
- 2026-11-07: T1: created the `screenshot` label, added `screenshot.yml` (Screenshot is a textarea so an image can be attached), `screenshotHref`, and the approved owner line with site tests; the form's own test lands with T2's labels.
- 2026-11-07: T2: moved the issue, label, form, record, entry, and owner reads into `src/text-request/owner.ts` (`readOwnerRequest`, `formValues` in parse.ts) and put both requests on it; exported `downloader` with a per-URL `check` and `readCapped`, whose `tooLarge` now throws outside its catch; `SCREENSHOT_HOSTS` is github.com and the S3 host an attachment redirected to (curl, 2026-11-07); a non-https URL or a port also counts as off the hosts; a ReadFailure or HTTP error on the download is failure `download-failed` (exit 2); problems print as `problem: <name>: <detail>`, the description's as `description-<textProblems name>`; the form test lives in `test/screenshot-request.test.ts`.
- 2026-11-07: T3: `--apply` auto-orients, fits inside 1600×2400 without growing, and writes WebP at quality 80 (sharp drops metadata); `index.json`'s field is `screenshot: { description, reason }`; `--owner-checked` works as in text-request; the over-1 MiB test uses seeded noise; the check run after apply waits for T4's schema.
- 2026-11-07: T4: `screenshot` in index.v1 requires `description` (non-blank) and `reason`; `pnpm check` adds the rule `screenshot-file`, reads the limits from `src/screenshot-request/rules.ts`, and loads sharp only for an entry with a screenshot.webp; a blank `screenshot.reason` is `reason-not-blank`; the T3 apply and removal now pass `pnpm check` in a test.
