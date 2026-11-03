# paid-service-sweep: a hand read of which plugins need a paid service from their maker (M082, M083, M084)

**Provenance.** Ingested 2026-11-02 by M082 and extended by M083 and M084, from
reads of the plugins' own text on 2026-11-02 and 2026-11-03. Pagination: none.
Extraction: snapshots of 2026-11-02 and 2026-11-03, and READMEs and descriptions can change after them (observed 2026-11-03).

**Scope.** This page records three reads. The first, which AC6 of M082 rests on,
covers the 695 entries under `plugins/` at commit `c8f2b65`. The second, which
M083 adds, covers the 34 entries added between that commit and `34a02a8`. The
third, which M084 adds, covers the 7 entries added between `34a02a8` and
`1b2cebf`. The sections before "Second read" hold the first read. "Fourth read"
covers two entries that M085 moved to other repos. This page builds no checker.
A plugin added after `1b2cebf` has not been read. Status
lives in `ROADMAP.md`, decisions in
`DECISIONS.md`, and architecture in `DESIGN.md`.

## Texts read

- The `description` and `repoDescription` of each record's `upstream` in the
  deployed `v1/plugins.json` whose `generatedAt` is 2026-11-02T21:04:10.008Z,
  with 671 records. The gitignored shelf keeps a copy as
  `sources/plugins-data-2026-11-02.json`.
- Each top-level file whose name starts with README, ignoring case, at the
  default-branch SHA that `paid-service-sweep-shas.tsv` records for the entry's
  repo. That file has one line per entry, and a script wrote it from the read.
  The read found 846 such files.

## Word list and matching rule

Each text is split into lines. If this regular expression finds a match in a
line, with Python's `re.IGNORECASE`, that line is a hit. An entry with a hit in
any text goes in a verdict list below.

```text
subscri|membership|\bmembers?\b|\bcredits?\b|\btrial\b|free tier|free plan|\bpricing\b|\bprice\b|\bpaid\b|\bpro plan\b|\bpro version\b|\bpremium\b|\bactivat|license key|licen[sc]e code|\bpurchase|\bbuy\b|top[- ]?up|recharge|\bbilling\b|\bbalance\b|\bquota\b|\bupgrade to\b|付费|收费|会员|會員|订阅|訂閱|激活|授权码|授權碼|试用|試用|积分|積分|充值|购买|購買|卡密|兑换码|额度|額度|计费|計費|套餐|专业版|專業版|免费版|免費版|余额|餘額|有料|課金|유료|구독|\bsign[- ]?up\b|\bsign[- ]?in\b|\blog[- ]?in\b|\baccount\b|注册|註冊|登录|登錄|账号|帳號|账户|帳戶
```

The list found 357 entries with a hit, and 338 with none. A plugin that sells a
service in words outside this list, or only on its own site, stays unread here.

## How the read was done

Three fresh readers each read one third of the hits, and the full README where
the lines left any chance that the maker sells something. They gave 7 marks and
4 unclear verdicts. The session read the README lines of those 11 again. The 4
unclear plugins got no mark. Each README leaves out the payment, the maker's tie
to the service, or what stops after the trial. For `ai4paper-v2@cpc.dev`
the session also read the maker's docs page. Its purchase page needs a login,
which the session did not attempt.

A later check of the notes against their sources changed two of the 7 marks.
The README of `filetrans@euclpts.com` does not say that the code is bought, so
its source is now the maker's tutorial, which does. `zoteromagic@zoterocn.com`
lost its mark, for the same reason as `ai4paper-v2@cpc.dev`. The session read its
README, its site's home page, and the start of its docs. The docs page text did
not load in full. So 6 entries carry a mark.

The README of `zotero@immersivetranslate.com` does not give a price. The maker's
pricing page lists Pro as a paid plan (observed 2026-11-02).

A mark means that the plugin's main use stops without paying its maker, or
stops after a trial (D-054).

## Texts not read

- The named `plugins.json` lacks 24 entries, so no description of them was read.

  - `chartero@volatile.static`
  - `dsh-for-zotero@zotero.cn`
  - `frlars21@github.com`
  - `geyi-zotero-translator@geyi.net`
  - `jadense-in-zotero@jadense.cn`
  - `knode-plugin@youngerinfo.com`
  - `litmtrans@srt117.github.io`
  - `openalex-pdf@littview.com`
  - `paper-loom@local.research`
  - `pdf-translate@thejieee.github.io`
  - `quick-highlight@local.kyh`
  - `replication-checker@forrt.org`
  - `scholar-sidekick@scholar-sidekick.com`
  - `treekoala@liusir`
  - `vocab-book@custom.zotero.org`
  - `watch-folder-multiroot@local.zotero`
  - `wordtranslator@example.com`
  - `zotbox@scigreat.com`
  - `zotero-agent@autoagent.my`
  - `zotero-agent@haozhihuiYmh150`
  - `zotero-mcp@agentsmith29.github.io`
  - `zotero-pdf-translate-plus-plus@golden-pigeon`
  - `zotero@wilddata.cn`
  - `zoteromagic@zoterocn.com`
- An entry whose repo has no top-level README file has no README read:
  `ohm-zotero@openhistorymap.org`.

Every record of the named `plugins.json` has an `upstream` block, and every
README file found was read.

## Marked

The `note` and `source` of each are in the entry's `index.json`.

- fanyipaiban@fanyipaiban.com: translation spends credits bought from the maker
- filetrans@euclpts.com: needs a purchased activation code, translation deducts credits from a balance
- geyi-zotero-translator@geyi.net: needs a paid Geyi membership, new accounts get a one-day trial
- zotero-ai-guided-reader@jhj223: new generation stops after a 7-day trial without the maker's Pro plan
- zotero@equalang.com: document translation spends Equalang credits after one-time free credits
- zotero@immersivetranslate.com: works only for paying Immersive Translate Pro members

