# Design: Initial TeamJobs Landing

## Technical Approach

Astro 5 SSG (`output: 'static'`), zero-JS by default, `@astrojs/preact` islands only where specs allow. Tailwind v4 via `@tailwindcss/vite`, tokens in CSS `@theme`. TypeScript strict. pnpm-only inside pinned Docker images; multi-stage local/CI build → nginx preview serving `dist/`. The site has the landing route plus `/privacidad` and `/cookies`, six sections, ES copy in a typed content module, and local behavior knobs in a config module. Contact is visual-only/non-operational. Available tooling runs exclusively inside Docker; deployment execution/configuration is outside this change.

## Architecture Decisions

### Decision: Styling engine

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Tailwind v4 + `@tailwindcss/vite` | CSS-first `@theme` tokens | **Chosen** — current official Astro path |
| `@astrojs/tailwind` (v3) | Deprecated for v4 | Rejected |
| Hand-written CSS | No utility velocity | Rejected |

### Decision: Island boundaries

| Island | Directive | Rationale |
|--------|-----------|-----------|
| `MobileNav` | `client:load` | Immediate interactivity; wraps native `<details>` fallback (works pre-hydration / JS disabled) |
| `ContactForm` | `client:visible` | Below fold; defers largest bundle |
| `HeroVideo` | `client:visible` | Lazy; contract below |
| Carousel | **No island** | CSS keyframe marquee: `:hover`/`:focus-within` pause + `prefers-reduced-motion` static row |
| Navbar, FAB, footer, sections | None | Static Astro; zero JS |

### Decision: Content vs. config naming (single scheme)

**Choice**: exactly two modules — `src/config/site.ts` exporting `siteConfig` (behavior knobs: verified local legal URLs, `whatsappNumber` default `'+5215610275879'`, and navigation) and `src/content/site.ts` exporting `siteContent` (all visible ES display copy extracted from mockups). Unresolved login/social destinations are omitted. Contact has no endpoint or transport configuration. No Vacantes URL or config key is part of the current scope. No other naming variant (`site.config.ts`, `site.content.ts`) is used anywhere — components import only these two paths.
**Rationale**: copy changes never touch behavior; product URLs land in one diff; one scheme removes import ambiguity.

### Decision: Font loading (compliant path)

**Choice**: the mockup typeface is delivered via a versioned pnpm dependency from the `@fontsource-variable/*` family (exact family pinned at scaffold time to match mockups), imported in `src/styles/global.css` with `font-display: swap`, built into hashed `dist/` assets. Fallback: system-ui stack if no confident mockup match.
**Alternatives rejected**: CDN fonts (external request, no offline build); self-hosting font files (none exist under `design/assets/` — would violate the supplied-media constraint).
**Rationale**: an npm dependency is not "supplied media"; it satisfies the spec's "fonts SHOULD be self-hosted" without inventing assets.

### Decision: Asset pipeline

`logo.webp`, `mexico.png`, `usa.jpg` → `src/assets/` via `astro:assets` `<Image>` (flags re-encoded to compressed WebP, explicit `width`/`height` → no CLS). `clip-logo.mp4` → `public/`. Missing assets (client logos, icons, blog art, social glyphs) → `Placeholder.astro` labeled pills/art with neutral invented names (no real trademarks).

### Decision: Docker topology / nginx

