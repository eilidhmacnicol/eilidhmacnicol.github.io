# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal academic website for Eilidh MacNicol (Postdoctoral Research Associate in Neuroimaging, King's College London / IoPPN), deployed as a GitHub Pages static site at eilidhmacnicol.github.io.

**No build step.** Everything is plain HTML/CSS/JS. Deploying means pushing to `master` — GitHub Pages serves from the root of that branch directly.

## Current structure

The site is being redesigned from a dated multi-page layout (index.html + about.html + cv.html) into a single-page site. The redesign targets:
- Dark/muted colour palette with subtle neuro-inspired visual accents
- Single-page scrolling layout with anchor navigation
- Sections: Hero, Research Themes, Technical Toolkit, Publications, Open Source/Software, About/Contact
- Mobile-responsive, accessible (semantic HTML, WCAG contrast, alt text)

## Constraints

- **Static only**: HTML/CSS/JS — no build toolchain, no React, no SSG. External libraries must come from CDNs.
- **Self-contained assets**: Images, fonts via CDN or local. No server-side dependencies.
- **GitHub Pages**: Deploys from `master` branch root. The entry point GitHub Pages expects is `index.html`.

## Key assets and content

| File | Purpose |
|------|---------|
| `index.html` | Main entry point (currently the old home page — target of the redesign) |
| `about.html` / `cv.html` | Old multi-page layout; being collapsed into the single-page redesign |
| `MacNicol_2504.pdf` | CV — keep this linked from the new site |
| `eilidh_19.JPG` | Profile photo |
| `images/` | SVG icons (github, linkedin, email, ORCID) |
| `style.css` / `aboutPageStyle.css` | Old styles — replace with new stylesheet during redesign |

## Content reference

Key identity facts for copy/placeholder purposes:
- **Role**: Postdoctoral Research Associate, Department of Neuroimaging, IoPPN, King's College London
- **ORCID**: 0000-0003-3715-7012 — https://orcid.org/0000-0003-3715-7012
- **GitHub**: https://github.com/eilidhmacnicol
- **Email**: eilidh.macnicol@kcl.ac.uk
- **NiPreps steering committee member**: https://nipreps.org
- Research spans: phMRI, ASL, structural MRI, autoradiography, IHC; preclinical (rodent) and translational contexts

## Previewing changes

Open `index.html` directly in a browser, or serve locally with:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000. No build step required.

## Style conventions

- Use semantic HTML5 elements (`<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`, `<main>`)
- CSS custom properties (variables) for the colour palette and spacing tokens — define on `:root`
- One stylesheet (`style.css`) — do not reintroduce `aboutPageStyle.css` in the redesign
- Fonts via Google Fonts CDN
- All external links open in `target="_blank"` with `rel="noopener noreferrer"`
- Alt text on every image; decorative SVGs get `aria-hidden="true"`
