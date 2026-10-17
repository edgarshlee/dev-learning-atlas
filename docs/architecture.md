# Architecture

## Context

The atlas has two kinds of data with different ownership and change patterns.

1. Curated knowledge is public, reviewable, and forkable.
2. Learning progress is private, frequently updated, and user-owned.

Treating both as database rows would make open-source catalog contributions difficult. Treating both as files would make personal state synchronization difficult. The MVP separates them.

## Containers

| Container | Responsibility |
|---|---|
| Web | Graph, library, search, filters, and progress editing |
| API | Catalog validation, query API, and progress commands |
| Catalog | Versioned topics, prerequisites, resources, and paths |
| PostgreSQL | Mutable personal progress |

## Request flow

```text
Browser
  │
  ├── GET /api/v1/catalog ──► CatalogService ──► catalog.json
  │
  ├── GET /api/v1/progress ─► ProgressService ─► PostgreSQL
  │
  └── PUT /api/v1/progress/{resourceId}
                             └───────────────► PostgreSQL
```

## Important quality attributes

- **Portability:** Docker Compose runs the complete stack.
- **Reviewability:** catalog changes are visible in Git diffs.
- **Safety:** startup validation rejects unknown references and cycles.
- **Simplicity:** single-user progress avoids premature identity infrastructure.
- **Evolvability:** authentication can later add `user_id` without changing the catalog.

## Deliberate constraints

- No multi-user authorization in the MVP
- No server-side page archiving
- No automatic AI tagging
- No distributed cache
- No microservices

These are product decisions, not missing checkboxes. They keep the first release operable by one maintainer.

