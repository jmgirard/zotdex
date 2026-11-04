import { describe, expect, test } from "vitest";
import { CATEGORIES, categories, categoryOptions, OTHER } from "../src/site/categories.ts";
import type { DescriptionRecord } from "../src/site/description.ts";

function record(
  name: string,
  description?: string,
  { id = "a@example.org", repoDescription, overrides = [] }: { id?: string; repoDescription?: string; overrides?: DescriptionRecord["overrides"] } = {},
): DescriptionRecord {
  return { id, upstream: { version: "1.0.0", name, description, repoDescription }, overrides };
}

// For each category, a description its pattern matches and one it does not.
const CASES: Record<string, [string, string]> = {
  ai: ["Chat with the open paper using your own LLM.", "Chats are kept in a log file."],
  translation: ["Translates the selected text.", "Backs up Zotero translators and styles."],
  "pdf-reading": ["Adds a single-page reading mode.", "Reads metadata from PDF files."],
  notes: ["Exports annotations to a file.", "Keeps a notebook of tags."],
  citations: ["Converts EndNote citations in Word documents.", "Counts how often each paper is cited."],
  metadata: ["Finds missing DOIs for your items.", "Finds missing PDFs for your items."],
  attachments: ["Renames PDF files by title.", "Attaches tags to new items."],
  rankings: ["Shows the CCF rank of each venue.", "Shows the frank opinion of reviewers."],
  export: ["Syncs items into Notion.", "Imports items from a folder."],
  search: ["Draws citation graphs of a collection.", "Searches and replaces text in fields."],
  organization: ["Pin items to the top of a collection.", "Adds a tagline under the title."],
  appearance: ["A warm color theme for Zotero.", "Keeps the window open."],
  "ai-tools": ["A local MCP endpoint for your library.", "A bridge between two PDF revisions."],
  interface: ["Closes Zotero to the system tray.", "Keeps a table of contents."],
};

