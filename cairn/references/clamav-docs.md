# clamav-docs — how clamscan reports a file, and ClamAV's rules for signature downloads

**Provenance.** Ingested 2026-11-07 by M115. The `clamscan` man page comes from
https://manpages.ubuntu.com/manpages/noble/en/man1/clamscan.1.html, for the
Ubuntu 24.04 package `clamav` 1.5.4+dfsg-0ubuntu0.24.04.1. The agent downloaded
it with curl and kept its text in `cairn/references/sources/` (gitignored), as
`clamscan-man-noble.txt`. The freshclam FAQ
(https://docs.clamav.net/faq/faq-freshclam.html), the signatures page
(https://docs.clamav.net/manual/Signatures.html), and the Docker page
(https://docs.clamav.net/manual/Installing/Docker.html) were read with a web
fetch tool. Cloudflare refused curl for them, so they are not on the shelf.
Pagination: none.
Extraction: verified 2026-11-07 against the shelved man page by a search of its
text. The three docs pages have no saved copy to re-verify against.

**Citation.** Cisco Talos. ClamAV documentation and the `clamscan(1)` manual
page. https://docs.clamav.net/.

**Role.** Settles the `clamscan` options, exit codes, and limits that
`src/malware-scan/` relies on, and the download rules behind the weekly scan.

## Extracted values

- Exit codes (man page, "RETURN CODES"): 0 means no virus found, 1 means one
  or more found, 2 means some errors occurred.
- `--scan-archive` defaults to yes, so a zip file (an XPI) is unpacked and its
  files are scanned.
- `--alert-exceeds-max` (default no) reports a file that passes the file size,
  scan size, or recursion limit as `Heuristics.Limits.Exceeded`.
  `--alert-encrypted` (default no) reports encrypted archives and documents.
  Without these options, such a file is not reported, so it reads as clean.
- Limits: `--max-filesize` 100 MB, `--max-scansize` 400 MB, `--max-files`
  10000, `--max-recursion` 17, `--max-scantime` 120000 ms. The index's own
  XPI limit is 50 MB (`XPI_MAX_BYTES`).
- `--no-summary` drops the closing summary, and `--stdout` writes messages to
  standard output.
- A result line reads `<path>: OK`, `<path>: <signature> FOUND`, or
  `<path>: <message> ERROR`. The man page does not state this form. It is
  the form of ClamAV's own output, and the tests of `src/malware-scan/` fix it.
- The signatures come as CVD files, `main.cvd` and `daily.cvd` among them, a
  format that the signatures page calls "a digitally-signed container".
- The freshclam FAQ: a 429 answer means the client is rate limited, and
  hosts on shared cloud providers such as Azure "will most likely be rate
  limited". Scripted downloads with wget or curl are refused, so only
  freshclam or cvdupdate can fetch the signatures.
- The Docker page asks users not to download the full signature set or the
  large database images "on a regular basis".
- No page read names terms of use for the signatures or limits on showing
  scan results. ClamAV itself is under the GPLv2.

## What this means for Zotdex

The scan runs once a week with freshclam, never curl. A GitHub runner sits on
Azure, so freshclam can be refused with a 429. Then that week's scan does not
run, and the carried results stay. The scan passes `--alert-exceeds-max` and
`--alert-encrypted`. A file that one of them reports gets no result, since
ClamAV did not scan all of it.
