# Apply Progress: Auth, RBAC, and Blog Authoring

## Unit 1: Database Foundation

- **Mode:** Standard (strict TDD disabled)
- **Delivery:** `size-exception`; one sequential work unit inside the maintainer-approved large PR
- **Assigned scope:** tasks 1.1–1.5 only
- **State:** Complete — the maintainer-authorized bounded reset continuation produced green local runtime, migration, pgTAP, advisors, and diff evidence
- **Previous progress:** Historical blocked attempts are preserved below and merged with the successful continuation evidence

### Implementation attempted

- Created an imperative migration through the pinned Supabase CLI: role/status enums, `profiles` and `posts`, constraints, foreign keys, indexes, private role/suspension helpers, explicit grants, RLS policies, auth provisioning, profile/post guards, last-active-admin protection, and the fixed `published_posts()` projection RPC.
- Created the pgTAP suite for schema, grants, provisioning, anonymous public projection, reader/editor/suspended/admin behavior, ownership/status guards, role changes, and last-admin protection.
- No browser `service_role`, hosted migration, admin bootstrap, application code, UI, or documentation outside the change artifacts was touched.

### Task status

- [x] 1.1 Schema enums/tables/FKs/checks/slug/indexes
- [x] 1.2 Minimal grants/RLS/role-suspension helpers
- [x] 1.3 Auth provisioning/last-admin/status/ownership guards
- [x] 1.4 Hardened no-argument `published_posts()` RPC
- [x] 1.5 pgTAP proof and advisors

## Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| CLI discovery | `docker compose run --rm dev pnpm exec supabase --version` and `--help` commands; exit `0`; pinned CLI reported `2.111.0`; migration creation syntax is `supabase migration new [name]`, pgTAP syntax is `supabase db test [path...]`, and advisors syntax is `supabase db advisors --local`. |
| Migration creation | `docker compose run --rm dev pnpm exec supabase migration new auth_rbac_blog_foundation`; exit `0`; created `supabase/migrations/20260811164051_auth_rbac_blog_foundation.sql`. |
| Focused test command | `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "apk add --no-cache docker-cli >/tmp/docker-cli-install.log >/dev/null 2>&1 && pnpm exec supabase db test supabase/tests/auth_rbac_blog.sql"`; exit `1`; raw error: `failed to connect to postgres: failed to connect to host=127.0.0.1 user=postgres database=postgres: dial error (dial tcp 127.0.0.1:54322: connect: connection refused)`. |
| Runtime harness | `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "apk add --no-cache docker-cli >/tmp/docker-cli-install.log && pnpm exec supabase start"`; exit `1`; raw database error: `/usr/lib/postgresql/bin/pgsodium_getkey.sh: line 8: /etc/postgresql-custom/pgsodium_root.key: Is a directory`, followed by `FATAL: invalid secret key` and `supabase_db_teamjobs-landing: container is not ready: unhealthy`. A local stop with `--no-backup` was used only to remove the failed, newly-created local stack before one retry; the retry produced the same error. |
| Advisors | `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "apk add --no-cache docker-cli >/tmp/docker-cli-install.log >/dev/null 2>&1 && pnpm exec supabase db advisors --local --type all --fail-on error"`; exit `1`; raw error: `failed to connect to postgres: failed to connect to host=127.0.0.1 user=postgres database=postgres: dial error (connect ECONNREFUSED 127.0.0.1:54322)`; no advisor result was produced. |
| Static repository check | `git diff --check`; exit `0`; no whitespace errors in the authored files. This is not a substitute for the required database runtime evidence. |

### Rollback boundary

Remove or revert exactly:

- `supabase/migrations/20260811164051_auth_rbac_blog_foundation.sql`
- `supabase/tests/auth_rbac_blog.sql`
- this `apply-progress.md` evidence artifact and any future checkbox-only change to `tasks.md`

This removes only Unit 1 database behavior and its proof; no unrelated application, client, UI, legal, deployment, or hosted-project state is involved.

## Blocking issue

The local Supabase Postgres container remains unhealthy because the local stack's pgsodium root-key path is mounted as a directory. Until the local stack is repaired by the maintainer/runtime owner, `supabase db test` and `supabase db advisors --local` cannot execute. Tasks 1.1–1.5 therefore remain unchecked and are not ready for verification.

## Maintainer-authorized repair and second bounded runtime attempt

- Native status remained `applyState: ready`; `allowedEditRoots` remained the repository root. The run stayed in Standard Mode, Unit 1 only, with `delivery_strategy: exception-ok`, `chain_strategy: size-exception`, and the maintainer-provided second bounded runtime authorization for `unit-1-database-foundation`.
- Confirmed the exact target `<repository-root>/supabase/.temp/start-secrets` was local runtime state and was ignored by `supabase/.gitignore:3:.temp`. Its initial state was a root-owned directory.
- Normal repair command: `rm -rf -- "<repository-root>/supabase/.temp/start-secrets"`; exit `1`; raw error: `rm: no se puede borrar '<repository-root>/supabase/.temp/start-secrets': Permiso denegado`.
- The explicitly authorized sudo command was attempted exactly as `sudo rm -rf -- "<repository-root>/supabase/.temp/start-secrets"`; exit `1`; raw error: `sudo: a terminal is required to read the password; either use the -S option to read from standard input or configure an askpass helper` followed by `sudo: a password is required`.
- Because sudo could not acquire a terminal, the same exact target was removed through the established Docker execution boundary as root: `docker compose run --rm --user root dev sh -c "rm -rf -- /app/supabase/.temp/start-secrets"`; exit `0`. The target was absent afterward and remained ignored; no secret contents were printed or inspected, and the other top-level `supabase/.temp` linkage metadata remained present.
- Pinned CLI discovery: `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "apk add --no-cache docker-cli ... && pnpm exec supabase --version && pnpm exec supabase --help ..."`; exit `0`; CLI version `2.111.0`; help confirmed `supabase start`, `supabase db reset --local`, `supabase db test --local`, and `supabase db advisors --local`.
- Runtime harness command: `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "apk add --no-cache docker-cli ... && pnpm exec supabase start --yes --log-level error"`; exit `1`. The pinned CLI recreated the ignored `start-secrets` runtime directory, but Postgres repeatedly emitted the raw error `/usr/lib/postgresql/bin/pgsodium_getkey.sh: line 8: /etc/postgresql-custom/pgsodium_root.key: Is a directory`, `od: write error`, and `FATAL: invalid secret key`; final error: `supabase_db_teamjobs-landing: container is not ready: unhealthy`.
- A diagnostic start using `pnpm exec supabase --workdir /app/supabase start --yes --log-level error` also exited `1` with the same raw pgsodium directory/invalid-secret-key errors and produced an accidental root-owned nested local runtime directory at `supabase/supabase/.temp`; no source file was created or changed by that diagnostic, and it was not removed because the repair authorization prohibits deleting other `.temp` linkage metadata. This nested runtime artifact is an issue requiring maintainer cleanup before another runtime attempt.
- Database health evidence: `docker inspect --format 'name={{.Name}} status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' supabase_db_teamjobs-landing` exited `1` with `Error response from daemon: No such container: supabase_db_teamjobs-landing`; `docker exec supabase_db_teamjobs-landing pg_isready -U postgres -d postgres` and the `psql` database probe also exited `1` because the container did not exist after failed startup. No healthy local database was available.
- Migration/reset command: `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "... && pnpm exec supabase db reset --local --no-seed"`; exit `1`; raw error: `supabase start is not running.` No local migration reset occurred.
- Focused pgTAP command: `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "... && pnpm exec supabase db test --local supabase/tests/auth_rbac_blog.sql"`; exit `1`; raw error: `failed to connect to postgres: failed to connect to host=127.0.0.1 user=postgres database=postgres: dial error (dial tcp 127.0.0.1:54322: connect: connection refused)`. Exact pgTAP result: `0` tests executed, `0` passed, `0` failed; no pgTAP result was produced.
- Advisors command: `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "... && pnpm exec supabase db advisors --local --type all --fail-on error"`; exit `1`; raw error: `failed to connect to postgres: failed to connect to host=127.0.0.1 user=postgres database=postgres: dial error (connect ECONNREFUSED 127.0.0.1:54322)`. Exact advisors result: no advisor result was produced.
- Static check: `git diff --check`; exit `0`; no whitespace errors were reported. This does not substitute for the unavailable runtime, pgTAP, or advisors evidence.

