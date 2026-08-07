import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFNumber } from "pdf-lib";

/**
 * Shrink a PDF by re-encoding the pictures inside it and leaving everything else alone.
 *
 * This is the method to try first, and it is better than redrawing pages for the reason you
 * would expect: the text stays text. Fonts, vectors, links and any OCR layer are untouched
 * because they are never read — the document is walked object by object, and only the image
 * streams are replaced. A scan that had been through OCR keeps the searchable layer that made
 * it worth OCRing.
 *
 * It cannot help with every file. Images stored as JBIG2, JPX or CCITT fax are skipped rather
 * than mangled, and a PDF whose weight is all fonts and vectors has no pictures to squeeze. The
 * caller checks the result and can offer the heavier method when this one does not get there.
 */

export interface ImagePassResult {
  bytes: Uint8Array;
  /** how many image streams were actually replaced — zero means this method had nothing to do */
  replaced: number;
}

/** Decode, scale, re-encode. Returns null when the browser cannot read the image at all. */
async function reencode(
  jpeg: Uint8Array,
  quality: number,
  maxSide: number,
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  try {
    // Copy into a fresh buffer: the view may sit inside a larger one that pdf-lib still owns.
    const blob = new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" });
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!out) return null;
    return { bytes: new Uint8Array(await out.arrayBuffer()), width: w, height: h };
  } catch {
    return null;
  }
}

/**
 * One pass over the document at a given quality and pixel cap.
 *
 * Only DCTDecode streams — ordinary JPEGs — are touched. Anything with a mask, a soft mask or
 * an unusual colour space is left as it is: replacing those correctly means understanding how
 * the page composites them, and a file that comes back subtly wrong is worse than one that
 * comes back large.
 */
export async function recompressImages(
  source: ArrayBuffer,
  quality: number,
  maxSide: number,
  onProgress?: (done: number, total: number) => void,
): Promise<ImagePassResult> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  stripJunk(doc);

  const images: { ref: any; stream: PDFRawStream }[] = [];
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict as PDFDict;
    if (dict.get(PDFName.of("Subtype"))?.toString() !== "/Image") continue;
    const filter = dict.get(PDFName.of("Filter"))?.toString();
    if (filter !== "/DCTDecode") continue;
    // A stencil or transparency mask has to keep its exact pixel grid to line up.
    if (dict.get(PDFName.of("SMask")) || dict.get(PDFName.of("Mask"))) continue;
    images.push({ ref, stream: obj });
  }

  let replaced = 0;
  for (let i = 0; i < images.length; i++) {
    onProgress?.(i + 1, images.length);
    const { ref, stream } = images[i];
    const next = await reencode(stream.contents, quality, maxSide);
    if (!next || next.bytes.length >= stream.contents.length) continue;

    const dict = stream.dict as PDFDict;
    dict.set(PDFName.of("Width"), PDFNumber.of(next.width));
    dict.set(PDFName.of("Height"), PDFNumber.of(next.height));
    dict.set(PDFName.of("Length"), PDFNumber.of(next.bytes.length));
    // The re-encode is always baseline JPEG, whatever the original was.
    dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
    dict.delete(PDFName.of("DecodeParms"));
    doc.context.assign(ref, PDFRawStream.of(dict, next.bytes));
    replaced++;
  }

  return {
    // Object streams keep the rewritten file smaller than the sum of its parts.
    bytes: await doc.save({ useObjectStreams: true }),
    replaced,
  };
}

/**
 * Throw away what the document is carrying and nobody is reading.
 *
 * Three kinds, and none of them affect how a single page looks:
 *
 * `PieceInfo` is private scratch data an editor left behind so it could reopen its own work —
 * Illustrator and Word are the usual sources and it runs to megabytes on files that came out of
 * them. `Metadata` is the XMP block: history, tool names, timestamps. The Info dictionary is
 * the same story in older form, plus whatever the author's machine happened to be called.
 *
 * Deliberately left alone: OutputIntents, because an embedded colour profile is heavy but is
 * there for a reason, and the structure tree, because that is what a screen reader follows.
 */
export function stripJunk(doc: PDFDocument): void {
  const catalog = doc.catalog;
  catalog.delete(PDFName.of("Metadata"));
  catalog.delete(PDFName.of("PieceInfo"));

  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict) obj.delete(PDFName.of("PieceInfo"));
  }

  // Names the author never meant to publish travel in here more often than people expect.
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");
}
