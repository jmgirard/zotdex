# M080: Say the index is unofficial and cannot vet plugins

**Status:** done (2026-11-02, PR #805 https://github.com/jmgirard/zotero-plugin-index/pull/805)

**Goal:** Each page of the site and the README say that the index is unofficial, not affiliated with or endorsed by Zotero, and cannot vet the plugins it lists.

**Outcome:** `DISCLAIMER` in `site/src/data.ts` holds "This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists." It replaces the footer's "does not vet" line on every page, as `data-fact="disclaimer"`, and it opens the home page's intro. The About page's last section says the same and gives the reason, and it says that the start test is not a review of plugin code. The About title and the plugin page links now read "How the index reads plugins". README, DESIGN, and CHANGELOG state it. The user asked for one disclaimer in the question set and did not choose a place, so the plan took the footer and home intro, and the merge question named this.

**Decisions:** D-051 records that the pages say the index cannot vet, replacing the footer's does-not-vet line.

**Review:** Full fan-out, all six criteria met. Of 29 findings, 16 were fixed on the branch, 13 rejected, and none went to a row. The fixes include the About reason, the page title, D-051, and tests scoped to the About section. Six lessons named in the plan and two whose traps it met were marked `used M080`, and no lesson was added or removed.
