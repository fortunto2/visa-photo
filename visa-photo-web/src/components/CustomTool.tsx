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
  unitLabel: string;
  units: Record<Unit, string>;
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

type Unit = "mm" | "cm" | "in" | "px";

/**
 * Nobody thinks in one unit.
 *
 * Brazil searches for the print format by number and in centimetres — "foto 3x4" is the
 * everyday ID photo there and "5x7" the passport one. The US never says millimetres; every
 * query is "2x2". India and the online forms ask in pixels. Offering millimetres alone meant
 * each of them had to convert before they could start, which is the moment a tool loses people.
 */
const UNITS: Unit[] = ["mm", "cm", "in", "px"];

/** How far a value in each unit may travel, and how finely it may be typed. */
const RANGE: Record<Unit, { lo: number; hi: number; step: number }> = {
  mm: { lo: 20, hi: 150, step: 0.1 },
  cm: { lo: 2, hi: 15, step: 0.1 },
  in: { lo: 0.8, hi: 6, step: 0.1 },
  px: { lo: 200, hi: 2400, step: 10 },
};

/**
 * Sizes people arrive with, each in the unit they arrive stating it. Taken from what the search
 * engines actually complete, not from a table of standards.
 */
const COMMON: { label: string; unit: Unit; w: number; h: number }[] = [
  { label: "35 × 45", unit: "mm", w: 35, h: 45 },
  { label: "3 × 4", unit: "cm", w: 3, h: 4 },
  { label: "2 × 2", unit: "in", w: 2, h: 2 },
  { label: "600 × 600", unit: "px", w: 600, h: 600 },
  { label: "5 × 7", unit: "cm", w: 5, h: 7 },
  { label: "33 × 48", unit: "mm", w: 33, h: 48 },
  { label: "25 × 35", unit: "mm", w: 25, h: 35 },
  { label: "40 × 60", unit: "mm", w: 40, h: 60 },
];

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * The catalogue covers the documents people search for; this covers the rest — a size read off
 * a form, a consulate that wants something unusual. Same editor, dimensions supplied by hand.
 */
export default function CustomTool({ strings, custom, modelsHref, ctx, base }: Props) {
  const [unit, setUnit] = useState<Unit>("mm");
  const [w, setW] = useState(35);
  const [h, setH] = useState(45);
  const [dpi, setDpi] = useState(300);

  /** Millimetres are what the crop is expressed in, whatever the reader typed. */
  const toMm = (v: number) =>
    unit === "mm" ? v : unit === "cm" ? v * 10 : unit === "in" ? v * 25.4 : (v / dpi) * 25.4;

  const mmW = toMm(w);
  const mmH = toMm(h);
  // In pixel mode the typed number is the answer; rounding a round-trip through millimetres
  // would turn a requested 600 into 599, and 600 is a limit a form checks exactly.
  const pxW = unit === "px" ? Math.round(w) : Math.round((mmW / 25.4) * dpi);
  const pxH = unit === "px" ? Math.round(h) : Math.round((mmH / 25.4) * dpi);

  /** Switch units without changing the photo: convert the current value into the new unit. */
  const changeUnit = (next: Unit) => {
    const asMm = [mmW, mmH];
    const from = (mm: number) =>
      next === "mm" ? mm : next === "cm" ? mm / 10 : next === "in" ? mm / 25.4 : (mm / 25.4) * dpi;
    // Pixels are the only whole-number unit here. Rounding millimetres to integers turned a
    // requested 600 px into 602 on the way back, and a form that wants exactly 630 x 810 —
    // India does — would have been broken by a unit switch the reader made only to check.
    const round = (v: number) =>
      next === "px" ? Math.round(v) : next === "mm" ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100;
    setW(clamp(round(from(asMm[0])), RANGE[next].lo, RANGE[next].hi));
    setH(clamp(round(from(asMm[1])), RANGE[next].lo, RANGE[next].hi));
    setUnit(next);
  };

  const preset: Preset = {
    ...base,
    print_width_mm: Math.round(mmW * 10) / 10,
    print_height_mm: Math.round(mmH * 10) / 10,
    digital_width: pxW,
    digital_height: pxH,
  };

  return (
    <>
      <div class="custom-fields" data-testid="custom-size">
        <label class="field">
          <span>{custom.width}</span>
          <input type="number" min={RANGE[unit].lo} max={RANGE[unit].hi} step={RANGE[unit].step}
            value={w} data-testid="custom-width"
            onInput={(e) => setW(clamp(Number((e.target as HTMLInputElement).value) || RANGE[unit].lo,
              RANGE[unit].lo, RANGE[unit].hi))} />
        </label>
        <label class="field">
          <span>{custom.height}</span>
          <input type="number" min={RANGE[unit].lo} max={RANGE[unit].hi} step={RANGE[unit].step}
            value={h} data-testid="custom-height"
            onInput={(e) => setH(clamp(Number((e.target as HTMLInputElement).value) || RANGE[unit].lo,
              RANGE[unit].lo, RANGE[unit].hi))} />
        </label>
        <label class="field">
          <span>{custom.unitLabel}</span>
          <select value={unit} data-testid="custom-unit"
            onChange={(e) => changeUnit((e.target as HTMLSelectElement).value as Unit)}>
            {UNITS.map((u) => <option key={u} value={u}>{custom.units[u]}</option>)}
          </select>
        </label>
        <label class="field">
          <span>{custom.dpi}</span>
          <select value={String(dpi)} data-testid="custom-dpi"
            onChange={(e) => setDpi(Number((e.target as HTMLSelectElement).value))}>
            <option value="300">300</option>
            <option value="600">600</option>
          </select>
        </label>
        {/* The other two readings of the same photo, so nobody has to convert to check it. */}
        <p class="hint" data-testid="custom-echo">
          {pxW} × {pxH} {custom.units.px}
          {unit !== "mm" && ` · ${preset.print_width_mm} × ${preset.print_height_mm} ${custom.units.mm}`}
        </p>
      </div>

      <p class="hint caveat">{custom.common}</p>
      <div class="funnel-row" style="margin-bottom:22px">
        {COMMON.map((s) => (
          <button key={s.label + s.unit} class="chip" type="button"
            aria-pressed={unit === s.unit && w === s.w && h === s.h}
            onClick={() => { setUnit(s.unit); setW(s.w); setH(s.h); }}>
            {s.label} {custom.units[s.unit]}
          </button>
        ))}
      </div>

      <div class="tool">
        <PhotoTool preset={preset} presetKey={`custom_${pxW}x${pxH}`} strings={strings}
          modelsHref={modelsHref} ctx={ctx} />
        <div class="spec">
          <p class="spec-head">
            <svg width="19" height="19" aria-hidden="true"><use href="#ic-ruler" /></svg>
            {custom.presetHint}
          </p>
          <dl>
            <div class="spec-row">
              <dt>{custom.width} × {custom.height}</dt>
              <dd>{preset.print_width_mm} × {preset.print_height_mm} {custom.unitMm}</dd>
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
