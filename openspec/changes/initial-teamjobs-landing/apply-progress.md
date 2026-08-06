# Apply Progress: Initial TeamJobs Landing

## Status

- **Change**: `initial-teamjobs-landing`
- **Mode**: Standard (`strict_tdd: false`)
- **Artifact store**: OpenSpec for this apply slice; prior Engram progress is preserved below
- **Delivery**: auto-chain / feature-branch-chain
- **Current work unit**: `complete Contact/Footer, legal routes, and Compose cleanup`
- **Boundary**: complete task 4.2 on top of the reconciled foundation, section, and visual-only Contact slices
- **Progress**: 10/10 tasks complete
- **Current review budget**: `review_budget_lines: 800`, or 800 authored changed lines per remaining chained slice, approved by the current SDD Session Preflight.
- **Changed-line accounting**: final task 4.2 accounting is recorded in the Final Slice Evidence Manifest below; it includes every tracked addition/deletion and every untracked source, route, test, and OpenSpec artifact in this slice, against the approved 800-line ceiling.
- **Accounting method**: `git diff --numstat` for tracked paths plus `wc -l` for every untracked path; no OpenSpec, documentation, source, route, test, or Compose deletion line is omitted.
- **Size-exception status**: No new `size:exception` applies to task 4.2. The generated-lockfile exception belongs only to historical PR1 under the original 400-total-line planning baseline and is preserved as historical evidence.
- **Native authority**: the orchestrator acquired `proceed` for this work unit. The executor did not call native attempt acquire, settle, or reset operations.
- **Previous progress source**: Engram observation `#1173`, topic `sdd/initial-teamjobs-landing/apply-progress`; its PR1 evidence is preserved below.
- **Historical first-apply evidence (non-active accounting)**: The first native apply result recorded a 698-line candidate. This value is retained for audit history only; the final task 4.2 candidate is independently measured below with no exception.

## Approved Scope Guard

- Vacancies are entirely out of scope. The current change MUST NOT define a vacancy section, route, navigation action, CTA, URL, config key, or requirement.
- Contact details use the authoritative reference values: address, email, phone, WhatsApp, and hours.
- The Contact form MUST be visual-only/non-operational. It may render fields and client-side validation, but MUST NOT define/use an endpoint or configurable endpoint, POST, fetch, request, network transport, pending backend state, backend success, backend failure, retry behavior, or any claim that data was sent.
- Footer, Privacy/Cookies routes, and removal of the managed Playwright Compose image/service are complete in task 4.2; the maintainer-managed Playwright setup remains outside this change. Deployment execution/configuration is entirely out of scope.
- Astro, Preact, Tailwind, Docker-only tooling, and the existing Icons0-sourced icon registry remain in use. New Footer/legal icons use the validated Icons0 Lucide identities; unresolved social/login actions are omitted.

## Completed Tasks

- [x] **1.1** PR1 scaffold and Docker/Astro foundation. Evidence: prior apply-progress observation `#1173`; focused config test, static quality, frozen install, static build, and dev/nginx smoke all passed.
- [x] **1.2** Testing capability detection with `strict_tdd: false`. Concrete evidence: `openspec/config.yaml` lines 16–34 (introduced at commit `331792e`) records root `strict_tdd: false`, `testing.strict_tdd: false`, detection `2026-07-29`, runner `docker compose run --rm test pnpm vitest run`, Vitest `4.1.10`, unit/integration availability, the historical deferred browser capability, and Docker quality commands. The final task 4.2 removes the managed browser setup; no browser image/package/pull/install is part of this change. Preserved exact proof: `docker compose run --rm test pnpm vitest run tests/unit/config.test.ts` — exit 0; 1 file and 2 tests passed; `docker compose run --rm test sh -c "pnpm check && pnpm eslint . && pnpm prettier --check ."` — exit 0; Astro Check 0 errors/0 warnings/0 hints, ESLint passed, and Prettier passed. `strict_tdd=false` is the basis for Standard mode; cached capability record `#1151` and prior apply record `#1173` corroborate the re-detection rather than serving as its only evidence. The scaffold tool scripts are preserved in `package.json` from commit `2c698aa`.
- [x] **1.3** Foundation tokens, font, layout, SEO, placeholders, and sized media. Evidence: commit `75f45db`; verification `#1201`; current regression/Icons0 verification `#1261`.
- [x] **2.1** Accessible responsive navigation and MobileNav behavior. Vacancies navigation is omitted under the approved scope. Evidence: commit `fc8fce9`; verification `#1211`; current regression/Icons0 verification `#1261`.
- [x] **2.2** Static hero, approved reduced-motion media behavior, and safe-area WhatsApp FAB. Evidence: commits `e433688`, `1243fe6`, `20f7999`; verifications `#1216`, `#1252`, `#1261`.
- [x] **3.1** Typed Spanish content, About, and four Solutions cards. Evidence: commit `85cf206`; verification `#1221`; current visual regression verifications `#1252` and `#1261`.
- [x] **3.2** Four-step Empresas process and CSS carousel. Evidence: commit `692a10d`; verification `#1227`.
- [x] **3.3** Three Resources cards and consultation CTA. Evidence: commit `7ddb0c2`; verification `#1241`.
- [x] **4.1** Visual-only/non-operational Contact form with client validation, first-invalid focus, associated labels/errors, live inactive status, preserved values, and authoritative contact context. It defines no transport or backend state. Evidence: current worktree checks in the Work Unit Evidence section.

