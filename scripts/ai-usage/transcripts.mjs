import { createReadStream } from 'node:fs';

// REASON: records are positional tuples because the private scan cache holds
// hundreds of thousands of them; this pair is the only place that knows the
// field order.
export const packRecord = ({
  timestamp,
  session,
  model,
  input,
  cacheRead,
  cacheWrite,
  output,
  key,
}) => [timestamp, session, model, input, cacheRead, cacheWrite, output, key];

export const unpackRecord = ([
  timestamp,
  session,
  model,
  input,
  cacheRead,
  cacheWrite,
  output,
  key,
]) => ({
  timestamp,
  session,
  model,
  input,
  cacheRead,
  cacheWrite,
  output,
  key,
});

const tokenCount = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid provider token count.');
  }
  return Math.trunc(value);
};

const readCompleteLines = async function* (path, size) {
  let pending = '';
  for await (const chunk of createReadStream(path, {
    encoding: 'utf8',
    end: size - 1,
  })) {
    const lines = (pending + chunk).split('\n');
    pending = lines.pop();
    yield* lines;
  }
};

export const readTranscript = async (path, provider, size) => {
  const records = [];
  let session = '';
  let model = '';
  let signature = null;
  let forkAnchor = null;
  let sawMetadata = false;
  for await (const line of readCompleteLines(path, size)) {
    if (
      !line.includes('"usage"') &&
      !line.includes('"token_count"') &&
      !line.includes('"session_meta"') &&
      !line.includes('"turn_context"')
    ) {
      continue;
    }
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (error) {
      throw new Error(`Cannot parse usage telemetry in ${path}`, {
        cause: error,
      });
    }
    const timestamp = Date.parse(entry.timestamp);
    if (provider === 'claude') {
      const usage = entry.message?.usage;
      if (
        entry.type !== 'assistant' ||
        !usage ||
        !entry.message?.model ||
        !Number.isFinite(timestamp)
      ) {
        continue;
      }
      const key =
        entry.message.id || entry.requestId
          ? `${entry.message.id ?? ''}:${entry.requestId ?? ''}`
          : null;
      records.push(
        packRecord({
          timestamp,
          session: entry.sessionId ?? '',
          model: entry.message.model,
          input: tokenCount(usage.input_tokens),
          cacheRead: tokenCount(usage.cache_read_input_tokens),
          cacheWrite: tokenCount(usage.cache_creation_input_tokens),
          output: tokenCount(usage.output_tokens),
          key,
        }),
      );
      continue;
    }
    const payload = entry.payload;
    if (entry.type === 'turn_context') {
      model = payload?.model ?? model;
      continue;
    }
    if (entry.type === 'session_meta' && !sawMetadata) {
      sawMetadata = true;
      session = payload?.id ?? payload?.session_id ?? '';
      if (
        payload?.forked_from_id ||
        payload?.source?.subagent?.thread_spawn?.parent_thread_id
      ) {
        forkAnchor = timestamp;
      }
      continue;
    }
    const usage = payload?.info?.last_token_usage;
    if (
      payload?.type !== 'token_count' ||
      !usage ||
      !model ||
      !Number.isFinite(timestamp)
    ) {
      continue;
    }
    const nextSignature = JSON.stringify(usage);
    if (nextSignature === signature) {
      continue;
    }
    signature = nextSignature;
    if (forkAnchor !== null) {
      if (timestamp - forkAnchor < 1000) {
        forkAnchor = timestamp;
        continue;
      }
      forkAnchor = null;
    }
    const input = tokenCount(usage.input_tokens);
    const cached = tokenCount(usage.cached_input_tokens);
    const creation = tokenCount(usage.cache_write_input_tokens);
    const uncached = Math.max(0, input - cached - creation);
    const output = tokenCount(usage.output_tokens);
    if (uncached + cached + creation + output > 0) {
      records.push(
        packRecord({
          timestamp,
          session,
          model,
          input: uncached,
          cacheRead: cached,
          cacheWrite: creation,
          output,
          key: null,
        }),
      );
    }
  }
  return records;
};

// REASON: models missing from T3's rates cost $0, matching T3's API estimate,
// so a brand-new model never blocks publication.
const estimateCost = (record, rates) => {
  const rate = rates[record.model] ?? {};
  return (
    record.input * (rate.input_cost_per_token ?? 0) +
    record.cacheRead * (rate.cache_read_input_token_cost ?? 0) +
    record.cacheWrite * (rate.cache_creation_input_token_cost ?? 0) +
    record.output * (rate.output_cost_per_token ?? 0)
  );
};

const roundToCents = (dollars) => Math.round(dollars * 100) / 100;

export const aggregateUsage = (files, rates, now = new Date()) => {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' });
  const windowEnd = day.format(now);
  const end = new Date(`${windowEnd}T00:00:00+07:00`);
  const dates = Array.from({ length: 30 }, (_, index) =>
    day.format(new Date(end.getTime() - (29 - index) * 86400000)),
  );
  const dailyCost = new Map(
    dates.map((date) => [date, { date, codex: 0, claude: 0 }]),
  );
  const providers = {
    codex: { tokens: 0, sessions: 0, cost: 0 },
    claude: { tokens: 0, sessions: 0, cost: 0 },
  };
  const sessions = { codex: new Set(), claude: new Set() };
  const seen = new Set();
  for (const file of Object.values(files)) {
    for (const record of file.records.map(unpackRecord)) {
      if (record.key !== null) {
        if (seen.has(record.key)) {
          continue;
        }
        seen.add(record.key);
      }
      const dayCost = dailyCost.get(day.format(record.timestamp));
      if (!dayCost) {
        continue;
      }
      const cost = estimateCost(record, rates);
      dayCost[file.provider] += cost;
      providers[file.provider].tokens +=
        record.input + record.cacheRead + record.cacheWrite + record.output;
      providers[file.provider].cost += cost;
      if (record.session) {
        sessions[file.provider].add(record.session);
      }
    }
  }
  for (const provider of ['codex', 'claude']) {
    providers[provider].sessions = sessions[provider].size;
    providers[provider].cost = roundToCents(providers[provider].cost);
  }
  return {
    version: 2,
    windowStart: dates[0],
    windowEnd,
    updatedAt: now.toISOString(),
    sourceUpdatedAt: now.toISOString(),
    providers,
    dailyCost: [...dailyCost.values()].map(({ date, codex, claude }) => ({
      date,
      codex: roundToCents(codex),
      claude: roundToCents(claude),
    })),
  };
};
