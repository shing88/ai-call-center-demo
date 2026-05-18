---
name: safety-audit-before-feature
description: Use before adding features that display user content, fetch related records, expose candidates, preview files, or change permissions.
---

# Safety Audit Before Feature

## Overview

Before adding risky features, audit the safety boundary and add guardrails.

This is especially important for:

- Comments.
- Rich text.
- File previews.
- Notifications.
- Mentions.
- Watchers.
- Permission-sensitive candidates.
- Large lists.

## When to Use

Use when a feature involves:

- User-generated text.
- Formatted HTML or Markdown preview.
- Attachments or file previews.
- Mentions, watchers, assignees, or user candidates.
- Notifications or journal feeds.
- Related records that may trigger N+1 queries.
- Permission or visibility rules.

Do not use for small internal-only changes with no user data, no records, and no rendering.

## Audit Areas

### XSS / rendering

Map data sources:

```text
comments
notes
descriptions
subjects
filenames
display names
validation messages
toast messages
query names
saved view names
```

Map frontend sinks:

```text
textContent
createTextNode
innerHTML
insertAdjacentHTML
outerHTML
DOMParser
framework HTML escape behavior
```

Rule:

```text
Raw text must go to text sinks only.
Formatted HTML must be server-sanitized and use an approved safe sink only.
```

### N+1 / performance

Measure before changing.

Use query count or profiling to distinguish:

```text
baseline
small N
larger N
delta
```

Do not assert N+1 without measurement.

### Visibility / permission

Check server-side:

```text
can current user see this object?
can current user see this candidate?
can current user mutate this relation?
does this leak private project / issue / user info?
```

Never rely on frontend filtering for visibility.

### File preview

Define:

```text
previewable MIME types
non-previewable active content
download-only fallback
sandbox requirements
```

Default unsafe preview blocklist:

```text
text/html
image/svg+xml
application/xml
text/xml
script-capable content
```

## Suggested Output

Create or update a safety report:

```text
docs/ai/security/<feature>-safety-audit.md
```

Sections:

```markdown
# <Feature> Safety Audit

## Scope

## Data sources checked

## Frontend sinks checked

## XSS assessment

## N+1 baseline

## Permission / visibility policy

## File preview policy

## Tests added

## Unresolved risks

## Follow-ups
```

## Guardrail Tests

Add at least one guardrail when practical.

Examples:

- Dangerous string appears as text, not HTML.
- No script node is inserted.
- Candidate list excludes invisible users.
- Query count does not exceed baseline.
- Preview rejects unsafe MIME types.

## Follow-Up Targets

If current baseline is weak, record both:

```text
regression guardrail:
  keeps current behavior from getting worse

improvement target:
  defines desired future reduction
```

Example:

```text
current: 11 items = 146 queries
guardrail: <= 180
target before feature expansion: <= 100 or delta <= 50
```

## PR Body Section

```markdown
## Safety audit

- XSS:
- N+1:
- Visibility:
- File preview:
- Tests:
- Remaining risk:
```

## Common Mistakes

Avoid:

- Saying "safe" because no exploit was manually observed.
- Adding rich preview before defining HTML contract.
- Returning candidates before server-side visibility checks.
- Setting query count thresholds so loose they cannot detect regressions.
- Fixing performance without preserving permission behavior.

## Completion Checklist

- Data sources mapped.
- Sinks mapped.
- Permission policy clear.
- Baseline measured if performance-sensitive.
- At least one guardrail test added or skipped with reason.
- Follow-up targets recorded.