## No mark

- BetterRSSforZotero@cloudchewie.com: RSS subscription sense only, nothing is sold
- DigiVatLibpdf@patzold.net: Credits means acknowledgements, nothing is sold
- RIOPACAddChapter@noidea.com: Only a Ko-fi donation link
- ZoteroExcerpt@fanyingfx.com: Template text about activation and GitHub login only
- addontemplate@euclpts.com: Developer template, nothing is sold
- ai-batch-reader@example.com: Free tool, user pays their own chosen AI provider
- ai4paper-v2@cpc.dev: states a 7-day trial, not what stops after it, lists third-party AI providers
- aidea@visterainer: Uses third-party subscriptions, own API keys, or local models
- ainote@zotero.org: ChatGPT login is a third party, maker sells nothing
- aiocr@zotero-plugin.com: Quota errors concern third-party OCR engines
- alphainz@alphainfix.github.io: Free, own models and keys, no account
- alphalikes@iris: No key or sign-up needed
- annota@equiriconi: Only a buy-me-a-coffee donation, Claude subscription is third party
- annotes@derican: Template text about activation and GitHub login only
- arch-note-zotero-deepseek@example.com: User pays third-party DeepSeek or Poixe API
- arxiv-marker@lele.dev: Registration of chrome path only, nothing is sold
- arxiv2zh@kongyan66: Independent client, hjfy.top sign-in, no payment named
- arxiv@allanchain.github.com: Journal subscription sense only
- askgpt@askgpt.zotero: User pays their own third-party provider
- assistente-ia@sbhg.pt: Uses user's own Gemini or ChatGPT account, free tier
- attachments-markdown@harrywang: Credits means acknowledgements, nothing is sold
- author-harvester@migueldelm: Institutional login sense only
- auto-export@andriwild.github.io: Script loader text only, nothing is sold
- autoattach@adolinjonathan-bot.github.io: Credits means acknowledgements, nothing is sold
- babeldoc-for-zotero@veiluna.github.io: User's own third-party API key and balance
- beaver@jlegewie.com: Lasting free tier and the user's own key, a subscription is an upgrade (corrected M085, see "Fourth read")
- better-bibtex@iris-advies.com: Word matches are about keys and markup only
- better-find-full-text@example.com: Paywall on articles only, nothing is sold
- bettersync@swroom.com: Template text about activation and GitHub login only
- bibgenie@outlook.com: Monthly credits, plus own keys and local models
- bibtex-clean@ouyangjiahong.github.io: Menu registration text only
- bilingual-linked-reader@houxin2024.github.io: Free third-party engine, own API, or local service
- bilingual-pdf@local.zotero: User pays third-party Doc2X and DeepSeek
- bilingual-reader@zbr.local: Own API, CLI login, or free MinerU allowance
- categorialtags@panhaoyu.com: Activate means enabling the plugin
- causalmap@causalmap.app: Free monthly allowance covers about 300 pages
- ccfplus@timetrapzz.site: Quota refers to public Semantic Scholar limits
- ccfrank@timetrapzz.site: Credits means acknowledgements, nothing is sold
- chat@zotero-mcp: Free and open source, only sponsorship asked
- chatgpt-web-sidebar-demo@local: Login to third-party AI websites only
- chatpdf@zotero-plugin: Collection membership sense only
- citation-cards@shamus-li.github.io: Google Scholar sign-in only
- cite-non-english@boan-anbo.com: Activate refers to style rendering only
- citegeist@opusvita.org: States no sign-up and no paid tier
- claudero@muisedestiny.com: Uses user's own third-party CLI login or key
- clautero@zotero-plugin: Uses user's own third-party CLI login
- codex-bilingual-reader@geyi.net: Uses local Codex login or own OpenAI-compatible API
- codex-sidebar@zotero.local: User's own Codex login and DeepSeek key
- conference-abbreviations@zihanwu.local: Trial means a local test build only
- confucius@zotero.plugin: User's own third-party CLI login and costs
- crop-to-margin@waelitani.github.io: Code and layout wording only, nothing is sold
- dailypaper@yansh: Subscribed papers sense only
- deepread@lsy-aia.github.io: No account, credits, or subscription, own keys
- display-title-alias@local: Registered trademark sense only
- djvu-converter@zotero.org: Account means make up, nothing is sold
- docflow@egooose.local: Credit means attribution, billing and quota concern third parties
- doi2pdf@carhojohn.com: Windows registry sense only
- dsh-for-zotero@zotero.cn: Institutional subscriptions and own third-party keys only
- dualtitle@dual-title.zotero: Menu registration text only
- easyread-zotero-sync@local.research: Local registry file sense only
- `enhanced-notes@jsglazer.com`: No extra account, credits means acknowledgements
- exitem@exitem.local: Folder membership sense only
- feed-riffle@local: Text-handling wording only, nothing is sold
- flexannotate@justanotherjurastudent.github.io: Only a buy-me-a-coffee donation
- frlars21@github.com: Script loader text only, nothing is sold
- gbt7714-2025-helper@wangzfof.github.io: States fully free, sponsorship unlocks nothing
- github-links@huoyuuu.github.io: Section registration text only
- glossa-zotero@yiiwang118: User's own model service, local model, or CLI
- glossa@openzotero.org: No paid modules, no account, own API keys
- greenfrog@redleafnew.me: Third-party easyScholar key, no payment named
- hermes@techne-tools.org: Stream subscription code sense only
- hfdailypapers@arno.dev: Plugin registration text only
- hjfy-pdftranslate@hjfy.top: Third-party client, hjfy.top login, no payment named
- hover-translate-eudic@zotero-plugins.dev: Logins to third-party dictionary services only
- hypothesis-import@zotero-plugin: Free Hypothesis token, credits means acknowledgements
- ima-zotero-sync@github.com.zhaox: Menu registration text only
- inkbridge@maipeng.com: Conda activate and Tailscale login only
- inthes@zxyl1003.github.io: Third-party ChatGPT account or many own-key APIs
- jadense-in-zotero@jadense.cn: Maker's account optional, own key works for AI features
- jasminum@linxzh.com: Own key from any provider, AI is optional
- journallens@yunze623.github.io: Publisher paywall on PDFs only
- knode-plugin@youngerinfo.com: Needs knowledge-center login and key, no payment named
- kokoro-pronunciations@xamspanda.github.io: Local voices, Zotero credits not used
- kokoro-read-aloud-bridge@pcf566.github.io: Local voices, does not use Zotero credits
- latex-suite@ievlevpn.github.io: Credits means acknowledgements, nothing is sold
- lexiflow-dict-translator@example.com: User's own OpenAI-compatible service and key
- lexis-zotero@heptazero.local: States no account or hosted service
- lidia-zotero@cdh.uu.nl: Developer setup wording only
- literature-library@local.zotero: Third-party MinerU key only
- literature-metrics@frank-ai4s.local: Free keys from third parties, search needs none
- literature-row-colors@local.example: States no account or AI service
- literaturemind-bridge@literaturemind.local: States no account or remote AI
- litmtrans@srt117.github.io: No subscription fee, third-party model costs only
- llm-for-zotero-translator@cszr: Settings panel registration text only
- local-pdf-translate@liuwenbo0.github.io: Own configured API key
- lumina@lumina.dev: Code registry wording only
- manuelarunge10@gmail.com: Credits means acknowledgements, nothing is sold
- margincarry@0then0.github.io: Offline, no account or server
- mdbundle@williammendes.dev: Only a buy-me-a-coffee donation
- memorive-companion@memorive: User supplies own cloud access, CLI, or local model
- memory@jsg.local: Subscript formatting sense only
- meta-data-repair@zotero-plugin.org: Credits means acknowledgements, nothing is sold
- metaflow@groele: Upgrade and subscript wording only, nothing is sold
- metarefresh@zhibo.ark0: Menu registration text only
- mindflow@groele.org: WebDAV provider quota only
- mineru-html@example.com: Third-party MinerU API quota only
- mineru-parse@local: Third-party MinerU token only
- mineru-to-zotero@example.com: Preferences registration text only
- miscite-sync@miscite.review: Needs maker's account and token, no payment named
- mktero@tenglvjun.github.io: Maker's account names no payment, other converters work, Ko-fi only
- nanopub-plugin@sciencelivehub.com: Free account, credit system only planned
- night@tefkah.com: Activate means turning on the theme, nothing is sold.
- nodus-zotero@nodus.app: Free forever, no account required.
- notero@vanoni.dev: Only a Buy Me a Coffee link appears.
- numify@zotero-plugin.dev: Only a Buy Me a Coffee link appears.
- nzbridge@notebooklm-bridge.dev: Donation link only, Google account is for NotebookLM.
- obsidian-notepad-for-zotero@acatechnic: Coffee tip is optional, never required.
- open-citations@zotero-plugin.org: Paid proxies mentioned only as a remark, open APIs used.
- openalex-pdf@littview.com: Free, no account or key needed.
- orbit@fkallmer.dev: Credits here means acknowledgements, nothing is sold.
- paper-acquisition-anti-scrape@jyluo1994.github.io: Logins are to institutions and publishers, not a paid service.
- paper-chat-for-zotero@suzuka24.github.io: Uses user's Codex sign-in, a third party.
- paper-companion@local: Uses user's own third-party accounts, plugin provides none.
- paper-companion@ltzyl.github.io: Registration remark is about mirrors, nothing is sold.
- paper-library-checker@he-chun.github.io: Word appears only in logs and trademark text.
- paper-loom@local.research: No plugin account, model providers are third parties.
- paper-outline@example.com: Balance refers to user's own third-party API key.
- paper-reading-agent@xiaoxuan.li: Uses user's own Codex or Claude CLI login.
- paperbridge@example.com: Uses user's own Claude or Codex CLI login.
- papercompare@local.research: No remote account or paid service.
- paperlens@alanzeng.local: User's own provider keys, login manager stores them.
- papermind-connector@papermind.local: Own API key or own ChatGPT subscription, third parties.
- paperminer@paperminer.org: No maker account, user's own API keys.
- paperpilot@zotero.org: Balance refers to user's own API key.
- papertranslate@papertranslate.dev: MinerU and LLM are external services with user keys.
- paperworm@paperworm.dev: User's own third-party providers, including free options.
- paperzorro@paperzorro.io: Only a Buy Me a Coffee link appears.
- papilot@dev.local: Paid official channel optional, own key or local model works.
- pdf-ai-bookmarks@edwintuan.com: Uses third-party Gemini key with free tier.
- pdf-attachment-downloader@vic-c33.github.io: Subscription means institutional IEEE access, a third party.
- pdf-exporter@ilker.local: No account or telemetry, nothing is sold.
- pdf-fetcher@yuric.local: Needs JLSS institutional account, a third party, no payment named.
- pdf-noir@zotero-plugins: Register and injection words are technical, nothing is sold.
- pdf-translate@thejieee.github.io: Quota refers to third-party translation engines, some free.
- pdf2zh-connector@aarongig.com: Free Google or user's own API keys, third parties.
- pdf2zh@guaguastandup.com: Free open source, invitation links and third-party engines only (corrected M085, see "Fourth read").
- pdfhandcatcher@qifu04: Login means reusing institutional sessions.
- perma-archiver@kirinchang.law: Perma.cc is a third party the maker does not run.
- popfish@moonbow.dev: bills through BytesLink, which the README does not tie to the maker
- preprint-bridge@research.local: Collection membership and no plugin account.
- prism@zotero-prism.org: README states no paid version or activation codes.
- protpeek-zotero@momisback.github.io: No account or maker-run backend.
- qref@janr383.github.io: Word match in image text, nothing is sold.
- quick-highlight@local.kyh: Credits here means acknowledgements, nothing is sold.
- quick-switcher@zotero-search.app: Activation means window focus, nothing is sold.
- readeck-import@zotero-plugin: Credits here means acknowledgements, nothing is sold.
- readerc@readerc.local: Words are unrelated to payment, nothing is sold.
- reading-assistant@zotero-llm.org: Word match in a log line, nothing is sold.
- reading-bilingual@lrz.org: Quota refers to third-party translation APIs, some free.
- reading-time@local: Collection membership only, nothing is sold.
- readray@lilys.ai: Needs maker's Chrome extension, README names no payment.
- readwise2zotero@seanlawson.net: Readwise account is a third party the maker does not run.
- reference-checker@hedwigai.com: Lasting free allowance of three checks a day, no account.
- referencecheck@korhonenaleksi.github.io: No account or API key used.
- referenceforzotero@woif-sha.github.io: Optional OpenAlex key and user's own model login.
- refs@zotero-refs.app: Keys are optional and for third-party sources.
- register02@cn.nutstore.net: Needs Nutstore login, README names no payment or paid plan.
- remindme@beichenzhao.github.io: Zotero account sync only.
- researchopia@zotero.plugin: Word match is a WeChat official account image.
- retainpdf-translate@zcode.local: Fees go to user's own model API, third party.
- rule-outline@local.zotero: Register means attachments and menus, nothing is sold.
- scholar-published-bibtex@github.com: DOI registration and Zotero account wording only.
- scholar-sidekick@scholar-sidekick.com: Free anonymous tier, free key for higher limits.
- scholium-bridge@zotero-scholium: Uses user's own Claude Code or Codex sign-in.
- scidownload@chen: Register means a command, nothing is sold.
- scihub-fetcher@dnnunn.github.io: OpenAlex credit is optional third party, Sci-Hub fallback.
- scihub@example.com: No login or token required.
- scite-zotero-plugin@scite.ai: No account or API key required.
- sdt-pack-sitter@search-works-for-zotero.invalid: Activation means app start, nothing is sold.
- semantic-search@ildon.github.io: Activations means neural network weights, nothing is sold.
- semantic-tagger@zotero.local: Credits go to Anthropic, a third party.
- sentence-focus@local: Account means a description, nothing is sold.
- snowball-sources@socratic-irony.github.io: Quota refers to OpenAlex, a third party.
- spellcheckcontext@kirka.local: Template wording only, nothing is sold.
- style-personal@nebularaven.local: Credits here means acknowledgements, nothing is sold.
- support@noedgeai.com: needs the maker's Doc2X login, README names no payment
- survey-papers-to-zotero-companion@vincent929-cyber.github.io: Paywall and account mentioned only as limits, nothing is sold.
- syllabus@janbaykara.com: Only a Buy Me a Coffee link appears.
- tabgroups@shourovj.github.io: Membership means tab groups, credits are acknowledgements.
- tara@linxzh.com: Zotero sync account only.
- tasks-timeline@zotero-plugin: Login manager stores a key, nothing is sold.
- texlate@hjfy.top: Bring your own model key, open source.
- titledrop@local: No account or key needed.
- todolist@groele.org: Zotero account and trademark wording only.
- uts-citation@gracefullight.dev: Only a Buy Me a Coffee link appears.
- vocab-book@custom.zotero.org: Baidu is an optional third party, Youdao fallback.
- vocabflow@moon.com: Free translation, paid providers are optional third parties.
- watch-folder-multiroot@local.zotero: GitHub CLI login for developers only.
- watch-folder@zotero-plugin.org: Quota refers to Zotero storage, not the maker.
- wayback-autosave@pranesh: Archive.org is a third party with free keys.
- weavero@mjthoraval: Only sponsorship and tips are asked for.
- wenxianyidu@wenxianyidu.local: Free engines or offline, paid APIs are third parties.
- westlaw-us@mkant18.github.io: Westlaw subscription goes to a third party.
- wikipedia-to-zotero@phobrla.github.io: Wikipedia account login only, nothing is sold.
- wmu-journal-tags@wmu.local: Register means a mechanism, nothing is sold.
- wordtranslator@example.com: Free engines by default, no account needed.
- writeflex@dominiklukes.net: MIT licensed, model account only for optional agent.
- xt-zotero-auto-classifier@xutao: Charges come from user's model provider, third party.
- yaobian@zotero: Zotero account sync only.
- yonghao.zou@epfl.ch: Template wording only, nothing is sold.
- z-permalink@zotero.org: Group library membership only.
- zaibar@fukeke.com: Provider bills user, maker asks only for donations.
- zenotes@alefa.net: Dropbox and Zotero accounts only, optional features.
- zmta-update-metadata@iiwenwen: Words are unrelated to payment, nothing is sold.
- zofiles@zofiles.dev: Credits here means acknowledgements, nothing is sold.
- zometaker@senior-developer: Credits here means acknowledgements, nothing is sold.
- zopilot@qyangcv.github.io: Own key or Codex subscription, third parties.
- zoplicate@chenglongma.com: Register means menus, nothing is sold.
- zostats@arrancurran.github.io: Works without account, optional third-party Semantic Scholar key.
- zot-cli-bridge@zotero-cli-cc.org: Only a Buy Me a Coffee link appears.
- zotagent@shzhao.local: Uses user's own agent CLI logins.
- zotassets@yunze.dev: Free and open source, coffee donation only.
- zotcard@zotero.org: Only a Buy Me a Coffee link appears.
- zotclip@cvrsg.dev: Login manager stores provider keys, nothing is sold.
- zotero-adobe-ocr@tshippen: Adobe is a third party with a free tier.
- zotero-agent-bridge@local: Pi CLI model account is user's own, third party.
- zotero-agent-bridge@zotero-agent: No cloud, account, or API key.
- zotero-agent-copilot@KinomotoMio.github.io: MinerU token is third party with free allowance.
- zotero-agent@autoagent.my: Web of Science plans are optional third-party services.
- zotero-agent@haozhihuiYmh150: Third-party model API keys only.
- zotero-agentibility@local: Collection membership only, nothing is sold.
- zotero-ai-assistant@agentpaper.dev: DeepSeek key is a third party.
- zotero-ai-butler@github.com: README says it has no paid channel, own API keys.
- zotero-ai-explain@vishnutskumar.github.io: Own subscriptions, keys, or free Ollama, third parties.
- zotero-ai-sidebar@local: Own API keys or website logins, third parties.
- zotero-ai-toolkit@vandemathieu: user's own provider key, OpenAlex is free
- zotero-arxiv-reader@theocuc: matched word is a code term, nothing sold
- zotero-ask@benshenhar.com: uses the user's own Codex account from OpenAI, a third party
- zotero-auto-tagger@dnnunn.github.io: free and local, no key or billing
- zotero-book-splitter@juntaoyang.local: works locally, optional AI uses the user's own API
- zotero-browser@ginixstudy.github.io: word refers to browser credentials, nothing sold
- zotero-c1life@euclpts.com: embeds Google's free Gemini web page
- zotero-cat@qianjindexiaozu.dev: user's own API key, stored locally
- zotero-citation-graph@jajaho.dev: no account, credits means acknowledgements
- zotero-claude-code@yufeixia: uses the user's own Claude account, a third party
- zotero-codex-bridge@myang-print.github.io: collection membership and OS account only
- zotero-codex@local: matched word is a code term, nothing sold
- zotero-context-translate@maverickzyc.github.io: quota belongs to MinerU, a third party
- zotero-declarative-bridge@deep-research.local: collection membership and activation of the plugin only
- zotero-deepseek@example.com: user's own DeepSeek key, paid to a third party
- zotero-deselect@local: local interface tweak, nothing sold
- zotero-elsevier-fulltext@ching-chiang.github.io: subscriptions are to Elsevier, a publisher
- zotero-excalidraw@zotero.org: only a Buy Me a Coffee donation link
- zotero-extra@coekfung.github.io: credits means acknowledgements
- zotero-feed-management@unitian: subscription means RSS feeds
- zotero-feed-sort@sebastiansherrah.github.io: subscription means feeds
- zotero-feishu@wu-uk.github.io: uses the user's own Feishu account, a third party
- zotero-figure-extract@achuan: quota comes from third-party AI Studio or Baidu
- zotero-format-metadata@northword.cn: matched word is about rich text, nothing sold
- zotero-github-sync@situkangsayur.github.io: quota and billing belong to GitHub, a third party
- zotero-glass@avi7ii.github.io: premium describes the look, nothing sold
- zotero-hjfy-split-reader@infinity4b.github.io: HJFY login only for some papers, no payment named
- zotero-keep-window@luke-evan: matched word is a code term, nothing sold
- zotero-literature-graph@paper-project.local: OpenAlex anonymous access or free key, a third party
- zotero-llm@github.com.yilewang: plugin is free, users pay only chosen third-party providers
- zotero-local-mcp-bridge@example.com: local bridge, collection membership only
- zotero-local-speech@Echo-Lian: local speech server, matched words are unrelated
- zotero-mark-reader@jin-taiyu.github.io: matched word is a shell command, nothing sold
- zotero-markdown-summary@diantao.local: plugin is free, user's own provider keys
- zotero-math-patch@local: rule mode is local, AI uses third-party DeepSeek
- zotero-mcp-plugin@lricher7329.github.io: collection membership only, nothing sold
- zotero-mcp-tags@opencode.local: credits means acknowledgements
- zotero-memory-management@unitian: subscription means feeds
- zotero-metadata-assistant@smorello.org: OpenRouter key or CUNY's own gateway, no sale by maker
- zotero-name-normalizer@marcinmilkowski.pl: group library member only, nothing sold
- zotero-notebooklm@migueldelm: uses the user's own Google login, a third party
- zotero-ocr@bib.uni-mannheim.de: activate means enabling a Zotero feature, nothing sold
- zotero-pdf-transfer@charlesapetersen.github.io: collection membership only, nothing sold
- zotero-pdf-translate-plus-plus@golden-pigeon: credit means acknowledgement
- zotero-pdf2md@qingpy.github.io: quota belongs to MinerU, a third party
- zotero-pdf2zh-pro@study-233: Pro is only the name, user's own API or ChatGPT plan
- zotero-pdf2zh@yuriyagn.github.io: user's own SiliconFlow key, a third party
- zotero-plugin-noduplicates@CommanderPho: GitHub login and a key shortcut only
- zotero-proxy-gui@royenheart: activate means switching proxy presets
- zotero-rag@cboulanger.github.io: self-hosted, open source, no subscription
- zotero-reading-bridge@volatile.static: institution's subscriptions, credits means acknowledgements
- zotero-reading-room@wuxinxin27.github.io: third-party model billing, Zotero account for sync
- zotero-readtrans@github.com: third-party translators, some with free engines
- zotero-reference-checker@najibprog: campus login in the user's browser, nothing sold
- `zotero-remarkable-usb@sentient-codebot.github.io`: works over USB, needs no Connect subscription
- `zotero-remarkable@alfakini.github.io`: `reMarkable` account is a third party's, no payment named
- zotero-settings-sync@gaviiiinnnn.github.io: Zotero account only
- zotero-sideline@shiys.local: user's own third-party API or agent
- zotero-siyuan@example.com: matched word means Windows registry, nothing sold
- zotero-skimming@00sapo.org: credits means acknowledgements
- zotero-smart-organizer@users.noreply.github.com: local, collection membership only
- zotero-spotlight@outlook.com: only a Buy Me a Coffee donation link
- zotero-tab-manager@rg4sun.dev: tab group membership only, nothing sold
- zotero-title-translator@zhouyi654.github.io: user's own third-party translation services
- zotero-translator-next@echouniverse.io: third-party translators, including free MyMemory
- zotero-tray@jaeho.dev: activation token is a Wayland term, nothing sold
- zotero-tts@xujialiu.top: free third-party voices work, only a donation to the maker
- zotero-vim-plus@zotero-vim: matched words mean key handling, nothing sold
- zotero-vocab-review@local: uses local Anki, login means Windows startup
- zotero-voice-edge@local: matched word is a code comment, nothing sold
- zotero-webai@lineex.dev: third-party web chats, only a donation asked
- zotero-wiki-citations@quinn.dev: credits means acknowledgements
- zotero-wikicite@wikidata.org: Wikidata login only, nothing sold
- zotero-youtube-transcripts@lstrzepek: YouTube sign-in message, credits means acknowledgements
- zotero10-hide-citation-highlights@XuebaStudy: credits means acknowledgements
- zotero2notion@local.plugin: user's own Notion account, a third party
- zotero@bibsonomy.org: account is a repo owner note, nothing sold
- zotero@texglot.org: no TeXGlot account, user's own third-party API
- zotero@wilddata.cn: needs the maker's free account, README names no payment
- zoteroattanger@polygon.org: credits means acknowledgements
- zoterochat@bowentian: user's own API key, third-party billing
- zoterocitation@polygon.org: collection membership, sponsorship link only
- zoterocitepreviewresizer@local: credits means acknowledgements
- zoterogpt-sidebar@workbuddy.local: third-party ChatGPT or DeepSeek web, free accounts work
- zoterogpt@polygon.org: core chat works with own API, Pro only adds extras
- zoteroinspire@itp.ac.cn: subscription means arXiv categories
- zoterojs-bridge@local: local bridge, collection membership only
- zoterolinkedmindmaps@oekeur.github.io: node membership, syncs through Zotero, no separate account
- zoteromagic@zoterocn.com: states a 7-day trial and a purchase link, not what stops after the trial
- zoteronamedannotations@oliverdudgeon.dev: credits means acknowledgements
- zoteropaperagent@github.com: free QR login gives a key, no payment named
- zoteropdftranslate@euclpts.com: free engines plus third-party translators
- zoteropick2anki@soyami.github.io: no account or key, uses local Anki
- zoteroragflow@yourname.com: RAGFlow is third-party and can run locally
- zoteroshortdoi@wiernik.org: Zotero account credentials mentioned only
- zoterostyle@polygon.org: core reading features are free, Pro only adds extras
- zoterotag@euclpts.com: plugin is free, only a sponsorship is asked
- zoterotransnator@euclpts.com: user's own DeepL or OpenAI keys, third parties
- zotfetch@edslab.research: publisher paywalls and institutional proxies, nothing sold
- zotldr@menyoung.github.io: team-configured third-party API key, nothing sold
- zotlink@example.com: matched words mean Windows commands and trying out
- zotlit@aidenlx.site: credits means acknowledgements
- zotmeta@roadtodream.tech: credits means acknowledgements
- zotradar@poesein: subscription means RSS feeds
- zoturead@zotero.org: only a Buy Me a Coffee donation link
- zotwanglele@wanglele.com: WebDAV account and internal task code, nothing sold
- zoty-bridge@zoty.dev: activates a local debug server, nothing sold
- zrr-companion@zotero-redisearch-rag: README says no paid tier, integrations are optional
- zsearch@z-search.dev: Azure region setting and third-party quota, nothing sold
- ztldr@aguvener: credits means acknowledgements
- zusia@firekern.github.io: uses own third-party CLI login, Zusia has no server
- zutilo@www.wesailatdawn.com: credits means acknowledgements
- zutilore@altairwei.github.io: activation of a toolbar tool, credits means acknowledgements
- zys-notebook@kazys.local: uses the user's own Google login, a third party
- zys-praetor@kazys.local: uses the user's installed third-party CLI login
- {c0f56f65-4363-4713-8f48-6bd18593c781}: embeds OpenAI's ChatGPT website, a third party

