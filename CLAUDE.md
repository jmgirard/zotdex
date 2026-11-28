# Zotdex

A community index of Zotero 7+ plugins. See `cairn/DESIGN.md` for purpose and
design.

## Approved page wording

The user approves the site's wording line by line, as in
`cairn/references/plain-words-copy.md`. Approved wording changes only after
the user says yes to the new line. If a review, an audit, or a reviewer
finds a problem in approved wording, write the smallest fix that keeps the
page's tone and clarity. Then show the user the old line, the problem, and
the new line, and apply it only after the user agrees. A precise rule that
does not fit the page's tone goes in `docs/`, not on the page.

## Project tracking (cairn)

This repo uses the cairn plugin. Work goes through its `/cairn` skill:

- **Any request**: `/cairn start`. It handles a trivial edit itself (no
  runtime surface: a typo, a comment, a ROADMAP row), and it plans anything
  else on a branch and takes it to review.
- **Work in flight**: `/cairn resume` picks it up, and `/cairn review` ships it.
- **Status or "what's next"**: `/cairn status`.

Never build on the default branch. Nothing reaches it without the user's
approval at the merge question, or for a trivial edit their request.

Candidates are in `cairn/ROADMAP.md`, and the toolchain commands are in
`cairn/PROFILE.md`. Plans live outside the repo, in the home folder that
`/cairn status` prints. Never record status or TODOs in this file.
