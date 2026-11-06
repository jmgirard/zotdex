import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { writeData } from "../src/build/build.ts";

test("gives each schema that the build publishes the $id of its own published address", async () => {
  const out = mkdtempSync(join(tmpdir(), "zpi-schemas-"));
  try {
    expect(await writeData(out, "{}")).toMatchObject({ ok: true });
    const files = readdirSync(join(out, "schemas"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const schema = JSON.parse(readFileSync(join(out, "schemas", file), "utf8")) as { $id?: unknown };
      expect(schema.$id, file).toBe(`https://zotero-plugins.jmgirard.com/schemas/${file}`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