## Second read

The read date is 2026-11-02. This read covers the 34 entries that
`git diff --name-only --diff-filter=A c8f2b65 34a02a8 -- plugins/` lists as added
`meta.json` files. It uses the word list and matching rule above. It reads three
kinds of text. The first is each entry's `meta.json` description at `34a02a8`.
The second is its GitHub About text below. The third is each top-level file whose
name starts with README, ignoring case, at the SHA below. The read found 44 such
files, and every text was read.

The session read every hit and gave 0 marks. So no entry of this read has
`paidService`.

```text
ai-paragraph-notes@local.zotero	c850122022bb984c1474b8c620c2f969368c8dd6	Batch AI paragraph and figure-caption interpretations as native Zotero note annotations
babeldoc-translator@zhuo.local	ea400fb8cc72666709e5567528fc890dc9e8c655	Zotero 10 plugin for translating PDF attachments with an isolated BabelDOC environment.
bilingual-reader@local	b301de8799ad10147e78d08fee5fff9c8ca82ed3	Zotero 双语阅读器公开仓库
bilingual-reader@zotero.local	819b351753312b37003e665829d992df1cbea5b3	Bilingual-reader是一款用于Zotero 10阅读模式的PDF翻译，提供段落中英对照翻译、翻译结果输出。
bluebook-signals-for-zotero@mystery-lab.com	3a78f060e83c4e6b1f9ce749a371d92d6c4e5c3b	Zotero plugins to provide additional functionality for legal scholars writing in law reviews.
ccf-rank@euclpts.com	b5f4c1dba47c4f85937ae229e5016d48a4f867dc	Zotero 插件，用于显示文献的 CCF 会议和期刊等级，已更新至2026新版数据。
chatgpt-sidebar@zotero.local	4c4bb3c32251785997af7720e1bf0adf7034dbad	Zotero 阅读界面中的 ChatGPT 网页侧栏：选文解释、PDF 全文提问，可选 Chrome 本机登录连接，无需 API key。
citegraph@jaeho.dev	a2e83602e5b43616fb1c4c0abed0af09321425b3	Citation relationships in a clean force graph. Zotero 10+.
codex-pdf-bridge@local.personal	ae2ba6c64caa56c8f6cdd772da712099282342f7	Zotero–Codex–Obsidian literature bridge with native PDF annotations and structured notes.
codex-translate@zotero.local	4a8389a665f5458b13b47833470a4019d7254206	Zotero 9 英文文献全文翻译与中英对照阅读；使用本机 Codex，自动从上游准备 PDF 运行环境。
codex-zotero-bridge@guoxin-ink.github.io	87821f39ab111778706fef133a364dceef1b0587	Safely inspect, organize, and update a local Zotero library from Codex.
doi-column@anfang886.github.io	7f052b094793db8c2563d6897357109ab46e5f4d	none
extra-columns@petersharp.org	37dead3ada9ef8401b13233e1523d9786109d7b1	Show values from a Zotero item's Extra field as sortable columns in the item list
page-count@damarals	9aba6783ac13122e4e2af0c2f0d2f7cc6a617b79	Zotero plugin: items-list column showing each item's real PDF page count
paper-chat@zotero-llm-wiki	ffba96bd5471f961a5948bd678427a7bd92da0ac	Claude Code skills and plugin for research papers: ask about your Zotero PDFs with page-cited answers, search the literature via OpenAlex (no made-up DOIs), and build a self-updating literature wiki in Obsidian.
paper-chat@zotero.plugin	7df2eaae6ab86d7300e25ae04f51dfffc6caf6d3	AI 论文助手：论文问答、划词翻译、文献检索、笔记与 PPT 生成 ｜ AI research assistant: chat with papers, translate selections, find literature, and generate notes and slides
paper-lens@februarysea.github.io	5ae49f5516c5b1fdea5ab0a53bcaa858629e00a9	A lightweight Zotero PDF selection translator powered by Codex models.
paper-partner@qinsihan.github.io	3d318a1c0ebd507aee82308ac06ff2f256f6f80a	An attention-friendly Zotero plugin that answers Q: questions inside native notes.
paperflow@zotero.local	e5dbbb46c46eea287f6ad112e6e7428f5a1bfc41	none
pdf-to-md@local	6f930d6b39faec0996bd97bcfd6b5f2f5c1ff3cf	把zotero中的PDF附件转换为md附件，方便外部agent工具使用，使用MinerU构建，支持本地部署的MinerU
remarkable@damken.net	5931801e57040e324f68b424d6fa058b4565ae38	none
rtf-odf-scan-for-zotero@mystery-lab.com	27a6ae72e6bb048fa808cd987f95327f67efd70f	RTF/ODF-Scan for Zotero add-on
wo-yao-yan-pai@fish.com	218e43e0cba32fbbaf6b3feb61ad79e48306153b	none
zot2rm@fbkarsdorp.github.io	bc73632773597ce43f44f7fb47f2b9c3de7bb859	Sync Zotero attachments with a reMarkable tablet over USB
zotero-ai-notes@example.com	c0f1146f787d01bf3e1fa18ef9a0f0ca0e92c855	Turn Zotero PDF highlights and comments into evidence-checked Markdown notes and academic mind maps. Supports Zotero write-back, Markdown/OPML export, and XMind import.
zotero-mcp-plugin@autoagent.my	81d0777b49ded0959d197c7610d8b6e5f32c2485	It's a plugin extension in Zotero.  Zotero MCP Plugin enables integration between AI assistants and Zotero through MCP. Zotero MCP Plugin 是一个 Zotero 插件，通过 MCP协议实现 AI 助手与 Zotero深度集成。插件支持文献检索、元   数据管理、全文分析和智能问答等功能，让 Claude、ChatGPT 等 AI 工具能够直接访问和操作您的文献库。
zotero-mineru@example.com	e5bebf2a7afa18c1bb74325a2f953a91ca0d487c	Convert PDFs to Zotero notes with one click
zotero-pdf2md@yyds.dev	b6799b9ad7213535b55b755e4ebce92ef907c6e4	`zotero-pdf2md` 是一个面向 Zotero 7 的插件，用来把 PDF 附件转换为 Markdown 源包、译文 Markdown，以及可直接预览的 HTML。
zotero-random-read@xuan.dev	6da156df827c428df2380e6e520d1f621c117108	Zotero random read plugin
zotero-remarkable-sync@piwowarski.fr	0ad37d5c57c73450ba5ef7f10be58362aa3183a1	Bidirectionally sync PDFs and annotations between Zotero and the reMarkable tablet
zotero-research@local.invalid	faa7875b4dae6dd3df3e03fc9e79cffbf17cb45b	Zotero 10 网页 AI 阅读侧栏：网页中继 / API 直连 / MinerU 深度解析 / 知识沉淀
zoteroai@zixuwang	659ec5ab5b077b771e1bcbed04a92188ec5111dc	none
zoteropdf@euclpts.com	7bfb9af8ad51acb7bced04b920275894dc78ab98	Zotero plugin for export papers as PDF files
zotfetch@nikhilweee.me	73eab9f832161048d46e516b37f617e8f5915c79	none
```

