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
  // Turkey
  turkey: {
    name: "Turkey (ikamet)", digital_width: 600, digital_height: 720, max_file_size_kb: 300,
    print_width_mm: 50, print_height_mm: 60, face_height_percent: 56.7,
    face_top_margin_percent: 16.7, eye_line_from_bottom_percent: 60.0,
    photo_count: 4, notes: "White bg, no headwear, max 120 days old",
  },
  // USA
  us_passport: {
    name: "USA Passport", digital_width: 600, digital_height: 600, max_file_size_kb: 240,
    print_width_mm: 51, print_height_mm: 51, face_height_percent: 56.0,
    face_top_margin_percent: 15.0, eye_line_from_bottom_percent: 62.5,
    photo_count: 2, notes: "White bg, 2x2 inch",
  },
  us_visa: {
    name: "USA Visa / Green Card", digital_width: 600, digital_height: 600, max_file_size_kb: 240,
    print_width_mm: 51, print_height_mm: 51, face_height_percent: 56.0,
    face_top_margin_percent: 15.0, eye_line_from_bottom_percent: 62.5,
    photo_count: 2, notes: "White bg, 2x2 inch, head 50-69%",
  },
  // Europe
  eu_schengen: {
    name: "Schengen (EU)", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 75.6,
    face_top_margin_percent: 5.5, eye_line_from_bottom_percent: 62.5,
    photo_count: 2, notes: "White bg, 35x45mm, face 32-36mm",
  },
  uk_passport: {
    name: "UK Passport", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 66.7,
    face_top_margin_percent: 6.7, eye_line_from_bottom_percent: 62.0,
    photo_count: 2, notes: "Light grey bg, 35x45mm",
  },
  // Canada
  ca_passport: {
    name: "Canada Passport", digital_width: 420, digital_height: 540, max_file_size_kb: 500,
    print_width_mm: 50, print_height_mm: 70, face_height_percent: 46.0,
    face_top_margin_percent: 14.3, eye_line_from_bottom_percent: 58.0,
    photo_count: 2, notes: "White bg, 50x70mm",
  },
  // Asia
  cn_passport: {
    name: "China Passport", digital_width: 390, digital_height: 567, max_file_size_kb: 500,
    print_width_mm: 33, print_height_mm: 48, face_height_percent: 58.3,
    face_top_margin_percent: 6.3, eye_line_from_bottom_percent: 60.0,
    photo_count: 4, notes: "White bg, 33x48mm",
  },
  in_passport: {
    name: "India Passport", digital_width: 413, digital_height: 531, max_file_size_kb: 300,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 60.0,
    face_top_margin_percent: 11.0, eye_line_from_bottom_percent: 60.0,
    photo_count: 4, notes: "White bg, 35x45mm",
  },
  jp_passport: {
    name: "Japan Passport", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 75.6,
    face_top_margin_percent: 5.5, eye_line_from_bottom_percent: 62.0,
    photo_count: 2, notes: "White bg, 35x45mm",
  },
  kr_passport: {
    name: "South Korea", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 75.6,
    face_top_margin_percent: 5.5, eye_line_from_bottom_percent: 62.0,
    photo_count: 2, notes: "White bg, 35x45mm",
  },
  // Australia
  au_passport: {
    name: "Australia Passport", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 71.0,
    face_top_margin_percent: 6.7, eye_line_from_bottom_percent: 62.0,
    photo_count: 2, notes: "White bg, 35x45mm",
  },
  // Russia
  ru_passport: {
    name: "Russia Passport", digital_width: 413, digital_height: 531, max_file_size_kb: 500,
    print_width_mm: 35, print_height_mm: 45, face_height_percent: 75.6,
    face_top_margin_percent: 5.5, eye_line_from_bottom_percent: 62.0,
    photo_count: 4, notes: "White bg, 35x45mm",
  },
  // Custom
  custom: {
    name: "Custom", digital_width: 600, digital_height: 600, max_file_size_kb: 1000,
    print_width_mm: 50, print_height_mm: 50, face_height_percent: 56.0,
    face_top_margin_percent: 15.0, eye_line_from_bottom_percent: 62.0,
    photo_count: 4, notes: "Set your own dimensions",
  },
};

export const PRESET_KEYS = Object.keys(PRESETS);
