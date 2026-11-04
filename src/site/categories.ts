// The categories the site sorts plugins into: the index's own grouping, not a fact that a
// plugin's author declares (D-037).
import { type DescriptionRecord, shownDescription } from "./description.ts";
import { appliedValue } from "./version.ts";

// One category. slug is its value in data-categories and ?category=; about says what it
// holds on the About page. pattern runs over each of a plugin's texts (see categories);
// include adds the category to the plugins with those ids, and exclude takes it from them,
// over include and over the pattern. further, when a category has it, must also pass for the
// pattern to give the category; it reads the first FURTHER_CHARS characters of each of a
// record's texts, the name first.
export interface Category {
  slug: string;
  name: string;
  about: string;
  pattern: RegExp;
  further?: (texts: string[]) => boolean;
  include: readonly string[];
  exclude: readonly string[];
}

// A stated AI feature: chat, summaries and explanations, an assistant, an agent in Zotero, or
// work done with a model. A text with the word MCP or bridge, "model context protocol", or
// "AI agents", "AI clients", or "AI tools" counts only for the first three lines of AI_FEATURE;
// this check is on each text, not the record. AI_NAME passes a name with AI, LLM, GPT, agent, or
// RAG, unless the name also has MCP, bridge, server, or skill.
const MODEL = String.raw`(?<!(?:\bcode\b[^.,;]*?|built|developed|written|made) (?:by|with) )(?:\bai\b|\bllms?\b|(?:chat)?gpt|claude|codex|deepseek|gemini|openai|ollama|\bagent\b|大模型|人工智能)`;
const AI_NAME = /^(?!.*\b(?:mcp|bridge|server|skills?)\b).*(?:\bai\b|\bllms?\b|gpt|\bagent\b|\brag\b)/iu;
const AI_FEATURE = new RegExp(
  [
    String.raw`\bchat(?!gpt)|聊天`,
    String.raw`\b(?:agents?|assistant)(?: that \w+| \w+ing)? (?:in|inside|within|for) (?:your )?zotero|zotero\s*(?:内|中|里).{0,6}(?:agent|智能体)`,
    String.raw`\b(?:ai|llm)[- ]?(?:powered|based|driven|assisted|generated|reading|analysis|research|features?|answers?|plugin|service|providers?|models?|插件)(?!.{0,25}(?:develop|\bcod))`,
    String.raw`^(?!.*(?:\bmcp\b|model context protocol|\bbridge\b|\bai (?:agents|clients|tools)\b|\bai\s*工具)).*(?:` +
      [
        String.raw`\bask\b|\bquestions?\b|\bdiscuss|\btalk to|\bconversation|\bq&a\b|\brag(?:flow)?\b|retrieval-augmented|对话|问答|提问`,
        String.raw`summar|\bexplain|\bexplanation|\btl;?dr\b|总结|摘要|解释|讲解|解读|精读`,
        String.raw`\bassistant\b|\bcopilot\b|\bzotero(?: \d+)?[- ]ai\b|助手|智能体`,
        String.raw`${MODEL}(?: code| cli)? (?:in|inside|within) zotero`,
        String.raw`(?:translat|翻译).*${MODEL}|${MODEL}.*(?:translat|翻译)`,
        String.raw`\b(?:us(?:es?|ing)|via|through|powered by|based on) (?:(?:a|an|the|your own|local|remote) )*${MODEL}`,
        String.raw`\b(?:analy[sz]|annotat|answer|classif|extract|filter|generat|review|sort|suggest|tag)\w*\b[^.;。]*?\b(?:with|using|by) (?:\S+ ){0,4}${MODEL}`,
        String.raw`(?:使用|调用|基于|接入)\s*\S{0,6}\s*${MODEL}`,
      ].join("|") +
      ")",
  ].join("|"),
  "ius",
);

