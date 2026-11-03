// The categories the site sorts plugins into: the index's own grouping, not a fact that a
// plugin's author declares (D-037).
import { type DescriptionRecord, shownDescription } from "./description.ts";
import { appliedValue } from "./version.ts";

// One category. slug is its value in data-categories and ?category=; about says what it
// holds on the About page. pattern runs over each of a plugin's texts (see categories);
// include adds the category to the plugins with those ids, and exclude takes it from them,
// over include and over the pattern.
export interface Category {
  slug: string;
  name: string;
  about: string;
  pattern: RegExp;
  include: readonly string[];
  exclude: readonly string[];
}

// Ids of plugins that let outside AI tools reach the library and run no AI themselves.
const BRIDGES = [
  "autoattach@adolinjonathan-bot.github.io",
  "mcp-rdp@zotero.org",
  "retrieval-index@sit2023.local",
  "zofiles@zofiles.dev",
  "zotero-agent-bridge@zotero-agent",
  "zotero-agentibility@local",
  "zotero-codex-bridge@myang-print.github.io",
  "zotero-codex@local",
  "zotero-declarative-bridge@deep-research.local",
  "zotero-mcp-plugin@autoagent.my",
  "zotero-mcp-plugin@lricher7329.github.io",
  "zotero-reading-bridge@volatile.static",
  "zotron@diamondrill",
];

// The slug of the category of a read plugin that no other category takes (see categories).
export const OTHER = "other";

