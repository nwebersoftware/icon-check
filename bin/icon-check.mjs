#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { checkIcon, formatReport } from '../src/check.mjs';

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log('usage: icon-check <icon.png> [--android]');
  process.exit(args.length ? 0 : 2);
}

const path = args.find((a) => !a.startsWith('--'));
const platform = args.includes('--android') ? 'android' : 'ios';

if (!path) {
  console.error('usage: icon-check <icon.png> [--android]');
  process.exit(2);
}

try {
  const report = checkIcon(readFileSync(path), { platform });
  console.log(formatReport(report, path));
  process.exit(report.ok ? 0 : 1);
} catch (e) {
  console.error(`icon-check: ${e.message}`);
  process.exit(2);
}
