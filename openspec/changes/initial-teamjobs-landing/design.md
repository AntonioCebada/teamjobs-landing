# Design: Initial TeamJobs Landing

## Technical Approach

Astro 5 SSG (`output: 'static'`), zero-JS by default, `@astrojs/preact` islands only where specs allow. Tailwind v4 via `@tailwindcss/vite`, tokens in CSS `@theme`. TypeScript strict. pnpm-only inside pinned Docker images; multi-stage prod → nginx serving `dist/`. One route (`/`), six sections, ES copy in a typed content module, behavior knobs in a config module. All tooling (install, dev, build, test, lint, e2e) runs exclusively inside Docker.

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

**Choice**: exactly two modules — `src/config/site.ts` exporting `siteConfig` (behavior knobs: placeholder URLs, `whatsappNumber` default `'+5215610275879'`, `formEndpoint: string | null`, `enableHeroVideo: boolean`) and `src/content/site.ts` exporting `siteContent` (all visible ES display copy extracted from mockups). No other naming variant (`site.config.ts`, `site.content.ts`) is used anywhere — components import only these two paths.
**Rationale**: copy changes never touch behavior; product URLs land in one diff; one scheme removes import ambiguity.

### Decision: Font loading (compliant path)

**Choice**: the mockup typeface is delivered via a versioned pnpm dependency from the `@fontsource-variable/*` family (exact family pinned at scaffold time to match mockups), imported in `src/styles/global.css` with `font-display: swap`, built into hashed `dist/` assets. Fallback: system-ui stack if no confident mockup match.
**Alternatives rejected**: CDN fonts (external request, no offline build); self-hosting font files (none exist under `design/assets/` — would violate the supplied-media constraint).
**Rationale**: an npm dependency is not "supplied media"; it satisfies the spec's "fonts SHOULD be self-hosted" without inventing assets.

### Decision: Asset pipeline

`logo.webp`, `mexico.png`, `usa.jpg` → `src/assets/` via `astro:assets` `<Image>` (flags re-encoded to compressed WebP, explicit `width`/`height` → no CLS). `clip-logo.mp4` → `public/`. Missing assets (client logos, icons, blog art, social glyphs) → `Placeholder.astro` labeled pills/art with neutral invented names (no real trademarks).

### Decision: Docker topology / nginx

