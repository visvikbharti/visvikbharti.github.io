# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Note:** this file is committed, so GitHub Pages serves it publicly. Keep it technical. Session context and owner decisions live in the git-excluded `SITE-UPDATE-WORKLOG.md` (read its "START HERE" section first) and in `_handover/`.

## Repository Structure

Vishal Bharti's personal academic portfolio, deployed with GitHub Pages at https://visvikbharti.github.io/:
- `index.html`: the single-page site (hero, research interests and question, stats, publications, awards, projects, about with "Path", skills, future research, contact)
- `pages/`: publications, research, CV, about, the project overview and one detail page per project
- `css/`: `vars.css` (design tokens), `style.css` (shared components), plus one stylesheet per subpage family (`project.css` for the 7 project pages, `publications.css`, `research.css`, `cv.css`, `about.css`, `projects.css`)
- `js/`: `main.js` (GSAP scroll logic, counters, headline decode, HUD clock), `hero-cells.js` (hero canvas), `project-art.js` (project panel drawings), `ascii-photo.js` (character-rendered photos)
- `assets/photos/`: photos (the campus photos are Wikimedia Commons, CC BY-SA 4.0, credited on the page); `my_cv/`: the CV

The legacy site, the weekly progress log and old drafts were removed from the repository in September 2026 (see git history).

## Publishing workflow

- The local branch `release` tracks what is live (`github/master`; the remote is named `github`).
- Edit on `release`, make small separate commits, then publish with `git push github release:master` when the owner asks for it. Pages is live in about 30 s; check with a hard refresh.
- Other local branches (`main`, `ship/content`, `design/restyle`) are history only.
- Everything in the repository is served publicly by GitHub Pages (`.nojekyll`). Never commit notes, drafts or private documents. The brief, `SITE-UPDATE-WORKLOG.md`, `SHIP-INSTRUCTIONS.md` and `_handover/` are git-excluded on purpose.

## Development Commands

```bash
python3 -m http.server 8765 --bind 127.0.0.1   # then open http://127.0.0.1:8765/; stop it when done
python3 _handover/sitecheck.py . LOCAL   # checks the local files (label is free text): links, alt, rel, headings, wording; _handover/ is git-excluded
```

When testing in Chrome, cached JS/CSS is common. Load the page with a new query string and `fetch(url, {cache: 'reload'})` the assets.

## Design system

- Colours (`vars.css`): black `--bg`, raised panels `--bg-raise`, 1px rules `--line` / `--line-strong`, text `--fg` / `--fg-muted` / `--fg-dim`, cream `--cream` for primary buttons, neon green `--accent` as the ONLY accent. No purple, pink, gradients, rounded corners, shadows or hover lifts. Text contrast must be >= 4.5:1.
- Type: `--font-mono` (Geist Mono) for headings, nav, labels, buttons, tags and numbers; `--font-sans` (Geist) for body text.
- Components: square `.btn` (cream fill) and `.btn.alt` (outline); `.tech-tag`; 1px-bordered cell grids; section titles get an automatic index ("01 —") via CSS counters.
- Canvas art: `hero-cells.js` (tissue, click-to-break, HUD) and `project-art.js` (`.split__img[data-art]` scenes: stats, audit, dna-break, triplex, g4, assembloid, ci, rag). Both animate only while on screen, draw a still frame under `prefers-reduced-motion`, and use an integer hash for randomness.
- Accessibility: skip links and `<main>` on every page; decorative canvases `aria-hidden`; the decoding headline keeps its real text in an `.sr-only` span; stat tiles use `role="group"` + `aria-label`.

## Architecture notes

- Panels (`.panel`) are pinned with GSAP ScrollTrigger (`pinSpacing: false`). A panel taller than the viewport pins at `bottom bottom`, so its content scrolls fully before the next panel covers it. Every panel needs an opaque background.
- The counters hold real numbers in the HTML and count up only with JS and motion allowed.
- The footer year is set by `main.js` (`#copyright-year`, with a 2026 fallback).

## Facts that are duplicated across files

There is no build step, so some facts are repeated. Update every copy together:
- **Publication list:** `index.html`, `pages/publications.html` (cards plus the inline JS `citations` object), `pages/research.html`. `pages/cv.html` has a subset and a count. Authoritative data is in `_handover/pubs_authoritative.json`.
- **Publication and project counts:** the `index.html` stats strip, `pages/publications.html`, `pages/projects.html`, `pages/cv.html`.
- **StickForStats status:** `index.html`, `pages/stickforstats.html`, `pages/projects.html`, `pages/research.html`, `pages/cv.html`.
- **Checkability audit status** ("in preparation for submission to Nature Human Behaviour"): the publication entries on `index.html`, `pages/research.html`, `pages/publications.html` and `pages/cv.html`, and the project cards on `index.html`, `pages/projects.html` and `pages/research.html`.
- **Role text** ('Project Associate-II'): home About, `pages/cv.html` (x2), `pages/research.html` (x2), `pages/about.html`.
- **CV:** `my_cv/Vishal_Bharti_CV.pdf`, with a copy at the old address `my_cv/Vishal-Bharti-Resume-Updated-Sep-2025.pdf` so old links keep working. Replace both.

## Content rules

- Never invent facts, numbers, dates or links. If something cannot be verified from the owner, the CV, the papers (Crossref) or the repo, flag it instead.
- Keep contribution claims exact: say what the owner did, not what the paper found.
- Private context (see the git-excluded work log and memory) must never go into committed files.
