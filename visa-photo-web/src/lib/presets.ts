import toml from "toml";
import presetsRaw from "../../../presets.toml?raw";

export interface Preset {
  name: string;
  digital_width: number;
  digital_height: number;
  max_file_size_kb: number;
  /**
   * Absent where the authority publishes no physical size.
   *
   * Thailand's e-Visa is the case that forced this: the portal states a head share, a file
   * ceiling and a minimum height in pixels, and no millimetres anywhere. Every photo service
   * quotes 35x45 mm for it, a figure that belongs to the paper visa Thailand replaced. Writing
   * that number here to satisfy the type would have made us repeat the error we found.
   */
  print_width_mm?: number;
  print_height_mm?: number;
  face_height_percent: number;
  face_top_margin_percent: number;
  eye_line_from_bottom_percent: number;
  photo_count: number;
  notes: string;
  /**
   * Both are set on every preset in presets.toml and read on every page; they were missing
   * from this interface, so three call sites each invented their own `?? "white"` default
   * for a field that is never actually absent.
   */
  background: "white" | "light-grey";
  format: "jpeg" | "png";

  /**
   * Optional, because requirements are not all the same shape.
   *
   * A lower weight bound exists: New Zealand rejects anything under 250 KB, and our exports
   * were landing at 70-135 KB — technically correct pixels in a file too small to submit.
   * Ranges appear where an authority states one instead of a single size.
   */
  min_file_size_kb?: number;
  digital_max_width?: number;
  digital_max_height?: number;
}

export const PRESETS: Record<string, Preset> = toml.parse(presetsRaw);
export const PRESET_KEYS = Object.keys(PRESETS);

/**
 * The DPI a preset implies.
 *
 * Snapped to the nearest standard value when within 2 %: presets store whole millimetres, so a
 * US 2x2 photo is filed as 51 mm rather than 50.8, and dividing by that yields 299 for a file
 * that is plainly 300. Stamping a made-up number into the metadata is worse than stamping none.
 */
export function dpiOf(preset: Preset): number | null {
  if (!preset.print_width_mm) return null;
  const exact = (preset.digital_width / preset.print_width_mm) * 25.4;
  for (const standard of [72, 150, 300, 600]) {
    if (Math.abs(exact - standard) / standard < 0.02) return standard;
  }
  return Math.round(exact);
}
