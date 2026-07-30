# Tasks: Initial TeamJobs Landing

## Review Workload Forecast

Estimated changed lines: 7,410–8,490 total. Delivery: auto-chain.

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

**APPROVED / REMEDIATED:** PR1 candidate accounting remains capped at 5,580 total lines. The current Docker-only candidate is remeasured after dependency reduction; generated `pnpm-lock.yaml` lines remain included with no silent exclusion. The maintainer's generated-lockfile exception is not expanded.

Use a draft/no-merge tracker targeting `main`. PR1 targets the tracker branch; each child targets its immediate parent branch; only the tracker merges to `main`. Fix polluted child diffs.

**Bounded remediation:** the `e2e` Compose service is opt-in under the `e2e` profile, while the Playwright package/config/spec are deferred to the interactive UI work unit. The Preact runtime remains in the scaffold; its Astro adapter is deferred with the first interactive island. Astro Check remains Docker-scoped through the pinned `pnpm check` script.

## Work Units

Command key: **U(path)** = `docker compose run --rm test pnpm vitest run path`; **E(path)** = deferred until the profile-gated Playwright target is restored; **A** = `docker compose run --rm test pnpm check`; **D/P** = `docker compose up dev` / `docker compose up preview`.

| PR | Start → end; dependency | Total lines | Focused test | Harness | Rollback |
|---|---|---:|---|---|---|
| 1 | Design-only → reproducible scaffold; none | 5,180–5,580 | U(`tests/unit/config.test.ts`) | D | Docker/config/manifests/lock/route |
| 2 | Scaffold → layout/tokens/SEO/assets; PR1 | 300–390 | A | P | Layout/SEO/styles/media |
| 3 | Shell → accessible nav; PR2 | 300–390 | E(`tests/e2e/navigation.spec.ts`) | P | Navbar/MobileNav |
| 4 | Shell → hero/video/FAB; PR3 | 260–350 | E(`tests/e2e/hero-fab.spec.ts`) | P | Hero/HeroVideo/FAB |
| 5 | Hero → About/Solutions; PR4 | 280–360 | E(`tests/e2e/about-solutions.spec.ts`) | P | Components/copy |
| 6 | Sections → Empresas/carousel; PR5 | 250–340 | E(`tests/e2e/empresas.spec.ts`) | P | Empresas/Carousel/placeholders |
| 7 | Empresas → Recursos/CTA; PR6 | 220–300 | E(`tests/e2e/recursos.spec.ts`) | P | Recursos/CtaBand/copy |
| 8 | Config → validated form; PR7 | 300–390 | U(`tests/unit/contact-form.test.tsx`) | P | ContactForm/form copy |
| 9 | Form → integrated page; PR8 | 320–390 | E(`tests/e2e/landing.spec.ts`) | P | Contact/Footer/index |

## Phase 1: Foundation

- [x] 1.1 PR1: create pinned Docker/Compose/nginx, manifests/lockfile, Astro/Preact runtime/Tailwind, route, config, and quality tools; prove frozen install after the exception. Interactive adapter and browser tests are deferred by remediation.
- [x] 1.2 Re-detect testing capabilities into `openspec/config.yaml` before test-order decisions; retain `strict_tdd: false` unless policy changes.
- [ ] 1.3 PR2: add tokens/font, styles, layout, SEO, placeholders, and sized media; verify skip link, metadata, and token use.

## Phase 2: Navigation and Hero

- [ ] 2.1 PR3: implement/test anchors and MobileNav focus containment, dismissal, scroll restoration, inert background, and no-JS disclosure.
- [ ] 2.2 PR4: test static hero, optional muted reduced-motion/offscreen video, and safe-area WhatsApp FAB.

## Phase 3: Sections

- [ ] 3.1 PR5: add typed Spanish copy, About, four Solutions cards, and responsive tests.
- [ ] 3.2 PR6: add four-step Empresas/CSS carousel; test pause, reduced motion, placeholders, and focus.
- [ ] 3.3 PR7: add three Recursos cards/CTA; test labeled art and 320px overflow.

## Phase 4: Contact and Integration

- [ ] 4.1 PR8: implement/test validation, first-invalid focus, linked errors, live states, preserved failure input, endpoint flow, and honest demo success.
- [ ] 4.2 PR9: add Contact/Footer; verify order, ES-only zero-JS, islands, axe, quality, and nginx build.

Threat-matrix RED tasks: none; all categories are N/A in the corrected design.
