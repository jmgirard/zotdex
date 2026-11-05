# zotero-plugins-page — how Zotero says to install a plugin, and its warning

**Provenance.** Ingested 2026-11-05 by M096 from https://www.zotero.org/support/plugins.
The agent downloaded it with curl to `cairn/references/sources/` (gitignored), as
`zotero-plugins-page.html`.
Pagination: none. The page's footer reads "Last updated 2026-05-05".
Extraction: verified 2026-11-05 against the downloaded file, by a search of its text with the tags removed.

**Citation.** Zotero. "Plugins". Zotero Documentation. https://www.zotero.org/support/plugins.

**Role.** Settles the install steps and the warning that the plugin page's note and About's `installing`
section state. If this page changes its steps, those two texts need a new read.

## Extracted values

- Steps, in this page's order: download the `.xpi` file to your computer, open "Tools → Plugins" in Zotero, and drag the `.xpi` onto the Plugins window.
- Warning: "Be aware that plugins have full access to your Zotero and your computer."
- Advice: install plugins only from developers you trust.
- Firefox: the page names Firefox only for Zotero's browser extensions. It says nothing on saving an `.xpi` with Firefox.
- The page says that an official plugin directory is planned. It gives no date.

## Firefox evidence, from other sources

Zotero's page does not settle the Firefox step, so these do, observed 2026-11-05:

- `curl -sIL` on `https://github.com/windingwind/zotero-better-notes/releases/download/v3.3.3/better-notes-for-zotero.xpi` ends in `content-type: application/x-xpinstall` and `content-disposition: inline`. That content type is the one for a browser add-on install.
- README of `windingwind/zotero-better-notes`, line 95, and README of `windingwind/zotero-pdf-translate`, line 21, each tell a Firefox user to right-click the `.xpi` and save it.

- Firefox 158.0, installed on the maintainer's machine: `localization/en-US/browser/browserContext.ftl` in `omni.ja` gives `main-context-menu-save-link` the label "Save Link As…".

No one clicked an `.xpi` link in Firefox for M096. The site text gives the step and states no reason for it.