One `Dockerfile`, targets: `base` (`node:<pin>-alpine` + `corepack prepare pnpm@<pin>`), `dev`, `build` (image-stage instruction `RUN pnpm install --frozen-lockfile && pnpm build`, evaluated by the container's shell at image build — never by the host), and `prod` (`nginx:<pin>-alpine` + `COPY --from=build dist/`). Compose services cover `dev`, `build`, `preview`, and `test` (unit/static quality); no managed Playwright image or service is retained. Pins remain recorded in Dockerfile comments. `nginx.conf`: `try_files` to `index.html`, gzip, long cache for hashed `/assets/*`, no-cache HTML, security headers.

### Decision: Deployment boundary

Cloudflare Tunnel → Dokploy/Traefik → nginx:80 is a future architectural constraint only. This change MUST NOT configure or execute that path, and it is not a deliverable of task 4.1 or task 4.2.

## Data Flow

```
src/config/site.ts ─┐
src/content/site.ts ┼→ Astro components (static) ────────┐
src/assets ─────────┘                                    ├→ pnpm build → dist/ → nginx
islands/*.tsx (MobileNav, ContactForm, HeroVideo) ───────┘   (hydrated client-side only)
```

## Interaction Contracts

### MobileNav (focus, scroll, dismissal)

- **Open**: render overlay panel; move focus to the panel's first focusable element (close button, else first link).
- **Focus containment**: while open, `Tab`/`Shift+Tab` cycle only within panel focusables (wrap last→first, first→last); background content gets `inert`/`aria-hidden`.
- **Body scroll lock**: on open set `document.body.style.overflow = 'hidden'`; on close restore the previous value exactly (no leftover class or state).
- **Escape close**: `keydown` `Escape` while open → close; closes also on trigger toggle, link activation, and outside pointer down.
- **Focus restoration**: every close path returns focus to the hamburger trigger (except link activation, where focus follows navigation).
- **No-JS**: same markup is a native `<details><summary>` disclosure; hydration enhances it without markup swap.

### HeroVideo (optional, default disabled)

- **Default**: `enableHeroVideo: false` → island not rendered; static `logo.webp` with fixed `width`/`height`.
- **Muted/audio**: `<video muted playsinline preload="none" poster={logo}>`; `muted` set as attribute and property before any `play()`; no `controls`; code never unmutes — audio SHALL NOT play.
- **Reduced motion**: `matchMedia('(prefers-reduced-motion: reduce)')` true → never load/play; poster/static image only.
- **Offscreen pause**: `IntersectionObserver` (threshold 0.25) → `pause()` when below threshold; resume only if it was playing when it left.
- **Load**: `client:visible` + `preload="none"` → media loads only when enabled and near viewport; this media rule does not authorize Contact transport.

### WhatsAppFab (positioning, non-obscuring, new context)

- **Positioning**: `position: fixed; right: calc(1rem + env(safe-area-inset-right)); bottom: calc(1rem + env(safe-area-inset-bottom))`; z-index below MobileNav overlay.
- **Non-obscuring**: `<main>`/footer reserve `padding-bottom: calc(4.5rem + env(safe-area-inset-bottom))` so no CTA (Consulta Gratuita band, contact submit) can ever sit under the FAB at any viewport.
- **New context**: `<a target="_blank" rel="noopener noreferrer" aria-label="Abrir chat de WhatsApp en una nueva ventana">` — the accessible name announces the new context.
- Static Astro — no hydration (per spec).

### ContactForm (local validation, focus, announcements)

- **Invalid activation**: local validation runs on control activation; block native navigation/submission; set `aria-invalid="true"` + per-field error in an element referenced by `aria-describedby`; move **focus to the first invalid field**; an error summary with `role="alert"` lists the errors as anchor links to their fields.
- **Announcements**: a visually-hidden `aria-live="polite"` region announces local validation and inactive status only.
- **Inactive honesty**: valid fields leave the form in place and show `"El formulario de contacto aún no está activo. Tus datos no se enviaron."`; the form MUST NOT define/use an endpoint, POST, fetch, request, network path, pending backend state, backend success/failure, retry, or delivery claim.
- Values remain preserved after every local validation result. Labels are visible; required status is announced (`aria-required` + visible marker); Asunto is a native labeled `<select>`.

## Interfaces / Contracts

```ts
// src/config/site.ts
export const siteConfig = {
  whatsappNumber: '+5215610275879',
  enableHeroVideo: false,
  urls: { login: '#', socials: { /* '#' */ }, legal: { /* '#' */ } },
} as const;

// src/content/site.ts — ALL visible UI copy, Spanish only
export const siteContent = {
  form: {
    inactiveNote: 'Este formulario es solo visual por ahora. Tus datos no se enviarán.',
    // field labels, placeholders, errors: 'El correo no es válido.', etc.
  },
  fab: { ariaLabel: 'Abrir chat de WhatsApp en una nueva ventana' },
  // nav, hero, about, solutions, empresas, recursos, cta, contact, footer…
} as const;

type ContactFormData = { name: string; email: string; subject: string;
  message: string; phone?: string; company?: string };
type FormState = 'idle' | 'invalid' | 'inactive';
```

The approved current scope excludes Vacantes entirely: no vacancy section, route, navigation action, CTA, URL, config key, or requirement is defined.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `nginx.conf` | Create | Docker-only local dev/build/preview/test + static nginx artifact; no deployment execution/configuration |
| `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `tsconfig.json` | Create | pnpm-only pinned scaffold |
| `src/styles/global.css` | Create | Tailwind `@theme` tokens + fontsource import |
| `src/config/site.ts`, `src/content/site.ts` | Create | Config knobs + ES copy (single naming scheme) |
| `src/layouts/BaseLayout.astro` | Create | `lang="es"`, landmarks, skip link, SEO/OG/JSON-LD |
| `src/components/*.astro` (Navbar, Hero, About, Solutions, Empresas, Carousel, Recursos, CtaBand, Contact, Footer, LegalPage, WhatsAppFab, Placeholder, Seo) | Create | Static sections and legal document shell |
| `src/islands/{MobileNav,ContactForm,HeroVideo}.tsx` | Create | Preact islands per contracts above |
| `src/pages/{index,privacidad,cookies}.astro` | Create | Landing and static legal routes |
| `src/assets/*`, `public/clip-logo.mp4` | Create | Media from `design/assets/` only |
| `tests/{unit,e2e}/`, ESLint/Prettier configs | Create | Quality layer |

## Testing Strategy (Docker-only — host Node/pnpm never required)

Every `pnpm` process executes inside a container. Each documented command is a complete `docker compose` invocation — an unquoted host-shell `&&` followed by a bare `pnpm` would run pnpm on the host and is out of contract.

| Layer | What | Commands (only documented form) |
|-------|------|-------------------------------|
| Unit | form validation, config defaults | `docker compose run --rm test pnpm vitest run` |
| Static | types, a11y markup, lint, format | `docker compose run --rm test pnpm astro check` · `docker compose run --rm test pnpm eslint .` · `docker compose run --rm test pnpm prettier --check .` |
| Browser E2E | Not part of this correction; task 4.2 removes the managed Playwright Compose image/service and the maintainer owns any manual browser setup |
| Build gate | all six sections served in the local preview artifact | `docker compose build && docker compose up preview` (both sides are `docker compose`; no host pnpm involved; no deployment is executed) |

Single-command alternative for the static layer, properly container-scoped so the container's shell — not the host's — evaluates the chain: `docker compose run --rm test sh -c "pnpm astro check && pnpm eslint . && pnpm prettier --check ."`.

README documents **only** `docker compose` commands; any host-`pnpm` invocation is out of contract.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout — review accounting contract (historical PR1 exception; current remaining-work ceiling)

**Historical PR1 accounting**: The initial scaffold plan used a 400-total-changed-line baseline. Its generated `pnpm-lock.yaml` exceeded that baseline, so the maintainer approved the sole `size:exception` for PR1. This remains historical evidence and does not establish a current exception.

**Current session accounting**: The maintainer's current SDD Session Preflight approves `review_budget_lines: 800`, an 800-authored-changed-line ceiling for each `auto-chain` slice using `feature-branch-chain`. Authored additions plus deletions are counted for the final slice; its independently measured total, manifest, and headroom are recorded in `apply-progress.md`. Generated artifacts remain visible in the complete diff and are never silently omitted.

**Generated-output gate**: The historical PR1 lockfile exception applies only to that scaffold slice. The final slice must fit the current 800-authored-changed-line ceiling without a new exception. Review the hand-written changes and machine-verify generated output with `pnpm install --frozen-lockfile` inside Docker rather than reviewing a generated lockfile line by line.

**Planned slices** (the forecasts below are the historical plan; task planning re-forecasts every remaining slice against the current 800-authored-changed-line ceiling before apply):

| # | Slice | Forecast (total lines) |
|---|-------|------------------------|
| 1 | Dependency/scaffold: Docker, configs, `package.json` + `pnpm-lock.yaml`, BaseLayout, tokens | ~330 hand-written + ~5k lockfile → **`size:exception` gate** |
| 2 | Chrome + Hero: Navbar, MobileNav island, Hero, HeroVideo, FAB | ~370 |
| 3 | About + Solutions | ~290 |
| 4 | Empresas + CSS Carousel | ~270 |
| 5 | Recursos + CTA band | ~250 |
| 6 | Contact + Footer + ContactForm | ~390 |

**Split rule**: if a remaining slice's re-forecast exceeds 800 authored changed lines, split at component/section boundaries BEFORE implementing (e.g. slice 6 → 6a ContactForm island, 6b Contact section + Footer; slice 2 → 2a Navbar+MobileNav, 2b Hero+HeroVideo+FAB). Generated files remain in the complete forecast; lines are never silently excluded. The historical PR1 lockfile exception is not a split rule or a precedent for a new exception. Never split mid-component; each resulting PR must build green via the Docker build gate.

**Rollback**: revert any slice via `git revert` and recreate the previous local/CI static artifact; no deployment execution or configuration is part of rollback. Full rollback removes the scaffold (no state/DB).

## Open Questions

- [ ] Exact token hex values and mockup font family — extracted from mockups at implementation (approximations would be invented); fontsource package pinned then.
- [ ] Pinned Node/pnpm/nginx versions — locked to latest stable at scaffold time, then frozen. Managed Playwright setup is not installed or pulled in this change.
- [ ] Hero video enablement — stays `false` until design confirms muted/acceptable.
