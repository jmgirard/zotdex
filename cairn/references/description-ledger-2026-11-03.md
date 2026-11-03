# description-ledger-2026-11-03: the description gaps in the two deployed data files of 2026-11-03 (M089, M090)

**Provenance.** Ingested 2026-11-03 by M089 from a run of `pnpm description-gaps` at commit `a2066a9`, after M088 and before any new override. Its input was the shelf file `cairn/references/sources/plugins-data-2026-11-03.json`. Four Opus subagents then read each listed plugin's files on GitHub and drafted the overrides, and the session read each draft.
Pagination: —.
Extraction: a 2026-11-03 snapshot, and the deployed data and the READMEs can change after it — observed 2026-11-03.

**Scope.** This page records the ledger that M089 asks for. It lists each description gap in one data file, the disposition of each, and a mark for each category that an override adds. The section "Later gaps (M090)" does the same for a second data file of the same day. It is not a source summary, and it builds no checker. The command in `src/site/description-gaps.ts` and its tests in `test/description-gaps.test.ts` hold the rule. This is a reference, not an authority. Status lives in `ROADMAP.md`, decisions in `DECISIONS.md`, and architecture in `DESIGN.md`. `description-ledger.md` holds the same record for the data of 2026-10-31.

**Evidence snapshot.**

- Data file: `generatedAt` 2026-11-03T14:25:58.649Z, SHA-256 `b66c7ab34e9215651fe30a28467b21ace9c32000089ac9ca2abf3e9e29cea80b`, 736 records — observed 2026-11-03.
- The run printed 80 lines: 15 `missing`, 47 `cjk`, and 18 `short` — observed 2026-11-03.
- Each top-level file whose name starts with README, ignoring case, on each plugin's GitHub default branch. All 80 repos had at least one — observed 2026-11-03.
- `gh issue list --label text-change --state all` listed no issue, so no owner's removal applies to a listed plugin — observed 2026-11-03.
- Second data file, for M090: `generatedAt` 2026-11-03T22:05:15.306Z, SHA-256 `2972c80c6c7dda51596efd55af822b8ca090e25f6e785fde31d3325b843d3b18`, 736 records, all with an `upstream` block, on the shelf as `cairn/references/sources/plugins-data-2026-11-03b.json` — observed 2026-11-03.

## How a row gets its disposition

The case is the one that `pnpm description-gaps` named. If an upstream file says what the plugin does, the disposition is `override`. If neither the manifest, the GitHub text, nor the default-branch README says it, the disposition can be `kept`. An `override` row has a `description` override with no `version` in its `plugins/<id>/index.json`. The shown column is the text that the site shows without the override. The source column names the file that the override text comes from, and whether the text was condensed from English or translated by hand. Each override's `reason` gives the case of each upstream text.

## Ledger