## Pending Tasks

- [x] **4.2** Added the broader Contact/Footer integration plus Privacy/Cookies routes, removed the managed Playwright Compose image/service, and completed route/build verification. Contact remains visual-only/non-operational.

## Implementation Notes

- Added `Contact.astro` and `ContactForm.tsx` with the reference form layout and a compact authoritative contact block; the broader contact-information/social layout remains deferred.
- Added pure validation in `src/islands/contact-validation.ts` and focused source/behavior contracts in `tests/unit/contact-form.test.ts`.
- Removed vacancy navigation/config/content and changed the hero primary action to `Hablar con un especialista`, which targets the existing Contact anchor instead of a nonexistent route.
- Updated `BaseLayout` Organization telephone data to use the authoritative formatted company phone.
- Added responsive `Footer.astro` with real TeamJobs contact data, current in-page navigation, verified WhatsApp action, local legal links, and the 2026 legal row.
- Added static `privacidad` and `cookies` routes with a shared Spanish legal document shell; cookie copy describes only the technologies actually used by this static site.
- Removed the managed Playwright `e2e` Compose profile without adding a package, image, installation, or replacement container.

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
| Rollback boundary | Revert only task 4.2 paths listed in the Final Slice Evidence Manifest; the prior Contact slice remains independently represented by the protected paths and can be reverted without Footer/legal, Compose, deployment, or unrelated section changes. |
| Focused Footer/legal/Compose contracts | `docker compose run --rm test pnpm exec vitest run tests/unit/footer-legal-compose.test.ts` — exit 0; 1 file, 5 tests passed. |
| Full Docker suite | `docker compose run --rm test pnpm vitest run` — exit 0; 10 files, 35 tests passed. |
| Final static quality | `docker compose run --rm test pnpm check` — exit 0; 0 errors, 0 warnings, 2 existing hints in About's inline reduced-motion handler; ESLint and Prettier check-only commands exited 0. |
| Final production build | `docker compose build preview` — exit 0; Astro built `/`, `/privacidad`, and `/cookies`, emitted only the approved `MobileNav` and `ContactForm` client chunks, and created `teamjobs-landing-preview:latest`. |
| Final nginx harness | Fresh isolated preview: `/` 200; `/privacidad` and `/cookies` 301 to slash-normalized static routes, whose direct slash URLs returned 200; unknown route 200 through the configured `/index.html` fallback; missing `/_astro/*` asset 404; `nginx -t` exit 0. |
| Responsive/accessibility contracts | Static focused contracts passed for 320px-safe `min-w-0` layout, semantic headings/landmarks, local legal home links, no Vacantes, no endpoint/network form, and no dead `#` Footer actions; browser/axe was intentionally not run because managed Playwright is removed and maintainer-managed setup is outside this change. |
| Compose removal contract | `docker compose config --services` exposes only `dev`, `build`, `preview`, and `test`; no Playwright image, profile, service, package, pull, install, or deferred e2e container remains. |

## Cleanup Evidence

