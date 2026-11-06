import type { PluginRecord } from "../build/build.ts";
import { majorStart } from "./version.ts";

// A shields.io endpoint badge: https://shields.io/badges/endpoint-badge
export interface Badge {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
  cacheSeconds: number;
}

// The site's accent blue, for a badge that names a start.
const STARTED_COLOR = "#1d5fb8";

// The README badge of a record (D-071): the Zotero majors whose newest start result is
// `started`, never a claim that the plugin works (D-023). A record that keeps earlier facts
// (D-066) is read from them like any other.
export function badgeFor(record: PluginRecord): Badge {
  const badge = (message: string, color = "lightgrey"): Badge => ({ schemaVersion: 1, label: "Zotdex", message, color, cacheSeconds: 3600 });
  if (!record.upstream) return badge("no data");
  const tests = record.startTests;
  if (!tests) return badge("not start-tested");
  const majors = [...new Set(tests.map(({ zotero }) => zotero.split(".")[0]!))]
    .filter((major) => majorStart(record, major)?.result === "started")
    .sort((a, b) => Number(a) - Number(b));
  return majors.length > 0 ? badge(`started in Zotero ${majors.join(" · ")}`, STARTED_COLOR) : badge("no start in tests");
}
