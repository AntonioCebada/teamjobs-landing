# Proposal: Initial TeamJobs Landing

## Intent

TeamJobs has no public web presence to convert visitors. This change ships a single-page marketing landing faithful to `design/mockups/` (visual SoT), giving **companies hiring talent** and **candidates** a Spanish-first entry point with clear CTAs (contact, WhatsApp, Consulta Gratuita). Outcome: a fast, accessible static site built and previewed through Docker; deployment execution/configuration and backend integration are outside this change.

## Scope

### In Scope
- Docker-first, pnpm-only scaffold: Astro + TypeScript + Tailwind + Preact, pinned Node/pnpm, compose targets `dev`/`build`/`preview`, multi-stage prod → static `dist/` on nginx
- Single SSG route with the six mockup sections: Navbar+Hero+WhatsApp FAB · Quiénes somos · Solutions (4 cards) · Empresas process + logo carousel · Recursos + Consulta Gratuita CTA band · Contact + Footer
- Selective Preact islands only: mobile nav, contact form, logo carousel (CSS-first), optional muted hero video
- Spanish v1 copy extracted from mockups; flags present but ES-only content
- A11y/SEO/perf baseline: landmarks, skip link, one H1, OG/Twitter meta, JSON-LD Organization, sized WebP images, minimal client JS
- Config knobs: external URL placeholders (Iniciar sesión, socials, legal) and WhatsApp number (default `+5215610275879`); the Contact form has no endpoint or transport configuration

### Out of Scope
- Vacancies are entirely excluded (section, route, navigation action, CTA, URL, config key, and requirement); real auth/product integration; CMS or blog system; EN locale content
- Contact submission transport, production mail/CRM integration, and any backend delivery behavior
- Deployment execution or deployment configuration; the future Cloudflare Tunnel → Dokploy/Traefik → nginx:80 path is architectural context only
- Real client brand logos; icon/asset packs not in `design/assets/` (placeholders used)
- Pixel-perfect mobile (no mockups — standard responsive interpretation); legal page content

## Capabilities

### New Capabilities
- `landing-foundation`: Docker/pnpm/Astro/TS/Tailwind/Preact scaffold, `BaseLayout`, design tokens, asset pipeline from `design/assets`
- `landing-sections`: the six page sections with ES copy and static content (about, solutions, process, recursos, CTA band)
- `site-navigation`: navbar (desktop + mobile island), footer columns, in-page anchors, external URL placeholders, WhatsApp FAB
- `contact-form`: Preact form island with client-side validation, accessible field states, and an explicit inactive notice; it MUST NOT send data
- `interactive-islands`: hydration policy — mobile nav, CSS-first carousel with reduced-motion path, optional hero video

### Modified Capabilities
- None — greenfield repository.

## Approach

Astro SSG, zero-JS by default; hydrate only nav/form/carousel islands. Tokens (blues/teals/radii) extracted from mockups into Tailwind. Asset gaps (icons, client logos, blog art) become CSS/labeled placeholders until design supplies files. Staged delivery uses `auto-chain` with the `feature-branch-chain` strategy. Historical PR1 was the only generated-lockfile `size:exception`: under the original 400-total-line planning baseline, its lockfile could not fit. For the current remaining work, the maintainer's SDD Session Preflight approves `review_budget_lines: 800`, an 800-authored-changed-line ceiling per chained slice; the present 596-line Contact-form slice leaves 204 lines of headroom under that ceiling and has no new size exception. The remaining slices are 2 Chrome+Hero → 3 About+Solutions → 4 Empresas+carousel → 5 Recursos+CTA → 6 Contact+Footer.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `Dockerfile*`, `docker-compose.yml`, `.dockerignore` | New | Docker-first dev/build/preview |
| `package.json`, `pnpm-lock.yaml`, `astro.config.*`, `tsconfig.json`, tailwind config | New | pnpm-only scaffold |
| `src/pages/index.astro`, `src/layouts/`, `src/components/**`, `src/islands/**` | New | Single landing + sections + islands |
| `src/content/` (ES copy), `public/`/`src/assets/` | New | Copy module; media from `design/assets` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Asset gap (carousel logos, icons) | High | Labeled placeholders; swap when design delivers |
| Visual-only form honesty | Med | Local validation and an explicit inactive notice; no endpoint, transport, pending backend state, or delivery claim |
| Placeholder URLs no-op/404 | Med | Central config constants; documented as intentional |
| No mobile mockups | Med | Breakpoints defined in design phase; visual QA |
| Video has audio track | Low | Static `logo.webp` default; video optional, muted |
| Historical PR1 generated lockfile | High (historical) | The original 400-total-line baseline required the sole approved `size:exception` for PR1's generated lockfile. This exception is historical only; current remaining slices use the 800-authored-changed-line ceiling and the present 596-line slice has 204 lines of headroom with no new exception. |
| Footer/solutions taxonomy mismatch | Low | Render both as mocked; note inconsistency in specs |

## Rollback Plan

Static SSG output, no DB or state: revert any chained PR slice independently (git revert) and recreate the prior local/CI static artifact. This change does not execute or configure deployment. Full rollback removes the scaffold, returning the repo to design-only state.

## Dependencies

- `design/mockups/` + `design/assets/` (present)
- Docker toolchain; pinned Node + pnpm via corepack
- Deferred product inputs: social/auth URLs only; no Contact transport is configured by this change

## Success Criteria

- [ ] `docker compose` build/preview serves all six sections matching mockups
- [ ] Only intended islands hydrate; a11y landmarks + SEO meta verified
- [ ] All placeholders resolve to documented config values
- [ ] Contact renders accessible fields and client-side validation while MUST NOT sending, fetching, or claiming delivery
- [ ] Each current remaining delivery slice ≤800 authored changed lines; the current 596-line slice has 204 lines of headroom, while historical PR1's generated-lockfile `size:exception` remains an audit fact and is not reused
