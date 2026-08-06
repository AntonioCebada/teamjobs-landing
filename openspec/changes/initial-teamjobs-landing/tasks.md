# Tasks: Initial TeamJobs Landing

## Review Workload Forecast

Estimated changed lines: 7,410–8,490 total (historical full-change forecast). Delivery: auto-chain.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

The forecast markers above retain the original 400-line risk signal for auditability; they do not set the current remaining-work ceiling.

**Historical PR1 record:** PR1 candidate accounting remains capped at 5,580 total lines under the original 400-total-line planning baseline. Its generated `pnpm-lock.yaml` was the sole approved `size:exception`; that historical exception is preserved and is not expanded or reused.

**Current preflight resolution:** The maintainer's current SDD Session Preflight approves `review_budget_lines: 800`, an 800-authored-changed-line ceiling for each remaining `auto-chain` slice with `feature-branch-chain`. The current 596-line Contact-form slice leaves 204 lines of headroom under that ceiling and has no new `size:exception`.

Use a draft/no-merge tracker targeting `main`. PR1 targets the tracker branch; each child targets its immediate parent branch; only the tracker merges to `main`. Fix polluted child diffs.

**Bounded remediation:** managed browser E2E is not part of this correction. Pending task 4.2 removes the managed Playwright Compose image/service; the maintainer installs and runs Playwright manually outside this change. The Preact runtime remains in the scaffold; its Astro adapter is deferred with the first interactive island. Astro Check remains Docker-scoped through the pinned `pnpm check` script.

## Work Units

Command key: **U(path)** = `docker compose run --rm test pnpm vitest run path`; **E(path)** = maintainer-managed browser check, not a Compose target in this change; **A** = `docker compose run --rm test pnpm check`; **D/P** = `docker compose up dev` / `docker compose up preview`.

| PR | Start → end; dependency | Total lines | Focused test | Harness | Rollback |
|---|---|---:|---|---|---|
| 1 | Historical design-only → reproducible scaffold; none | 5,180–5,580; historical generated-lockfile exception | U(`tests/unit/config.test.ts`) | D | Docker/config/manifests/lock/route |
| 2 | Scaffold → layout/tokens/SEO/assets; PR1 | 300–390 | A | P | Layout/SEO/styles/media |
| 3 | Shell → accessible nav; PR2 | 300–390 | E(`tests/e2e/navigation.spec.ts`) | P | Navbar/MobileNav |
| 4 | Shell → hero/video/FAB; PR3 | 260–350 | E(`tests/e2e/hero-fab.spec.ts`) | P | Hero/HeroVideo/FAB |
| 5 | Hero → About/Solutions; PR4 | 280–360 | E(`tests/e2e/about-solutions.spec.ts`) | P | Components/copy |
| 6 | Sections → Empresas/carousel; PR5 | 250–340 | E(`tests/e2e/empresas.spec.ts`) | P | Empresas/Carousel/placeholders |
| 7 | Empresas → Recursos/CTA; PR6 | 220–300 | E(`tests/e2e/recursos.spec.ts`) | P | Recursos/CtaBand/copy |
| 8 | Config → validated visual-only Contact form; PR7 | 596 (≤800; 204 headroom; no exception) | U(`tests/unit/contact-form.test.ts`) | P | ContactForm/form copy |
| 9 | Form → integrated page; PR8 | 320–390 | E(`tests/e2e/landing.spec.ts`) manual/maintainer-managed | P | Contact/Footer/index |

## Phase 1: Foundation

- [x] 1.1 PR1: create pinned Docker/Compose/nginx, manifests/lockfile, Astro/Preact runtime/Tailwind, route, config, and quality tools; prove frozen install after the exception. Interactive adapter and browser tests are deferred by remediation.
- [x] 1.2 Re-detect testing capabilities into `openspec/config.yaml` before test-order decisions; retain `strict_tdd: false` unless policy changes. Evidence: `openspec/config.yaml` lines 16–34 (introduced at commit `331792e`) records root `strict_tdd: false`, `testing.strict_tdd: false`, detection `2026-07-29`, runner `docker compose run --rm test pnpm vitest run`, Vitest `4.1.10`, unit/integration availability, the historical deferred browser capability, and Docker quality commands. Pending task 4.2 removes the managed browser setup; no browser image/package/pull/install is part of this correction. Preserved exact proof: `docker compose run --rm test pnpm vitest run tests/unit/config.test.ts` — exit 0; 1 file and 2 tests passed; `docker compose run --rm test sh -c "pnpm check && pnpm eslint . && pnpm prettier --check ."` — exit 0; Astro Check 0 errors/0 warnings/0 hints, ESLint passed, and Prettier passed. `strict_tdd=false` is the basis for Standard mode; cached capability record `#1151` and prior apply record `#1173` corroborate the re-detection rather than serving as its only evidence. The scaffold tool scripts are preserved in `package.json` from commit `2c698aa`.
- [x] 1.3 PR2: add tokens/font, styles, layout, SEO, placeholders, and sized media; verify skip link, metadata, and token use. Evidence: commit `75f45db`; verification `#1201`; current regression and Icons0 verification `#1261`.

## Phase 2: Navigation and Hero

- [x] 2.1 PR3: implement/test anchors and MobileNav focus containment, dismissal, scroll restoration, inert background, and no-JS disclosure; Vacantes navigation is intentionally omitted by the approved scope. Evidence: commit `fc8fce9`; verification `#1211`; current source regression and Icons0 verification `#1261`.
- [x] 2.2 PR4: test the static hero, the approved reduced-motion media behavior, and the safe-area WhatsApp FAB without inventing a vacancy route. Evidence: commits `e433688`, `1243fe6`, `20f7999`; verifications `#1216`, `#1252`, `#1261`.

## Phase 3: Sections

- [x] 3.1 PR5: add typed Spanish copy, About, four Solutions cards, and responsive tests. Evidence: commit `85cf206`; verification `#1221`; current visual regression verification `#1252`/`#1261`.
- [x] 3.2 PR6: add four-step Empresas/CSS carousel; test pause, reduced motion, placeholders, and focus. Evidence: commit `692a10d`; verification `#1227`.
- [x] 3.3 PR7: add three Recursos cards/CTA; test labeled art and 320px overflow. Evidence: commit `7ddb0c2`; verification `#1241`.

## Phase 4: Contact and Integration

- [x] 4.1 PR8: implement/test visual-only validation, first-invalid focus, linked errors, live inactive status, preserved input, and authoritative contact details. The form MUST NOT define/use an endpoint, network request, backend state, or delivery claim. Evidence: current worktree focused/full Docker tests and production nginx harness recorded in `apply-progress.md`.
- [ ] 4.2 PR9: add Contact/Footer plus Privacy/Cookies routes; remove the managed Playwright Compose image/service; verify order, ES-only zero-JS, islands, axe, quality, and the local nginx build. No deployment execution/configuration is included.

Threat-matrix RED tasks: none; all categories are N/A in the corrected design.
