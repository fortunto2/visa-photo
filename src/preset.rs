use serde::Deserialize;
use std::collections::HashMap;
use std::path::Path;

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
    pub background: String,
    pub photo_count: u32,
    pub format: String,
    pub notes: String,
}

impl Preset {
    /// Aspect ratio of the digital output
    pub fn aspect_ratio(&self) -> f64 {
        self.digital_width as f64 / self.digital_height as f64
    }
}

pub fn load_presets(path: &Path) -> Result<HashMap<String, Preset>, String> {
    let content = std::fs::read_to_string(path).map_err(|e| format!("Cannot read presets: {e}"))?;
    let presets: HashMap<String, Preset> =
        toml::from_str(&content).map_err(|e| format!("Invalid TOML: {e}"))?;
    Ok(presets)
}