- The isolated preview container was stopped after runtime assertions.
- The existing `teamjobs-landing-dev-1` container and its Compose network were preserved; no `docker compose down` or volume deletion was run.
- Final cleanup confirmed only the pre-existing `teamjobs-landing-dev-1` container remains in `docker compose ps --all`; no isolated preview container remains.

## Search / Contract Cleanup Evidence

- Exhaustive exact-match repository search across hidden, tracked, untracked, and generated project files (excluding `.git`, `node_modules`, and `.pnpm-store`) returned **0 matches** for the removed Contact configuration key.
- Active configurable-endpoint property search across source, tests, configuration, and active OpenSpec files returned **0 matches**. Remaining endpoint/transport wording is normative prohibition text for the visual-only contract, not an active property or implementation reference.
- No replacement endpoint property was introduced. The Contact implementation remains local-validation-only with idle, invalid, and inactive presentation states.
- Source/config scan returned 0 active `Vacantes`/`vacantes`, `href="#"`, login/social placeholder, Playwright Compose, or managed e2e service matches; historical OpenSpec wording remains explicitly non-normative where preserved.
- Footer contact values match the authoritative TeamJobs reference: `teamjobsmexico@gmail.com`, `+52 1 56 1027 5879`, and `Av. Río Churubusco 601, Xoco, Benito Juárez, 03330 Ciudad de México, CDMX`.

## Final Slice Evidence Manifest

- **Accounting scope:** all 24 paths changed by task 4.2 from the clean `8f8e955` Contact baseline, including OpenSpec/docs, source, routes, tests, and the Compose deletion. Final file line counts are shown; authored review accounting is the tracked `additions + deletions` plus all untracked file lines.
- **Hash scope:** SHA-256 of the ordered 23 non-carrier paths listed below; `apply-progress.md` is the mutable evidence carrier and is counted but excluded from its own aggregate to avoid a self-referential hash.
| Path | Final lines | SHA-256 |
|---|---:|---|
| `docker-compose.yml` (Compose deletion) | 46 | `490b78c6730c21d50e4ba33848e5d51f6cf2a0d38273eacd729ff44b9c27fc10` |
| `openspec/config.yaml` | 70 | `ab5b215dafc016116def82c893eeda119f1e8580e8d323a8531fdfbd51c7f823` |
| `openspec/changes/initial-teamjobs-landing/design.md` | 180 | `e586bbb5b82d327db984bbf8b3c0dac13adad8e6803f66ee65ab682eba5a7432` |
| `openspec/changes/initial-teamjobs-landing/proposal.md` | 77 | `805e26084aded1379140d3e668871e073d1fb08d434bcc661fb82c538e431445` |
| `openspec/changes/initial-teamjobs-landing/tasks.md` | 60 | `3288c2af6058934b347821335251c52ed3d11554c0fb2e35d0b14c71512cc193` |
| `openspec/changes/initial-teamjobs-landing/specs/site-navigation/spec.md` | 75 | `b4b1ef867ce08dc39872ef386c80045f98b82ad9ea1621f2f12a5c38941b7174` |
| `openspec/changes/initial-teamjobs-landing/apply-progress.md` (carrier) | 292 | `carrier-self-reference` |
| `src/components/Footer.astro` | 151 | `7302fe0fcdbc01b7ef00efd1ef54fb34c28e13f91b922afc52e3cdba526f5783` |
| `src/components/Icon.astro` | 74 | `ed58197da35db67555fce48eac61e44be9c275b15cb3f0253b75c4ef8537f0b0` |
| `src/components/LegalPage.astro` | 36 | `585b8257b92c3c06e45955da0bd40b9f3e38e49ca2488afc046fe1aa3eaaff8a` |
| `src/components/Navbar.astro` | 44 | `8f1794262c191875c560acc5e2fe610b8a6f584eb23f04879b77cd4b21dd426c` |
| `src/config/site.ts` | 22 | `7d1d31443c7c25ef8df0d1be032f78c4c03eaeeeb843363a63a4007b986f963b` |
| `src/content/site.ts` | 265 | `f098c1e726b6bffab60a9960ef6e61e05bfce96be6751a3f525fa457c0276306` |
| `src/islands/MobileNav.tsx` | 135 | `e9f0b0cea07ef2ac92b9fbcdd1317bf9b53f1dae0a164e6b59cf0d64806c8879` |
| `src/layouts/BaseLayout.astro` | 77 | `af83ff3907b689bfb42f8b2e3730af4a07b2339f5bdee7a93b7836edc693013e` |
| `src/pages/cookies.astro` | 59 | `5e654a3810b51a24f4c3451bcd421e2f0002c38e345b93933b29aaf94ba093cb` |
| `src/pages/index.astro` | 24 | `577652315457b1971953b2240f184254ad2df888bd9c69021d6883da8b357c10` |
| `src/pages/privacidad.astro` | 72 | `296f5d4761a9ee54b23d4a33954e664a41446dbec702edefcff8852f9bdb27d8` |
| `tests/unit/config.test.ts` | 22 | `8c41b755f0538fb908cb957d7b832a0f4774e279e94f302ccc095361bd808ad8` |
| `tests/unit/empresas.test.ts` | 68 | `55edcbaf7ca3120f35942f73804f7480e26b425c550960bb36824b2e401ca714` |
| `tests/unit/footer-legal-compose.test.ts` | 80 | `1cbd4a20976f47d4d63abd75ebc4523433c348ca3ff71b6fdb0be09770b4c3c6` |
| `tests/unit/icon-provenance.test.ts` | 52 | `d84fec027f9914693cef5b2a93b93f8051f2e0e25d5a903f901b9e61ead69052` |
| `tests/unit/navigation.test.ts` | 60 | `9cbe4864b047550ba4f75465857942e5aa3938d1d4e853b489cdbbc4b2901559` |
| `tests/unit/resources.test.ts` | 94 | `de7f798f4065f82fbf6df9044f4c80aeffc4d4b00fb1fdc1d89075e1354ea2c6` |

