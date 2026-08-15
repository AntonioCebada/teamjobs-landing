# Proposal: Auth, RBAC, and Blog Authoring

## Intent

Enable secure blog authoring without changing static Astro/nginx. Replace static blog data with Supabase content while PostgreSQL authorization remains authoritative.

## Scope

### In Scope
- Public email/password signup; immediate local-storage sessions; new accounts are `reader`.
- DB-backed `reader`, `editor`, and `admin` roles; RLS; admin-only role changes; last-admin and suspension safeguards.
- Markdown drafts: editors manage only their drafts; admins manage users, roles, suspensions, all posts, publication, and archival.
- Browser-loaded `/blog` and `/blog/:slug` for published posts; safe Markdown, public profile names, and first-version admin UI.
- Truthful privacy/cookie copy for accounts and sessions.

### Out of Scope
- Email confirmation/SMTP, Auth bans, images/storage, comments, advanced categories, and in-app review states.
- SEO/indexability for browser-loaded blog content.

## Capabilities

### New Capabilities
- `account-access-rbac`: Signup, local sessions, profiles, roles, and suspension.
- `blog-editorial-authoring`: RLS-protected Markdown drafts plus admin publishing and archival.
- `public-blog-publication`: Browser-loaded list/detail routes and safe author rendering.
- `account-privacy-disclosure`: Accurate account and session disclosures.

### Modified Capabilities
None; `openspec/specs/` does not yet exist.

## Approach

Use a browser Supabase client with public URL/anon-key configuration. Model profiles/posts in PostgreSQL; explicit grants plus RLS enforce roles, ownership, suspension, and publication.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `supabase/migrations/*`, `supabase/tests/*` | New | Schema, grants, RLS, pgTAP. |
| `src/lib/supabase/*`, `src/islands/*`, `src/pages/editor/*` | New | Client and management UI. |
| `src/pages/blog.astro`, `src/pages/blog/[slug].astro` | Modified/New | Dynamic public blog. |
| `src/pages/privacidad.astro`, `src/pages/cookies.astro` | Modified | Truthful disclosures. |
| `package.json`, `.env.example`, `docker-compose.yml`, `supabase/config.toml` | Modified/New | Client and public env. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| RLS defect exposes or blocks data | Medium | Minimal grants; pgTAP per role/action. |
| Local-storage token exposure | Medium | No client secrets; safe rendering/input handling. |
| Work exceeds 800 lines | High | Forecast slices; ask before apply if risk remains. |
| Privacy wording is inaccurate | Medium | Maintainer/legal approval before release. |

## Rollback Plan

Deploy the prior static build, revoke browser table grants, and revert the UI/migration release together. Preserve accounts and posts for a reviewed forward migration.

## Dependencies

- Hosted Supabase URL/anon key, initial admin bootstrap, and approved privacy/cookie copy.

## Success Criteria

- [ ] Signup creates only `reader`; only admins manage roles, suspension, and publication; the last admin stays protected.
- [ ] RLS tests prove anonymous users cannot access non-published posts; editors cannot affect others' drafts or publish.
- [ ] `/blog` and `/blog/:slug` show only published Markdown and profile names, never emails.
- [ ] Docker quality gates pass; privacy/cookie statements accurately describe the feature.
