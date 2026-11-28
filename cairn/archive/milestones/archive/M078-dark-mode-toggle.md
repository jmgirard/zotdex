# M078: Add a dark mode toggle to the site

**Status:** done (2026-11-02, PR #803 https://github.com/jmgirard/zotero-plugin-index/pull/803)

**Goal:** Each page of the site has a top-bar button that flips between the light and dark color schemes and keeps the visitor's choice.

**Outcome:** `Base.astro` puts a hidden sun and moon button in the top bar's `nav` on every page. `src/site/theme.ts` holds `applySavedTheme`, the classic script in `<head>` that sets `data-theme` before the body parses, and `wireThemeButton`, the classic script right after the button, which shows it. A press flips the scheme and saves it in `localStorage` under `zotero-plugin-index-theme`, named for this site since the owner's other Pages sites share the origin. Flipping back to the system's scheme clears the key and the attribute. The button rereads the key at `pageshow` and `storage`, and a press whose save failed holds on that page. The dark tokens sit in two blocks with the same custom properties: `:root:not([data-theme="light"])` under the media query and `:root[data-theme="dark"]`. Rejected at the plan: a third "System" state (the user's choice), an external script file, and `light-dark()`. The user chose one hand run of Build data after the merge.

**Decisions:** none. D-026 already allows a script on any page.

**Review:** Full fan-out, all seven criteria met. Of 30 findings, 18 were fixed on the branch, 11 rejected, and 1 went to the parked row "Check the theme button's double label". The fixes include the failed-save undo, a wrapping `nav` for larger text, and tests bound to source text. Two rejects are `edge`: Safari before 14 and browsers without `??` keep the button hidden. Open at merge: at 200% root text the home page scrolls sideways from content below the top bar. Graduated "Add a dark mode toggle to the site". Corrected the 2026-10-30 (M060) lesson to allow browser globals. Eleven lessons were marked `used M078`, and no lesson was added or removed.
