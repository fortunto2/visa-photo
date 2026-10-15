use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Preset {
    pub name: String,
    pub digital_width: u32,
    pub digital_height: u32,
    pub max_file_size_kb: u32,
    pub print_width_mm: u32,
    pub print_height_mm: u32,
    pub face_height_percent: f64,
    pub face_top_margin_percent: f64,
    pub eye_line_from_bottom_percent: f64,
    pub photo_count: u32,
    pub notes: String,
}

impl Preset {
    /// Aspect ratio of the digital output
    pub fn aspect_ratio(&self) -> f64 {
        self.digital_width as f64 / self.digital_height as f64
    }
}
