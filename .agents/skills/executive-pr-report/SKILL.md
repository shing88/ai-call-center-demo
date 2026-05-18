---
name: executive-pr-report
description: Use when finishing or documenting a PR where non-engineering stakeholders need to understand what changed, why it mattered, how it was verified, and what remains.
---

# Executive PR Report

## Overview

Create a browser-viewable HTML report for a PR that explains the work to managers and non-engineering stakeholders.

The report should make value, risk reduction, verification, and current status understandable without requiring code knowledge.

## When to Use

Use when:

- A PR is created, updated, merged, or prepared for review.
- The work affects user-visible behavior, workflow, reliability, verification, or project status.
- The user asks for a management-friendly explanation, summary, diagram, report, or "what did we do?" artifact.
- Project rules require a PR-level report.

Do not use for typo-only changes unless the user explicitly asks or project rules require it.

## Output Location

Use the project’s report directory. Common choices:

```text
docs/ai/reports/
docs/superpowers/reports/
docs/reports/
```

Filename format:

```text
YYYY-MM-DD-pr-<number>-<short-topic>-executive-summary.html
```

If the PR number is not available yet:

```text
YYYY-MM-DD-<branch-or-topic>-executive-summary.html
```

## Required Content

Each report should include:

- Executive summary: 3 to 5 plain-language bullets.
- Problem: what pain or risk existed before.
- Solution: what changed, in non-code terms.
- Before / after comparison.
- Timeline or flow diagram for the work.
- Verification evidence: exact test commands and results where available.
- Review / risk handling: subagent review, conflict resolution, or manual checks.
- Current PR state: draft/open/merged, branch, and PR link if available.
- Remaining risks or follow-up items.

## Design Guidelines

- Use a standalone HTML file with embedded CSS.
- Prefer clean cards, timelines, flow diagrams, and compact comparison panels.
- Use restrained colors with strong contrast.
- Keep the first viewport useful: title, date, project, and one-sentence business value.
- Avoid raw implementation dumps.
- Translate implementation details into user impact.
- Include enough technical evidence that engineers can trust the report.
- Make it printable and readable on a normal laptop screen.

## Workflow

1. Collect PR context:
   - PR number.
   - Branch.
   - Merge state.
   - User-facing issue or request.
   - Files touched.
   - Behavior changed.
   - Tests and review outcomes.
2. Draft the report as standalone HTML.
3. Preview the report when possible.
4. Mention the report path in PR notes or final answer.
5. If the report is part of the PR, stage it intentionally.

## Preview

Prefer a repo-local command if one exists, for example:

```bash
npm run preview:report -- docs/ai/reports/<report-file>.html
```

If no preview command exists, open the file in a browser or document why preview was skipped.

## Report Skeleton

```html
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>PR Executive Summary</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.6; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 1rem; margin: 1rem 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
    code { background: #f5f5f5; padding: 0.1rem 0.3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>PR Executive Summary</h1>
  <p><strong>Business value:</strong> ...</p>

  <section class="card">
    <h2>Executive summary</h2>
    <ul>
      <li>...</li>
    </ul>
  </section>

  <section class="grid">
    <div class="card">
      <h2>Before</h2>
      <p>...</p>
    </div>
    <div class="card">
      <h2>After</h2>
      <p>...</p>
    </div>
  </section>

  <section class="card">
    <h2>Verification</h2>
    <ul>
      <li><code>command</code> → pass</li>
    </ul>
  </section>

  <section class="card">
    <h2>Risks and follow-ups</h2>
    <ul>
      <li>...</li>
    </ul>
  </section>
</body>
</html>
```

## Common Mistakes

Avoid:

- Writing only for engineers.
- Listing commands before explaining why the work mattered.
- Omitting unresolved risk.
- Letting reports become long chronological logs.
- Forgetting to update the report after review findings.
- Claiming verification that did not happen.

## Completion Checklist

- Report has business value summary.
- Verification evidence is exact.
- Risks and follow-ups are honest.
- PR state is current.
- Preview was run or skip reason is recorded.
- Report path is included in PR notes or final answer.
