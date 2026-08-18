# Git

## Priority 0

If you modified, created, deleted, or renamed any file, the task is not done until your files are committed successfully.

- Use semantic commit subjects such as `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, and `style:`.
- Auto-commit each coherent outcome; split unrelated outcomes into separate commits.
- Commit on the current branch. There is no merge or PR workflow.
- Never push unless the user explicitly asks.

Several agents may run in this shared checkout at once. Coexist:

- Commit only your own files, strictly by pathspec: `git commit -m "…" -- <paths>`. Never `git add -A` or `git add .`.
- Never amend, rebase, reset, switch branches, or discard uncommitted changes — they may belong to another agent.
- If hooks fail — lint, Prettier, or file-size checks from lefthook — fix the actual problem and retry. Never `--no-verify`.

An explicit user instruction overrides all of this.
