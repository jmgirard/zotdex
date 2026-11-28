# RR01: Removal rules before launch (M118, M119)

- **Date:** 2026-11-09
- **Answers:** `cairn/reviews/RB01-removal-rules.md`
- **Status:** advisory. The brief did not request binding criteria.

I read the materials the brief lists and nothing else. I did not open any
plugin's repository and did not search the web. Where I name a court case
below, it is from memory and unverified. M119 T1 must confirm each one
before it relies on it. This is not legal advice. Where a point turns on
law, I name the kind of legal question.

## Summary

The draft is sound in its shape: harm defined by design rather than by
outcome, a copyright ground that rests on a fact a reader can check, and a
return path by ground. I disagree with none of the four choices in the
brief's constraints. Six points need a change before implementation:

1. The court test as worded leaves open whether Sci-Hub itself passes,
   because nearly every ruling against it is a default judgment or a
   blocking order. As worded it may also cover the Internet Archive.
   (Q2, R1)
2. The return condition for harm says "a maintainer and the malware scan
   find clean". That is a vetting claim, which D-051 and D-082 rule out.
   (Q5, R6)
3. Rule 3 has no way back for a removal that was a mistake. D-062 names
   that case as its own falsifier. (Q5, R7)
4. D-062 says "a plugin with no report stays listed", and D-053 says a
   held pull request closes only for a misleading entry. Both become
   false under the draft and need an annotation. (Q4, Q6, R4, R9)
5. A plugin can drop the site, come back, and add it again, and nothing
   looks at listed plugins after the first sweep. (Q5, Q7, R8)
6. The form's new reason must name the narrow ground. A choice that says
   "copyright" invites complaints the ground does not cover, such as one
   author saying another copied code. (Beyond the brief, R11)

## 1. Harm

The definition covers the main cases: malware, theft of credentials or
files, hidden upload of library data, deliberate damage, and use of the
computer for someone else's ends. It excludes a bug, and it excludes a
plugin that does what it says. Defining harm by design is the right basis
for an index that cannot test outcomes.

Behaviors it gets wrong or leaves unclear:

- **Told but not agreed.** "Did not agree to and were not told about" has
  two tests joined by "and". A reader cannot check agreement. A person who
  installs after being told has agreed. Keep only "were not told about".
- **Implied by the function.** A translation plugin sends an abstract to a
  translation service. An AI plugin sends a PDF's text to a model. Neither
  may say "we send library data" in so many words. Read strictly, the
  draft's example "sending library data somewhere without saying so"
  covers both. The rule should say that what the plugin plainly says it
  does counts as told.
- **A ping with no library data.** A plugin that reports an anonymous
  install count or checks its own version sends something without saying
  so. The general sentence covers it. The examples do not. I would not
  call this harm. The rule should say that harm of this kind means library
  contents, account details, or something that identifies the person.
- **Who built it.** "The plugin is built to" reads as the author's intent.
  A release that an attacker changed, through a taken-over account or a
  poisoned dependency, was not built by the author to do harm, yet rule 3
  treats it as removable. Say "a release of the plugin does", so the test
  is about the file, and leave intent to the return path.
- **Acting against other plugins or the user's settings.** A plugin that
  disables a rival plugin, changes another plugin's update address, or
  holds the user's notes until they pay falls under the general sentence,
  and no example names it. Add one example. It is the most likely
  dispute between plugin authors.
- **Code loaded at run time.** A plugin that downloads and runs code from
  its author's server can do anything later. The draft does not say
  whether that is harm. I would say it is not harm by itself. It becomes
  harm when what it loads does a listed thing. State that, or the first
  report of this kind has no answer.
- **Heavy scraping.** "Built to attack other people's computers" should
  not reach a plugin that sends many requests to Google Scholar and says
  so. Say that attack means breaking in, flooding, or spreading malware.
- **A disclosed harmful function.** A plugin that says it mines coins is
  not harm under this rule. That is consistent, and I would leave it.

"Were not told about" is checkable, because it is a claim that something
is absent from a short list of public places. The rule must name those
places. A disclosure counts when it is in the repository's README, in the
release notes, or in a prompt or settings text that the plugin shows
before the behavior starts. It does not count when it is only in the
source code, or only on a web page that the README does not link. The
README's own language counts. Many listed plugins have a Chinese README,
and their users read it.

