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
}

#[cfg(feature = "rembg")]
impl BgRemover {
    pub fn new(model_path: &str) -> Result<Self, String> {
        use ort::execution_providers::coreml::{CoreML, ComputeUnits};

        let session = Session::builder()
            .map_err(|e| format!("Session builder: {e}"))?
            .with_execution_providers([CoreML::default()
                .with_compute_units(ComputeUnits::CPUAndNeuralEngine)
                .build()])
            .map_err(|e| format!("Execution provider: {e}"))?
            .commit_from_file(model_path)
            .map_err(|e| format!("Load model: {e}"))?;

        Ok(Self {
            session: std::sync::Mutex::new(session),
        })
    }

    /// Remove background and replace with white. Returns the processed image.
    pub fn remove_bg(&self, img: &DynamicImage) -> Result<DynamicImage, String> {
        let (orig_w, orig_h) = img.dimensions();

        // u2netp expects 320x320 input, normalized to [0,1]
        let input_size = 320u32;
        let resized = img.resize_exact(input_size, input_size, image::imageops::FilterType::Lanczos3);
        let rgb = resized.to_rgb8();

        // Build NCHW tensor [1, 3, 320, 320], normalized with ImageNet mean/std
        let mean = [0.485f32, 0.456, 0.406];
        let std = [0.229f32, 0.224, 0.225];
        let mut input = Array4::<f32>::zeros((1, 3, input_size as usize, input_size as usize));
        for y in 0..input_size as usize {
            for x in 0..input_size as usize {
                let px = rgb.get_pixel(x as u32, y as u32);
                for c in 0..3 {
                    input[[0, c, y, x]] = (px[c] as f32 / 255.0 - mean[c]) / std[c];
                }
            }
        }

        // Run inference
        let tensor = TensorRef::from_array_view(&input)
            .map_err(|e| format!("Tensor: {e}"))?;

        let mut session = self.session.lock().unwrap();
        let outputs = session
            .run(ort::inputs!["input.1" => tensor])
            .map_err(|e| format!("Inference: {e}"))?;

        // First output is the mask [1, 1, 320, 320]
        let mask_output = outputs.values().next()
            .ok_or("No output")?;
        let mask_array = mask_output.try_extract_array::<f32>()
            .map_err(|e| format!("Extract mask: {e}"))?;

        // Normalize mask to 0..1
        let mask_slice = mask_array.as_slice().unwrap();
        let min_val = mask_slice.iter().cloned().fold(f32::INFINITY, f32::min);
        let max_val = mask_slice.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
        let range = (max_val - min_val).max(1e-6);

        // Resize mask back to original dimensions
        let mask_img = image::GrayImage::from_fn(input_size, input_size, |x, y| {
            let v = mask_slice[(y * input_size + x) as usize];
            let normalized = ((v - min_val) / range * 255.0).clamp(0.0, 255.0) as u8;
            image::Luma([normalized])
        });
        let mask_resized = image::imageops::resize(
            &mask_img, orig_w, orig_h,
            image::imageops::FilterType::Lanczos3,
        );

        // Apply mask: foreground over white background
        let rgba = img.to_rgba8();
        let mut result = RgbaImage::from_pixel(orig_w, orig_h, Rgba([255, 255, 255, 255]));
        for y in 0..orig_h {
            for x in 0..orig_w {
                let alpha = mask_resized.get_pixel(x, y)[0] as f32 / 255.0;
                let fg = rgba.get_pixel(x, y);
                let bg = [255u8, 255, 255];
                let r = (fg[0] as f32 * alpha + bg[0] as f32 * (1.0 - alpha)) as u8;
                let g = (fg[1] as f32 * alpha + bg[1] as f32 * (1.0 - alpha)) as u8;
                let b = (fg[2] as f32 * alpha + bg[2] as f32 * (1.0 - alpha)) as u8;
                result.put_pixel(x, y, Rgba([r, g, b, 255]));
            }
        }

        Ok(DynamicImage::ImageRgba8(result))
    }
}
