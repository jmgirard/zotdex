# M095: Publish a license

**Status:** done (2026-11-05, PR #834 https://github.com/jmgirard/zotero-plugin-index/pull/834)

**Goal:** The repository states the terms for reusing its code and its data.

**Outcome:** `LICENSE` holds GitHub's MIT text with `Copyright (c) 2026 Jeffrey Girard`, and `package.json` has `"license": "MIT"`. README's `## License` section puts the code under MIT, except the third-party parts of 16 named files; the facts, categories, and maintainer text under CC0 1.0; and all other text under its author's terms, and it names the data fields that hold that text. An override drawn from an author's text is CC0 only for the maintainer's part. "Using the data" links the section. `site/src/pages/about.astro` adds a last `license` section with `LICENSE_HREF` from `site/src/data.ts` and a credit for the line icons. `Icon.astro` holds the Lucide and Feather notices, and `test/site.test.ts` and two mockup files point to it. The schema is unchanged.

**Decisions:** D-063 (MIT for the code, CC0 for the index's own data work). The third-party sweep was recorded in the milestone file, in git. Named: icon paths from Lucide and Feather, data recorded from Better Notes (AGPL-3.0), MDN and Microsoft examples, part of a Zotero changelog paragraph, and quoted plugin text in three ledgers.

**Review:** Claim audit 41 claims, 12 corrected, 3 more small fixes at the re-read. Four lenses, then one diff-bug reader on the later commits: 40 findings, 23 fixed, 15 rejected, 1 settled by amending AC2, and 1 known issue, with a second known issue from the part of another finding not fixed. No follow-up rows. Two criteria were amended: AC1, as GitHub's license read answered 404 on the branch; and AC2, as README excepts parts of files, not whole files. AC2's second re-audit is a listed stop; the run took the audited text under the user's recorded preference on criterion wording. After the merge, the read printed `MIT` on main, which graduated the row "Read GitHub's license answer after merge". Lessons marked used: 2026-10-27 (M021), 2026-10-28 (M036). None captured, retired, or evicted. The M092 row left the table under terminal-row retention.
