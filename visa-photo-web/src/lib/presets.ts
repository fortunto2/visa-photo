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

export const PRESETS: Record<string, Preset> = {
  turkey: {
    name: "Turkey (ikamet)",
    digital_width: 600, digital_height: 720,
    max_file_size_kb: 300,
    print_width_mm: 50, print_height_mm: 60,
    face_height_percent: 56.7,
    face_top_margin_percent: 16.7,
    eye_line_from_bottom_percent: 60.0,
    photo_count: 4,
    notes: "White bg, no headwear, max 120 days old",
  },
  usa_greencard: {
    name: "USA (Green Card)",
    digital_width: 600, digital_height: 600,
    max_file_size_kb: 240,
    print_width_mm: 51, print_height_mm: 51,
    face_height_percent: 56.0,
    face_top_margin_percent: 15.0,
    eye_line_from_bottom_percent: 62.5,
    photo_count: 2,
    notes: "White bg, 2x2 inch, head 50-69%",
  },
  eu_schengen: {
    name: "Schengen (EU)",
    digital_width: 413, digital_height: 531,
    max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45,
    face_height_percent: 75.6,
    face_top_margin_percent: 5.5,
    eye_line_from_bottom_percent: 62.5,
    photo_count: 2,
    notes: "White bg, 35x45mm, face 32-36mm",
  },
  custom: {
    name: "Custom",
    digital_width: 600, digital_height: 600,
    max_file_size_kb: 1000,
    print_width_mm: 50, print_height_mm: 50,
    face_height_percent: 56.0,
    face_top_margin_percent: 15.0,
    eye_line_from_bottom_percent: 62.0,
    photo_count: 4,
    notes: "Set your own dimensions",
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);
