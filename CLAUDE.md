# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Note:** this file is committed, so GitHub Pages serves it publicly. Keep it technical. Session context and owner decisions live in the git-excluded `SITE-UPDATE-WORKLOG.md` (read its "START HERE" section first) and in `_handover/`.

## Repository Structure

Vishal Bharti's personal academic portfolio, deployed with GitHub Pages at https://visvikbharti.github.io/:
- `index.html`: the single-page site (hero, research interests and question, stats, publications, awards, projects, about with the "From circuits to cells" story and "Path", skills, future research, contact)
- `pages/`: publications, research, CV, about, the project overview, one detail page per project, and `hobby.html` (two hobby robots; in the main menu of every page, the Projects page and the subpage footers)
- `css/`: `vars.css` (design tokens), `style.css` (shared components), plus one stylesheet per subpage family (`project.css` for the 7 project pages, `publications.css`, `research.css`, `cv.css`, `about.css`, `projects.css`, `hobby.css`)
- `js/`: `main.js` (GSAP scroll logic, counters, headline decode, HUD clock; on subpages also the scroll reveal), `hero-cells.js` (hero canvas), `project-art.js` (the character drawings: home-page project panels, the About story, the Publications timeline), `point-art.js` (the moving point drawings: the Research stage and the project-page heroes), `ascii-photo.js` (character-rendered photos; `data-invert` for dark subjects on light backgrounds), `robots.js` (the hobby page's scenes and widgets)
- `assets/photos/`: photos (the campus photos are Wikimedia Commons, CC BY-SA 4.0, credited on the page); `assets/hobby/`: the hobby page's data (JSON) and photos; `assets/posters/`: conference posters at 140-150 dpi (about 2.4 MB each; the Canva originals are 21-29 MB and are not in the repo); `my_cv/`: the CV

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
- Components: square `.btn` (cream fill) and `.btn.alt` (outline); `.tech-tag`; 1px-bordered cell grids; section titles get an automatic index ("01 —") via CSS counters; `.video-slot` (`style.css`), a 16:9 YouTube frame (youtube-nocookie) with a 1px rule and a one-line caption. Two video slots are commented out until there is a video: the introduction in the home page's About section and the demo in the RNA Lab Navigator Overview. Each comment says how to show it.
- Canvas art: `hero-cells.js` (tissue, click-to-break, HUD) and `project-art.js` (`.split__img[data-art]` scenes: stats, audit, dna-break, triplex, g4, assembloid, ci, rag; plus `.journey__art[data-art="fold"]` in About: a circuit trace that goes slack, searches at random, and folds into ubiquitin from the real PDB 1UBQ C-alpha trace, as a 16 s story that starts from the beginning when first seen). `robots.js` (hobby page) is a small z-buffered renderer that draws meshes as shaded glyphs with outline edges and replays `assets/hobby/*.json`: MuJoCo and quadsim runs and OpenSCAD meshes exported from the two robot repos (exporter notes in `_handover/hobby-export/`). All of them animate only while on screen, draw a still frame under `prefers-reduced-motion`, and use an integer hash for randomness. `main.js` decodes `.scramble` headlines from DNA letters, or from `data-glyphs` (binary on the hobby page; AUGC on the RNA project pages, digits on StickForStats and Confidence Intervals).
- Subpage heroes: the seven project pages and Publications put the copy and a drawing side by side (`.hero-split`; the drawing below on phones): `<figure class="hero-art">` holds the frame (`aria-hidden`), a one-line `figcaption` that says what the drawing shows, and a Pause button added by the script (none under reduced motion). The project pages use point drawings, deliberately not the home page's characters: `.hero-art__frame[data-points]` with `triplex` (TRIPinRNA), `checks` (StickForStats), `sort` (DNA repair), `g4`, `assembloid`, `ci` and `rag`. Publications uses the character scene `pubs` (`data-art`), which reads the page's own `.publication-item` list (its kind and `data-year`), so a new entry appears in the drawing by itself. The 'stats' scene stacks its checklist above the histogram in panels under 28 text rows. Each page has a `<noscript>` style that hides the empty frame.
- Research stage (`research.html`, `js/point-art.js`): deliberately not the character drawings. One pool of 1,100 points takes each research area's shape in turn and keeps moving in it (a turning RNA triple helix, a turning G-quadruplex with K+ between the tetrads, cells sorted by the repair reporter, an assembloid's neurons with interneurons migrating across it in jumps, a histogram that becomes a Q-Q plot, articles read by a beam), and flies to the next shape in 0.9 s, each point from where it was drawn. Below the full-width `.research-stage__art` come the controls (Pause first, then the arrows and markers, so the Tab order matches what is seen) and the `.stage-slide`s (each names its formation in `data-scene`), stacked in one grid cell so the bar keeps the tallest slide's height (inactive slides are `visibility: hidden`). A marker's 5 s CSS fill is the slideshow's clock (`animationend` moves on); it runs only while the script sets `.is-auto`. Hovering or scrolling the stage away holds it (`.is-paused`). Using a control, the arrow keys on the controls, or keyboard focus entering the stage stops the rotation until Play (the WAI carousel pattern); Pause stops the rotation and the drawing. Under reduced motion each area is a still and changes only on request. The script adds the carousel roles and the "n of 6" slide labels; without JS the slides are a plain list.
- Menus: every page's menu, the home page's included, sends Research, Publications and Projects to their pages, and About and Contact to the home page's sections. The home page's Research, Publications and Projects sections each end with a button to their page. `pages/about.html` is an older page that no menu links to.
- Scroll reveal (subpages): `main.js` adds `.io-reveal` to the sections' blocks and cards when JS runs and motion is welcome, and removes it once they arrive (or when keyboard focus enters). Its own class name: `hobby.html` has a separate `.reveal` (`hobby.css`, `robots.js`).
- Accessibility: skip links and `<main>` on every page; decorative canvases `aria-hidden` (a drawing's visible caption stays readable); the decoding headline keeps its real text in an `.sr-only` span; stat tiles use `role="group"` + `aria-label` with the animating spans `aria-hidden` (numbers appear only in the home page's stats strip, by the owner's choice); moving drawings beside page text have a Pause control.

## Architecture notes

- Panels (`.panel`) are pinned with GSAP ScrollTrigger (`pinSpacing: false`). A panel taller than the viewport pins at `bottom bottom`, so its content scrolls fully before the next panel covers it. Every panel needs an opaque background.
- The counters hold real numbers in the HTML and count up only with JS and motion allowed.
- The footer year is set by `main.js` (`#copyright-year`, with a 2026 fallback).

## Facts that are duplicated across files

There is no build step, so some facts are repeated. Update every copy together:
- **Publication list:** `index.html`, `pages/publications.html` (cards plus the inline JS `citations` object). `pages/research.html` has three Selected items and `pages/cv.html` the first-author subset. Authoritative data is in `_handover/pubs_authoritative.json`.
- **Publication and project counts:** only the `index.html` stats strip. No other page shows counts (the owner's choice).
- **StickForStats status:** `index.html`, `pages/stickforstats.html`, `pages/projects.html`, `pages/research.html`, `pages/cv.html`.
- **Checkability audit status** ("Manuscript in preparation", with no journal named): the publication entries on `index.html`, `pages/publications.html` and `pages/cv.html`, and the project cards on `index.html`, `pages/projects.html` and `pages/research.html`. The `pages/research.html` Selected item says only "In preparation". The design text ("every frozen estimate was re-estimated out of sample") is on the same three cards and in the `pages/publications.html` Summary. Until the results are public, the audit drawings light an illustrative share (about 1 in 10), not the measured one.
- **Role text** ('Project Associate-II'): home About, `pages/cv.html` (x2), `pages/research.html` (x2), `pages/about.html`. The IIT Guwahati role (Jun to Sep 2022) is 'Senior Research Fellow', as on the CV: `pages/cv.html`, `pages/research.html` (x2), `pages/about.html`.
- **His part in co-authored studies** (precise verbs, never "led"): the MLC1 and assembloid summaries in `pages/publications.html`; the assembloid study also on `pages/forebrain-assembloids.html` (overview, cards, pipeline, team), `pages/research.html` (slide 4 and the project card), and the `index.html` and `pages/projects.html` cards.
- **Conferences, talks and posters:** the "Conferences, Talks & Posters" section of `pages/publications.html` follows the CV's section of the same name: its entries, order, wording and dates. An entry has a title only where the CV gives one. The EMBO 2025 Best Poster Award is also on `index.html` (Awards and the StickForStats card), `pages/projects.html` (StickForStats card), `pages/cv.html` and `pages/stickforstats.html`.
- **ESTIC 2026 poster** (checkability audit; selected for presentation; Bharat Mandapam, New Delhi, 27 to 29 Oct 2026, as on the CV; no poster title): `pages/publications.html` (the Conferences, Talks & Posters entry and the audit's Summary), `pages/research.html` (slide 6 and the Selected item). Add the poster PDF and any result numbers only once the preprint is public.
- **RNA Lab Navigator:** keyword (BM25) retrieval over a Weaviate index, with an LLM answering from the top passages; the source documents are listed under each answer. Usage: "Deployed for the lab on the institute network in July 2025", with no user count and no response times (the owner's choice). The repository is private, so there is no GitHub link. The card text is on `index.html`, `pages/projects.html`, `pages/research.html` and `pages/cv.html`. `pages/rna-lab-navigator.html` follows the lab's code as of June 2025: OpenAI GPT-4o, the top 4 passages, at most 3 sources listed; no hybrid or semantic search, no embeddings used for answering, no reranking, no per-statement citations, and no database named (the code uses SQLite; the July 2025 deployment also ran a PostgreSQL container). Its Next Steps section lists the public demo's planned changes, from the demo's roadmap: hybrid retrieval with a local embedding model, declining when the documents don't support an answer, citations tied to statements, and a model comparison, each measured on the 60-question test set.
- **Hobby robots** (`pages/hobby.html`): the numbers come from github.com/visvikbharti/Interstellar-TARS-robot-project and github.com/visvikbharti/micro-agile-robot-2026 (gait, tests, engine agreement, costs); the Projects page "Outside the Lab" block summarises them. If a simulation changes, re-export the JSON and update the text.
- **CV:** `my_cv/Vishal_Bharti_CV.pdf`, with a copy at the old address `my_cv/Vishal-Bharti-Resume-Updated-Sep-2025.pdf` so old links keep working. Replace both.

## Content rules

- Never invent facts, numbers, dates or links. If something cannot be verified from the owner, the CV, the papers (Crossref) or the repo, flag it instead.
- Keep contribution claims exact: say what the owner did, not what the paper found.
- Private context (see the git-excluded work log and memory) must never go into committed files.