### Second read: marked

None.

### Second read: no mark

The list found 17 entries with a hit, and 17 with none.

- `bilingual-reader@local`: since 0.3.4 it needs no activation code, and users pay for their own DeepSeek key
- `bluebook-signals-for-zotero@mystery-lab.com`: activated means opening a menu, nothing is sold
- `chatgpt-sidebar@zotero.local`: uses the user's own ChatGPT account, a third party
- `codex-pdf-bridge@local.personal`: the hit is a version upgrade, and it uses local Codex
- `codex-translate@zotero.local`: uses the user's own Codex login, a third party
- `codex-zotero-bridge@guoxin-ink.github.io`: states no paid service and no maker's cloud
- `doi-column@anfang886.github.io`: registration means DOI registrants, nothing is sold
- `extra-columns@petersharp.org`: cast member is a field name, and credits means acknowledgements
- `paper-chat@zotero-llm-wiki`: needs a paid Claude plan or API key, from a third party
- `paper-chat@zotero.plugin`: chat works with the user's own provider key, and only slide generation needs the maker's service
- `paper-lens@februarysea.github.io`: uses the user's own ChatGPT plan, a third party
- `paperflow@zotero.local`: uses the user's own Codex or Claude plan, a third party
- `zot2rm@fbkarsdorp.github.io`: works over USB with no cloud account
- `zotero-ai-notes@example.com`: the hit is the login manager that stores the user's key
- `zotero-mineru@example.com`: the hit means registering an attachment, and its MinerU token comes from a third party
- `zotero-remarkable-sync@piwowarski.fr`: reMarkable's cloud is a third party, and credits means acknowledgements
- `zotero-research@local.invalid`: logs in to third-party AI sites, with no maker's service