// What a further test takes as a stated file feature: a verb such as find, download, rename,
// move, or manage near a file word, a snapshot being added or saved, running OCR, or a word
// such as scanned, Sci-Hub, wayback, DjVu, or "figures and tables". FILE_NAME passes a name with
// attachment, snapshot, renam, or ocr, whatever the plugin does, unless the name has translat
// or 翻译.
const FILE_NAME = /^(?!.*(?:translat|翻译)).*(?:attachment|附件|snapshot|renam|ocr\b)/iu;
const FILE = String.raw`(?:pdfs?\b|files?\b|attachments?\b|full.?texts?\b|snapshots?\b|附件)`;
const ZH_FILE_VERB = "管理|下载|转换|移动|重命名|整理|查找|同步|删除";
const FILE_FEATURE = new RegExp(
  [
    String.raw`\b(?:renam|mov(?:e|es|ing)\b|cop(?:y|ies|ying)\b|delet|remov|clean|manag|organi[sz]|sync|fetch|download|retriev|acquir|find|detect|convert|preview)\w*(?: \S+){0,3} ${FILE}`,
    String.raw`^(?!.*(?:translat|翻译|译文)).*\b(?:attach(?:es|ing)?\b|export|import|open)\w*(?: \S+){0,3} ${FILE}`,
    String.raw`${FILE}.{0,40}\bfolders?\b|(?:attachments?|pdfs?|files?) (?:manag|clean|downloader|renam|matching|path)`,
    String.raw`(?:${ZH_FILE_VERB}).{0,10}附件|附件.{0,2}(?:${ZH_FILE_VERB})`,
    String.raw`\b(?:add|sav|tak|captur|creat|archiv)\w*(?: \S+){0,3} snapshots?|\bas (?:a )?(?:\S+ ){0,2}snapshots?`,
    String.raw`(?:runs?|with|via|performs?) ocr\b|\bocr\W+(?:\S+ )?(?:for|on|attachments?|pdfs?|text)\b|ocr\s*(?:插件|识别)|scanned|扫描`,
    String.raw`(?:download|fetch)\w*(?: \S+){0,3} (?:papers?|articles?)|sci-hub|scidb|wayback|djvu|watch(?:ed)? folder|open-access (?:\S+ )?(?:pdfs?|cop)|figures?(?:,| and) tables?`,
  ].join("|"),
  "ius",
);

// The slug of the category of a read plugin that no other category takes (see categories).
export const OTHER = "other";

