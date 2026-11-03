# repeat-id-ledger: repos that the bot refused because another repo lists their add-on id (M085)

**Provenance.** Ingested 2026-11-03 by M085 from the logs of the `Discover plugins` workflow and the GitHub repository API.
Pagination: none.
Extraction: a snapshot of 2026-11-03. Stars can change after it, and logs expire — observed 2026-11-03.

**Scope.** This page records the count that the candidate row "Review repeats of a listed add-on id" asked for. It also records the read behind the test of the `replaces-entry` hold. It builds no checker. Status lives in `ROADMAP.md`, decisions in `DECISIONS.md`, and architecture in `DESIGN.md`.

## The read

The read date is 2026-11-03. The search covers all 30 `Discover plugins` runs that GitHub lists on that date, from run `40303090895` of 2026-10-26 to run `41540895938` of 2026-11-02. In each run's log, the search takes each report item whose `failure` is `entry-exists`. It found 34 such refusals of 19 distinct pairs of refused repo and add-on id. 7 of the 34 say that an open pull request adds the id, and all 7 are the `max101johnston/embeddingzotero` pair. The others say that the index has the id.

The test has three parts. The refused repo is older than the listed repo. It has at least 20 stars. It has at least 10 times the listed repo's stars. The table shows the listed repo as it stood before M085 moved any entry. Each repo answered the read, so no fact is "not read".

| Add-on id | Refused repo | Stars, made | Listed repo | Stars, made | Passes |
|---|---|---|---|---|---|
| `pdf2zh@guaguastandup.com` | `guaguastandup/zotero-pdf2zh` | 8087, 2025-01-14 | `BluesilveEmperor/PDFTranslate-Zotero` | 0, 2026-10-26 | yes |
| `zoteroshortdoi@wiernik.org` | `bwiernik/zotero-shortdoi` | 1633, 2017-11-29 | `reginalluna/zotero-doi-manager` | 6, 2026-07-10 | yes |
| `beaver@jlegewie.com` | `jlegewie/beaver-zotero` | 275, 2025-02-10 | `chgwan/beaver-zotero-local` | 1, 2026-10-21 | yes |
| `zoteropreview@carter-tod.com` | `dcartertod/zotero-plugins` | 210, 2021-03-23 | `groele/ZoteroPreview` | 0, 2025-10-21 | yes |
| `zoteroshortdoi@wiernik.org` | `5ht2c/zotero-shortdoi` | 0, 2025-03-28 | `reginalluna/zotero-doi-manager` | 6, 2026-07-10 | no |
| `zoteroshortdoi@wiernik.org` | `jwow-schneider/zotero-shortdoi` | 1, 2026-04-11 | `reginalluna/zotero-doi-manager` | 6, 2026-07-10 | no |
| `zoteroshortdoi@wiernik.org` | `leven-comeon/zotero-plugins` | 0, 2026-08-01 | `reginalluna/zotero-doi-manager` | 6, 2026-07-10 | no |
| `addontemplate@euclpts.com` | `delinqu/ipec-paper-group` | 2, 2025-10-10 | `windingwind/zotero-plugin-template` | 854, 2022-08-19 | no |
| `addontemplate@euclpts.com` | `northword/zotero-plugin-test` | 0, 2024-08-24 | `windingwind/zotero-plugin-template` | 854, 2022-08-19 | no |
| `codex-bilingual-reader@geyi.net` | `fangchenghao/codex-bilingual-reader` | 0, 2026-10-20 | `Mengqi97/codex-bilingual-reader-for-zotero` | 23, 2026-08-17 | no |
| `pdf2zh@guaguastandup.com` | `xiling951/zotero-` | 0, 2026-10-20 | `BluesilveEmperor/PDFTranslate-Zotero` | 0, 2026-10-26 | no |
| `zotero-mcp-plugin@autoagent.my` | `max101johnston/embeddingzotero` | 1, 2026-09-22 | `cookjohn/zotero-mcp` | 1260, 2025-08-14 | no |
| `support@noedgeai.com` | `noedgeai/doc2xzoteroplugin9` | 3, 2026-04-13 | `NoEdgeAI/Doc2XZoteroPlugin` | 10, 2025-02-28 | no |
| `codex-sidebar@zotero.local` | `rtliang/zotero-codex` | 9, 2026-09-14 | `anka-afk/PaperBridge` | 0, 2026-10-27 | no |
| `zotero-ai-butler@github.com` | `steven-jianhao-li/zotero-ai-butler-fang` | 1, 2026-06-26 | `steven-jianhao-li/zotero-AI-Butler` | 1857, 2025-10-29 | no |
| `zotero-llm@github.com.yilewang` | `tcxm/llm-for-zotero-ui` | 1, 2026-07-18 | `yilewang/llm-for-zotero` | 3493, 2026-01-29 | no |
| `marginmind@github.vastronghq.com` | `vvvastrong/marginmind` | 4, 2026-04-05 | `vastronghq/MarginMind` | 4, 2026-04-05 | no |
| `zotero2eagle@euclpts.com` | `yueneiqi/zotero2eagle` | 9, 2025-08-26 | `LuckYang1/zotero2eagle` | 5, 2026-04-11 | no |
| `aidea@visterainer` | `zbhou2002/iris-zotero` | 1, 2026-09-08 | `Visterainer/aidea-zotero` | 147, 2026-03-04 | no |

## The maintainer's choice for the pairs that pass

The maintainer chose these at the M085 question set, on 2026-11-03.

- `pdf2zh@guaguastandup.com`: moved to `guaguastandup/zotero-pdf2zh`. On 2026-11-03, the repo's head was `5dd2eaf019f71266764c269bbd2104b559ae95cf`, and `pnpm add-plugin --out` wrote the `meta.json` from that read. Its newest release is `v4.1.8`, of 2026-10-30, against `v1.1.0`, of 2026-10-28, for the listed repo. The listed repo's README says that it goes with its maker's own fork of PDFMathTranslate.
- `beaver@jlegewie.com`: moved to `jlegewie/beaver-zotero`. On 2026-11-03, the repo's head was `8b7fa5b4fc7a16769de95001f7fb0d4ccdf46342`, and `pnpm add-plugin --out` wrote the `meta.json` from that read. Its newest release is `v0.26.2`, of 2026-10-29, against `v0.25.4`, of 2026-10-25, for the listed repo. The listed repo's README calls itself a fork of it.
- `zoteroshortdoi@wiernik.org`: stays with `reginalluna/zotero-doi-manager`, whose README says that it continues `bwiernik/zotero-shortdoi`. Its newest release is `v2.2.0`, of 2026-08-20, against `v1.5.0`, of 2024-08-09.
- `zoteropreview@carter-tod.com`: stays with `groele/ZoteroPreview`, whose README calls itself a fork for compatibility. Its newest release is `v2.0`, of 2025-10-21, against `0.7.8`, of 2024-09-29.

When the bot reads a refused repo again, it can open a held pull request for each of the two that stay. Closing that pull request ends it.

## What the table leaves open

Two pairs fail the test on stars alone, with the refused repo older: `rtliang/zotero-codex` and `yueneiqi/zotero2eagle`. The bot keeps refusing them. The test does not say which repo of such a pair a visitor wants, and no read here settles it.