### Final Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| Focused test command and exact result | `docker compose run --rm -v /var/run/docker.sock:/var/run/docker.sock dev sh -c "... && pnpm exec supabase db test --local supabase/tests/auth_rbac_blog.sql"`; exit `1`; connection refused; `0` executed, `0` passed, `0` failed because pgTAP did not start. |
| Runtime harness command/scenario and exact result | Pinned `supabase start --yes --log-level error` after removing only the exact ignored target; exit `1`; Postgres unhealthy because `/etc/postgresql-custom/pgsodium_root.key` was a directory and emitted `FATAL: invalid secret key`. |
| Database health | `pg_isready` and `psql` probes against `supabase_db_teamjobs-landing`; exit `1`; no such container after failed startup. |
| Migration result | `supabase db reset --local --no-seed`; exit `1`; `supabase start is not running.` |
| Advisors result | `supabase db advisors --local --type all --fail-on error`; exit `1`; connection refused; no result. |
| Rollback boundary | Revert exactly `supabase/migrations/20260811164051_auth_rbac_blog_foundation.sql`, `supabase/tests/auth_rbac_blog.sql`, this `apply-progress.md`, and any future checkbox-only `tasks.md` change. Remove only Unit 1 database behavior/proof and its evidence; do not touch application, client, UI, legal, deployment, hosted state, or unrelated local metadata. |

## Current task gate

Historical snapshot: tasks 1.1–1.5 remained unchecked in `tasks.md`; the complete change was `0/21` tasks. Runtime, migration, pgTAP, and advisors gates were not green, so no Unit 1 task could be marked complete at that point.

## Maintainer-authorized bounded reset continuation (current)

- Native authority remained `applyState: ready`; the parent retained the fresh `proceed` token and will settle it. The run stayed in Standard Mode, Unit 1 only, with `delivery_strategy: exception-ok`, `chain_strategy: size-exception`, and repository-root edit authority.
- Historical failures above remain preserved. This continuation used the corrected same-absolute-host-path execution boundary and did not touch hosted state, remote migrations, application code, UI, admin bootstrap, commits, or push state.

### Authorized cleanup evidence

- Names/types were inspected without reading secret contents. The initially authorized cleanup found `supabase/.temp/start-secrets` absent and the diagnostic `supabase/supabase/.temp` as a root-owned mode-700 directory; its empty parent `supabase/supabase` was removed only after the diagnostic directory was removed.
- The safe UID/GID helper could not create the authorized runtime directory because the repository `supabase/.temp` parent was root-owned. The successful runtime therefore required root in the helper; the resulting `supabase/.temp/start-secrets` was a root-owned mode-700 directory.
- After the local stack was stopped with the discovered project-scoped `supabase stop --project-id teamjobs-landing` command (exit `0`, preserving local Docker data volumes), the cleanup helper inspected and removed only `supabase/.temp/start-secrets`. The nested diagnostic paths were already absent. Final evidence: `supabase/.temp/start-secrets` absent, `supabase/supabase/.temp` absent, `supabase/supabase` absent.
- `supabase/.temp/project-ref` and `supabase/.temp/linked-project.json` remained present; no linked-project metadata, migrations, tests, unrelated containers, or Docker volumes were removed. Supabase project data volumes remained listed for `teamjobs-landing` after stop.

### Corrected helper execution boundary

- Selected project image: `teamjobs-landing-dev:latest`, image ID `sha256:f6b2c7e57f02ba73ee06125dfa3702678bbab253a816635f9cf5648af4242b30`.
- Selected existing app volume: `teamjobs-landing_app_node_modules`, discovered from `teamjobs-landing-dev-1` and mounted at `<repository-root>/node_modules`.
- Repository bind and working directory were both the same absolute host path: `<repository-root>`.
- The helper mounted `/var/run/docker.sock`, used Docker client/server `29.7.2`, and used the host Docker CLI binary read-only because the selected project image has no Docker CLI. No project package installation or Supabase CLI upgrade was performed; the pinned `node_modules/.bin/supabase` reported `2.111.0`.
- `--network host` was required so the nested CLI could reach the host-published local database port `127.0.0.1:54322`; this also preserved the same host absolute bind sources for every CLI-generated container mount.
- Command discovery used the pinned CLI `--help` output and confirmed `start`, `db reset --local --no-seed`, `db test --local`, `db advisors --local`, and `stop --project-id` syntax.

### Current command evidence

