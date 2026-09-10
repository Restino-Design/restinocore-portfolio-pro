# Restino — Portfolio (Professional Variant)

Clean, minimal, dark-mode portfolio for **Restino, Technical 3D Artist** — built as a more
corporate/professional companion to the original artistic portfolio, per the research notes in
`compass_artifact_wf-ac4919fa-cc0b-5112-a4ab-7f3865244b64_text_markdown.md`.

- Vanilla HTML/CSS/JS (no build step, no framework) — fast, static, easy to deploy anywhere.
- [GSAP](https://gsap.com) for scroll-driven motion (reveal, parallax, sticky nav, progress bar).
- [three.js](https://threejs.org) for the **Galeria 3D** section — 22 real, interactive 3D models
  (FBX + PBR textures) you can rotate, zoom and swipe through, loaded via ES modules from a CDN
  (`three` resolved through an import map — see `<script type="importmap">` in `index.html`).

## Project structure

```
index.html          Markup for all sections (hero, projects, 3D gallery, about, contact)
style.css            All styling — dark theme, one accent color, responsive breakpoints
script.js             GSAP scroll/hover motion layer (skips heavy effects on mobile)
gallery.js            three.js viewer: loading, camera framing, lighting rig, carousel wiring
assets/                Images, project renders
assets/models/<key>/   model.fbx, base.png, normal.png, mask.png, poster.jpg per 3D piece
_local-server.ps1      Tiny local static server (no Node/Python needed) — see below
```

## Running locally

ES modules (used by `gallery.js`) are blocked by the browser when a page is opened directly via
`file://`. Serve the folder instead:

```powershell
powershell -ExecutionPolicy Bypass -File .\_local-server.ps1
```

Then open **http://localhost:5500/index.html**.

(If you have Node or Python installed, any static server works too — `npx serve`,
`python -m http.server`, etc.)

## Deploying

Static site, zero build step — works on Vercel, Netlify, GitHub Pages, or any static host.
On Vercel: import this repo with **Framework Preset: Other** (no build command, output
directory `.`).