| # | Plugin id | Case | Shown text | Disposition | Source |
|---|---|---|---|---|---|
| G1 | `ZoteroExcerpt@fanyingfx.com` | missing | (none) | override | src/modules/popup.ts, condensed (README.md is the unchanged template) |
| G2 | `ai-batch-reader@example.com` | cjk | 用同一个 Prompt 独立阅读多篇 Zotero PDF，并把回答分别保存到各自条目的笔记。 | override | README.md, translated |
| G3 | `annotation-filter@zhongrubo.github.io` | short | Filter reader annotations by type. | override | README.md, translated |
| G4 | `annotationmanage@zknu.edu.cn` | cjk | zotero-annotation-manage Zotero的笔记整理 | override | README.md, translated |
| G5 | `ask-my-paper@euclpts.com` | missing | (none) | override | README.md, condensed |
| G6 | `authorbrowser@junting.li` | short | Zotero Author Browser pannel | override | README.md, condensed |
| G7 | `bilingual-reader@zotero.local` | cjk | Zotero 10 阅读模式 PDF 段落中英对照翻译 | override | README.md, translated |
| G8 | `break-pdf@ryon.ren` | missing | (none) | override | README.md, condensed |
| G9 | `ccf-rank@euclpts.com` | cjk | 用于显示 CCF 排名与被引次数的 Zotero 插件 | override | README.md, translated |
| G10 | `ccfa@thanejoss.github.io` | cjk | 在 Zotero 文献列表显示 CCF A 类期刊与会议简称（2026 第七版目录）。 | override | README.md, translated |
| G11 | `chartero@volatile.static` | short | Charts for Zotero | override | README.md, condensed |
| G12 | `chatgpt-sidebar@zotero.local` | cjk | Zotero 阅读界面中的 ChatGPT 网页侧栏：选文解释、PDF 全文提问，可选 Chrome 本机登录连接，无需 API key。 | override | README.md, translated |
| G13 | `close-to-tray@zotero-exit.local` | cjk | 点击关闭按钮时将 Zotero 隐藏到 Windows 系统托盘。 | override | README.md, translated |
| G14 | `collection-breadcrumb@informalgit.github.io` | cjk | Zotero 分类导航栏：在左侧收藏夹栏显示当前分类的完整层级路径，支持点击跳转 | override | README.md, translated |
| G15 | `cychen.stats@outlook.com` | short | Quick Look for Zotero 7. | override | README.md and bootstrap.js menu label, condensed |
| G16 | `date-from-last-modified@iris-advies.com` | missing | (none) | override | README.md, condensed |
| G17 | `debug-log@iris-advies.com` | missing | (none) | override | README.md, condensed |
| G18 | `display-title-alias@local` | cjk | Zotero 标记标题公开仓库 | override | README.md, translated |
| G19 | `docboxtrans@docread.local` | cjk | 在 Zotero 阅读器中划词翻译，移植 DocBoxTrans 的翻译引擎与「上下文增强翻译」。 | override | DocBoxTrans-Zotero/README.md, translated |
| G20 | `filetrans@euclpts.com` | cjk | 在 Zotero 中一键发起 FT AI 版全文对照翻译，并将所选结果导入原条目。 | override | README.md, translated |
| G21 | `geyi-zotero-translator@geyi.net` | cjk | 格译 Geyi 的 Zotero 插件：右键条目翻译其中的 PDF，保留原版式或 AI 重排，可输出双语对照，译文作为子附件挂回原条目 | override | README.md and addon/manifest.json, translated |
| G22 | `hjfy-pdftranslate@hjfy.top` | cjk | 幻觉翻译Zotero插件 | override | README.md, translated |
| G23 | `hover-translate-eudic@zotero-plugins.dev` | cjk | Hover Translate Eudic：鼠标悬停单词即翻译，复用 Translate for Zotero 引擎，支持欧路词典、墨墨背单词、扇贝单词与本地生词表同步。 | override | README.md, translated |
| G24 | `ima-zotero-sync@github.com.zhaox` | cjk | 同步zotero附件到ima知识库 | override | README.md, translated |
| G25 | `inkbridge@maipeng.com` | cjk | Zotero中文翻译插件，依赖本地部署的翻译模型 | override | README.md, translated |
| G26 | `knode-plugin@youngerinfo.com` | short | Sync Zotero item into Knode | override | README.md, translated |
| G27 | `lcsc-datasheets@local.example` | cjk | 将立创商城器件数据手册、商品参数和版本日期保存到 Zotero。 | override | README.md, translated |
| G28 | `litmtrans@srt117.github.io` | cjk | 全文对照翻译、AI对话、思维导图、智能体MCP、Markdown转换、公式Latex提取 | override | README.md, translated |
| G29 | `marginalia@anthropic.com` | cjk | Zotero AI 聊天助手，支持与论文和批注进行智能对话 | override | README.md, translated |
| G30 | `mineru-parse@local` | cjk | Mineru PDF 解析到笔记 | override | README.md, condensed |
| G31 | `ninja@fluctus.cc` | short | A tidy toolbox | override | README.md, condensed |
| G32 | `paper-companion@local` | cjk | 在 Zotero 中连续阅读问答、划词翻译、记录 Markdown 笔记、整理重点和复习生词。 | override | README.md, translated |
| G33 | `paperplanex@windlx` | cjk | Paper Plane X 是一个面向科研阅读、论文处理和综述写作的本地优先工作台。它把 PDF 解析、结构化论文抽取、事实核查、项目文件、文献检索和外部 Agent 工具串成一条可复用的研究流水线。 | override | paper_plane_x_zotero/README.md, translated |
| G34 | `pdf-translate@thejieee.github.io` | cjk | Zotero 划词翻译插件：选中 PDF/EPUB 文本 → 悬浮按钮 → 译文卡片（Google 免费接口 / MyMemory / OpenAI 兼容接口） | override | README.md, translated |
| G35 | `pdfocrforzotero@example.com` | cjk | 开装即用：在 Zotero 内用 RapidOCR 把扫描 PDF 做成可搜索、可选择的 PDF。无需 Python / Tesseract。 | override | README.md, translated |
| G36 | `readai@hu-berlin.de` | short | Zotero ReadAi | override | addon/locale/en-US addon.ftl and preferences.ftl, condensed; README.md for status |
| G37 | `readerc@readerc.local` | cjk | Zotero 9 英文 PDF 生词悬浮中文释义插件：按上下文选义、悬浮即显、Backspace/Delete/侧键标记熟词 | override | README.md, translated |
| G38 | `reading-bilingual@lrz.org` | cjk | 专为 Zotero 10 阅读模式打造的沉浸式中英双语对照翻译插件，支持自定义 API 接口、多服务商与学术级排版。 | override | README.md, translated |
| G39 | `rebootero@chen7447.github.io` | cjk | Zotero 插件：文件菜单「退出」下方添加「重启 Zotero」按钮 | override | README.md, translated |
| G40 | `remarkable@damken.net` | missing | (none) | override | README.md, condensed |
| G41 | `retainpdf-translate@zcode.local` | cjk | 用 RetainPDF 本地服务自动翻译新抓取的 PDF 全文，并把译文 PDF 挂到对应条目下。 | override | README.md, translated |
| G42 | `rule-outline@local.zotero` | cjk | 本地规则生成中文 PDF 大纲，支持预览编辑、临时备份、原附件写入及批注和同步关系保留。 | override | README.md, translated |
| G43 | `sentence-hover@local` | cjk | 句译随行：Zotero PDF 悬停整句翻译与中英文单词联动高亮 | override | README.md, translated |
| G44 | `translateAnt@sscc.sscc` | short | zotero-translate-ant | override | addon/locale/en-US/addon.ftl, condensed |
| G45 | `vocab-book@custom.zotero.org` | cjk | 多功能单词本 \| Zotero 划词与批量收录、可选翻译、原词定位、闪卡复习、Anki 导出、文献阅读管理与笔记。 | override | README.md, translated |
| G46 | `wmu-journal-tags@wmu.local` | cjk | 展示温州医科大学科技类共识期刊目录（T系列、Q系列）分类标签的 Zotero 插件 | override | README.md, translated |
| G47 | `wordtranslator@example.com` | cjk | Zotero 插件：在 PDF 阅读器中划词翻译单词和短语，管理个人单词本，支持可配置的 AI 翻译 API。 | override | README.md, translated |
| G48 | `yonghao.zou@epfl.ch` | short | Sync files to tablet | override | README.txt and manifest description, condensed |
| G49 | `zemble@cosmik.network` | short | Zotero Plugin for Semble | override | docs/index.html, condensed |
| G50 | `zhinfo@zotero.local` | cjk | Zotero 插件：在条目信息面板加入「中文标题」与「中文摘要」，打开条目时自动翻译填入（MyMemory / OpenAI 兼容大模型 / DeepL / Google） | override | README.md, translated |
| G51 | `zmta-update-metadata@iiwenwen` | cjk | Zotero 10 元数据更新插件：逐项审核、安全更新与最近批次撤销 | override | README.md, translated |
| G52 | `zodh@fatsource.com` | short | a odh wrapper for Zotero | override | README.md, condensed |
| G53 | `zotassets@yunze.dev` | cjk | 管理 Zotero 附件的资产角色（正文 PDF、补充材料、数据、代码等），自动分类文库，并按模板安全重命名 PDF。兼容 Zotero 7 至 10。 | override | README.md, condensed |
| G54 | `zotbox@scigreat.com` | short | Make Zotero Better and Better | override | README.md, translated |
| G55 | `zotero-ai-assistant@jetxa.github.io` | missing | (none) | override | README.md, condensed |
| G56 | `zotero-close-to-tray@example.com` | cjk | 解决Windows用户使用Zotero在点击关闭后直接退出的烦恼，使其能够最小化到系统托盘 | override | ReadMe_en.md, condensed |
| G57 | `zotero-deepseek@example.com` | cjk | 接入 DeepSeek 大模型的 Zotero 9 插件：文献智能总结、论文全文问答、多篇对比、阅读笔记整理、划词翻译与请教。 | override | README.md, translated |
| G58 | `zotero-figure-extract@achuan` | cjk | 使用百度 PaddleOCR-VL 1.6 识别图、表和公式，支持独立开关。 | override | README.md, translated |
| G59 | `zotero-lit-ai-matrix@tenor-john.github.io` | missing | (none) | override | README.md, condensed |
| G60 | `zotero-mcp-plugin@autoagent.my` | cjk | It's a plugin extension in Zotero. Zotero MCP Plugin enables integration between AI assistants and Zotero through MCP. Zotero MCP Plugin 是一个 Zotero 插件，通过 MCP协议实现 AI 助手与 Zotero深度集成。插件支持文献检索、元 数据管理、全文分析和智能问答等功能，让 Claude、ChatGPT 等 AI 工具能够直接访问和操作您的文献库。 | override | README.md, condensed |
| G61 | `zotero-open-pdf@iris-advies.com` | missing | (none) | override | README.md, condensed |
| G62 | `zotero-pmcid-fetcher@iris-advies.com` | missing | (none) | override | README.md, condensed |
| G63 | `zotero-reading-room@wuxinxin27.github.io` | cjk | 本地优先的论文预读、证据核查与阅读状态管理。 | override | README.en.md, condensed |
| G64 | `zotero-research@local.invalid` | cjk | Zotero 10 网页 AI 阅读侧栏：网页中继 / API 直连 / MinerU 深度解析 / 知识沉淀 | override | README.md, translated |
| G65 | `zotero-translator-next@echouniverse.io` | cjk | Zotero 文献翻译插件：格式优化 + 多渠道翻译 + 翻译历史 + AI 总结 | override | README.en.md, condensed |
| G66 | `zotero-tray@local` | cjk | Windows 托盘插件，适用于 Zotero 10：关闭到托盘、恢复与激活、右键正常退出；纯源码，无附带 EXE/DLL。 | override | README.md, translated |
| G67 | `zotero-wikicite@wikidata.org` | short | Citations metadata support for Zotero | override | README.md, condensed |
| G68 | `zotero7-scidb@dev.null` | missing | (none) | override | README.md, condensed |
| G69 | `zotero@bibsonomy.org` | short | Connect Zotero to BibSonomy | override | README.md, condensed |
| G70 | `zotero@wilddata.cn` | short | Zotero Suppr | override | README.md, translated |
| G71 | `zoteroScholar@my.com` | missing | (none) | override | README.md, condensed |
| G72 | `zoteroautoccftagplugin@tobyshi.com` | missing | (none) | override | README.md, translated |
| G73 | `zoterochatbot@foxmail.com` | short | ChatGPT in Zotero | override | README.md, condensed |
| G74 | `zoterocopyanything@example.com` | missing | (none) | override | README.md, condensed |
| G75 | `zoteroif@qnscholar` | short | Update IF for Zotero Items. | override | README.md, translated |
| G76 | `zoteromagic@zoterocn.com` | cjk | 全文翻译（支持MinerU，pdf2zh，dox2x）。AI智能文献总结，AI列文献矩阵。7天免费试用。 | override | README.md, translated |
| G77 | `zoteropaperagent@github.com` | missing | (none) | override | README.md and doc/3_0_Introduction_EN.md, condensed |
| G78 | `zoteropick2anki@soyami.github.io` | cjk | Zotero 划词词典插件：PDF/EPub 阅读器里选中英文单词 → 5 个在线词典源聚合释义 → 一键通过 AnkiConnect 写入 Anki 生词卡 | override | README.md, condensed |
| G79 | `zoteropreview@carter-tod.com` | short | Citation preview pane for Zotero. | override | README.md and manifest description, condensed |
| G80 | `zoteroragflow@yourname.com` | cjk | 连接 Zotero 和 RAGFlow，用于构建知识库并进行知识问答 | override | README.md, translated |

