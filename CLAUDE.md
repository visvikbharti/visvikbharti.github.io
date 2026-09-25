# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains Vishal Bharti's personal portfolio website:
- The single-page site in the root directory (`/index.html`)
- Full pages in `/pages` (publications, research, CV, about, project overview, one detail page per project)

The former legacy site, weekly progress log and draft versions were moved out of the repository in September 2026 (see git history).

The current website is a modern portfolio with animations powered by GSAP/ScrollTrigger, featuring a clean, minimalist design with sections for projects, about, and contact information.

## Development Commands

### Running the Website Locally

To view the website locally:

```bash
# Using Python's built-in HTTP server
python -m http.server

# Using PHP's built-in server (alternative)
php -S localhost:8000
```

### CSS Development

The CSS is organized into:
- `css/vars.css` - Core variables (colors, typography, etc.)
- `css/style.css` - Main styles for layout and components

No CSS preprocessor is being used, but variables are leveraged through CSS custom properties.

## Architecture Overview

### Current Site (`/`)

1. **HTML Structure**
   - Single page application with panel-based sections
   - Each section is a full-height panel that gets pinned during scroll
   - Uses semantic HTML5 tags for better accessibility

2. **CSS Architecture**
   - Variables for colors, typography defined in `vars.css`
   - Component-based organization in `style.css`
   - Responsive design with mobile-first approach

3. **JavaScript**
   - GSAP animations and ScrollTrigger for scroll-based effects
   - Animation modules in `js/main.js`:
     - Hero video color shift on scroll
     - Count-up animation for statistics
     - Reveal animations for split panels
     - Section pinning for snap scrolling

### Facts that are duplicated across files

There is no build step, so some facts are repeated. Update every copy together:
- Publication list: `index.html`, `pages/publications.html` (including the inline JS `citations` object), `pages/research.html`; `pages/cv.html` has a subset and a count
- Publication counts: the `index.html` stats strip, `pages/publications.html`, `pages/projects.html`, `pages/cv.html`
- StickForStats status: `index.html`, `pages/stickforstats.html`, `pages/projects.html`, `pages/research.html`, `pages/cv.html`
- CV link: always `my_cv/Vishal_Bharti_CV.pdf`. Replace the file and keep the name.

Everything in the repository is served publicly by GitHub Pages (`.nojekyll`), so do not commit notes, drafts or private documents.

### Projects Section

The website showcases various projects including:
- StickForStats - Statistical analysis toolkit
- Confidence Intervals Explorer - Educational tool for statistical inference

## Images and Assets

- Hero video stored in `/assets/hero.mp4` (currently an empty placeholder file)
- Profile photo at `/assets/portraits/profile-photo.jpg`; the project images referenced by `index.html` are not yet in the repo

## Best Practices When Editing

1. **Maintaining GSAP Animations**:
   - When adding new sections, follow the existing pattern for ScrollTrigger setup
   - Pin sections using the same technique as existing panels
   - Use consistent animation patterns for new elements

2. **CSS Modifications**:
   - Add new variables to `vars.css` if needed
   - Follow the existing component structure in `style.css`
   - Use BEM-like class naming convention (e.g., `.hero__content`)

3. **Content Updates**:
   - For the main site, update the HTML directly in `index.html`
   - For subpages, update the file in `/pages/`, and any duplicated copies listed above