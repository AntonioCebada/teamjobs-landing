# landing-foundation Specification

## Purpose

Docker-first, pnpm-only scaffold (Astro + TypeScript + Tailwind + Preact) that builds the landing as a static site, plus the base layout, design tokens, asset pipeline, and accessibility/SEO/performance baseline every section relies on.

## Requirements

### Requirement: Docker-only workflows

The project SHALL provide `docker-compose.yml` targets for `dev`, `build`, `preview`, and `test`. All available install, dev-server, build, preview, test, lint, format, and type-check commands MUST run inside Docker containers; every documented quality command MUST be a complete `docker compose` invocation (or a single container-scoped shell string such as `docker compose run --rm test sh -c "..."`) so that no pnpm process ever executes on the host. Managed browser E2E infrastructure is not a deliverable of this correction: task 4.2 MUST remove the managed Playwright Compose image/service, and no Playwright package, image pull, or installation occurs here. Host Node.js SHALL NOT be required for any documented workflow.

#### Scenario: Dev server via compose

- GIVEN a clean clone with Docker installed
- WHEN the developer runs the documented `docker compose` dev command
- THEN the dev server starts and serves the landing with file-watch working on Linux

#### Scenario: No host toolchain

- GIVEN a machine without Node or pnpm installed
- WHEN the developer runs any documented workflow
- THEN it succeeds using only Docker

#### Scenario: Quality tooling never escapes Docker

- GIVEN a machine without Node or pnpm installed
- WHEN lint, format-check, type-check, or unit-test commands run as documented
- THEN every pnpm process executes inside a container via `docker compose`, with no host-shell chaining that would run pnpm on the host

### Requirement: pnpm-only package management

Dependencies MUST be installed with pnpm, with Node and pnpm versions pinned in the images (corepack or explicit install). npm and yarn SHALL NOT be used in any script, doc, or image.

#### Scenario: Pinned toolchain

- GIVEN the project images
- WHEN a container builds
- THEN Node and pnpm resolve to the pinned versions

### Requirement: Static production serving

The production image MUST be multi-stage: build stage produces static `dist/`, final stage serves it with nginx. No server-side runtime SHALL ship in the production image.

#### Scenario: Production build and preview

- GIVEN the compose `build` and `preview` targets
- WHEN they run in sequence
- THEN nginx serves the static `dist/` output with all six sections reachable

### Requirement: Base layout and design tokens

A shared base layout MUST define the HTML shell with `lang="es"`, semantic landmarks, and font loading. Colors, gradients, and radii from `design/mockups/` MUST be encoded as Tailwind design tokens and used by sections instead of ad-hoc values.

#### Scenario: Tokens over hard-coded values

- GIVEN a section component
- WHEN it styles a branded surface
- THEN it references theme tokens, not literal hex values

### Requirement: Asset pipeline with fallbacks

Only files under `design/assets/` SHALL be used as supplied media. Missing assets (client logos, icon set, blog art, social glyphs) MUST render as clearly labeled placeholders. Raster images MUST be sized (width/height) to prevent layout shift; flags SHOULD be served as compressed WebP.

#### Scenario: Missing client logos

- GIVEN no client logo files exist
- WHEN the carousel renders
- THEN labeled placeholder pills appear in place of logos

### Requirement: Accessibility, SEO, and performance baseline

The page MUST include a skip link to main content, exactly one H1, landmark regions, visible focus styles, meta title/description, canonical URL, Open Graph/Twitter meta, and JSON-LD `Organization`. Client-side JavaScript MUST be minimal (islands only); fonts SHOULD be self-hosted with `font-display: swap`.

#### Scenario: SEO meta present

- GIVEN the built page HTML
- WHEN inspected
- THEN title, description, OG/Twitter tags, and JSON-LD Organization are present

#### Scenario: Keyboard entry

- GIVEN a keyboard-only user
- WHEN they press Tab on page load
- THEN the skip link is the first focusable element and moves focus to main
