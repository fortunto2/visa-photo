#[cfg(feature = "rembg")]
use image::{DynamicImage, GenericImageView, Rgba, RgbaImage};
#[cfg(feature = "rembg")]
use ndarray::Array4;
#[cfg(feature = "rembg")]
use ort::session::Session;
#[cfg(feature = "rembg")]
use ort::value::TensorRef;

#[cfg(feature = "rembg")]
pub struct BgRemover {
    session: std::sync::Mutex<Session>,
    input_size: u32,
    input_name: String,
    model_id: String,
}

#[cfg(feature = "rembg")]
impl BgRemover {
    pub fn new(model_path: &str, input_size: u32, input_name: &str, model_id: &str) -> Result<Self, String> {
        use ort::execution_providers::coreml::{CoreML, ComputeUnits};
        use ort::session::builder::GraphOptimizationLevel;

        eprintln!("[rembg] Loading {} from {}...", model_id, model_path);

        let session = Session::builder()
            .map_err(|e| format!("Session builder: {e}"))?
            .with_optimization_level(GraphOptimizationLevel::Level3)
            .map_err(|e| format!("Optimization: {e}"))?
            .with_intra_threads(4)
            .map_err(|e| format!("Threads: {e}"))?
            .with_execution_providers([CoreML::default()
                .with_subgraphs(true)
                .with_compute_units(ComputeUnits::CPUAndNeuralEngine)
                .build()])
            .map_err(|e| format!("Execution provider: {e}"))?
            .commit_from_file(model_path)
            .map_err(|e| format!("Load model: {e}"))?;

        eprintln!("[rembg] Model {} loaded OK", model_id);

        Ok(Self {
            session: std::sync::Mutex::new(session),
            input_size,
            input_name: input_name.to_string(),
            model_id: model_id.to_string(),
        })
    }

    pub fn model_id(&self) -> &str { &self.model_id }

    /// Remove background and replace with white.
    pub fn remove_bg(&self, img: &DynamicImage) -> Result<DynamicImage, String> {
        let (orig_w, orig_h) = img.dimensions();
        let sz = self.input_size;
        eprintln!("[rembg] Processing {}x{} with {} ({}x{})", orig_w, orig_h, self.model_id, sz, sz);

        let resized = img.resize_exact(sz, sz, image::imageops::FilterType::Lanczos3);
        let rgb = resized.to_rgb8();

        let mean = [0.485f32, 0.456, 0.406];
        let std_dev = [0.229f32, 0.224, 0.225];
        let mut input = Array4::<f32>::zeros((1, 3, sz as usize, sz as usize));
        for y in 0..sz as usize {
            for x in 0..sz as usize {
                let px = rgb.get_pixel(x as u32, y as u32);
                for c in 0..3 {
                    input[[0, c, y, x]] = (px[c] as f32 / 255.0 - mean[c]) / std_dev[c];
                }
            }
        }

        let tensor = TensorRef::from_array_view(&input)
            .map_err(|e| format!("Tensor: {e}"))?;

        let t0 = std::time::Instant::now();
        let mut session = self.session.lock().unwrap();
        let outputs = session
            .run(ort::inputs![self.input_name.as_str() => tensor])
            .map_err(|e| format!("Inference: {e}"))?;
        eprintln!("[rembg] Inference done in {:.1}s", t0.elapsed().as_secs_f32());

        let mask_output = outputs.values().next().ok_or("No output")?;
        let mask_array = mask_output.try_extract_array::<f32>()
            .map_err(|e| format!("Extract mask: {e}"))?;

        let mask_slice = mask_array.as_slice().unwrap();
        let min_val = mask_slice.iter().cloned().fold(f32::INFINITY, f32::min);
        let max_val = mask_slice.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        let range = (max_val - min_val).max(1e-6);

        let mask_img = image::GrayImage::from_fn(sz, sz, |x, y| {
            let idx = (y * sz + x) as usize;
            let v = if idx < mask_slice.len() { mask_slice[idx] } else { 0.0 };
            image::Luma([((v - min_val) / range * 255.0).clamp(0.0, 255.0) as u8])
        });

        let mask_resized = image::imageops::resize(
            &mask_img, orig_w, orig_h,
            image::imageops::FilterType::Lanczos3,
        );

        let rgba = img.to_rgba8();
        let mut result = RgbaImage::from_pixel(orig_w, orig_h, Rgba([255, 255, 255, 255]));
        for y in 0..orig_h {
            for x in 0..orig_w {
                let alpha = mask_resized.get_pixel(x, y)[0] as f32 / 255.0;
                let fg = rgba.get_pixel(x, y);
                let r = (fg[0] as f32 * alpha + 255.0 * (1.0 - alpha)) as u8;
                let g = (fg[1] as f32 * alpha + 255.0 * (1.0 - alpha)) as u8;
                let b = (fg[2] as f32 * alpha + 255.0 * (1.0 - alpha)) as u8;
                result.put_pixel(x, y, Rgba([r, g, b, 255]));
            }
        }

        Ok(DynamicImage::ImageRgba8(result))
    }
}
