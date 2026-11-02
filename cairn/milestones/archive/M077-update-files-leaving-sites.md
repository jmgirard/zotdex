# M077: Hold update files that leave owner sites

**Status:** done (2026-11-02, PR #802 https://github.com/jmgirard/zotero-plugin-index/pull/802)

**Goal:** The bot holds a pull request whose update file leaves the repo owner's `<owner>.github.io` site by a redirect, or is read over plain http.

**Outcome:** `downloader` (`src/upstream/reader.ts`) records each URL it requests. `readUpstream` gives them as
`updateRoute` beside `topics`, outside `UpstreamFacts`, so the published data and schemas are unchanged.
`readUpdateRoute` gives the route for one address with no body read. `holdReasons` (`src/discover/holds.ts`) keeps the
named-host rule and adds two: a file named on `<owner>.github.io` passes only if every URL stays on that host, and any
`http:` URL holds on every host. Redirects from `github.com` and `raw.githubusercontent.com` are not tested, since 374
of 671 listed plugins' addresses end on `release-assets.githubusercontent.com` (read 2026-11-02). `HoldDetails` gains
`updateHosts` and `updateHttp`, which `entrySchema` takes and `holdDetailLines` prints as "Update file redirects to:"
and "Update file read used http: yes". `pnpm refresh-holds` reads the route for an `update-host` hold, within 60
seconds per pull request, and a failed read fails that pull request. `HOLD_TEXT`, README, DESIGN, and CHANGELOG state
the rules. After the merge, `--apply` edited 10 open held pull requests: 7 gained a redirect line (#142 names
`forrt.org`), and #289, #485, and #592 got newer name-match facts. A read-back of each showed only the detail lines
changed, with each Hold line and label the same. #142 stays held by the M074 choice.

**Decisions:** D-047 (the rules; the user chose to hold http too); D-048 (the read that decides the hold happens once).

**Review:** Criteria audit (full) 8 findings, all fixed. Claim audit 72 claims read, 2 corrected. Four-lens fan-out, 28
findings: 11 fixed (60-second read limit, DESIGN, CHANGELOG, README wording, D-048, two test checks), 4 to rows (new
parked "Tighten the refresh-holds update read"; "Close gaps in bot holds and merges", item (8)), 13 rejected. CI passed.
Candidate "Hold update files that leave owner sites" graduated. Lessons: 4 used M077, none captured.
