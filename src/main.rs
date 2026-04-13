mod background;
mod models;
mod preset;
mod processing;

use base64::Engine;
use dioxus::prelude::*;
use dioxus::prelude::dioxus_elements::geometry::WheelDelta;
use image::GenericImageView;
use preset::Preset;
use processing::Adjustments;
use std::collections::HashMap;
use std::path::PathBuf;

const PRESETS_TOML: &str = include_str!("../presets.toml");
const MAX_W: f64 = 500.0;
const MAX_H: f64 = 620.0;

fn load_embedded_presets() -> HashMap<String, Preset> {
    // Try loading from file first (allows runtime edits), fallback to embedded
    let path = project_dir().join("presets.toml");
    if let Ok(content) = std::fs::read_to_string(&path) {
        if let Ok(p) = toml::from_str(&content) {
            return p;
        }
    }
    toml::from_str(PRESETS_TOML).expect("Invalid embedded presets.toml")
}

#[derive(Clone)]
struct ThumbInfo {
    data_uri: String,
    orig_w: u32,
    orig_h: u32,
}

/// Tiny thumbnail for sidebar list (60px)
fn make_mini_thumb(path: &PathBuf) -> Option<String> {
    let img = image::open(path).ok()?;
    let thumb = img.thumbnail(60, 60);
    let mut buf = std::io::Cursor::new(Vec::new());
    thumb.write_to(&mut buf, image::ImageFormat::Jpeg).ok()?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Some(format!("data:image/jpeg;base64,{b64}"))
}

fn make_thumbnail(path: &PathBuf, rotation: u32) -> Option<ThumbInfo> {
    let mut img = image::open(path).ok()?;
    let (orig_w, orig_h) = img.dimensions();
    // Apply rotation to thumbnail (small image, fast)
    img = match rotation {
        90 => img.rotate90(),
        180 => img.rotate180(),
        270 => img.rotate270(),
        _ => img,
    };
    let thumb = img.thumbnail(800, 800);
    let mut buf = std::io::Cursor::new(Vec::new());
    thumb.write_to(&mut buf, image::ImageFormat::Jpeg).ok()?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Some(ThumbInfo {
        data_uri: format!("data:image/jpeg;base64,{b64}"),
        orig_w,
        orig_h,
    })
}

/// Compute container size that fits the image with no letterbox
fn container_for_image(img_w: u32, img_h: u32, rotation: u32) -> (f64, f64) {
    let (iw, ih) = if rotation == 90 || rotation == 270 {
        (img_h as f64, img_w as f64)
    } else {
        (img_w as f64, img_h as f64)
    };
    let ratio = iw / ih;
    if ratio > MAX_W / MAX_H {
        (MAX_W, MAX_W / ratio)
    } else {
        (MAX_H * ratio, MAX_H)
    }
}

/// Crop rect on a container sized exactly to the image (no offset)
/// `scale` = 0.3..1.0, 1.0 = maximum crop size
fn crop_rect_px(
    cx: f64, cy: f64,
    preset: &Preset,
    cw_cont: f64, ch_cont: f64,
    scale: f64,
) -> (f64, f64, f64, f64) {
    let crop_ratio = preset.digital_width as f64 / preset.digital_height as f64;
    let img_ratio = cw_cont / ch_cont;

    // Max crop size
    let (max_cw, max_ch) = if crop_ratio > img_ratio {
        (cw_cont, cw_cont / crop_ratio)
    } else {
        (ch_cont * crop_ratio, ch_cont)
    };

    // Apply scale
    let cw = max_cw * scale;
    let ch = max_ch * scale;

    let center_x = cx * cw_cont;
    let center_y = cy * ch_cont;
    let left = (center_x - cw / 2.0).clamp(0.0, (cw_cont - cw).max(0.0));
    let top = (center_y - ch / 2.0).clamp(0.0, (ch_cont - ch).max(0.0));
    (left, top, cw, ch)
}

