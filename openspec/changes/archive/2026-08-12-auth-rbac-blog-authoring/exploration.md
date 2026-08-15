# Exploration: Supabase Auth + RBAC Blog Authoring

Scope: email/password auth, application roles (`reader`/`editor`/`admin`), RLS-enforced authorization, an editorial area rooted at `/editor` (including `/editor/posts/new`), with `/blog/*` remaining public. Facts below are from repository evidence (commit `8fe7e25`, worktree clean); recommendations are marked explicitly. OpenSpec artifact store; no application code modified.

## Current State

- **Static-only Astro 5.18.2**: `astro.config.mjs` sets `output: 'static'`; prod image is `nginx:1.29.1-alpine` serving `dist/`. `nginx.conf` already uses `try_files $uri $uri/ /index.html`, so deep links like `/editor/posts/new` fall back to the SPA-style shell with zero nginx changes.
- **Blog is static content**: `/blog` renders `siteContent.blog` from `src/content/site.ts` (9 posts, categories, sidebar). Cards are honest CSS placeholders; `docs/phases/blog-ui.md` explicitly records non-goals: "No backend, database, CMS, publishing workflow, or post detail route."
- **Supabase presence is scaffolding only**: `supabase/config.toml` exists, `supabase@2.111.0` is a pinned devDependency, and the hosted project is linked (`supabase/.temp/linked-project.json` ref `tmpftblhrcksoijgyqjb`, region `us-east-1`, PG 17.6.1.155). README documents: no `@supabase/supabase-js`, no `@supabase/ssr`, no app code reads Supabase credentials; `supabase/.temp/` is ignored per-developer metadata; `supabase start` is an optional separate local stack with its own ports (API 54321, DB 54322, Studio 54323).
- **No migrations exist** (`supabase/migrations/` absent), `config.toml` has `schema_paths = []` (imperative migrations) and `auto_expose_new_tables` unset (new tables are NOT auto-exposed to the Data API — explicit `GRANT`s will be required). `auth.enable_signup = true`, `auth.email.enable_confirmations = false`, `jwt_expiry = 3600`, no SMTP configured, no captcha.
- **Auth redirect config mismatches the project**: `auth.site_url = "http://127.0.0.1:3000"` and `additional_redirect_urls = ["https://127.0.0.1:3000"]`, but Astro dev runs on `4321` and the Docker preview maps host `4321`. Local auth redirect flows will break until this is updated.
- **Legal copy contradicts the feature**: `src/pages/privacidad.astro` states the site "no es un portal de registro, autenticación, postulación ni gestión de expedientes" and that no identification data is collected. Adding accounts invalidates this copy as written.
- **Constraints in force** (`openspec/config.yaml`): pnpm-only, Docker-only runtime/dev/prod, `strict_tdd: false`, verify via `pnpm check && pnpm eslint . && pnpm prettier --check .` inside Docker, deployment execution/configuration excluded, 800-authored-line PR budget, delivery strategy `ask-on-risk`.

## Affected Areas