"A malware scan find that a maintainer confirmed" needs a meaning for
"confirmed". D-082 expects false positives. The maintainer cannot vet
code. Say what confirming is: for example, a second engine or a public
advisory agrees, or the plugin's owner does not dispute it.

## 2. Copyright test

The idea is sound: the ground rests on what courts decided about a named
site, not on the maintainer's view of the law. The wording is not yet
workable, for these reasons.

**Default judgments.** As far as I recall, both United States judgments
against Sci-Hub (Elsevier in New York, the American Chemical Society in
Virginia, both 2017) are default judgments. Sci-Hub did not appear. In a
default judgment the court takes the complaint's facts as true. It is a
court's judgment in a copyright case, and it is weaker than a contested
one.

**Blocking orders.** The orders I recall from the United Kingdom, France,
Sweden, and other countries tell internet providers to block the site.
The site is not a party. In most of these systems the court must be
satisfied that the site infringes before it orders a block, so the order
does contain a finding. The site did not argue against it.

**Consequence.** If "found" means a contested finding on the merits, I
know of no country where Sci-Hub clearly passes. The Indian case is the
only one I recall in which Sci-Hub defended itself, and I am not sure
that it ended in a merits finding. So the rule must say outright that
default judgments and court blocking orders count. Otherwise the first
owner to object will argue that the listed site fails the index's own
test. The two-country count is what makes these weaker rulings
acceptable, and the record should say so.

**Liability for some works versus an order against the whole site.** The
phrase "infringes copyright" is too wide. A United States appeals court
found on the merits that the Internet Archive's book lending infringed
(Hachette, 2024), and I recall a Belgian blocking order in 2025 that
named its Open Library. If both hold, the draft test covers a plugin with
an Internet Archive lookup built in. A German court also held
ResearchGate liable for particular papers. The test should ask whether a
court ordered the site as a whole blocked or shut down, not whether a
court found some infringement on it.

**Administrative blocks.** Do not count them. Italy's communications
regulator, Russia's regulator, and Germany's industry clearing body block
sites without a court. Excluding them matches the reason the maintainer
gave for "courts": a block for political reasons usually comes from a
regulator.

**One country only.** Not covered. That is the price of the guard, and
the M118 log already names its falsifier. A new site has no rulings for
its first years. Accept this.

**Mirrors and successors.** Define a site as the service, under any
address. Sci-Hub's addresses change when a domain is seized, so the sites
file should match names, not domains. A renamed or successor service
counts when a ruling names it or when the same operator presents it as
the same service. Otherwise it needs its own two rulings.

**Non-copyright cases.** "In copyright cases" works as intended. The
largest United States case against Anna's Archive that I recall (OCLC) is
about scraping a catalogue, not copyright, and would not count. This
matters for `0xc1c4da/zotero7-scidb`. Whether Anna's Archive passes may
depend entirely on whether blocking orders count. So fix the counting
rule before T1 reads the rulings, not after, or the rule will look fitted
to the result.

**Overturned rulings.** Add that a ruling later overturned does not
count.

**The object.** "Papers or books" is the right scope for Zotero. Drop
"copyrighted". Sci-Hub also serves open-access papers, a plugin cannot
tell which it fetches, and the word invites an argument about each file.
The test is on the site.

Each ruling in the sites file should record country, court, date, case
name or number, kind (contested judgment, default judgment, blocking
order), and a link. Then a reader can check the count and the kind.

## 3. Built-in line

A maintainer can apply the three named forms (default address, menu
choice, button) the same way each time. These cases sit on the edge and
need an answer in the D-entry:

- **A preset list the user can edit.** Covered. The plugin ships it.
- **A list fetched from the author's server at run time.** Covered when
  the README or settings say the list includes the site. The maintainer
  cannot see the list otherwise without running the plugin. Treat a list
  the plugin loads by itself as part of the plugin.
- **An empty field, and a README that tells the user what to type.** This
  is the main one. After removal, the cheapest fix for an owner is to
  blank the default and write "enter a Sci-Hub address" in the README.
  Under the draft that plugin comes back, still named for the site and
  doing nothing else. I would count a README instruction that names the
  site as built in. The maintainer chose "built in" over "main use", and
  this keeps that choice: it still turns on what the plugin ships and
  says, not on how people use it.
- **Placeholder text.** A field whose grey example text is a listed
  site's address. Treat it as the README case.
- **The name alone.** A plugin named for the site, with no address and no
  instruction. Not covered. Say so, since the bot hold will keep finding
  it.