describe("CATEGORIES", () => {
  test("holds the 15 categories in the planned order", () => {
    expect(CATEGORIES.map((category) => category.name)).toEqual([
      "AI assistants",
      "Translation and dictionaries",
      "PDF reading",
      "Notes and annotations",
      "Citations and writing",
      "Metadata and cleanup",
      "Attachments and full text",
      "Journal rankings and citation counts",
      "Export and sync",
      "Search and discovery",
      "Library organization",
      "Appearance",
      "Connections for AI tools",
      "Window, tabs, and shortcuts",
      "Other tools",
    ]);
  });

  test("gives each category a unique slug of lowercase letters, digits, and hyphens", () => {
    const slugs = CATEGORIES.map((category) => category.slug);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("puts no id in both the include and exclude lists of one category", () => {
    for (const category of CATEGORIES) {
      expect(category.include.filter((id) => category.exclude.includes(id)), category.slug).toEqual([]);
    }
  });

  test("has a case for each category but Other tools, which no text matches", () => {
    expect(Object.keys(CASES).toSorted()).toEqual(
      CATEGORIES.map((category) => category.slug)
        .filter((slug) => slug !== OTHER)
        .toSorted(),
    );
  });
});

describe("categories", () => {
  test.each(Object.entries(CASES))("matches and leaves out records for %s", (slug, [matched, unmatched]) => {
    expect(categories(record("Helper", matched))).toContain(slug);
    expect(categories(record("Helper", unmatched))).not.toContain(slug);
  });

  test("gives a read record that no pattern matches Other tools alone", () => {
    expect(categories(record("Helper", "Keeps the window open."))).toEqual(["other"]);
  });

  test("gives Other tools to a read record whose only match an exclude entry removes", () => {
    expect(categories(record("Helper", "Ask Claude about the paper.", { id: "zofiles@zofiles.dev" }))).toEqual(["other"]);
  });

  test("gives metadata to the PMCID fetcher from its own words", () => {
    const fetcher = record("PMCID fetcher for Zotero", "PMCID fetcher", { id: "zotero-pmcid-fetcher@iris-advies.com" });
    expect(categories(fetcher)).toEqual(["metadata"]);
  });

  test.each([
    ["the User-Agent header for AI assistants", "Sets the User-Agent header.", "ai"],
    ["编译 (compile) for translation", "一键编译文档", "translation"],
    ["opening a citation in a new tab for the window category", "Opens the citation in a new tab.", "interface"],
    ["a text that opens with Note: for notes", "Note: this plugin needs Zotero 8.", "notes"],
    ["easy to read for organization", "An easy to read layout for the item pane.", "organization"],
    ["a two-column layout for organization", "Keeps a two-column layout.", "organization"],
    ["a magnifying glass for appearance", "Adds a magnifying glass button.", "appearance"],
    ["an import translator for translation", "Ships an import translator for one website.", "translation"],
    ["期刊缩写 for rankings", "更新期刊缩写", "rankings"],
    ["a fullwidth colon after Note for notes", "Note：需要 Zotero 8。", "notes"],
    ["easier to read for organization", "An easier to read layout.", "organization"],
    ["a multi-column layout for organization", "Keeps a multi-column layout.", "organization"],
    ["translating PDF attachments for attachments", "Translate Zotero PDF attachments in place.", "attachments"],
    ["a translation saved as a child attachment for attachments", "译文作为子附件保存", "attachments"],
    ["a download by DOI for metadata", "Downloads papers by DOI.", "metadata"],
    ["numbering that stays in sync for export", "The numbering stays in sync.", "export"],
    ["a font named 思源 for export", "使用思源黑体显示", "export"],
    ["a manner named after Obsidian for export", "An Obsidian-style quick switcher.", "export"],
    ["reading guides that papers go into for PDF reading", "Pushes papers into reading guides.", "pdf-reading"],
    ["reading guidelines for PDF reading", "Follows journal reading guidelines.", "pdf-reading"],
    ["PDF text columns for organization", "Steps through PDF pages column by column.", "organization"],
    ["splitting pages into columns for organization", "Splits pages into columns for small screens.", "organization"],
    ["reading a citation for organization", "Click a citation to read it in a new tab.", "organization"],
    ["a venue with no rank for rankings", "Imports papers from workshops and venues.", "rankings"],
    ["期刊文章 for rankings", "同步期刊文章", "rankings"],
  ])("leaves out %s", (_, description, slug) => {
    expect(categories(record("Helper", description))).not.toContain(slug);
  });

  test.each([
    ["A child note for each item.", "notes"],
    ["Pin a paper and mark it To Read.", "organization"],
    ["A sortable column of page counts.", "organization"],
    ["A liquid glass look.", "appearance"],
    ["Paper Translator", "translation"],
    ["显示期刊等级", "rankings"],
    ["Notes: a quick capture panel.", "notes"],
    ["AI chat with papers. Also runs a built-in MCP server.", "ai"],
    ["Import translations from a CSV of terms.", "translation"],
    ["Moves PDF attachments into folders.", "attachments"],
    ["Translate and move attachments to a folder.", "attachments"],
    ["管理条目的子附件", "attachments"],
    ["Finds the DOI for each item.", "metadata"],
    ["Fills item fields by DOI.", "metadata"],
    ["Looks up each item via DOI.", "metadata"],
    ["Keeps your library in sync with Google Drive.", "export"],
    ["Built-in sync with WebDAV folders.", "export"],
    ["发送到思源笔记", "export"],
    ["Updates journal abbreviations on items.", "metadata"],
    ["Sends an annotation to your SiYuan daily note.", "export"],
    ["A reading ruler for long lines.", "pdf-reading"],
    ["Adds split-view reading.", "pdf-reading"],
    ["Generates PDF bookmarks for a paper.", "pdf-reading"],
    ["Generates a PDF outline for a paper.", "pdf-reading"],
  ])("keeps a right use: %s gets %s", (description, slug) => {
    expect(categories(record("Helper", description))).toContain(slug);
  });

  describe("needs a stated feature for ai and attachments", () => {
    test.each([
      ["Helper", "A Zotero MCP server for AI agents."],
      ["Helper", "An MCP server inside Zotero for agents."],
      ["Helper", "A Codex skill and Zotero companion for surveying papers."],
      ["Helper", "A plugin with code entirely generated by AI."],
      ["Zotero MCP for Claude Code", undefined],
      ["Helper", "把论文处理和外部 Agent 工具串成流水线"],
    ])("gives no ai to %s: %s", (name, description) => {
      expect(categories(record(name, description))).not.toContain("ai");
    });

    test.each([
      ["Helper", "Chat with the open paper using your own LLM."],
      ["Helper", "A local-brain research agent in Zotero."],
      ["Helper", "Watches new papers and writes AI summaries for some papers."],
      ["Zotero AI", undefined],
      ["Helper", "AI 科研阅读助手"],
      ["Codex for Zotero", "A chat sidebar for the open paper."],
    ])("gives ai to %s: %s", (name, description) => {
      expect(categories(record(name, description))).toContain("ai");
    });

    test.each([
      "Translates PDFs with your own API, mono/dual attachments.",
      "A reading ruler that reads EPUBs and web snapshots too.",
      "生成大纲，支持原附件写入",
    ])("gives no attachments to: %s", (description) => {
      expect(categories(record("Helper", description))).not.toContain("attachments");
    });

    test.each([
      "Fetch missing attachments",
      "Renames PDF files by title.",
      "Saves the HTML version as a web page snapshot.",
      "Adds the result as a separate [OCR] attachment.",
      "把 PDF 附件转换为 Markdown",
    ])("gives attachments to: %s", (description) => {
      expect(categories(record("Helper", description))).toContain("attachments");
    });

    test.each([
      ["ai", "Summarizes papers and answers questions."],
      ["attachments", "Downloads papers and moves them to a folder."],
    ])("gives no %s from the further test alone: %s", (slug, description) => {
      expect(categories(record("Helper", description))).not.toContain(slug);
    });

    test("reads only the start of a long text for the further test", () => {
      const padding = "x".repeat(2000);
      expect(categories(record("Helper", `${padding} Chat with AI.`))).not.toContain("ai");
      expect(categories(record("Helper", `${"x".repeat(1900)} Chat with AI.`))).toContain("ai");
    });
  });

  test("gives a record with no upstream facts no category from its id", () => {
    const failed = { id: "zotero-gpt@notes.app", failure: { name: "not-read" }, overrides: [] };
    expect(categories(failed)).toEqual([]);
    expect(categories({ ...failed, id: "condense-info-view@example.com" })).toEqual(["appearance"]);
  });

  test("lists the categories in CATEGORIES order", () => {
    expect(categories(record("Helper", "Translates notes in the single-page reading mode with AI."))).toEqual([
      "ai",
      "translation",
      "pdf-reading",
      "notes",
    ]);
  });

  describe("reads each of the four texts", () => {
    test("the name after a name override", () => {
      const renamed = record("Helper", "Keeps the window open.", { overrides: [{ field: "name", value: "Paper Translator" }] });
      expect(categories(renamed)).toEqual(["translation"]);
      expect(categories(record("Helper", "Keeps the window open."))).toEqual(["other"]);
    });

    test("the shown description from a description override", () => {
      const corrected = record("Helper", "Keeps the window open.", {
        overrides: [{ field: "description", value: "Translates the abstract." }],
      });
      expect(categories(corrected)).toEqual(["translation"]);
    });

    test("the manifest description while the GitHub one is shown", () => {
      // The manifest text is all CJK, so the GitHub text shows (see shownDescription).
      const both = record("Helper", "论文标题翻译插件", { repoDescription: "Keeps the window open." });
      expect(categories(both)).toEqual(["translation"]);
    });

    test("the GitHub description while the manifest one is shown", () => {
      const both = record("Helper", "Keeps the window open.", { repoDescription: "Translates the abstract." });
      expect(categories(both)).toEqual(["translation"]);
    });
  });

  test("adds a category for an id on its include list", () => {
    const text = "Hides empty fields in the Info panel.";
    expect(categories(record("Helper", text))).toEqual(["other"]);
    expect(categories(record("Helper", text, { id: "condense-info-view@example.com" }))).toEqual(["appearance"]);
  });

  test("leaves out a category for an id on its exclude list, over a matching pattern", () => {
    const text = "Ask Claude about the paper, in a glass panel.";
    expect(categories(record("Helper", text))).toEqual(["ai", "appearance"]);
    expect(categories(record("Helper", text, { id: "zusia@firekern.github.io" }))).toEqual(["ai"]);
  });
});

describe("categoryOptions", () => {
  test("lists Other tools last even with the most records, and the others by most records with ties in list order", () => {
    const records = [
      record("One", "Keeps the window open."),
      record("Two", "Keeps the window open."),
      record("Three", "Keeps the window open."),
      record("Four", "Renames files by title."),
      record("Five", "Exports annotations to a file."),
      record("Six", "Adds notes."),
    ];
    expect(categoryOptions(records).map(({ value, text }) => [value, text])).toEqual([
      ["notes", "Notes and annotations (2)"],
      ["attachments", "Attachments and full text (1)"],
      ["export", "Export and sync (1)"],
      ["other", "Other tools (3)"],
    ]);
  });
});
