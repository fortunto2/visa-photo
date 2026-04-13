# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
cargo build          # build debug
cargo run            # launch desktop app
cargo build --release  # release build
```

No test suite yet. Lint with `cargo clippy -- -D warnings`.

## Architecture

Dioxus 0.6 desktop app (webview-based) for cropping/resizing photos to biometric visa specs.

### Modules

- **`src/main.rs`** — Dioxus UI: sidebar (presets, photo list), workspace (image preview with crop overlay, guides, adjustments), controls. All state is signals. Images displayed as base64 data URIs (thumbnails generated at 800px). Rotation baked into thumbnail, not CSS transform.
- **`src/preset.rs`** — `Preset` struct deserialized from TOML. Fields: digital/print dimensions, face height %, top margin %, eye line position %.
- **`src/processing.rs`** — Image manipulation: `crop_and_resize` (with scale parameter), `apply_adjustments` (brightness/contrast/shadows pixel-level), `rotate_cw/ccw`, `encode_jpeg` (auto quality reduction to fit size limit), `save_processed`, `generate_print_layout` (A4 300dpi).
- **`presets.toml`** — Country presets (turkey, usa_greencard, eu_schengen, custom). Embedded via `include_str!`.

### Key Design Decisions

- **Thumbnails as base64 data URIs** — Dioxus desktop webview blocks `file://` URLs. Thumbnails are JPEG-encoded in memory and embedded as `data:image/jpeg;base64,...`.
- **Rotation is non-destructive** — Stored as `HashMap<PathBuf, u32>` (degrees). Applied to thumbnail on change, applied to full image only at export.
- **Crop scale** — `crop_scale` signal (0.3–1.0) controls crop rect size. Both UI overlay and `processing::crop_and_resize` use the same scale value.
- **Face guides** — Computed from preset percentages (face_height, face_top_margin, eye_line_from_bottom). Rendered as absolute-positioned divs inside the image container.
- **Container sizing** — Container matches image aspect ratio (no letterbox). Computed by `container_for_image()`.
- **HEIC conversion** — Uses macOS `sips` command, converts to PNG on import.

### Output Structure

```
photos/processed/{person_name}/
  {name}_{preset}_{timestamp}.jpg   # or .png
  {name}_{preset}_A4_{timestamp}.png  # print layout
```
