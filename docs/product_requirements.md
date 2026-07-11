# Product Requirements

> This document is the source of truth for WHAT we are building.
> It is maintained by the product owner (you, optionally with an LLM acting as PM).
> The AI coding agent reads this before picking up any issue.
>
> **PM prompt to generate the backlog:**
> "Read docs/product_requirements.md and docs/architecture.md. Generate a
> prioritized list of GitHub issues with acceptance criteria. Output each issue
> as a title, a body, and a priority label (priority:P0 / P1 / P2)."

## Vision

<!-- One paragraph: what is this product and who is it for? -->

_TODO: Describe the product._

## Users

<!-- Who uses it? What are their goals? -->

| Persona | Goal   |
| ------- | ------ |
| _TODO_  | _TODO_ |

## Features

<!-- Each feature here should eventually become one or more GitHub issues. -->

### F1: _Feature name_

- **Description:** _What it does._
- **Acceptance criteria:**
  - [ ] _Observable behavior 1_
  - [ ] _Observable behavior 2_
- **Priority:** P0 | P1 | P2

## Non-goals

<!-- Explicitly out of scope. The agent must NOT build these. -->

- _TODO_

## Constraints

- All features must ship with unit tests.
- All user-facing errors must be actionable.
