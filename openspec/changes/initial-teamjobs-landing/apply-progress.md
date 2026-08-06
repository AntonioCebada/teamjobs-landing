# Apply Progress: Initial TeamJobs Landing

## Status

- **Change**: `initial-teamjobs-landing`
- **Mode**: Standard (`strict_tdd: false`)
- **Artifact store**: OpenSpec for this apply slice; prior Engram progress is preserved below
- **Delivery**: auto-chain / feature-branch-chain
- **Current work unit**: `reconcile direct implementation and visual contact form`
- **Boundary**: reconcile completed foundation, navigation, hero, and content slices; implement task 4.1 only
- **Progress**: 9/10 tasks complete
- **Current review budget**: `review_budget_lines: 800`, or 800 authored changed lines per remaining chained slice, approved by the current SDD Session Preflight.
- **Changed-line accounting**: 596 authored implementation lines (67 additions + 18 deletions in tracked source/test files; 511 lines in new source/test files), leaving 204 lines of current-slice headroom.
- **Accounting method**: `git diff --numstat -- src tests` plus `wc -l` for untracked `src/components/Contact.astro`, `src/islands/ContactForm.tsx`, `src/islands/contact-validation.ts`, and `tests/unit/contact-form.test.ts`: `67 + 18 + 511 = 596`; no untracked source/test lines were omitted.
- **Size-exception status**: No new `size:exception` applies to this 596-line slice. The generated-lockfile exception belongs only to historical PR1 under the original 400-total-line planning baseline and is preserved as historical evidence.
- **Native authority**: the orchestrator acquired `proceed` for this work unit. The executor did not call native attempt acquire, settle, or reset operations.
- **Previous progress source**: Engram observation `#1173`, topic `sdd/initial-teamjobs-landing/apply-progress`; its PR1 evidence is preserved below.
- **Historical first-apply evidence (non-active accounting)**: The first native apply result recorded a 698-line candidate. This value is retained for audit history only; the active candidate is 596/800 with 204 lines of headroom and no exception.

## Approved Scope Guard

- Vacancies are entirely out of scope. The current change MUST NOT define a vacancy section, route, navigation action, CTA, URL, config key, or requirement.
- Contact details use the authoritative reference values: address, email, phone, WhatsApp, and hours.
- The Contact form MUST be visual-only/non-operational. It may render fields and client-side validation, but MUST NOT define/use an endpoint or configurable endpoint, POST, fetch, request, network transport, pending backend state, backend success, backend failure, retry behavior, or any claim that data was sent.
- Footer, Privacy/Cookies routes, and removal of the managed Playwright Compose image/service are task 4.2 and remain pending; the maintainer-managed Playwright setup is outside this correction. Deployment execution/configuration is entirely out of scope.
- Astro, Preact, Tailwind, Docker-only tooling, and the existing Icons0-sourced icon registry remain unchanged. No new UI icon was added.

## Completed Tasks

