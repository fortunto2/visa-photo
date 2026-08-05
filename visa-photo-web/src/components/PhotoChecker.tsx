import { useEffect, useRef, useState } from "preact/hooks";
import type { Preset } from "../lib/presets";
import { inspectPhoto, type Report, type Finding } from "../lib/inspect";
import { findFace, isFaceModelCached, prefetchFaceModel } from "../lib/face";
import { measureAgainst } from "../lib/autocrop";
import { onHandOff, takePending } from "../lib/handoff";
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
  checkFace: string;
  checkingFace: string;
  faceHint: string;
  noFace: string;
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
  const [faceRows, setFaceRows] = useState<Finding[] | null>(null);
  const [facePass, setFacePass] = useState(false);
  const [faceBusy, setFaceBusy] = useState(false);
  const [faceMsg, setFaceMsg] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const inspect = (file: File | Blob, name: string) => {

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setPreview(url);

    const img = new Image();
    imgRef.current = img;
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
        source: name,
      }, { failed: result.failed });
      // The picker was open a moment ago; the model may already be on its way.
      isFaceModelCached().then((ready) => ready && void measureFace());
    };
    img.src = url;
  };

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    inspect(file, "upload");
  };

  // A photo made by the editor on this page arrives without a second upload.
  useEffect(() => {
    // On mount as well as on the event: this island hydrates when its tab becomes visible,
    // which happens after the editor has already published its photo.
    const pick = () => {
      const handed = takePending();
      if (handed) inspect(handed.blob, "from-editor");
    };
    pick();
    return onHandOff(pick);
  }, []);

  /**
   * The second, heavier pass. Kept separate because it costs a 4 MB download and most people
   * are stopped by a wrong size or a busy background long before the face matters.
   */
  const measureFace = async () => {
    const img = imgRef.current;
    if (!img) return;
    setFaceBusy(true);
    setFaceMsg(null);
    try {
      const face = await findFace(img);
      if (!face) {
        setFaceMsg(strings.noFace);
        return;
      }
      const m = measureAgainst(face, preset);
      const within = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
      const rows: Finding[] = [
        {
          id: "head-height",
          verdict: within(m.headPct, m.headTarget, 3) ? "pass" : "fail",
          value: `${m.headPct.toFixed(1)} %`,
          expected: `${m.headTarget} % ±3`,
        },
        {
          id: "eye-line",
          verdict: within(m.eyePct, m.eyeTarget, 3) ? "pass" : "fail",
          value: `${m.eyePct.toFixed(1)} %`,
          expected: `${m.eyeTarget} % ±3`,
        },
        {
          id: "tilt",
          verdict: Math.abs(m.tiltDeg) <= 5 ? "pass" : "warn",
          value: `${m.tiltDeg.toFixed(1)}°`,
          expected: "≤ 5°",
        },
      ];
      setFaceRows(rows);
      setFacePass(rows.every((r) => r.verdict === "pass"));
    } catch (e) {
      setFaceMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setFaceBusy(false);
    }
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
        onClick={() => void prefetchFaceModel()}
      >
        <span class="drop-icon"><svg width="32" height="32" aria-hidden="true"><use href="#ic-check" /></svg></span>
        <span class="drop-title">{strings.drop}</span>
        <label class="cta">
          <svg width="21" height="21" aria-hidden="true"><use href="#ic-upload" /></svg>
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
        <svg width="20" height="20" aria-hidden="true"><use href={report.failed ? "#ic-warn" : "#ic-check"} /></svg>
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

      {faceRows ? (
        <table class="check-table" data-testid="face-table">
          <tbody>
            {faceRows.map((f) => (
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
      ) : (
        <div class="face-cta">
          <button class="btn-dl" type="button" disabled={faceBusy}
            data-testid="check-face" onClick={measureFace}>
            <svg width="18" height="18" aria-hidden="true"><use href="#ic-face" /></svg>
            {faceBusy ? strings.checkingFace : strings.checkFace}
          </button>
          <p class="hint">{faceMsg ?? strings.faceHint}</p>
        </div>
      )}

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
