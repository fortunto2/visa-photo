import { useEffect, useRef, useState } from "preact/hooks";
import { compressToKb, download } from "../lib/process";
import type { ToolStrings } from "./PhotoTool";

export interface CompressStrings {
  target: string;
  run: string;
  working: string;
  was: string;
  now: string;
  missed: string;
  keepSize: string;
  download: string;
}

interface Props {
  strings: ToolStrings;
  page: CompressStrings;
}

/**
 * Targets people actually type. Every one of these appears in autocomplete attached to a
 * number — "compress image to 50kb", "уменьшить размер фото до 300 кб" — because a form said so.
 */
const TARGETS = [20, 50, 100, 200, 300, 500];

/** Longest side, offered because some forms cap the pixels as well as the weight. */
const SIDES = [0, 600, 1000, 1600];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function CompressTool({ strings, page }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState(100);
  const [maxSide, setMaxSide] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; kb: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const urls = useRef<string[]>([]);
  const keep = (u: string) => { urls.current.push(u); return u; };
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  const accept = (files: FileList | null) => {
    const f = files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setResult(null);
    setFile(f);
    setPreview(keep(URL.createObjectURL(f)));
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    try {
      setResult(await compressToKb(file, targetKb, maxSide || undefined));
    } finally {
      setBusy(false);
    }
  };

  const originalKb = file ? Math.round((file.size / 1024) * 10) / 10 : 0;
  // Compression cannot always reach an arbitrary number. Saying so beats a silent near-miss.
  const missed = result !== null && result.kb > targetKb;

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
          <input type="file" accept="image/*" hidden data-testid="kb-file"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  return (
    <div class="tool" data-testid="kb-tool">
      <div class="stage-col">
        <div class="bg-preview" style="background:var(--surface-2)">
          <img src={preview!} alt="" />
        </div>
        <p class="hint" data-testid="kb-sizes">
          {page.was} {originalKb} KB
          {result && <> · {page.now} <b>{result.kb} KB</b></>}
        </p>
        {missed && <p class="hint caveat" data-testid="kb-missed">{page.missed}</p>}
      </div>

      <div class="spec">
        <p class="spec-head">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-file" /></svg>
          {strings.fileLabel}
        </p>
        <div class="spec-body">
        <p class="hint caveat">{page.target}</p>
        <div class="funnel-row">
          {TARGETS.map((kb) => (
            <button key={kb} type="button" class={`chip${targetKb === kb ? " is-on" : ""}`}
              aria-pressed={targetKb === kb} onClick={() => { setTargetKb(kb); setResult(null); }}>
              {kb} KB
            </button>
          ))}
        </div>

        <label class="field">
          <span>KB</span>
          <input type="number" min="10" max="5000" step="10" value={targetKb} data-testid="kb-target"
            onInput={(e) => {
              setTargetKb(clamp(Number((e.target as HTMLInputElement).value) || 100, 10, 5000));
              setResult(null);
            }} />
        </label>

        <p class="hint caveat">{page.keepSize}</p>
        <div class="funnel-row">
          {SIDES.map((s) => (
            <button key={s} type="button" class={`chip${maxSide === s ? " is-on" : ""}`}
              aria-pressed={maxSide === s} onClick={() => { setMaxSide(s); setResult(null); }}>
              {s === 0 ? "—" : `${s} px`}
            </button>
          ))}
        </div>

        <div class="dl-row">
          {!result ? (
            <button class="btn-dl wide" type="button" data-testid="kb-run" disabled={busy} onClick={run}>
              {busy ? page.working : page.run}
            </button>
          ) : (
            <button class="btn-dl wide" type="button" data-testid="kb-save"
              onClick={() => download(result.blob,
                `${file.name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]/g, "").slice(0, 60) || "photo"}-${result.kb}kb.jpg`)}>
              {page.download}
            </button>
          )}
        </div>

        <button class="btn-reset" type="button" data-testid="kb-reset"
          onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
          {strings.reset}
        </button>
        </div>
      </div>
    </div>
  );
}