- [x] **1.1** PR1 scaffold and Docker/Astro foundation. Evidence: prior apply-progress observation `#1173`; focused config test, static quality, frozen install, static build, and dev/nginx smoke all passed.
- [x] **1.2** Testing capability detection with `strict_tdd: false`. Concrete evidence: `openspec/config.yaml` lines 16–34 (introduced at commit `331792e`) records root `strict_tdd: false`, `testing.strict_tdd: false`, detection `2026-07-29`, runner `docker compose run --rm test pnpm vitest run`, Vitest `4.1.10`, unit/integration availability, the historical deferred browser capability, and Docker quality commands. Pending task 4.2 removes the managed browser setup; no browser image/package/pull/install is part of this correction. Preserved exact proof: `docker compose run --rm test pnpm vitest run tests/unit/config.test.ts` — exit 0; 1 file and 2 tests passed; `docker compose run --rm test sh -c "pnpm check && pnpm eslint . && pnpm prettier --check ."` — exit 0; Astro Check 0 errors/0 warnings/0 hints, ESLint passed, and Prettier passed. `strict_tdd=false` is the basis for Standard mode; cached capability record `#1151` and prior apply record `#1173` corroborate the re-detection rather than serving as its only evidence. The scaffold tool scripts are preserved in `package.json` from commit `2c698aa`.
- [x] **1.3** Foundation tokens, font, layout, SEO, placeholders, and sized media. Evidence: commit `75f45db`; verification `#1201`; current regression/Icons0 verification `#1261`.
- [x] **2.1** Accessible responsive navigation and MobileNav behavior. Vacancies navigation is omitted under the approved scope. Evidence: commit `fc8fce9`; verification `#1211`; current regression/Icons0 verification `#1261`.
- [x] **2.2** Static hero, approved reduced-motion media behavior, and safe-area WhatsApp FAB. Evidence: commits `e433688`, `1243fe6`, `20f7999`; verifications `#1216`, `#1252`, `#1261`.
- [x] **3.1** Typed Spanish content, About, and four Solutions cards. Evidence: commit `85cf206`; verification `#1221`; current visual regression verifications `#1252` and `#1261`.
- [x] **3.2** Four-step Empresas process and CSS carousel. Evidence: commit `692a10d`; verification `#1227`.
- [x] **3.3** Three Resources cards and consultation CTA. Evidence: commit `7ddb0c2`; verification `#1241`.
- [x] **4.1** Visual-only/non-operational Contact form with client validation, first-invalid focus, associated labels/errors, live inactive status, preserved values, and authoritative contact context. It defines no transport or backend state. Evidence: current worktree checks in the Work Unit Evidence section.

## Pending Tasks

- [ ] **4.2** Add the broader Contact/Footer integration plus Privacy/Cookies routes, remove the managed Playwright Compose image/service, and perform its later route/build verification. This slice intentionally does not implement it.

## Implementation Notes

- Added `Contact.astro` and `ContactForm.tsx` with the reference form layout and a compact authoritative contact block; the broader contact-information/social layout remains deferred.
- Added pure validation in `src/islands/contact-validation.ts` and focused source/behavior contracts in `tests/unit/contact-form.test.ts`.
- Removed vacancy navigation/config/content and changed the hero primary action to `Hablar con un especialista`, which targets the existing Contact anchor instead of a nonexistent route.
- Updated `BaseLayout` Organization telephone data to use the authoritative formatted company phone.

## Approved Deviations

- The maintainer's current scope overrides legacy endpoint/demo-success wording: the form MUST NOT define/use an endpoint or transport, and it has an explicit inactive status instead of backend states.
- The current approved scope removes Vacantes and its serialized label data entirely; historical mockup/planning references are non-normative only.
- The original design described an optional HeroVideo island. The current committed visual correction keeps the Hero static and places the supplied reduced-motion-aware video behavior in About; no new Hero video path was reintroduced.

## Prior PR1 Evidence Preserved from Engram #1173

| Evidence | Exact result |
|---|---|
| Focused test | `docker compose run --rm test pnpm vitest run tests/unit/config.test.ts` — exit 0; 1 file passed, 2 tests passed. |
| Static quality | `docker compose run --rm test sh -c "pnpm check && pnpm eslint . && pnpm prettier --check ."` — exit 0; Astro Check 0 errors/0 warnings/0 hints; ESLint passed; Prettier passed. |
| Frozen install | `docker compose run --rm test pnpm install --frozen-lockfile` — exit 0; lockfile up to date; pnpm 10.34.5. |
| Build gate | `docker compose build preview` — exit 0; Astro static build completed and nginx production image was created. |
| Runtime harness | `docker compose up -d dev` plus preview/nginx assertions — exit 0; scaffold route, `lang=es`, H1, and skip link were served. |
| Rollback boundary | Revert only the PR1 scaffold, manifest, lockfile, Docker, task/config, and deferred-file changes to return to the design-only state. |

## Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused Contact/config tests | `docker compose run --rm test pnpm exec vitest run tests/unit/contact-form.test.ts tests/unit/config.test.ts` — exit 0; 2 files, 7 tests passed. |
| Full Docker tests | `docker compose run --rm test pnpm vitest run` — exit 0; 9 files, 30 tests passed. |
| Astro Check | `docker compose run --rm test pnpm check` — exit 0; 0 errors, 0 warnings, 2 existing hints in About's inline reduced-motion handler. |
| ESLint | `docker compose run --rm test pnpm eslint .` — exit 0; no lint output. |
| Prettier | `docker compose run --rm test pnpm prettier --check .` — exit 0; all matched files use Prettier code style. |
| Production build | `docker compose build preview` — exit 0; Astro built one static page, emitted `ContactForm` and `MobileNav` client chunks, and created nginx image `teamjobs-landing-preview:latest`. |
| Runtime harness | Fresh isolated nginx preview on port 4322 returned HTTP 200; assertions passed for Spanish language, one H1, `#contacto`, authoritative details, required form fields, inactive honesty copy, no configurable endpoint/transport/vacancy output; `docker exec teamjobs-landing-contact-smoke nginx -t` passed. The smoke container was removed after the check. |
| Production boundary | The nginx smoke served `/usr/share/nginx/html/index.html` from `teamjobs-landing-preview:latest`; `nginx -t` exited 0, and the final image remained static-only. |
| Rollback boundary | Revert `src/config/site.ts` and `tests/unit/config.test.ts` for this correction only; the prior Contact slice remains independently represented by the existing protected paths and can be reverted without task 4.2, Footer/legal, Playwright, deployment, or unrelated section changes. |

## Cleanup Evidence

- The isolated preview container was stopped after runtime assertions.
- The existing `teamjobs-landing-dev-1` container and its Compose network were preserved; no `docker compose down` or volume deletion was run.
- Final cleanup confirmed only the pre-existing `teamjobs-landing-dev-1` container remains in `docker compose ps --all`; no isolated preview container remains.

## Search / Contract Cleanup Evidence

- Exhaustive exact-match repository search across hidden, tracked, untracked, and generated project files (excluding `.git`, `node_modules`, and `.pnpm-store`) returned **0 matches** for the removed Contact configuration key.
- Active configurable-endpoint property search across source, tests, configuration, and active OpenSpec files returned **0 matches**. Remaining endpoint/transport wording is normative prohibition text for the visual-only contract, not an active property or implementation reference.
- No replacement endpoint property was introduced. The Contact implementation remains local-validation-only with idle, invalid, and inactive presentation states.

## Protected Implementation Byte Manifest

- **Algorithm:** SHA-256.
- **Workspace root:** `/home/antoniocebadaa/Developer/teamjobs-landing`.
- **Ordered protected paths:** the following paths are relative to the workspace root and are the complete implementation/source/test set changed by the successful Contact slice.

| Order | Workspace-relative path | SHA-256 |
|---:|---|---|
| 1 | `src/components/Contact.astro` | `18bd3f7ae864c2c0cb72b285ec26f0f5d9b89ceeda40b47f3e5a3aa0ca7de543` |
| 2 | `src/config/site.ts` | `a600ce188c6da81d791c87a6c0729893d614c381bc566bce4a118e5732d53747` |
| 3 | `src/content/site.ts` | `5362626e21e584aedba10f85b91ba5ed3d47b349e242cb109b7c019bd4a70845` |
| 4 | `src/islands/ContactForm.tsx` | `11aebc2a02bf8ec70d200d82bfdc8e51f393237e06dc04aa09fdfdaea686db75` |
| 5 | `src/islands/contact-validation.ts` | `eac8805b7664842ee23ea28b9ad4f05ae6f6bfe2aa98e1f871cf33cc84a8f4eb` |
| 6 | `src/layouts/BaseLayout.astro` | `1bb3df2cf3ac66fde2221739bed2ba144329e091867d05d4554743d1e601b85a` |
| 7 | `src/pages/index.astro` | `09a35ae43cc209653fc8d2dff0991b24c2dd5b3c35365eb6db95bac04987c4db` |
| 8 | `tests/unit/config.test.ts` | `93a1ffc6c36ee50b3fb1bda78cf23bb3a748caeee448fb596dc35fe22323db4b` |
| 9 | `tests/unit/contact-form.test.ts` | `8dcf7c87473cd578c093e904cfdddcb8698ebc045e6083b1b93c0cf1fee87942` |
| 10 | `tests/unit/hero-fab.test.ts` | `e8fa2082041b794d6aa307970c0a11930c1fefcac5ccdba6dafd92de87839d4c` |
| 11 | `tests/unit/navigation.test.ts` | `2656ad48cc6950a09e795619021b49373e56c6bb97dec964334635c3cae8195d` |

