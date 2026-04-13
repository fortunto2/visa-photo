# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
cargo build                    # debug build
cargo run                      # launch desktop app
cargo build --release          # release build
cargo clippy -- -D warnings    # lint

# macOS: compile Vision bg removal tool
swiftc -O -o tools/rembg-vision tools/rembg-vision.swift \
  -framework Vision -framework AppKit -framework CoreImage

# Download ONNX models (optional)
bash models/download.sh
```

No test suite yet.

## Architecture

Dioxus 0.6 desktop app (webview-based) for cropping/resizing photos to biometric visa specs.

### Modules

- **`src/main.rs`** — Dioxus UI with tabbed sidebar (Photos/Settings), workspace (crop preview with guides), controls. All state is signals. Thumbnails as base64 data URIs (800px JPEG). Sidebar tabs: photo list + presets | model manager + config editor.
- **`src/preset.rs`** — `Preset` struct from TOML. Fields: digital/print dimensions, face height %, top margin %, eye line %.
- **`src/processing.rs`** — `crop_and_resize` (with scale), `apply_adjustments` (brightness/contrast/shadows), `rotate_cw/ccw`, `encode_jpeg` (auto quality), `save_processed`, `generate_print_layout` (A4 300dpi).
- **`src/background.rs`** — ONNX background removal via `ort` crate. Supports multiple models (320px and 1024px input). Behind `rembg` feature flag.
- **`src/models.rs`** — Model registry loaded from `models.toml`. Download via curl, model path management.
- **`tools/rembg-vision.swift`** — Swift CLI for Apple Vision person segmentation. Compiled binary at `tools/rembg-vision`.
- **`presets.toml`** — Country presets, editable from app UI. Loaded at runtime (not embedded).
- **`models.toml`** — ONNX model registry, editable from app UI.

### Key Design Decisions

- **Thumbnails as base64** — Dioxus webview blocks `file://`. JPEG thumbnail encoded in memory as `data:image/jpeg;base64,...`.
- **Rotation saves to file** — CW/CCW immediately overwrite the original PNG. No rotation state needed.
- **Crop overlay** — Container sized to image (no letterbox). Crop rect + shade bands + face guides computed from preset percentages.
- **Face guides** — Head top/chin lines (yellow), eye line (green), face oval (blue). Positions from ICAO/country standards in presets.toml.
- **Dual bg removal** — Apple Vision (macOS, 0.2s via Neural Engine, best quality) + ONNX models (cross-platform fallback). Selected in Settings tab.
- **Config files** — `presets.toml` and `models.toml` loaded from disk, editable in built-in editor, reload without restart.
- **HEIC conversion** — macOS `sips` command on import.

### Output Structure

```
photos/processed/{person_name}/
  {name}_{preset}_{timestamp}.jpg   # or .png
  {name}_{preset}_A4_{timestamp}.png  # print layout
```
