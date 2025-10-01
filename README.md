# My Portfolio Website

This repository contains my personal portfolio website, showcasing research work, publications, projects, and weekly progress reports. The site is deployed via GitHub Pages at [visvikbharti.github.io](https://visvikbharti.github.io/).

## Repository Structure

This repository is organized into:

- **Current design** - Modern portfolio in the root directory (`/`)
- **Legacy version** - Original site in the `/legacy` directory
- **Projects in development** - Separate folders like `/colossal`

## Development Setup

### Running the Website Locally

```bash
# Using Python's built-in HTTP server
python -m http.server

# Using PHP's built-in server (alternative)
php -S localhost:8000
```

## Main Features

### Current Site (Root Directory)

- Single page application with panel-based sections
- GSAP animations and ScrollTrigger for scroll-based effects
- Modern, minimalist design with responsive layout

### Legacy Site (/legacy)

- Tab-based navigation system
- Weekly progress tracker with password protection
- Publication and project showcase
- Research timeline
- StickForStats module information

## Important Files & Directories

- **index.html** - Main entry point for the current design
- **legacy/index.html** - Entry point for the legacy site
- **legacy/pages/** - Content pages loaded via AJAX
- **legacy/pages/progress.html** - Password-protected weekly progress tracker
- **legacy/css/** - Style files for the legacy site
- **legacy/js/** - JavaScript functionality for the legacy site
- **assets/** - Images, videos, and other assets

## Weekly Progress Report System

The weekly progress report system is designed for sharing research updates with PI and collaborators.

### Features

- Password protection for confidential research data
- Week-based navigation (next/previous/current week)
- Session-based authentication to remember logged-in status
- PI feedback submission system
- Support for images, tables, and formatted content

### Password Protection

The weekly progress report is protected with a strict password system:

- Password shared with authorized users via secure channels
- No auto-fill functionality for maximum security
- Sessions persist until browser is closed (using sessionStorage)
- Clean, minimalist login interface

### Adding New Weekly Reports

1. Add new content to the appropriate weekly section in `legacy/pages/progress.html`
2. Update date and week information in the JavaScript files
3. For detailed reports, consider creating a standalone file in `legacy/pages/reports/`

## Date Display Fix for Week 18

Special handling has been implemented to ensure Week 18 always displays the correct date range:

- Hard-coded date range "April 29 - May 05, 2025" for Week 18
- Override of date calculation functions to maintain consistency
- MutationObserver to prevent date changes after render

## Cache Busting

The site implements several cache-busting mechanisms to ensure updates are visible:

- Dynamic timestamp parameters in URLs
- Strict cache-control headers
- localStorage and sessionStorage clearing when needed
- Force reloads with unique timestamps for images

## Known Issues and Solutions

### Tab Navigation and Password Protection

When clicking the "Weekly Progress" tab from the home page, the browser redirects to the full `progress.html` URL instead of loading via AJAX. This is intentional to ensure password protection works properly.

### Date Display Consistency

Week 18, 2025 should always show "April 29 - May 05, 2025". If this date appears incorrect, try:
1. Hard refreshing the browser (Ctrl+F5 or Cmd+Shift+R)
2. Clearing browser cache
3. Using an incognito/private window

## Maintenance Notes

### Updating the Image

The weekly progress tracker shows an illustration image:

1. Replace the image at `/legacy/img/progress-tracker-illustration.jpg`
2. Update version parameter in HTML to force cache refresh: `?v=X` (increment X)
3. Add dynamic timestamp with JavaScript for aggressive cache busting

### Adding New Technologies

When adding new technologies or frameworks, update:
1. `CLAUDE.md` with information about the technology
2. Repository documentation in relevant locations
3. Consider compatibility with existing code structure

## License

All rights reserved, Vishal Bharti © 2025
