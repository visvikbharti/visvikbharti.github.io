# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains Vishal Bharti's personal portfolio website with two main versions:
- Current design in the root directory (`/`)
- Legacy version in the `/legacy` directory
- Projects in development in dedicated folders (e.g., `/colossal`)

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

### Legacy Site (`/legacy`)

1. **Tab-based SPA Architecture**
   - Single page with dynamic content loading
   - Tab navigation for different sections of the portfolio
   - Content loaded via AJAX from `/pages` directory

2. **JavaScript Features**
   - Tab system for navigation
   - Dark mode toggle
   - Project filtering system
   - Research timeline navigation
   - Lazy loading for images and videos
   - Citation chart visualization

### Projects Section

The website showcases various projects including:
- StickForStats - Statistical analysis toolkit
- Confidence Intervals Explorer - Educational tool for statistical inference

## Images and Assets

- Hero video stored in `/assets/hero.mp4`
- Profile images in `/assets/portraits/`
- Icons and other graphics in `/assets/icons/`

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
   - For the legacy site, update content in the appropriate file in `/legacy/pages/`