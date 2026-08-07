import { useEffect, useRef, useState } from "preact/hooks";
import { cleanSignature, type SignatureResult } from "../lib/signature";
import { download } from "../lib/process";
import type { ToolStrings } from "./PhotoTool";

export interface SignatureStrings {
  threshold: string;
  thresholdHint: string;
  trim: string;
  transparent: string;
  widthLabel: string;
  minKb: string;
  maxKb: string;
  noMin: string;
  result: string;
  noInk: string;
  tooSmall: string;
  tooBig: string;
  download: string;
  fileLabel: string;
}

interface Props {
  strings: ToolStrings;
  page: SignatureStrings;
}

/** Widths the Indian portals ask for by name, plus a couple of common alternatives. */
const WIDTHS = [140, 200, 300, 400, 600];
/** The floors and ceilings those same forms state, in kilobytes. */
const MINS: (number | null)[] = [null, 5, 10, 20];
const MAXES = [10, 20, 50, 100];

export default function SignatureTool({ strings, page }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(150);
  const [trim, setTrim] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [width, setWidth] = useState(300);
  const [minKb, setMinKb] = useState<number | null>(null);
  const [maxKb, setMaxKb] = useState(20);
  const [result, setResult] = useState<SignatureResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  /** Recompute whenever any control moves: the whole tool is one live preview. */
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    cleanSignature(file, { threshold, transparent, trim, width }, { min: minKb, max: maxKb })
      .then((r) => { if (!cancelled) setResult(r); });
    return () => { cancelled = true; };
  }, [file, threshold, transparent, trim, width, minKb, maxKb]);

  const preview = result ? (() => {
    const u = URL.createObjectURL(result.blob);
    urls.current.push(u);
    return u;
  })() : null;

  const accept = (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setResult(null);
    setFile(f);
  };

  if (!file) {
    return (
      <div
        class={`drop${dragging ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer?.files ?? null); }}
      >
        <span class="drop-icon"><svg width="32" height="32" aria-hidden="true"><use href="#ic-upload" /></svg></span>
        <span class="drop-title">{strings.dropTitle}</span>
        <span class="drop-sub">{strings.dropSub}</span>
        <label class="cta">
          <svg width="21" height="21" aria-hidden="true"><use href="#ic-upload" /></svg>
          {strings.choose}
          <input type="file" accept="image/*" hidden data-testid="sig-file"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  const tooSmall = result && minKb !== null && result.kb < minKb;
  const tooBig = result && result.kb > maxKb;

  return (
    <div class="tool" data-testid="sig-tool">
      <div class="stage-col">
        <div class="sig-preview" data-transparent={String(transparent)}>
          {preview && <img src={preview} alt="" data-testid="sig-image" />}
        </div>
        {result && (
          <p class="hint" data-testid="sig-result">
            {page.result} <b>{result.width} × {result.height}</b> px · <b>{result.kb} KB</b>
          </p>
        )}
        {result && !result.foundInk && <p class="hint caveat" data-testid="sig-noink">{page.noInk}</p>}
        {tooSmall && <p class="hint caveat" data-testid="sig-small">{page.tooSmall}</p>}
        {tooBig && <p class="hint caveat" data-testid="sig-big">{page.tooBig}</p>}
      </div>

      <div class="spec">
        <p class="spec-head">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-file" /></svg>
          {page.fileLabel}
        </p>
        <div class="spec-body">
          <label class="slider">
            <span>{page.threshold}</span>
            <input type="range" min="60" max="220" value={threshold} data-testid="sig-threshold"
              onInput={(e) => setThreshold(Number((e.target as HTMLInputElement).value))} />
            <b>{threshold}</b>
          </label>
          <p class="hint caveat">{page.thresholdHint}</p>

          <label class="field">
            <span>{page.trim}</span>
            <input type="checkbox" checked={trim} data-testid="sig-trim"
              onChange={(e) => setTrim((e.target as HTMLInputElement).checked)} />
          </label>
          <label class="field">
            <span>{page.transparent}</span>
            <input type="checkbox" checked={transparent} data-testid="sig-transparent"
              onChange={(e) => setTransparent((e.target as HTMLInputElement).checked)} />
          </label>

          <p class="hint caveat">{page.widthLabel}</p>
          <div class="funnel-row">
            {WIDTHS.map((w) => (
              <button key={w} type="button" class={`chip${width === w ? " is-on" : ""}`}
                aria-pressed={width === w} onClick={() => setWidth(w)}>{w} px</button>
            ))}
          </div>

          <p class="hint caveat">{page.maxKb}</p>
          <div class="funnel-row">
            {MAXES.map((kb) => (
              <button key={kb} type="button" class={`chip${maxKb === kb ? " is-on" : ""}`}
                aria-pressed={maxKb === kb} onClick={() => setMaxKb(kb)}>{kb} KB</button>
            ))}
          </div>

          {/* The floor, which is the half of the rule other tools ignore. */}
          <p class="hint caveat">{page.minKb}</p>
          <div class="funnel-row">
            {MINS.map((kb) => (
              <button key={String(kb)} type="button" class={`chip${minKb === kb ? " is-on" : ""}`}
                aria-pressed={minKb === kb} onClick={() => setMinKb(kb)}>
                {kb === null ? page.noMin : `${kb} KB`}
              </button>
            ))}
          </div>

          <div class="dl-row">
            <button class="btn-dl wide" type="button" data-testid="sig-save" disabled={!result}
              onClick={() => result && download(result.blob,
                `signature-${result.width}px-${result.kb}kb.${transparent ? "png" : "jpg"}`)}>
              {page.download}
            </button>
          </div>

          <button class="btn-reset" type="button" data-testid="sig-reset"
            onClick={() => { setFile(null); setResult(null); }}>
            {strings.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
