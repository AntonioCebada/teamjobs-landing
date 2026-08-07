# Blog UI correction

`/blog` now presents a dense, static editorial canvas that follows the TeamJobs visual language from `mockups/blog.jpeg` while keeping the rest of the site on its existing layout contract. Cards remain honest CSS placeholders: they expose only the publisher and reading time visually, with no post images or inactive interactions.

## Quick path

1. Open `http://localhost:4321/blog` from the `Contenido` navbar access.
2. Check the exact heading, full-card placeholder treatment, and vacancy panel.
3. Resize through `390x844`, `1920x1080`, and `2560x1440`; confirm the restrained intro scale expands with the local canvas, the column count grows, and there is no horizontal overflow.
4. Run the verification commands below before merging this work unit.

## Approved requirements and acceptance criteria

| Requirement                  | Acceptance criterion                                                                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static frontend-only blog UI | `/blog` remains a static Astro route with the shared navbar and footer.                                                                                                               |
| Exact heading                | The visible `h1` is exactly `Explora contenido de interés`, sourced from `siteContent.blog.title`; the former split heading is not assembled.                                         |
| Full-width responsive intro  | The intro wrapper, title, and subtitle use the available blog canvas width; narrow heading/subtitle max-width constraints are removed and typography/spacing scale fluidly.           |
| Page-only wide canvas        | Only the blog content canvas uses the viewport width with responsive gutters; the shared `page-shell`, navbar, footer, and landing routes retain their normal max-width presentation. |
| Full-card placeholders       | Every publication card is one bordered CSS placeholder filling the card interior inside its preserved 1px border; no `<img>`, post URL, or fake image source is rendered.             |
| Editorial visibility         | Card text is limited to `TeamJobs` and the post reading time. Titles remain only as accessible card names; descriptions, categories, and dates are not rendered in cards.             |
| Metadata overlay             | Publisher and reading time sit at the bottom of each full-card visual area over a dark readable gradient with white text.                                                             |
| Responsive masonry           | CSS-native columns use `break-inside: avoid`, varied card heights, and 1/2/3/4/5/6 columns from mobile through ultrawide widths.                                                      |
| Supporting UI                | Visual-only search, static categories, and the supporting vacancy panel remain present and non-functional.                                                                            |
| Accessibility                | Cards have useful accessible names, placeholders use honest `role="img"` semantics without a fake URL, and the page keeps named landmarks and focus behavior.                         |

## Design decisions

| Area                  | Decision                                                                                                                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route and heading     | Keep `/blog`; centralize the exact heading in `src/content/site.ts` as `blog.title`.                                                                                                                                                                                            |
| Intro sizing          | Keep the intro local to `.blog-page-canvas`; `.blog-intro`, `.blog-intro-title`, and `.blog-intro-subtitle` use `width: 100%` and `max-width: none`, while restrained `clamp()` scales the title from 36px to 64px, the subtitle from 16px to 20px, and their vertical spacing. |
| Canvas boundary       | Use a local `.blog-page-canvas` with `width: 100%`, `max-width: none`, and `clamp()` gutters. Do not change `BaseLayout` sizing or the global `page-shell` utility.                                                                                                             |
| Card semantics        | Give each non-interactive `<article>` an accessible name from `post.title`; keep the placeholder as a CSS-only `role="img"` region with no visible editorial label.                                                                                                             |
| Placeholder treatment | Position the bordered placeholder absolutely with `inset: 0`, so it occupies the card interior. The 1px card border remains the outer geometry; `data-layout` values control varied heights.                                                                                    |
| Metadata overlay      | Render only `post.author` and `post.readingTime` in a bottom overlay. A navy gradient, white text, and text shadow preserve contrast over every placeholder tone.                                                                                                               |
| Masonry/reflow        | Use CSS multi-column flow with `break-inside: avoid`: 1 column by default, 2 at `40rem`, 3 at `64rem`, 4 at `90rem`, 5 at `120rem`, and 6 at `150rem`. No JavaScript measures or positions cards.                                                                               |

## Explicit non-goals and deferred functionality

- No backend, database, CMS, publishing workflow, or post detail route.
- No filtering, category behavior, bookmarks, reactions, pagination, vacancy application flow, or functional search.
- No post image assets, new image assets, or framework/UI library.
- No card links, buttons, hover actions, or interactive affordances.
- No OpenSpec/SDD artifact was created or modified for this direct correction.

## Implementation map

- `src/content/site.ts` — centralized exact blog heading and retained publication data for card naming/future scaffolding.
- `src/components/BlogPage.astro` — page-only wide canvas, full-width fluid intro, full-card placeholders, bottom metadata overlay, and responsive CSS columns.
- `tests/unit/blog.test.ts` — heading, page-only width, no-editorial-rendering, placeholder/overlay, and dense-column contracts.
- `docs/phases/blog-ui.md` — this non-SDD traceability record.

## Verification evidence

### Automated checks

- `docker compose run --rm test pnpm exec prettier --write src/components/BlogPage.astro src/content/site.ts tests/unit/blog.test.ts docs/phases/blog-ui.md` — passed; intended `/blog` source, test, and documentation files normalized.
- `docker compose run --rm test pnpm vitest run tests/unit/blog.test.ts` — passed; 9 tests.
- `docker compose run --rm test pnpm exec prettier --check src/components/BlogPage.astro src/content/site.ts tests/unit/blog.test.ts docs/phases/blog-ui.md` — passed; all intended `/blog` source, test, and documentation files matched Prettier.
- `docker compose run --rm test pnpm build` — passed; 4 static pages built, including `dist/blog/index.html`.
- `git diff --check` — passed; no whitespace errors.
- `git status --short` — final worktree contains only the intended `/blog` source, centralized content, focused test, and traceability documentation; no transient Playwright artifacts remain.

