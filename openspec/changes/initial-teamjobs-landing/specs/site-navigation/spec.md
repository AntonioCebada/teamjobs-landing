# site-navigation Specification

## Purpose

Sticky navbar (desktop links + mobile menu), in-page anchor navigation, footer link columns, external URL placeholders, and the floating WhatsApp button — all driven by a central config of documented placeholder URLs.

## Requirements

### Requirement: Navbar with in-page anchors

The sticky navbar MUST contain the logo and links Inicio, Nosotros, Servicios, Vacantes, Empresas, Recursos, Contacto, plus "Iniciar sesión". In-page links MUST scroll to their section anchors. On small viewports the links MUST collapse into a hamburger menu.

#### Scenario: Anchor navigation

- GIVEN the rendered page
- WHEN a user activates "Nosotros"
- THEN the viewport scrolls to `#nosotros`

#### Scenario: Mobile menu

- GIVEN a mobile viewport
- WHEN the user opens the hamburger menu
- THEN the full link list appears and can be dismissed

### Requirement: External URL placeholders

Vacantes, Iniciar sesión, social profiles, and legal links MUST resolve from a central config of placeholder URLs. Placeholders SHALL be documented as intentional no-ops/`#` until product supplies destinations.

#### Scenario: Placeholder resolution

- GIVEN no real URLs configured
- WHEN a placeholder link renders
- THEN its `href` comes from the central config and is documented as a placeholder

### Requirement: Footer columns

The footer MUST render the mocked columns: navigation, services list, contact info, and legal links, with copyright "© 2026". The footer services list MAY differ from the four solution cards; both MUST render as mocked (known taxonomy inconsistency).

#### Scenario: Footer render

- GIVEN the footer
- WHEN rendered
- THEN all four columns and the copyright notice are present

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
