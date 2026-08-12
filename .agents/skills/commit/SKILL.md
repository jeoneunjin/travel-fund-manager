---
name: commit
description: Validate and commit the current repository changes as one or more focused Conventional Commits without pushing. Use when the user says "$commit", asks to commit current work, or provides a commit context such as "인증 API 구현". Do not use for code changes, pull requests, or pushing to a remote.
---

# Commit Changes

Create safe, focused local commits. Never push.

## Inputs

Treat the user's remaining text as optional work context. If it includes `--dry-run`, remove that token and only report the planned commits; do not stage or commit anything.

## Workflow

1. Inspect `git status --short`, `git diff --stat`, and `git diff --cached --stat` first. Do not read a full diff initially.
2. If there are no changes, report that there is nothing to commit and stop.
3. If pre-staged changes exist, list them and stop. Do not alter an existing staging area; ask the user whether those changes should be included or unstaged first.
4. Inspect the last 20 commit subjects with `git log -20 --format='%s'`. Follow the repository's established message language, Conventional Commit types, scope usage, and summary style instead of imposing a new format. When the history has no scope convention, omit scopes.
5. Infer whether the files represent one purpose or independent purposes. Read `git diff -- <path>` only for the smallest set of ambiguous files needed to decide grouping or write an accurate message. Do not read unrelated files or the full diff by default.
6. Run `npm run lint` and `npx tsc --noEmit`. If either fails, do not stage or commit. Report only the relevant error lines; if they cannot be isolated, report the last 30 output lines.
7. Propose one or more atomic commits. Keep a schema migration with the code that requires it; separate unrelated UI, API, refactor, or configuration changes when they can be committed by whole files.
8. Use only explicit file paths with `git add <path>`. Never use `git add -A`, `git add .`, `git add -p`, or interactive Git commands.
9. Write a message consistent with the recent history. Use `feat`, `fix`, `refactor`, `chore`, `docs`, or `test` as appropriate. Use the supplied work context only when it matches the files in that commit.
10. In dry-run mode, output the planned message and exact files for each commit, then stop.
11. Otherwise commit each planned group with `git commit -m <message>`. Stop immediately if any command fails. Never amend, reset, rebase, force-push, or push.
12. Report each commit hash and message, the validation result, and any remaining uncommitted files.

## Safety Rules

- Preserve unrelated user changes and never include them merely because they are present.
- Do not commit generated files, credentials, environment files, or lockfile changes unless they are clearly intentional and relevant to the requested work.
- Do not bypass failing checks with `--no-verify`.
- Do not claim success until `git status --short` confirms the intended files are committed.
