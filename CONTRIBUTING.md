# Contributing

Thank you for helping improve Dev Learning Atlas.

## Development flow

1. Fork the repository.
2. Create a focused branch.
3. Add or update tests where behavior changes.
4. Run API and web checks.
5. Open a pull request describing the problem and design choice.

## Catalog contributions

Catalog changes are intentionally code-reviewed. Add resources to `catalog.json` and keep these rules:

- Prefer primary documentation, respected books, and substantial technical articles.
- Do not add affiliate or tracking query parameters.
- Use a stable, descriptive ID.
- Reuse existing topics when possible.
- Add a new prerequisite only when it is genuinely required.
- Never create cycles in topic prerequisites.

The algorithm roadmap can be refreshed from its Markdown source with `scripts/import-algorithm-roadmap.mjs <markdown-path>`. The importer is idempotent and validates the expected problem and guide counts before writing the catalog.

## Commit style

Use concise conventional prefixes when practical:

```text
feat: add review queue
fix: reject cyclic topic graph
docs: explain catalog schema
```

## Scope discipline

The MVP deliberately excludes web archiving, browser extensions, collaboration, and automatic AI classification. Proposals are welcome, but new infrastructure must solve a demonstrated user problem.

