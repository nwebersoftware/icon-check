import { parsePng } from './png.mjs';

function finish(checks) {
  const failed = checks.filter((c) => c.severity === 'fail' && !c.ok);
  const warned = checks.filter((c) => c.severity === 'warn' && !c.ok);
  return { ok: failed.length === 0, checks, failed, warned };
}

/** Audit a PNG app icon against App Store / Google Play icon rules. */
export function checkIcon(buf, opts = {}) {
  const platform = opts.platform === 'android' ? 'android' : 'ios';
  const checks = [];
  const add = (id, severity, ok, detail) => checks.push({ id, severity, ok, detail });

  let png;
  try {
    png = parsePng(buf);
  } catch (e) {
    add('png', 'fail', false, e.message);
    return finish(checks);
  }
  add('png', 'fail', true, `${png.width}×${png.height}${png.hasAlpha ? ', has alpha' : ', opaque'}`);

  add('square', 'fail', png.width === png.height, png.width === png.height ? 'square' : 'not square — app icons must be square');

  if (platform === 'ios') {
    const is1024 = png.width === 1024 && png.height === 1024;
    add('ios-size', 'warn', is1024, is1024 ? '1024×1024 (App Store size)' : `not 1024×1024 (is ${png.width}×${png.height}) — the App Store icon must be 1024×1024`);
    add('ios-alpha', 'fail', !png.hasAlpha, png.hasAlpha ? 'has an alpha channel — the App Store icon must have NO transparency' : 'no alpha channel (App Store-safe)');
  } else {
    add('android-alpha', 'warn', png.hasAlpha, png.hasAlpha ? 'has alpha (good for an adaptive-icon foreground)' : 'no alpha — the adaptive-icon foreground layer usually needs transparency');
    add('android-size', 'warn', png.width >= 432, png.width >= 432 ? `${png.width}px (ample density)` : `${png.width}px — adaptive foregrounds are usually ≥ 432×432`);
  }

  return finish(checks);
}

export function formatReport(report, label = '') {
  const out = ['icon-check — app icon audit'];
  if (label) out.push(`file: ${label}`);
  out.push('');
  for (const c of report.checks) {
    out.push(`${c.ok ? '✓' : c.severity === 'fail' ? '✗' : '!'} ${c.id}  ${c.detail}`);
  }
  out.push('');
  if (report.ok) out.push(report.warned.length ? `PASS (${report.warned.length} warning${report.warned.length > 1 ? 's' : ''})` : 'PASS — no issues found.');
  else out.push(`FAIL — ${report.failed.length} blocking issue${report.failed.length > 1 ? 's' : ''}.`);
  return out.join('\n');
}
