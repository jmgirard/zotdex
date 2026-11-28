# M076: Show the owner on home page rows

**Status:** done (2026-11-02, PR #801 https://github.com/jmgirard/zotero-plugin-index/pull/801)

**Goal:** Each home page row with a GitHub repo shows that repo's owner, so plugins of one name can be told apart.

**Outcome:** The name cell in `site/src/pages/index.astro` shows `<div class="owner" data-owner>By <owner></div>` when
`githubRepo` finds an owner in `upstream?.repoUrl ?? record.repoUrl`, the source link's URL, and no line otherwise. The
line sits outside `[data-name]` and `[data-description]`, so the search does not read it. `.owner` in `Base.astro` takes
`--text-xs`, `--faint`, `nowrap`, and an ellipsis, and `contain: inline-size` keeps a long owner from widening the table.
Fixture `same-name-plugin@example.org` shares First Plugin's name and has a 39-letter upstream owner. README, DESIGN,
and CHANGELOG state the owner.

**Decisions:** none promoted. The fainter owner line, below 4.5:1, is the user's choice at the merge question, over the
recommended `--muted` at the same size, and is a Known issues entry in DESIGN.

**Review:** Claim audit 20 claims, 1 corrected. Four lenses, 18 findings: 5 fixed (trailing-slash test, a true 375 px
measurement, 2 DESIGN wordings, an impossible upstream test case), 2 to new row "Close gaps in the home owner line",
parked, 11 rejected (none edge). No returns. CI passed. Lessons: 5 used M076; the M048 lesson gains the iframe border.
