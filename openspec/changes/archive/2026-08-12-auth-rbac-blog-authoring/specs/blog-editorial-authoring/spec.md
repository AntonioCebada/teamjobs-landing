# Blog Editorial Authoring Specification

## Purpose

Define authorized Markdown draft, publication, and archival behavior.

## Requirements

### Requirement: Editor Draft Ownership

The system MUST allow active editors to create and manage only their own Markdown drafts. Editors MUST NOT publish, archive, delete, reassign, or alter another author's post.

#### Scenario: Editor saves own draft

- GIVEN an active editor
- WHEN the editor creates or updates their draft
- THEN the draft is saved as that editor's unpublished post

#### Scenario: Editor targets another draft

- GIVEN an active editor and another author's draft
- WHEN the editor attempts to read or change it
- THEN the system MUST deny access or modification

### Requirement: Administrative Editorial Control

The system MUST allow active admins to manage all posts and transition posts to `published` or `archived`. Suspended editors and admins MUST NOT perform editorial actions.

#### Scenario: Admin publishes a draft

- GIVEN an active admin and any draft
- WHEN the admin publishes it
- THEN the post becomes publicly eligible for display

#### Scenario: Suspended editor saves a draft

- GIVEN a suspended editor
- WHEN the editor attempts to create or update a draft
- THEN the system MUST deny the operation