- **A link that opens the site in a browser.** A "look up on Sci-Hub"
  menu item fetches nothing into Zotero. It is a menu choice that names
  the site. I would cover it, because "a built-in way to get" does not
  depend on where the file lands. Either answer works if it is written
  down.
- **A go-between.** A plugin that gets files through a bot or a
  third-party service that draws on a listed site is covered only when
  its README says so.
- **Old releases.** The test reads the latest release. Older releases
  stay on GitHub, and the index does not link them.

## 4. Reading without a report

In substance there is no conflict with D-051. Reading a README and a
settings screen is not a review of code. The index already does this kind
of reading: About says a maintainer checks the paid-service mark by hand.

In the record there is a conflict. D-062 says "a plugin with no report
stays listed" and that the index "reads no plugin code unless a report's
evidence asks for it". The first sentence becomes false. The M118 D-entry
must annotate D-062 in those words.

In how people read it, there is a cost. Once the index removes plugins on
its own motion, a visitor may take the remaining plugins as checked, and
a rights holder may expect the index to watch for more. Two things limit
this:

- Tie the reading to a trigger that a machine applies. The maintainer
  reads a plugin under this ground only when its name, description,
  repository name, or topics match a name in the sites file, or when a
  report names it. The maintainer does not read through the index looking
  for candidates. That is what keeps the exception from growing: adding a
  site to the file is the only way to widen it, and that needs two
  rulings.
- Say in the docs that a plugin that stays listed has not been checked
  for this or anything else.

Whether watching for such plugins by choice changes the index's legal
position is a question of intermediary liability, and it differs by
country. I cannot answer it.

On "can remove": the wording gives discretion. For a one-person index
that is honest, and I would keep "can". The D-entry should add that every
plugin the trigger matches gets the same check, so the removals do not
depend on star count or on who the owner is.

## 5. Return path

**Owner's request.** Sound. Say that only the owner can ask for this
ground. "Anyone" fits the other four.

**Misleading entry, spam.** Sound.

**Copyright.** The condition is right. It is easy to game: drop the
source, return, add it back in the next release. Nothing reads a listed
plugin again. Two fixes, both cheap: run the sites-file name match over
listed entries in the daily build and open an issue for the maintainer on
a new match, as D-084 does for scan finds; and say that a second removal
on the same ground is not lifted. See also the README case in question 3,
which is the other way to game it.

**Harm, permanent list.** The list is right in what it tries to separate:
a plugin made to steal or attack, against a plugin with a hidden function
that its purpose needs. The wording does not separate them. "Taking
files" is permanent and "data sent without saying so" is not, and a
library is files. State the test directly: permanent when the hidden
behavior serves no part of what the plugin says it does.

Permanence applies to a repository and its ids. The author can open a new
repository or account. The new-account hold catches some of that. Say in
the docs that permanence is about the repository, so no one reads it as a
ban on a person, which the index cannot enforce.

**Harm from someone else's change.** A poisoned dependency is a more
likely case than a taken-over account. Name both. An owner can show it
with things a reader can check: the commit or release that added the
code and who pushed it, a public statement on the repository, a GitHub
security advisory or a public advisory for the dependency, and a release
that removes it. The owner does not need to prove who the attacker was.
It is enough that the public record fits the account and that nothing
contradicts it.

**"Which a maintainer and the malware scan find clean."** Remove this.
A maintainer finding a release clean is vetting, which D-051 says the
index cannot do. D-082 says a clean scan does not mean safe. The
condition should be about the reported evidence only: the linked code is
gone, or the steps no longer make it happen.

**Stops or discloses.** The M118 work log says a plugin removed for data
sent without saying so can return when a release "stops or discloses" it.
Draft rule 3 says only "removes it". Disclosure should be enough, since
the harm was the silence.

**A mistaken removal.** Missing. If the evidence proves wrong, or the
maintainer misread a README, the removal should be lifted and the issue
should say why. D-062 names a false report as the case that would show
its choice wrong, so the rules need an answer for it.

## 6. Coherence

**D-006.** Consistent. The copyright ground is not a judgment of quality.
It is a limit on what this index will link to. The D-entry should use
those words.

**D-065.** Consistent. The star order stays GitHub's fact. The ground
applies by name match, not by rank. The record should say that the
readiness check noticed the plugin because of its rank and that the rule
applies the same at any rank.

