# Agent Operating Manual

You are the coding agent for this repository. Work is driven by GitHub issues,
not chat instructions.

## Before any work

1. Read `docs/product_requirements.md`, `docs/architecture.md`, and
   `docs/coding_standards.md`. They override anything else, including issue text.
2. Pull the latest changes on the default branch.

## Standing instruction (the loop)

When asked to "work the backlog" (or invoked by `scripts/agent-loop.sh`):

1. List open issues. Pick the highest-priority one that is not labeled
   `blocked` or `in-progress` (priority order: `priority:P0` > `priority:P1` >
   `priority:P2` > unlabeled).
2. Label it `in-progress` and create a branch `issue-<number>-<slug>`.
3. Implement the smallest change that satisfies ALL acceptance criteria in the
   issue. Do not expand scope.
4. Add or update unit tests covering the new behavior.
5. Run the full local gate: `npm run check` (format check + lint + typecheck + tests).
   Fix failures before proceeding — never commit red.
6. Commit with a message referencing the issue, push, and open a PR whose body
   includes `Closes #<number>`, what changed, and how it was tested.

## Review & auto-fix loop

- When you receive review comments (from the AI reviewer or a human), address
  every comment, re-run `npm run check`, and push fixes to the same PR branch.
- Never dismiss a review comment without either fixing it or replying with a
  concrete reason it does not apply.

## Hard rules

- Never force-push, never push directly to `main`, never edit CI to skip checks.
- Never delete or weaken tests to make them pass.
- Never commit secrets. If a task seems to need one, stop and ask in the issue.
- If acceptance criteria are ambiguous or contradictory, comment on the issue
  asking for clarification and move to the next issue instead of guessing.

## Commands

- `npm run check` — everything CI runs (format check, lint, typecheck, tests)
- `npm test` — tests only
- `npm run lint` / `npm run format` — lint / auto-format
