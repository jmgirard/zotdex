import { describe, expect, test } from "vitest";
import { holdsSource } from "../src/build/source.ts";

describe("holdsSource", () => {
  test.each<[string, string[]]>([
    ["no names", []],
    ["a dotfile and a dot-folder", [".gitignore", ".github"]],
    ["a README stem", ["README"]],
    ["a README with an extension no other test names", ["README.rst"]],
    ["license stems", ["LICENSE", "LICENCE.rst", "COPYING"]],
    ["other project file stems", ["NOTICE", "CHANGELOG", "CHANGES.rst"]],
    ["an XPI", ["plugin-1.0.xpi"]],
    ["Markdown and text", ["guide.md", "notes.txt"]],
    ["an update.rdf", ["update.rdf"]],
    ["images", ["a.png", "b.jpg", "c.jpeg", "d.gif", "e.svg", "f.webp"]],
    ["update files", ["update.json", "updates.json", "update-beta.json"]],
    ["doc and image folders", ["docs", "doc", "images", "image", "img", "assets", "screenshots"]],
    ["build and release folders", ["dist", "build", "releases", "update", "updates"]],
    ["upper-case names", [".GITHUB", "ReadMe.MD", "PLUGIN.XPI", "UPDATE.JSON", "DOCS"]],
    ["a release repo", [".github", "README.md", "zotero-magic-for-user.xpi"]],
  ])("no source: %s", (_, names) => {
    expect(holdsSource(names)).toBe(false);
  });

  test.each<[string, string[]]>([
    ["one source file beside non-source names", [".github", "README.md", "plugin.xpi", "bootstrap.js"]],
    ["a source folder", ["README.md", "src"]],
    ["a JSON file that is not an update file", ["README.md", "package.json"]],
    ["a name that only starts with a folder's name", ["docs-site"]],
    ["a repo with source", [".eslintrc.json", ".github", ".gitignore", "README.md", "bootstrap.ts", "client", "esbuild.js", "gen", "images", "lib.ts", "package-lock.json", "package.json", "schema", "tsconfig.json"]],
  ])("source: %s", (_, names) => {
    expect(holdsSource(names)).toBe(true);
  });
});
