# Coding Standards

> The AI agent and all human contributors must follow these rules.
> CI enforces most of them automatically.

## Language & tooling

- TypeScript, strict mode. No `any` unless justified with a comment.
- Formatting: Prettier (enforced in CI — never hand-format).
- Linting: ESLint (enforced in CI).
- Tests: Vitest. Every new module gets a test file in `tests/`.

## Structure

- Source code lives in `src/`, tests in `tests/`.
- One module = one responsibility. Prefer small files over large ones.
- No circular imports.

## Commits & PRs

- One issue per PR. PR title: `feat: <summary> (#<issue>)` or `fix: ...`.
- PR body must include: what changed, how it was tested, and `Closes #<issue>`.
- All CI checks must pass before merge. Never disable a check to make it pass.

## Testing

- Unit tests for all business logic (aim for the behavior, not the implementation).
- A bug fix must include a regression test that fails without the fix.
- Never delete or weaken a test to make it pass — fix the code instead.

## Security

- No secrets in code, ever. Use environment variables.
- Validate all external input at the boundary.
- Dependencies are managed by Dependabot; do not pin to known-vulnerable versions.
