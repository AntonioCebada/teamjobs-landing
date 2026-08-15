# Account Access RBAC Specification

## Purpose

Define account access, application roles, and suspension safeguards.

## Requirements

### Requirement: Reader Account Signup and Session

The system MUST allow email/password signup without mandatory email confirmation and MUST assign each new account the `reader` role. It MUST establish an immediate browser-local session and MUST NOT grant editorial privileges from signup.

#### Scenario: New reader signs up

- GIVEN a visitor supplies valid unused credentials
- WHEN the visitor completes signup
- THEN an authenticated local session is available with role `reader`

#### Scenario: Reader opens editorial area

- GIVEN an authenticated reader
- WHEN the reader requests an editorial action
- THEN the system MUST deny the action

### Requirement: Administrative Role and Suspension Control

The system MUST allow only active admins to change roles or suspend accounts. A suspended account MUST be denied editorial and administrative actions. The system MUST NOT remove or suspend the last active admin.

#### Scenario: Admin assigns editor role

- GIVEN an active admin and an active reader
- WHEN the admin assigns `editor`
- THEN the reader may perform editor-authorized actions

#### Scenario: Non-admin changes a role

- GIVEN an editor and another account
- WHEN the editor attempts to change that account's role or suspension
- THEN the system MUST deny the change

#### Scenario: Last admin protection

- GIVEN exactly one active admin
- WHEN a role change or suspension would remove that admin status
- THEN the system MUST reject the operation
