# Profile

## Verify

The command(s) `/milestone-implement` and `/hotfix` run to check a task before
ticking it off: `pnpm test` (type check, then Vitest) and `pnpm check` (the
entry checker over `plugins/`). pnpm is not installed on the maintainer's
machine, so run it as `npx -y pnpm@12.15.0`, the version `package.json` pins.

Toolchain checks `/milestone-review` runs *in addition to* the universal
cairn-file checks (`cairn_validate`, coverage completeness, `cairn_impact`).
Generic default: **none** — the universal cairn-file checks are the whole
consistency gate.

## Changelog

The repo's changelog file, read by `/hotfix`, the release-walk, and the
consistency-gate: `CHANGELOG.md`, with new entries under its `## Unreleased`
heading.

## Release

The release procedure `/cairn-release` follows. Generic default: a minimal
language-agnostic walk — no package-registry submission; the tag is the release:
- Decide the version bump (patch, minor, or major) from `CHANGELOG.md`, the
  file the `## changelog` slot names.
- Consolidate `CHANGELOG.md`: retitle its `## Unreleased` heading to the
  version, group the entries, and remove noise.
- Bump the repo's version marker and commit the release prep to the default
  branch (docs/metadata only).
- Tag `v<version>` and push the tag at the user's approval — no registry step.
- Where the `origin` remote is GitHub and `gh` is available, the handoff also
  provides a `gh release create` command whose body is the new changelog
  section (provided, never run — the universal step 4).