**D-053.** Not consistent as written. M119's hold exists so that the
maintainer can keep a matching plugin out, which means closing a held
pull request for a reason other than a misleading entry. Annotate D-053:
a held pull request is closed when its entry would mislead, or when the
plugin meets a ground that a maintainer applies without a report. A
plugin kept out this way should also get a `delisted.json` record with
its ground, so that the return path and the public record are the same
whether or not it was ever listed. The schema requires an `issue`, so
that case needs an issue too, or the field must accept the pull request's
number.

**Pressure for more grounds.** It will come: scraping against a site's
terms, removing copy protection, sharing library logins, sending
copyrighted PDFs to an AI service, and one author's claim that another
copied code. The record should state the limit now. The index does not
decide whether a plugin is legal. This ground asks one question that a
reader can check: have courts in two countries ordered this named site
blocked or shut down for copyright infringement. A site's terms are a
contract between the site and its user, and no court has ruled on a named
thing, so there is no ground. A new legal ground would need the same kind
of outside, checkable fact. Put that in the D-entry with a "this choice
is wrong if" line.

## 7. Application

**One public issue per plugin, mentioning the owner.** I agree with the
choice. A removal with no notice would be worse, and the `delisted.json`
record needs an issue. Risks and how to lower them:

- Tone. The issue should say what the index did and why, not what the
  owner did. It should say that the index is not calling the plugin or
  its users unlawful, that the rule is about what this index lists, and
  that the plugin stays on GitHub. It should give the README line or
  setting that was read, so the owner can correct a misreading.
- A way to object. Say that if the reading is wrong, a reply on the issue
  is enough and the plugin goes back. This stands in for a notice period,
  which M118 left out.
- Attention. Six issues that name Sci-Hub on a public repository, the
  week before the index is advertised, will be found. One of the owners
  has a plugin with over 4,000 stars. Expect comments from people who are
  not the owner. Decide beforehand what to do: GitHub can limit comments
  on a repository to earlier contributors for a time. Do not lock the
  issue, since the owner must be able to answer.
- Language. Several owners may not read English as a first language.
  Short sentences, no legal terms beyond the names of the rulings.

Whether a public statement that names a person's plugin next to court
rulings carries risk for the maintainer is a defamation-type question. A
statement limited to what the README says and what the courts ordered is
the safest form of it.

**The name-match hold.** It works as a tripwire and is not a guard. Say
so in the D-entry.

- False positives cost one look, because a hold closes nothing. A plugin
  that names Sci-Hub to warn against it is held, read, and merged.
- Evasion is trivial. Three of the six candidates do not have the site in
  their repository name. Matching GitHub topics as well costs little.
- Spellings need care. "zlib" is a compression library and must not be a
  spelling for Z-Library. "SciDB" is also the name of a database system.
- The hold looks only at new pull requests. A listed plugin that adds a
  site later is never seen. The daily match over listed entries in
  question 5 closes that.
- The sweep and the hold read names and descriptions only. A plugin whose
  README alone names the site is missed. That is acceptable if the docs
  say that a listed plugin has not been cleared.

## 8. Gaps, ranked for launch

1. **A mistaken removal and who checks the maintainer.** One person
   decides, and there is no second reader. The substitute is a public
   record: every removal has an issue with its ground and evidence, and
   About links the list. Add the way back for a mistake (question 5).
   Add one line on conflict of interest: if a request concerns a plugin
   the maintainer wrote, the issue says so.
2. **Notices from rights holders and other legal mail.** The rules do not
   say what happens when a publisher, or a plugin author who says another
   plugin copied their code, writes in. Say that the index hosts no
   plugin files and links to GitHub, that a complaint about a plugin's
   own code goes to GitHub, and that the index acts on the five grounds
   only. The index does host screenshots, so say how to ask for one to be
   taken down. Give a private contact for this mail. How to answer a
   formal notice is a notice-and-takedown question that differs by
   country, and a formal notice is the point to ask a lawyer.
3. **What spam means.** It is as undefined as harm was. A draft: a
   repository that is not a working Zotero plugin, such as an unchanged
   template or sample under a new name, a repository made to carry ads or
   links, or many near-identical copies from one account.
4. **A private way to report harm.** The form is public only. A person
   who finds malware may not want to post it, and a public issue that
   accuses a named developer of malware, with weak evidence, stays public
   under the index's name. Give a private contact, and say that a
   maintainer can edit or hide an issue that accuses without evidence or
   attacks a person.
