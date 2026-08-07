import { useEffect, useRef, useState } from "preact/hooks";
import { removeBackground, cachedModelIds, getPreferredModel, MODELS, type BgModel } from "../lib/background";
import { BACKDROPS } from "../lib/backdrop";
import type { ToolStrings } from "./PhotoTool";

export interface BgPageStrings {
  cut: string;
  /** what the picker is for, when there is no document asking for a colour */
  colour: string;
  keepTransparent: string;
  pickColour: string;
  download: string;
}

interface Props {
  strings: ToolStrings;
  page: BgPageStrings;
  modelsHref: string;
}

/**
 * Background removal on its own, with no document attached.
 *
 * The same cut-out the document pages run before cropping, except nothing here is cropped,
 * measured or checked against a specification — a photo goes in whole and comes out whole. It
 * exists because the demand is not only documentary: swapping the backdrop is the single most
 * searched thing about ID photos in Chinese, and "remove the background" is asked far more
 * often than any size is.
 *
 * The model runs once and produces a cut-out with an alpha channel. Every colour after that is
 * a fill painted behind the same cut-out, so changing your mind costs a repaint rather than
 * another inference — which on the heavier models is the difference between instant and a wait.
 */
export default function BackgroundTool({ strings, page, modelsHref }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  /** the cut-out: original pixels, background alpha'd out */
  const [cut, setCut] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [colour, setColour] = useState<string | null>("#FFFFFF");
  const [dragging, setDragging] = useState(false);
  const [model, setModel] = useState<BgModel>(MODELS[0]);
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());

  const urls = useRef<string[]>([]);
  const keep = (u: string) => { urls.current.push(u); return u; };
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  useEffect(() => {
    setModel(getPreferredModel());
    cachedModelIds().then(setCachedIds);
  }, []);

  const accept = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setCut(null);
    setSrc(keep(URL.createObjectURL(file)));
  };

  const run = async () => {
    if (!src) return;
    setBusy(strings.working);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      // Always transparent: the colour is painted afterwards, so it stays changeable.
      const blob = await removeBackground(img, model, true, (m) => setBusy(m));
      setCut(keep(URL.createObjectURL(blob)));
    } finally {
      setBusy(null);
    }
  };

  const save = async (ext: "png" | "jpg") => {
    const img = new Image();
    img.src = cut!;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    if (colour || ext === "jpg") {
      ctx.fillStyle = colour ?? "#FFFFFF";
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob>((r) =>
      c.toBlob((b) => r(b!), ext === "png" ? "image/png" : "image/jpeg", 0.92));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `background.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!src) {
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
          <input type="file" accept="image/*" hidden data-testid="bg-file"
            onChange={(e) => accept((e.target as HTMLInputElement).files)} />
        </label>
      </div>
    );
  }

  return (
    <div class="tool" data-testid="bg-tool">
      <div class="stage-col">
        <div
          class="bg-preview"
          style={{
            // The checkerboard shows through only where the result really is transparent.
            background: colour ?? "repeating-conic-gradient(#d8d8dc 0% 25%, #f4f4f6 0% 50%) 50% / 22px 22px",
          }}
        >
          <img src={cut ?? src} alt="" data-testid="bg-image" />
        </div>

        {busy && <p class="hint" data-testid="bg-busy">{busy}</p>}

        {!cut && !busy && (
          <>
            <button class="btn-dl wide" type="button" data-testid="bg-run" onClick={run}>
              {page.cut}
            </button>
            <p class="hint">
              {cachedIds.has(model.id)
                ? strings.cached
                : strings.removeBgHint.replace("{mb}", String(model.sizeMb))}
            </p>
          </>
        )}
      </div>

      {cut && (
        <div class="spec">
          <p class="spec-head">
            <svg width="19" height="19" aria-hidden="true"><use href="#ic-check" /></svg>
            {strings.bgDone}
          </p>

          <p class="hint caveat">{page.colour}</p>
          <div class="swatches" data-testid="bg-swatches">
            {BACKDROPS.map((b) => (
              <button key={b.id} type="button" class={`swatch${colour === b.css ? " is-on" : ""}`}
                style={{ background: b.css }} aria-pressed={colour === b.css}
                title={strings.backdropNames[b.id] ?? b.id}
                onClick={() => setColour(b.css)} />
            ))}
            <button type="button" class={`swatch alpha${colour === null ? " is-on" : ""}`}
              aria-pressed={colour === null} title={page.keepTransparent}
              onClick={() => setColour(null)} />
          </div>

          <label class="field bg-picker">
            <span>{page.pickColour}</span>
            <input type="color" value={colour ?? "#FFFFFF"} data-testid="bg-colour"
              onInput={(e) => setColour((e.target as HTMLInputElement).value)} />
          </label>

          <div class="dl-row">
            <button class="btn-dl wide" type="button" data-testid="bg-png"
              onClick={() => save("png")}>{page.download} PNG</button>
            <button class="tool-btn" type="button" data-testid="bg-jpg"
              onClick={() => save("jpg")}>{page.download} JPEG</button>
          </div>

          {/*
            Out in the open, not behind a "change model" link.
            No one model cuts every photo well — hair and glasses are where the light ones give
            up — and the only way to find out is to try another. Hidden behind a disclosure, the
            reader concludes the tool is simply bad at their photo instead of switching. So the
            whole list is here, each with its weight, and the one already on the device says so.
          */}
          <p class="spec-head" style="margin-top:22px">
            <svg width="19" height="19" aria-hidden="true"><use href="#ic-layers" /></svg>
            {strings.changeModel}
          </p>
          <p class="hint caveat">{strings.modelCaveat}</p>
          <div class="model-list" data-testid="bg-models">
            {MODELS.map((m) => (
              <button key={m.id} type="button" class={`chip${m.id === model.id ? " is-on" : ""}`}
                aria-pressed={m.id === model.id}
                onClick={() => { setModel(m); setCut(null); }}>
                {m.name} · {m.sizeMb} MB{cachedIds.has(m.id) ? ` · ${strings.cached}` : ""}
              </button>
            ))}
          </div>
          <p class="hint"><a href={modelsHref}>{strings.modelsPageLink}</a></p>

          <button class="btn-reset" type="button" data-testid="bg-reset"
            onClick={() => { setSrc(null); setCut(null); setColour("#FFFFFF"); }}>
            {strings.reset}
          </button>
        </div>
      )}
    </div>
  );
}