## Prior Contact Slice Byte Manifest (Preserved)

- **Algorithm:** SHA-256.
- **Workspace root:** `/home/antoniocebadaa/Developer/teamjobs-landing`.
- **Ordered protected paths:** the following paths are relative to the workspace root and are the complete implementation/source/test set changed by the successful Contact slice before task 4.2.

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
- **Historical byte identity:** MATCH for the prior Contact slice before task 4.2; current task 4.2 bytes are measured in the Final Slice Evidence Manifest above.

## Corrective Gate Validation

- Structural readback confirmed that every active normative artifact distinguishes the historical PR1 generated-lockfile exception, the current 800-authored-changed-line `feature-branch-chain` ceiling, the final task 4.2 candidate, and the absence of a new exception; it also confirms the explicit no-Vacancies, visual-only Contact, completed Footer/legal scope, and deployment exclusion contracts.
- Formatting check: `docker compose run --rm test pnpm prettier --check openspec/config.yaml openspec/changes/initial-teamjobs-landing/proposal.md openspec/changes/initial-teamjobs-landing/exploration.md openspec/changes/initial-teamjobs-landing/design.md openspec/changes/initial-teamjobs-landing/tasks.md openspec/changes/initial-teamjobs-landing/apply-progress.md openspec/changes/initial-teamjobs-landing/specs/contact-form/spec.md openspec/changes/initial-teamjobs-landing/specs/interactive-islands/spec.md openspec/changes/initial-teamjobs-landing/specs/landing-foundation/spec.md openspec/changes/initial-teamjobs-landing/specs/landing-sections/spec.md openspec/changes/initial-teamjobs-landing/specs/site-navigation/spec.md` — exit 0; all matched files use Prettier code style.
- Structural whitespace check: `git diff --check` — exit 0; no whitespace errors.
- Final source/test byte identity: all task 4.2 paths are listed in the complete manifest above; the prior 11-path Contact manifest remains preserved as historical evidence.
- Result Contract validation: embedded YAML is internally consistent; `status: success`, all 10 tasks complete, final authored accounting is within `review_budget_lines: 800`, `next_recommended: sdd-verify`, and `dispatcher_ready: true`.
- Cleanup/process: all check-only Docker containers used `--rm`; the isolated nginx smoke container was removed; `docker compose ps --all` shows only the pre-existing `teamjobs-landing-dev-1`; no Playwright image/package/pull/install, `docker compose down`, volume deletion, deployment execution/configuration, native attempt acquire, settle, or reset was run.
- Diagnosis: task 4.2 completes the responsive Footer, local legal routes, final page order, verified-destination policy, and managed Playwright Compose removal while preserving the visual-only Contact contract and no-Vacancies scope. Harness disposition: `fresh-isolated-production-nginx; existing-dev-preserved`.