## Disposition

All 80 rows are `override`, and none is `kept`. After these overrides, `pnpm description-gaps` over the same file prints no gap.

Notes from the reads. G1's README, locale files, and docs are unchanged template text, so its text comes from the code of its button. G33's root README covers a whole workbench, so its text comes from the README of the plugin's own repo, a submodule. G19's root README also covers a desktop app. The READMEs of G36 and G44 do not say what the plugin does, so their texts come from locale files. G36's text says that the plugin is not yet usable. G76 keeps to what its README states: a 7-day trial and a purchase link, as `paid-service-sweep.md` records. G63's README marks some features as unreleased, so its text leaves them out.

The texts leave out a README's assurances about privacy and safety, such as "no network access". The index cannot vet a plugin (D-051), and such a text reads as the index's own claim. G77's text leaves out the README's QR code login step, since its `doc/3_1_Introduction_EN.md` says that version 3.1.0 removed the Kimi web crawler.

## Category changes

The site's categories (D-037) read the shown description, so the new override texts changed the categories of some plugins. A comparison of `categories` with and without each override, on the default branch's `exclude` lists at `a2066a9`, gave 53 added categories on 36 plugins. It also took `other` from `zemble@cosmik.network`. A hand read marked each one by the rule of `category-ledger.md`. The read found 32 right and 21 wrong. Each wrong one is now on its category's `exclude` list in `src/site/categories.ts`. A text that uses a model for translation is right under `ai`, as `category-ledger.md` marks such plugins. The first read here marked 6 such assignments wrong, and the M089 review reversed them.

