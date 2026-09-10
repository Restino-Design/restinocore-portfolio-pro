# Restino Portfolio — Project Context

This file is auto-loaded by Claude Code at the start of any session opened in
this folder. It exists so a new session (different machine, different
account) picks up full context on what this project is and everything that
was done to it, without needing the original chat history.

## What this is

- **Repo:** `Restino-Design/restinocore-portfolio-pro` (private) on GitHub.
- **Live site:** https://restinocore.vercel.app — auto-deploys on every push
  to `main` via Vercel's GitHub integration (no manual deploy step needed).
- **Stack:** vanilla HTML/CSS/JS, no build step. three.js for the 3D Gallery
  (loaded via CDN import map), GSAP for scroll motion. See [README.md](README.md)
  for file structure and how to run a local server (`_local-server.ps1`).
- **Owner's GitHub account:** `Restino-Design`, authenticated locally via
  `gh` CLI (installed at `C:\Program Files\GitHub CLI\gh.exe` — wasn't on
  PATH in a fresh terminal as of this session, use the full path or open a
  new terminal after install).

## Related repo: Avant-Archviz

The "Golfin Swans" project card embeds a **separate** React Three Fiber app,
live at https://avant-archviz.vercel.app, source at
`Restino-Design/Avant-Archviz` (branch `rarch`, not `main`). It was heavily
optimized for mobile in this session (see log below) — if you need to touch
that scene, clone that repo separately; it's not part of this one.

## Session log (chronological, most recent last)

1. **Skull model added to 3D Gallery.** `Experimental_Skull.fbx` had no PBR
   textures, so `gallery.js` was given a `NO_TEXTURE` set that falls back to
   a solid bone-colored `MeshStandardMaterial` instead of trying to load
   `base.png`/`normal.png`/`mask.png`. It's the first item in the carousel,
   before Katana.
2. **Background render video added, then heavily optimized.** Original file
   was 1440p/120fps HEVC at ~80MB; re-encoded to 1080p/30fps H.264 CRF18 at
   ~6.6MB with no visible quality loss (ffmpeg). Also resized the oversized
   4000×4488px nav logo down to 512px and losslessly recompressed
   `Cover.png`.
3. **Video became a site-wide fixed background**, not just a Hero banner —
   `position: fixed; inset: 0` behind every section, `object-fit: cover` so
   it never letterboxes, doesn't move on scroll. Sections stay transparent
   over it with a dark gradient overlay for text contrast.
4. **3D Gallery moved above Selected Projects** (nav order updated to
   match), since it's the strongest section.
5. **Golfin Swans (Avant-Archviz) embedded live in the portfolio**, replacing
   the old "open external link" — now an interactive iframe of the actual
   Three.js scene, plus the original YouTube walkthrough kept as a fallback.
   It's the first project card now.
   - **Widened on desktop only** to fill the section's full content width
     (text stays at normal reading width via `max-width: calc(50% - 1.25rem)`
     on the text elements specifically) — gated behind `@media (min-width: 821px)`.
   - **Gated behind a tap on mobile** (`#golfin-embed.needs-tap`, logic in
     `script.js`) so it never auto-loads a second full WebGL context
     alongside the 3D Gallery's own viewer on a phone.
   - **Root-caused and fixed the actual mobile crash** in the Avant-Archviz
     repo itself (see below) rather than just working around it — the tap
     gate stayed anyway as a "don't run two heavy scenes unasked" courtesy,
     but it loads in-page on mobile too now, not a separate tab.
6. **Instagram removed** from the contact links (Email/LinkedIn/WhatsApp only).
7. **EN/PT flag toggle switched from emoji to inline SVG** — 🇧🇷/🇺🇸 emoji
   render as bare "BR"/"US" text on Windows (no font support for
   regional-indicator sequences there); hand-drawn SVGs in `i18n.js` fix
   that cross-platform.
8. **Nav and footer made full-bleed** (edge-to-edge, own `clamp()` padding)
   instead of sharing the same 1080px centered column as the rest of the
   page.
9. **Fixed a pre-existing layout bug**: `.gallery3d` was never included in
   the shared centered-column CSS rule, so its heading/intro/viewer/carousel
   sat flush against the screen edges on desktop while every other section
   was padded — now aligned with the rest of the page.
10. **Logo gradient effect added, then reverted** per follow-up request —
    logo is back to the plain static `<img>`, no mask/animation.
11. **Both scrollbars themed** to match the dark UI instead of the default
    OS scrollbar: the 3D Gallery carousel's horizontal drag bar, and the
    page's main vertical scrollbar. Both glow (`box-shadow`) while actively
    held via `::-webkit-scrollbar-thumb:active`, settle flat on release.
    Chromium/WebKit gets the full effect; Firefox gets themed colors via
    `scrollbar-color` with no glow-on-drag (no per-state hook there).

## Avant-Archviz mobile fix (separate repo, for context)

Golfin Swans wasn't opening on mobile / was crashing the tab. Root cause:
the scene was decoding ~15 materials' worth of mostly 2K–4K PBR textures at
once — a multi-GB GPU memory footprint, way past what a phone GPU budgets
for WebGL, which is what was killing the context.

Fix (commit `8b8493f` on branch `rarch`):
- Generated a `public/textures-mobile/` mirror of every texture actually
  used by the scene, downscaled to 1024px (ffmpeg). A `useResponsiveTexture`
  wrapper in `src/App.tsx` swaps to that path automatically when
  `isMobileDevice` (matchMedia + UA check).
- Mobile also drops to `dpr={1}` (vs `[1,2]`), skips `<Stage shadows>`, and
  skips the `<EffectComposer>`/Bloom pass entirely.
- Added a `webglcontextlost` handler so a GPU failure on some weaker device
  shows a plain "reload" screen instead of a frozen/crashed tab.

**Known follow-ups not yet done** (flagged, not blocking):
- `public/objs/lamp.glb` and `lamplight.glb` (27MB each) embed their own
  unused images internally — the component overrides materials right after
  load, but GLTFLoader still parses/uploads the embedded textures first.
  Stripping those would need a GLB-editing tool (gltf-transform or similar),
  not attempted this session.
- `public/textures/curtain1/`, `curtain2/`, `tv2/` are dead weight — not
  referenced by any component, safe to delete.
- `useGLTF.preload("/Golfin_Swans.glb")` at the bottom of `App.tsx`
  references a file that doesn't exist in `public/` (404 → SPA fallback
  HTML gets fed to GLTFLoader, silently fails). Harmless dead code, never
  fixed.
- **Not verified on a real physical phone.** Automated browser testing
  tools can't replicate actual mobile GPU memory limits — the fix targets
  the diagnosed root cause with standard, well-established techniques, but
  ask the user to confirm on a real device if picking this back up.

## Local dev tooling installed this session

Not on PATH by default in a fresh terminal — use full paths or reinstall:
- **GitHub CLI:** `C:\Program Files\GitHub CLI\gh.exe`
- **FFmpeg:** `C:\Users\Santos Tech\AppData\Local\ffmpeg-tool\ffmpeg-9.0.1-essentials_build\bin\`
- **Node.js v22:** `C:\Users\Santos Tech\AppData\Local\node-tool\node-v22.14.0-win-x64\`
  (only needed for the Avant-Archviz repo, which is a Vite/React project;
  this portfolio repo has no build step)

`winget` was unreliable in this environment (hung indefinitely on source
sync for both `gh` and `ffmpeg`) — direct downloads from the official
sources worked instantly both times. Worth trying winget first on a new
machine, but don't wait more than ~2 minutes before falling back to a
direct download.
