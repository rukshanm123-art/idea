# Idea — Autonomous AI Coder Pipeline

A repository wired so that **GitHub issues drive an AI coding agent**, with
automated review, quality gates, staging deploys, and monitoring feeding back
into the backlog. Your role: product owner, final approver, budget controller.

## How the loop works

```
 you + LLM-as-PM                    docs/ (requirements, architecture, standards)
        │                                          │ read by
        ▼                                          ▼
 GitHub issues (acceptance criteria) ──► Claude Agent (implements + tests) ──► PR
        ▲                                                                      │
        │ files issues                                                         ▼
 Monitoring agent ◄── staging deploy ◄── merge ◄── you approve ◄── CI gates + AI review
                                                                       │    ▲
                                                                       ▼    │
                                                                  auto-fix loop
```

1. **PM layer** — keep [docs/product_requirements.md](docs/product_requirements.md)
   and [docs/architecture.md](docs/architecture.md) current. Use any LLM to turn
   them into prioritized issues (prompt is at the top of the requirements doc).
2. **Backlog** — issues use the templates in `.github/ISSUE_TEMPLATE/` and carry
   `agent-ready` + `priority:P0/P1/P2` labels.
3. **Agent** — labeling an issue `agent-ready` (or mentioning `@claude` in a
   comment) triggers `.github/workflows/claude-agent.yml`, which implements the
   issue per [CLAUDE.md](CLAUDE.md) and opens a PR. Or run it locally:
   `./scripts/agent-loop.sh`.
4. **Quality gates** — CI runs Prettier, ESLint, typecheck, and tests on every
   PR; CodeQL and Dependabot run on schedule.
5. **AI reviewer** — every PR gets an automated review (security, correctness,
   tests, architecture, performance, maintainability).
6. **Auto-fix loop** — if CI fails on a PR, the agent is asked to fix it
   (max 3 attempts, then it escalates to you).
7. **Staging** — merges to `main` deploy to staging and get smoke-tested.
8. **Monitoring** — every 6 hours, staging health and an optional error feed
   are checked; problems become new `agent-ready` issues. The loop closes.

## One-time setup (after pushing to GitHub)

1. **Install the Claude GitHub App** on the repo: <https://github.com/apps/claude>
   (or run `claude` locally and use `/install-github-app`).
2. **Add repo secret** `ANTHROPIC_API_KEY` (Settings → Secrets and variables →
   Actions). This is what the agent and reviewer bill against — it is your
   budget-control knob.
3. **Create labels** (one-liner):
   ```sh
   gh label create agent-ready -c 5319E7 -d "Agent may pick this up" ;
   gh label create in-progress -c FBCA04 ; gh label create blocked -c D93F0B ;
   gh label create priority:P0 -c B60205 ; gh label create priority:P1 -c D93F0B ;
   gh label create priority:P2 -c 0E8A16
   ```
4. **Branch protection on `main`**: require the `quality-gates` check and 1
   approval (that's you). Settings → Branches → Add rule.
5. Later, when there's something deployable: fill in the deploy step in
   `.github/workflows/deploy-staging.yml` and set the `STAGING_URL` repo
   variable (and optionally `ERROR_FEED_URL` / `ERROR_FEED_TOKEN`).

## Local development

```sh
npm install
npm run check   # everything CI runs: format check, lint, typecheck, tests
```

## Your controls

- **Scope**: only issues you label `agent-ready` get worked.
- **Quality**: nothing merges without green CI + your approval.
- **Budget**: rotate/remove `ANTHROPIC_API_KEY` to pause the whole system;
  the auto-fix loop self-limits to 3 attempts per PR.
