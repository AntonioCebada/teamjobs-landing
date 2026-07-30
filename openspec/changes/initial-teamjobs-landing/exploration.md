# Exploration: initial-teamjobs-landing

Single-page TeamJobs marketing landing built from design mockups on a greenfield Astro stack. No product decision blocks proposal; assumptions below are explicit and reversible in design/spec.

## Quick path

1. Treat `design/mockups/` as visual SoT and `design/assets/` as the only supplied media.
2. Scaffold Astro + TS + Tailwind + Preact inside Docker (pnpm only).
3. Ship a first slice: Docker scaffold + shell layout + Navbar + Hero + WhatsApp FAB.
4. Chain remaining sections and form/carousel islands under the 400-line PR budget.

## Current State

Greenfield repository. No app source, package manager lockfile, Dockerfile, tests, or CI.

| Present | Absent |
|---------|--------|
| `design/mockups/` (6 PNG section mockups) | `package.json`, Astro/Tailwind/Preact config |
| `design/assets/` (logo, video, flags) | Dockerfiles / compose |
| `openspec/config.yaml` + empty specs/changes | App routes, components, content model |
| `.gitignore` (node/dist/astro/pnpm/env) | Test runner (strict TDD false until re-detect) |
| git repo | Real client logos, blog CMS, form backend |

**Stack target (from init):** Astro + TypeScript + Tailwind + Preact; **pnpm only**; **Docker for all dev and prod**.

### Mockup inventory (visual SoT)

| File | Visible sections / UI |
|------|------------------------|
| `seccion1-navbar&hero&floatingbutton.png` | Sticky dark navbar (logo, 7 anchors, MX/US lang flags, "Iniciar sesión"); hero (eyebrow, H1, body, 2 CTAs, mascot orb + stat chips); start of About; green WhatsApp FAB |
| `seccion2-whoarewe.png` | About: mascot card + "15K+ Candidatos" + value chips; Misión/Visión cards; CTA "Hablemos de tu empresa" |
| `seccion3-solutions.png` | Solutions grid (4 cards): Reclutamiento y Selección, Gestión de Talento, Outsourcing de RH, Consultoría Organizacional; each "Conocer más →" |
| `seccion4-empresas&carrusel.png` | Empresas process (4 steps); CTA "Quiero contratar talento"; infinite-style client logo strip |
| `seccion5-posts.png` | Recursos: 3 article cards (category, title, read time, date, excerpt, CTA); mid-page gradient CTA band "Consulta Gratuita"; FAB |
| `seccion6-contacto&footer.png` | Contact info + socials; contact form (name*, email*, phone, company, subject*, message*); dark footer (nav, services list, contact, legal links, © 2026); FAB |

Nav anchors implied: Inicio · Nosotros · Servicios · Vacantes · Empresas · Recursos · Contacto.

### Asset inventory

| Asset | Specs | Likely use |
|-------|-------|------------|
| `logo.webp` | 453×550, RGBA WebP, cat mascot with package | Navbar/footer mark, hero/about illustration (same mascot as mockups) |
| `clip-logo.mp4` | ~4.7s, 640×634 H.264 + **AAC audio**, ~1.4 MB | Optional hero/logo motion; must default muted + `playsinline` if autoplay |
| `mexico.png` | 589×337 RGBA | Lang switcher MX |
| `usa.jpg` | 589×310 RGB JPEG | Lang switcher US |

**Not supplied (must synthesize or placeholder):** icon set, client logos for carousel, blog card art (gradients OK via CSS), WhatsApp glyph, legal page content, real social URLs, form backend.

## Affected Areas

Greenfield — all paths are **to be created** (none exist today):

- `Dockerfile`, `Dockerfile.dev`, `docker-compose.yml` — Docker-first dev/prod
- `package.json`, `pnpm-lock.yaml`, `astro.config.*`, `tsconfig.json`, `tailwind` config
- `src/pages/index.astro` — single landing composition
- `src/layouts/BaseLayout.astro` — HTML shell, SEO meta, fonts
- `src/components/**` — section and chrome components (see boundaries)
- `src/islands/**` or `*.tsx` Preact islands — interactive only
- `public/` or `src/assets/` — copy/import from `design/assets`
- Content module (TS/JSON/MD) — Spanish copy extracted from mockups
- Future: privacy/cookies stubs if footer links are in scope

## Page structure (single route)

```
BaseLayout
├── Navbar (sticky)
├── main
│   ├── Hero (#inicio)
│   ├── About / Quiénes somos (#nosotros)
│   ├── Solutions (#servicios)
│   ├── Empresas process + logo carousel (#empresas)
│   ├── Recursos posts (#recursos)
│   ├── CTA band (Consulta Gratuita)
│   └── Contact (#contacto)
├── Footer
└── WhatsAppFab (fixed)
```

**Vacantes / Iniciar sesión:** mock shows as primary nav/CTA; no vacancies UI or auth in mockups → treat as external URL placeholders until product supplies destinations.