| Evidence | Exact command/result |
|---|---|
| Safe-UID start attempt | The full helper boundary above with `--user 1000:1000` and inner command `./node_modules/.bin/supabase start --yes --log-level error`; exit `1`; raw error: `failed to create docker container: failed to stage container secret files: EACCES: permission denied, mkdir '<repository-root>/supabase/.temp/start-secrets'`. |
| Root start without host networking | Same helper with `--user 0:0`, but without `--network host`; exit `1`; raw error: `failed to connect to postgres: failed to connect to \\`host=127.0.0.1 user=postgres database=postgres\\`: dial error (connect ECONNREFUSED 127.0.0.1:54322)`. No Supabase database container remained. |
| Runtime harness | Same helper with `--network host`, `--user 0:0`, and inner `./node_modules/.bin/supabase start --yes --log-level error`; exit `0`; local Supabase started successfully. |
| Database health | `docker inspect --format 'name={{.Name}} status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} exit={{.State.ExitCode}}' supabase_db_teamjobs-landing`; exit `0`; `status=running health=healthy exit=0`. `docker exec supabase_db_teamjobs-landing pg_isready -U postgres -d postgres`; exit `0`; `/run/postgresql:5432 - accepting connections`. |
| Local migration reset/apply | Inner command `./node_modules/.bin/supabase db reset --local --no-seed`; corrected helper boundary; exit `0`; recreated the local database and applied `20260811164051_auth_rbac_blog_foundation.sql`. One intermediate invocation accidentally omitted the read-only dynamic-loader mount and exited `1` with `failed to inspect service`; it was immediately rerun with the complete boundary and passed. |
| First focused pgTAP run | `./node_modules/.bin/supabase db test --local supabase/tests/auth_rbac_blog.sql`; exit `1`; raw SQL error: `function pg_catalog.nullif(text, unknown) does not exist`; pgTAP stopped at 18 tests, planned 42, with `24` not executed. |
| Bounded SQL correction | Replaced the three invalid `pg_catalog.nullif(...)` calls in `private.handle_new_user()` with SQL `nullif(...)`; no later-unit files changed. |
| Second focused pgTAP run | After reset, exit `1`; `42` planned, `42` executed, `1` failed: `suspended editor cannot update a draft` caught no exception while the test expected `42501`. |
| Bounded test correction | Changed the suspended-editor update assertion to prove a zero-row update through a top-level CTE, matching RLS denial semantics without requiring an exception. The first direct `results_eq` form was rejected by pgTAP (`cannot open UPDATE query as cursor`), so it was narrowed to `WITH attempted AS (UPDATE ... RETURNING id) SELECT id FROM attempted`. |
| Final migration reset/apply | `./node_modules/.bin/supabase db reset --local --no-seed`; corrected helper boundary; exit `0`; migration applied successfully. |
| Final focused pgTAP | `./node_modules/.bin/supabase db test --local supabase/tests/auth_rbac_blog.sql`; corrected helper boundary; exit `0`; `Files=1, Tests=42, Failed=0, Result: PASS`. |
| Advisors | `./node_modules/.bin/supabase db advisors --local --type all --fail-on error`; corrected helper boundary; exit `0`; exact result: `No issues found`. |
| Stack stop | `./node_modules/.bin/supabase stop --project-id teamjobs-landing`; exit `0`; project-scoped local Supabase containers stopped and Docker data volumes preserved. |
| Final cleanup | Root cleanup helper removed only `supabase/.temp/start-secrets`, then safely attempted `rmdir supabase/supabase`; exit `0`; all three authorized diagnostic paths absent afterward. |
| Diff check | `git diff --check`; exit `0`; no whitespace errors. |

### Final Work Unit Evidence

| Evidence | Required result |
|---|---|
| Focused test command and exact result | `./node_modules/.bin/supabase db test --local supabase/tests/auth_rbac_blog.sql`; exit `0`; 1 file, 42 tests, 42 passed, 0 failed. |
| Runtime harness command/scenario and exact result | Pinned CLI `start --yes --log-level error` through the same-absolute-path helper; exit `0`; database container `running/healthy`, `pg_isready` accepted connections, then the stack was stopped project-scoped with exit `0`. |
| Rollback boundary | Revert/remove exactly `supabase/migrations/20260811164051_auth_rbac_blog_foundation.sql`, `supabase/tests/auth_rbac_blog.sql`, the Unit 1 checkbox changes in `openspec/changes/auth-rbac-blog-authoring/tasks.md`, and this Unit 1 evidence in `apply-progress.md`. This removes only the Unit 1 schema, authorization behavior, public projection proof, and planning evidence; it does not remove later-unit files, application code, hosted state, linked metadata, or unrelated local volumes. |

### Historical Unit 1 task gate

At the end of Unit 1, tasks 1.1–1.5 were checked in both `tasks.md` and this merged progress artifact. Unit 1 was `5/5` complete; the overall change was `5/21` complete. The remaining 16 tasks (2.1–5.3) were not assigned to that continuation and remained unchecked.

## Unit 2: Client/Env Foundation

- **Mode:** Standard (strict TDD disabled)
- **Delivery:** `size-exception`; one approved PR, one sequential Unit 2 work unit only
- **Assigned scope:** tasks 2.1–2.4 only
- **State:** Complete — focused client and Markdown tests, type checking, lint, Unit 2 formatting, full unit suite, Docker Compose validation, and diff checks are green
- **Dependency decision:** Current Docker-compatible registry versions are pinned exactly: `@supabase/supabase-js` `2.112.3`, `marked` `18.0.9`, `dompurify` `3.4.13`, and test-only `jsdom` `29.1.1`. `docker compose run --rm test sh -c "pnpm view @supabase/supabase-js version && pnpm view marked version && pnpm view dompurify version && pnpm view jsdom version"` resolved the first three current releases and `jsdom` `30.0.1`; `@supabase/supabase-js` is the current registry release and supports the pinned Node 22 toolchain. Marked is browser-compatible but does not sanitize output, so DOMPurify is the smallest proven runtime sanitizer stack. Registry `jsdom` `30.0.1` requires Node `22.22.2`, which is incompatible with the repository's pinned Node `22.14.0` image, so the latest compatible `29.1.1` is used for Vitest's jsdom test environment.

### Implementation

- Added a typed `Database` contract covering the Unit 1 tables and the no-argument `published_posts()` RPC return projection.
- Added a lazy typed browser singleton that validates absolute HTTP(S) URL configuration and the `sb_publishable_` key format, rejects browser/server misuse and unavailable local storage, and configures `autoRefreshToken: true`, `persistSession: true`, and `detectSessionInUrl: false`.
- Added public-post RPC helpers that call `published_posts()` without caller-controlled arguments, map only `slug`, `title`, `markdown`, `author_name`, and `published_at`, return shared success/empty/not-found/error states, and expose no email or role fields.
- Added Marked parsing followed by DOMPurify HTML allow-list sanitization. Only Markdown presentation tags and `href`/`title` attributes survive, with HTTP(S), mailto, relative, and fragment links allowed while scripts, event handlers, images, and unsafe protocols are removed.
- Added only placeholder public environment names; no `.env` was read and no credential was added.

### Task status

- [x] 2.1 Exact dependency pins, public env declarations, Docker build args/runtime environment, and Docker-generated lockfile
- [x] 2.2 Typed browser singleton with explicit configuration rejection and local-storage sessions
- [x] 2.3 Typed no-argument public RPC helpers and parse-then-allow-list Markdown sanitization
- [x] 2.4 Focused missing/invalid-env and malicious-Markdown tests

### Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| Focused test command and exact result | `docker compose run --rm test pnpm vitest run tests/unit/supabase-client.test.ts tests/unit/markdown.test.ts`; exit `0`; 2 files passed, 8 tests passed, 0 failed. The client suite covers missing URL/key, invalid URL/embedded credentials/service-role key, and browser client creation; the Markdown suite covers safe markup plus scripts, event handlers, and unsafe protocols. |
| Relevant type check | `docker compose run --rm test pnpm check`; exit `0`; 0 errors, 0 warnings, 2 pre-existing hints in `src/components/About.astro`. |
| Relevant lint | `docker compose run --rm test pnpm eslint .`; exit `0`; no lint diagnostics. |
| Relevant format check | `docker compose run --rm test pnpm prettier --check docker-compose.yml src/env.d.ts src/lib/supabase/database.ts src/lib/supabase/client.ts src/lib/blog/public-posts.ts src/lib/blog/markdown.ts src/lib/blog/index.ts tests/unit/supabase-client.test.ts tests/unit/markdown.test.ts package.json`; exit `0`; all selected files matched Prettier. `.env.example` and `Dockerfile` have no configured Prettier parser. |
| Full repository format baseline | `docker compose run --rm test pnpm prettier --check .`; exit `1`; raw result `Code style issues found in 17 files`, all pre-existing `.agents/`, `.engram/`, `.playwright/`, and `supabase/.temp/` artifacts outside Unit 2. Unit 2 selected-file formatting remains green. |
| Full unit regression | `docker compose run --rm test pnpm vitest run`; exit `0`; 13 files passed, 53 tests passed, 0 failed. |
| Docker/env configuration | `docker compose config --quiet`; exit `0`; Compose accepted public build-arg and runtime-environment wiring without credentials. |
| Docker build | `docker compose build build`; exit `0`; frozen-lockfile install and Astro static build completed with the Unit 2 dependency set. |
| Static diff check | `git diff --check`; exit `0`; no whitespace errors in the tracked diff. |
| Runtime harness command/scenario and exact result | `N/A — logic-only; runtime proven in Units 3–4.` |

### Rollback boundary

Remove or revert exactly the Unit 2 dependency/env/client/blog/test files and the Unit 2 checkbox/evidence additions:

- `package.json`, `pnpm-lock.yaml`, `.env.example`, `src/env.d.ts`, `Dockerfile`, and `docker-compose.yml` public Supabase dependency/configuration edits
- `src/lib/supabase/database.ts`, `src/lib/supabase/client.ts`, `src/lib/blog/index.ts`, `src/lib/blog/public-posts.ts`, and `src/lib/blog/markdown.ts`
- `tests/unit/supabase-client.test.ts` and `tests/unit/markdown.test.ts`
- the Unit 2 checkbox lines in `tasks.md` and this Unit 2 section in `apply-progress.md`

This removes only Unit 2 browser client, public RPC, Markdown safety, dependency, environment, and focused-test behavior; Unit 1 migrations, pgTAP evidence, and all unrelated landing-page files remain intact.

### Deviations and issues

- No implementation deviation from the approved design.
- The repository-wide Prettier baseline remains non-green because 17 pre-existing agent/runtime artifact files are not formatted; no unrelated artifact was changed. The Unit 2 selected-file format check is green.

### Current task gate

Tasks 1.1–1.5 and 2.1–2.4 are checked in both `tasks.md` and this merged progress artifact. Unit 1 plus Unit 2 are `9/21` complete; tasks 2.1–2.4 are ready for verification, while Units 3–5 remain unchecked and unassigned.

## Unit 3: Auth and Editorial UI

- **Mode:** Standard (strict TDD disabled)
- **Delivery:** `size-exception`; one approved PR, one sequential Unit 3 work unit only
- **Attempt:** `proceed` for `unit-3-auth-editor-admin-ui`; parent retained and will settle the token; no `sdd-attempt` was called
- **Assigned scope:** tasks 3.1–3.5 only
- **State:** Complete — focused unit tests, full Vitest, Astro check, ESLint, selected Prettier, Docker build, and local Supabase browser harness are green
- **Dependency decision:** Added exact `@playwright/test` `1.58.2`; the harness uses the matching pinned `mcr.microsoft.com/playwright:v1.58.2-noble` image and updates `pnpm-lock.yaml` through Docker pnpm

### Implementation

- Added `AuthPanel` with accessible signup/login/logout states, immediate local-session handling, safe generic error messages, database-backed role display, and no signup role input or privileged browser secret.
- Added shared browser auth/session loading that defers the browser-only client until hydration, subscribes with `onAuthStateChange`, loads `profiles.role` from the database, and unsubscribes on cleanup.
- Added editor draft create/update UI scoped to the authenticated user's own `draft` rows. The editor deliberately has no publication, archival, reassignment, or delete controls; RLS remains authoritative.
- Added admin user role/suspension controls and all-post edit, publish, and archive controls. Last-admin and permission failures are mapped to safe Spanish messages without exposing raw database details.
- Added minimal static `/auth/`, `/editor/`, and `/admin/` Astro routes with shared `BaseLayout` and `client:load` islands, plus account/editor/admin copy in `src/content/site.ts`.
- Added a Docker-only browser harness. It uses the proven same-absolute-host-path `teamjobs-landing-dev:latest` helper, `teamjobs-landing_app_node_modules`, Docker socket, host networking, local publishable URL/key injection, trusted local SQL seeding, Astro preview on port 4322, and project-scoped Supabase cleanup with volumes retained. No service-role value is passed to the browser or committed.
- Updated the existing managed-infrastructure assertion so the required pinned browser test package is allowed while Compose remains free of a managed Playwright service/image.

### Task status

- [x] 3.1 `AuthPanel.tsx` signup/login/session/reader behavior and focused auth contract
- [x] 3.2 `EditorApp.tsx` own-draft create/update behavior with explicit loading/empty/error/denied states and no publish controls
- [x] 3.3 `AdminApp.tsx` user/post management, publication controls, safe last-admin/RLS errors, and focused editorial contract
- [x] 3.4 Static auth/editor/admin routes and consistent site content
- [x] 3.5 Docker browser harness and local Supabase runtime scenarios

### TDD / focused evidence

Strict TDD was disabled by `openspec/config.yaml`. The assigned focused tests still followed a RED→GREEN sequence:

| Cycle | Exact command/result |
|---|---|
| RED | `docker compose run --rm test pnpm vitest run tests/unit/auth-panel.test.ts tests/unit/editor-admin.test.ts`; exit `1`; both suites initially failed because `src/islands/auth-session` did not exist. |
| GREEN | `docker compose run --rm test pnpm vitest run tests/unit/auth-panel.test.ts tests/unit/editor-admin.test.ts`; exit `0`; 2 files, 2 tests passed, 0 failed. |

### Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| Focused test command and exact result | `docker compose run --rm test pnpm vitest run tests/unit/auth-panel.test.ts tests/unit/editor-admin.test.ts`; exit `0`; 2 files, 2 tests passed, 0 failed. |
| Runtime harness command/scenario and exact result | `docker compose run --rm test pnpm test:browser`; exit `0`; 3 Playwright scenarios passed: signup→reader local session persistence plus reader editor denial, seeded editor draft access with no publish control, and seeded admin user suspension plus draft publication. `test-results/.last-run.json` reported `passed` with no failed tests. |
| Local Supabase/app lifecycle | Harness reset local Supabase with pinned CLI `2.111.0`, seeded identities/roles/posts through trusted `docker exec ... psql`, injected only `API_URL`/`PUBLISHABLE_KEY`, built and served the static Astro preview on `127.0.0.1:4322`, ran the pinned Playwright container, then ran `supabase stop --project-id teamjobs-landing`; Docker data volumes were retained and the exact ignored `supabase/.temp/start-secrets` runtime directory was cleaned. |
| Full Vitest | `docker compose run --rm test pnpm vitest run`; exit `0`; 15 files, 55 tests passed, 0 failed. |
| Astro/type check | `docker compose run --rm test pnpm check`; exit `0`; 0 errors, 2 pre-existing hints in `src/components/About.astro`. |
| ESLint | `docker compose run --rm test pnpm eslint .`; exit `0`; no diagnostics. |
| Selected formatting | `docker compose run --rm test pnpm prettier --check src/islands/AuthPanel.tsx src/islands/auth-session.ts src/islands/EditorApp.tsx src/islands/AdminApp.tsx src/pages/auth/index.astro src/pages/editor/index.astro src/pages/admin/index.astro tests/unit/auth-panel.test.ts tests/unit/editor-admin.test.ts tests/browser/auth-rbac.spec.ts src/content/site.ts tests/unit/footer-legal-compose.test.ts package.json docker-compose.yml`; exit `0`; all selected files matched Prettier. |
| Compose/build | `docker compose config --quiet`; exit `0`. `docker compose build build`; exit `0`; frozen-lockfile install and static Astro build completed with auth/editor/admin routes. |
| Diff check | `git diff --check`; exit `0`; no whitespace errors. |
| Authored size | 668 authored additions/deletions excluding the generated lockfile; `pnpm-lock.yaml` adds the exact browser dependency resolution with a visible generated delta, keeping the complete Unit 3 snapshot below the native 800-line limit. |

### Rollback boundary

Revert/remove exactly the Unit 3 behavior and evidence:

- `.gitignore` test-results entry, the Unit 3 Docker socket mount in `docker-compose.yml`, the `test:browser` script and `@playwright/test` entry in `package.json`, and the generated browser dependency section in `pnpm-lock.yaml`;
- `src/islands/AuthPanel.tsx`, `src/islands/auth-session.ts`, `src/islands/EditorApp.tsx`, `src/islands/AdminApp.tsx`, the three `src/pages/{auth,editor,admin}/index.astro` routes, and the Unit 3 additions to `src/content/site.ts`;
- `tests/unit/auth-panel.test.ts`, `tests/unit/editor-admin.test.ts`, `tests/browser/auth-rbac.spec.ts`, `tests/browser/seed.sql`, `tests/browser/run-local.sh`, and the narrow managed-infrastructure assertion update in `tests/unit/footer-legal-compose.test.ts`;
- the Unit 3 checkbox lines in `tasks.md` and this Unit 3 section in `apply-progress.md`.

This rollback removes only auth/editor/admin UI, local browser harness, browser dependency wiring, and its proof. Unit 1 migrations/pgTAP, Unit 2 client/Markdown foundation, public blog work, legal work, remote state, commits, and pushes remain untouched.

### Deviations and issues

- The routes use `BaseLayout` and minimal content sections without the landing navigation/footer slots; this keeps the Unit 3 routes focused and leaves the broader blog/site shell to later units.
- No implementation or security issue remains. The full check still reports the two existing About hints; they are outside Unit 3 and were not changed.

### Current task gate

Tasks 1.1–1.5, 2.1–2.4, and 3.1–3.5 are checked in both `tasks.md` and this merged progress artifact. Unit 1 plus Unit 2 plus Unit 3 are `14/21` complete; Units 4–5 remain unchecked and unassigned.

## Unit 4: Public Blog and Routing

- **Mode:** Standard (strict TDD disabled)
- **Delivery:** `size-exception`; one approved PR, one sequential Unit 4 work unit only
- **Attempt:** `proceed` for `unit-4-public-blog-routing`; parent retained and will settle the token; no `sdd-attempt` was called
- **Assigned scope:** tasks 4.1–4.4 only
- **State:** Complete — focused route tests, full Vitest, browser runtime, static build, nginx preview, quality checks, and diff checks are green
- **Authored size:** 604 additions/deletions for the Unit 4 implementation/test/harness delta; generated build output and prior Unit 1–3 work are excluded

### Implementation

- Added `BlogApp` route parsing for `/blog`, `/blog/`, and exactly one decoded slug matching the database-safe slug contract. Unsafe, malformed, extra-segment, unknown, draft, and archived routes share one non-disclosing not-found state.
- Added loading, empty, error, published-list, and published-detail states. The island consumes only the typed no-argument `published_posts()` projection and renders only title, Markdown, public display name, and publication timestamp; no email or role field is used.
- Rendered detail Markdown through the existing parse-then-DOMPurify allow-list helper before `dangerouslySetInnerHTML`.
- Replaced static placeholder cards with the hydrated public island while retaining the existing Spanish intro, categories, sidebar, wide canvas, accessible headings, and navigation/footer shell.
- Added exact `/blog` handling, one-segment slug fallback, and a blog-prefix shell fallback for nested paths in nginx. Root `_astro` asset handling remains exact-file `404` behavior.
- Extended the local harness with trusted local SQL seed rows, empty/list/detail/non-public/sanitization/disclosure scenarios, console/page-error capture, actual nginx preview image build plus `nginx -t`, and project-scoped Supabase cleanup. Browser code receives only the publishable URL/key; no storage state is saved.

### Task status

- [x] 4.1 `BlogApp` path parsing, public states, safe detail rendering, and RED→GREEN route tests
- [x] 4.2 Static blog shell and removal of rendered placeholder-card dependency
- [x] 4.3 nginx `/blog` and arbitrary one-segment routing with nested-path protection
- [x] 4.4 Docker local-Supabase/Playwright public scenarios through the real nginx preview

### TDD / focused evidence

Strict TDD was disabled by `openspec/config.yaml`; the assigned route test still followed RED→GREEN:

| Cycle | Exact command/result |
|---|---|
| RED | `docker compose run --rm test pnpm vitest run tests/unit/blog-route.test.ts`; exit `1`; import failed because `src/islands/BlogApp` did not yet exist. |
| GREEN | `docker compose run --rm test pnpm vitest run tests/unit/blog-route.test.ts`; exit `0`; 1 file, 3 tests passed, 0 failed. |

### Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| Focused test command | `docker compose run --rm test pnpm vitest run tests/unit/blog-route.test.ts tests/unit/blog.test.ts`; exit `0`; 2 files, 12 tests passed, 0 failed. |
| Full Vitest | `docker compose run --rm test pnpm vitest run`; exit `0`; 16 files, 58 tests passed, 0 failed. |
| Runtime harness | `docker compose run --rm test pnpm test:browser`; exit `0`; actual pinned nginx preview image built and validated with `nginx -t`; 6 Playwright scenarios passed with no captured console errors or page exceptions. |
| Browser scenarios | Empty `/blog`, reader/editor/admin continuity, arbitrary published `/blog/arbitrary-public-slug/`, sanitized script/event/unsafe-link markup, absent email/role values, and identical unknown/draft/archived/unsafe/extra-segment not-found text all passed. |
| Nginx proof | Preview build exit `0`; `docker run --rm teamjobs-landing-preview:latest nginx -t` exit `0`; real preview returned HTTP `200` for `/blog`, `/blog/:slug`, `/blog/:slug/extra`, and an exact `_astro` asset. |
| Astro/type check | `docker compose run --rm test pnpm check`; exit `0`; 0 errors, 0 warnings, 2 pre-existing About hints. |
| ESLint | `docker compose run --rm test pnpm eslint .`; exit `0`; no diagnostics. |
| Selected Prettier | `docker compose run --rm test pnpm prettier --check src/islands/BlogApp.tsx src/components/BlogPage.astro src/pages/blog.astro tests/unit/blog-route.test.ts tests/unit/blog.test.ts tests/browser/auth-rbac.spec.ts`; exit `0`; all selected files matched. |
| Docker/config | `docker compose build preview`; exit `0`; static Astro build completed. `docker compose config --quiet`; exit `0`. |
| Static diff check | `git diff --check`; exit `0`; no whitespace errors. `sh -n tests/browser/run-local.sh`; exit `0`. |

### Local lifecycle and security evidence

- The harness started pinned local Supabase CLI `2.111.0`, reset the project database, seeded only local test identities/posts through `docker exec ... psql`, built the static preview with only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, ran the pinned Playwright `v1.58.2` image against nginx, then stopped Supabase with `stop --project-id teamjobs-landing` and removed only the ignored `supabase/.temp/start-secrets` directory.
- The helper mounted the repository at the same absolute host path for every nested Supabase/Docker command; no nested CLI ran from `/app`. No service-role/secret key was passed to the browser, no hosted state was changed, and no secret-bearing Playwright storage state was persisted.
- Browser assertions proved the public body excludes both seeded test emails and role labels. Malicious Markdown produced no script/image/unsafe link, no event attributes, and no `window.__blogXss` execution.

### Rollback boundary

Revert/remove exactly `src/islands/BlogApp.tsx`, the Unit 4 changes in `src/components/BlogPage.astro`, `nginx.conf`, `tests/unit/blog-route.test.ts`, the Unit 4 assertions in `tests/unit/blog.test.ts`, the Unit 4 additions to `tests/browser/auth-rbac.spec.ts`, `tests/browser/seed.sql`, and `tests/browser/run-local.sh`, plus the Unit 4 checkbox/evidence additions in `tasks.md` and this file. This restores the prior static card rendering, removes public route behavior and its proof, and leaves Units 1–3, legal/docs work, hosted state, commits, and pushes untouched.

### Deviations and issues

- `src/pages/blog.astro` already was the required shared static `BaseLayout`/navbar/content/footer shell, so it was preserved without an unnecessary structural change; the dynamic boundary was correctly placed in `BlogPage.astro`.
- The browser cannot request an invalid percent-encoded URI because nginx returns HTTP 400 before application code. Malformed/unsafe slug parsing is covered in the focused unit suite; browser coverage uses a valid-but-invalid-for-the-database slug and nested path, both rendered through the shared not-found state.
- No unresolved implementation issue remains. The repository-wide check retains only the two pre-existing About hints.

### Current task gate

Tasks 1.1–1.5, 2.1–2.4, 3.1–3.5, and 4.1–4.4 are checked in both `tasks.md` and this merged progress artifact. Units 1–4 are `18/21` complete; Unit 5 tasks 5.1–5.3 remain unchecked and unassigned.

## Unit 5: Legal, Docs, and Rollout — Maintainer-Authorized Draft

- **Mode:** Standard (strict TDD disabled)
- **Delivery:** `exception-ok`; `size-exception` chain strategy; one bounded Unit 5 draft slice inside the approved large PR
- **Attempt:** `proceed` for `unit-5-legal-docs-draft`, evidence goal `truthful-privacy-cookie-draft-tests-rollout-docs-ready-for-maintainer-review`; maximum 2 attempts / 500 changed lines; parent retains and settles the token; no `sdd-attempt` was called
- **Assigned scope:** tasks 5.1–5.3 only
- **Authored size:** approximately 392 additions/deletions for this Unit 5 legal, test, documentation, task, and progress delta; inherited Units 1–4 snapshot changes are excluded and the slice remains below the 500-line attempt cap
- **State:** Complete — factual legal drafts, disclosure tests, rollout documentation, and the explicit project-maintainer approval gate are recorded
- **Human approval boundary:** Approval is bounded to the current factual drafts and does not claim legal certification, legal sufficiency, or an external-counsel opinion.

### Implementation

- Updated `src/pages/privacidad.astro` with factual account, Supabase processing, local browser session, profile, role/suspension, authored-post, published-projection, access-boundary, contact, and rights-contact wording. The existing visual-only contact-form behavior and verified TeamJobs contact facts remain intact.
- Updated `src/pages/cookies.astro` to describe the Supabase client session in browser `localStorage`, explicitly distinguish that from an authentication cookie owned by this application, preserve external-provider boundaries, and avoid the former false claim that the site has no local storage or sessions.
- Extended `tests/unit/footer-legal-compose.test.ts` with factual disclosure assertions and contradiction checks for the removed no-registration/no-session/no-cookie claims. Assertions normalize source whitespace so formatting cannot hide a disclosure.
- Added `docs/phases/auth-rbac-rollout.md` with the migration→pgTAP→advisors→UI order, same-absolute-host-path local helper boundary, separate hosted migration responsibility, placeholder-only first-admin bootstrap/evidence, build-time-only public environment handling, rollback, and verification checklists.
- No auth, RLS, blog, migration, hosted Supabase, production environment, real administrator identity, commit, push, PR, archive, or final verification action was changed or executed by this Unit 5 slice.

### Task status

