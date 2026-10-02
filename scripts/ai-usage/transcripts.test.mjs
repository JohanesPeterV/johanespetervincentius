import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  writeFile,
  stat,
  rm,
  mkdir,
  readFile,
} from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aggregateUsage, readTranscript } from './transcripts.mjs';

const readEntries = async (provider, entries, tail = '') => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-ai-usage-'));
  try {
    const path = join(directory, 'session.jsonl');
    await writeFile(
      path,
      entries.map((entry) => JSON.stringify(entry) + '\n').join('') + tail,
    );
    return await readTranscript(path, provider, (await stat(path)).size);
  } finally {
    await rm(directory, { recursive: true });
  }
};
const claude = (timestamp, sessionId, id, usage) => ({
  type: 'assistant',
  timestamp,
  sessionId,
  requestId: 'request',
  message: { id, model: 'claude', usage },
});
const codex = (timestamp, usage) => ({
  type: 'event_msg',
  timestamp,
  payload: { type: 'token_count', info: { last_token_usage: usage } },
});

test('Claude totals include cache reads and writes, globally deduplicate content blocks and forks', async () => {
  const entry = claude('2026-10-02T18:00:00Z', 'session', 'message', {
    input_tokens: 10,
    cache_read_input_tokens: 100,
    cache_creation_input_tokens: 30,
    output_tokens: 5,
  });
  const first = await readEntries('claude', [entry, entry]);
  const fork = await readEntries('claude', [{ ...entry, sessionId: 'fork' }]);
  const usage = aggregateUsage(
    {
      first: { provider: 'claude', records: first },
      fork: { provider: 'claude', records: fork },
    },
    new Date('2026-10-03T01:00:00Z'),
  );
  assert.deepEqual(usage.providers.claude, { tokens: 145, sessions: 1 });
});

test('Codex excludes consecutive repeated usage and copied fork history; reasoning is part of output', async () => {
  const usage = {
    input_tokens: 1000,
    cached_input_tokens: 800,
    output_tokens: 40,
    reasoning_output_tokens: 30,
  };
  const rows = await readEntries('codex', [
    {
      type: 'session_meta',
      timestamp: '2026-10-02T18:00:00Z',
      payload: { id: 'child', forked_from_id: 'parent' },
    },
    { type: 'turn_context', payload: { model: 'gpt' } },
    codex('2026-10-02T18:00:00.050Z', usage),
    codex('2026-10-02T18:00:00.090Z', { ...usage, output_tokens: 50 }),
    codex('2026-10-02T18:00:06Z', { ...usage, output_tokens: 70 }),
    codex('2026-10-02T18:00:07Z', { ...usage, output_tokens: 70 }),
  ]);
  assert.deepEqual(rows, [
    [Date.parse('2026-10-02T18:00:06Z'), 'child', 1070, null],
  ]);
});

test('Calendar rolling window expires old days and uses Jakarta boundaries', () => {
  const makeRow = (date) => [Date.parse(date), 'session', 100, null];
  const usage = aggregateUsage(
    {
      file: {
        provider: 'codex',
        records: [
          makeRow('2026-09-03T16:59:59Z'),
          makeRow('2026-09-03T17:00:00Z'),
          makeRow('2026-10-03T16:59:59Z'),
          makeRow('2026-10-03T17:00:00Z'),
        ],
      },
    },
    new Date('2026-10-03T01:00:00Z'),
  );
  assert.equal(usage.windowStart, '2026-09-04');
  assert.equal(usage.windowEnd, '2026-10-03');
  assert.equal(usage.providers.codex.tokens, 200);
  assert.equal(usage.daily.length, 30);
  assert.deepEqual(usage.daily[0], {
    date: '2026-09-04',
    codex: 100,
    claude: 0,
  });
  assert.deepEqual(usage.daily[29], {
    date: '2026-10-03',
    codex: 100,
    claude: 0,
  });
  assert.deepEqual(Object.keys(usage), [
    'version',
    'windowStart',
    'windowEnd',
    'updatedAt',
    'sourceUpdatedAt',
    'providers',
    'daily',
  ]);
  assert.equal(JSON.stringify(usage).includes('session"'), false);
});

test('Reads only complete snapshot lines while providers append telemetry', async () => {
  const entry = claude('2026-10-02T18:00:00Z', 'session', 'message', {
    input_tokens: 100,
  });
  const rows = await readEntries(
    'claude',
    [entry],
    '{"type":"assistant","message":{"usage":',
  );
  assert.equal(rows.length, 1);
});

test('Malformed complete telemetry fails instead of publishing an undercount', async () => {
  await assert.rejects(
    readEntries('claude', [], '{"usage":\n'),
    /Cannot parse usage telemetry/,
  );
});

test('Invalid provider counters fail instead of silently becoming zero', async () => {
  const entry = claude('2026-10-02T18:00:00Z', 'session', 'message', {
    input_tokens: '100',
  });
  await assert.rejects(
    readEntries('claude', [entry]),
    /Invalid provider token count/,
  );
});

test('Configured --local sync scans without invoking GitHub publication', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-ai-local-'));
  try {
    const codexDirectory = join(directory, 'codex');
    const claudeDirectory = join(directory, 'claude');
    const stateDirectory = join(directory, 'state');
    const binDirectory = join(directory, 'bin');
    await Promise.all(
      [codexDirectory, claudeDirectory, stateDirectory, binDirectory].map(
        (path) => mkdir(path),
      ),
    );
    const cachePath = join(directory, 't3.json');
    await writeFile(
      cachePath,
      JSON.stringify({
        version: 4,
        files: {},
        sessions: [],
        sources: {
          'codex\0root': { dir: codexDirectory },
          'claude\0root': { dir: claudeDirectory },
        },
      }),
    );
    await writeFile(
      join(stateDirectory, 'config.json'),
      JSON.stringify({ gistId: 'must-not-publish' }),
    );
    await writeFile(join(binDirectory, 'gh'), '#!/bin/sh\nexit 99\n', {
      mode: 0o700,
    });
    const output = execFileSync(
      process.execPath,
      [fileURLToPath(new URL('./sync.mjs', import.meta.url)), '--local'],
      {
        env: {
          ...process.env,
          PATH: binDirectory,
          AI_USAGE_STATE_DIR: stateDirectory,
          AI_USAGE_T3_CACHE: cachePath,
        },
        encoding: 'utf8',
      },
    );
    assert.match(output, /local only/);
    const latest = JSON.parse(
      await readFile(join(stateDirectory, 'latest.json'), 'utf8'),
    );
    assert.equal(latest.providers.codex.tokens, 0);
    assert.equal(latest.providers.claude.tokens, 0);
  } finally {
    await rm(directory, { recursive: true });
  }
});