- `supabase/migrations/*` (new) — `profiles`, `posts`, RLS policies, grants, indexes; first migrations in the repo.
- `supabase/tests/*.sql` (new, pgTAP) — RLS policy tests run via `supabase db test`.
- `supabase/config.toml` — auth `site_url`/`additional_redirect_urls` for the 4321 dev stack; decision on `enable_signup`; optional `auto_expose_new_tables`.
- `package.json` — add `@supabase/supabase-js` (and `@supabase/ssr` only if cookies are chosen); lockfile update.
- `astro.config.mjs` — unchanged if static client approach is accepted (no adapter).
- `.env.example` (new) — `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (public-able; never `service_role`).
- `docker-compose.yml` — `build`/`preview` need `PUBLIC_*` build args; no runtime env in the nginx image.
- `src/lib/supabase/*` (new) — client factory, typed auth helpers, role guard helper.
- `src/islands/*` (new/edited) — login/logout, editor posts list, `/editor/posts/new` form (Preact, following the existing `ContactForm.tsx` island pattern).
- `src/pages/editor/*` (new) — static routes at `/editor` and `/editor/posts/new` composing the islands.
- `src/components/`, `src/layouts/` — optional nav link to `/editor`; keep `BaseLayout` unchanged.
- `src/pages/privacidad.astro` (and possibly `cookies.astro`) — must be rewritten to cover account data (legal text approval is a maintainer dependency).
- `README.md` — document auth/env setup and the Supabase local stack interplay.
- `tests/unit/*` — extend the existing source-contract test pattern for auth/env wiring.

## Evaluation

### 1. Static client vs SSR

Facts:
- Astro static mode has no server runtime; on-demand rendering requires an adapter (e.g. `@astrojs/node`) and a Node server in the prod image, replacing the nginx-only `Dockerfile` prod stage.
- `@supabase/supabase-js` works fully client-side in a static site; `@supabase/ssr` is designed for server-driven cookie flows but its `createBrowserClient` also works in a static app without a server.
- Requirement says authorization must be "database-enforced … with PostgreSQL RLS; never rely on hidden UI" — this is exactly the client-side + RLS model: the `anon` key is public, but RLS decides every row.

Options:
1. **Static + browser Supabase client (recommended)** — nginx and SSG stay untouched; `/editor` pages are static shells with Preact islands; RLS is the only enforcement point.
   - Pros: zero architecture change; Docker/preview pipeline untouched; smallest slice; security model matches the requirement (RLS is authoritative).
   - Cons: no server-side session check (guard is UX only — acceptable because RLS enforces); editor content renders client-side (no SEO need in the editorial area); JWT claim freshness applies only if roles come from JWT (avoided by DB-backed roles below).
   - Effort: Low.
2. **Hybrid SSR** — keep the marketing site static, add `@astrojs/node` and an SSR entry only for `/editor/*` (and optionally client-rendered `/blog`).
   - Pros: server-side session validation, HttpOnly cookies, can pre-render/fetch on the server, future-proof for dynamic blog detail pages.
   - Cons: breaks the Docker prod contract (nginx → Node), new adapter + Dockerfile stage, env handling and secrets in the image, meaningfully larger first slice; not needed for "RLS is the gate" security.
   - Effort: High.
3. **Full SSR** — entire site on-demand.
   - Pros: one runtime.
   - Cons: discards the current fast static marketing posture entirely; largest change; not justified by the feature intent.
   - Effort: High.

Recommendation: **Static + browser client (option 1) for the first slice.** No concrete blocker to the stated "retain current static Astro/nginx architecture" preference was found; the constraint surfaces later as blog-content freshness (see Publication lifecycle).

### 2. Auth/session flow

Facts:
- Email/password primitives (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`) are supported by `@supabase/supabase-js` v2; local dev has email confirmations disabled and no SMTP, so production email flows (confirmation/reset) must be configured later by the maintainer.
- `enable_signup = true` today; the `reader` role consumes only public published posts, which require no account, so public signup is not needed for the product model.

Recommendation:
- Session persistence: default browser persistence for the first slice; document the XSS-readability caveat (tokens in localStorage). Cookie persistence via `@supabase/ssr` `createBrowserClient` is a viable low-effort alternative if the maintainer prefers cookies; decide in design. HttpOnly cookies are NOT achievable without a server.
- Route guarding in `/editor`: client-side redirect when no session, and every query subject to RLS — the guard is navigation UX, never an authorization boundary.
- Keep `jwt_expiry = 3600`; enforce sign-out that clears the local session (deleting a Supabase user does not invalidate existing tokens).
- Recommended product defaults: `enable_signup = false`; accounts created by the maintainer (admin API/SQL), default role `reader`; password reset via Supabase email flow once SMTP is configured.

### 3. Role storage and assignment authority

Options:
1. **Public `profiles` table with `role` column (recommended)** — `profiles(id uuid pk references auth.users on delete cascade, role text not null default 'reader' check (role in ('reader','editor','admin')), created_at, updated_at)`.
   - Role checks in policies read the DB row, so role changes take effect immediately with no token refresh — avoids the skill-flagged trap of authorizing from user-editable/possibly-stale JWT claims.
   - Assignment authority: only `admin` can update `profiles.role` (UPDATE policy `USING is_admin() WITH CHECK is_admin()`). Admin self-check via a `security definer` helper `is_admin()` (see Risks) or by reading `profiles` in a non-exposed helper schema; the Supabase skill warns `SECURITY DEFINER` in `public` is callable by all roles — keep the helper in a separate schema and guard with `auth.uid()`.
   - Bootstrap: first admin assigned via a migration/seed executed by the maintainer (no application self-promotion path).
2. **Role in `auth.users.raw_app_meta_data`** — admins write via elevated SQL/admin API; policies check `auth.jwt() -> 'app_metadata'`.
   - Pros: no extra table.
   - Cons: JWT staleness until refresh; writing it requires elevated credentials from the client; the Supabase skill explicitly warns `raw_user_meta_data` is user-editable (only `app_metadata` is safe, but still stale).

Recommendation: **`profiles` table (option 1)**. Assignment authority is admin-only, enforced by RLS; bootstrap via maintainer SQL.

### 4. Posts schema and publication lifecycle

Recommended schema (first slice, no storage/images):
- `posts(id uuid pk default gen_random_uuid(), author_id uuid not null references auth.users, title text not null check (length(title) between 1 and 200), slug text not null unique, body text not null default '', status text not null default 'draft' check (status in ('draft','published','archived')), published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now())`.
- Indexes: `posts(author_id)`, `posts(status, published_at desc)` for the future public list.

Lifecycle and RLS:
- SELECT: `published` visible to `anon` (public blog); `draft`/`archived` visible to author or admin.
- INSERT: `authenticated` with role `editor` or `admin`; default status `draft`.
- UPDATE: author edits own posts while `draft` (WITH CHECK keeps `status = 'draft'`); `admin` may update any post and transition status (publish/archive). Cross-row transitions are expressed as policy combinations: an editor's WITH CHECK cannot produce `published` or reassign `author_id`; a trigger/RPC is only needed if admin publishing must also set `published_at` atomically (single UPDATE by admin can set both fields — no trigger required).
- DELETE: admin only (soft-delete via `archived` preferred).
- Slug generation: app-side (client) with a uniqueness retry, or a DB function; decide in design.

Publication lifecycle vs static blog (key trade-off, must be stated in proposal):
- Static `/blog` reads `siteContent.blog`; DB-published posts will NOT appear on `/blog` until a rebuild (e.g. a publish-triggered CI/build step) or until `/blog` is switched to client-side fetching (which abandons the current zero-JS marketing posture).
- First-slice recommendation: keep `/blog` static and unchanged; publishing in the DB is admin-driven; freshness/rendering of published posts on `/blog` is a follow-up change (documented as an explicit non-goal or deferred requirement, not silently omitted).

### 5. RLS / grants / Data API exposure

Facts (from `supabase/config.toml` and Supabase skill):
- Tables in `public` are reachable via the Data API when `anon`/`authenticated` are granted; `auto_expose_new_tables` is unset, so explicit `GRANT`s are required.
- `GRANT` controls table accessibility; RLS controls rows. Both are needed; RLS must be enabled on `profiles` and `posts`.
- Postgres 17 is available (config `major_version = 17`; remote 17.6.1.155), so any views should use `security_invoker = true`.
- Never expose `service_role`; browser ships only the `anon` key (which is public by design).

Recommendation:
- Grants: `GRANT SELECT ON posts TO anon` (only if `/blog` reads from the DB — deferred) and `GRANT ALL ON posts TO authenticated`; `GRANT SELECT, UPDATE ON profiles TO authenticated` (row-level policy gates each operation); keep `GRANT` minimal to the roles the policies actually allow.
- Policies per section 4; `TO anon`/`TO authenticated` clauses (never the deprecated `auth.role()`).
- Data API surface is deliberately small for the first slice: `posts` and `profiles` only; no storage bucket, no RPC surface beyond (optionally) a publish helper.

### 6. Migration and testing strategy

- Migrations: imperative (no `supabase/schemas/`), created with `supabase migration new <name>`, applied locally via `supabase db reset` and to the hosted project via `supabase db push` (maintainer-gated; deployment execution remains out of scope per config rules).
- RLS tests: pgTAP tests under `supabase/tests/` (run with `supabase db test`) covering each policy: anon cannot read drafts, editor cannot publish another's post, author-only draft edits, admin transitions, role-change takes effect immediately, service role not used from client path.
- App tests: extend the existing `tests/unit/*` source-contract pattern (e.g. env var wiring, client factory, guard helper, editor form validation) — no new framework; `strict_tdd: false` retained.
- Verification commands must remain Docker-scoped for Astro; the Supabase CLI runs as the pinned host devDependency per README convention (note the boundary: `supabase db test` is not an Astro Docker target).
- Quality gates: run `supabase db advisors` before committing migrations (skill requirement).

### 7. Environment, Docker, and deployment implications

- Env: `PUBLIC_SUPABASE_URL` + `PUBLIC_SUPABASE_ANON_KEY` only (Astro bakes `PUBLIC_*` at build time into the browser bundle — expected for the client pattern). No `service_role`/secret anywhere in the repo; `.env` stays gitignored, `.env.example` added.
- Docker: `dev` receives env via compose `environment`; `build` and `preview` need the `PUBLIC_*` values as build args since `astro build` inlines them (nginx prod image carries no runtime env). `.dockerignore` unchanged; pin `@supabase/supabase-js` in `package.json` with lockfile committed.
- Deployment: provisioning the hosted Supabase project env (URL/anon key) is a dependency for the apply phase; executing deployment remains excluded per `openspec/config.yaml`.
- Local stack: `supabase start` is optional and separate from Astro compose services (README lines 357–386); config.toml auth URLs must be corrected to the 4321 stack (see Current State) for the auth flow to work locally.

### 8. Legal-copy implications

- `src/pages/privacidad.astro` currently asserts there is no registration/authentication portal and no data collection — this becomes false the moment accounts exist. The change MUST include updated privacy copy covering: account creation (email/password), purpose of processing, role data, retention, and user rights (site is `es_MX`, LFPDPPP-adjacent context; `cookies.astro` may need a session-cookie note).
- Authoritative legal text is a maintainer/legal dependency: the change can wire structure and placeholder-approved copy, but final legal wording must be approved before publication. Flag in proposal as an in-scope task with an external-approval dependency.

### 9. Approaches (primary axis summary)

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| A. Static + browser Supabase client + RLS | Keeps Astro/nginx/Docker untouched; RLS is the enforcement point per requirement; smallest first slice | No server-side guard; blog freshness requires rebuild or later client fetch | Low |
| B. Hybrid SSR (`@astrojs/node` for `/editor`) | Server-side sessions, HttpOnly cookies, server fetch | Breaks static prod contract; Docker/nginx rework; larger slice | High |
| C. Full SSR | Single runtime | Discards static marketing posture; largest change | High |

## Recommendation

Approach **A: static Astro + client-side Supabase with RLS as the only authorization boundary**, plus: `profiles` table for roles (DB-backed, immediate effect), `posts` table with draft/published/archived lifecycle, admin-only role assignment and publishing, `/blog` unchanged and static for the first slice, updated legal copy with maintainer-approved text, and `.env.example` + Docker build-arg wiring for `PUBLIC_*` values. This matches the maintainer's stated preference and the security requirement; no concrete blocker to the static architecture was found.

## First Vertical Slice (narrow)

1. `supabase/migrations/0001_init_auth_rbac_blog.sql` — `profiles` + `posts` + RLS policies + grants + indexes + admin bootstrap note; pgTAP tests; `supabase db advisors` clean.
2. Client foundation: `@supabase/supabase-js` pinned, `src/lib/supabase/client.ts`, env wiring, `.env.example`, Docker build args, config.toml auth URL fix.
3. Auth UX: login/logout islands; `/editor` guard (UX-only) on `src/pages/editor/index.astro`.
4. Editorial UX: `/editor` draft list (own drafts) + `/editor/posts/new` create-draft form; author-only update on existing drafts.
5. Admin path (smallest acceptable): role assignment + publish/archive via SQL/Studio for slice 1, admin UI deferred; publish does NOT touch `/blog` yet (documented non-goal).
6. Legal copy update (maintainer-approved text) + README auth/env documentation + unit tests + full verify.

Explicitly out of slice 1: public signup UX, post detail pages, images/storage, `/blog` reading from the DB or client, admin user-management UI, EN locale, deployment execution.

## Risks

- **Budget**: this change far exceeds the 800-authored-line PR ceiling; `sdd-tasks` should forecast chained PRs (likely 3–5 slices: schema+RLS, client foundation+auth, editorial UI, legal/docs). Delivery strategy is `ask-on-risk` — a decision point before apply.
- **RLS policy errors are silent**: wrong policies yield empty result sets, not errors (e.g. UPDATE without SELECT policy). pgTAP coverage of every policy is mandatory before any UI work.
- **`SECURITY DEFINER` helper misuse**: the `is_admin()` helper must live in a non-exposed schema with an `auth.uid()` guard, or it becomes a public escalation vector (Supabase skill warning).
- **JWT/claim staleness**: avoided by DB-backed roles, but any future claim-based check reintroduces it; keep roles in `profiles`.
- **Auth redirect config**: local auth flows break until `config.toml` site/redirect URLs match the 4321 stack.
- **Legal contradiction**: shipping auth before updating `privacidad.astro` publishes false privacy statements; legal text approval is a gating dependency.
- **Blog freshness gap**: DB-published posts won't appear on the static `/blog` until a rebuild or a client-fetch change; must be an explicit non-goal/deferred requirement in the proposal.
- **Public signup decision**: leaving `enable_signup = true` invites role-`reader` account spam with no product value; recommend disabling.
- **Env provisioning**: apply phase needs hosted-project URL/anon key; missing values block the Docker build gate.

## Open Questions for Proposal

1. Keep `enable_signup = false` (maintainer-created accounts) or allow public reader signup?
2. Session persistence: localStorage (simplest) or cookie-based via `@supabase/ssr` `createBrowserClient`?
3. Is updating `privacidad.astro`/`cookies.astro` legal copy in scope with maintainer-provided text, or is it a follow-up change?
4. First-slice admin actions: SQL/Studio-only (recommended) or a minimal admin UI?

## Ready for Proposal

Yes — proceed to `sdd-propose` with the recommended approach (static client + RLS + `profiles` role table + `posts` lifecycle + unchanged `/blog`), the four open questions above, and an explicit task-forecast note that chained PRs will be required under the 800-line budget with `ask-on-risk` delivery.
