# site-navigation Specification

> **Current apply boundary:** Footer integration and Privacy/Cookies routes are complete in task 4.2.

## Purpose

Sticky navbar (desktop links + mobile menu), in-page anchor navigation, footer link columns, verified legal routes, and the floating WhatsApp button — all driven by the central site config and Spanish content module.

## Requirements

### Requirement: Navbar with in-page anchors

The sticky navbar MUST contain the logo and links Inicio, Nosotros, Servicios, Empresas, Recursos, and Contacto. In-page links MUST scroll to their section anchors. An unresolved login destination MUST NOT render as a dead link. On small viewports the links MUST collapse into a hamburger menu.

#### Scenario: Anchor navigation

- GIVEN the rendered page
- WHEN a user activates "Nosotros"
- THEN the viewport scrolls to `#nosotros`

#### Scenario: Mobile menu

- GIVEN a mobile viewport
- WHEN the user opens the hamburger menu
- THEN the full link list appears and can be dismissed

### Requirement: Verified destinations

External actions MAY render only when their destination is verified. Unresolved login and social destinations MUST be omitted or rendered as clearly non-interactive text; no active link MAY use `#`. Privacy and cookie links MUST resolve to `/privacidad` and `/cookies` from central config.

#### Scenario: Destination resolution

- GIVEN unresolved login and social destinations
- WHEN the landing renders
- THEN no dead login or social link is present and local legal links point to real routes

### Requirement: Vacancies out of current scope

The current landing MUST NOT define a Vacantes section, route, navigation action, CTA, URL, config key, or requirement. Any original mockup or planning reference to Vacantes is historical evidence only and MUST NOT become a current link.

### Requirement: Footer columns

The footer MUST render the mocked columns: TeamJobs description, current in-page navigation excluding Vacantes, services list, real email/phone/address, and legal links to `/privacidad` and `/cookies`, with copyright "© 2026". Only verified external contact destinations MAY be interactive. The footer services list MAY differ from the four solution cards; both MUST render as mocked (known taxonomy inconsistency).

#### Scenario: Footer render

- GIVEN the footer
- WHEN rendered
- THEN all four columns and the copyright notice are present

### Requirement: Static legal routes

The site MUST provide static Astro routes `/privacidad` and `/cookies` with Spanish SEO titles, one descriptive H1, professional neutral content grounded in the static site's actual behavior, and a navigation link back to `/`. The cookie page MUST NOT claim cookies, tracking, or analytics that the implementation does not use.

#### Scenario: Legal route availability

- GIVEN a production static build
- WHEN `/privacidad` or `/cookies` is opened
- THEN the corresponding document renders with its title, H1, local home link, and shared footer

### Requirement: WhatsApp floating action button

A fixed WhatsApp FAB MUST appear on all viewports, linking to `wa.me` with a configurable phone number defaulting to `+5215610275879`. The FAB MUST be keyboard reachable, have an accessible name, and MUST NOT obscure primary CTAs on small screens (safe-area aware).

#### Scenario: FAB link target

- GIVEN the default config
- WHEN the FAB is activated
- THEN it opens `wa.me/5215610275879` in a new context

#### Scenario: Keyboard access

- GIVEN a keyboard-only user
- WHEN tabbing through the page
- THEN the FAB receives visible focus and announces its purpose
