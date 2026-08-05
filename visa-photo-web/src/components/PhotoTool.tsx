import { useEffect, useRef, useState } from "preact/hooks";
import type { Preset } from "../lib/presets";
import { containerForImage, calcGuides } from "../lib/crop";
import {
  cropAndExport, generatePrintLayout, generatePrintPdf, autoEnhance,
  levelsFilter, download,
} from "../lib/process";
import {
  trackPresetSelected, trackPhotoDownloaded, trackPrintLayoutUsed, trackBackgroundRemoved,
  track, type DocContext,
} from "../lib/analytics";
import { removeBackground, cachedModelIds, getPreferredModel, MODELS, type BgModel } from "../lib/background";
import { findFace, isFaceModelCached, prefetchFaceModel } from "../lib/face";
import { placeCrop } from "../lib/autocrop";
import { handOff } from "../lib/handoff";

export interface ToolStrings {
  dropTitle: string;
  dropSub: string;
  choose: string;
  camera: string;
  working: string;
  framedTo: string;
  downloadJpeg: string;
  downloadPng: string;
  downloadSheet: string;
  guideCrown: string;
  guideEyes: string;
  guideChin: string;
  reset: string;
  tip: string;
  checkResult: string;
  removeBg: string;
  removeBgHint: string;
  bgDone: string;
  bgUndo: string;
  tryBetterHint: string;
  modelCaveat: string;
  cached: string;
  alignFace: string;
  aligning: string;
  alignHint: string;
  alignFailed: string;
  tooTight: string;
  aligned: string;
  rotateLeft: string;
  rotateRight: string;
  autoLevels: string;
  zoom: string;
  undoLevels: string;
  changeModel: string;
  changeModelWhen: string;
  modelsPageLink: string;
  modelDefault: string;
  noEditingAtAction: string;
  proceedAnyway: string;
  mbUnit: string;
  advanced: string;
  advancedHint: string;
  brightness: string;
  contrast: string;
  shadows: string;
  resetLevels: string;
  transparentBg: string;
  transparentHint: string;
  faceOval: string;
  fileName: string;
  fileNamePlaceholder: string;
}

interface Props {
  preset: Preset;
  presetKey: string;
  strings: ToolStrings;
  /** localised URL of the models page, linked wherever a model choice is offered */
  modelsHref: string;
  /** which document page this is, for the counter */
  ctx: DocContext;
  /** true when the authority rejects edited photos, so the warning appears at the click */
  editingForbidden?: boolean;
}

/** Lightest model, and the fallback when nothing has been chosen: 5 MB, not 176. */
const LIGHTEST = MODELS[0];
const NO_LEVELS = { brightness: 0, contrast: 0, shadows: 0 };

/**
 * The editor lives on the country page itself, not behind an "open app" button.
 *
 * Background removal follows the same rule as everything else here: no question is asked
 * before the work starts. A competitor interrupts this exact moment with a modal offering
 * 25 MB, 94 MB or a server round-trip, and marks that modal as friction in its own telemetry.
 * Here the light model just runs. A heavier one is offered afterwards, and only if the visitor
 * says the edges came out wrong — a retry they can judge, not a choice they cannot.
 */
