# Zotdex <img src="https://zotdex.jmgirard.com/logo.svg" align="right" height="139" alt="Zotdex logo" />

Your field guide to Zotero plugins.

Zotdex is a community index of Zotero plugins. Each entry tells you what a
plugin does, who makes it, and which Zotero versions it supports. The index
links to the releases of each author and does not host plugin files. Zotdex
is an independent project, not part of Zotero, and it doesn't test the safety
or features of the plugins it lists, beyond a malware scan by ClamAV.

## The site

The website <https://zotdex.jmgirard.com/> shows the index. Its About page
says how the index reads the declared range, the start tests, the user
reports, and the descriptions.

## The data

The index publishes its data file on GitHub Pages:

- Data: <https://zotdex.jmgirard.com/v1/plugins.json>
- Schema for the data file:
  <https://zotdex.jmgirard.com/schemas/plugins.v1.schema.json>
- Schema for `index.json`:
  <https://zotdex.jmgirard.com/schemas/index.v1.schema.json>

## Asking for a change

Each of these forms opens a public GitHub issue:

- [Add a plugin](https://github.com/jmgirard/zotdex/issues/new?template=add-plugin.yml)
- [Report that a plugin works](https://github.com/jmgirard/zotdex/issues/new?template=works.yml)
- [Report that a plugin is broken](https://github.com/jmgirard/zotdex/issues/new?template=broken.yml)
- [Change a plugin's name or description](https://github.com/jmgirard/zotdex/issues/new?template=text-change.yml)
- [Add a screenshot to a plugin's page](https://github.com/jmgirard/zotdex/issues/new?template=screenshot.yml)
- [Remove a plugin or report harm](https://github.com/jmgirard/zotdex/issues/new?template=remove-plugin.yml)

For other feedback, use the
[GitHub Discussions](https://github.com/jmgirard/zotdex/discussions).

## Documentation

- [docs/site.md](docs/site.md): what each page of the site shows.
- [docs/data.md](docs/data.md): the data file and the format of the entries
  under `plugins/`.
- [docs/requests.md](docs/requests.md): what happens to each kind of issue
  above.
- [docs/maintaining.md](docs/maintaining.md): setup, the bot, the build,
  the start tests, and the tests.
- [docs/license.md](docs/license.md): the license terms in full.

## License

The code is under the [MIT License](LICENSE), except the third-party parts
that [docs/license.md](docs/license.md) names. The index's facts, its
categories, and its maintainer's text are under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Plugin names,
descriptions, icons, screenshots, and other work from plugin authors and owners
keep their terms. The license page gives the details.
