import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync, crc32 } from 'node:zlib';

import { parsePng } from '../src/png.mjs';
import { checkIcon, formatReport } from '../src/check.mjs';

function chunk(type, data) {
  const t = Buffer.from(type, 'latin1');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])) >>> 0, 0);
  return Buffer.concat([len, t, data, crc]);
}

/** Minimal PNG encoder — enough to exercise the parser. */
export function makePng(w, h, colorType = 6) {
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const raw = Buffer.alloc(h * (1 + w * channels));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

test('parses dimensions and alpha (RGBA)', () => {
  const p = parsePng(makePng(1024, 1024, 6));
  assert.equal(p.width, 1024);
  assert.equal(p.height, 1024);
  assert.equal(p.hasAlpha, true);
});

test('RGB has no alpha', () => {
  const p = parsePng(makePng(1024, 1024, 2));
  assert.equal(p.hasAlpha, false);
});

test('passes a 1024×1024 opaque icon', () => {
  const r = checkIcon(makePng(1024, 1024, 2));
  assert.equal(r.ok, true);
  assert.equal(r.warned.length, 0);
});

test('fails an icon with alpha (App Store)', () => {
  const r = checkIcon(makePng(1024, 1024, 6));
  assert.equal(r.ok, false);
  assert.ok(r.failed.some((c) => c.id === 'ios-alpha'));
});

test('warns on a non-1024 icon', () => {
  const r = checkIcon(makePng(512, 512, 2));
  assert.equal(r.ok, true);
  assert.ok(r.warned.some((c) => c.id === 'ios-size'));
});

test('fails a non-square icon', () => {
  const r = checkIcon(makePng(1024, 512, 2));
  assert.equal(r.ok, false);
  assert.ok(formatReport(r).includes('FAIL'));
});

test('android mode expects alpha', () => {
  const r = checkIcon(makePng(512, 512, 2), { platform: 'android' });
  assert.ok(r.warned.some((c) => c.id === 'android-alpha'));
});

test('rejects non-PNG input', () => {
  assert.throws(() => parsePng(Buffer.from('definitely not a png')));
});
