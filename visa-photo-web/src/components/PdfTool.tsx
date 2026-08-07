import { useState } from "preact/hooks";
import { compressPdfToMb, type PdfResult } from "../lib/pdf";
import { download } from "../lib/process";
import type { ToolStrings } from "./PhotoTool";

export interface PdfStrings {
  target: string;
  run: string;
  working: string;
  was: string;
  now: string;
  pages: string;
  missed: string;
  rasterWarning: string;
  keptText: string;
  becameImages: string;
  download: string;
  fileLabel: string;
}

interface Props {
  strings: ToolStrings;
  page: PdfStrings;
}

/** The numbers forms state, and the numbers autocomplete carries: 1, 2, 5, 10 MB. */
const TARGETS = [1, 2, 3, 5, 10];

export default function PdfTool({ strings, page }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [targetMb, setTargetMb] = useState(2);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<PdfResult | null>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (files: FileList | null) => {
    const f = files?.[0];
    // Some systems hand over an empty type for a PDF, so the name is the reliable test.
    if (!f || !(f.type === "application/pdf" || /\.pdf$/i.test(f.name))) return;
    setResult(null);
    setFile(f);
  };

  const run = async () => {
    if (!file) return;
    setBusy(page.working);
    try {
      setResult(await compressPdfToMb(file, targetMb, (m) => setBusy(`${page.working} ${m}`)));
    } finally {
      setBusy(null);
    }
  };

  const originalMb = file ? Math.round((file.size / 1024 / 1024) * 100) / 100 : 0;
  const missed = result !== null && result.mb > targetMb;

  if (!file) {
    return (
      <div
        class={`drop${dragging ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer?.files ?? null); }}
      >
        <span class="drop-icon"><svg width="32" height="32" aria-hidden="true"><use href="#ic-file" /></svg></span>
        <span class="drop-title">{strings.dropTitle}</span>
        <span class="drop-sub">{strings.dropSub}</span>
        <label class="cta">
          <svg width="21" height="21" aria-hidden="true"><use href="#ic-upload" /></svg>
          {strings.choose}
          <input type="file" accept="application/pdf,.pdf" hidden data-testid="pdf-file"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  return (
    <div class="tool" data-testid="pdf-tool">
      <div class="stage-col">
        <div class="pdf-card">
          <svg width="34" height="34" aria-hidden="true"><use href="#ic-file" /></svg>
          <span class="pdf-name">{file.name}</span>
          <span class="hint" data-testid="pdf-sizes">
            {page.was} {originalMb} MB
            {result && <> · {page.now} <b>{result.mb} MB</b>{result.pages > 0 && <> · {result.pages} {page.pages}</>}</>}
          </span>
        </div>
        {busy && <p class="hint" data-testid="pdf-busy">{busy}</p>}
        {missed && <p class="hint caveat" data-testid="pdf-missed">{page.missed}</p>}
        {/* The cost is reported after the fact, and only when it was actually paid. */}
        {result && (
          <p class={result.method === "images" ? "hint ok-note" : "hint caveat"} data-testid="pdf-method">
            {result.method === "images" ? page.keptText : page.becameImages}
          </p>
        )}
      </div>

      <div class="spec">
        <p class="spec-head">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-file" /></svg>
          {page.fileLabel}
        </p>
        <div class="spec-body">
          <p class="hint caveat">{page.target}</p>
          <div class="funnel-row">
            {TARGETS.map((mb) => (
              <button key={mb} type="button" class={`chip${targetMb === mb ? " is-on" : ""}`}
                aria-pressed={targetMb === mb}
                onClick={() => { setTargetMb(mb); setResult(null); }}>
                {mb} MB
              </button>
            ))}
          </div>

          <div class="dl-row">
            {!result ? (
              <button class="btn-dl wide" type="button" data-testid="pdf-run"
                disabled={busy !== null} onClick={run}>
                {busy ? page.working : page.run}
              </button>
            ) : (
              <button class="btn-dl wide" type="button" data-testid="pdf-save"
                onClick={() => download(result.blob,
                  `${file.name.replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|]/g, "").slice(0, 60) || "document"}-${result.mb}mb.pdf`)}>
                {page.download}
              </button>
            )}
          </div>

          {/* Said before the button, not after the download: someone whose PDF has real text
              should be able to decide against this rather than discover it afterwards. */}
          <p class="hint caveat">{page.rasterWarning}</p>

          <button class="btn-reset" type="button" data-testid="pdf-reset"
            onClick={() => { setFile(null); setResult(null); }}>
            {strings.reset}
          </button>
        </div>
      </div>
    </div>
  );
}
