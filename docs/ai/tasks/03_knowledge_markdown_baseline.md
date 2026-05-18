# Task 03: knowledge-markdown-baseline

## Goal

Create a Markdown-only baseline knowledge set for the demo. The knowledge must be fictional, easy to chunk later, and clear about what can and cannot be disclosed before identity verification.

## Position

This task comes after Task 02 `scaffold-minimal-demo-app` and before the future Markdown loader / chunk model task.

## Must read

```text
AGENTS.md
docs/ai/context/CURRENT.md
docs/ai/context/ACTIVE_TASK.md
docs/ai/context/SOURCE_OF_TRUTH.md
docs/ai/tasks/03_knowledge_markdown_baseline.md
```

## Read only if needed

```text
README.md
package.json
tsconfig*.json
tests/**
knowledge/**
docs/ai/inbox/pro-instructions/03_knowledge_markdown_baseline.md
```

## Do not read

```text
docs/ai/archive/**
docs/ai/reports/**
old plans
completed task instructions
other GPT Pro drafts
```

## Do

- Add fictional business-rule Markdown under `knowledge/business_rules/`.
- Add fictional customer-contract Markdown under `knowledge/customer_contracts/`.
- Add fictional demo-scenario Markdown under `knowledge/scenarios/`.
- Add `knowledge/README.md` and clearly state that all data is fictional demo data.
- Keep headings consistent so a later loader can split documents by section.
- Add or update a practical test that verifies the baseline structure.
- Update `README.md` and context handoff docs if current state changes.

## Do not

- Use real customer names, addresses, phone numbers, contract numbers, or other real personal data.
- Add vector DB, embeddings, search, AI response generation, authentication, or call integration.
- Make the UI consume this knowledge in this task.
- Treat GPT Pro drafts as source of truth.

## Tests

```bash
npm test
npm run build
git diff --check
```

## Reviews

- Safety / privacy
- Product demo clarity
- Test / TypeScript
- Context hygiene

## Done when

- `knowledge/business_rules/` has at least 4 Markdown files.
- `knowledge/customer_contracts/` has at least 3 Markdown files.
- `knowledge/scenarios/` has at least 4 Markdown files.
- The knowledge README and each knowledge file clearly mark the data as fictional.
- Required tests pass or skipped tests are explained.
- `CURRENT.md` reflects the new current state.
- `ACTIVE_TASK.md` no longer points at this completed task.
- PR body includes `Context usage` / `Tests` / `Reviews` / `Context handoff`.