One `Dockerfile`, targets: `base` (`node:<pin>-alpine` + `corepack prepare pnpm@<pin>`), `dev`, `build` (image-stage instruction `RUN pnpm install --frozen-lockfile && pnpm build`, evaluated by the container's shell at image build — never by the host), `prod` (`nginx:<pin>-alpine` + `COPY --from=build dist/`). Compose services: `dev`, `build`, `preview`, plus `test` (unit/static quality) and `e2e` (`mcr.microsoft.com/playwright:<pin>` image, depends on `preview`). Pins locked to latest stable at scaffold time, recorded in Dockerfile comments. `nginx.conf`: `try_files` to `index.html`, gzip, long cache for hashed `/assets/*`, no-cache HTML, security headers.

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
- **Load**: `client:visible` + `preload="none"` → no network fetch until enabled and near viewport.

### WhatsAppFab (positioning, non-obscuring, new context)

- **Positioning**: `position: fixed; right: calc(1rem + env(safe-area-inset-right)); bottom: calc(1rem + env(safe-area-inset-bottom))`; z-index below MobileNav overlay.
- **Non-obscuring**: `<main>`/footer reserve `padding-bottom: calc(4.5rem + env(safe-area-inset-bottom))` so no CTA (Consulta Gratuita band, contact submit) can ever sit under the FAB at any viewport.
- **New context**: `<a target="_blank" rel="noopener noreferrer" aria-label="Abrir chat de WhatsApp en una nueva ventana">` — the accessible name announces the new context.
- Static Astro — no hydration (per spec).

### ContactForm (validation, focus, announcements)

- **Invalid submit**: validation runs on submit; block native submit; set `aria-invalid="true"` + per-field error in an element referenced by `aria-describedby`; move **focus to the first invalid field**; an error summary with `role="alert"` lists the errors as anchor links to their fields.
- **Announcements**: a visually-hidden `aria-live="polite"` region announces state transitions: `"Enviando…"` (pending), `"Mensaje enviado correctamente."` (success), `"No se pudo enviar el mensaje. Inténtalo de nuevo."` (error).
- **Demo honesty**: when `formEndpoint` is `null`, success UI reads `"Demostración: tus datos no se han enviado."` — never claims real delivery.
- Pending disables submit; failure preserves input. Labels visible; required announced (`aria-required` + visible marker); Asunto is a native labeled `<select>`.

## Interfaces / Contracts

```ts
// src/config/site.ts
export const siteConfig = {
  whatsappNumber: '+5215610275879',
  formEndpoint: null as string | null, // null = documented demo mode
  enableHeroVideo: false,
  urls: { vacantes: '#', login: '#', socials: { /* '#' */ }, legal: { /* '#' */ } },
} as const;

// src/content/site.ts — ALL visible UI copy, Spanish only
export const siteContent = {
  form: {
    pending: 'Enviando…',
    success: 'Mensaje enviado correctamente.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
    demoNote: 'Demostración: tus datos no se han enviado.',
    // field labels, placeholders, errors: 'El correo no es válido.', etc.
  },
  fab: { ariaLabel: 'Abrir chat de WhatsApp en una nueva ventana' },
  // nav, hero, about, solutions, empresas, recursos, cta, contact, footer…
} as const;

type ContactFormData = { name: string; email: string; subject: string;
  message: string; phone?: string; company?: string };
type SubmitState = 'idle' | 'pending' | 'success' | 'error';
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `nginx.conf` | Create | Docker-only dev/build/preview/test/e2e + prod serving |
| `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `tsconfig.json` | Create | pnpm-only pinned scaffold |
| `src/styles/global.css` | Create | Tailwind `@theme` tokens + fontsource import |
| `src/config/site.ts`, `src/content/site.ts` | Create | Config knobs + ES copy (single naming scheme) |
| `src/layouts/BaseLayout.astro` | Create | `lang="es"`, landmarks, skip link, SEO/OG/JSON-LD |
| `src/components/*.astro` (Navbar, Hero, About, Solutions, Empresas, Carousel, Recursos, CtaBand, Contact, Footer, WhatsAppFab, Placeholder, Seo) | Create | Static sections |
| `src/islands/{MobileNav,ContactForm,HeroVideo}.tsx` | Create | Preact islands per contracts above |
| `src/pages/index.astro` | Create | Single route, spec section order |
| `src/assets/*`, `public/clip-logo.mp4` | Create | Media from `design/assets/` only |
| `tests/{unit,e2e}/`, ESLint/Prettier configs | Create | Quality layer |

## Testing Strategy (Docker-only — host Node/pnpm never required)

Every `pnpm` process executes inside a container. Each documented command is a complete `docker compose` invocation — an unquoted host-shell `&&` followed by a bare `pnpm` would run pnpm on the host and is out of contract.

| Layer | What | Commands (only documented form) |
|-------|------|-------------------------------|
| Unit | form validation, config defaults | `docker compose run --rm test pnpm vitest run` |
| Static | types, a11y markup, lint, format | `docker compose run --rm test pnpm astro check` · `docker compose run --rm test pnpm eslint .` · `docker compose run --rm test pnpm prettier --check .` |
| E2E | section order/anchors, nav behavior, form states, reduced-motion, axe | `docker compose run --rm e2e` (Playwright image against `preview` service) |
| Build gate | all six sections served | `docker compose build && docker compose up preview` (both sides are `docker compose`; no host pnpm involved) |

Single-command alternative for the static layer, properly container-scoped so the container's shell — not the host's — evaluates the chain: `docker compose run --rm test sh -c "pnpm astro check && pnpm eslint . && pnpm prettier --check ."`.

README documents **only** `docker compose` commands; any host-`pnpm` invocation is out of contract.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout — review accounting contract (`auto-chain`, TOTAL lines)

**Budget rule**: `review_budget_lines: 400` caps each PR at **400 TOTAL changed lines** — additions plus deletions across every file in the diff, including generated files (`pnpm-lock.yaml`, any future generated types), configs, tests, and docs. No file is excluded from the count. `delivery_strategy: auto-chain` is preserved: slices ship as chained PRs.

**Generated-output gate (no silent exclusions)**: if any generated artifact's diff alone exceeds 400 lines, the affected slice STOPS before apply for explicit reviewer-burden approval — a maintainer-granted `size:exception`. Known case: `pnpm-lock.yaml` for this stack is ~5k lines and cannot fit under 400, so slice 1 (the dedicated dependency/scaffold slice) REQUIRES an approved `size:exception` before apply. The exception covers only the generated diff; the slice's hand-written content still stays ≤400, and the PR body states the exception rationale and review path (review `package.json`; machine-verify the lockfile via `pnpm install --frozen-lockfile` inside Docker — never line-by-line lockfile reading).

**Planned slices** (forecast in TOTAL changed lines; task planning re-forecasts every slice in total lines before each apply):

| # | Slice | Forecast (total lines) |
|---|-------|------------------------|
| 1 | Dependency/scaffold: Docker, configs, `package.json` + `pnpm-lock.yaml`, BaseLayout, tokens | ~330 hand-written + ~5k lockfile → **`size:exception` gate** |
| 2 | Chrome + Hero: Navbar, MobileNav island, Hero, HeroVideo, FAB | ~370 |
| 3 | About + Solutions | ~290 |
| 4 | Empresas + CSS Carousel | ~270 |
| 5 | Recursos + CTA band | ~250 |
| 6 | Contact + Footer + ContactForm | ~390 |

**Split rule**: if a slice's re-forecast exceeds 400 TOTAL lines, split at component/section boundaries BEFORE implementing (e.g. slice 6 → 6a ContactForm island, 6b Contact section + Footer; slice 2 → 2a Navbar+MobileNav, 2b Hero+HeroVideo+FAB). Generated files count in every forecast; lines are never silently excluded. A generated artifact that alone exceeds 400 (lockfile) triggers the `size:exception` gate above instead of a split. Never split mid-component; each resulting PR must build green via the Docker build gate.

**Rollback**: revert any slice via `git revert` and redeploy the previous nginx image; full rollback removes the scaffold (no state/DB).

## Open Questions

- [ ] Exact token hex values and mockup font family — extracted from mockups at implementation (approximations would be invented); fontsource package pinned then.
- [ ] Pinned Node/pnpm/nginx/Playwright versions — locked to latest stable at scaffold time, then frozen.
- [ ] Hero video enablement — stays `false` until design confirms muted/acceptable.
