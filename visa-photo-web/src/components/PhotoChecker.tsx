import { useRef, useState } from "preact/hooks";
import type { Preset } from "../lib/presets";
import { inspectPhoto, type Report } from "../lib/inspect";
import { track } from "../lib/analytics";
import type { DocContext } from "../lib/analytics";

export interface CheckStrings {
  drop: string;
  choose: string;
  allPass: string;
  someFail: string;
  someWarn: string;
  measured: string;
  expected: string;
  notChecked: string;
  notCheckedBody: string;
  fixIt: string;
  labels: Record<string, string>;
  again: string;
}

interface Props {
  preset: Preset;
  strings: CheckStrings;
  ctx: DocContext;
}

/**
 * Checks a file the visitor already has, rather than making a new one.
 *
 * This is the other half of what people search for — "photo checker", "photo validator" —
 * and for the DV lottery it is the more urgent half, because a bad photo disqualifies the
 * entry for a year. Every check runs on a canvas in this browser; the file is never sent.
 */
export default function PhotoChecker({ preset, strings, ctx }: Props) {
  const [report, setReport] = useState<Report | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const urlRef = useRef<string | null>(null);

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      const result = inspectPhoto({
        img,
        fileSizeKb: file.size / 1024,
        mimeType: file.type,
        preset,
      });
      setReport(result);
      track("photo_checked", {
        ...ctx,
        outcome: result.failed ? "fail" : result.warned ? "warn" : "pass",
      }, { failed: result.failed });
    };
    img.src = url;
  };

  if (!report) {
    return (
      <div
        data-testid="checker-dropzone"
        data-hydrated="true"
        class={`drop${dragging ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer?.files ?? null); }}
      >
        <span class="drop-icon"><svg width="32" height="32"><use href="#ic-check" /></svg></span>
        <span class="drop-title">{strings.drop}</span>
        <label class="cta">
          <svg width="21" height="21"><use href="#ic-upload" /></svg>
          {strings.choose}
          <input type="file" accept="image/*" hidden data-testid="checker-input"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  const tone = report.failed ? "is-fail" : report.warned ? "is-warn" : "is-pass";
  const headline = report.failed
    ? strings.someFail.replace("{n}", String(report.failed))
    : report.warned
      ? strings.someWarn
      : strings.allPass;

  return (
    <div class="check-result" data-testid="check-result" data-outcome={report.failed ? "fail" : report.warned ? "warn" : "pass"}>
      <div class={`check-headline ${tone}`}>
        <svg width="20" height="20"><use href={report.failed ? "#ic-warn" : "#ic-check"} /></svg>
        {headline}
      </div>

      {preview && <img class="check-preview" src={preview} alt="" />}

      <table class="check-table">
        <thead>
          <tr>
            <th></th>
            <th>{strings.measured}</th>
            <th>{strings.expected}</th>
          </tr>
        </thead>
        <tbody>
          {report.findings.map((f) => (
            <tr key={f.id} class={`row-${f.verdict}`}>
              <td>
                <svg width="15" height="15" aria-hidden="true">
                  <use href={f.verdict === "pass" ? "#ic-check" : "#ic-warn"} />
                </svg>
                {strings.labels[f.id] ?? f.id}
              </td>
              <td class="num">{f.value}</td>
              <td class="num muted">{f.expected}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div class="check-actions">
        <button class="btn-reset" type="button" data-testid="check-again"
          onClick={() => { setReport(null); setPreview(null); }}>
          {strings.again}
        </button>
      </div>

      <p class="hint caveat">
        <b>{strings.notChecked}.</b> {strings.notCheckedBody}
      </p>
    </div>
  );
}
