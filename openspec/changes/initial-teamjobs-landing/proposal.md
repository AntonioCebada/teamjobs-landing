# Proposal: Initial TeamJobs Landing

## Intent

TeamJobs has no public web presence to convert visitors. This change ships a single-page marketing landing faithful to `design/mockups/` (visual SoT), giving **companies hiring talent** and **candidates** a Spanish-first entry point with clear CTAs (contact, WhatsApp, Consulta Gratuita). Outcome: a fast, accessible, Docker-deployable static site ready for real endpoints later.

## Scope

### In Scope
- Docker-first, pnpm-only scaffold: Astro + TypeScript + Tailwind + Preact, pinned Node/pnpm, compose targets `dev`/`build`/`preview`, multi-stage prod → static `dist/` on nginx
- Single SSG route with the six mockup sections: Navbar+Hero+WhatsApp FAB · Quiénes somos · Solutions (4 cards) · Empresas process + logo carousel · Recursos + Consulta Gratuita CTA band · Contact + Footer
- Selective Preact islands only: mobile nav, contact form, logo carousel (CSS-first), optional muted hero video
- Spanish v1 copy extracted from mockups; flags present but ES-only content
- A11y/SEO/perf baseline: landmarks, skip link, one H1, OG/Twitter meta, JSON-LD Organization, sized WebP images, minimal client JS
- Config knobs: external URL placeholders (Vacantes, Iniciar sesión, socials, legal), WhatsApp number (default `+5215610275879`), pluggable contact-form endpoint

### Out of Scope
- Real auth / vacancies product integration; CMS or blog system; EN locale content
- Production mail/CRM integration beyond the pluggable endpoint
- Real client brand logos; icon/asset packs not in `design/assets/` (placeholders used)
- Pixel-perfect mobile (no mockups — standard responsive interpretation); legal page content

## Capabilities

### New Capabilities
- `landing-foundation`: Docker/pnpm/Astro/TS/Tailwind/Preact scaffold, `BaseLayout`, design tokens, asset pipeline from `design/assets`
- `landing-sections`: the six page sections with ES copy and static content (about, solutions, process, recursos, CTA band)
- `site-navigation`: navbar (desktop + mobile island), footer columns, in-page anchors, external URL placeholders, WhatsApp FAB
- `contact-form`: Preact form island with client validation, states, and pluggable submit endpoint
- `interactive-islands`: hydration policy — mobile nav, CSS-first carousel with reduced-motion path, optional hero video

### Modified Capabilities
- None — greenfield repository.

## Approach

Astro SSG, zero-JS by default; hydrate only nav/form/carousel islands. Tokens (blues/teals/radii) extracted from mockups into Tailwind. Asset gaps (icons, client logos, blog art) become CSS/labeled placeholders until design supplies files. Staged delivery as chained PRs ≤400 TOTAL changed lines each (`auto-chain`; generated files and lockfiles count, no silent exclusions): 1 Foundation (dedicated dependency/scaffold slice incl. `pnpm-lock.yaml` — the generated lockfile alone exceeds 400, so this slice ships only with a maintainer-approved `size:exception`) → 2 Chrome+Hero → 3 About+Solutions → 4 Empresas+carousel → 5 Recursos+CTA → 6 Contact+Footer.

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
| Form without real backend | Med | Pluggable endpoint config; documented pending state |
| Placeholder URLs no-op/404 | Med | Central config constants; documented as intentional |
| No mobile mockups | Med | Breakpoints defined in design phase; visual QA |
| Video has audio track | Low | Static `logo.webp` default; video optional, muted |
| Lockfile diff exceeds 400-line review budget | High | Scaffold slice stops for maintainer-approved `size:exception`; reviewers check `package.json` + Docker `pnpm install --frozen-lockfile`, never the lockfile line-by-line |
| Footer/solutions taxonomy mismatch | Low | Render both as mocked; note inconsistency in specs |

## Rollback Plan

Static SSG output, no DB or state: revert any chained PR slice independently (git revert) and redeploy the previous nginx image. Full rollback removes the scaffold, returning the repo to design-only state.

## Dependencies

- `design/mockups/` + `design/assets/` (present)
- Docker toolchain; pinned Node + pnpm via corepack
- Deferred product inputs as config: form endpoint, social/vacancies/auth URLs

## Success Criteria

- [ ] `docker compose` build/preview serves all six sections matching mockups
- [ ] Only intended islands hydrate; a11y landmarks + SEO meta verified
- [ ] All placeholders resolve to documented config values
- [ ] Each delivery slice ≤400 TOTAL changed lines (all files incl. `pnpm-lock.yaml`); sole exception: maintainer-approved `size:exception` for the lockfile scaffold slice