### Browser verification

The repository's existing `dev` service was already running at `http://127.0.0.1:4321`; this correction did not start or stop a service. The named session used `playwright-cli -s=blog-scope-correction` with `.playwright/cli.config.json`. Snapshots and `eval` measurements confirmed the exact heading, CSS-configured column count, populated card x positions, interior placeholder coverage inside the preserved border, no horizontal overflow, and no application console errors or warnings.

| Viewport    | Canvas / feed measurement                             | CSS configured columns | Occupied card x positions      | Card measurement                                      | Overflow | Console              |
| ----------- | ----------------------------------------------------- | ---------------------: | ------------------------------ | ----------------------------------------------------- | -------: | -------------------- |
| `390x844`   | canvas `x=0`, `width=390`; content width `358`        |                      1 | 1 (`16`)                       | heights `400, 288, 352, 208, 288, 208, 288, 288, 352` |    `0px` | 0 errors, 0 warnings |
| `1920x1080` | canvas `x=0`, `width=1920`; feed `x=58`, `width=1485` |                      5 | 5 (`58, 359, 661, 963, 1265`)  | width `278`; same varied heights                      |    `0px` | 0 errors, 0 warnings |
| `2560x1440` | canvas `x=0`, `width=2560`; feed `x=64`, `width=2112` |                      6 | 5 (`64, 420, 776, 1132, 1488`) | width `332`; same varied heights                      |    `0px` | 0 errors, 0 warnings |

The browser evaluation also confirmed the exact heading `Explora contenido de interés`, 9 cards, 9 overlays, and interior coverage within the preserved 1px border. At `2560x1440`, six columns are configured in CSS, but the nine current cards occupy five visible x positions because CSS column balancing/content volume leaves the sixth configured column empty. The temporary `.playwright-cli/` snapshots and console logs were removed after inspection; no browser artifacts remain in the worktree.

### Continuation browser evidence: restrained full-width responsive intro

After the scale correction, the named session `playwright-cli -s=blog-intro-scale-correction-20260807` used `.playwright/cli.config.json` against the already-running `http://127.0.0.1:4321/blog`. `data-blog-canvas`, `data-blog-intro`, `data-blog-title`, and `data-blog-subtitle` were measured with `getBoundingClientRect()` and `getComputedStyle()` at each required viewport.

| Viewport    | Canvas bounding box and gutter                   | Intro wrapper bounding box                               | H1 bounding box / computed type                                                          | Subtitle bounding box / computed type                                                | Wrap and overflow                        |
| ----------- | ------------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| `390x844`   | `x=0, y=171, w=390, h=3632`; padding `16px`      | `x=16, y=171, w=358, h=207`; `max-width: none`           | `x=16, y=217.78, w=358, h=76.22`; `36.29px / 38.1045px`; `max-width: none`; 2 lines      | `x=16, y=306, w=358, h=72`; `16px / 24px`; `max-width: none`; 3 lines                | document/body `390px`; horizontal `0px`  |
| `1920x1080` | `x=0, y=137, w=1920, h=992.08`; padding `57.6px` | `x=57.59, y=137, w=1804.81, h=154.08`; `max-width: none` | `x=57.59, y=191.78, w=1804.81, h=55.78`; `53.12px / 55.776px`; `max-width: none`; 1 line | `x=57.59, y=262.92, w=1804.81, h=28.16`; `20px / 28.16px`; `max-width: none`; 1 line | document/body `1920px`; horizontal `0px` |
| `2560x1440` | `x=0, y=137, w=2560, h=1006.02`; padding `64px`  | `x=64, y=137, w=2432, h=168.02`; `max-width: none`       | `x=64, y=191.78, w=2432, h=63.16`; `60.16px / 63.168px`; `max-width: none`; 1 line       | `x=64, y=274.94, w=2432, h=30.08`; `20px / 30.08px`; `max-width: none`; 1 line       | document/body `2560px`; horizontal `0px` |

The mobile title wraps coherently into two lines and the subtitle into three; both use the full `358px` content width. At desktop and ultrawide widths, the title and subtitle each remain on one line while the computed title grows from `53.12px` to `60.16px` and the subtitle remains capped at `20px`. The browser reported no clipping or horizontal overflow. The screenshots at all three viewports show the intro balanced against the category pills, masonry cards, and vacancy panel. The final console check reported 1 error for the repository's existing `/favicon.ico` 404, 0 warnings, and 0 application/runtime errors; that favicon issue is outside this four-file correction boundary.

## Rollback boundary

Remove the correction by reverting only `src/components/BlogPage.astro` for the page-only canvas, full-card placeholders, overlay, and six-column strategy; `src/content/site.ts` for `blog.title`; `tests/unit/blog.test.ts` for the correction contracts; and `docs/phases/blog-ui.md` for this traceability. This restores the prior `/blog` card/heading behavior without touching navbar structure, footer behavior, landing routes, assets, dependencies, persistent Playwright support files, or OpenSpec/SDD artifacts.