## Third read

The read date is 2026-11-03. This read covers the 7 entries that
`git diff --name-only --diff-filter=A 34a02a8 1b2cebf -- plugins/` lists as added
`meta.json` files. It uses the word list and matching rule above. It reads three
kinds of text. The first is each entry's `meta.json` description at `1b2cebf`.
The second is its GitHub About text below. The third is each top-level file whose
name starts with README, ignoring case, at the SHA below. The read found 10 such
files, and every text was read.

The session read every hit and gave 0 marks. So no entry of this read has
`paidService`.

```text
arxiv-source-helper@local.research	5e56853ef8e50b70f2f32f66efedf176e95c0720	Zotero plugin that automatically saves arXiv TeX sources and provides local section, keyword, and table queries for AI readers.
saved-search-folders@nickynoname.github.io	e5fee96ecfcb3f6842f46af3ae4c76af61f98d03	Organise Zotero's saved searches into folders, set your own order, and combine them with AND/OR. Stored in the search names, so nothing breaks without the plugin.
zhinfo@zotero.local	5798d8b92ec0540e6bd8c9a4d92acf9741e3929c	Zotero 插件：在条目信息面板加入「中文标题」与「中文摘要」，打开条目时自动翻译填入（MyMemory / OpenAI 兼容大模型 / DeepL / Google）
zotero-ai-collection@jiaxin.fan	c6b9b4156c5996aac6f19d95dc324bfc3fc217b1	Collection for Zotero：用 LLM根据「标题 + 摘要」为条目智能推荐 Zotero 分类，并提供可审核的确认对话框。
zotero-obsidian-readonly@example.com	566aaffa90ddf91dea922fc6cc2855dc1baa8fcb	Read-only push from Zotero to standalone Markdown
zotero-open-router@luciferer.github.io	fefb0f43237c636c2557b418c49bb88c6efbe3a5	Zotero 7–11 plugin to customize attachment double-click vs. Option+Double-Click routing, prioritize main article PDFs, and preview .md/.csv/.tsv/.json/.txt/.zip in internal tabs.
zotero-tray@local	fc3aed4396f5c1e132afbd3fab3ca69777742902	Windows 托盘插件，适用于 Zotero 10：关闭到托盘、恢复与激活、右键正常退出；纯源码，无附带 EXE/DLL。
```

