# Zotero Plugins Atlas compared with Zotdex (2026-11-14)

Zotero Plugins Atlas is a second community catalog of Zotero plugins. It runs
at `https://zoteroplugins.org`, and its source is the repository
`iliasbeshimov/zoteroplugins.org`. A user named it to the maintainer on
2026-11-14, after the maintainer posted about Zotdex. This note records what
the Atlas is, how its coverage compares with ours, and why we did not find it.
All counts were read on 2026-11-14.

Provenance. Ingested 2026-11-14 in a status session from these sources.
The site pages are the home, About, and How we grade pages of
`https://zoteroplugins.org`, and its `/api/plugins.json`. The repository
files are the README, `pipeline/src/census/sources.ts`, and
`data/census/census.csv` of `iliasbeshimov/zoteroplugins.org`. The GitHub
reads are `gh api` calls for repo metadata and search totals. Our side is
the `plugins/` folder and the discovery log of run 43632180750.
Pagination: none.
Extraction: a 2026-11-14 snapshot, and both sites change daily (observed 2026-11-14).

Scope. This page records one comparison. It is a reference, not an
authority. Status lives in `ROADMAP.md`, decisions in `DECISIONS.md`, and
architecture in `DESIGN.md`.

## Timeline

- The domain `zoteroplugins.org` was registered on 2026-09-25.
- The Atlas grade log starts on 2026-09-26.
- The repository's first commit is from 2026-10-01.
- Zotdex started on 2026-10-24. By that day the Atlas repository had 59
  commits, and one of them was a data refresh from the same morning.

## Why we did not find it

The design interview of 2026-10-24 asked one question about other lists:
does Zotero publish a plugin list? The answer was no, and DESIGN.md records
it as "Zotero publishes no plugin list". Nobody searched for third-party
catalogs, and the tracking files and the git history show no such search.
The zotero-chinese catalog came in with M070 as a data source, not as prior
work.

A GitHub search did not show the Atlas. Its repository has no topics
and 3 stars, and it holds no plugin files, so the discovery bot skips it too.
A web search for a Zotero plugin index probably finds it, but we have no
record of what such a search returned in October.

The Atlas reads our data. Its discovery code reads the repository addresses
in `https://zotdex.jmgirard.com/v1/plugins.json` and says that our facts are
CC0.

## What the Atlas is

The Atlas grades each plugin from A+ to C. The grade comes from a static read
of the code in the latest release. One check asks whether the code is readable
and built from the public source. A second check lists the servers that the
code contacts. A third check finds risky capabilities, for example native
code, launching programs, and reading files. The single worst finding sets
the grade. For an A+, the Atlas installs the release in a fresh copy of
Zotero 10. It clicks through the plugin and records each server that the
plugin contacts.

The Atlas shows these facts without grading them: Zotero versions, what you
need (API keys, accounts, other software), maintenance, and languages. An AI
writes the "What it does" text and the categories. An AI also writes the
"What you'll need" answers, and a second run must support each answer with a
quote. Developers can respond to a card, and the site publishes the response.
A public grade log lists each grade change.

The Atlas also has these parts:

- A Zotero plugin, Zotero Atlas, that finds and installs plugins from the
  catalog inside Zotero.
- Guide pages, for example plugin packs, Zotero 6 replacements, and AI
  plugins without an API key.
- A JSON file of plugin data at `/api/plugins.json`.
- Google Analytics. It is off by default in the EEA, the UK, and Switzerland,
  and on by default in other countries.

Its code is under MIT and its data under CC BY 4.0.

## How it differs from Zotdex

Zotdex's main question is whether a plugin works on your Zotero version. The
Atlas's main question is what a plugin does with your data. Our contract
boundary says that Zotdex does not review plugin code and does not endorse
plugins. A grade from A+ to C is a review and a recommendation, so it is out
of scope for us.

The two sites share some facts. Both show a declared Zotero range, languages,
and maintenance signals. Both run plugins in a real Zotero, but Zotdex records
only whether the plugin starts, in each tested Zotero release. Zotdex also has
a weekly ClamAV scan, a paid-service fact, icons, and screenshots. The Atlas
has none of these as separate facts.

## Coverage

The Atlas data file lists 1,975 plugins. 402 of them have `hidden: true`, and
1,153 have `worksWithCurrentZotero: true`. Zotdex lists 761 plugins.

| Group | Repos |
| --- | --- |
| In both indexes | 754 |
| Only in Zotdex | 7 |
| Only in the Atlas | 1,221 |
| Only in the Atlas, not hidden, works with current Zotero | 481 |

The last row is the gap that matters for Zotdex. The Atlas census file
`data/census/census.csv` names the sources that found each repo. For the 481
repos, the counts are:

| Atlas source | Found | Found by this source only |
| --- | --- | --- |
| GitHub repository search for `zotero in:name,description` | 464 | 347 |
| GitHub code search | 73 | 6 |
| zotero-chinese catalog | 46 | 4 |
| syt2 add-on market list | 41 | 0 |
| GitHub topics | 40 | 0 |
| A research spreadsheet | 16 | 0 |
| Submitted on the site | 6 | 3 |

All 481 repos have at least one release. 260 have no stars, and 81 were
created on or after 2026-10-24.

## Why our discovery misses them

There are two causes.

First, GitHub code search does not index many small repositories. For
example, `chen7447/item-pane-organizer-zotero` has an `addon/manifest.json`
that matches our first code-search query. But that query, limited to the
repo with `repo:`, returns 0 results. Three other sampled repos give the same
result. Our code-search totals are 924 and 454, which are under the API's
cap of 1,000, so the cap is not the cause. Only a repository search finds
these repos. The Atlas runs that search on names and descriptions, and it
splits the creation dates to get past the 1,000-result cap. GitHub reports
32,258 repos for that search, so most results are not plugins. If a repo's
released XPI holds a Zotero manifest, the Atlas keeps the repo.

Second, 74 of the 481 repos are in sources that we already read, the topics
or the zotero-chinese catalog. Some of them are on `delisted.json`, for
example `chen7447/sci-download-for-zotero`. For most of them the bot did not
open a pull request. The bot writes at most 5 entries per run (`--limit`,
default 5). It reads at most 100 repos per run (`--budget`, default 100). If
new plugins arrive faster than that, a backlog builds. The discovery log
does not name a reason for each skipped repo, so this note does not show the
cause for each of the 74.

## Sources we never read

- The syt2 add-on market list,
  `https://raw.githubusercontent.com/syt2/zotero-addons-scraper/publish/addon_infos.json`,
  with 377 entries. It holds 41 of the 481 repos.
- An archive of Zotero's own community plugin page,
  `https://www.zotero.org/support/plugins`, from before Zotero replaced the
  list on 2026-04-14. The Atlas reads the Wayback Machine copy.
- The Atlas data itself. It is CC BY 4.0. Our facts are CC0, so to copy its
  facts into ours we need to give credit. To read only repository addresses
  for discovery, as the Atlas does with ours, does not copy facts.

## Other catalogs found during this check

- `zotero-chinese/zotero-plugins`, which we read since M070. Its description
  now says that updates are paused.
- `syt2/zotero-addons`, an add-on market inside Zotero. Zotdex lists it as a
  plugin.
- `mjthoraval/zotero-plugins-browser`, a static page from 2026-05-19 built on
  the syt2 scraper data.
