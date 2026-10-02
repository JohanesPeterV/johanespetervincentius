import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const stateDir = join(
  homedir(),
  'Library',
  'Application Support',
  'portfolio-ai-usage',
);
const config = JSON.parse(
  await readFile(join(stateDir, 'config.json'), 'utf8'),
);
if (!config.gistId) {
  throw new Error(
    'Create the aggregate usage Gist before installing the schedule.',
  );
}
const label = 'com.johanespeter.portfolio-ai-usage';
const directory = join(homedir(), 'Library', 'LaunchAgents');
const path = join(directory, `${label}.plist`);
const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const text = (value) => `<string>${escapeXml(value)}</string>`;
await mkdir(directory, { recursive: true });
const existing = execFileSync('launchctl', ['list'], { encoding: 'utf8' });
if (existing.split('\n').some((line) => line.endsWith('\t' + label))) {
  throw new Error(
    'Usage schedule is already installed. Remove its LaunchAgent before reinstalling.',
  );
}
await writeFile(
  path,
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key>${text(label)}
<key>ProgramArguments</key><array>${text(process.execPath)}${text(resolve('scripts/ai-usage/sync.mjs'))}</array>
<key>WorkingDirectory</key>${text(process.cwd())}
<key>EnvironmentVariables</key><dict><key>PATH</key>${text('/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin')}</dict>
<key>RunAtLoad</key><true/>
<key>StartInterval</key><integer>900</integer>
<key>StandardOutPath</key>${text(join(stateDir, 'sync.log'))}
<key>StandardErrorPath</key>${text(join(stateDir, 'sync-error.log'))}
</dict></plist>
`,
  { mode: 0o600 },
);
execFileSync('launchctl', ['bootstrap', `gui/${process.getuid()}`, path]);
console.log(
  `Installed ${label}; refresh every 15 minutes while this Mac is logged in.`,
);