## Component boundaries

| Component | Type | Notes |
|-----------|------|-------|
| `BaseLayout` | Astro | lang, meta, OG, font loading |
| `Navbar` | Astro + small Preact island | Desktop links static; mobile menu + active section need client JS |
| `Hero` | Astro | Static; optional video island if `clip-logo` used |
| `About` | Astro | Static cards/chips |
| `Solutions` | Astro | 4-card grid; links TBD |
| `EmpresasProcess` | Astro | 4 steps static |
| `LogoCarousel` | Preact island **or** CSS marquee | Continuous scroll + reduced-motion |
| `Resources` | Astro | 3 static cards (no CMS v1) |
| `CtaBanner` | Astro | Mid-page band |
| `Contact` | Astro shell + Preact form island | Validation + submit UX |
| `Footer` | Astro | Link columns; legal hrefs TBD |
| `WhatsAppFab` | Astro (anchor) | `wa.me` URL; a11y label |
| `Button`, `SectionHeading`, `Badge` | Astro primitives | Match mock visual language |

## Astro / Preact island boundaries

**Default to zero JS.** Hydrate only:

1. **MobileNav** — open/close, focus trap, Escape, body scroll lock.
2. **ContactForm** — client validation, pending/success/error states; submit via form action, mailto, or third-party endpoint (assumption).
3. **LogoCarousel** — only if CSS marquee cannot meet a11y/pause-on-hover; prefer CSS-first.
4. **LangSwitcher** — only if real ES/EN content swap ships; otherwise decorative flags with `aria` and documented no-op/placeholder (assumption: ES-only v1 UI copy from mockups).
5. **HeroVideo** (optional) — if MP4 used: muted, loop, playsinline, pause when offscreen / `prefers-reduced-motion`.

Do **not** island: pure section layout, footer, static cards, WhatsApp link.

## Responsive / interactivity implications

- Mockups are **desktop-width only**. Mobile/tablet are unspecified → derive from standard patterns while preserving hierarchy: stack hero (copy then media), 1-col cards, horizontal scroll or 2×2→1-col solutions, collapse nav to hamburger, full-width form.
- Sticky navbar + FAB must not obscure primary CTAs on small viewports (safe-area insets).
- Carousel: pause on hover/focus; honor `prefers-reduced-motion: reduce` (static row).
- Process steps: connected timeline on desktop → vertical stepper on mobile.
- Form: two-column fields → single column; native `<select>` for Asunto with accessible label.
- Language control: flags alone fail WCAG → text/accessible name required if interactive.

## Docker-first constraints

- No host Node workflow as source of truth: `docker compose` for install, dev server, build, preview.
- Pin Node + pnpm versions in images; use corepack or explicit pnpm.
- Dev: bind-mount source, preserve `node_modules` volume, sensible file-watch on Linux.
- Prod: multi-stage build → static `dist/` served by nginx (or Astro adapter only if SSR later — **SSG preferred** for marketing).
- Compose targets: `dev`, `build`, `preview`/`prod`.
- `.dockerignore`: `node_modules`, `dist`, `.git`, `.atl`.

## Accessibility

- Landmark regions: `header`/`nav`, `main`, `footer`; section `aria-labelledby`.
- Skip link to `#main`.
- Color contrast on gradient text/buttons (blue/teal on dark and light).
- Focus visible on all interactive controls; FAB keyboard reachable.
- Form: associated labels, required announced, error text linked via `aria-describedby`.
- Decorative mascot/video: empty alt / `aria-hidden`; meaningful stats not image-only.
- Carousel: not keyboard-trap; motion reduced path.
- Lang attributes if bilingual later (`hreflang` / `lang` swap).

## SEO / performance

- SSG single page; semantic heading order (one H1 in hero).
- Meta title/description, canonical, Open Graph/Twitter using logo/mascot.
- JSON-LD `Organization` (+ `LocalBusiness` optional) from contact block address/phone.
- Fonts: subset, `font-display: swap`; self-host if Docker-offline friendly.
- Images: use `logo.webp` as-is; convert flags to compressed WebP; width/height to avoid CLS; Astro `<Image>` where applicable.
- Video: ~1.4 MB + audio track — prefer poster = logo frame, lazy load, muted; strip audio in encode pipeline if only visual.
- Minimal client JS (islands); Tailwind purge; no heavy carousel lib unless needed.
- Sitemap/robots trivial for one route.

## Content uncertainties (non-blocking assumptions)

