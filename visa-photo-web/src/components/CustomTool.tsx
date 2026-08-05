import { useState } from "preact/hooks";
import PhotoTool, { type ToolStrings } from "./PhotoTool";
import type { Preset } from "../lib/presets";
import type { DocContext } from "../lib/analytics";

export interface CustomStrings {
  width: string;
  height: string;
  unitMm: string;
  unitPx: string;
  dpi: string;
  presetHint: string;
  common: string;
}

interface Props {
  strings: ToolStrings;
  custom: CustomStrings;
  modelsHref: string;
  ctx: DocContext;
  /** shape and defaults for everything the editor needs beyond the two dimensions */
  base: Preset;
}

/** Sizes people arrive with that the catalogue does not cover. */
const COMMON: [string, number, number][] = [
  ["35 × 45", 35, 45],
  ["50 × 70", 50, 70],
  ["33 × 48", 33, 48],
  ["40 × 60", 40, 60],
  ["25 × 35", 25, 35],
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * The catalogue covers the documents people search for; this covers the rest — a size read off
 * a form, a consulate that wants something unusual. Same editor, dimensions supplied by hand.
 */
export default function CustomTool({ strings, custom, modelsHref, ctx, base }: Props) {
  const [mmW, setMmW] = useState(35);
  const [mmH, setMmH] = useState(45);
  const [dpi, setDpi] = useState(300);

  const px = (mm: number) => Math.round((mm / 25.4) * dpi);

  const preset: Preset = {
    ...base,
    print_width_mm: mmW,
    print_height_mm: mmH,
    digital_width: px(mmW),
    digital_height: px(mmH),
  };

  return (
    <>
      <div class="custom-fields" data-testid="custom-size">
        <label class="field">
          <span>{custom.width}</span>
          <input type="number" min="20" max="150" value={mmW} data-testid="custom-width"
            onInput={(e) => setMmW(clamp(Number((e.target as HTMLInputElement).value) || 35, 20, 150))} />
          <b>{custom.unitMm}</b>
        </label>
        <label class="field">
          <span>{custom.height}</span>
          <input type="number" min="20" max="150" value={mmH} data-testid="custom-height"
            onInput={(e) => setMmH(clamp(Number((e.target as HTMLInputElement).value) || 45, 20, 150))} />
          <b>{custom.unitMm}</b>
        </label>
        <label class="field">
          <span>{custom.dpi}</span>
          <select value={String(dpi)} data-testid="custom-dpi"
            onChange={(e) => setDpi(Number((e.target as HTMLSelectElement).value))}>
            <option value="300">300</option>
            <option value="600">600</option>
          </select>
        </label>
        <p class="hint">
          {preset.digital_width} × {preset.digital_height} {custom.unitPx}
        </p>
      </div>

      <p class="hint caveat">{custom.common}</p>
      <div class="funnel-row" style="margin-bottom:22px">
        {COMMON.map(([label, w, h]) => (
          <button key={label} class="chip" type="button"
            onClick={() => { setMmW(w); setMmH(h); }}>
            {label} {custom.unitMm}
          </button>
        ))}
      </div>

      <div class="tool">
        <PhotoTool preset={preset} presetKey={`custom_${mmW}x${mmH}`} strings={strings}
          modelsHref={modelsHref} ctx={ctx} />
        <div class="spec">
          <p class="spec-head">
            <svg width="19" height="19"><use href="#ic-ruler" /></svg>
            {custom.presetHint}
          </p>
          <dl>
            <div class="spec-row">
              <dt>{custom.width} × {custom.height}</dt>
              <dd>{mmW} × {mmH} {custom.unitMm}</dd>
            </div>
            <div class="spec-row">
              <dt>{custom.unitPx}</dt>
              <dd>{preset.digital_width} × {preset.digital_height}</dd>
            </div>
            <div class="spec-row">
              <dt>{custom.dpi}</dt>
              <dd>{dpi}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