export const CATEGORIES: readonly Category[] = [
  {
    slug: "ai",
    name: "AI assistants",
    about: "chat with papers, AI summaries and explanations, and AI agents inside Zotero",
    pattern:
      /\bai\b|\bai\d|\bllms?\b|\bgpt|chatgpt|claude|codex|deepseek|gemini|openai|ollama|copilot|(?<!user-)\bagents?\b|\brag\b|retrieval-augmented|\bkimi\b|notebooklm|\bhermes\b|opencode|antigravity|\bchat\b|large language|literature assistant|ragflow|\btl;?dr\b|大模型|人工智能|智能对话/iu,
    further: (texts) => AI_NAME.test(texts[0]!) || texts.some((text) => AI_FEATURE.test(text)),
    include: [
      "SKR@zotero.org",
      "ask-my-paper@euclpts.com",
      "paper-partner@qinsihan.github.io",
      "remindme@beichenzhao.github.io",
      "semantic-search@ildon.github.io",
      "super-scholar@Kohirus",
      "zotero-cool-paper@andybear",
      "zotero-notebooklm@peterdresslar.com",
      "zotero-reading-room@wuxinxin27.github.io",
      "zoteroautoccftagplugin@tobyshi.com",
    ],
    exclude: [],
  },
  {
    slug: "translation",
    name: "Translation and dictionaries",
    about: "translated text and PDFs, bilingual reading, dictionaries, and vocabulary",
    pattern: /(?<!import )translator\b|translat(?!ors?\b)|(?<!编)译|bilingual|双语|dictionar|词典|查词|vocabular|单词|生词/iu,
    include: ["word-learning@zotero.local", "zodh@fatsource.com"],
    exclude: [
      "gbt7714-2025-helper@wangzfof.github.io",
      "lcsc-datasheets@local.example",
      "quick-highlight@local.kyh",
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
      /reading guide\b|reading ruler|split.?view|pdf (?:bookmarks?|outlines?)|reading mode|single-page|page view|line focus|line by line|bionic|text-to-speech|\btts\b|read aloud|white margins|horizontal scroll|reader (location )?history|keybindings|eye-care|护眼|dark-mode image|pagination|theorems|in-text citations?|citation hover|rendered (pdf )?pages|reading bookmarks|citation previews|pdf references|while you read|margin detection|skimming|brightness|papers aloud/iu,
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
      "zoterofig@forgeters.github.io",
    ],
    exclude: ["arch-note-zotero-deepseek@example.com"],
  },
  {
    slug: "notes",
    name: "Notes and annotations",
    about: "notes, annotations, and mind maps",
    pattern: /\bnote\b(?![:：])|\bnotes\b|annotat|笔记|批注|标注|mind ?maps?|思维导图/iu,
    include: [
      "zotero-pdf-highlighter@memorushb.com",
      "highlightdescriptions@paulmrg2",
      "litmatrix@bapungiri",
      "papercompare@local.research",
      "photo-highlights@janbaykara.com",
      "remindme@beichenzhao.github.io",
      "writeflex@dominiklukes.net",
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
      "tag-fuzzy-search@local",
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
    include: ["cite-non-english@boan-anbo.com", "uts-citation@gracefullight.dev", "zoteropreview@carter-tod.com", "zotxt@e6h.org"],
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
      /metadata|元数据|题录|(?<!(?:download|import)\w*(?: \w+){0,3} by )\bdois?\b|journal abbreviations?|期刊缩写|title case|normali[sz]|linter|duplicat|dedup|isbn|cnki|author names|拼音|language field|italici|book information|search (&|and) replace|\bpmcids?\b|\bpmids?\b|against crossref|details from crossref|extra fields/iu,
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
      "journal-crawler@ildon.github.io",
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
      "zotero2eagle@euclpts.com",
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
      /(?<!translat\w* (?:zotero )?(?:pdf )?)attachments?\b|(?<!作为子)附件|full.?text pdfs|find(s|ing)? (the )?full.?text|download(s|ing)? (entitled )?(\w+ )?pdfs?|fetch pdfs|pdf files?|snapshots?|renam|\bocr\b|djvu|watch(ed)? folder|sci-hub|open-access|wayback|acquire pdfs|without pdfs|local pdf copies|pdf downloader|scidb|figure and table extraction|paddleocr/iu,
    further: (texts) => FILE_NAME.test(texts[0]!) || texts.some((text) => FILE_FEATURE.test(text)),
    include: [
      "ZotFileRecovery@jlegewie.com",
      "arxiv-source-helper@local.research",
      "attanger-plus@gaiussheh",
      "journal-crawler@ildon.github.io",
      "mineru-for-zotero@asianfleet.github.io",
      "mineru-html@example.com",
      "mineru-to-zotero@example.com",
      "paperlink@local.research",
      "perma-archiver@kirinchang.law",
      "tex-fetch@colefaraday",
      "zenotes@alefa.net",
      "zotero-book-splitter@juntaoyang.local",
      "zotero-open-pdf@iris-advies.com",
      "zotero-pdf-outline-builder@xfl031129.github.io",
      "zotero-storage-cleaner@grainrainandy.github.io",
      "zotero-youtube-transcripts@lstrzepek",
      "zoterocopyanything@example.com",
      "zoteropdfmetadata@gmail.com",
      "zoterotransnator@euclpts.com",
    ],
    exclude: [
      "bibtex-clean@ouyangjiahong.github.io",
      "zotero-random-read@xuan.dev",
      "zotero@bibsonomy.org",
      "zoterofig@forgeters.github.io",
    ],
  },
  {
    slug: "rankings",
    name: "Journal rankings and citation counts",
    about: "journal and conference rankings, impact factors, and citation counts",
    pattern:
      /\brank|impact factor|影响因子|分区|\bccf\b|\bjcr\b|citation counts?|citation tally|tallies citation|\bscite\b|easyscholar|citation statistics|citation metrics|期刊(?!缩写|文章)/iu,
    include: [
      "citation-map@alessmor",
      "citegeist@opusvita.org",
      "ninja@fluctus.cc",
      "open-citations@zotero-plugin.org",
      "zotbox@scigreat.com",
      "zoteroScholar@my.com",
      "zoteroif@qnscholar",
    ],
    exclude: ["cs-venues@local.tools", "researchradar@korhonenaleksi.github.io"],
  },
  {
    slug: "export",
    name: "Export and sync",
    about: "Markdown files, Obsidian, Notion, reading apps and tablets, and backups",
    pattern: /notion|obsidian(?!-style)|logseq|readwise|remarkable|siyuan|思源笔记|(to|as|into) (source-linked )?markdown|markdown (files|notes|database)|export|(?<!(?:stays?|kept) in )\bsync|backup|同步|导出/iu,
    include: [
      "break-pdf@ryon.ren",
      "literature-library@local.zotero",
      "literaturemind-bridge@literaturemind.local",
      "marktero@local",
      "readray@lilys.ai",
      "zotero-obsidian-readonly@example.com",
      "zotero-todoist-bridge@cpsimpson.dev",
      "zotero@bibsonomy.org",
      "zotmd@celery.dev",
    ],
    exclude: [
      "annotationmanage@zknu.edu.cn",
      "attanger-plus@gaiussheh",
      "bilingual-reader@zotero.local",
      "chatgpt-web-sidebar-demo@local",
      "latex-suite@ievlevpn.github.io",
      "metarefresh@zhibo.ark0",
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
      "author-harvester@migueldelm",
      "citegeist@opusvita.org",
      "journallens@yunze623.github.io",
      "paper-loom@local.research",
      "researchradar@korhonenaleksi.github.io",
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
      /\btags?\b|tagging|collections? (icons?|colou?rs?)|suggests? (which )?collections|into (zotero )?collections|by collection|references between (zotero )?items|numbers to zotero items|syllabi|(?<!\b(?:two|double|2|multi)[- ]|into )(?<!\bby )columns?\b(?! by\b)|reading list|reading status|reading progress|(?<!eas(?:y|ier) )to read\b(?! it\b)|unread|pin items|\bfeeds?\b|\brss\b|\btasks\b|timelines?|saved searches|reading time|标签/iu,
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
      "zotero-random-read@xuan.dev",
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
    include: ["condense-info-view@example.com", "colecoes-coloridas-zotero@joao-fisio", "hidefields@pengxoya.github.io", "zotero-stylero@jose.local"],
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
      "codex-zotero-bridge@guoxin-ink.github.io",
      "survey-papers-to-zotero-companion@vincent929-cyber.github.io",
      "zontex-bridge@endoretic.github.io",
      "zotero-declarative-bridge@deep-research.local",
      "zotero-management-bridge@example.org",
    ],
    exclude: ["uts-citation@gracefullight.dev"],
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

// How much of each text a further test reads. Some of its patterns slow down on a long text
// that a plugin's manifest can hold; the longest text on 2026-11-03 had 509 characters.
const FURTHER_CHARS = 2000;

// The slugs of a record's categories, in CATEGORIES order: each category whose exclude list
// lacks the record's id and that either has the id on its include list, or has a pattern that
// matches one of its texts and a further test, if any, that passes. A record with upstream facts
// that no category takes gets OTHER.
export function categories(record: DescriptionRecord): string[] {
  const all = texts(record);
  const start = all.map((text) => text.slice(0, FURTHER_CHARS));
  const slugs = CATEGORIES.filter(
    (category) =>
      !category.exclude.includes(record.id) &&
      (category.include.includes(record.id) || (all.some((text) => category.pattern.test(text)) && (category.further?.(start) ?? true))),
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
