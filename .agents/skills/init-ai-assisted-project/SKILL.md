---
name: init-ai-assisted-project
description: Use when setting up a repository so AI coding agents can work in small PR-sized tasks with context handoff, source-of-truth ordering, task instructions, and PR hygiene.
---

# Init AI Assisted Project

## Overview

Initialize a lightweight AI-assisted development workflow for a repository.

This skill creates the minimum structure needed for agents to work in small, reviewable tasks without reading stale plans, old reports, or unrelated history.

## When to Use

Use when:

- Starting AI-assisted development in a new repository.
- Retrofitting an existing repository for Codex / Claude / other coding agents.
- Agents are reading too many stale docs before each task.
- Work needs repeatable task handoff, PR hygiene, and source-of-truth ordering.
- GPT Pro or another planning tool creates drafts that must be converted before Codex executes them.

Do not use when:

- The repository already has a working context pack and task workflow.
- The request is only to implement a single feature.
- The user wants product planning rather than repo workflow setup.

## Core Principle

Create a small execution skeleton, not a giant planning system.

Planning drafts can come from GPT Pro or humans, but the repository should contain only:

- Current state.
- Source-of-truth order.
- Active executable task.
- Short task instructions.
- PR and merge hygiene.

## Default Structure

Create this structure unless the repository already has an equivalent one:

```text
AGENTS.md

docs/
  ai/
    context/
      CURRENT.md
      ACTIVE_TASK.md
      SOURCE_OF_TRUTH.md
      POST_MERGE_QUEUE.md

    inbox/
      pro-instructions/
        README.md
        _template.md

    tasks/
      README.md
      _template.md

    notes/
      pr-driven-development.md
      orchestrator-workflow.md

    specs/
      README.md

    tests/
      README.md
      automated-test-catalog.md

    adr/
      README.md

.github/
  pull_request_template.md
```

If the project already uses another docs root, such as `docs/superpowers/`, keep the existing convention and adapt the paths.

## Do Not Overwrite Existing Files

Before creating files:

1. Check whether `AGENTS.md`, `CLAUDE.md`, `.github/pull_request_template.md`, or equivalent docs already exist.
2. If a file exists, propose a minimal patch instead of replacing it.
3. If a directory exists, add only missing files.
4. If the project has strong existing conventions, preserve them.

## AGENTS.md Minimum Content

Create or patch `AGENTS.md` with these sections:

```markdown
# AI Agent Guide

## Start of task

Read only:

1. `AGENTS.md`
2. `docs/ai/context/CURRENT.md`
3. `docs/ai/context/ACTIVE_TASK.md`
4. `docs/ai/context/SOURCE_OF_TRUTH.md`
5. The active task instruction

Do not read archive, reports, old plans, or unrelated docs unless the active task explicitly says so.

## Work rules

- Check current branch and diff before work.
- Do not work directly on `main`.
- Create a task branch from latest `main`.
- Do not overwrite user changes.
- Keep task scope small.
- If code changes, add or update tests where practical.
- Record additional files read in PR `Context usage`.

## PR rules

PR body must include:

- Context usage
- Summary
- Tests
- Reviews
- Known limitations
- Context handoff

## GPT Pro drafts

Planning drafts from GPT Pro or other external planning tools may be stored under:

`docs/ai/inbox/pro-instructions/`

These files are drafts, not source of truth. Do not execute them directly. Convert them into executable task instructions under `docs/ai/tasks/` before implementation.

## Handoff

At task completion, update:

- `CURRENT.md`
- `ACTIVE_TASK.md`
- `SOURCE_OF_TRUTH.md` if priorities changed
- `POST_MERGE_QUEUE.md` only if merge cleanup remains
```

## Context Pack Templates

### `docs/ai/context/CURRENT.md`

```markdown
# Current Context

Last updated: YYYY-MM-DD

This file contains only the current confirmed state. Do not use it as a long history log.

## Current entry points

## Current architecture / contracts

## Current tests / CI

## Current workflow

## Known unfinished items

## Source links

## Next handoff
```

### `docs/ai/context/ACTIVE_TASK.md`

```markdown
# Active Task Context

## Task

Next task: Task XX `<name>`

Status:

## Must read at task start

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/XX_task_name.md
```

## Read only if needed

```text
...
```

## Do not read

```text
docs/ai/archive/**
docs/ai/reports/**
old plans
completed task instructions
```

## Additional file usage

If additional files are read, record them in PR `Context usage`.
```

### `docs/ai/context/SOURCE_OF_TRUTH.md`

```markdown
# Source of Truth

If sources conflict, prefer:

1. Current implementation code
2. Current tests and CI
3. Machine-readable contracts, if any
4. `AGENTS.md`
5. `CURRENT.md`
6. Current specs
7. Accepted ADRs
8. `ACTIVE_TASK.md`
9. Active task instruction
10. Current plans
11. PR bodies
12. Pro instruction drafts
13. Archive / reports

Archive and reports are historical. Do not use them as current specification unless explicitly instructed.
```

### `docs/ai/context/POST_MERGE_QUEUE.md`

```markdown
# Post Merge Queue

This file is only for unresolved cleanup / handoff after a PR has been merged.

It is not a merge history log.

## Pending handoff

- merged_at: none
- pr_number: none
- branch: none
- title: none
- next_task: none
- expected_cleanup: none
```

## GPT Pro Instruction Inbox

Create:

```text
docs/ai/inbox/pro-instructions/README.md
docs/ai/inbox/pro-instructions/_template.md
```

### README

```markdown
# Pro Instructions Inbox

This directory stores planning drafts and task instruction drafts created outside this repository, such as GPT Pro outputs.

These files are not source of truth.

Before Codex executes them, the orchestrator must convert them into an active task instruction under `docs/ai/tasks/`.

## Rules

- Files here are drafts.
- Do not point `ACTIVE_TASK.md` directly to files in this directory.
- Do not treat these files as current specification.
- Convert each draft into a short executable task instruction before implementation.
- Record conversion decisions in PR `Context usage`.
- If a draft conflicts with implementation, tests, contracts, specs, ADR, or `CURRENT.md`, the repository source of truth wins.

## Suggested filename

`YYYY-MM-DD-topic-from-gpt-pro.md`
```

### Template

```markdown
# GPT Pro Draft: <title>

## Source

- Created by:
- Date:
- Conversation / prompt summary:

## Proposed goal

## Proposed scope

## Suggested implementation notes

## Suggested tests

## Risks / open questions

## Conversion status

- [ ] Reviewed against current repository state
- [ ] Conflicts checked
- [ ] Converted to executable task instruction
- [ ] Added to `docs/ai/tasks/`
- [ ] `ACTIVE_TASK.md` updated

## Conversion notes
```

## Task Template

Create `docs/ai/tasks/_template.md`:

```markdown
# Task XX: title

## Goal

## Must read

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
```

## Read only if needed

```text
...
```

## Do

- ...

## Do not

- ...

## Tests

```bash
...
```

## Done when

- ...
- `CURRENT.md` updated if current state changed
- `ACTIVE_TASK.md` points to next task
- PR body includes Context usage / Tests / Handoff
```

## Completion Checklist

- `AGENTS.md` exists or was minimally patched.
- Context pack exists.
- GPT Pro draft inbox exists.
- Task instruction template exists.
- PR template exists.
- Source-of-truth order includes Pro drafts below active task instructions.
- Existing project conventions were preserved.
- No giant roadmap or stale plan was created.
