// Minimal PNG header parser: dimensions, colour type, and whether the image
// carries an alpha channel (colour type 4/6, or a tRNS chunk). Dependency-free.

const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function parsePng(buf) {
  if (buf.length < 8) throw new Error('file too small to be a PNG');
  for (let i = 0; i < 8; i += 1) {
    if (buf[i] !== SIG[i]) throw new Error('not a PNG (bad signature)');
  }

  let off = 8;
  let ihdr = null;
  let hasTrns = false;

  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    const dataStart = off + 8;
    if (type === 'IHDR') {
      ihdr = {
        width: buf.readUInt32BE(dataStart),
        height: buf.readUInt32BE(dataStart + 4),
        bitDepth: buf[dataStart + 8],
        colorType: buf[dataStart + 9],
        interlace: buf[dataStart + 12],
      };
    }
    if (type === 'tRNS') hasTrns = true;
    if (type === 'IEND') break;
    off += 12 + len; // length(4) + type(4) + data + crc(4)
  }

  if (!ihdr) throw new Error('no IHDR chunk found');
  const alphaByType = ihdr.colorType === 4 || ihdr.colorType === 6;
  return { ...ihdr, hasAlpha: alphaByType || hasTrns, alphaByType, hasTrns };
}