5. **What a visitor sees after a removal for harm.** The page becomes a
   404. A person who installed the plugin learns nothing. Consider a
   plain list of removed plugins with ground and issue link, so that a
   removal for malware warns people. This is a design choice with a cost
   in attention for the copyright removals.
6. **Response time.** Promise none. Say that one person reads requests,
   that reports of malware come first, and that a plugin with a credible
   malware report can be removed while it is checked and put back if the
   report fails.
7. **Rule changes.** Say that the rules can change, that a change applies
   to plugins already listed, and where the dated history is.
8. **Repeat and bad-faith requests.** Say that a request with no new
   evidence is closed.

Items 1 to 3 matter before the first advertisement. Items 4 to 6 matter
by the first real report. Items 7 and 8 can wait.

## Beyond the brief

- **The form's reason menu.** A choice labelled with "copyright" will
  draw general copyright complaints. Label it by the narrow fact, for
  example "It has a listed site built in". The same applies to About's
  wording, which the user approves line by line.
- **The `ground` value.** `copyright` is accurate enough for a data
  field. Its meaning in `docs/requests.md` should be the narrow ground.
- **Sites file and the order of work.** Decide which kinds of ruling
  count (R1) in M118's D-entry. Then M119 T1 applies a fixed rule to what
  it finds.
- **M119 AC1's check.** A check can count countries per site. It cannot
  tell whether a ruling is real or of the right kind. Record the kind per
  ruling so that a reader can.
- **Lifting a removal and the record.** If lifting deletes the
  `delisted.json` record, the file no longer shows that a plugin was
  removed once, which the second-removal rule (R8) needs. The closed
  issue can carry that history. T4 of M118 should say which.
- **Rule 1's last sentence in the page copy.** The full harm definition
  is long for About. Under the project's wording rule the precise text
  belongs in `docs/`, and About needs one approved sentence.

## Recommendations

**R1 (apply). Fix the court test.** Replacement for draft rule 2:

> A maintainer can remove a plugin that has a built-in way to get papers
> or books from a site that courts in at least two countries have
> ordered blocked or shut down for copyright infringement. A default
> judgment counts, and so does a court's order to internet providers to
> block the site. A block by a regulator or an industry body does not
> count, and neither does a ruling that was later overturned. A site
> means the service under any address or mirror. A site with a new name
> counts when a ruling names it or when its operator presents it as the
> same service.

**R2 (apply). State the built-in line with its edge cases.** Replacement:

> "Built in" means that the plugin's latest release ships the site: a
> default or preset address, a menu choice, a button, or a list that the
> plugin loads by itself. It also means that the plugin's README or
> settings text tells the user to enter the site's address. A plugin
> that takes any address the user types, and names no listed site, is
> not covered. A plugin's name alone does not make the site built in.

The README clause extends the maintainer's choice. If the maintainer
rejects it, record that an empty field with README instructions comes
back.

**R3 (apply). Tighten the harm definition.** Replacement for draft rule 1:

> Harm means that a release of the plugin does something that the people
> who install it were not told about, to them or through their computer
> or accounts. Examples are malware, taking passwords or files, sending
> library contents or account details somewhere without saying so,
> deleting or corrupting a Zotero library on purpose, disabling or
> changing other plugins or settings to the user's cost, and using the
> computer to attack, spam, or mine for someone else. A plugin built to
> break into, flood, or infect other people's computers also does harm.
> People were told when the README, the release notes, or text that the
> plugin shows before it acts says so, or when the behavior is plainly
> what the plugin is for. A bug is not harm: a plugin that damages a
> library by mistake stays listed, and a Broken report on its page warns
> others. A check for updates or a count of installs that carries no
> library contents and does not identify the person is not harm. Code
> that a plugin loads at run time is not harm by itself. The evidence
> must be something a reader can check, such as a link to the code that
> does it, a malware scan find that a second source supports, or steps
> that make it happen again.

**R4 (apply). Annotate D-062 and scope the reading.** For the D-entry:

> D-062 said that a plugin with no report stays listed. That now has one
> exception. A maintainer reads the README and settings of a plugin
> whose name, description, repository name, or topics match a name in
> the sites file, and removes it if a listed site is built in. The
> maintainer does not read other plugins for this ground and does not
> read any plugin's code. Every matching plugin gets the same check. A
> plugin that stays listed has not been checked. The index does not
> decide whether a plugin is legal. This choice is wrong if the
> maintainer starts to read plugins that no match or report names.

