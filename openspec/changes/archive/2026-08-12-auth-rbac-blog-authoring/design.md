# Design: Auth, RBAC, and Blog Authoring

## Technical Approach

Keep Astro `output: 'static'` and nginx. Add a browser-only Preact application, supplied by a singleton Supabase browser client using `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`; sessions persist in local storage. PostgreSQL is the authorization boundary: explicit API grants, RLS, constraints, and narrowly scoped database functions implement the four delta specs. No browser secret or `service_role` is used.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Dynamic public URLs | Serve `/blog/index.html` as a Preact shell for `/blog` and any one-segment `/blog/:slug`; the island reads `location.pathname` and RPC-loads data. nginx gets an explicit `location ~ ^/blog/[^/]+/?$ { try_files $uri /blog/index.html; }`, while assets retain exact-file handling. | Astro `src/pages/blog/[slug].astro`; generic `/index.html` fallback. | Static Astro requires build-time `getStaticPaths`; arbitrary database slugs cannot be emitted. The current generic fallback renders the landing document, not a dynamic Astro route. |
| Authorization data | `profiles(id, display_name, role, suspended_at, ...)`, `posts(author_id, slug, markdown, status, published_at, ...)`, role/status enums, FKs, check constraints, unique slug, and indexes on public status/publication time, author/status, and slug. | JWT/user metadata roles; browser enforcement. | Roles stay fresh and authoritative in the database; metadata is user-editable and browser checks are not access control. |
| Profile provisioning | `AFTER INSERT` trigger on `auth.users`, implemented as hardened `SECURITY DEFINER` with empty search path and `INSERT ... ON CONFLICT (id) DO NOTHING`, creates `reader`. | Client insert; signup RPC. | Atomic, retry-safe provisioning cannot be forged or skipped by a client. |
| Public projection | A fixed, no-argument, hardened RPC returns only published post fields plus `display_name`; revoke broad table/profile access and grant only required table/RPC privileges. Markdown is parsed then sanitized with an allow-list before `dangerouslySetInnerHTML`. | Public profile SELECT; raw Markdown/HTML. | Prevents email/role disclosure and active content, while retaining static hosting. |

## Data Flow

```
Browser island -> Supabase Auth (local-storage session)
               -> PostgREST/RPC -> grants + RLS -> profiles/posts
Public /blog/:slug -> nginx /blog/index.html -> island -> published-post RPC
```

Signup triggers the idempotent reader profile. Active editors may CRUD only own drafts; active admins manage profiles and all posts. Policies use `TO authenticated`, `(select auth.uid())`, `USING` and `WITH CHECK`; role/suspension predicates are database helpers. A `BEFORE UPDATE` guard rejects demotion or suspension of the final active admin. Status transitions and ownership are additionally constrained in triggers/checks.

## File Changes

| File | Action | Description |
|---|---|---|
| `supabase/migrations/*`, `supabase/tests/auth_rbac_blog.sql` | Create | Schema, grants, RLS, guards, RPC, pgTAP. |
| `src/lib/supabase/client.ts`, `src/lib/blog/*` | Create | Typed client, auth/RPC and sanitization helpers. |
| `src/islands/AuthPanel.tsx`, `BlogApp.tsx`, `EditorApp.tsx`, `AdminApp.tsx` | Create | Accessible interactive islands. |
| `src/pages/blog.astro`, `src/pages/editor/*`, `src/pages/admin/*` | Modify/Create | Shared Astro shell and route-mounted islands. |
| `src/components/BlogPage.astro`, `src/content/site.ts` | Modify | Replace static cards with shell/copy. |
| `nginx.conf`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `src/env.d.ts`, `package.json` | Modify/Create | Explicit blog shell routing, build-time public configuration, dependencies. |
| `src/pages/privacidad.astro`, `src/pages/cookies.astro` | Modify | Approved truthful account/session disclosures. |
| `tests/unit/*`, `tests/browser/*` | Create/Modify | Logic, route and browser coverage. |

## Interfaces / Contracts

```ts
type Role = 'reader' | 'editor' | 'admin';
type PostStatus = 'draft' | 'published' | 'archived';
type PublicPost = { slug: string; title: string; markdown: string; authorName: string; publishedAt: string };
```

`published_posts()` accepts no caller-controlled filters and returns only `PublicPost`; unknown, draft, and archived slugs resolve to the same client not-found state.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| pgTAP/RLS | anon visibility, reader denial, editor ownership, suspension, admin transitions, last-admin guard, grants/RPC projection | Seed identities; set JWT role/subject; assert allow/deny and no email. |
| Unit | path parsing, client configuration rejection, Markdown sanitization, UI states | Vitest, including malicious HTML/URLs and unknown slug. |
| Browser | signup local session, role screens, arbitrary slug shell, public/not-found, sanitization | Add Docker-run browser harness against nginx and Supabase test data. |

## Threat Matrix

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | N/A: web routing never classifies or executes files. | None. | None. |
| Git repository selection | N/A: no VCS integration. | None. | None. |
| Commit state | N/A: no commit commands. | None. | None. |
| Push state | N/A: no push commands. | None. | None. |
| PR commands | N/A: no PR automation. | None. | None. |

## Migration / Rollout

Apply and pgTAP-verify the migration before deploying the UI. A trusted operator must bootstrap the first active admin out-of-band in the Supabase SQL Editor after identifying the account; no public self-promotion path exists. Provide production public build arguments only at Docker build time; never bake secrets. Release the current factual Spanish legal copy after project-maintainer approval, recorded on 12 August 2026; any external legal review remains optional/future and is not claimed here. Roll back by deploying the prior static image and revoking browser grants/RPC; preserve rows and use a reviewed forward migration, not destructive rollback.

## Open Questions

- [x] The project maintainer approved the current factual Spanish privacy and cookie wording on 12 August 2026; external legal review remains optional/future and is not represented as completed.
- [ ] Initial administrator identity and production `PUBLIC_*` build values are required for rollout.