- [x] 5.1 Legal pages contain the factual draft; explicit project-maintainer approval recorded below
- [x] 5.2 Factual disclosure and contradiction tests
- [x] 5.3 Operational rollout documentation

### Work Unit Evidence

| Evidence | Exact command/result |
|---|---|
| Mutating format | `docker compose run --rm test pnpm prettier --write src/pages/privacidad.astro src/pages/cookies.astro tests/unit/footer-legal-compose.test.ts docs/phases/auth-rbac-rollout.md`; exit `0`; all four Unit 5 authored files formatted before final checks. A later targeted write normalized the test after the first check identified its source wrapping. |
| Focused legal disclosure test | `docker compose run --rm test pnpm vitest run tests/unit/footer-legal-compose.test.ts`; exit `0`; 1 file, 6 tests passed, 0 failed. |
| Full Vitest | `docker compose run --rm test pnpm vitest run`; exit `0`; 16 files, 59 tests passed, 0 failed. |
| Astro check | `docker compose run --rm test pnpm check`; exit `0`; 0 errors, 0 warnings, 2 pre-existing hints in `src/components/About.astro`. |
| ESLint | `docker compose run --rm test pnpm eslint .`; exit `0`; no diagnostics. |
| Selected Prettier | `docker compose run --rm test pnpm prettier --check src/pages/privacidad.astro src/pages/cookies.astro tests/unit/footer-legal-compose.test.ts docs/phases/auth-rbac-rollout.md`; exit `0`; all selected files matched. |
| Preview build | `docker compose build preview`; exit `0`; static Astro build completed and generated `/privacidad` and `/cookies`. |
| Preview runtime harness | `docker run --rm teamjobs-landing-preview:latest nginx -t`; exit `0`; nginx configuration syntax valid. A temporary real preview container served `/privacidad/` and `/cookies/` with HTTP `200`; normalized response bodies contained the expected Spanish factual markers for account/Supabase/local storage/password/contact and cookie/session disclosures; the container was removed afterward. |
| Static diff check | `git diff --check`; exit `0`; no whitespace errors. |
| Migration and local harness evidence consumed | Unit 1 retained local migration reset, 42/42 pgTAP, and advisors `No issues found`; Units 3–4 retained the same-absolute-host-path local Supabase/browser evidence. Unit 5 did not rerun or mutate those database/browser behaviors. |
| Rollback boundary | Revert exactly `src/pages/privacidad.astro`, `src/pages/cookies.astro`, the Unit 5 additions to `tests/unit/footer-legal-compose.test.ts`, `docs/phases/auth-rbac-rollout.md`, the Unit 5 checkbox/evidence additions in `tasks.md`, and this Unit 5 section. This removes only the factual legal draft, its contract test, rollout guidance, and evidence; it leaves Units 1–4 and all runtime/auth/RLS/blog behavior intact. |

### Draft review gate

#### Included in the Spanish draft

- Public email/password accounts processed through Supabase Auth.
- Browser-local session persistence through `localStorage`; no claim that this application uses an authentication cookie.
- Profile public name, database role, and suspension state as data used for display and access control.
- Authored Markdown posts, editor ownership of drafts, administrator management, and published-only public projection fields.
- Purpose and access boundaries, including exclusion of email, role, and suspension state from the public blog projection.
- No plaintext password storage by this application, the existing visual-only contact form contract, and the verified email, phone, WhatsApp, address, privacy-contact, and applicable-rights contact path.

#### Deliberately excluded

- Retention periods, legal bases, certifications, consent claims, cross-border guarantees, deletion automation, and unsupported account/content features.
- Any service-role key, project-private value, real administrator identity, remote migration result, or claim that hosted rollout occurred.

### Deviations and issues

- **Design deviation:** None for the implementation facts; at the draft-slice checkpoint the legal-page copy was intentionally unapproved. Task 5.1 approval is recorded in the finalization section below.
- The first focused test exposed a source-whitespace assumption in the new assertions; the test was corrected to normalize source whitespace and then passed. No production behavior was changed for that correction.
- The existing README still contains historical pre-auth integration statements. It was read for conventions but not changed because the assigned boundary calls for one focused operations document and no broader README rewrite.
- No unresolved implementation issue remains. The two Astro hints are pre-existing and outside this Unit 5 boundary.

### Current task gate

Tasks 1.1–1.5, 2.1–2.4, 3.1–3.5, 4.1–4.4, and 5.1–5.3 are checked in `tasks.md`; all Units 1–5 task/evidence records remain preserved above. The change is **21/21 tasks checked**, with zero remaining tasks, and is ready for `sdd-verify` (not archive).

## Task 5.1 Human Approval Finalization

- **Attempt:** `proceed` for `unit-5-legal-approval-finalization`; evidence goal `maintainer-approval-recorded-task-5-1-complete-all-tasks-ready-for-verify`; maximum 1 attempt / 50 changed lines. The parent retains and settles the token; no `sdd-attempt` was called.
- **Approval record:** On 12 August 2026, during session `sdd-apply-auth-rbac-blog-authoring-task-5-1-finalization-20260811`, the project maintainer explicitly selected **“Aprobar ambos textos”** for `src/pages/privacidad.astro` and `src/pages/cookies.astro`.
- **Bounded meaning:** This records project-maintainer approval of the current factual drafts only; it is not legal certification or an external-counsel opinion.
- **Unchanged draft identity:** Both approved legal pages were read back before and after finalization and remained unchanged. SHA-256: privacidad `f627319f0ba844f04373269e7fa69562646ff8d4a07976b39fd65ecf77a6dadc`; cookies `b1c6b0e2aabf818b1d5d4776638445374906eb63dbb82b3e2d91315e2a3d3d87`.
- **State:** Complete; cumulative status **21/21**; zero remaining tasks; ready for `sdd-verify`.

### Final Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused evidence | Explicit maintainer approval plus unchanged legal-draft readback; both approved page hashes remained identical before and after this planning-only finalization. |
| Runtime harness | `N/A` — this finalization changes only the planning checkbox/evidence. The immediately preceding bounded Unit 5 attempt already recorded focused legal tests `1 file, 6 passed, 0 failed`, preview build exit `0`, nginx `-t` exit `0`, and real preview HTTP `200` for `/privacidad/` and `/cookies/`. |
| Rollback boundary | Revert only the 5.1 checkbox in `tasks.md` and this approval note/finalization evidence in `apply-progress.md`; do not revert either legal page or any Unit 1–5 implementation/evidence. |

## Post-verification Documentation Warning Correction