fn project_dir() -> PathBuf {
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

#[cfg(feature = "rembg")]
use std::sync::Mutex as StdMutex;

#[cfg(feature = "rembg")]
static BG_REMOVER: std::sync::OnceLock<StdMutex<Option<(background::BgRemover, String)>>> = std::sync::OnceLock::new();

#[cfg(feature = "rembg")]
fn load_bg_model(info: &models::ModelInfo) -> Result<(), String> {
    let path = models::model_path(info);
    if !path.exists() {
        return Err(format!("Модель не скачана: {}", info.name));
    }
    let remover = background::BgRemover::new(
        &path.to_string_lossy(), info.input_size, &info.input_name, &info.id,
    )?;
    let lock = BG_REMOVER.get_or_init(|| StdMutex::new(None));
    *lock.lock().unwrap() = Some((remover, info.id.to_string()));
    Ok(())
}

fn main() {
    dioxus::launch(app);
}

fn app() -> Element {
    let mut presets = use_signal(|| load_embedded_presets());
    let preset_keys: Vec<String> = {
        let p = presets.read();
        let mut keys: Vec<String> = p.keys().cloned().collect();
        keys.sort();
        keys
    };
    let mut selected_preset = use_signal(|| "turkey".to_string());
    let mut sidebar_tab: Signal<u8> = use_signal(|| 0); // 0=Фото, 1=Настройки
    let mut photos: Signal<Vec<PathBuf>> = use_signal(Vec::new);
    let mut selected_photo: Signal<Option<usize>> = use_signal(|| None);
    let mut current_thumb: Signal<Option<ThumbInfo>> = use_signal(|| None);
    let mut available_models = use_signal(|| models::load_models());
    let mut results: Signal<Vec<String>> = use_signal(Vec::new);
    let mut status: Signal<String> = use_signal(|| "Готово к работе".to_string());
    let mut crop_cx: Signal<f64> = use_signal(|| 0.5);
    let mut crop_cy: Signal<f64> = use_signal(|| 0.4);
    let mut dragging: Signal<bool> = use_signal(|| false);
    let mut person_name: Signal<String> = use_signal(|| String::new());
    let mut brightness: Signal<f32> = use_signal(|| 0.0);
    let mut contrast: Signal<f32> = use_signal(|| 0.0);
    let mut shadows: Signal<f32> = use_signal(|| 0.0);
    let mut use_png: Signal<bool> = use_signal(|| false);
    let mut rotations: Signal<HashMap<PathBuf, u32>> = use_signal(HashMap::new);
    let mut crop_scale: Signal<f64> = use_signal(|| 1.0); // 0.3..1.0, 1.0 = max crop
    let mut custom_w: Signal<String> = use_signal(|| "600".to_string());
    let mut custom_h: Signal<String> = use_signal(|| "600".to_string());
    // Config editor state: (filename, content)
    let mut editing_config: Signal<Option<(String, String)>> = use_signal(|| None);
    #[cfg(feature = "rembg")]
    let mut active_model_id: Signal<String> = use_signal(|| "u2net_human_seg".to_string());
    #[cfg(feature = "rembg")]
    let mut downloading: Signal<Option<String>> = use_signal(|| None); // model id being downloaded

    use_effect(move || {
        let dir = project_dir().join("photos/originals");
        if dir.exists() {
            let mut found: Vec<PathBuf> = std::fs::read_dir(&dir)
                .into_iter()
                .flatten()
                .filter_map(|e| e.ok())
                .map(|e| e.path())
                .filter(|p| {
                    matches!(
                        p.extension().and_then(|e| e.to_str()),
                        Some("png" | "jpg" | "jpeg")
                    )
                })
                .collect();
            found.sort();
            photos.set(found);
        }
    });

    let current_preset = {
        let p = presets.read();
        let key = selected_preset.read();
        let mut pr = p.get(&*key).cloned();
        // Override custom preset dimensions from input fields
        if *key == "custom" {
            if let Some(ref mut preset) = pr {
                if let Ok(w) = custom_w.read().parse::<u32>() { preset.digital_width = w; }
                if let Ok(h) = custom_h.read().parse::<u32>() { preset.digital_height = h; }
            }
        }
        pr
    };

    let current_photo_path: Option<PathBuf> = selected_photo
        .read()
        .and_then(|idx| photos.read().get(idx).cloned());

    let current_rotation: u32 = current_photo_path
        .as_ref()
        .and_then(|p| rotations.read().get(p).copied())
        .unwrap_or(0);

    let photo_for_ccw = current_photo_path.clone();
    let photo_for_cw = current_photo_path.clone();

    let br_val = 1.0 + *brightness.read() / 100.0;
    let ct_val = 1.0 + *contrast.read() / 100.0;
    let sh_val = *shadows.read() / 100.0 * 0.3;
    let img_style = format!(
        "filter: brightness({:.2}) contrast({:.2}); width:100%; height:100%;",
        br_val + sh_val, ct_val
    );

    let thumb_info = current_thumb.read().clone();

    // Container sized to image — no letterbox
    let (cont_w, cont_h) = thumb_info.as_ref()
        .map(|ti| container_for_image(ti.orig_w, ti.orig_h, current_rotation))
        .unwrap_or((MAX_W, MAX_H));

    // Crop rect + face guides
    // All guide positions are in px FROM TOP OF CROP RECT
    #[derive(Clone, Copy)]
    struct CropGuides {
        left: f64, top: f64, width: f64, height: f64,
        head_top_y: f64,   // top of head line (from crop top)
        chin_y: f64,        // chin line (from crop top)
        eye_y: f64,         // eye line (from crop top)
        face_height: f64,   // for oval height
    }

    let crop: Option<CropGuides> = thumb_info.as_ref().and_then(|_| {
        current_preset.as_ref().map(|pr| {
            let (cl, ct, cw, ch) = crop_rect_px(*crop_cx.read(), *crop_cy.read(), pr, cont_w, cont_h, *crop_scale.read());
            // Top of head = top margin %
            let head_top_y = ch * pr.face_top_margin_percent / 100.0;
            // Chin = top margin + face height
            let face_h = ch * pr.face_height_percent / 100.0;
            let chin_y = head_top_y + face_h;
            // Eye line from bottom of crop
            let eye_y = ch * (1.0 - pr.eye_line_from_bottom_percent / 100.0);
            CropGuides {
                left: cl, top: ct, width: cw, height: ch,
                head_top_y, chin_y, eye_y, face_height: face_h,
            }
        })
    });

    let container_style = format!(
        "width:{cont_w:.0}px; height:{cont_h:.0}px;"
    );

    rsx! {
        style { {CSS} }
        div { class: "app",
            div { class: "header",
                h1 { "Visa Photo" }
            }

            div { class: "main-layout",
                div { class: "sidebar",
                    // Tabs
                    div { class: "tabs",
                        button {
                            class: if *sidebar_tab.read() == 0 { "tab active" } else { "tab" },
                            onclick: move |_| sidebar_tab.set(0),
                            "Фото"
                        }
                        button {
                            class: if *sidebar_tab.read() == 1 { "tab active" } else { "tab" },
                            onclick: move |_| sidebar_tab.set(1),
                            "Настройки"
                        }
                    }

                    // Tab 0: Photos
                    if *sidebar_tab.read() == 0 {
                        h3 { "Страна" }
                        for key in preset_keys.iter() {
                            {
                                let k = key.clone();
                                let k2 = key.clone();
                                rsx! {
                                    button {
                                        class: if *selected_preset.read() == k { "preset-btn active" } else { "preset-btn" },
                                        onclick: move |_| selected_preset.set(k2.clone()),
                                        { presets.read().get(&k).map(|pr| pr.name.clone()).unwrap_or(k.clone()) }
                                    }
                                }
                            }
                        }
                        if let Some(ref pr) = current_preset {
                            div { class: "preset-info",
                                p { "{pr.digital_width}x{pr.digital_height}px | {pr.print_width_mm}x{pr.print_height_mm}mm | {pr.photo_count}шт" }
                                p { class: "notes", "{pr.notes}" }
                            }
                            if *selected_preset.read() == "custom" {
                                div { class: "custom-size",
                                    label { "W:" }
                                    input { r#type: "number", value: "{custom_w}", class: "size-input",
                                        oninput: move |e: Event<FormData>| custom_w.set(e.value().clone()),
                                    }
                                    label { "H:" }
                                    input { r#type: "number", value: "{custom_h}", class: "size-input",
                                        oninput: move |e: Event<FormData>| custom_h.set(e.value().clone()),
                                    }
                                    span { class: "size-hint", "px" }
                                }
                            }
                        }

                        h3 { "Фотографии" }
                        button {
                            class: "add-btn",
                            onclick: move |_| {
                                let files = rfd::FileDialog::new()
                                    .add_filter("Images", &["png", "jpg", "jpeg", "heic", "HEIC"])
                                    .pick_files();
                                if let Some(paths) = files {
                                    let originals_dir = project_dir().join("photos/originals");
                                    let _ = std::fs::create_dir_all(&originals_dir);
                                    let mut current = photos.read().clone();
                                    for p in paths {
                                        let ext = p.extension().and_then(|e| e.to_str()).unwrap_or("");
                                        let final_path = if ext.eq_ignore_ascii_case("heic") {
                                            let out = originals_dir.join(p.file_stem().unwrap()).with_extension("png");
                                            let _ = std::process::Command::new("sips")
                                                .args(["-s", "format", "png"]).arg(&p).arg("--out").arg(&out).output();
                                            out
                                        } else { p };
                                        current.push(final_path);
                                    }
                                    photos.set(current);
                                }
                            },
                            "+ Добавить"
                        }
                        div { class: "photo-list",
                            for (i, path) in photos.read().iter().enumerate() {
                                {
                                let name_str = path.file_name().unwrap_or_default().to_string_lossy().to_string();
                                if !name_str.contains("_nobg") {
                                    let path_clone = path.clone();
                                    rsx! {
                                        button {
                                            class: if *selected_photo.read() == Some(i) { "photo-item active" } else { "photo-item" },
                                            onclick: move |_| {
                                                selected_photo.set(Some(i));
                                                crop_cx.set(0.5);
                                                crop_cy.set(0.4);
                                                let rot = rotations.read().get(&path_clone).copied().unwrap_or(0);
                                                current_thumb.set(make_thumbnail(&path_clone, rot));
                                            },
                                            "{name_str}"
                                        }
                                    }
                                } else {
                                    rsx! {}
                                }
                                }
                            }
                        }
                    }

                    // Tab 1: Settings
                    if *sidebar_tab.read() == 1 {
                        h3 { "Модели фона" }
                        p { class: "hint", "Редактируйте models.toml для добавления" }
                        div { class: "model-list",
                            for info in available_models.read().iter() {
                                {
                                    let id = info.id.clone();
                                    let id2 = id.clone();
                                    let id3 = id.clone();
                                    let info_clone = info.clone();
                                    let downloaded = models::is_downloaded(info);
                                    let is_active = *active_model_id.read() == id;
                                    let is_downloading = downloading.read().as_deref() == Some(id.as_str());
                                    let stars = "*".repeat(info.quality as usize);
                                    rsx! {
                                        div { class: if is_active { "model-row active" } else { "model-row" },
                                            div { class: "model-info",
                                                span { class: "model-name", "{info.name}" }
                                                span { class: "model-meta", " {info.size_mb}MB {stars}" }
                                            }
                                            if !downloaded && !is_downloading {
                                                button { class: "dl-btn",
                                                    onclick: move |_| {
                                                        downloading.set(Some(id2.clone()));
                                                        status.set(format!("Скачивание {}...", info_clone.name));
                                                        match models::download_model(&info_clone) {
                                                            Ok(()) => {
                                                                active_model_id.set(id2.clone());
                                                                status.set(format!("{} скачана!", info_clone.name));
                                                            }
                                                            Err(e) => status.set(format!("Ошибка: {e}")),
                                                        }
                                                        downloading.set(None);
                                                    },
                                                    "Скачать"
                                                }
                                            }
                                            if is_downloading {
                                                span { class: "dl-progress", "..." }
                                            }
                                            if downloaded && !is_active {
                                                button { class: "use-btn",
                                                    onclick: move |_| active_model_id.set(id3.clone()),
                                                    "Выбрать"
                                                }
                                            }
                                            if downloaded && is_active {
                                                span { class: "active-mark", "v" }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        h3 { "Конфигурация" }
                        button { class: "cfg-btn",
                            onclick: move |_| {
                                let p = project_dir().join("models.toml");
                                if let Ok(c) = std::fs::read_to_string(&p) {
                                    editing_config.set(Some(("models.toml".into(), c)));
                                }
                            },
                            "models.toml"
                        }
                        button { class: "cfg-btn",
                            onclick: move |_| {
                                let p = project_dir().join("presets.toml");
                                if let Ok(c) = std::fs::read_to_string(&p) {
                                    editing_config.set(Some(("presets.toml".into(), c)));
                                }
                            },
                            "presets.toml"
                        }
                        button { class: "cfg-btn",
                            onclick: move |_| {
                                let _ = std::process::Command::new("open").arg(project_dir().join("photos/originals")).spawn();
                            },
                            "Папка фото"
                        }
                    }
                }

                div { class: "workspace",
                    // Config editor
                    if let Some((ref filename, ref content)) = *editing_config.read() {
                        div { class: "config-editor",
                            div { class: "editor-header",
                                h3 { "{filename}" }
                                div { class: "editor-actions",
                                    button { class: "save-btn",
                                        onclick: move |_| {
                                            let cfg = editing_config.read().clone();
                                            if let Some((ref fname, ref text)) = cfg {
                                                let path = project_dir().join(fname);
                                                match std::fs::write(&path, text) {
                                                    Ok(()) => {
                                                        status.set(format!("{fname} сохранён!"));
                                                        // Reload if needed
                                                        if fname == "models.toml" {
                                                            available_models.set(models::load_models());
                                                        }
                                                        if fname == "presets.toml" {
                                                            presets.set(load_embedded_presets());
                                                        }
                                                    }
                                                    Err(e) => status.set(format!("Ошибка: {e}")),
                                                }
                                            }
                                        },
                                        "Сохранить"
                                    }
                                    button { class: "close-btn",
                                        onclick: move |_| editing_config.set(None),
                                        "X"
                                    }
                                }
                            }
                            textarea {
                                class: "config-textarea",
                                value: "{content}",
                                oninput: move |evt: Event<FormData>| {
                                    let cfg = editing_config.read().clone();
                                    if let Some((fname, _)) = cfg {
                                        editing_config.set(Some((fname, evt.value().clone())));
                                    }
                                },
                            }
                        }
                    } else if thumb_info.is_some() {
                        div { class: "preview-area",
                            div {
                                class: "image-container",
                                style: "{container_style}",
                                onmousedown: {
                                    let cw = cont_w;
                                    let ch = cont_h;
                                    move |evt: Event<MouseData>| {
                                        let c = evt.element_coordinates();
                                        crop_cx.set((c.x / cw).clamp(0.0, 1.0));
                                        crop_cy.set((c.y / ch).clamp(0.0, 1.0));
                                        dragging.set(true);
                                    }
                                },
                                onmousemove: {
                                    let cw = cont_w;
                                    let ch = cont_h;
                                    move |evt: Event<MouseData>| {
                                        if *dragging.read() {
                                            let c = evt.element_coordinates();
                                            crop_cx.set((c.x / cw).clamp(0.0, 1.0));
                                            crop_cy.set((c.y / ch).clamp(0.0, 1.0));
                                        }
                                    }
                                },
                                onmouseup: move |_| dragging.set(false),
                                onmouseleave: move |_| dragging.set(false),
                                onwheel: move |evt: Event<WheelData>| {
                                    let dy = match evt.delta() {
                                        WheelDelta::Pixels(p) => p.y / 100.0,
                                        WheelDelta::Lines(l) => l.y,
                                        WheelDelta::Pages(p) => p.y * 3.0,
                                    };
                                    let cur = *crop_scale.read();
                                    crop_scale.set((cur - dy * 0.05).clamp(0.3, 1.0));
                                },

                                img {
                                    src: "{thumb_info.as_ref().unwrap().data_uri}",
                                    class: "preview-img",
                                    style: "{img_style}",
                                }

                                // Crop overlay: 4 shade bands + border
                                if let Some(g) = crop {
                                    // Shade bands
                                    div { class: "crop-shade", style: "left:0;top:0;width:100%;height:{g.top:.0}px;" }
                                    div { class: "crop-shade", style: "left:0;top:{g.top+g.height:.0}px;width:100%;bottom:0;" }
                                    div { class: "crop-shade", style: "left:0;top:{g.top:.0}px;width:{g.left:.0}px;height:{g.height:.0}px;" }
                                    div { class: "crop-shade", style: "left:{g.left+g.width:.0}px;top:{g.top:.0}px;right:0;height:{g.height:.0}px;" }
                                    // Crop border
                                    div { class: "crop-rect", style: "left:{g.left:.0}px;top:{g.top:.0}px;width:{g.width:.0}px;height:{g.height:.0}px;" }
                                    // Head top line (where top of head should be)
                                    div {
                                        class: "guide-line head-line",
                                        style: "left:{g.left:.0}px;top:{g.top + g.head_top_y:.0}px;width:{g.width:.0}px;",
                                    }
                                    // Chin line (where chin should be)
                                    div {
                                        class: "guide-line chin-line",
                                        style: "left:{g.left:.0}px;top:{g.top + g.chin_y:.0}px;width:{g.width:.0}px;",
                                    }
                                    // Eye line
                                    div {
                                        class: "guide-line eye-line",
                                        style: "left:{g.left:.0}px;top:{g.top + g.eye_y:.0}px;width:{g.width:.0}px;",
                                    }
                                    // Face oval (between head top and chin)
                                    {
                                        let oval_h = g.face_height;
                                        let oval_w = oval_h * 0.65;
                                        let oval_left = g.left + (g.width - oval_w) / 2.0;
                                        let oval_top = g.top + g.head_top_y;
                                        rsx! {
                                            div {
                                                class: "face-oval",
                                                style: "left:{oval_left:.0}px;top:{oval_top:.0}px;width:{oval_w:.0}px;height:{oval_h:.0}px;",
                                            }
                                        }
                                    }
                                }
                            }

                            div { class: "controls-row",
                                button { class: "ctrl-btn",
                                    onclick: move |_| {
                                        if let Some(ref p) = photo_for_ccw {
                                            status.set("Поворот...".to_string());
                                            if let Ok(img) = image::open(p) {
                                                let rotated = img.rotate270();
                                                let _ = rotated.save(p);
                                                // Clear rotation state, file is already rotated
                                                let mut rots = rotations.read().clone();
                                                rots.insert(p.clone(), 0);
                                                rotations.set(rots);
                                                // Refresh thumbnails
                                                current_thumb.set(make_thumbnail(p, 0));
                                                status.set("Готово".to_string());
                                            }
                                        }
                                    }, "CCW"
                                }
                                button { class: "ctrl-btn",
                                    onclick: move |_| {
                                        if let Some(ref p) = photo_for_cw {
                                            status.set("Поворот...".to_string());
                                            if let Ok(img) = image::open(p) {
                                                let rotated = img.rotate90();
                                                let _ = rotated.save(p);
                                                let mut rots = rotations.read().clone();
                                                rots.insert(p.clone(), 0);
                                                rotations.set(rots);
                                                current_thumb.set(make_thumbnail(p, 0));
                                                status.set("Готово".to_string());
                                            }
                                        }
                                    }, "CW"
                                }
                                span { class: "sep", "|" }
                                label { class: "scale-label", "Кроп:" }
                                input { r#type: "range", class: "scale-slider",
                                    min: "30", max: "100", value: "{(*crop_scale.read() * 100.0) as i32}",
                                    oninput: move |e: Event<FormData>| {
                                        if let Ok(v) = e.value().parse::<f64>() { crop_scale.set(v / 100.0); }
                                    },
                                }
                                span { class: "sep", "|" }
                                button { class: if !*use_png.read() { "ctrl-btn active" } else { "ctrl-btn" },
                                    onclick: move |_| use_png.set(false), "JPEG"
                                }
                                button { class: if *use_png.read() { "ctrl-btn active" } else { "ctrl-btn" },
                                    onclick: move |_| use_png.set(true), "PNG"
                                }
                                span { class: "sep", "|" }
                                // Apple Vision (macOS only, native Neural Engine)
                                #[cfg(target_os = "macos")]
                                button { class: "ctrl-btn vision-btn",
                                    onclick: move |_| {
                                        let idx = match *selected_photo.read() { Some(i) => i, None => return };
                                        let photo_path = match photos.read().get(idx).cloned() { Some(p) => p, None => return };
                                        let rotation = rotations.read().get(&photo_path).copied().unwrap_or(0);
                                        status.set("Vision: удаление фона...".into());

                                        // Rotate first if needed
                                        let input_path = if rotation != 0 {
                                            if let Ok(img) = image::open(&photo_path) {
                                                let rotated = match rotation {
                                                    90 => img.rotate90(), 180 => img.rotate180(),
                                                    270 => img.rotate270(), _ => img,
                                                };
                                                let tmp = std::env::temp_dir().join("visa_photo_tmp.png");
                                                let _ = rotated.save(&tmp);
                                                tmp
                                            } else { photo_path.clone() }
                                        } else { photo_path.clone() };

                                        let stem = photo_path.file_stem().unwrap().to_string_lossy();
                                        let out = photo_path.parent().unwrap().join(format!("{stem}_nobg.png"));
                                        let tool = project_dir().join("tools/rembg-vision");

                                        let result = std::process::Command::new(&tool)
                                            .arg(&input_path)
                                            .arg(&out)
                                            .arg("accurate")
                                            .output();

                                        match result {
                                            Ok(output) if output.status.success() => {
                                                let mut rots = rotations.read().clone();
                                                rots.insert(out.clone(), 0);
                                                rotations.set(rots);
                                                let mut cur = photos.read().clone();
                                                let new_idx = cur.len();
                                                cur.push(out.clone());
                                                photos.set(cur);
                                                selected_photo.set(Some(new_idx));
                                                current_thumb.set(make_thumbnail(&out, 0));
                                                let stderr = String::from_utf8_lossy(&output.stderr);
                                                status.set(format!("Готово! {}", stderr.lines().next().unwrap_or("")));
                                            }
                                            Ok(output) => {
                                                status.set(format!("Ошибка: {}", String::from_utf8_lossy(&output.stderr)));
                                            }
                                            Err(e) => {
                                                status.set(format!("Скомпилируйте: swiftc -O -o tools/rembg-vision tools/rembg-vision.swift -framework Vision -framework AppKit -framework CoreImage | {e}"));
                                            }
                                        }
                                    },
                                    "Vision"
                                }
                                // ONNX models
                                button { class: "ctrl-btn bg-btn",
                                    onclick: move |_| {
                                        #[cfg(feature = "rembg")]
                                        {
                                            let idx = match *selected_photo.read() { Some(i) => i, None => return };
                                            let photo_path = match photos.read().get(idx).cloned() { Some(p) => p, None => return };
                                            let rotation = rotations.read().get(&photo_path).copied().unwrap_or(0);
                                            let mid = active_model_id.read().clone();
                                            let models_list = available_models.read().clone();
                                            let info = match models_list.iter().find(|m| m.id == mid) {
                                                Some(i) => i.clone(),
                                                None => { status.set("Модель не найдена".into()); return; }
                                            };
                                            if !models::is_downloaded(&info) {
                                                status.set(format!("Сначала скачайте модель {}", info.name));
                                                return;
                                            }

                                            // Load model if different from current
                                            let need_load = {
                                                let lock = BG_REMOVER.get_or_init(|| StdMutex::new(None));
                                                let guard = lock.lock().unwrap();
                                                match &*guard {
                                                    Some((_, cur_id)) => *cur_id != mid,
                                                    None => true,
                                                }
                                            };
                                            if need_load {
                                                status.set(format!("Загрузка {}...", info.name));
                                                if let Err(e) = load_bg_model(&info) {
                                                    status.set(format!("Ошибка: {e}"));
                                                    return;
                                                }
                                            }

                                            status.set("Удаление фона...".into());
                                            let lock = BG_REMOVER.get().unwrap();
                                            let guard = lock.lock().unwrap();
                                            if let Some((ref remover, _)) = *guard {
                                                match image::open(&photo_path) {
                                                    Ok(mut img) => {
                                                        img = match rotation {
                                                            90 => img.rotate90(),
                                                            180 => img.rotate180(),
                                                            270 => img.rotate270(),
                                                            _ => img,
                                                        };
                                                        match remover.remove_bg(&img) {
                                                            Ok(result) => {
                                                                let stem = photo_path.file_stem().unwrap().to_string_lossy();
                                                                let out = photo_path.parent().unwrap()
                                                                    .join(format!("{stem}_nobg.png"));
                                                                if let Ok(()) = result.save(&out) {
                                                                    drop(guard);
                                                                    let mut rots = rotations.read().clone();
                                                                    rots.insert(out.clone(), 0);
                                                                    rotations.set(rots);
                                                                    let mut cur = photos.read().clone();
                                                                    let new_idx = cur.len();
                                                                    cur.push(out.clone());
                                                                    photos.set(cur);
                                                                    selected_photo.set(Some(new_idx));
                                                                    current_thumb.set(make_thumbnail(&out, 0));
                                                                    status.set("Фон удалён!".into());
                                                                }
                                                            }
                                                            Err(e) => status.set(format!("Ошибка: {e}")),
                                                        }
                                                    }
                                                    Err(e) => status.set(format!("Ошибка: {e}")),
                                                }
                                            }
                                        }
                                    },
                                    "Убрать фон"
                                }
                            }

                            div { class: "adjustments",
                                div { class: "slider-row",
                                    label { "Яркость" }
                                    input { r#type: "range", min: "-50", max: "50", value: "{brightness}",
                                        oninput: move |e: Event<FormData>| { if let Ok(v) = e.value().parse::<f32>() { brightness.set(v); } },
                                    }
                                    span { "{brightness:.0}" }
                                }
                                div { class: "slider-row",
                                    label { "Контраст" }
                                    input { r#type: "range", min: "-50", max: "50", value: "{contrast}",
                                        oninput: move |e: Event<FormData>| { if let Ok(v) = e.value().parse::<f32>() { contrast.set(v); } },
                                    }
                                    span { "{contrast:.0}" }
                                }
                                div { class: "slider-row",
                                    label { "Тени" }
                                    input { r#type: "range", min: "0", max: "80", value: "{shadows}",
                                        oninput: move |e: Event<FormData>| { if let Ok(v) = e.value().parse::<f32>() { shadows.set(v); } },
                                    }
                                    span { "{shadows:.0}" }
                                }
                                button { class: "reset-btn",
                                    onclick: move |_| { brightness.set(0.0); contrast.set(0.0); shadows.set(0.0); },
                                    "Сбросить"
                                }
                            }

                            div { class: "bottom-row",
                                input { r#type: "text", class: "name-field",
                                    placeholder: "Имя (Алина, Рустам...)",
                                    value: "{person_name}",
                                    oninput: move |e: Event<FormData>| person_name.set(e.value().clone()),
                                }
                                button { class: "process-btn",
                                    onclick: move |_| {
                                        let idx = match *selected_photo.read() { Some(i) => i, None => return };
                                        let photo_path = match photos.read().get(idx).cloned() { Some(p) => p, None => return };
                                        let name = person_name.read().trim().to_string();
                                        let key = selected_preset.read().clone();
                                        let rotation = rotations.read().get(&photo_path).copied().unwrap_or(0);
                                        let pr = presets.read();
                                        if let Some(preset) = pr.get(&key) {
                                            status.set("Обработка...".to_string());
                                            match image::open(&photo_path) {
                                                Ok(mut img) => {
                                                    img = match rotation {
                                                        90 => processing::rotate_cw(&img),
                                                        180 => img.rotate180(),
                                                        270 => processing::rotate_ccw(&img),
                                                        _ => img,
                                                    };
                                                    let adj = Adjustments {
                                                        brightness: *brightness.read(),
                                                        contrast: *contrast.read(),
                                                        shadows: *shadows.read(),
                                                    };
                                                    if adj.brightness != 0.0 || adj.contrast != 0.0 || adj.shadows != 0.0 {
                                                        img = processing::apply_adjustments(&img, &adj);
                                                    }
                                                    let processed = processing::crop_and_resize(&img, preset, *crop_cx.read(), *crop_cy.read(), *crop_scale.read());
                                                    let base_dir = project_dir().join("photos/processed");
                                                    let out_dir = if name.is_empty() { base_dir } else { base_dir.join(&name) };
                                                    let stem = if name.is_empty() {
                                                        photo_path.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or("photo".into())
                                                    } else { name.clone() };
                                                    match processing::save_processed(&processed, preset, &out_dir, &stem, &key, *use_png.read()) {
                                                        Ok(p) => {
                                                            let mut r = results.read().clone(); r.push(p.clone()); results.set(r);
                                                            status.set(format!("Сохранено: {p}"));
                                                        }
                                                        Err(e) => status.set(format!("Ошибка: {e}")),
                                                    }
                                                    let _ = processing::generate_print_layout(&processed, preset, &out_dir, &stem, &key);
                                                }
                                                Err(e) => status.set(format!("Ошибка: {e}")),
                                            }
                                        }
                                    },
                                    "Сохранить"
                                }
                            }
                        }
                    } else {
                        div { class: "placeholder", p { "Выберите фото слева" } }
                    }

                    if !results.read().is_empty() {
                        div { class: "results",
                            for r in results.read().iter() {
                                p { class: "result-item", "{r}" }
                            }
                            button { class: "open-btn",
                                onclick: move |_| { let _ = std::process::Command::new("open").arg(project_dir().join("photos/processed")).spawn(); },
                                "Открыть папку"
                            }
                        }
                    }
                }
            }
            div { class: "status-bar",
                "{status}"
                if let Some(g) = crop {
                    if let Some(ref pr) = current_preset {
                        span { class: "debug",
                            " | crop:{g.width:.0}x{g.height:.0} head:{g.head_top_y:.0}-{g.chin_y:.0}px ({pr.face_height_percent:.0}%) eye:{g.eye_y:.0}px top:{pr.face_top_margin_percent:.0}%"
                        }
                    }
                }
            }
        }
    }
}

const CSS: &str = r#"
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif; background: #1a1a2e; color: #eee; }
.app { display: flex; flex-direction: column; height: 100vh; }
.header { padding: 8px 20px; background: #16213e; border-bottom: 1px solid #333; }
.header h1 { font-size: 16px; font-weight: 600; }
.main-layout { display: flex; flex: 1; overflow: hidden; }

.sidebar { width: 240px; padding: 0 10px 10px; background: #0f3460; overflow-y: auto; border-right: 1px solid #333; }
.tabs { display: flex; margin: 0 -10px; border-bottom: 1px solid #333; }
.tab { flex: 1; padding: 8px; background: transparent; border: none; color: #888; cursor: pointer; font-size: 12px; border-bottom: 2px solid transparent; }
.tab:hover { color: #ccc; }
.tab.active { color: white; border-bottom-color: #e94560; }
.hint { font-size: 9px; color: #555; margin-bottom: 4px; }
.sidebar h3 { font-size: 10px; text-transform: uppercase; color: #666; margin: 10px 0 4px; }
.sidebar h3:first-child { margin-top: 0; }
.preset-btn { display: block; width: 100%; padding: 7px 8px; margin-bottom: 2px; background: #1a1a3e; border: 1px solid #333; border-radius: 4px; color: #ccc; text-align: left; cursor: pointer; font-size: 11px; }
.preset-btn:hover { background: #252550; }
.preset-btn.active { background: #e94560; color: white; border-color: #e94560; }
.preset-info { padding: 6px; background: #1a1a3e; border-radius: 4px; margin-top: 4px; font-size: 10px; line-height: 1.5; }
.preset-info .notes { color: #666; font-style: italic; }
.custom-size { display: flex; align-items: center; gap: 4px; margin-top: 4px; }
.custom-size label { font-size: 10px; color: #888; }
.size-input { width: 60px; padding: 4px 6px; background: #1a1a3e; border: 1px solid #444; border-radius: 3px; color: #eee; font-size: 11px; outline: none; text-align: center; }
.size-input:focus { border-color: #e94560; }
.size-hint { font-size: 9px; color: #666; }
.add-btn { width: 100%; padding: 6px; background: #533483; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 11px; margin-bottom: 4px; }
.model-list { display: flex; flex-direction: column; gap: 2px; }
.model-row { display: flex; align-items: center; gap: 4px; padding: 3px 4px; background: #1a1a3e; border-radius: 3px; font-size: 10px; border: 1px solid transparent; }
.model-row.active { border-color: #4caf50; background: #1a2e1a; }
.model-info { flex: 1; min-width: 0; }
.model-name { color: #ccc; font-weight: 500; }
.model-meta { color: #666; margin-left: 4px; }
.dl-btn { padding: 2px 8px; background: #533483; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 9px; white-space: nowrap; }
.dl-btn:hover { background: #6a42a0; }
.use-btn { padding: 2px 8px; background: #1a1a3e; border: 1px solid #444; border-radius: 3px; color: #aaa; cursor: pointer; font-size: 9px; white-space: nowrap; }
.use-btn:hover { border-color: #e94560; }
.active-mark { color: #4caf50; font-weight: bold; }
.dl-progress { color: #888; font-size: 9px; }
.photo-list { display: flex; flex-direction: column; gap: 1px; max-height: 400px; overflow-y: auto; }
.photo-item { display: block; width: 100%; padding: 5px 6px; background: transparent; border: 1px solid transparent; border-radius: 3px; color: #aaa; text-align: left; cursor: pointer; font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.photo-item:hover { background: #1a1a3e; }
.photo-item.active { background: #1a1a3e; color: white; border-color: #e94560; }

.workspace { flex: 1; padding: 10px; overflow-y: auto; }
.preview-area { display: flex; flex-direction: column; gap: 6px; }

.image-container {
    position: relative; border-radius: 4px; overflow: hidden;
    cursor: move; border: 2px solid #444; user-select: none;
    background: #222;
}
.preview-img { display: block; pointer-events: none; }

.crop-shade { position: absolute; background: rgba(0,0,50,0.5); pointer-events: none; }
.crop-rect { position: absolute; border: 2px dashed #e94560; pointer-events: none; }
.face-oval { position: absolute; border: 1.5px dashed rgba(80,180,255,0.5); border-radius: 50%; pointer-events: none; }
.guide-line { position: absolute; height: 0; pointer-events: none; }
.head-line { border-top: 1.5px dashed rgba(255,200,50,0.7); }
.chin-line { border-top: 1.5px dashed rgba(255,200,50,0.7); }
.eye-line { border-top: 1.5px dashed rgba(80,255,120,0.7); }
.debug { color: #555; }

.controls-row { display: flex; gap: 4px; align-items: center; }
.ctrl-btn { padding: 4px 12px; background: #1a1a3e; border: 1px solid #444; border-radius: 3px; color: #aaa; cursor: pointer; font-size: 11px; }
.ctrl-btn:hover { border-color: #e94560; }
.ctrl-btn.active { background: #e94560; color: white; border-color: #e94560; }
.scale-label { font-size: 10px; color: #888; }
.scale-slider { width: 80px; accent-color: #e94560; }
.vision-btn { background: #1565c0 !important; color: white !important; border-color: #1565c0 !important; }
.vision-btn:hover { background: #1976d2 !important; }
.bg-btn { background: #2d6a4f !important; color: white !important; border-color: #2d6a4f !important; }
.bg-btn:hover { background: #40916c !important; }
.sep { color: #333; font-size: 14px; margin: 0 4px; }

.adjustments { padding: 8px; background: #16213e; border-radius: 4px; }
.slider-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.slider-row label { width: 60px; font-size: 11px; color: #aaa; }
.slider-row input[type=range] { flex: 1; accent-color: #e94560; }
.slider-row span { width: 24px; text-align: right; font-size: 10px; color: #666; }
.reset-btn { padding: 2px 8px; background: transparent; border: 1px solid #444; border-radius: 3px; color: #888; cursor: pointer; font-size: 10px; }

.bottom-row { display: flex; gap: 6px; align-items: center; }
.name-field { flex: 1; padding: 7px 10px; background: #1a1a3e; border: 1px solid #333; border-radius: 4px; color: #eee; font-size: 12px; outline: none; }
.name-field:focus { border-color: #e94560; }
.process-btn { padding: 7px 18px; background: #e94560; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px; font-weight: 600; }
.process-btn:hover { background: #d63851; }

.config-editor { display: flex; flex-direction: column; height: calc(100vh - 80px); }
.editor-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.editor-header h3 { font-size: 14px; color: #ccc; }
.editor-actions { display: flex; gap: 6px; }
.save-btn { padding: 4px 14px; background: #4caf50; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 11px; font-weight: 600; }
.save-btn:hover { background: #66bb6a; }
.close-btn { padding: 4px 10px; background: #444; border: none; border-radius: 3px; color: #ccc; cursor: pointer; font-size: 11px; }
.close-btn:hover { background: #666; }
.config-textarea { flex: 1; background: #0a0a1a; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; padding: 10px; font-family: 'SF Mono', 'Menlo', monospace; font-size: 12px; line-height: 1.5; resize: none; outline: none; tab-size: 4; }
.config-textarea:focus { border-color: #e94560; }
.cfg-btn { width: 100%; padding: 6px 8px; background: #1a1a3e; border: 1px solid #333; border-radius: 3px; color: #aaa; cursor: pointer; font-size: 11px; text-align: left; margin-bottom: 2px; }
.cfg-btn:hover { background: #252550; border-color: #e94560; }
.placeholder { display: flex; align-items: center; justify-content: center; height: 300px; color: #555; }
.results { margin-top: 8px; padding: 8px; background: #16213e; border-radius: 4px; }
.result-item { font-size: 10px; color: #aaa; padding: 2px 0; word-break: break-all; }
.open-btn { margin-top: 4px; padding: 4px 10px; background: #533483; border: none; border-radius: 3px; color: white; cursor: pointer; font-size: 10px; }
.status-bar { padding: 4px 20px; background: #16213e; border-top: 1px solid #333; font-size: 10px; color: #666; }
"#;