export default function PhotoTool({
  preset, presetKey, strings, modelsHref, ctx, editingForbidden = false,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());
  /** Chosen on the models page; resolved after mount because localStorage has no server side. */
  const [defaultModel, setDefaultModel] = useState<BgModel>(LIGHTEST);
  /** Derived, not stored: every transition kept these two in lockstep anyway. */
  const bgDone = src !== null && src !== original;

  const [cx, setCx] = useState(0.5);
  const [cy, setCy] = useState(0.4);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [levels, setLevels] = useState(NO_LEVELS);
  const [dragging, setDragging] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [transparent, setTransparent] = useState(false);
  const [faceOval, setFaceOval] = useState(false);
  const [fileName, setFileName] = useState("");
  const [warned, setWarned] = useState(false);
  const [aligning, setAligning] = useState(false);
  const [alignState, setAlignState] = useState<"idle" | "done" | "failed">("idle");
  /** Surfaced rather than swallowed: "no face found" and "the detector broke" need different fixes. */
  const [alignError, setAlignError] = useState<string | null>(null);
  const [faceModelReady, setFaceModelReady] = useState(false);
  /**
   * The markup is server-rendered, so the file input exists before its handler does. An
   * automation that drops a file in between gets silence. This flag is the "you may start now"
   * signal; it is why the recipe waits for [data-hydrated=true] rather than for the input.
   */
  const [hydrated, setHydrated] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    setDefaultModel(getPreferredModel());
    setHydrated(true);
    isFaceModelCached().then(setFaceModelReady);
  }, []);

  /**
   * Puts the head where the document wants it. Offered rather than forced: the model is 15 MB,
   * and a visitor who only wants to see the size should not pay for it.
   */
  const alignToFace = async () => {
    if (!imgRef.current) return;
    setAligning(true);
    try {
      const face = await findFace(imgRef.current);
      if (!face) {
        setAlignState("failed");
        return;
      }
      if (face.tooTight) {
        setAlignError(strings.tooTight);
        setAlignState("failed");
        return;
      }
      const placed = placeCrop(face, preset, imgRef.current.naturalWidth, imgRef.current.naturalHeight);
      if (!placed) {
        setAlignState("failed");
        return;
      }
      setCx(placed.cx);
      setCy(placed.cy);
      setScale(placed.scale);
      setAlignState("done");
      setFaceModelReady(true);
      track("face_aligned", ctx);
    } catch (e) {
      setAlignError(e instanceof Error ? e.message : String(e));
      setAlignState("failed");
    } finally {
      setAligning(false);
    }
  };

  // Once the model is cached, doing it automatically costs nothing and saves a click.
  useEffect(() => {
    if (ready && faceModelReady && alignState === "idle" && !aligning) void alignToFace();
  }, [ready, faceModelReady]);

  // Runs when a photo appears, not on mount: nothing renders cachedIds until then, and most
  // visitors never upload anything.
  useEffect(() => {
    if (!src) return;
    let alive = true;
    cachedModelIds().then((ids) => alive && setCachedIds(ids));
    return () => {
      alive = false;
    };
  }, [src]);

  // Revoke on unmount only: revoking on every src change kills the image still on screen.
  useEffect(() => () => objectUrls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const keepUrl = (url: string) => {
    objectUrls.current.push(url);
    return url;
  };

  const accept = (files: FileList | null, source: "file" | "camera" = "file") => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    trackPresetSelected(ctx, source);
    const url = keepUrl(URL.createObjectURL(file));
    setReady(false);
    setShowModels(false);
    setCx(0.5);
    setCy(0.4);
    setScale(1);
    setRotation(0);
    setLevels(NO_LEVELS);
    setTransparent(false);
    setOriginal(url);
    setSrc(url);
  };

  const img = imgRef.current;
  const [contW, contH] = img && ready
    ? containerForImage(img.naturalWidth, img.naturalHeight)
    : [420, 520];
  const guides = ready ? calcGuides(cx, cy, preset, contW, contH, scale) : null;

  const moveTo = (clientX: number, clientY: number) => {
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCx(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
    setCy(Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)));
  };

  const runBgRemoval = async (model: BgModel) => {
    if (!imgRef.current) return;
    setShowModels(false);
    try {
      // Progress text comes from the model loader: it names the download and its size.
      const blob = await removeBackground(imgRef.current, model, transparent, setBusy);
      const url = keepUrl(URL.createObjectURL(blob));
      // The previous result is unreachable now; only the original is still needed for undo.
      if (src && src !== original) URL.revokeObjectURL(src);
      setReady(false);
      setSrc(url);
      setCachedIds((prev) => new Set(prev).add(model.id));
      trackBackgroundRemoved(ctx, model.id, model.sizeMb);
    } catch (e) {
      setBusy(e instanceof Error ? e.message : String(e));
      setTimeout(() => setBusy(null), 4000);
      return;
    }
    setBusy(null);
  };

  const undoBg = () => {
    if (!original) return;
    setReady(false);
    setSrc(original);
    setShowModels(false);
  };

  /** Advanced lets people name the file; otherwise the preset key is a sane default. */
  const stem = () => fileName.trim().replace(/[^\p{L}\p{N}_-]+/gu, "_") || presetKey;

  const applyAutoLevels = () => {
    if (!imgRef.current) return;
    setLevels(autoEnhance(imgRef.current));
  };

  const exportPhoto = async (usePng: boolean) => {
    if (!imgRef.current) return;
    setBusy(strings.working);
    try {
      const blob = await cropAndExport(
        imgRef.current, preset, cx, cy, scale,
        levels.brightness, levels.contrast, levels.shadows, usePng, rotation,
      );
      download(blob, `${stem()}.${usePng ? "png" : "jpg"}`);
      trackPhotoDownloaded(ctx, usePng ? "png" : "jpeg", bgDone);
    } finally {
      setBusy(null);
    }
  };

  /** Sends the current crop to the checker on this page, rather than making them re-upload. */
  const checkThis = async () => {
    if (!imgRef.current) return;
    setBusy(strings.working);
    try {
      const blob = await cropAndExport(
        imgRef.current, preset, cx, cy, scale,
        levels.brightness, levels.contrast, levels.shadows, false, rotation,
      );
      handOff(blob, `${stem()}.jpg`);
    } finally {
      setBusy(null);
    }
  };

  const exportSheet = async () => {
    if (!imgRef.current) return;
    setBusy(strings.working);
    try {
      const photo = await cropAndExport(
        imgRef.current, preset, cx, cy, scale,
        levels.brightness, levels.contrast, levels.shadows, false, rotation,
      );
      download(await generatePrintLayout(preset, photo), `${stem()}_A4.png`);
      download(await generatePrintPdf(preset, photo), `${stem()}_A4.pdf`);
      trackPrintLayoutUsed(ctx);
    } finally {
      setBusy(null);
    }
  };

  if (!src) {
    return (
      <div
        data-testid="dropzone"
        data-state="empty"
        data-hydrated={String(hydrated)}
        class={`drop${dragging ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer?.files ?? null); }}
      >
        <span class="drop-icon"><svg width="32" height="32" aria-hidden="true"><use href="#ic-upload" /></svg></span>
        <span class="drop-title">{strings.dropTitle}</span>
        <span class="drop-sub">{strings.dropSub}</span>

        {/* The dialog is open for seconds while someone hunts for a file; start the 4 MB
            download now so alignment is instant once they pick one. */}
        <label class="cta" onClick={() => void prefetchFaceModel()}>
          <svg width="21" height="21" aria-hidden="true"><use href="#ic-upload" /></svg>
          {strings.choose}
          <input type="file" accept="image/*" hidden data-testid="file-input"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>

        <label class="cta-alt">
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-camera" /></svg>
          {strings.camera}
          <input type="file" accept="image/*" capture="user" hidden data-testid="camera-input"
            onChange={(e) => accept((e.target as HTMLInputElement).files, "camera")} />
        </label>
      </div>
    );
  }

  /** Auto levels is a guess about the photo; it has to be as easy to take back as to apply. */
  const levelsTouched = levels.brightness !== 0 || levels.contrast !== 0 || levels.shadows !== 0;

  // A filter of brightness(1.00) contrast(1.00) still promotes the image to its own layer
  // and costs a filter pass per frame while dragging.
  const filter = levelsTouched ? levelsFilter(levels) : undefined;

  const state = busy ? "busy" : bgDone ? "background-removed" : ready ? "ready" : "loading";

  return (
    <div class="result" data-testid="editor" data-state={state} data-hydrated="true">
      <span class={`verdict${busy ? " is-busy" : ""}`}>
        <svg width="17" height="17" aria-hidden="true"><use href={busy ? "#ic-spark" : "#ic-check"} /></svg>
        {busy ?? (bgDone ? strings.bgDone : strings.framedTo)}
      </span>

      <div
        class="stage"
        ref={boxRef}
        style={{ width: contW, height: contH }}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); moveTo(e.clientX, e.clientY); }}
        onPointerMove={(e) => { if (e.buttons === 1) moveTo(e.clientX, e.clientY); }}
        onWheel={(e) => { e.preventDefault(); setScale((s) => Math.max(0.3, Math.min(1, s + (e.deltaY > 0 ? 0.03 : -0.03)))); }}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          onLoad={() => setReady(true)}
          draggable={false}
          style={{ filter, transform: rotation ? `rotate(${rotation}deg)` : undefined }}
        />

        {guides && (
          <>
            {/* Four bands rather than one clip-path: a polygon with a reversed inner ring
                relies on fill-rule behaviour browsers disagree about, and it rendered as
                no shading at all. */}
            <div class="shade" style={{ left: 0, top: 0, width: "100%", height: guides.top }} />
            <div class="shade" style={{ left: 0, top: guides.top + guides.height, width: "100%", bottom: 0 }} />
            <div class="shade" style={{ left: 0, top: guides.top, width: guides.left, height: guides.height }} />
            <div class="shade" style={{ left: guides.left + guides.width, top: guides.top, right: 0, height: guides.height }} />
            <div class="frame" style={{
              left: guides.left, top: guides.top, width: guides.width, height: guides.height,
            }}>
              <span class="gl crown" style={{ top: guides.headTopY }}><i>{strings.guideCrown}</i></span>
              <span class="gl eyes" style={{ top: guides.eyeY }}><i>{strings.guideEyes}</i></span>
              <span class="gl chin" style={{ top: guides.chinY }}><i>{strings.guideChin}</i></span>
              {faceOval && (
                <span
                  class="oval"
                  style={{
                    left: (guides.width - guides.faceHeight * 0.65) / 2,
                    top: guides.headTopY,
                    width: guides.faceHeight * 0.65,
                    height: guides.faceHeight,
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>

      <div class="tools">
        <button class="tool-btn" type="button" title={strings.rotateLeft}
          onClick={() => setRotation((r) => (r + 270) % 360)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H5v4M5 5l4.5 4.5" /><path d="M20 12a8 8 0 1 1-8-8" />
          </svg>
        </button>
        <button class="tool-btn" type="button" title={strings.rotateRight}
          onClick={() => setRotation((r) => (r + 90) % 360)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 5h4v4M19 5l-4.5 4.5" /><path d="M4 12a8 8 0 1 0 8-8" />
          </svg>
        </button>
        <button class="tool-btn" type="button" data-testid="align-face"
          disabled={aligning} onClick={alignToFace}>
          <svg width="18" height="18" aria-hidden="true"><use href="#ic-face" /></svg>
          <span>{aligning ? strings.aligning : strings.alignFace}</span>
        </button>
        <button class="tool-btn" type="button" onClick={applyAutoLevels}>
          <svg width="18" height="18" aria-hidden="true"><use href="#ic-sun" /></svg>
          <span>{strings.autoLevels}</span>
        </button>
        {levelsTouched && (
          <button class="tool-btn" type="button" title={strings.undoLevels}
            onClick={() => setLevels(NO_LEVELS)}>
            <svg width="18" height="18" aria-hidden="true"><use href="#ic-undo" /></svg>
            <span>{strings.undoLevels}</span>
          </button>
        )}
        <label class="zoom">
          <span>{strings.zoom}</span>
          <input type="range" min="30" max="100" value={scale * 100}
            onInput={(e) => setScale(Number((e.target as HTMLInputElement).value) / 100)} />
        </label>
      </div>

      <p class="tip" data-testid="align-state" data-align={alignState} data-error={alignError ?? ""}>
        {alignState === "failed" ? (alignError ?? strings.alignFailed)
          : alignState === "done" ? strings.aligned
          : aligning ? strings.alignHint
          : strings.tip}
      </p>

      {/* The crop in numbers: an automation can assert placement without inspecting pixels. */}
      <span
        hidden
        data-testid="crop-state"
        data-cx={cx.toFixed(4)}
        data-cy={cy.toFixed(4)}
        data-scale={scale.toFixed(3)}
        data-rotation={String(rotation)}
        data-background-removed={String(bgDone)}
      />

      <div class="bg-block">
        {!bgDone ? (
          <>
            {editingForbidden && !warned ? (
              <div class="warn-inline" data-testid="editing-warning">
                <p>
                  <svg width="19" height="19" aria-hidden="true"><use href="#ic-warn" /></svg>
                  {strings.noEditingAtAction}
                </p>
                <button class="btn-reset" type="button" data-testid="acknowledge-editing"
                  onClick={() => setWarned(true)}>
                  {strings.proceedAnyway}
                </button>
              </div>
            ) : (
              <button class="btn-dl wide" type="button" disabled={!!busy}
                data-testid="remove-background"
                onClick={() => runBgRemoval(defaultModel)}>
                <svg width="19" height="19" aria-hidden="true"><use href="#ic-drop" /></svg>
                {strings.removeBg}
              </button>
            )}
            <p class="hint">
              {cachedIds.has(defaultModel.id)
                ? strings.cached
                : strings.removeBgHint.replace("{mb}", String(defaultModel.sizeMb))}
              {" · "}
              <a href={modelsHref}>{strings.modelsPageLink}</a>
            </p>
          </>
        ) : (
          <>
            {/* Spelled out rather than hidden behind a question: the first attempt is the
                light model, and someone whose background did not turn white has no way to
                guess that a different model is what fixes it. */}
            <div class="retry">
              <p class="retry-q">{strings.changeModelWhen}</p>
              <div class="bg-row">
                <button class="btn-dl" type="button" data-testid="change-model"
              onClick={() => setShowModels((v) => !v)}>
                  <svg width="18" height="18" aria-hidden="true"><use href="#ic-layers" /></svg>
                  {strings.changeModel}
                </button>
                <button class="btn-reset" type="button" onClick={undoBg}>
                  <svg width="17" height="17" aria-hidden="true"><use href="#ic-undo" /></svg>
                  {strings.bgUndo}
                </button>
              </div>
            </div>

            {showModels && (
              <div class="models">
                <p class="hint caveat">{strings.tryBetterHint}</p>
                {MODELS.map((m) => (
                  <button key={m.id} class="model" type="button" disabled={!!busy}
                    onClick={() => runBgRemoval(m)}>
                    <span class="model-name">
                      {m.name}
                      {m.id === defaultModel.id && <em class="badge">{strings.modelDefault}</em>}
                    </span>
                    <span class="model-size">
                      {cachedIds.has(m.id) ? strings.cached : `${m.sizeMb} ${strings.mbUnit}`}
                    </span>
                  </button>
                ))}
                <p class="hint caveat">{strings.modelCaveat}</p>
                <p class="hint caveat"><a href={modelsHref}>{strings.modelsPageLink}</a></p>
              </div>
            )}
          </>
        )}
      </div>

      <div class="advanced">
        <button class="btn-reset" type="button" aria-expanded={advanced}
          onClick={() => setAdvanced((v) => !v)}>
          {strings.advanced} {advanced ? "▲" : "▼"}
        </button>

        {advanced && (
          <div class="advanced-body">
            <p class="hint caveat">{strings.advancedHint}</p>

            {([
              ["brightness", strings.brightness, -50, 50],
              ["contrast", strings.contrast, -50, 50],
              ["shadows", strings.shadows, 0, 80],
            ] as const).map(([key, label, min, max]) => (
              <label key={key} class="slider">
                <span>{label}</span>
                <input type="range" min={min} max={max} value={levels[key]}
                  onInput={(e) => setLevels((l) => ({ ...l, [key]: Number((e.target as HTMLInputElement).value) }))} />
                <b>{levels[key]}</b>
              </label>
            ))}

            <button class="btn-reset" type="button"
              onClick={() => setLevels(NO_LEVELS)}>
              {strings.resetLevels}
            </button>

            <label class="check">
              <input type="checkbox" checked={faceOval}
                onChange={(e) => setFaceOval((e.target as HTMLInputElement).checked)} />
              <span>{strings.faceOval}</span>
            </label>

            <label class="check">
              <input type="checkbox" checked={transparent}
                onChange={(e) => setTransparent((e.target as HTMLInputElement).checked)} />
              <span>{strings.transparentBg}</span>
            </label>
            <p class="hint caveat">{strings.transparentHint}</p>

            <label class="field">
              <span>{strings.fileName}</span>
              <input type="text" value={fileName} placeholder={strings.fileNamePlaceholder}
                onInput={(e) => setFileName((e.target as HTMLInputElement).value)} />
            </label>
          </div>
        )}
      </div>

      <div class="downloads">
        <button class="btn-dl filled" type="button" disabled={!!busy} data-testid="download-jpeg"
          onClick={() => exportPhoto(false)}>
          <svg width="20" height="20" aria-hidden="true"><use href="#ic-download" /></svg>{strings.downloadJpeg}
        </button>
        <button class="btn-dl" type="button" disabled={!!busy} data-testid="download-png"
          onClick={() => exportPhoto(true)}>
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-file" /></svg>{strings.downloadPng}
        </button>
        <button class="btn-dl" type="button" disabled={!!busy} data-testid="download-sheet"
          onClick={exportSheet}>
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-print" /></svg>{strings.downloadSheet}
        </button>
        <button class="btn-dl" type="button" disabled={!!busy} data-testid="check-this"
          onClick={checkThis}>
          <svg width="19" height="19" aria-hidden="true"><use href="#ic-check" /></svg>
          {strings.checkResult}
        </button>
        <button class="btn-reset" type="button" data-testid="reset"
          onClick={() => { setSrc(null); setOriginal(null); setReady(false); }}>
          {strings.reset}
        </button>
      </div>
    </div>
  );
}
