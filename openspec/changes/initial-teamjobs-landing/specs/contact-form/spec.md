# contact-form Specification

## Purpose

The contact section's Preact form island: client-side validation, explicit submission states, and a pluggable endpoint so the form is honest about not having a production backend yet.

## Requirements

### Requirement: Fields and client-side validation

The form MUST include name, email, subject, and message as required fields; phone and company as optional. Validation MUST run client-side before submission: required fields non-empty and email in valid format. Invalid submissions MUST NOT leave the page and MUST surface per-field error messages.

#### Scenario: Invalid submission blocked

- GIVEN the email field contains "not-an-email"
- WHEN the user submits
- THEN submission is blocked and an error message appears on the email field

#### Scenario: Valid submission proceeds

- GIVEN all required fields are valid
- WHEN the user submits
- THEN validation passes and the submit flow starts

### Requirement: Submission states

The form MUST expose distinct idle, pending, success, and error states. While pending, the submit control MUST be disabled. Success MUST show a confirmation in place of (or alongside) the form; failure MUST show an error message and preserve user input.

#### Scenario: Pending state

- GIVEN a valid submission in flight
- WHEN the request is pending
- THEN the submit button is disabled with a pending indicator

#### Scenario: Failed submission

- GIVEN the endpoint rejects the submission
- WHEN the failure surfaces
- THEN an error message is shown and entered values are preserved

### Requirement: Pluggable submit endpoint

The submit target MUST come from configuration (endpoint URL, or documented fallback such as mailto/no-op). Without a configured endpoint the form MUST still validate and show the success UI as a documented demo behavior — it SHALL NOT claim data was delivered to a real backend.

#### Scenario: No endpoint configured

- GIVEN no endpoint in config
- WHEN a valid submission completes
- THEN the success UI appears and the config documents that no data was sent

### Requirement: Form accessibility

Every field MUST have an associated visible label; required fields MUST be announced as required; errors MUST be linked to their field via `aria-describedby`. Fields MUST lay out two-column on desktop and single-column on mobile, with Asunto as a native labeled select.

#### Scenario: Screen reader error announcement

- GIVEN a screen reader user submits with an empty required field
- WHEN validation fails
- THEN focus or announcement conveys the error tied to that field
