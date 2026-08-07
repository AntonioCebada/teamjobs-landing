# Static Blog UI Phase

TeamJobs now has a reviewable, static `/blog` content surface that establishes the visual language for future editorial work without introducing backend behavior or post assets.

## Quick path

1. Open `/blog` from the `Contenido` navbar access.
2. Resize from mobile through desktop to verify the publication cards reflow as CSS columns.
3. Run the verification commands below before merging this work unit.

## Approved requirements and acceptance criteria

| Requirement                  | Acceptance criterion                                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static frontend-only blog UI | `/blog` builds as a static Astro route and renders the shared navbar and footer.                                                                      |
| Visual reference             | The page follows `mockups/blog.jpeg` with a content heading, topic strip, masonry publications, and a right-side supporting panel.                    |
| Masonry layout               | Publication cards use CSS-native columns and `break-inside: avoid`; card heights vary and reflow at responsive breakpoints without JavaScript layout. |
| No post images               | Every editorial visual area is a bordered, labelled placeholder; no post image asset is added.                                                        |
| Responsive and accessible UI | The page keeps the existing TeamJobs tokens, uses one `h1`, named landmarks, readable focus styles, and honest non-interactive states.                |
| Navbar search                | The navbar includes a prominent visual search landmark labelled as unavailable; it has no input, form action, or search behavior.                     |
| Four navbar accesses         | The order is exactly `Inicio`, `Vacantes`, `Contenido`, `Contacto` in desktop and mobile navigation.                                                  |
| Functional routes            | `Inicio` links to `/`; `Contenido` links to `/blog` and receives the active state on that route.                                                      |
| Deferred accesses            | `Vacantes` and `Contacto` remain visible but render as disabled, non-focusable items without destinations.                                            |
| Landing preservation         | Existing landing sections, content, and interactions remain outside the intentional navbar/navigation contract change.                                |

## Design decisions

| Area                    | Decision                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route and label         | Use `/blog`; use `Contenido` in the navbar because the surface is broader than a future post-detail blog.                                                                          |
| Navbar behavior         | Centralize four primary items in `src/config/site.ts`; only `/` and `/blog` have `href` values. Desktop and hydrated mobile navigation consume the same items and active state.    |
| Search                  | Render a shared visual `role="search"` placeholder with `aria-disabled="true"` and an explicit unavailable status. A non-input shell avoids implying that search works.            |
| Masonry/reflow          | Use CSS multi-column flow with `break-inside: avoid`, one, two, and three columns at responsive widths. No JavaScript measures or positions cards.                                 |
| Placeholder treatment   | Use clean bordered blocks with text labels, tonal backgrounds, and varied minimum heights. These are editorial placeholders, not post imagery.                                     |
| Responsive behavior     | Keep the page-shell and mobile-first layout; move the supporting panel below the feed until the wide layout can place it beside the masonry.                                       |
| Accessibility semantics | Use a shared layout, skip link, one page heading, labelled feed/sidebar landmarks, `time` elements, labelled placeholders, `aria-current="page"`, and explicit disabled semantics. |

## Explicit non-goals and deferred functionality

- No backend, database, CMS, publishing workflow, or post detail route.
- No filtering, category behavior, bookmarks, reactions, pagination, or vacancy application flow.
- No functional search, search input, query state, or API integration.
- No post image assets and no new framework or UI library.
- No OpenSpec/SDD artifacts were created or modified for this direct phase.

## Implementation map

- `src/config/site.ts` — four-item primary navigation contract and honest route/disabled metadata.
- `src/content/site.ts` — centralized navigation/search copy and static blog publication/sidebar data.
- `src/components/Navbar.astro` — desktop header, active state, visual search placement, and shared mobile island wiring.
- `src/components/SearchPlaceholder.astro` — accessible non-functional search shell used at desktop and mobile widths.
- `src/islands/MobileNav.tsx` — responsive navigation disclosure with the same four items and disabled semantics.
- `src/components/BlogPage.astro` — responsive heading, static topic strip, CSS masonry feed, placeholders, and supporting panel.
- `src/pages/blog.astro` — static route composition through `BaseLayout`.
- `src/components/Footer.astro` — shared navigation contract without fake destinations in the footer list.
- `tests/unit/blog.test.ts`, `tests/unit/navigation.test.ts`, and related navigation/contact tests — focused route, structure, semantics, and responsive-layout contracts.

## Verification evidence

- `pnpm exec prettier --write src/config/site.ts src/content/site.ts src/components/Navbar.astro src/components/SearchPlaceholder.astro src/components/BlogPage.astro src/islands/MobileNav.tsx src/components/Footer.astro src/pages/blog.astro tests/unit/navigation.test.ts tests/unit/config.test.ts tests/unit/contact-form.test.ts tests/unit/footer-legal-compose.test.ts tests/unit/blog.test.ts docs/phases/blog-ui.md` — passed; files normalized.
- `docker compose run --rm test pnpm vitest run tests/unit/navigation.test.ts tests/unit/blog.test.ts tests/unit/config.test.ts tests/unit/footer-legal-compose.test.ts tests/unit/contact-form.test.ts` — passed; 5 test files and 20 tests passed.
- `docker compose run --rm test` — passed; 11 test files and 40 tests passed.
- `docker compose run --rm test pnpm check` — passed; 0 errors, 0 warnings, and 2 pre-existing hints in `About.astro`.
- `docker compose run --rm test pnpm lint` — passed; ESLint reported no errors.
- `docker compose run --rm test pnpm format:check` — passed; all files matched Prettier style.
- `docker compose run --rm test pnpm build` — passed; 4 static pages built, including `dist/blog/index.html`.
- `git diff --check` — passed; no whitespace errors.
- `git status --short` and `git diff --stat` — reviewed; only the intended implementation/documentation files are changed and the user-owned `mockups/` remains untouched and untracked.

The host-only Vitest attempt was blocked before startup by a missing optional Rollup native module in the existing root-owned `node_modules`; the repository's Docker test target supplied the final verification environment without changing tracked dependencies.

## Rollback boundary

Revert the files listed in the implementation map to remove the `/blog` surface and this navbar contract as one coherent work unit. Keep `mockups/` untouched. No landing section component, asset, dependency, or OpenSpec/SDD artifact is required to roll back this phase.
