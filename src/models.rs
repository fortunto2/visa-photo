use serde::Deserialize;
use std::path::PathBuf;

#[derive(Clone, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub size_mb: u32,
    pub input_size: u32,
    pub input_name: String,
    pub url: String,
    pub quality: u8,
}

#[derive(Deserialize)]
struct ModelsFile {
    models: Vec<ModelInfo>,
}

pub fn load_models() -> Vec<ModelInfo> {
    let path = crate::project_dir().join("models.toml");
    if let Ok(content) = std::fs::read_to_string(&path) {
        if let Ok(f) = toml::from_str::<ModelsFile>(&content) {
            return f.models;
        }
        eprintln!("[models] Failed to parse {}", path.display());
    }
    eprintln!("[models] models.toml not found, using defaults");
    defaults()
}

fn defaults() -> Vec<ModelInfo> {
    vec![
        ModelInfo {
            id: "u2net_human_seg".into(), name: "U2Net Human".into(),
            size_mb: 176, input_size: 320, input_name: "input.1".into(),
            url: "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx".into(),
            quality: 4,
        },
        ModelInfo {
            id: "silueta".into(), name: "Silueta".into(),
            size_mb: 43, input_size: 320, input_name: "input.1".into(),
            url: "https://github.com/danielgatis/rembg/releases/download/v0.0.0/silueta.onnx".into(),
            quality: 2,
        },
    ]
}

pub fn models_dir() -> PathBuf {
    crate::project_dir().join("models")
}

pub fn model_path(info: &ModelInfo) -> PathBuf {
    models_dir().join(format!("{}.onnx", info.id))
}

pub fn is_downloaded(info: &ModelInfo) -> bool {
    model_path(info).exists()
}

pub fn download_model(info: &ModelInfo) -> Result<(), String> {
    let path = model_path(info);
    let _ = std::fs::create_dir_all(models_dir());
    let output = std::process::Command::new("curl")
        .args(["-L", "-o"])
        .arg(&path)
        .arg(&info.url)
        .output()
        .map_err(|e| format!("curl: {e}"))?;
    if output.status.success() { Ok(()) }
    else { Err(format!("Download failed: {}", String::from_utf8_lossy(&output.stderr))) }
}
