---
name: context-pack-handoff
description: Use when finishing a task, preparing the next task, or recovering from stale context in an AI-assisted repository.
---

# Context Pack Handoff

## Overview

Maintain a small context pack so AI agents restart from the current state, not from stale plans or old reports.

The context pack is usually:

```text
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/context/POST_MERGE_QUEUE.md
```

Adapt paths if the project uses another directory.

## When to Use

Use when:

- A task is complete.
- A PR is ready or merged.
- The next task must be prepared.
- Agents are reading old plans, reports, or archive files.
- `CURRENT.md` has become a history log.
- `ACTIVE_TASK.md` points to the wrong instruction.

Do not use when:

- You are only fixing a typo and no task state changed.
- The repository has no AI task workflow.

## File Roles

### `CURRENT.md`

Contains only current confirmed state.

Do include:

- Current entry points.
- Current architecture / contracts.
- Current tests / CI.
- Current workflow.
- Known unfinished items.
- Short handoff to next task.

Do not include:

- Long PR history.
- Full test logs.
- Old design debate.
- Archive summaries.
- Reports.

### `ACTIVE_TASK.md`

Points to exactly one next task.

Must include:

- Next task name.
- Current status.
- Must-read files.
- Read-only-if-needed files.
- Do-not-read files.
- Additional file usage rule.

### `SOURCE_OF_TRUTH.md`

Defines conflict order.

A typical order:

```text
1. Current implementation code
2. Current tests and CI
3. Machine-readable contracts
4. AGENTS.md
5. CURRENT.md
6. Current specs
7. Accepted ADRs
8. ACTIVE_TASK.md
9. Active task instruction
10. Current plans
11. PR bodies
12. Pro instruction drafts
13. Archive / reports
```

### `POST_MERGE_QUEUE.md`

Contains unresolved merge cleanup only. It is not a merge history log.

## Handoff Procedure

At task completion:

1. Update `CURRENT.md` with current state only.
2. Update `ACTIVE_TASK.md` to the next task.
3. Update `SOURCE_OF_TRUTH.md` only if priority rules changed.
4. Update `POST_MERGE_QUEUE.md` only if unresolved cleanup remains.
5. Ensure completed task instructions are not must-read for the next task.
6. Ensure archive / reports / old plans are not must-read.
7. Ensure the next task read set is small.

## PR Body Handoff Section

Use this format:

```markdown
## Context handoff

- `CURRENT.md`: ...
- `ACTIVE_TASK.md`: ...
- `SOURCE_OF_TRUTH.md`: ...
- `POST_MERGE_QUEUE.md`: ...
- `status.md` or equivalent: ...
```

If no context update is needed:

```markdown
context handoff 更新不要: <reason>
```

## Anti-Patterns

Do not:

- Put all PR details into `CURRENT.md`.
- Keep completed task instructions in must-read.
- Use reports as current specifications.
- Let `POST_MERGE_QUEUE.md` become a merge history.
- Point `ACTIVE_TASK.md` to GPT Pro drafts instead of executable task instructions.

## Completion Checklist

- `CURRENT.md` is short and current.
- `ACTIVE_TASK.md` points to the correct next task.
- Must-read list is minimal.
- Source-of-truth order is accurate.
- Merge queue has no stale handoff.
- PR body explains the context handoff.