- Right: ai-batch-reader (ai, attachments), authorbrowser (metadata), bilingual-reader (ai, pdf-reading), ccf-rank (organization), ccfa (organization), display-title-alias (organization), docboxtrans (ai), marginalia (translation), paper-companion (ai), pdf-translate (notes), readerc (ai), reading-bilingual (ai, pdf-reading), translateAnt (notes), vocab-book (organization), zemble (export, organization), zotbox (ai, translation), zotero-ai-assistant (translation), zotero-figure-extract (export), zotero-lit-ai-matrix (notes, export), zotero-mcp-plugin (notes, metadata, organization), zotero@wilddata.cn (ai), zoteroautoccftagplugin (ai), zoterochatbot (translation, citations).
- Wrong, excluded, with the words that matched:
  - ai: zotero-figure-extract ("AI Studio", a key source).
  - translation: lcsc-datasheets ("translator", a Zotero import translator).
  - notes: lcsc-datasheets ("parameter note"), yonghao.zou ("no other features such as annotation extraction").
  - metadata: ima-zotero-sync ("skipping duplicates"), zemble ("URL or DOI"), zotero-lit-ai-matrix ("item metadata", which it only shows), zotero7-scidb ("items with a DOI").
  - attachments: bilingual-reader ("PDF attachment"), mineru-parse ("PDF attachments"), retainpdf-translate ("OCR token"), zotero@bibsonomy.org ("PDF attachments"), zoteroragflow ("attachments").
  - export: annotationmanage (exports to Zotero notes), bilingual-reader (a PDF attachment), paper-companion ("Markdown notes" in its panel), zotero-wikicite (syncs citations with Wikidata), zoterocopyanything ("synced locally").
  - organization: docboxtrans ("feed earlier translations").
  - interface: break-pdf ("tabs opened"), chartero ("overview tab").

