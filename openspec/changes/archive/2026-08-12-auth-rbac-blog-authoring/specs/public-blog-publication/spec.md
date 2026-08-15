# Public Blog Publication Specification

## Purpose

Define public browser-loaded blog list and detail behavior.

## Requirements

### Requirement: Published Content Visibility

The system MUST provide browser-loaded `/blog` and `/blog/:slug` views containing only published posts. It MUST NOT expose drafts or archived posts to public visitors and does not guarantee search-engine indexability.

#### Scenario: Visitor opens published post

- GIVEN a published post with a unique slug
- WHEN a visitor opens its detail route
- THEN the system displays that post

#### Scenario: Visitor requests non-public post

- GIVEN a draft, archived, or unknown slug
- WHEN a visitor opens its detail route
- THEN the system returns a not-found state without post content

#### Scenario: No published posts exist

- GIVEN no published posts
- WHEN a visitor opens `/blog`
- THEN the system displays an empty state

### Requirement: Safe Public Author Rendering

The system MUST render post Markdown without executing supplied active content and MUST display the author's public profile name without exposing email addresses.

#### Scenario: Post contains unsafe markup

- GIVEN a published post containing executable or unsafe markup
- WHEN a visitor views the post
- THEN the markup MUST NOT execute or create an unsafe link
