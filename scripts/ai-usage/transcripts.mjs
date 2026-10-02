import { createReadStream } from 'node:fs';

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
      const tokens =
        tokenCount(usage.input_tokens) +
        tokenCount(usage.cache_read_input_tokens) +
        tokenCount(usage.cache_creation_input_tokens) +
        tokenCount(usage.output_tokens);
      const key =
        entry.message.id || entry.requestId
          ? `${entry.message.id ?? ''}:${entry.requestId ?? ''}`
          : null;
      records.push([timestamp, entry.sessionId ?? '', tokens, key]);
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
    const tokens =
      Math.max(0, input - cached - creation) +
      cached +
      creation +
      tokenCount(usage.output_tokens);
    if (tokens > 0) {
      records.push([timestamp, session, tokens, null]);
    }
  }
  return records;
};

export const aggregateUsage = (files, now = new Date()) => {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' });
  const windowEnd = day.format(now);
  const end = new Date(`${windowEnd}T00:00:00+07:00`);
  const windowStart = day.format(new Date(end.getTime() - 29 * 86400000));
  const providers = {
    codex: { tokens: 0, sessions: 0 },
    claude: { tokens: 0, sessions: 0 },
  };
  const sessions = { codex: new Set(), claude: new Set() };
  const seen = new Set();
  for (const file of Object.values(files)) {
    for (const [timestamp, session, tokens, key] of file.records) {
      if (key !== null) {
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
      }
      const recordDay = day.format(timestamp);
      if (recordDay < windowStart || recordDay > windowEnd) {
        continue;
      }
      providers[file.provider].tokens += tokens;
      if (session) {
        sessions[file.provider].add(session);
      }
    }
  }
  for (const provider of ['codex', 'claude']) {
    providers[provider].sessions = sessions[provider].size;
  }
  return {
    version: 1,
    windowStart,
    windowEnd,
    updatedAt: now.toISOString(),
    sourceUpdatedAt: now.toISOString(),
    providers,
  };
};
