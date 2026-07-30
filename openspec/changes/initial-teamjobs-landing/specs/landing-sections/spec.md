# landing-sections Specification

## Purpose

The six content sections of the single landing page, rendered as static Astro components with Spanish-first copy extracted from `design/mockups/`, responsive layout, and labeled placeholders for assets design has not supplied.

## Requirements

### Requirement: Section inventory and order

The page MUST render, in order: Hero (`#inicio`), Quiénes somos (`#nosotros`), Solutions (`#servicios`, 4 cards), Empresas process + logo carousel (`#empresas`, 4 steps), Recursos (`#recursos`, 3 article cards), Consulta Gratuita CTA band, and Contact (`#contacto`). Each section MUST have an `id` matching its nav anchor and an accessible heading.

#### Scenario: Full page render

- GIVEN the built page
- WHEN rendered top to bottom
- THEN all sections appear in the specified order with matching anchor ids

### Requirement: Spanish-first content

All visible UI copy MUST be Spanish, extracted from the mockups into a content module (not hard-coded per component). Language-flag UI MAY be present but ES is the only content locale; flags SHALL NOT switch content in v1.

#### Scenario: Spanish locale

- GIVEN the rendered page
- WHEN copy is inspected
- THEN text is Spanish and the document declares `lang="es"`

### Requirement: Mockup content fidelity

Quiénes somos MUST include the mascot card with "15K+ Candidatos", value chips, Misión/Visión cards, and "Hablemos de tu empresa" CTA. Solutions MUST show exactly the 4 mocked cards, each with "Conocer más". Empresas MUST show the 4 process steps and "Quiero contratar talento" CTA. Recursos MUST show 3 static article cards with category, title, read time, date, and excerpt.

#### Scenario: Solutions grid

- GIVEN the Solutions section
- WHEN rendered
- THEN exactly four cards appear with the mocked titles and a "Conocer más" affordance each

### Requirement: Placeholder content for missing assets

Client logos in the carousel, blog card art, and section icons MUST render as labeled placeholders until design supplies files. Placeholder company names SHALL NOT imply real third-party trademarks.

#### Scenario: Blog card art

- GIVEN no blog images exist
- WHEN Recursos renders
- THEN cards display labeled placeholder art instead of broken images

### Requirement: Responsive layout

No mobile mockups exist, so sections MUST follow standard responsive interpretation: stacked hero (copy then media), single-column cards, vertical process stepper on small viewports, and full-width contact layout. Content MUST remain readable without horizontal scrolling at 320px width.

#### Scenario: Mobile viewport

- GIVEN a 360px-wide viewport
- WHEN the page renders
- THEN sections stack vertically with no horizontal overflow
