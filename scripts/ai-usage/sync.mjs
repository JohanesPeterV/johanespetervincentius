import {
  readdir,
  readFile,
  stat,
  writeFile,
  mkdir,
  rename,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { aggregateUsage, readTranscript } from './transcripts.mjs';

const stateDir =
  process.env.AI_USAGE_STATE_DIR ??
  join(homedir(), 'Library', 'Application Support', 'portfolio-ai-usage');
const t3CachePath =
  process.env.AI_USAGE_T3_CACHE ??
  join(homedir(), '.t3', 'userdata', 'usage-scan-cache.json');
const t3RatesPath =
  process.env.AI_USAGE_T3_RATES ??
  join(homedir(), '.t3', 'userdata', 'usage-model-rates.json');
const statePath = join(stateDir, 'scan.json');
const configPath = join(stateDir, 'config.json');
const snapshotPath = resolve('src/data/ai-usage.json');
const retainedSince = Date.now() - 32 * 86400000;

const readJson = async (path) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

const collectPaths = async (directory) => {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectPaths(path)));
    } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
      paths.push(path);
    }
  }
  return paths;
};

await mkdir(stateDir, { recursive: true, mode: 0o700 });
const t3 = await readJson(t3CachePath);
if (
  t3?.version !== 4 ||
  !t3.files ||
  !t3.sources ||
  !Array.isArray(t3.sessions) ||
  !Array.isArray(t3.models)
) {
  throw new Error('Unsupported T3 usage cache. Expected schema version 4.');
}
const rates = (await readJson(t3RatesPath))?.document;
if (!rates || typeof rates !== 'object') {
  throw new Error('T3 model rates are unavailable.');
}
const previous = await readJson(statePath);
const files = previous?.version === 2 ? previous.files : {};
const roots = [];
for (const [key, source] of Object.entries(t3.sources)) {
  const provider = key.split('\0')[0];
  if (provider === 'codex' || provider === 'claude') {
    roots.push({ provider, directory: source.dir });
  }
}
if (
  !roots.some((root) => root.provider === 'codex') ||
  !roots.some((root) => root.provider === 'claude')
) {
  throw new Error('Both Codex and Claude telemetry sources are required.');
}
const current = {};
let refreshed = 0;
for (const { provider, directory } of roots) {
  for (const path of await collectPaths(directory)) {
    const info = await stat(path);
    if (info.mtimeMs < retainedSince) {
      continue;
    }
    const cached = files[path];
    if (cached?.size === info.size && cached?.mtimeMs === info.mtimeMs) {
      current[path] = cached;
      continue;
    }
    const seed = t3.files[path];
    let records;
    if (
      seed?.s === info.size &&
      seed?.m === info.mtimeMs &&
      seed?.p === provider
    ) {
      records = [...seed.r, ...seed.t].map((row) => {
        if (
          row.length !== 11 ||
          !row
            .slice(3, 7)
            .every((value) => Number.isSafeInteger(value) && value >= 0)
        ) {
          throw new Error('Invalid T3 usage record.');
        }
        return [
          row[0],
          t3.sessions[row[2]] ?? '',
          t3.models[row[1]],
          ...row.slice(3, 7),
          row[8],
        ];
      });
    } else {
      records = await readTranscript(path, provider, info.size);
      refreshed += 1;
    }
    current[path] = {
      provider,
      size: info.size,
      mtimeMs: info.mtimeMs,
      records: records.filter((row) => row[0] >= retainedSince),
    };
  }
}
const usage = aggregateUsage(current, rates);
const config = await readJson(configPath);
if (process.argv.includes('--create')) {
  if (config) {
    throw new Error('Usage Gist is already configured.');
  }
  const result = execFileSync(
    'gh',
    ['api', '--method', 'POST', '/gists', '--input', '-'],
    {
      input: JSON.stringify({
        public: true,
        description:
          'Personal AI development usage: aggregate rolling 30-day totals',
        files: {
          'ai-usage.json': { content: JSON.stringify(usage, null, 2) + '\n' },
        },
      }),
      encoding: 'utf8',
    },
  );
  const gist = JSON.parse(result);
  await writeFile(
    configPath,
    JSON.stringify(
      {
        gistId: gist.id,
        url: gist.files['ai-usage.json'].raw_url.replace(
          /\/raw\/[^/]+\//,
          '/raw/',
        ),
      },
      null,
      2,
    ) + '\n',
    { mode: 0o600 },
  );
} else if (config && !process.argv.includes('--local')) {
  execFileSync(
    'gh',
    ['api', '--method', 'PATCH', `/gists/${config.gistId}`, '--input', '-'],
    {
      input: JSON.stringify({
        files: {
          'ai-usage.json': { content: JSON.stringify(usage, null, 2) + '\n' },
        },
      }),
      stdio: ['pipe', 'ignore', 'pipe'],
    },
  );
} else if (!process.argv.includes('--local')) {
  throw new Error(
    'Run node scripts/ai-usage/sync.mjs --create to configure aggregate publication.',
  );
}
await writeFile(
  statePath + '.tmp',
  JSON.stringify({ version: 2, files: current }),
  { mode: 0o600 },
);
await rename(statePath + '.tmp', statePath);
await writeFile(
  join(stateDir, 'latest.json'),
  JSON.stringify(usage, null, 2) + '\n',
  { mode: 0o600 },
);
if (process.argv.includes('--snapshot')) {
  await writeFile(snapshotPath, JSON.stringify(usage, null, 2) + '\n');
}
console.log(
  `AI usage updated ${usage.updatedAt}; ${refreshed} changed transcripts scanned; ${(config && !process.argv.includes('--local')) || process.argv.includes('--create') ? 'published' : 'local only'}.`,
);