## Later gaps (M090)

The first data file holds 39 records with no `upstream` block, and the command skips such a record. That build did not reach 38 of them (`not-read`), and one request failed. The second data file reads them all, and the command then prints 6 gaps with M089's overrides in place. The first build did not read these 6, and they are not new plugins. A later unread plugin can hide a gap in the same way. Each is an `override`, and after them the command prints no gap over the second file.

| # | Plugin id | Case | Shown text | Disposition | Source |
|---|---|---|---|---|---|
| G81 | `zoterotransnator@euclpts.com` | short | Zotero PDF Translate Terminator | override | README.md, condensed |
| G82 | `zotfetch@edslab.research` | short | ZotFetch: Batch PDF downloader | override | README.md, condensed |
| G83 | `zotfetch@nikhilweee.me` | short | Fetch missing attachments | override | README.md, condensed |
| G84 | `zoturead@zotero.org` | cjk | 今日优读（http://uread.today/），主要搭建一个知识平台以及读书辅助工具，提供书籍搜索，中图分类和学科搜索。 | override | README.md, translated |
| G85 | `zotwanglele@wanglele.com` | cjk | Zotero 10 AI 全能插件 By Wanglele | override | README.md, translated |
| G86 | `zotxt@e6h.org` | short | Plain text extensions for Zotero | override | README.md, condensed |

The session read these READMEs. A comparison on the second file, with the default branch's `exclude` lists, gave 9 added categories on 4 plugins and took none away. The read found 7 right and 2 wrong, by the rule of `category-ledger.md`.

- Right: zoterotransnator (ai, notes, attachments), zoturead (metadata, rankings), zotwanglele (translation, notes).
- Wrong, excluded, with the words that matched:
  - export: zoterotransnator ("Markdown notes", notes inside Zotero), zotxt ("such as Markdown", a kind of file its utilities read).

## Open questions

- Plugins added after the second data file are not in the ledger, nor are shown texts in other languages, which the command does not see. The candidate row "Fill description gaps on new plugins" holds them — observed 2026-11-03.
- Some descriptions hold CJK text but have a CJK share below 0.5. They get no row, since no rule covers them (D-038) — observed 2026-11-03.
- A record with no `upstream` block gets no row, since the command skips it. The second data file has none — observed 2026-11-03.
