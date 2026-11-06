import { badgeFor } from "../../../../src/site/badge.ts";
import { loadData, type PluginRecord } from "../../data.ts";

// One shields.io endpoint file per record, at badges/<raw id>.json (D-071).
export function getStaticPaths() {
  return loadData().plugins.map((record) => ({ params: { id: record.id }, props: { record } }));
}

export function GET({ props }: { props: { record: PluginRecord } }): Response {
  return new Response(`${JSON.stringify(badgeFor(props.record))}\n`, { headers: { "Content-Type": "application/json" } });
}
