#!/usr/bin/env node
/**
 * Monitoring agent (spec step 8).
 *
 * 1. Hits the staging healthcheck (STAGING_URL/health).
 * 2. Optionally pulls recent errors from ERROR_FEED_URL (any JSON endpoint —
 *    Sentry, your own /errors route, a log aggregator webhook…).
 * 3. Files a GitHub issue (labeled bug + priority:P0/P1 + agent-ready) for
 *    each problem, deduplicating against existing open monitoring issues.
 *
 * Runs in GitHub Actions (see .github/workflows/monitoring.yml) where GH_TOKEN
 * is provided; also runnable locally if `gh` is authenticated.
 */
import { execFileSync } from 'node:child_process';

const STAGING_URL = process.env.STAGING_URL ?? '';
const ERROR_FEED_URL = process.env.ERROR_FEED_URL ?? '';
const ERROR_FEED_TOKEN = process.env.ERROR_FEED_TOKEN ?? '';
const MARKER = '[monitoring]';

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input });
}

function openMonitoringIssueTitles() {
  const raw = gh(['issue', 'list', '--state', 'open', '--search', MARKER, '--json', 'title']);
  return new Set(JSON.parse(raw).map((issue) => issue.title));
}

function fileIssue(existing, title, body, priority) {
  const fullTitle = `${MARKER} ${title}`;
  if (existing.has(fullTitle)) {
    console.warn(`Skipping duplicate issue: ${fullTitle}`);
    return;
  }
  gh([
    'issue',
    'create',
    '--title',
    fullTitle,
    '--body',
    body,
    '--label',
    `bug,agent-ready,priority:${priority}`,
  ]);
  console.warn(`Filed: ${fullTitle}`);
}

async function checkStaging(existing) {
  if (!STAGING_URL) {
    console.warn('STAGING_URL not set — skipping healthcheck.');
    return;
  }
  const url = `${STAGING_URL.replace(/\/$/, '')}/health`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      fileIssue(
        existing,
        `Staging healthcheck returning HTTP ${res.status}`,
        `\`GET ${url}\` returned **${res.status}** at ${new Date().toISOString()}.\n\nInvestigate the staging deployment and recent merges to \`main\`.`,
        'P0',
      );
    } else {
      console.warn('Staging healthcheck OK.');
    }
  } catch (error) {
    fileIssue(
      existing,
      'Staging is unreachable',
      `\`GET ${url}\` failed at ${new Date().toISOString()}:\n\n\`\`\`\n${String(error)}\n\`\`\`\n\nInvestigate the staging deployment.`,
      'P0',
    );
  }
}

async function checkErrorFeed(existing) {
  if (!ERROR_FEED_URL) {
    console.warn('ERROR_FEED_URL not set — skipping error feed.');
    return;
  }
  const headers = ERROR_FEED_TOKEN ? { Authorization: `Bearer ${ERROR_FEED_TOKEN}` } : {};
  const res = await fetch(ERROR_FEED_URL, { headers, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    console.error(`Error feed returned ${res.status} — check ERROR_FEED_URL/TOKEN.`);
    return;
  }
  // Expected shape: [{ title: string, count?: number, detail?: string }, ...]
  const errors = await res.json();
  if (!Array.isArray(errors)) {
    console.error('Error feed did not return an array — adapt scripts/monitor.mjs to its shape.');
    return;
  }
  for (const entry of errors.slice(0, 10)) {
    const count = entry.count ?? 1;
    fileIssue(
      existing,
      `Production error: ${String(entry.title).slice(0, 100)}`,
      `Seen **${count}×** in the error feed.\n\n\`\`\`\n${entry.detail ?? '(no detail)'}\n\`\`\`\n\nFix the root cause and add a regression test.`,
      count >= 50 ? 'P0' : 'P1',
    );
  }
}

const existing = openMonitoringIssueTitles();
await checkStaging(existing);
await checkErrorFeed(existing);