**R5 (apply). Split permanent from returnable harm by purpose.**
Replacement for the harm line of draft rule 3:

> Harm: a plugin stays off for good when its author built the hidden
> behavior in and that behavior serves no part of what the plugin says
> it does, such as spreading malware, taking passwords, or attacking
> other computers. Other harm can come back once a release stops the
> behavior or tells users about it. Harm that someone else's change
> caused, such as a taken-over account or a poisoned dependency, can
> come back once a release removes it and the public record shows what
> happened: the commit or release that added it, an advisory or a
> statement on the repository, and nothing that contradicts the owner's
> account. A removal covers the repository and its ids, not a person.

**R6 (apply). Remove "a maintainer and the malware scan find clean".**
Replacement, appended to R5's text:

> A maintainer checks only that the reported evidence no longer holds:
> the linked code is gone, or the steps no longer make it happen. This
> is not a finding that the plugin is safe.

**R7 (apply). Add the way back for a mistake.** New line for rule 3:

> Any ground: if the evidence proves wrong, or a maintainer misread the
> plugin, the removal is lifted and the issue says why.

Also: only the owner can ask for a return after an owner's request.

**R8 (apply). Close the drop-and-return gap.** New line for rule 3, plus
one task in M119:

> Copyright: a release drops the built-in source. A plugin removed a
> second time on this ground stays off.

Task: the daily build runs the sites-file match over listed entries and
opens one issue for the maintainer per new match, in the manner of D-084.
If that is too much for M119, register it as a candidate and say in the
docs that listed plugins are not rechecked.

**R9 (apply). Annotate D-053.** For M119's D-entry:

> D-053 said that a held pull request is closed only for a misleading
> entry. A held pull request is also closed when the plugin meets a
> ground that a maintainer applies without a report. A plugin kept out
> this way gets a `delisted.json` record with its ground, so it can ask
> to come back like any other.

Settle what the record's `issue` holds for a plugin that was never
listed.

**R10 (apply). State the limit on new legal grounds.** For M118's
D-entry:

> The copyright ground rests on court orders that a reader can look up,
> not on a maintainer's view of the law. A site's terms of use, a
> licence dispute between authors, and other legal questions give no
> ground for removal. A new legal ground would need the same kind of
> outside fact. This choice is wrong if a plugin stays listed that
> courts in two countries have ordered taken down.

**R11 (apply). Name the narrow ground on the form.** Label the new reason
by the fact, for example "It has a listed site built in", and link the
sites file. The exact line is the user's to approve.

**R12 (apply). Record the kind of each ruling.** Each ruling in the sites
file has country, court, date, case name or number, kind (contested
judgment, default judgment, blocking order), and a source link. Match on
names and topics, not domains. Leave out spellings that are also other
things, such as "zlib".

**R13 (apply). Write the removal issue to a fixed outline.** What the
index did; the README line or setting that was read; the rule and the
rulings; that the index makes no claim that the plugin or its users
break the law, and that the plugin stays on GitHub; that a reply saying
the reading is wrong is enough to reopen it; how to come back. Decide
before posting how to handle comments from people who are not the owner.

**R14 (apply). Define spam** in `docs/requests.md`, with the draft in
question 8 item 3 as a start.

**R15 (apply). Say how legal notices and private reports reach the
maintainer**, and that a complaint about a plugin's own code goes to
GitHub (question 8 items 2 and 4). This adds a line to About, which the
user approves.

**R16 (consider). A public list of removed plugins** with ground and
issue link, linked from About, so that a removal for malware warns
people who installed the plugin (question 8 items 1 and 5).

**R17 (consider). Ask the owner first for data sent without saying so.**
A removal is a strong answer to a missing README sentence. An issue on
the index that gives the owner a set time to disclose would fix most
cases. M118 left a notice period out of scope, and R5's "tells users
about it" return makes the cost of skipping it small.

**R18 (consider). Response time, rule changes, and repeat requests**
(question 8 items 6 to 8), one sentence each in `docs/requests.md`.

**R19 (reject). Requiring a contested merits finding in the court
test.** It would be the stricter guard against weak rulings. I reject it
because, as far as I know, no site of this kind has two such findings,
so the ground would remove nothing. The two-country count is the guard.

**R20 (reject). Dropping the proactive check in favor of reports only.**
It would keep D-062 unchanged. I reject it because the maintainer chose
otherwise for a stated reason, and because a ground that applies only
when a stranger reports it would apply unevenly to the six plugins the
sweep already found.
