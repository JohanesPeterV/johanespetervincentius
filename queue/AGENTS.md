# Queue Rules

These rules add to root `AGENTS.md` for `queue/AUTOMATED_REVIEW_FIXES.md`. That transient file is the only automated queue; its absence means there is no validated review work.

- Re-read the queue immediately before editing it. Patch only the owned row or append operation and preserve every other row.
- `[ ]` means pending, `[-]` means actively leased, and `[v]` means completed. Every row keeps a stable `REV-<source-sha>-<number>` identifier.
- Commit the queue-only `[-]` claim before touching implementation files. The claimed row must record the current task or automation ID and UTC claim time on one `Lease:` line.
- Resume the current task's unfinished lease before selecting new work. If the task cannot finish and no live task will continue it, remove the lease line, return only that row to `[ ]`, keep one current `Blocked:` clause when useful, and commit the release.
- Audit a lease older than eight hours before treating it as abandoned. Check automation memory, the claim commit, live Codex tasks, registered worktrees and branches, later commits, and dirty implementation paths. Age alone never permits release.
- Release a stale lease only when the combined evidence shows no active owner and no uncommitted implementation. Preserve partial committed implementation so the next worker can finish or verify it. If ownership remains ambiguous, keep the lease and stop.
- Queue capacity equals the number of active queue-worker automations targeting this repository. Count `[ ]` and `[-]` as outstanding work. With the current single worker automation, capacity is one row.
- The reviewer may create the queue only when at least one validated `[ ]` row exists and capacity is available. Never create an empty queue or exceed capacity. With one worker, never append while the queue exists; wait for the worker to finish and delete it.
- The worker must select the first safely claimable `[ ]` row, implement only that row, and never create or broaden work. If no row is available, stop.
- Mark only the owned row `[v]` and commit it with the implementation paths after all required verification passes.
- After completing a row, re-read the queue. When no `[ ]` or `[-]` row remains, verify that the queue is clean and unowned, then delete it in a separate cleanup commit. A later reviewer recreates it when new validated work exists.
- Never stop, restart, signal, or kill a pre-existing server or process. Use it only when it serves the claimed committed state; otherwise use an isolated free port and stop only a process started by the current task.