export const CATEGORIES: readonly Category[] = [
  {
    slug: "ai",
    name: "AI assistants",
    about: "chat with papers, AI summaries and explanations, and AI agents inside Zotero",
    pattern:
      /^(?!.*\bmcp (?:server|bridge)\b).*(?:\bai\b|\bai\d|\bllms?\b|\bgpt|chatgpt|claude|codex|deepseek|gemini|openai|ollama|copilot|(?<!user-)\bagents?\b|\brag\b|retrieval-augmented|\bkimi\b|notebooklm|\bhermes\b|opencode|antigravity|\bchat\b|large language|literature assistant|ragflow|\btl;?dr\b|大模型|人工智能|智能对话)/isu,
    include: [
      "SKR@zotero.org",
      "ask-my-paper@euclpts.com",
      "paper-partner@qinsihan.github.io",
      "remindme@beichenzhao.github.io",
      "zotero-reading-room@wuxinxin27.github.io",
    ],
    exclude: [
      ...BRIDGES,
      "arxiv-marker@lele.dev",
      "arxiv-source-helper@local.research",
      "paperplanex@windlx",
      "rssrch@solvesaint",
      "survey-papers-to-zotero-companion@vincent929-cyber.github.io",
      "treekoala@liusir",
      "weavero@mjthoraval",
      "zontex-bridge@endoretic.github.io",
      "zotero-figure-extract@achuan",
      "zoteropronounce@codex.dev",
      "zpm@zotero-project-manager",
    ],
  },
  {
    slug: "translation",
    name: "Translation and dictionaries",
    about: "translated text and PDFs, bilingual reading, dictionaries, and vocabulary",
    pattern: /(?<!import )translat(?!ors\b)|(?<!编)译|bilingual|双语|dictionar|词典|查词|vocabular|单词|生词/iu,
    include: ["word-learning@zotero.local", "zodh@fatsource.com"],
    exclude: [
      "gbt7714-2025-helper@wangzfof.github.io",
      "lcsc-datasheets@local.example",
      "spellcheckcontext@kirka.local",
      "westlaw-us@mkant18.github.io",
      "zotdupe@hostiuc.com",
    ],
  },
  {
    slug: "pdf-reading",
    name: "PDF reading",
    about: "the PDF reader's view, focus aids, navigation, and text-to-speech",
    pattern:
      /reading guide(?!s)|reading ruler|split.?view|pdf (?:bookmarks?|outlines?)|reading mode|single-page|page view|line focus|line by line|bionic|text-to-speech|\btts\b|read aloud|white margins|horizontal scroll|reader (location )?history|keybindings|eye-care|护眼|dark-mode image|pagination|theorems|in-text citations?|citation hover|rendered (pdf )?pages|reading bookmarks|citation previews|pdf references|while you read|margin detection|skimming|brightness|papers aloud/iu,
    include: [
      "zotero-alt-reader@hyxi.dev",
      "pdfpreview@windingwind.com",
      "zotero-memory-management@unitian",
      "keyword-highlighter@zotero-plugin",
      "center-pdf@dylan.ac",
      "cychen.stats@outlook.com",
      "defn@aadi219.github.io",
      "hide-citation-highlights@jkroes",
      "open-inline-citation@example.com",
      "paper-loom@local.research",
      "pdf-content-flow@dylan.ac",
      "reference-guard@liangliu-nlp.github.io",
      "selection-popup-on-alt@f31.eu",
      "zotero-mark-reader@jin-taiyu.github.io",
      "zotero-var-highlighter@zotero-var-highlighter",
    ],
    exclude: ["arch-note-zotero-deepseek@example.com"],
  },
  {
    slug: "notes",
    name: "Notes and annotations",
    about: "notes, annotations, and mind maps",
    pattern: /\bnotes?\b(?!:)|annotat|笔记|批注|标注|mind ?maps?|思维导图/iu,
    include: [
      "zotero-pdf-highlighter@memorushb.com",
      "highlightdescriptions@paulmrg2",
      "litmatrix@bapungiri",
      "papercompare@local.research",
      "photo-highlights@janbaykara.com",
      "remindme@beichenzhao.github.io",
      "zotero-excalidraw@zotero.org",
    ],
    exclude: [
      "RIOPACAddChapter@noidea.com",
      "autoattach@adolinjonathan-bot.github.io",
      "bibtex-clean@ouyangjiahong.github.io",
      "feed-riffle@local",
      "lcsc-datasheets@local.example",
      "preprint-bridge@research.local",
      "rule-outline@local.zotero",
      "yonghao.zou@epfl.ch",
      "zontex-bridge@endoretic.github.io",
      "zot2rm@fbkarsdorp.github.io",
      "zotero-github-sync@situkangsayur.github.io",
      "zotero-mcp-plugin@autoagent.my",
      "zotero-ocr@bib.uni-mannheim.de",
      "zotero-pdf-transfer@charlesapetersen.github.io",
      "zoterotag@euclpts.com",
      "zotron@diamondrill",
    ],
  },
  {
    slug: "citations",
    name: "Citations and writing",
    about: "citations in Word and LaTeX, BibTeX, and citation styles",
    pattern:
      /bibtex|biblatex|\blatex holdouts|word documents?|citations? in word|cite while you write|in-text citations|narrative citations|citation style|abnt|gb\/t|citation keys?|citation markers?|word processor|word citations|legal citations|参考文献格式/iu,
    include: ["cite-non-english@boan-anbo.com", "zoteropreview@carter-tod.com", "zotxt@e6h.org"],
    exclude: [
      "attachments-markdown@harrywang",
      "jasminum@linxzh.com",
      "zofiles@zofiles.dev",
      "zotero-mcp@agentsmith29.github.io",
      "zotero-settings-sync@gaviiiinnnn.github.io",
      "zotero-wiki-citations@quinn.dev",
    ],
  },
  {
    slug: "metadata",
    name: "Metadata and cleanup",
    about: "item metadata, DOIs, titles, author names, and duplicates",
    pattern:
      /metadata|元数据|题录|(?<!\b(?:by|via) )\bdois?\b|journal abbreviations?|期刊缩写|title case|normali[sz]|linter|duplicat|dedup|isbn|cnki|author names|拼音|language field|italici|book information|search (&|and) replace|\bpmcids?\b|\bpmids?\b|against crossref|details from crossref|extra fields/iu,
    include: [
      "arxiv@allanchain.github.com",
      "citestamp@citestamp.com",
      "custom-item-fields@hotmail.com",
      "date-from-last-modified@iris-advies.com",
      "display-title-alias@local",
      "lcsc-datasheets@local.example",
      "scholar-sidekick@scholar-sidekick.com",
      "title-without-articles@daihum.org",
      "zotbox@scigreat.com",
      "zotero-latin@mirket",
    ],
    exclude: [
      "attachmentscanner@changlab.um.edu.mo",
      "autoattach@adolinjonathan-bot.github.io",
      "better-find-full-text@example.com",
      "fullvahti@vahtian.com",
      "ima-zotero-sync@github.com.zhaox",
      "paper-chat@zotero-llm-wiki",
      "paper-library-checker@he-chun.github.io",
      "pdfrename@theigrams.com",
      "reference-map-connect@anoopkcn",
      "repository-detector@example.com",
      "scidownload@chen",
      "synapse@bcs1037.github.io",
      "tagwiz@tsmdt.github.io",
      "zemble@cosmik.network",
      "zotero-feed-management@unitian",
      "zotero-github-sync@situkangsayur.github.io",
      "zotero-lit-ai-matrix@tenor-john.github.io",
      "zotero-pdf-deduplicator@xuan.dev",
      "zotero7-scidb@dev.null",
      "zoterojs-bridge@local",
      "zoteropdftranslate@euclpts.com",
    ],
  },
  {
    slug: "attachments",
    name: "Attachments and full text",
    about: "finding and downloading PDFs, renaming and moving files, snapshots, and OCR",
    pattern:
      /(?<!translat\w* (?:\w+ ){0,2})attachments?\b|(?<!子)附件|full.?text pdfs|find(s|ing)? (the )?full.?text|download(s|ing)? (entitled )?(\w+ )?pdfs?|fetch pdfs|pdf files?|snapshots?|renam|\bocr\b|djvu|watch(ed)? folder|sci-hub|open-access|wayback|acquire pdfs|without pdfs|local pdf copies|pdf downloader|scidb|figure and table extraction|paddleocr/iu,
    include: [
      "ZotFileRecovery@jlegewie.com",
      "arxiv-source-helper@local.research",
      "attanger-plus@gaiussheh",
      "mineru-for-zotero@asianfleet.github.io",
      "paperlink@local.research",
      "perma-archiver@kirinchang.law",
      "zotero-book-splitter@juntaoyang.local",
      "zotero-open-pdf@iris-advies.com",
      "zotero-storage-cleaner@grainrainandy.github.io",
      "zoterocopyanything@example.com",
    ],
    exclude: [
      "annotation-colour-labels@grantzachary.github.io",
      "askgpt@askgpt.zotero",
      "bibtex-clean@ouyangjiahong.github.io",
      "bilingual-reader@zotero.local",
      "group-tabs-by-collection@example.com",
      "local-pdf-translate@liuwenbo0.github.io",
      "mineru-parse@local",
      "nodus-zotero@nodus.app",
      "numify@zotero-plugin.dev",
      "pdf2zh-connector@aarongig.com",
      "retainpdf-translate@zcode.local",
      "rule-outline@local.zotero",
      "seerai@zotero.org",
      "sentence-focus@local",
      "zotero-md-note@example.com",
      "zotero-pdf2zh@yuriyagn.github.io",
      "zotero-sideline@shiys.local",
      "zotero@bibsonomy.org",
      "zotero@equalang.com",
      "zoteroragflow@yourname.com",
      "zotextract@nfdixcs.org",
    ],
  },
  {
    slug: "rankings",
    name: "Journal rankings and citation counts",
    about: "journal and conference rankings, impact factors, and citation counts",
    pattern:
      /\brank|impact factor|影响因子|分区|\bccf\b|\bjcr\b|citation counts?|citation tally|tallies citation|\bscite\b|easyscholar|citation statistics|citation metrics|期刊(?!缩写|文章)/iu,
    include: ["citation-map@alessmor", "citegeist@opusvita.org", "ninja@fluctus.cc", "zotbox@scigreat.com", "zoteroScholar@my.com", "zoteroif@qnscholar"],
    exclude: ["cs-venues@local.tools"],
  },
  {
    slug: "export",
    name: "Export and sync",
    about: "Markdown files, Obsidian, Notion, reading apps and tablets, and backups",
    pattern: /notion|obsidian(?!-style)|logseq|readwise|remarkable|siyuan|思源|(to|as|into) (source-linked )?markdown|markdown (files|notes|database)|export|(?<!\bin )\bsync|backup|同步|导出/iu,
    include: [
      "break-pdf@ryon.ren",
      "literaturemind-bridge@literaturemind.local",
      "marktero@local",
      "readray@lilys.ai",
      "zotero-obsidian-readonly@example.com",
      "zotero-todoist-bridge@cpsimpson.dev",
      "zotero@bibsonomy.org",
    ],
    exclude: [
      "annotationmanage@zknu.edu.cn",
      "bilingual-reader@zotero.local",
      "chatgpt-web-sidebar-demo@local",
      "latex-suite@ievlevpn.github.io",
      "paper-companion@local",
      "paperpilot@zotero.org",
      "pdftrim-for-llm@shengjiejin.github.io",
      "rssrch@solvesaint",
      "rule-outline@local.zotero",
      "watch-folder@zotero-plugin.org",
      "wikipedia-to-zotero@phobrla.github.io",
      "zotero-bibliometero@jose.local",
      "zotero-copilot@example.com",
      "zotero-except@local",
      "zotero-extra-columns@fredyyoussif.github.io",
      "zotero-keep-window@luke-evan",
      "zotero-split-view-reader@fuling.lin.at.outlook.com",
      "zotero-tts@xujialiu.top",
      "zotero-wikicite@wikidata.org",
      "zoterocopyanything@example.com",
      "zoterotransnator@euclpts.com",
      "zotxt@e6h.org",
    ],
  },
  {
    slug: "search",
    name: "Search and discovery",
    about: "finding papers, preprints, related work, and citation graphs",
    pattern:
      /literature (search|scout)|search (pubmed|arxiv|across)|academic search|search plugin|semantic search|federated search|citation graphs?|reference map|forward (and backward )?citations|backward references|related papers|daily papers|published versions|\bscout\b|citation-network|citation relationships|citing (papers|works)|reference list|discover papers|arxiv browser|extract and import references/iu,
    include: [
      "citegeist@opusvita.org",
      "journallens@yunze623.github.io",
      "paper-loom@local.research",
      "tomasdanis26@gmail.com",
      "zotero-openreview@example.com",
      "zotero-plugin@inciteful.xyz",
      "zotero-reference-checker@najibprog",
      "zotero-wikicite@wikidata.org",
      "zotradar@poesein",
      "zoturead@zotero.org",
    ],
    exclude: ["citestamp@citestamp.com", "referencecheck@korhonenaleksi.github.io", "zotdupe@hostiuc.com"],
  },
  {
    slug: "organization",
    name: "Library organization",
    about: "tags, collections, item columns, feeds, and reading status",
    pattern:
      /\btags?\b|tagging|collections? (icons?|colou?rs?)|suggests? (which )?collections|into (zotero )?collections|by collection|references between (zotero )?items|numbers to zotero items|syllabi|(?<!two-|multi-|into )(?<!\bby )columns?\b(?! by\b)|reading list|reading status|reading progress|(?<!easy )to read\b(?! it\b)|unread|pin items|\bfeeds?\b|\brss\b|\btasks\b|timelines?|saved searches|reading time|标签/iu,
    include: [
      "authorbrowser@junting.li",
      "chartero@volatile.static",
      "collection-breadcrumb@informalgit.github.io",
      "coverview@insature.net",
      "literature-row-colors@local.example",
      "numify@zotero-plugin.dev",
      "paperpet@howarddong711.github.io",
      "zot-plus-plus@rnicrosoft-studio.github.io",
      "zotero-ai-collection@jiaxin.fan",
      "zotero-card-library@zotero",
      "zotero-except@local",
      "zotero-inbox-organizer@solitern.local",
      "zotero-one@zotero.plugin",
      "zotero-smart-organizer@users.noreply.github.com",
      "zoteroreviewassistant@alima-webdev.com",
      "zutilo@www.wesailatdawn.com",
      "zutilore@altairwei.github.io",
    ],
    exclude: [
      "alphalikes@iris",
      "careertracker@zotero.org",
      "ccf-rank@euclpts.com",
      "ccfa@thanejoss.github.io",
      "ccfrank@timetrapzz.site",
      "conference-abbreviations@zihanwu.local",
      "creator-pinyin-sort@local",
      "daeda@mit.edu",
      "docboxtrans@docread.local",
      "find-duplicates@example.com",
      "fullvahti@vahtian.com",
      "modern-zotero-themes@xzhang001.github.io",
      "paper-outline@example.com",
      "pdfrename@theigrams.com",
      "zotero-memory-management@unitian",
      "zotero-pdf-transfer@charlesapetersen.github.io",
      "zoterogpt@polygon.org",
      "zoterotimeline@oekeur.github.io",
      "zotracer@euclpts.com",
    ],
  },
  {
    slug: "appearance",
    name: "Appearance",
    about: "color themes, dark mode, and the look of Zotero's window",
    pattern: /\bthemes?\b|dark mode|dark-mode|wallpaper|(?<!magnifying )glass|userchrome|grayscale|配色|主题|护眼|appearance/iu,
    include: ["condense-info-view@example.com", "colecoes-coloridas-zotero@joao-fisio", "hidefields@pengxoya.github.io"],
    exclude: ["literaturemind-bridge@literaturemind.local", "zusia@firekern.github.io"],
  },
  {
    slug: "ai-tools",
    name: "Connections for AI tools",
    about: "MCP servers and local endpoints that let outside AI tools reach your library",
    pattern:
      /\bmcp\b|model context protocol|local (write )?endpoint|endpoints for|json-rpc|http api|local http|remote debugging|agent-ready|for ai agents|ai clients|let ai agents|connect claude|(local|authenticated) bridge|agent bridge/iu,
    include: [
      "arxiv-source-helper@local.research",
      "survey-papers-to-zotero-companion@vincent929-cyber.github.io",
      "zontex-bridge@endoretic.github.io",
      "zotero-declarative-bridge@deep-research.local",
    ],
    exclude: [],
  },
  {
    slug: "interface",
    name: "Window, tabs, and shortcuts",
    about: "how the main window behaves, tray icons, tabs, keyboard shortcuts, and small menu and toolbar changes",
    pattern:
      /(?<!new )\btabs?\b|\btray\b|fullscreen|full-screen|keyboard shortcuts?|hotkeys?|hamburger|close button|quick launch|托盘|最小化/iu,
    include: [
      "reader-tool-shortcuts@mi-lab.local",
      "rebootero@chen7447.github.io",
      "vertical-toolbar@dylan.ac",
      "zotero-deselect@local",
      "zotero-neo@zotero-neo",
      "zutilo@www.wesailatdawn.com",
    ],
    exclude: [
      "break-pdf@ryon.ren",
      "chartero@volatile.static",
      "keep-reader-ready@local.invalid",
      "zotero-open-router@luciferer.github.io",
      "zotero-tts@xujialiu.top",
    ],
  },
  {
    slug: OTHER,
    name: "Other tools",
    about: "plugins that fit none of the categories above",
    pattern: /(?!)/u,
    include: [],
    exclude: [],
  },
];

