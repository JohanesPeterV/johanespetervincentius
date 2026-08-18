# Git

## Priority 0

If you modified, created, deleted, or renamed any file, the task is not done until your files are committed successfully.

- Do not ask for permission to commit after making changes.
- Auto-commit each coherent outcome. Treat uncommitted work as disposable.
- A coherent outcome reflects the user's prompt and the completed result. Do not split mechanical intermediate steps such as import fixes, formatting, or hook-failure repairs into separate commits.
- Split unrelated outcomes into separate commits. Do not batch unrelated work into one commit.
- Use conventional commit subjects such as `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, and `style:`.
- Include the commit hash and commit message in the final response.
- Work lands directly on the current branch — usually `main`, sometimes `dev`. There is no merge or PR workflow; just commit in place.

## Commit Sequence

1. Run `git status --short`.
2. Run `wc -l` on every modified `.tsx` and `.ts` file. Split before committing if a `.tsx` is over 300 lines or a `.ts` is over 500 lines.
3. Stage only exact new or renamed paths when Git requires it:

```bash
git add -- path/to/new-file path/to/renamed-file
```

4. Commit only files changed for the current task, with explicit paths:

```bash
git commit -m "type: intent" -- path/to/file1 path/to/file2
```

5. Run `git status --short` again.

## Hard Rules

- Never use `git add .`, `git add -A`, or directory-wide staging.
- Never skip hooks. Never use `--no-verify` unless the user explicitly requests bypassing hooks for the current commit.
- Never amend unless the user explicitly asks.
- Never push unless the user explicitly asks.

## Commit Failures

- If hooks fail — lint, Prettier, or file-size checks run by lefthook — fix the actual problem and retry. Do not bypass.
- Re-read affected files before retrying if time has passed or a hook changed files.
- Do not claim the task is done until the commit succeeds.

## Concurrent-Agent Safety

Multiple agents may be working in this repo at once.

- Always commit with explicit file paths.
- Do not touch files you did not edit for your task.
- A file with another worker's uncommitted changes is not a blocker when the task requires editing it: re-read it, preserve existing work, and make the smallest compatible edit.
- If `git status` shows unexpected files, leave unrelated paths alone.
- Re-read files before editing them if time has passed or a commit failed.

## Forbidden Commands

Do not run these without explicit user approval:

- `git revert`
- `git cherry-pick`
- `git reset`
- `git checkout .`
- `git restore .`
- `git stash`
- `git clean`