- **Attempt:** Fresh `proceed` for `verification-doc-warning-correction`; evidence goal `approval-state-docs-current-verification-warning-resolved`; maximum 1 attempt / 40 changed lines. The parent retains/settles the token; no `sdd-attempt` was called.
- **Human decision:** After final verification reported exactly one WARNING, the maintainer explicitly chose **“Corregir antes de archivar”**.
- **Approval record:** The project maintainer approved both current factual Spanish drafts on 12 August 2026. This is project approval only, not legal certification or external-counsel review; external legal review remains optional/future and is not claimed as completed.
- **Correction scope:** Updated only approval-state wording in `design.md` and `docs/phases/auth-rbac-rollout.md`, plus this cumulative evidence note. Tasks, verify-report, source/legal copy, tests, application, migrations, environment, and runtime behavior were not changed.
- **Changed-line count:** 31 authored additions/deletions across this bounded correction; within the 40-line cap.
- **State:** Complete — the warning is addressed; cumulative task status remains **21/21**, and `verify-report.md` remains unchanged pending `sdd-verify` refresh.

### Work Unit Evidence

| Evidence | Exact result |
|---|---|
| Focused documentation readback/grep | `docker compose run --rm test pnpm prettier --check openspec/changes/auth-rbac-blog-authoring/design.md docs/phases/auth-rbac-rollout.md openspec/changes/auth-rbac-blog-authoring/apply-progress.md`; exit `0`, all 3 files matched. `grep -En -i 'pending.*(maintainer|approval)|approval.*pending|maintainer.*(pending|must approve)|aprobaci.n.*pendiente|pendiente.*aprobaci.n|debe aprobar' openspec/changes/auth-rbac-blog-authoring/design.md docs/phases/auth-rbac-rollout.md`; exit `1` with no matches, accepted by the wrapper as the expected no-match result. |
| Runtime harness | `N/A` — passive Markdown documentation only; no runtime behavior or boundary changed. |
| Static diff check | `git diff --check`; exit `0`; no whitespace errors reported. |
| Rollback boundary | Revert only the approval-state lines in `design.md` and `auth-rbac-rollout.md`, the corrected approval date, and this post-verification evidence section. |

## Corrección focalizada posterior a verificación: entidad CSS

- **Unidad de trabajo:** `post-verify-css-entity-fix`; corrección automática encadenada, acotada a un único defecto y a menos de 80 líneas modificadas.
- **Estado nativo y liquidación:** `gentle-ai sdd-attempt status` reporta `complete` y `next_action: complete`; el token `sha256:318157c33f195bdb8e9f72311747c898ec56755debf3bb47f1964cdd95a54981` se liquidó exactamente una vez con estado `complete` y resultado `passed`, solicitud `css-entity-fix-settle-20260812-01`, revisión de evidencia `sha256:93cbd42bc37930f0bbbe6c9fe33d0bcf93c1a4e0fa37ebb71fcc893d61f375c8` y harness reutilizado. No permanece autoridad activa; no se adquirió otra autoridad ni se creó una línea de remediación.
- **Diagnóstico probado:** la variante Tailwind arbitraria `[&::-webkit-details-marker]:hidden` en `src/islands/MobileNav.tsx` era la entrada que el pipeline dev de Astro/Vite/Tailwind incorporaba al CSS importado de `global.css`; en dev se convertía en `&amp` y PostCSS fallaba en la línea generada 1905. El build estático no reproducía el fallo porque usa una ruta de generación distinta.
- **Corrección causal:** se sustituyó la variante arbitraria por `summary-marker-hidden` y se añadió la regla equivalente `.summary-marker-hidden::-webkit-details-marker` en `src/styles/global.css`; se añadió una aserción de regresión en `tests/unit/navigation.test.ts`.
- **Formateo mutante previo a las comprobaciones finales:** `docker compose run --rm test pnpm prettier --write src/islands/MobileNav.tsx src/styles/global.css tests/unit/navigation.test.ts`; salida `0`, los archivos quedaron formateados.

### Evidencia de la unidad

| Evidencia | Resultado exacto |
|---|---|
| Reproducción Playwright inicial | Playwright `v1.58.2` en Docker contra el servidor dev Docker en `127.0.0.1:4321`: `/` y `/blog/` devolvieron HTTP `500`, título `CssSyntaxError`, consola `Failed to load resource: ... 500`; el log del servidor confirmó `[postcss] /app/src/styles/global.css:1905:5: Unknown word &amp`. |
| Fuente causal | `src/islands/MobileNav.tsx` contenía la única variante CSS arbitraria con `&`; no había `&amp` literal en `src/styles/global.css` ni en las entradas de contenido inspeccionadas. |
| Reproducción corregida | Tras reiniciar el contenedor dev para invalidar la caché incremental, Playwright Docker obtuvo HTTP `200` y títulos correctos para `/` y `/blog/`, sin errores de consola, página ni solicitudes fallidas. |
| Bytes CSS corregidos | La fuente `global.css` quedó sin `&amp` ni la variante arbitraria; SHA-256 de sus bytes: `654548020d3873f68d84ca93b22a4e92d9492d7bf8716e07bc6d0c48b26ca7ec`. El módulo CSS servido devolvió `200`, cero coincidencias `&amp`, y la regla `summary-marker-hidden` en el índice `52471`; SHA-256 generado: `4be1619ef1fc3513db01f3d0c38c9b0c70ed3dc4477030921b4d4af3c649c6d9`. |
| Prueba enfocada | `docker compose run --rm test pnpm vitest run tests/unit/navigation.test.ts`; salida `0`, 1 archivo y 4 pruebas pasaron, 0 fallaron. |
| Playwright existente | `docker compose run --rm test pnpm test:browser`; salida `0`, 6 escenarios pasaron en nginx real, incluyendo blog, sanitización y ausencia de errores de página/consola. |
| Comprobaciones finales | `docker compose run --rm test pnpm vitest run`: `16` archivos y `59` pruebas pasaron; `docker compose run --rm test pnpm check`: 0 errores, 0 warnings y 2 hints preexistentes en `About.astro`; ESLint, Prettier seleccionado, `docker compose build preview`, `docker compose config --quiet` y `git diff --check`: salida `0`. |
| Limpieza | El harness eliminó su contenedor de preview, detuvo Supabase por proyecto y no dejó contenedores de prueba ni navegadores; solo permanece el contenedor dev preexistente `teamjobs-landing-dev-1`, necesario para el entorno de desarrollo. |

### Límite de reversión

Revertir exactamente `src/islands/MobileNav.tsx`, la regla añadida en `src/styles/global.css`, la regresión de `tests/unit/navigation.test.ts` y esta sección de evidencia. Esto restaura la variante Tailwind que causa el fallo y elimina únicamente esta corrección y su prueba; no modifica las 21 tareas completadas ni el resto del cambio.

### Estado de verificación SDD

Las casillas de `tasks.md` permanecen sin cambios en `21/21`; no se inventó una remediación ni se modificó `verify-report.md`. El reporte previo conserva la evidencia anterior, por lo que se requiere una nueva ejecución formal de `sdd-verify` antes de archivar para admitir esta corrección de código.
