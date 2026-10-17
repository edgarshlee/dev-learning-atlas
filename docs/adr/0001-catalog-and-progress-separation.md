# ADR-001: Separate public catalog data from personal progress

- Status: Accepted
- Date: 2026-10-17

## Context

Learning topics, prerequisite relationships, and recommended resources should be open to review and contribution. Reading progress and notes change frequently and may contain private information.

## Decision

Store the public catalog as version-controlled JSON bundled with the API. Store personal progress in PostgreSQL.

## Consequences

### Positive

- Resource additions are ordinary pull requests.
- Catalog history is transparent.
- Personal progress updates do not create Git noise.
- The catalog can be forked independently of the hosted service.

### Negative

- Catalog changes require an application release.
- Referential integrity crosses the file/database boundary.
- Deleted resource IDs require a migration or compatibility policy.

## Follow-up

If catalog release frequency becomes a bottleneck, move it to a separately versioned artifact or repository before considering a database authoring UI.