| Topic | Assumption for proposal |
|-------|-------------------------|
| Page model | Single-page landing with in-page anchors; no multi-route IA in v1 |
| Language | Spanish UI copy from mockups; lang switcher UI present, ES-only content until copy supplied |
| Iniciar sesión / Vacantes | External placeholder URLs (env/config) |
| Soluciones "Conocer más" | In-page `#servicios` detail anchors or button-as-scroll; no separate service pages v1 |
| Footer services list | Differs from 4 solution cards (adds Headhunting, Capacitación, etc.) — render as mock shows; may be non-linked or same section |
| Blog posts | Static fixture content from mockup; cards non-navigating or `#` until CMS |
| Client logos | Labeled placeholder pills matching mock names (not real trademarks) until assets provided |
| Contact form backend | Client validation + progressive enhancement; success UI without real mail API unless endpoint provided |
| WhatsApp number | Config constant; use contact phone `+5215610275879` as default target |
| Legal links | Footer links to `#` or minimal stub pages out of first slice |
| Social URLs | Icons visible; `href` placeholders |
| clip-logo.mp4 | Optional enhancement in Hero; static `logo.webp` is enough for first slice |
| Design tokens | Extract blues/teals/gradients/radii from mockups into Tailwind theme |

## Approaches

1. **SSG single-page + selective Preact islands (recommended)** — Astro pages/components for sections; islands only for nav/form/(carousel); Docker SSG → static nginx.
   - Pros: Matches stack constraints; minimal JS; fast LCP; clear section ownership; fits chained PRs by section.
   - Cons: Real i18n/CMS/form backend need follow-up changes.
   - Effort: Medium (greenfield scaffold dominates).

2. **Multi-page mini-site (servicios/recursos/legal as routes)** — More IA fidelity to footer service names and blog "Conocer más".
   - Pros: Cleaner deep links/SEO per resource.
   - Cons: No mockups for inner pages; scope creep; delays visual parity with supplied mockups.
   - Effort: High.

3. **Heavy client SPA (Preact app shell)** — Hydrate most UI.
   - Pros: Easier complex widgets.
   - Cons: Fights Astro islands intent, worse default perf/SEO, unnecessary for marketing page.
   - Effort: Medium–High with worse outcomes.

## Recommendation

**Approach 1.** Implement one SSG landing that mirrors the six mockups top-to-bottom, with Docker + pnpm scaffold first, then section components, then islands.

### Sensible first-slice scope (PR chain, ≤400 lines each where possible)

| Slice | Deliverable |
|-------|-------------|
| **1 — Foundation** | Docker + pnpm + Astro/TS/Tailwind/Preact scaffold; `BaseLayout`; global tokens; asset pipeline copying `design/assets`; empty `index` shell |
| **2 — Chrome + Hero** | Navbar (desktop + mobile island), Hero with `logo.webp`, WhatsApp FAB, basic SEO |
| **3 — About + Solutions** | Quiénes somos + 4 solution cards |
| **4 — Empresas + carousel** | Process steps + accessible logo strip |
| **5 — Recursos + CTA band** | Static posts + Consulta Gratuita band |
| **6 — Contact + Footer** | Contact info, form island, footer columns |

`delivery_strategy: auto-chain` + `review_budget_lines: 400` → tasks phase should forecast chained PRs; foundation+hero may need split if scaffold is large.

### Out of scope for this change (unless product expands)

- Real auth / vacancies product integration
- CMS or MDX blog system
- Full EN locale content
- Production mail/CRM integration (beyond pluggable endpoint)
- Pixel-perfect mobile mockups (none provided — responsive interpretation)
- Real third-party brand logos

## Risks

- **Asset gap:** carousel brands and icons not in `design/assets` → placeholders may look unfinished until design drops files.
- **Video audio:** autoplay with sound is blocked/bad UX; must mute or not use video initially.
- **Form without backend:** risk of dead submit if treated as production-ready without explicit endpoint.
- **Nav promises:** Vacantes / Iniciar sesión / legal / social / Conocer más can 404 or no-op if placeholders not documented.
- **Footer vs Solutions taxonomy mismatch** may confuse specs — keep both as designed, note inconsistency.
- **No mobile mockups** → visual QA subjective; define breakpoints in design phase.
- **Docker-only DX** increases first-slice size (compose + Dockerfiles + README) vs host scaffold.
- **Strict TDD false** until scaffold; re-detect runner after foundation or acceptance stays manual/visual.
- **Trademark risk** if placeholder company names/logos imply real brands beyond mock intent.
- **i18n half-measure:** visible flags without EN content is an a11y/product smell — document ES-only v1.

## Ready for Proposal

**Yes.** No blocking product decision required for a responsible proposal.

Orchestrator should proceed to **sdd-propose** for `initial-teamjobs-landing` with the assumptions above locked as defaults, and call out open config knobs (external URLs, WhatsApp number, form endpoint) as proposal decisions rather than exploration blockers.

## Checklist

- [x] All 6 mockups inspected
- [x] All 4 design assets inspected (dims/codecs)
- [x] Repo greenfield state verified
- [x] Island vs static boundaries proposed
- [x] Docker/pnpm constraints reflected
- [x] First-slice + chain strategy outlined
- [x] Non-blocking content assumptions listed

## Next step

Run **sdd-propose** for change `initial-teamjobs-landing`.
