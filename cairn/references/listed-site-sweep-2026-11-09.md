# Which listed plugins have a listed site built in, on the data of 2026-11-09 (M119)

**Provenance.** Ingested 2026-11-09 by M119 from the deployed `v1/plugins.json`
of that day. It also reads each matched plugin's README and settings files on
GitHub, with `gh api`, at the commits named below. The rulings come from the five
source notes that `sites.json` cites.
Pagination: none.
Extraction: a 2026-11-09 snapshot, and the READMEs and settings files can change after it (observed 2026-11-09).

**Scope.** This page records one sweep under the fifth removal ground. It is no
source summary and no check, and it reads no plugin's code. A plugin that this
page does not list was not read, and that says nothing about it. This is a
reference, not an authority: status lives in `ROADMAP.md`, decisions in
`DECISIONS.md`, and architecture in `DESIGN.md`.

**Evidence snapshot.**

- Data: `https://zotdex.jmgirard.com/v1/plugins.json`, `generatedAt`
  2026-11-09T16:32:17.108Z, 754 records. The gitignored shelf keeps a copy as
  `sources/plugins-data-2026-11-09.json` (observed 2026-11-09).
- READMEs and settings files: each repo's default branch at the commit in the
  table below, read on 2026-11-09 (observed 2026-11-09).

## Pattern

The sweep reads five texts of each record: the manifest name, the manifest
description, the GitHub description, the repository name, and a description
override. If one of them names a site in `sites.json`, the record matches.
"Names" is the bot's own rule, `sitesNamedIn` in `src/check/sites.ts`. It
splits the text into runs of the letters a to z and digits. Some runs in a
row must then join to the site's name with its own runs joined. For example,
`Sci-Hub` gives `scihub`, and `Anna's Archive` gives `annasarchive`. The deployed data holds no topics, so
this sweep reads none. The sites file was Sci-Hub alone for the first pass.
Anna's Archive came from reading the matches, and a second pass with both
sites found the same six records.

## Matches and verdicts

`yes` means that a listed site is built in by the definition in
`docs/requests.md` "A listed site built in". Every match is a yes.

| # | Repo and commit | Fields that matched | Verdict and site | Where it was read |
|---|---|---|---|---|
| L1 | `ethanwillis/zotero-scihub` `f8a27f3` | name, description, GitHub description, repository name | yes, Sci-Hub | `prefs.js` line 1 sets the default address `https://sci-hub.ru/`. README line 43 says the same. |
| L2 | `syt2/zotero-scipdf` `b2831d6` | description, GitHub description | yes, Sci-Hub | README line 25: "Upon first installation, the plugin will come pre-configured with some common Sci-Hub sites." |
| L3 | `0xc1c4da/zotero7-scidb` `b4b1813` | description override | yes, Anna's Archive | `addon/prefs.js` line 3 sets the default endpoint `https://annas-archive.se/scidb/`. README line 6 names Scihub and gives no address. |
| L4 | `chen7447/sci-download-for-zotero` `e4fa6f5` | description, GitHub description | yes, Sci-Hub | README line 20: "内置 10 个 Sci-Hub 镜像站" (10 built-in Sci-Hub mirror sites). |
| L5 | `dnnunn/zotero-scihub-fetcher` `06500cf` | description, GitHub description, repository name | yes, Sci-Hub | `addon/prefs.js` line 3 sets the default mirror `https://sci-hub.mksa.top`. README line 36 says the same. |
| L6 | `fdossi/zotfetch` `0c3bcbc` | description override | yes, Sci-Hub | README line 91: "ZotFetch tries its own Sci-Hub mirrors for items with a DOI." |

L1 also sets a default Sci-Net address (`prefs.js` line 3). L6's README
changelog for v1.4.0 (line 253) says "Sci-Hub integration removed from the
plugin entirely", and its settings files name no Sci-Hub address. But the
README's Features list (line 17) and its "Sci-Hub and Sci-PDF" section (line
91) say that it uses Sci-Hub now. The verdict rests on that text, and its
removal issue names the conflict.

## Sites the matches use

| # | Site | Rulings | Count |
|---|---|---|---|
| S1 | Sci-Hub | US 2017 default judgment, FR 2019 blocking order, IN 2025 blocking order | 3 countries: listed |
| S2 | Anna's Archive | NL 2024 blocking order, US 2026 default judgment | 2 countries: listed |
| S3 | Sci-Net (`sci-net.xyz`, L1) | IN 2025 blocking order | 1 country: left out |

S3 is a separate service of Sci-Hub's operator. She argued in the Delhi case
that it is a separate project, so it does not count as Sci-Hub under a new
name. The session found no ruling against it outside India (observed
2026-11-09). L1 is a yes on S1 alone.

## Disposition

Each of L1 to L6 is removed under the fifth ground, with a `delisted.json`
record and a removal issue (M119). S1 and S2 are in `sites.json`, and S3 is
left out until a court in a second country rules against it.
`test/sites.test.ts` locks the two-country rule.
