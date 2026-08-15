# Tasks: Auth, RBAC, Blog Authoring

## Review Workload Forecast

Estimated changed lines: ~1,900–2,300 authored, exceeding configured 800-line approval budget. Chained PRs objectively recommended; maintainer explicitly approved one PR via `size:exception`, delivery_strategy: exception-ok. Five work units execute sequentially inside the one approved PR.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

`vitest <f>` = `docker compose run --rm test pnpm vitest run <f>`.

### Suggested Work Units

- Unit 1→PR 1: DB schema, grants, RLS, guards, RPC + pgTAP. Test: `supabase test db`. Harness: `supabase start`, pgTAP local DB. Rollback: revert `supabase/migrations/*`, `supabase/tests/auth_rbac_blog.sql`.
- Unit 2→PR 2: typed client + sanitize helpers. Test: `vitest tests/unit/supabase-client.test.ts tests/unit/markdown.test.ts`. Harness: N/A (logic-only; runtime in 3–4). Rollback: remove `src/lib/supabase/`, `src/lib/blog/`, env/dep edits.
- Unit 3→PR 3: auth/editor/admin islands + pages. Test: `vitest tests/unit/auth-panel.test.ts tests/unit/editor-admin.test.ts`. Harness: Docker `pnpm test:browser` signup→role vs local Supabase. Rollback: remove islands, `src/pages/editor/`, `src/pages/admin/`.
- Unit 4→PR 4: public blog shell + nginx slug routing. Test: `vitest tests/unit/blog-route.test.ts`. Harness: `pnpm test:browser` arbitrary slug, non-public→not-found, preview nginx. Rollback: restore static `blog.astro`/`BlogPage.astro`, revert `nginx.conf`.
- Unit 5→PR 5: legal copy, docs, rollout evidence. Test: `vitest tests/unit/footer-legal-compose.test.ts`. Harness: `docker compose build preview`; read `/privacidad`, `/cookies`. Rollback: revert legal pages + docs.

## Phase 1: Database Foundation

- [x] 1.1 `supabase/migrations/*`: role/post_status enums, `profiles`, `posts`, FKs, checks, unique slug, indexes
- [x] 1.2 Minimal grants + RLS both tables: `TO authenticated`, `(select auth.uid())`, `USING`+`WITH CHECK`; role/suspension helpers
- [x] 1.3 Hardened triggers: SECURITY DEFINER auth.users provisioning (empty search_path, ON CONFLICT DO NOTHING)→reader; last-active-admin, status/ownership guards
- [x] 1.4 No-arg hardened `published_posts()` RPC returning only PublicPost fields
- [x] 1.5 pgTAP `supabase/tests/auth_rbac_blog.sql`: anon published-only, reader denied, editor own-draft, suspended denied, admin transitions, last-admin guard, no-email RPC; `supabase test db`+advisors green

## Phase 2: Client/Env Foundation

- [x] 2.1 Pin `@supabase/supabase-js` + markdown parser/sanitizer; `PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.example`, `src/env.d.ts`, Docker args; lockfile via Docker
- [x] 2.2 `src/lib/supabase/client.ts`: typed singleton browser client, local-storage session
- [x] 2.3 `src/lib/blog/*`: RPC helpers + parse-then-allow-list sanitize before `dangerouslySetInnerHTML`
- [x] 2.4 RED→GREEN `tests/unit/supabase-client.test.ts` (missing-env rejection) + `tests/unit/markdown.test.ts` (script/event/unsafe-URL stripped)

## Phase 3: Auth and Editorial UI

- [x] 3.1 `src/islands/AuthPanel.tsx`: signup/login, immediate local session, reader-only; RED→GREEN `tests/unit/auth-panel.test.ts`
- [x] 3.2 `src/islands/EditorApp.tsx`: own-draft CRUD, no publish controls
- [x] 3.3 `src/islands/AdminApp.tsx`: users/roles/suspension, all posts, publish/archive; RED→GREEN `tests/unit/editor-admin.test.ts`
- [x] 3.4 `src/pages/editor/*`, `src/pages/admin/*` mount islands; update `src/content/site.ts`
- [x] 3.5 Browser (`tests/browser/*`, `pnpm test:browser`): signup→reader, editor publish denied, admin screens vs local Supabase

## Phase 4: Public Blog and Routing

- [x] 4.1 `src/islands/BlogApp.tsx` reads `location.pathname`; unknown/draft/archived→shared not-found; RED→GREEN `tests/unit/blog-route.test.ts`
- [x] 4.2 Rework `src/pages/blog.astro` + `src/components/BlogPage.astro` into shell; drop static cards
- [x] 4.3 `nginx.conf`: `location ~ ^/blog/[^/]+/?$ { try_files $uri /blog/index.html; }`; assets unchanged
- [x] 4.4 Browser: `/blog` empty/list, arbitrary slug via preview nginx, markup no-execute, no emails

## Phase 5: Legal, Docs, Rollout

- [x] 5.1 Update `src/pages/privacidad.astro`, `src/pages/cookies.astro`: truthful account/session copy; no unsupported-feature claims; legal approval gate
- [x] 5.2 Extend `tests/unit/footer-legal-compose.test.ts`: new disclosures
- [x] 5.3 `docs/`: migrate→pgTAP→UI order, out-of-band first-admin bootstrap + evidence, build-time-only PUBLIC_* values