## Diagnosis

- Docker is available and the existing dev harness remained healthy.
- Compose emitted the known non-blocking warning that the Buildx plugin is unavailable and used the classic builder.
- Astro Check retains two existing hints from the inline reduced-motion handler in `About.astro`; this slice introduced no errors or new warnings.

## Next Steps

Run `sdd-verify` next; all 10 implementation tasks are complete and the final candidate is dispatcher-ready. No deployment execution/configuration is included.

## Routing / Phase Readiness

- **Next phase**: `sdd-verify`.
- **Task 4.2**: complete; implementation and evidence are recorded above.
- **Final `sdd-verify`**: dispatcher-ready after the complete task set and current evidence checks.

## Result Contract

```yaml
status: success
executive_summary: >-
  Completed task 4.2 with a responsive Footer, local Privacy/Cookies routes,
  final landing order, verified external-destination policy, and removal of
  the managed Playwright Compose service while preserving visual-only Contact.
summary: >-
  The final task 4.2 candidate is independently accounted below within the
  800-line authored review budget with no new exception. All 10 tasks are
  complete and the dispatcher is ready for sdd-verify.
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
next_recommended: sdd-verify
dispatcher_ready: true
risks:
  - Astro Check retains two pre-existing hints in About's reduced-motion handler.
  - Deployment execution/configuration is excluded; the Cloudflare Tunnel → Dokploy/Traefik → nginx:80 path is future non-executable context only.
  - `/privacidad` and `/cookies` normalize to slash-terminated static directories through the existing nginx behavior.
skill_resolution: paths-injected
evidence_revision: final-task-4.2-manifest-v1
evidence_hash: "sha256:89987d6527e5b16f3c8279ce630d850dfbc7f0094b525bea0b750b6cabaafb82"
evidence_hash_scope: exact ordered 23-path non-carrier SHA-256 manifest; apply-progress is counted and excluded as the mutable carrier
final_artifacts_manifest: openspec/changes/initial-teamjobs-landing/apply-progress.md#final-slice-evidence-manifest
prior_evidence_manifest:
  algorithm: SHA-256
  revision: prior-contact-slice-manifest-v3-preserved
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
changed_line_count: 782
review_budget_lines: 800
review_budget_accounting: "782/800 authored changed lines; 18 lines headroom; no size exception"
task_4_2: complete
final_verify: dispatcher-ready
final_evidence_manifest:
  algorithm: SHA-256
  revision: final-task-4.2-manifest-v1
  aggregate: "sha256:89987d6527e5b16f3c8279ce630d850dfbc7f0094b525bea0b750b6cabaafb82"
  non_carrier_paths: 23
  carrier: openspec/changes/initial-teamjobs-landing/apply-progress.md
process_evidence: >-
  Native acquire had already returned proceed; the executor called no native
  lifecycle command. Focused Footer/legal/Compose tests passed (1 file, 5
  tests), the full Docker suite passed (10 files, 35 tests), Astro Check,
  ESLint, Prettier, production build, and the isolated nginx route/fallback
  harness all passed. The complete 24-path manifest and final accounting are
  recorded above; `git diff --check` passed.
cleanup_evidence: >-
  Check-only Docker containers used --rm and were removed; the fresh isolated
  nginx smoke container was removed after assertions; the pre-existing
  teamjobs-landing-dev-1 container and Compose network remain preserved. No
  Playwright image/package/pull/install, compose down, volume deletion,
  deployment execution/configuration, or native attempt lifecycle ran.
diagnosis: >-
  Completed Footer/legal integration and Compose cleanup without changing the
  visual-only Contact transport boundary. The first route harness observed the
  existing nginx directory normalization (301 before the slash URL); the
  corrected final harness passed both legal pages, the configured fallback, static asset
  404, and `nginx -t`. No implementation failure was found.
harness_disposition: fresh-isolated-production-nginx; existing-dev-preserved
```
