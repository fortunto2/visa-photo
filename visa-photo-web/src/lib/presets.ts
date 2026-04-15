import toml from "toml";
import presetsRaw from "../../../presets.toml?raw";

export interface Preset {
  name: string;
  digital_width: number;
  digital_height: number;
  max_file_size_kb: number;
  print_width_mm: number;
  print_height_mm: number;
  face_height_percent: number;
  face_top_margin_percent: number;
  eye_line_from_bottom_percent: number;
  photo_count: number;
  notes: string;
}

export const PRESETS: Record<string, Preset> = toml.parse(presetsRaw);
export const PRESET_KEYS = Object.keys(PRESETS);
