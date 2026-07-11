#!/usr/bin/env bash
# Local version of the autonomous loop (spec step 3) — for when you want the
# agent working the backlog from your machine instead of GitHub Actions.
#
# Usage:
#   ./scripts/agent-loop.sh        # one iteration: pick top issue, implement, PR
#   ./scripts/agent-loop.sh 5      # up to 5 iterations back-to-back
#
# Requires: gh (authenticated) and the claude CLI, run from the repo root.

set -euo pipefail
ITERATIONS="${1:-1}"

for i in $(seq 1 "$ITERATIONS"); do
  echo "=== Agent loop iteration $i/$ITERATIONS ==="
  git checkout main && git pull --ff-only

  ISSUE=$(gh issue list --state open --label agent-ready --json number,title,labels \
    --jq 'map(select((.labels | map(.name) | index("in-progress") | not) and (.labels | map(.name) | index("blocked") | not)))
          | sort_by(.labels | map(.name) | if index("priority:P0") then 0 elif index("priority:P1") then 1 elif index("priority:P2") then 2 else 3 end)
          | .[0] // empty | "\(.number)\t\(.title)"')

  if [ -z "$ISSUE" ]; then
    echo "No actionable issues in the backlog. Done."
    exit 0
  fi

  NUMBER="${ISSUE%%$'\t'*}"
  TITLE="${ISSUE#*$'\t'}"
  echo "Picked issue #$NUMBER: $TITLE"

  claude -p "Work GitHub issue #$NUMBER exactly as described in CLAUDE.md:
read docs/ first, create branch issue-$NUMBER-<slug>, satisfy every acceptance
criterion, add tests, run 'npm run check' until green, commit, push, and open
a PR with 'Closes #$NUMBER' in the body. Label the issue in-progress when you
start. If the issue is ambiguous, comment on it asking for clarification and stop." \
    --permission-mode acceptEdits \
    --allowedTools "Bash,Read,Write,Edit,Glob,Grep"
done
