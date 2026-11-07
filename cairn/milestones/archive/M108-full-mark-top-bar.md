# M108: Show the full Zotdex mark in the top bar

**Status:** done (2026-11-06, PR #857 https://github.com/jmgirard/zotdex/pull/857)

**Goal:** The site's top bar shows the full Zotdex mark at 32 px beside a larger site name, and the lens mark stays only in the favicon files (D-074).

**Outcome:** `src/site/logo.ts` exports `fullShapes(fills?)`, which writes the full mark's body (lens opening, three lights, and lid gap cut out), disc, and Z with fills for the PNG files or with the classes `logo-body`, `logo-disc`, and `logo-z`; `pictureSvg` uses it with the light fills, so `favicon.svg`, `favicon.png`, `apple-touch-icon.png`, and `preview.png` stay byte-identical (cmp against the branch point's build). The top bar in `Base.astro` draws `fullShapes()` at 2rem with the brand text at `--text-xl`; the body takes `--accent`, and forced colors fill the body and disc with `CanvasText`. Site tests compare the top bar's tags with `pictureSvg("apple-touch-icon.png")` and check the size and fill rules; `docs/site.md`, DESIGN, and the Unreleased CHANGELOG logo entry say the top bar shows the full logo. Eight browser-pane views (home and plugin page, 375 and 1280 px, light and dark) showed the lights and lid line.

**Decisions:** D-074 (supersedes D-072's top-bar clause). Milestone-local: none.

**Review:** Four-lens fan-out, 14 finding lines: 4 fixed (a changelog line joined to 103 characters, a test check that repeated covered geometry, DESIGN's same-shapes claim missing "less their fills"), 5 sent to parked rows ("Tighten the home controls at larger text": larger text not looked at, wrap from about 494 px, Chromium only; "Tighten link previews and the icon": disc contrast, forced colors not looked at), 5 rejected as planned changes, style, or false. Hygiene marked 8 lessons used, captured the full-size zoom lesson, and evicted the lowest-ranked lesson, 2026-11-02 (M082, used M090), on GraphQL batch reads; no row unparked.
