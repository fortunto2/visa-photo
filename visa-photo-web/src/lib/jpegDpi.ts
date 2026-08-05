/**
 * Writes a resolution into a JPEG's JFIF header.
 *
 * Canvas exports say 72 dpi — or nothing at all — no matter what the pixels represent. Forms
 * that check the field then read a 600x600 photo as 8 inches wide. The State Department's own
 * tool stamps 300 dpi for exactly this reason, and it is the one thing our export was missing
 * while the pixel dimensions were already right.
 *
 * Only the JFIF APP0 segment is touched: three fields, no re-encoding, no quality loss.
 */

const JFIF_UNITS_DPI = 1;

export async function withJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  const buffer = new Uint8Array(await blob.arrayBuffer());

  // SOI marker, then the first segment must be APP0/JFIF for the simple path to be valid.
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return blob;

  let offset = 2;
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = (buffer[offset + 2] << 8) | buffer[offset + 3];

    if (marker === 0xe0) {
      // JFIF layout: 'JFIF\0' (5) + version (2) + units (1) + Xdensity (2) + Ydensity (2)
      const jfif = offset + 4;
      const isJfif =
        buffer[jfif] === 0x4a && buffer[jfif + 1] === 0x46 &&
        buffer[jfif + 2] === 0x49 && buffer[jfif + 3] === 0x46;
      if (!isJfif) return blob;

      const units = jfif + 7;
      buffer[units] = JFIF_UNITS_DPI;
      buffer[units + 1] = (dpi >> 8) & 0xff;
      buffer[units + 2] = dpi & 0xff;
      buffer[units + 3] = (dpi >> 8) & 0xff;
      buffer[units + 4] = dpi & 0xff;
      return new Blob([buffer], { type: "image/jpeg" });
    }

    // Anything before APP0 that is not a segment we can skip means an unusual file; leave it.
    if (marker === 0xda || length <= 0) break;
    offset += 2 + length;
  }

  return blob;
}
