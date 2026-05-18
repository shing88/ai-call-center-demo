---
name: active-task-instructions
description: Use when converting a planning draft, user request, or GPT Pro output into a short executable task instruction for an AI coding agent.
---

# Active Task Instructions

## Overview

Convert plans into executable task instructions.

The goal is not to preserve the full planning discussion. The goal is to give the coding agent just enough context to complete one PR-sized task safely.

## When to Use

Use when:

- GPT Pro or a human produced a plan that Codex must execute.
- A task needs a `docs/ai/tasks/XX_task_name.md` instruction.
- The next task must be constrained to specific files, tests, and completion criteria.
- Agents are over-reading unrelated docs or stale history.

Do not use when:

- The user only wants brainstorming.
- The task is too ambiguous to scope into one PR.
- The plan is not yet accepted by the user.

## Core Rule

One task instruction should answer:

```text
What is the goal?
What may the agent read?
What must the agent not read?
What should be changed?
What must not be changed?
Which tests prove completion?
What context must be handed off?
```

## Recommended Template

```markdown
# Task XX: short-name

## Goal

One to three sentences.

## Position

This task comes after Task YY and before Task ZZ.

## Must read

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/XX_short_name.md
```

## Read only if needed

```text
path/to/file
path/to/test
```

## Do not read

```text
docs/ai/archive/**
docs/ai/reports/**
old plans
completed task instructions
```

## Do

- Add the failing test first if code changes.
- Implement the smallest change that satisfies the task.
- Update related docs / contracts if behavior changes.
- Update the test catalog if test meaning changed.

## Do not

- Redesign the whole system.
- Expand the task beyond this PR.
- Treat GPT Pro drafts as source of truth.
- Read archive / reports as current specs.

## Tests

```bash
git diff --check
...
```

## Reviews

Specify required review lenses when needed:

- API / contract
- Security
- Frontend
- Test / TypeScript
- Context hygiene

## Done when

- ...
- Required tests pass or skipped tests are explained.
- `CURRENT.md` is updated if current state changed.
- `ACTIVE_TASK.md` points to the next task.
- PR body includes Context usage, Tests, Reviews, and Handoff.
```

## Converting GPT Pro Drafts

When using a GPT Pro draft from `docs/ai/inbox/pro-instructions/`:

1. Compare the draft against current implementation, tests, contracts, and `CURRENT.md`.
2. Remove speculative or stale parts.
3. Convert broad roadmap language into a single PR-sized goal.
4. Add only the files that may be read.
5. Add exact tests.
6. Move the executable instruction to `docs/ai/tasks/`.
7. Update `ACTIVE_TASK.md` to point to the executable instruction.

## Good Task Size

A good task:

- Can be completed in one PR.
- Has clear test commands.
- Has a small read set.
- Has a concrete handoff.
- Does not include unrelated future work.

## Bad Task Smells

Avoid instructions that:

- Ask for "improve the whole architecture."
- Include more than 10 must-read files.
- Mix planning, implementation, and release work.
- Make old reports or archived plans required reading.
- Include several independent features.

## Completion Checklist

- Instruction is short enough to execute.
- Must-read list is minimal.
- Follow-up work is separated.
- Source-of-truth order is respected.
- `ACTIVE_TASK.md` can point to this instruction safely.
