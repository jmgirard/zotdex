# License

The code in this repository is under the [MIT License](../LICENSE), except the
third-party parts of the files that this page names. A code comment counts
as code.

The facts that the index gathers are under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). So are its
categories and the text that a maintainer wrote. The facts, the override text,
and the paid-service notes are in the published data file, `v1/plugins.json`,
and in the entries under `plugins/`. The categories are in
`src/site/categories.ts` and on the site. The code of that file stays under the
MIT License.

A maintainer can translate, condense, or copy a description override from an
author's text. CC0 then covers only the maintainer's own part of that override.
The author's part keeps the author's terms.

All other text keeps its author's terms. That text is plugin names and
descriptions, GitHub About text, and text that an owner asked for. The index
gives no license for it. In the data file, this text is in `upstream.name`,
`upstream.description`, and `upstream.repoDescription`, and an override's
`value` and `reason` can hold it. The entries, the test files, the README,
and the files under `docs/` can also hold or quote it.

These files hold parts from a third party. Those parts keep their source's
terms, and the rest of each file follows the terms above:

- `site/src/components/Icon.astro`, `test/site.test.ts`,
  `cairn/mockups/redesign-2026-10-29/mockup.js`, and
  `cairn/mockups/redesign-2026-10-29/index.html`: icon paths from
  [Lucide](https://lucide.dev), under the ISC License, and from the Feather
  icons that Lucide includes, under the MIT License. `Icon.astro` holds both
  notices, and the other three files point to it. The Zotdex logo is the
  index's own drawing, in `src/site/logo.ts`, under the same terms as the
  index's code.
- `test/fixtures/upstream/better-notes.json`,
  `test/fixtures/build/plugins/Knowledge4Zotero@windingwind.com/meta.json`,
  `test/add-plugin.test.ts`, and `test/upstream.test.ts`: data or text recorded
  from [Better Notes](https://github.com/windingwind/zotero-better-notes), whose
  repository is under AGPL-3.0.
- `cairn/references/mozilla-toolkit-version.md` and `test/version.test.ts`:
  examples from MDN's
  [Legacy Version Formats](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version/format)
  page. The first file also quotes sentences from that page.
- `cairn/references/microsoft-naming-a-file.md` and
  `cairn/references/mdn-nth-child.md`: short examples from the Microsoft and MDN
  pages that each file cites. The MDN file also rewords a sentence closely.
- `test/build.test.ts`: part of a paragraph from Zotero's changelog pages, such
  as the [Zotero 9.0 Changelog](https://www.zotero.org/support/9.0_changelog).
- `cairn/references/description-ledger.md`,
  `cairn/references/description-ledger-2026-11-03.md`, and
  `cairn/references/paid-service-sweep.md`: quotes from plugin descriptions and
  READMEs.