// The texts a pattern runs over: the name shown on the site, the shown description, and the
// manifest and GitHub descriptions. A record with no upstream facts has none, since its
// shown name is its id, whose domain says nothing about what the plugin does.
function texts(record: DescriptionRecord): string[] {
  if (!record.upstream) return [];
  const name = appliedValue(record, "name", record.upstream.name) ?? record.id;
  const shown = shownDescription(record);
  return [name, shown, record.upstream.description, record.upstream.repoDescription].filter(
    (text): text is string => text !== undefined,
  );
}

// The slugs of a record's categories, in CATEGORIES order: each category whose exclude list
// lacks the record's id and whose include list has it or whose pattern matches one of its
// texts. A record with upstream facts that no category takes gets OTHER.
export function categories(record: DescriptionRecord): string[] {
  const all = texts(record);
  const slugs = CATEGORIES.filter(
    (category) =>
      !category.exclude.includes(record.id) &&
      (category.include.includes(record.id) || all.some((text) => category.pattern.test(text))),
  ).map((category) => category.slug);
  return slugs.length === 0 && record.upstream ? [OTHER] : slugs;
}

// The home page's category menu options: one for each category that at least one record has,
// as "Name (N)" with N its records, most records first and ties in CATEGORIES order, with
// OTHER last whatever its N.
export function categoryOptions(records: DescriptionRecord[]): { value: string; text: string }[] {
  const counts = new Map<string, number>();
  for (const record of records) for (const slug of categories(record)) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  return CATEGORIES.filter((category) => counts.has(category.slug))
    .toSorted((a, b) => Number(a.slug === OTHER) - Number(b.slug === OTHER) || counts.get(b.slug)! - counts.get(a.slug)!)
    .map((category) => ({ value: category.slug, text: `${category.name} (${counts.get(category.slug)})` }));
}