- **Aggregate method:** SHA-256 of the UTF-8 bytes of the exact ordered manifest lines `<hash><two spaces><workspace-relative-path>\n`, in the order above, with no header or table formatting included.
- **Aggregate hash before artifact edits:** `sha256:9c8e383ef94456b4b18095803a70c306c32cf7fd185814b9f3d34d890c5ee369`.
- **Aggregate hash after artifact edits:** `sha256:9c8e383ef94456b4b18095803a70c306c32cf7fd185814b9f3d34d890c5ee369`.
- **Before/after byte identity:** MATCH; every per-path hash and the aggregate hash are identical after artifact-only reconciliation.

## Corrective Gate Validation

- Structural readback confirmed that every active normative artifact distinguishes the historical PR1 generated-lockfile exception, the current 800-authored-changed-line `feature-branch-chain` ceiling, the 596-line current candidate, and the absence of a new exception; it also confirms the explicit no-Vacancies, visual-only Contact, task 4.2 pending, and deployment exclusion contracts.
- Formatting check: `docker compose run --rm test pnpm prettier --check openspec/config.yaml openspec/changes/initial-teamjobs-landing/proposal.md openspec/changes/initial-teamjobs-landing/exploration.md openspec/changes/initial-teamjobs-landing/design.md openspec/changes/initial-teamjobs-landing/tasks.md openspec/changes/initial-teamjobs-landing/apply-progress.md openspec/changes/initial-teamjobs-landing/specs/contact-form/spec.md openspec/changes/initial-teamjobs-landing/specs/interactive-islands/spec.md openspec/changes/initial-teamjobs-landing/specs/landing-foundation/spec.md openspec/changes/initial-teamjobs-landing/specs/landing-sections/spec.md openspec/changes/initial-teamjobs-landing/specs/site-navigation/spec.md` — exit 0; all matched files use Prettier code style.
- Structural whitespace check: `git diff --check` — exit 0; no whitespace errors.
- Protected source/test byte identity: all 11 implementation/test paths match the independently recomputable before/after manifest above; manifest revision `protected-implementation-manifest-v3`, aggregate `sha256:9c8e383ef94456b4b18095803a70c306c32cf7fd185814b9f3d34d890c5ee369`.
- Result Contract validation: embedded YAML parsed successfully; `status: success`, `changed_line_count: 596`, `review_budget_lines: 800`, `next_recommended: apply`, `task_4_2: pending`, `final_verify: blocked`, and all 11 manifest paths matched.
- Cleanup/process: formatting and test containers were run with `--rm` and disappeared; the isolated nginx smoke container was removed; `docker compose ps --all` shows only the pre-existing `teamjobs-landing-dev-1`; no Playwright image/package/pull/install, `docker compose down`, volume deletion, deployment execution/configuration, native attempt acquire, settle, or reset was run.
- Diagnosis: exhaustive reconciliation removed the obsolete configurable endpoint property and active endpoint/transport/backend-state contradictions, marked exploration-only Vacancies references non-normative, retained the explicit no-Vacancies contract, excluded deployment execution/configuration, and recomputed the 596-line implementation candidate. Task 4.2 remains pending, so final verification remains blocked. Harness disposition: `fresh-isolated-production-nginx; existing-dev-preserved`.

