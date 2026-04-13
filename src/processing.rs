use image::{DynamicImage, GenericImageView, ImageFormat, Rgba, imageops::FilterType};
use std::io::Cursor;
use std::path::Path;

use crate::preset::Preset;

/// Rotate image 90 degrees clockwise
pub fn rotate_cw(img: &DynamicImage) -> DynamicImage {
    img.rotate90()
}

/// Rotate image 90 degrees counter-clockwise
pub fn rotate_ccw(img: &DynamicImage) -> DynamicImage {
    img.rotate270()
}

/// Image adjustments
#[derive(Clone, Copy)]
pub struct Adjustments {
    pub brightness: f32,  // -100..100, 0 = no change
    pub contrast: f32,    // -100..100, 0 = no change
    pub shadows: f32,     // 0..100, lift shadows
}

impl Default for Adjustments {
    fn default() -> Self {
        Self {
            brightness: 0.0,
            contrast: 0.0,
            shadows: 0.0,
        }
    }
}

/// Apply brightness, contrast, and shadow lifting
pub fn apply_adjustments(img: &DynamicImage, adj: &Adjustments) -> DynamicImage {
    let mut rgba = img.to_rgba8();
    let contrast_factor = (100.0 + adj.contrast) / 100.0;

    for pixel in rgba.pixels_mut() {
        let Rgba([r, g, b, a]) = *pixel;
        let mut rf = r as f32;
        let mut gf = g as f32;
        let mut bf = b as f32;

        // Shadow lift: boost dark pixels more than bright ones
        if adj.shadows > 0.0 {
            let shadow_strength = adj.shadows / 100.0;
            let lift = |v: f32| {
                let darkness = 1.0 - (v / 255.0);
                // Lift more in shadows (quadratic falloff)
                v + darkness * darkness * shadow_strength * 80.0
            };
            rf = lift(rf);
            gf = lift(gf);
            bf = lift(bf);
        }

        // Brightness
        rf += adj.brightness * 2.55;
        gf += adj.brightness * 2.55;
        bf += adj.brightness * 2.55;

        // Contrast (around midpoint 128)
        rf = (rf - 128.0) * contrast_factor + 128.0;
        gf = (gf - 128.0) * contrast_factor + 128.0;
        bf = (bf - 128.0) * contrast_factor + 128.0;

        *pixel = Rgba([
            rf.clamp(0.0, 255.0) as u8,
            gf.clamp(0.0, 255.0) as u8,
            bf.clamp(0.0, 255.0) as u8,
            a,
        ]);
    }

    DynamicImage::ImageRgba8(rgba)
}

/// Crop source image to preset aspect ratio centered on (cx, cy) in 0.0..1.0 coords,
/// then resize to digital dimensions.
/// `scale` = 0.3..1.0, controls how much of the image the crop covers
pub fn crop_and_resize(
    img: &DynamicImage,
    preset: &Preset,
    cx: f64,
    cy: f64,
    scale: f64,
) -> DynamicImage {
    let (src_w, src_h) = img.dimensions();
    let target_ratio = preset.aspect_ratio();
    let src_ratio = src_w as f64 / src_h as f64;

    // Max crop box that matches target aspect ratio
    let (max_w, max_h) = if src_ratio > target_ratio {
        let h = src_h as f64;
        let w = h * target_ratio;
        (w, h)
    } else {
        let w = src_w as f64;
        let h = w / target_ratio;
        (w, h)
    };

    let crop_w = max_w * scale;
    let crop_h = max_h * scale;

    let center_x = cx * src_w as f64;
    let center_y = cy * src_h as f64;

    let x = (center_x - crop_w / 2.0).clamp(0.0, (src_w as f64 - crop_w).max(0.0)) as u32;
    let y = (center_y - crop_h / 2.0).clamp(0.0, (src_h as f64 - crop_h).max(0.0)) as u32;

    let cropped = img.crop_imm(x, y, crop_w as u32, crop_h as u32);
    cropped.resize_exact(preset.digital_width, preset.digital_height, FilterType::Lanczos3)
}

/// Encode to JPEG with quality control to fit max_file_size_kb.
pub fn encode_jpeg(img: &DynamicImage, max_kb: u32) -> Vec<u8> {
    let mut quality = 95u8;
    loop {
        let mut buf = Cursor::new(Vec::new());
        let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, quality);
        img.write_with_encoder(encoder).expect("JPEG encode failed");
        let data = buf.into_inner();
        if data.len() <= max_kb as usize * 1024 || quality <= 30 {
            return data;
        }
        quality -= 5;
    }
}

/// Save processed photo. `use_png` = true for lossless PNG, false for JPEG with size limit.
pub fn save_processed(
    img: &DynamicImage,
    preset: &Preset,
    output_dir: &Path,
    stem: &str,
    preset_key: &str,
    use_png: bool,
) -> Result<String, String> {
    std::fs::create_dir_all(output_dir).map_err(|e| e.to_string())?;

    let ts = chrono::Local::now().format("%Y%m%d_%H%M%S");

    if use_png {
        let filename = format!("{stem}_{preset_key}_{ts}.png");
        let path = output_dir.join(&filename);
        img.save_with_format(&path, ImageFormat::Png).map_err(|e| e.to_string())?;
        Ok(path.to_string_lossy().to_string())
    } else {
        let filename = format!("{stem}_{preset_key}_{ts}.jpg");
        let path = output_dir.join(&filename);
        let data = encode_jpeg(img, preset.max_file_size_kb);
        std::fs::write(&path, data).map_err(|e| e.to_string())?;
        Ok(path.to_string_lossy().to_string())
    }
}

/// Generate A4 print layout with N copies of the photo (300 DPI).
pub fn generate_print_layout(
    img: &DynamicImage,
    preset: &Preset,
    output_dir: &Path,
    stem: &str,
    preset_key: &str,
) -> Result<String, String> {
    use image::{Rgb, RgbImage};

    let dpi: f64 = 300.0;
    let a4_w = (210.0 / 25.4 * dpi) as u32; // ~2480px
    let a4_h = (297.0 / 25.4 * dpi) as u32; // ~3508px

    let photo_w = (preset.print_width_mm as f64 / 25.4 * dpi) as u32;
    let photo_h = (preset.print_height_mm as f64 / 25.4 * dpi) as u32;

    let print_img = img.resize_exact(photo_w, photo_h, FilterType::Lanczos3);

    let mut canvas = RgbImage::from_pixel(a4_w, a4_h, Rgb([255, 255, 255]));

    let cols = (a4_w - 40) / (photo_w + 20);
    let rows = (a4_h - 40) / (photo_h + 20);
    let total = (cols * rows).min(preset.photo_count);

    let margin_x = (a4_w - cols * photo_w - (cols - 1) * 20) / 2;
    let margin_y = (a4_h - rows * photo_h - (rows - 1) * 20) / 2;

    let mut placed = 0u32;
    for row in 0..rows {
        for col in 0..cols {
            if placed >= total {
                break;
            }
            let x = margin_x + col * (photo_w + 20);
            let y = margin_y + row * (photo_h + 20);
            image::imageops::overlay(&mut canvas, &print_img.to_rgb8(), x as i64, y as i64);
            placed += 1;
        }
    }

    let ts = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let filename = format!("{stem}_{preset_key}_A4_{ts}.png");
    let path = output_dir.join(&filename);
    canvas.save_with_format(&path, ImageFormat::Png).map_err(|e| e.to_string())?;

    Ok(path.to_string_lossy().to_string())
}
