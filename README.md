# BHASKAR

A personal digital space. Multi-page, zero dependencies, deliberately quiet.

- [index.html](/) — home
- [thinking/](/thinking/) — a notebook of fragments
- [builds/](/builds/) — things built
  - [builds/off/](/builds/off/) — OFF (the one, original project)
- [experiments/](/experiments/) — a small laboratory
- [about/](/about/) — the person
- [contact/](/contact/) — slow channels only

## Design

Black paper, white type, graphite and silver. Two typefaces — Space Grotesk and
IBM Plex Mono — both self-hosted and subset to the characters the site actually
uses. The portrait is sampled on a canvas and redrawn as a field of characters.
Thin silver lines move across every page. Sound is off until you turn it on.

## Run locally

```
python3 -m http.server 8080
```

then open http://localhost:8080

Every link is relative, so the site also works from `file://` if you prefer.

## Deploy

Live at https://bhaskarz.antideploy.com (static deploy). Redeploy with one
command run from this folder (reads `~/.antideploy/config.json`):

```
tar czf - --exclude=.git --exclude=node_modules . | \
  curl -X POST "https://antideploy.com/api/v1/deploy?applicationId=$APP_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -F "archive=@-"
```

`APP_ID` is in `.antideploy.json`; `$TOKEN` is the account token in
`~/.antideploy/config.json`. Poll the returned `watch` URL until it says
`succeeded`.

## Not-found & loading

- `404.html` — custom "waystation is empty" page, sent at `/?antideploy`-style
  unknown paths by an inline route guard (each page carries it in `<head>`,
  so it runs even where external assets can't resolve).
- A brief loading page (`BHASKAR.` wordmark + a sweeping line) covers first
  paint on cold visits, then releases. It shows once per session, is skipped
  under `prefers-reduced-motion`, and never blocks pages without JS.

## Editing content

- **Projects** — `js/data/projects.js`. Add a new project by appending one
  object; the builds index reads this file.
- **Project pages** — the `YEAR / STATUS / ROLE / TECH` fields and the sidebar
  notes on `builds/off/index.html` are real and sourced from the OFF repo
  (github.com/Mythtilla/OFF).
- **Contact** — `contact/index.html` holds the live channels
  (`bhaskarz01022011@gmail.com`, `github.com/Mythtilla`, `@bhaskarr_dgaf`).
- **Thinking** — the fragments, open questions and principles live directly in
  `thinking/index.html`.
- **Experiments** — rows live in `experiments/index.html`.
- **Home quote** — the Greek line under the intro is `Γνῶθι σεαυτόν`
  ("Know thyself"); Greek glyphs fall back to the system's mono font since
  the self-hosted subsets are ASCII-only.

Nothing behind this site fabricates claims about projects. Where facts are
missing they stay visibly missing, as placeholders, until replaced.

## Fonts & audio

Both typefaces and all four sound files are third-party assets covered in
`assets/licenses/THIRD-PARTY-ASSETS.md`. Fonts are self-hosted subsets; audio is
four local files. Nothing is hotlinked or loaded from a remote CDN.

## Notes

- `assets/images/portrait/portrait.webp` is an optimized copy derived from the
  untouched source JPEG in the same folder.
- No analytics, no tracking, no cookies.
- Reduce motion under `prefers-reduced-motion` (via OS or the accessibility
  panel). Everything still works: waves freeze, reveals appear instantly,
  transitions are skipped.