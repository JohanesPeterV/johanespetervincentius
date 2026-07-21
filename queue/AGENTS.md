# Queue Rules

These rules add to root `AGENTS.md` for `queue/AUTOMATED_REVIEW_FIXES.md`. That transient file is the only automated queue; its absence means there is no validated review work.

- **BLOCKER**: Re-read the queue immediately before editing it. Patch only the owned row or append operation and preserve every other row.
- **BLOCKER**: `[ ]` means pending, `[-]` means actively leased, and `[v]` means completed. Every row keeps a stable `REV-<source-sha>-<number>` identifier.
- **BLOCKER**: Commit the queue-only `[-]` claim before touching implementation files. The claimed row must record the current task or automation ID and UTC claim time on one `Lease:` line.
- **BLOCKER**: Resume the current task's unfinished lease before selecting new work. If the task cannot finish and no live task will continue it, remove the lease line, return only that row to `[ ]`, keep one current `Blocked:` clause when useful, and commit the release.
- **BLOCKER**: Audit a lease older than eight hours before treating it as abandoned. Check automation memory, the claim commit, live Codex tasks, registered worktrees and branches, later commits, and dirty implementation paths. Age alone never permits release.
- **BLOCKER**: Release a stale lease only when the combined evidence shows no active owner and no uncommitted implementation. Preserve partial committed implementation so the next worker can finish or verify it. If ownership remains ambiguous, keep the lease and stop.
- **BLOCKER**: The reviewer may create the queue only when at least one validated `[ ]` row exists. Never create an empty queue. Do not append while the queue is dirty or contains an active `[-]` row.
- **BLOCKER**: The worker must select the first safely claimable `[ ]` row, implement only that row, and never create or broaden work. If no row is available, stop.
- **BLOCKER**: Mark only the owned row `[v]` and commit it with the implementation paths after all required verification passes.
- **BLOCKER**: After completing a row, re-read the queue. When no `[ ]` or `[-]` row remains, verify that the queue is clean and unowned, then delete it in a separate cleanup commit. A later reviewer recreates it when new validated work exists.
- **BLOCKER**: Never stop, restart, signal, or kill a pre-existing server or process. Use it only when it serves the claimed committed state; otherwise use an isolated free port and stop only a process started by the current task.
