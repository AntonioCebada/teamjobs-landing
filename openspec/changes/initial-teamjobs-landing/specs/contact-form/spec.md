# contact-form Specification

## Purpose

The Contact section's Preact form island is visual-only and non-operational for this release slice. It MAY render fields, client-side validation, accessibility feedback, and an explicit inactive notice, but it MUST NOT send data.

## Requirements

### Requirement: Fields and client-side validation

The form MUST include name, email, subject, and message as required fields; phone and company as optional. Validation MUST run locally before any state change: required fields are non-empty and email uses a valid format. Invalid interactions MUST remain on the page and MUST surface per-field error messages.

#### Scenario: Invalid field presentation

- GIVEN the email field contains `not-an-email`
- WHEN the user activates the form control
- THEN no navigation or network activity occurs and an error message appears on the email field

#### Scenario: Valid field presentation

- GIVEN all required fields are valid
- WHEN the user activates the form control
- THEN the form remains in place, displays its inactive notice, and no transport starts

### Requirement: Non-operational form contract

The form MUST expose only idle, invalid, and inactive presentation states. It MUST NOT define or use an endpoint or configurable endpoint, `action`/`method` transport, POST, fetch, request, network call, pending backend state, backend success, backend failure, retry behavior, or any claim that data was sent. The inactive notice MUST state that submission is unavailable and the entered data was not sent.

#### Scenario: No transport

- GIVEN the user completes every required field
- WHEN the user activates the form control
- THEN client-side presentation may run, but no endpoint, POST, fetch, request, or network operation is attempted

#### Scenario: Inactive honesty

- GIVEN the Contact form is rendered or activated with valid fields
- WHEN the status is announced
- THEN the status says the form is not active and that the data was not sent

### Requirement: Form accessibility

Every field MUST have an associated visible label; required fields MUST be announced as required; errors MUST be linked to their field via `aria-describedby`, and the first invalid field MUST receive focus. Fields MUST lay out two-column on desktop and single-column on mobile, with Asunto as a native labeled select.

#### Scenario: Screen reader error announcement

- GIVEN a screen reader user activates the form with an empty required field
- WHEN local validation fails
- THEN focus or an announcement conveys the error tied to that field without leaving the page
