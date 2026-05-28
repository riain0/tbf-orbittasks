#!/usr/bin/env node
/**
 * Reads ./baseline.log and prints a human-friendly summary.
 *
 *   $ node scripts/analyze-baseline.js
 *
 * Used by students in Workshop 2 to rank pipeline stages by duration.
 */

const fs = require('fs');
const path = require('path');

const LOG = path.resolve(process.cwd(), 'baseline.log');

if (!fs.existsSync(LOG)) {
  console.error(`No baseline.log found at ${LOG}.`);
  console.error('Run `npm run ci` first.');
  process.exit(1);
}

const lines = fs.readFileSync(LOG, 'utf8').split('\n');
const stages = [];
const startRe = /--- START (.+) ---$/;
const endRe = /--- END\s+(\S+)\s+\((\d+)s\)\s+(PASS|FAIL)/;

let current = null;
for (const line of lines) {
  const s = line.match(startRe);
  if (s) {
    current = { name: s[1].trim(), startedAt: line.slice(1, 9) };
    continue;
  }
  const e = line.match(endRe);
  if (e && current) {
    current.duration = Number(e[2]);
    current.status = e[3];
    stages.push(current);
    current = null;
  }
}

if (stages.length === 0) {
  console.error('baseline.log was found but no stages parsed. Did the run start?');
  process.exit(1);
}

const total = stages.reduce((acc, s) => acc + s.duration, 0);

const sorted = [...stages].sort((a, b) => b.duration - a.duration);

const pad = (s, n) => String(s).padEnd(n);
const padNum = (s, n) => String(s).padStart(n);

console.log('');
console.log('Pipeline baseline summary');
console.log('=========================');
console.log('');
console.log(pad('Stage', 16) + padNum('Duration', 10) + '   ' + padNum('% of total', 12) + '   Status');
console.log('-'.repeat(56));
for (const s of sorted) {
  const pct = total > 0 ? ((s.duration / total) * 100).toFixed(1) + '%' : '—';
  console.log(
    pad(s.name, 16) +
    padNum(`${s.duration}s`, 10) +
    '   ' + padNum(pct, 12) +
    '   ' + s.status,
  );
}
console.log('-'.repeat(56));
console.log(pad('TOTAL', 16) + padNum(`${total}s`, 10) + `   (~${Math.floor(total/60)}m ${total%60}s)`);
console.log('');

const top = sorted[0];
if (top) {
  console.log(`Biggest hotspot: ${top.name} (${top.duration}s, ${((top.duration/total)*100).toFixed(0)}% of total).`);
  console.log('See workshops/02-profiling/handout.md to apply 5 Whys to this.');
}
