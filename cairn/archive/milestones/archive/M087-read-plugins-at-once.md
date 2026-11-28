# M087: Read plugins a few at a time

**Status:** done (2026-11-03, PR #817 https://github.com/jmgirard/zotero-plugin-index/pull/817)

**Goal:** A normal daily build reads every plugin before its time limit, with room for the index to grow.

**Outcome:** `buildData` in `src/build/build.ts` reads up to `READS_AT_ONCE` (4) plugins at once through a pool of workers, which start reads in D-028's order. `pacedApi` starts each `api.github.com` fetch call of the plugin reads at least `API_GAP_MS` (80) apart in a queue that does not wait for answers, and other hosts do not wait. `BUILD_LIMIT_MS` stays at 18 minutes as a safety stop, and `not-read` keeps its meaning. `TimeLimits` gains `readsAtOnce` and `apiGapMs`. Serial builds at about this size took 14:45 and 19:38 in the `pnpm build` step on 2026-11-03; branch runs 41689697258 and 41690770665 took 5:08 and 5:32 at 736 plugins, with no `not-read` and no HTTP 403 or 429 from the API. A build used 1527 of the `core` limit of 5000 API requests an hour, 2.07 a plugin, about 300 a minute.

**Decisions:** D-058 (four reads at once with paced API requests, annotating D-015 and D-028). The question set chose it over a longer limit, and over keeping each unread plugin's last good record here, which went to a candidate row. The plan rejected serial API requests with parallel downloads, since API requests took 61 of 94 s in a local sample.

**Review:** Criteria audit (full) 8 findings, all applied. Claim audit 44 claims, 1 corrected. Two four-lens passes, 39 findings: 15 fixed, among them the 64 KiB stdout test, which no longer filled the pipe and now fails with `cli.ts`'s flush removed, a fetch that throws at once, and widened test bounds; 6 to parked row "Tighten the paced build reads"; 18 rejected, 1 of them as edge (`readsAtOnce: 0`). One review return, for AC4's test on the odd day. New rows: "Keep a plugin's last good record", "Retry build reads GitHub refuses", "Tighten the paced build reads". Row "Read plugins a few at a time" graduated. Lesson 2026-10-31 (M069) on `actions/upload-artifact` was evicted by rank for the new M087 lesson.
