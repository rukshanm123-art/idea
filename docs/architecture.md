# Architecture

> The AI agent reads this before implementing anything, and must comply with it.
> Update this document FIRST when making architectural decisions — code follows docs.

## Overview

<!-- High-level diagram / description of the system. -->

_TODO: Describe the architecture once the product is defined. Example:_

```
[Client] → [API layer (src/api)] → [Services (src/services)] → [Storage (src/storage)]
```

## Layers

| Layer        | Directory | Rules                      |
| ------------ | --------- | -------------------------- |
| Entry points | `src/`    | Thin; delegate to services |
| _TODO_       |           |                            |

## Key decisions (ADR log)

<!-- Append-only. Newest first. -->

### ADR-001: Repository is the coordination layer for the AI pipeline

- **Date:** 2026-07-11
- **Decision:** All work is driven by GitHub issues; state lives in the repo
  (docs, issues, PRs) — never in chat history. Agents are stateless between runs.
- **Consequence:** Any context an agent needs must be written into an issue,
  a doc in `docs/`, or `CLAUDE.md`.

## Deployment

- **Staging:** auto-deployed from `main` (see `.github/workflows/deploy-staging.yml`).
- **Production:** manual promotion by the product owner only.
