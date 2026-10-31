# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create issues with `gh issue create`.
- Read issues with `gh issue view`.
- List issues with `gh issue list`.
- Use GitHub sub-issues and native dependencies where available.
- Comment with `gh issue comment`.
- Apply or remove labels with `gh issue edit`.
- Explain the resolution before closing an issue.
- Infer the repository from `git remote -v`.
- Only create issues in the user's own repository.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Skill operations

- “Publish to the issue tracker” means creating a GitHub issue.
- “Fetch the relevant ticket” means reading the corresponding GitHub issue.
- `/wayfinder` uses a parent issue as its map and sub-issues as tickets.
- Blocking relationships use GitHub's native issue dependencies where available.
