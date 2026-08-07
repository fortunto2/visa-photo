import { useEffect, useRef, useState } from "preact/hooks";
import { scansToPdf, type PageFit, type ScanPdfResult } from "../lib/scansToPdf";
import { download } from "../lib/process";
import type { ToolStrings } from "./PhotoTool";

export interface ScansStrings {
  addMore: string;
  fitLabel: string;
  fitImage: string;
  fitA4: string;
  target: string;
  noLimit: string;
  run: string;
  working: string;
  result: string;
  missed: string;
  download: string;
  fileLabel: string;
  up: string;
  down: string;
  remove: string;
  order: string;
}

interface Props {
  strings: ToolStrings;
  page: ScansStrings;
}

const TARGETS: (number | null)[] = [1, 2, 5, 10, null];

export default function ScansTool({ strings, page }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [fit, setFit] = useState<PageFit>("fit");
  const [targetMb, setTargetMb] = useState<number | null>(2);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<ScanPdfResult | null>(null);
  const [dragging, setDragging] = useState(false);

  /** Thumbnails, keyed by position, revoked together when the component goes away. */
  const [thumbs, setThumbs] = useState<string[]>([]);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  const accept = (list: FileList | null) => {
    const incoming = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) return;
    setResult(null);
    setFiles((prev) => [...prev, ...incoming]);
    setThumbs((prev) => [
      ...prev,
      ...incoming.map((f) => {
        const u = URL.createObjectURL(f);
        urls.current.push(u);
        return u;
      }),
    ]);
  };

  /** Order is the whole point of assembling by hand, so it has to be changeable. */
  const move = (i: number, by: number) => {
    const j = i + by;
    if (j < 0 || j >= files.length) return;
    const swap = <T,>(a: T[]) => { const c = [...a]; [c[i], c[j]] = [c[j], c[i]]; return c; };
    setFiles(swap);
    setThumbs(swap);
    setResult(null);
  };

  const drop = (i: number) => {
    setFiles((p) => p.filter((_, n) => n !== i));
    setThumbs((p) => p.filter((_, n) => n !== i));
    setResult(null);
  };

  const run = async () => {
    setBusy(page.working);
    try {
      setResult(await scansToPdf(files, fit, targetMb, (m) => setBusy(`${page.working} ${m}`)));
    } finally {
      setBusy(null);
    }
  };

  const missed = result !== null && targetMb !== null && result.mb > targetMb;

  if (!files.length) {
    return (
      <div
        class={`drop${dragging ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer?.files ?? null); }}
      >
        <span class="drop-icon"><svg width="32" height="32" aria-hidden="true"><use href="#ic-copies" /></svg></span>
        <span class="drop-title">{strings.dropTitle}</span>
        <span class="drop-sub">{strings.dropSub}</span>
        <label class="cta">
          <svg width="21" height="21" aria-hidden="true"><use href="#ic-upload" /></svg>
          {strings.choose}
          <input type="file" accept="image/*" multiple hidden data-testid="scans-file"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  return (
    <div class="tool" data-testid="scans-tool">
      <div class="stage-col">
        <p class="hint caveat">{page.order}</p>
        <ol class="scan-list" data-testid="scan-list">
          {thumbs.map((src, i) => (
            <li key={src}>
              <img src={src} alt="" />
              <span class="scan-n">{i + 1}</span>
              <span class="scan-acts">
                <button type="button" title={page.up} aria-label={page.up}
                  disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" title={page.down} aria-label={page.down}
                  disabled={i === thumbs.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" title={page.remove} aria-label={page.remove}
                  onClick={() => drop(i)}>×</button>
              </span>
            </li>
          ))}
        </ol>

        <label class="cta-alt">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-upload" /></svg>
          {page.addMore}
          <input type="file" accept="image/*" multiple hidden data-testid="scans-more"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>

        {busy && <p class="hint" data-testid="scans-busy">{busy}</p>}
        {result && (
          <p class="hint" data-testid="scans-result">
            {page.result} <b>{result.mb} MB</b> · {result.pages}
          </p>
        )}
        {missed && <p class="hint caveat" data-testid="scans-missed">{page.missed}</p>}
      </div>

      <div class="spec">
        <p class="spec-head">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-file" /></svg>
          {page.fileLabel}
        </p>
        <div class="spec-body">
          <p class="hint caveat">{page.fitLabel}</p>
          <div class="funnel-row">
            <button type="button" class={`chip${fit === "fit" ? " is-on" : ""}`}
              aria-pressed={fit === "fit"} onClick={() => { setFit("fit"); setResult(null); }}>
              {page.fitImage}
            </button>
            <button type="button" class={`chip${fit === "a4" ? " is-on" : ""}`}
              aria-pressed={fit === "a4"} onClick={() => { setFit("a4"); setResult(null); }}>
              {page.fitA4}
            </button>
          </div>

          <p class="hint caveat">{page.target}</p>
          <div class="funnel-row">
            {TARGETS.map((mb) => (
              <button key={String(mb)} type="button" class={`chip${targetMb === mb ? " is-on" : ""}`}
                aria-pressed={targetMb === mb}
                onClick={() => { setTargetMb(mb); setResult(null); }}>
                {mb === null ? page.noLimit : `${mb} MB`}
              </button>
            ))}
          </div>

          <div class="dl-row">
            {!result ? (
              <button class="btn-dl wide" type="button" data-testid="scans-run"
                disabled={busy !== null} onClick={run}>
                {busy ? page.working : page.run}
              </button>
            ) : (
              <button class="btn-dl wide" type="button" data-testid="scans-save"
                onClick={() => download(result.blob, `documents-${result.pages}p-${result.mb}mb.pdf`)}>
                {page.download}
              </button>
            )}
          </div>

          <button class="btn-reset" type="button" data-testid="scans-reset"
            onClick={() => { setFiles([]); setThumbs([]); setResult(null); }}>
            {strings.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