## Diagnosis

- Docker is available and the existing dev harness remained healthy.
- Compose emitted the known non-blocking warning that the Buildx plugin is unavailable and used the classic builder.
- Astro Check retains two existing hints from the inline reduced-motion handler in `About.astro`; this slice introduced no errors or new warnings.

## Next Steps

Another `apply` phase is required for pending task 4.2; this slice intentionally does not implement the broader Contact/Footer work. Final `sdd-verify` remains blocked until every task is complete.

## Routing / Phase Readiness

- **Next phase**: another `apply` for task 4.2.
- **Task 4.2**: pending; no implementation was added by this correction.
- **Final `sdd-verify`**: blocked until all 10 tasks are complete. This file records slice apply progress, not final verification readiness.

## Result Contract

```yaml
status: success
executive_summary: >-
  Removed the obsolete Contact endpoint configuration and its dependent test
  assertion while preserving the approved visual-only Contact contract. All
  active normative artifacts now agree on the no-Vacancies scope, no Contact
  transport/backend states, deployment exclusion, and the pending task 4.2
  boundary.
summary: >-
  The protected 596-line implementation candidate remains byte-identical and
  within the 800-line authored review budget with 204 lines of headroom and no
  exception. Task 4.2 remains pending, so next_recommended is apply and final
  sdd-verify remains blocked.
artifacts:
  - openspec/config.yaml
  - openspec/changes/initial-teamjobs-landing/proposal.md
  - openspec/changes/initial-teamjobs-landing/exploration.md
  - openspec/changes/initial-teamjobs-landing/specs/contact-form/spec.md
  - openspec/changes/initial-teamjobs-landing/specs/interactive-islands/spec.md
  - openspec/changes/initial-teamjobs-landing/specs/landing-foundation/spec.md
  - openspec/changes/initial-teamjobs-landing/specs/landing-sections/spec.md
  - openspec/changes/initial-teamjobs-landing/specs/site-navigation/spec.md
  - openspec/changes/initial-teamjobs-landing/design.md
  - openspec/changes/initial-teamjobs-landing/tasks.md
  - openspec/changes/initial-teamjobs-landing/apply-progress.md
  - src/components/Contact.astro
  - src/config/site.ts
  - src/content/site.ts
  - src/islands/ContactForm.tsx
  - src/islands/contact-validation.ts
  - src/layouts/BaseLayout.astro
  - src/pages/index.astro
  - tests/unit/config.test.ts
  - tests/unit/contact-form.test.ts
  - tests/unit/hero-fab.test.ts
  - tests/unit/navigation.test.ts
next_recommended: apply
risks:
  - Task 4.2 remains incomplete and requires a later chained apply slice.
  - Final sdd-verify remains blocked until every task is complete.
  - Astro Check retains two pre-existing hints in About's reduced-motion handler.
  - Deployment execution/configuration is excluded; the Cloudflare Tunnel → Dokploy/Traefik → nginx:80 path is future non-executable context only.
  - The managed Playwright Compose image/service remains for task 4.2 removal; no Playwright image/package/pull/install was performed in this correction.
skill_resolution: paths-injected
evidence_revision: protected-implementation-manifest-v3
evidence_hash: "sha256:9c8e383ef94456b4b18095803a70c306c32cf7fd185814b9f3d34d890c5ee369"
evidence_hash_scope: exact ordered 11-path source/test SHA-256 manifest; before/after match
evidence_manifest:
  algorithm: SHA-256
  revision: protected-implementation-manifest-v3
  aggregate: "sha256:9c8e383ef94456b4b18095803a70c306c32cf7fd185814b9f3d34d890c5ee369"
  paths:
    - path: src/components/Contact.astro
      sha256: 18bd3f7ae864c2c0cb72b285ec26f0f5d9b89ceeda40b47f3e5a3aa0ca7de543
    - path: src/config/site.ts
      sha256: a600ce188c6da81d791c87a6c0729893d614c381bc566bce4a118e5732d53747
    - path: src/content/site.ts
      sha256: 5362626e21e584aedba10f85b91ba5ed3d47b349e242cb109b7c019bd4a70845
    - path: src/islands/ContactForm.tsx
      sha256: 11aebc2a02bf8ec70d200d82bfdc8e51f393237e06dc04aa09fdfdaea686db75
    - path: src/islands/contact-validation.ts
      sha256: eac8805b7664842ee23ea28b9ad4f05ae6f6bfe2aa98e1f871cf33cc84a8f4eb
    - path: src/layouts/BaseLayout.astro
      sha256: 1bb3df2cf3ac66fde2221739bed2ba144329e091867d05d4554743d1e601b85a
    - path: src/pages/index.astro
      sha256: 09a35ae43cc209653fc8d2dff0991b24c2dd5b3c35365eb6db95bac04987c4db
    - path: tests/unit/config.test.ts
      sha256: 93a1ffc6c36ee50b3fb1bda78cf23bb3a748caeee448fb596dc35fe22323db4b
    - path: tests/unit/contact-form.test.ts
      sha256: 8dcf7c87473cd578c093e904cfdddcb8698ebc045e6083b1b93c0cf1fee87942
    - path: tests/unit/hero-fab.test.ts
      sha256: e8fa2082041b794d6aa307970c0a11930c1fefcac5ccdba6dafd92de87839d4c
    - path: tests/unit/navigation.test.ts
      sha256: 2656ad48cc6950a09e795619021b49373e56c6bb97dec964334635c3cae8195d
changed_line_count: 596
review_budget_lines: 800
review_budget_accounting: "596/800 authored changed lines; 204 lines headroom; no size exception"
task_4_2: pending
final_verify: blocked
process_evidence: >-
  Native acquire had already returned proceed for this correction. The executor
  called no native lifecycle command. Focused Docker tests passed with
  `docker compose run --rm test pnpm exec vitest run
  tests/unit/contact-form.test.ts tests/unit/config.test.ts` (2 files, 7
  tests), and full Docker tests passed with `docker compose run --rm test pnpm
  vitest run` (9 files, 30 tests). `docker compose run --rm test pnpm check`
  passed with 0 errors, 0 warnings, and 2 existing hints; ESLint and Prettier
  check-only commands exited 0. `docker compose build preview` exited 0. A
  fresh isolated nginx container on port 4322 served HTTP 200, passed Contact
  and no-transport/no-Vacancies assertions, and passed `nginx -t`; the smoke
  container was removed. Exact-match and active configurable-endpoint scans
  returned 0 matches. The 11 protected hashes and aggregate were recomputed,
  and `git diff --check` passed.
cleanup_evidence: >-
  Check-only Docker containers use --rm and are removed; the fresh isolated
  nginx smoke container was removed after assertions; the pre-existing
  teamjobs-landing-dev-1 container remains preserved. No Playwright
  image/package/pull/install, compose down, volume deletion, task 4.2 work,
  deployment execution/configuration, or native acquire/settle/reset ran.
diagnosis: >-
  Reconciled the obsolete configurable endpoint property and every dependent
  test/artifact reference while preserving the visual-only no-transport
  contract, no-Vacancies scope, deployment exclusion, and pending task 4.2.
  The first smoke assertion targeted the post-activation status instead of the
  initial inactive note; the corrected rerun passed, so this was a harness
  assertion correction rather than an implementation failure. The 596-line
  candidate and manifest v3 are self-consistent; final verification remains
  blocked by task 4.2.
harness_disposition: fresh-isolated-production-nginx; existing-dev-preserved
```
