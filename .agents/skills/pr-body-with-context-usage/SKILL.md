---
name: pr-body-with-context-usage
description: Use when drafting, updating, or reviewing a pull request in an AI-assisted project where file usage, tests, reviews, and handoff must be explicit.
---

# PR Body With Context Usage

## Overview

Create PR bodies that make AI-assisted work auditable.

A good PR body explains:

- What changed.
- What context was read.
- What tests ran.
- What reviews happened.
- What limitations remain.
- What the next agent should know.

## When to Use

Use when:

- Creating a Draft PR.
- Updating a PR after review.
- Documenting an AI-generated change.
- A project requires context usage and handoff.
- The PR includes code, tests, docs, CI, or workflow changes.

Do not use when:

- The change is a trivial typo and project rules allow a shorter PR body.
- The user explicitly asks for a minimal PR note.

## Standard Template

```markdown
@<owner-or-reviewer-if-required>

## Context usage

最初に読んだファイル:
- `AGENTS.md`
- `docs/ai/context/CURRENT.md`
- `docs/ai/context/ACTIVE_TASK.md`
- `docs/ai/context/SOURCE_OF_TRUTH.md`
- `docs/ai/tasks/<task>.md`

追加で読んだファイル:
- `path/to/file`: 理由

読んでいないもの:
- archive / reports / old plans

## Summary

- ...

## Tests

- `command` -> result
- skipped: reason

## Reviews

- Security:
- API / contract:
- Frontend:
- Test / TypeScript:
- Context hygiene:

## Known limitations / follow-ups

- ...

## Context handoff

- `CURRENT.md`:
- `ACTIVE_TASK.md`:
- `SOURCE_OF_TRUTH.md`:
- `POST_MERGE_QUEUE.md`:

## Post-merge cleanup plan

- [ ] Sync local main
- [ ] Delete merged branch
- [ ] Confirm context pack points to the next task
- [ ] Start next branch from latest main
```

## Context Usage Rules

Always list:

- Initial must-read files.
- Additional files read with reasons.
- Explicitly avoided archive / reports / old plans when relevant.

Do not claim files were read if they were not.

## Tests Section Rules

For each command, include:

```text
command -> pass/fail/skip
```

If a test was not run, say why.

Examples:

```markdown
- `npm run test:js` -> pass
- Rails system test -> skipped: docs-only change with no UI behavior impact
```

## Reviews Section Rules

Use review lenses that fit the task.

Common lenses:

- Security / safety
- API / OpenAPI / contract
- Frontend / accessibility
- TypeScript / test
- Context hygiene
- Performance
- Product / parity

If subagent reviews were skipped, explain why.

## Handoff Section Rules

The PR body should make it clear whether the next task can start.

If `ACTIVE_TASK.md` was not updated:

```markdown
context handoff 更新不要: this PR does not advance task state.
```

If a task advances:

```markdown
- `ACTIVE_TASK.md`: points to Task XX `<name>`
```

## Common Mistakes

Avoid:

- PR bodies that only say "implemented."
- Missing test commands.
- Hiding failed or skipped checks.
- No mention of extra files read.
- Next task not stated.
- No known limitations.

## Completion Checklist

- Context usage is complete.
- Summary is short.
- Tests are exact.
- Reviews are explicit.
- Handoff is clear.
- Post-merge cleanup is listed.
