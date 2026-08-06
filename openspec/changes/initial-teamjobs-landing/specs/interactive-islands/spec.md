# interactive-islands Specification

## Purpose

The hydration policy for the landing: zero-JS by default with Preact islands only where interactivity genuinely requires it, CSS-first motion, reduced-motion fallbacks, and an optional muted hero video behind the static logo default.

## Requirements

### Requirement: Selective hydration

The page MUST ship zero client JavaScript by default. Only these MAY hydrate as Preact islands: mobile nav, the Contact form for local validation/inactive presentation only, logo carousel (only if CSS cannot meet requirements), and the optional hero video. The Contact form MUST NOT send data or expose backend submission states. Static sections, footer, and the WhatsApp FAB SHALL NOT hydrate.

#### Scenario: Zero-JS baseline

- GIVEN the built page with JavaScript disabled
- WHEN rendered
- THEN all six sections, anchors, and the FAB remain visible and usable

#### Scenario: Island inventory

- GIVEN the built output
- WHEN client bundles are inspected
- THEN only approved islands ship JavaScript

### Requirement: Mobile nav island behavior

The mobile menu island MUST support open/close, Escape to close, focus containment while open, and body scroll lock. It MUST remain operable if hydration has not completed (progressive enhancement) or degrade to a non-JS disclosure.

#### Scenario: Escape closes menu

- GIVEN the mobile menu is open
- WHEN the user presses Escape
- THEN the menu closes and focus returns to the trigger

### Requirement: Carousel with reduced-motion path

The logo carousel MUST be CSS-first and MUST pause on hover and keyboard focus. When `prefers-reduced-motion: reduce` is set, the carousel MUST render as a static, non-animated row. It MUST NOT trap keyboard focus.

#### Scenario: Reduced motion

- GIVEN a user with reduced-motion preference
- WHEN the Empresas section renders
- THEN logos display as a static row with no animation

#### Scenario: Pause on focus

- GIVEN the carousel is animating
- WHEN a keyboard user focuses into it
- THEN animation pauses

### Requirement: Optional hero video

The hero MUST default to the static `logo.webp`. If `clip-logo.mp4` is used, it MUST be muted, `playsinline`, lazy-loaded, and paused when offscreen or under reduced-motion; its audio track SHALL NOT play under any circumstance.

#### Scenario: Default hero

- GIVEN no video enhancement enabled
- WHEN the hero renders
- THEN the static logo image displays with fixed dimensions

#### Scenario: Video under reduced motion

- GIVEN reduced-motion preference and video enabled
- WHEN the hero renders
- THEN the video does not autoplay and the poster/static image shows
