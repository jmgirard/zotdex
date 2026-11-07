# virustotal-terms — what VirusTotal's terms allow for a public malware scan fact

**Provenance.** Ingested 2026-11-07 by M115 from
https://docs.virustotal.com/docs/historic-terms-of-service.md and
https://docs.virustotal.com/reference/public-vs-premium-api.md. The agent
downloaded both with curl to `cairn/references/sources/` (gitignored), as
`virustotal-historic-terms.md` and `virustotal-public-vs-premium-api.md`.
Pagination: none. The terms page reads "Last Updated January 27, 2021".
Extraction: verified 2026-11-07 against the downloaded files, by a search of
their text.

**Citation.** VirusTotal. "Historic Terms of Service" and "Public vs Premium
API". VirusTotal documentation. https://docs.virustotal.com/.

**Role.** Settles whether Zotdex can show VirusTotal results on its pages and
upload plugin files to VirusTotal. M115's T1 stopped on it.

## Extracted values

- The current terms link `https://docs.virustotal.com/docs/terms-of-service`
  redirects to Google Cloud's general terms (`https://cloud.google.com/terms`).
  The historic page links "Current Terms of Service" to
  `https://cloud.google.com/terms/secops`, which holds Google Cloud's terms for
  paying customers. Neither page names the free public API or the free site
  — observed 2026-11-07.
- Historic terms, "Restrictions on Your Use of the Service": a user must not
  "publicly display, republish, upload, post, transmit, resell or distribute
  in any way material, information or functionalities from the Service". The
  clause goes on to name antivirus testing and harm to the antivirus industry
  as included cases, and it names no exception.
- Historic terms: a user must not "Publicly attribute the intelligence you
  receive through the Service to any VirusTotal Partner" without that
  Partner's permission.
- Historic terms: uploading a sample gives VirusTotal "(and those we work
  with)" a worldwide, irrevocable, transferable licence to publish, publicly
  display, and distribute all content in the sample.
- Public API page: 500 requests a day and 4 a minute. The API "must not be
  used in commercial products or services" or "in business workflows that do
  not contribute new files".

## What this means for Zotdex

The only terms that VirusTotal publishes for its free service bar showing its
results in public. An upload also grants VirusTotal a licence on code that
Zotdex does not own. A scan count on a public page needs current terms that
allow it, or VirusTotal's written permission.