### Third read: marked

None.

### Third read: no mark

The list found 3 entries with a hit, and 4 with none.

- `zhinfo@zotero.local`: works with free MyMemory or the user's own third-party key, and register means code sections
- `zotero-ai-collection@jiaxin.fan`: the hits are a trial on a test library and the user's own LLM key and quota, from a third party
- `zotero-tray@local`: activate and register mean window and icon handling, nothing is sold

## Fourth read

The read date is 2026-11-03. M085 moved two entries to other repos, so this read
covers those repos. It reads each repo's README at the SHA in
`paid-service-sweep-shas.tsv`. The session read the README lines on payment and
accounts, and gave 0 marks. So neither entry has `paidService`.

- `beaver@jlegewie.com` from `jlegewie/beaver-zotero` at `8b7fa5b4fc7a16769de95001f7fb0d4ccdf46342`: no mark. The README says "Beaver is available for free with your own API key or you can subscribe". A lasting free plan with a paid upgrade gets no mark (D-054). It asks for an account, and no payment is named for that.
- `pdf2zh@guaguastandup.com` from `guaguastandup/zotero-pdf2zh` at `5dd2eaf019f71266764c269bbd2104b559ae95cf`: no mark. The README sells nothing. It lists free engines and third-party engines that use the user's own key.
