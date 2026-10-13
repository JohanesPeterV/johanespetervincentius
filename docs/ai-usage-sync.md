# Automatic AI consumption

Claude Code and Codex sit on their own line in Main stack. Under them in the Skills chapter, `AiUsageSummary` shows the API-estimated cost, sessions and tokens per tool for the last 30 calendar days, including today, in Asia/Jakarta, and an interactive chart plots the daily cost. The hero card repeats the total cost and each tool's tokens under its tagline. T3 Code is the workspace, not a third token provider.

The Mac scans local Codex and Claude usage telemetry every 15 minutes, then updates one public GitHub Gist. The website reads that JSON on mount and every 15 minutes. This needs no website secret, deployment per update, or automated Git commit/push. Only dates, per-provider token, session and cost totals for the window, and per-provider cost per day are published. Prompts, models, project names, session IDs and local paths stay private.

The collector seeds unchanged files from T3 Code's version 4 scan cache, then directly scans new and changed provider transcripts. Opening T3's usage screen is unnecessary. A private collector cache reuses unchanged results; one written in an older record format is discarded and rebuilt by rescanning. Scans stream a fixed byte snapshot and ignore an unfinished final line, so active provider writes do not corrupt a run.

Counting follows the installed T3 usage implementation: input, cached input, cache creation and output count toward tokens; reasoning is already included in Codex output. Claude message/request keys deduplicate repeated content blocks and copied transcripts globally, keeping the first record. Codex drops consecutive duplicate token events and copied fork history within its initial one-second burst. Cost is the API estimate T3 shows: each record's input, cached input, cache creation and output tokens priced with T3's model rates (`~/.t3/userdata/usage-model-rates.json`); models missing from those rates count as $0. This is the scope of the supplied T3 monthly screenshot, separate from the historical Smilie audit and Codex's lifetime profile counter. It reflects available telemetry on this Mac, not usage on other machines or deleted logs.

`sourceUpdatedAt` records the completed telemetry scan. `updatedAt` records the published aggregate generation time. They currently match. When the Mac sleeps, is offline or is logged out, the last published values and source date remain visible. Website fetch failures retain the last successful numbers and expose an explicit error to the presentation. Publication failures exit with an error and leave the prior Gist intact.

## Current installation

- Public data: <https://gist.githubusercontent.com/JohanesPeterV/39230a0a9b68ec5f7d218c1a704d93b0/raw/ai-usage.json>
- Job: `com.johanespeter.portfolio-ai-usage` in `~/Library/LaunchAgents/`.
- Private configuration, collector cache and logs: `~/Library/Application Support/portfolio-ai-usage/`.
- GitHub authentication: existing `gh` keychain login, with Gist permission. No credential is copied into the repo, job or Gist.
- The job runs the repo's `scripts/ai-usage/sync.mjs` through its absolute Node executable. Moving this repo or removing that Node installation requires reinstalling the job.

## Operation

Run from the repository root:

```bash
node scripts/ai-usage/sync.mjs
node --test scripts/ai-usage/transcripts.test.mjs
launchctl print gui/$(id -u)/com.johanespeter.portfolio-ai-usage
```

Manual sync publishes an update. Do not run it concurrently with a scheduled sync. `--local` scans and saves local aggregates without publishing. `--snapshot` explicitly refreshes the bundled first-render snapshot, which must be committed under the repo rules; scheduled runs never edit tracked files.

A new installation uses `node scripts/ai-usage/sync.mjs --create --snapshot` once, updates `AI_USAGE_URL` in `src/lib/ai-usage.ts`, and runs `node scripts/ai-usage/install.mjs`. The installer refuses to replace an already-running job. To remove this job:

```bash
launchctl bootout gui/$(id -u)/com.johanespeter.portfolio-ai-usage
rm ~/Library/LaunchAgents/com.johanespeter.portfolio-ai-usage.plist
```

The scripts reject an unsupported T3 scan cache, missing T3 model rates and malformed complete usage telemetry rather than silently publishing an undercount. Read `sync-error.log` if updates stop. Provider roots come from the T3 scan cache's configured sources; adding a new provider root requires T3 to discover it first. No raw transcript is uploaded.
