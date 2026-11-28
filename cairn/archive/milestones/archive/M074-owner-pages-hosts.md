# M074: Allow owner GitHub Pages update hosts

**Status:** done (2026-11-02, PR #799 https://github.com/jmgirard/zotero-plugin-index/pull/799)

**Goal:** The bot no longer holds a pull request whose `update.json` is on the repo owner's own `<owner>.github.io` site.

**Outcome:** `holdReasons` (`src/discover/holds.ts`) gives no `update-host` when the host that `update_url` names is
`<owner>.github.io`, compared in lowercase on both sides. Another owner's site, a subdomain, a port, and hosts outside
GitHub stay held. `pluginRepo` keys `/users/<owner>` in lowercase. `HOLD_TEXT`, README, DESIGN, and CHANGELOG state the
rule. After the merge, #473, #468, #510, and #753 were released (`Hold: none`, `UNHELD_TEXT`, detail lines and `hold`
label removed), each read first and read back; the daily merge job merges each that passes `pnpm check`. By the user's
choice at the merge question, #142 stays held, since its address answers 301 to `forrt.org`. The rule reads only the
declared host, so such a redirect gets no hold on a future pull request.

**Decisions:** D-043 (the rule); D-044 (write access can also publish; a custom domain's redirect is a further party).

**Review:** Claim audit, 13 claims read, 1 corrected. Four-lens fan-out, 22 findings: 4 fixed (D-044, DESIGN wording and
wrap, CHANGELOG wording, work-log correction), 5 to new row "Hold update files that leave owner sites", normal; 13
rejected. CI passed. Candidate "Allow owner GitHub Pages update hosts" graduated. Lessons: 3 used M074, 1 captured;
evicted by rank: 2026-10-25 (M007).
