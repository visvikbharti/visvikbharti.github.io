# My Portfolio Website

This repository contains my personal academic portfolio, with my research, publications and projects. It is deployed with GitHub Pages at [visvikbharti.github.io](https://visvikbharti.github.io/).

## Repository Structure

- **index.html**: the main single-page site (research question, publications, awards, projects, about, skills, contact)
- **pages/**: full pages for publications, research, CV, about, the project overview and one detail page per project
- **css/**, **js/**: styles (`vars.css` holds the colour and type variables) and the GSAP scroll logic (`main.js`)
- **assets/**: images and the hero video
- **my_cv/Vishal_Bharti_CV.pdf**: the current CV. Keep this filename when replacing it, so the links never go stale.
  A copy also sits at the old address, `my_cv/Vishal-Bharti-Resume-Updated-Sep-2025.pdf`, so CV links already sent out keep working. Replace both when the CV changes.

## Development Setup

### Running the Website Locally

```bash
# Using Python's built-in HTTP server
python -m http.server

# Using PHP's built-in server (alternative)
php -S localhost:8000
```

## Main Features

- Panel-based single page with GSAP ScrollTrigger animations
- The content is plain HTML, so it reads correctly with JavaScript off (the counters carry their real numbers)
- Phone layout below 768px

## Keeping facts in sync

There is no build step, so some facts appear in more than one file. When one changes, update every copy:

- **Publication list**: `index.html` (Publications section), `pages/publications.html` (full list and citation data) and `pages/research.html`. `pages/cv.html` has a selected subset and a count.
- **Publication counts**: the stats strip in `index.html`, plus `pages/publications.html`, `pages/projects.html` and `pages/cv.html`.
- **StickForStats status**: `index.html`, `pages/stickforstats.html`, `pages/projects.html`, `pages/research.html` and `pages/cv.html`.

## License

All rights reserved, Vishal Bharti.
