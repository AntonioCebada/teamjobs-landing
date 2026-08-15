# Account Privacy Disclosure Specification

## Purpose

Define accurate account and session disclosures.

## Requirements

### Requirement: Truthful Account and Session Notice

The privacy and cookie disclosures MUST accurately state that accounts process email/password credentials, profile role data, and browser-local session data, including their purpose, retention, and available user-rights contact path. They MUST NOT claim that the site has no registration or authentication.

#### Scenario: Visitor reviews disclosures

- GIVEN accounts and browser-local sessions are enabled
- WHEN a visitor reads the privacy and cookie disclosures
- THEN the disclosures describe those practices truthfully

#### Scenario: Unsupported feature disclosure

- GIVEN email confirmation, SMTP, Auth bans, images, comments, and advanced categories are unavailable
- WHEN a visitor reads the disclosures
- THEN the disclosures MUST NOT state that those features are provided
