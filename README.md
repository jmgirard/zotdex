# Zotdex

Zotdex is a community index of plugins for Zotero 7 and later. The index
lists plugins and links to the releases of each author. It does not host
plugin files, and it does not review or endorse plugins. The index is
unofficial, is not affiliated with or endorsed by Zotero, and cannot vet the
plugins it lists.

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

The code is under the [MIT License](LICENSE). The index's facts, its
categories, and its maintainer's text are under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Plugin names,
descriptions, and other text keep their authors' terms.
[docs/license.md](docs/license.md) gives the details and names the files
with third-party parts.
