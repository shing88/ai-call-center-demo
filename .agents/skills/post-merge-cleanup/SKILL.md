---
name: post-merge-cleanup
description: Use after a pull request has been merged and before starting the next task in an AI-assisted repository.
---

# Post-Merge Cleanup

## Overview

After a PR is merged, clean local state and verify the context pack before starting the next task.

This prevents agents from working on stale branches or stale task context.

## When to Use

Use when:

- GitHub shows a PR is merged.
- A task branch needs cleanup.
- The next task is about to start.
- `POST_MERGE_QUEUE.md` has pending cleanup.
- CI has passed and the user merged the PR.

Do not use when:

- The PR is not merged.
- The user has not approved merge.
- There are uncommitted user changes that would be overwritten.

## Procedure

1. Confirm PR is merged on GitHub.
2. Save or avoid user changes.
3. Switch to main.
4. Pull latest main.
5. Delete merged local branch.
6. Delete merged remote branch if appropriate.
7. Check context pack.
8. Start next task branch from latest main.

Commands:

```bash
git status --short
git branch --show-current
git switch main
git pull --ff-only
git branch --merged
git branch -d <merged-branch>
```

If remote branch cleanup is allowed:

```bash
git push origin --delete <merged-branch>
```

## Context Checks

Verify:

```text
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/context/POST_MERGE_QUEUE.md
```

Adapt paths if the project uses another docs root.

Check that:

- `CURRENT.md` reflects merged state.
- `ACTIVE_TASK.md` points to the next task.
- Completed task instruction is not must-read.
- Archive / reports / old plans are not must-read.
- `POST_MERGE_QUEUE.md` has no stale pending handoff.
- Next branch will start from latest main.

## If POST_MERGE_QUEUE Has Pending Work

If queue has a real pending handoff:

1. Process the cleanup before starting a new task.
2. Update queue to "none" when done.
3. Do not treat queue as merge history.
4. If queue conflicts with `ACTIVE_TASK.md`, resolve by source-of-truth order.

## When CI Passes But PR Is Not Merged

Stop and report:

```text
CI 成功・未 merge
```

Do not merge without user confirmation unless project rules explicitly allow it.

## Completion Message

Use:

```markdown
Post-merge cleanup complete.

- main synced: yes
- branch deleted: <branch>
- next task: <task>
- context pack checked: yes
- next branch ready: <branch>
```

## Common Mistakes

Avoid:

- Starting next task from old branch.
- Deleting a branch before confirming merge.
- Leaving `ACTIVE_TASK.md` pointing to a completed task.
- Treating `POST_MERGE_QUEUE.md` as a merge history log.
- Reading archive / reports to infer current state.

## Completion Checklist

- Main is up to date.
- Merged branch is deleted.
- Context pack is current.
- Merge queue is clean.
- Next task is clear.
- New task branch starts from latest main.
