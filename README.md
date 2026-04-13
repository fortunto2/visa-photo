# Visa Photo

Desktop app for preparing biometric visa/passport photos. Built with Rust + Dioxus.

## Features

- **Country presets**: Turkey (ikamet), USA (Green Card), Schengen, custom sizes
- **Crop & scale**: drag to position, scroll wheel or slider to zoom
- **Face guides**: head/chin/eye lines and face oval per ICAO standards
- **Background removal**: Apple Vision (macOS, 0.2s) or ONNX models (cross-platform)
- **Rotation**: 90 CW/CCW, saves to file immediately
- **Adjustments**: brightness, contrast, shadow lift with live CSS preview
- **Export**: JPEG (with size limit) or PNG (lossless)
- **Print layout**: A4 sheet with N copies at 300 DPI
- **HEIC import**: auto-converts via `sips` (macOS)
- **Config editor**: edit `presets.toml` and `models.toml` from the app
- **Model manager**: download/select ONNX models from UI

## Install

### macOS (recommended)

```bash
# Build
cargo build --release

# Compile Vision tool (background removal via Neural Engine)
swiftc -O -o tools/rembg-vision tools/rembg-vision.swift \
  -framework Vision -framework AppKit -framework CoreImage

# Download ONNX models (optional, Vision is better on macOS)
bash models/download.sh

# Run
cargo run --release
```

### Linux / Windows

```bash
# Build (no Apple Vision, ONNX models only)
cargo build --release

# Download at least one ONNX model
bash models/download.sh

# Select model in Settings tab, then run
cargo run --release
```

## Usage

1. Drop photos into `photos/originals/` or click "+ Add"
2. Select a country preset
3. Click a photo, drag the crop frame, align face with guides
4. Adjust crop scale with scroll wheel or slider
5. Click "Remove bg" if needed (Apple Vision or ONNX)
6. Enter a name, click "Save"

Output: `photos/processed/{name}/`

## Presets

Edit `presets.toml` to add countries. Built-in:

| Preset | Size | Print | Face |
|--------|------|-------|------|
| Turkey | 600x720 | 50x60mm | 56.7% |
| USA | 600x600 | 51x51mm | 50-69% |
| Schengen | 413x531 | 35x45mm | 71-80% |

## Background Removal Models

Edit `models.toml` to add models. Built-in options:

| Engine | Size | Speed | Quality |
|--------|------|-------|---------|
| Apple Vision | 0 | 0.2s | Best (macOS only) |
| Silueta | 43MB | <1s | OK |
| U2Net Human | 176MB | 2-4s | Good |

## Requirements

- Rust 1.75+
- macOS 13+ for Apple Vision background removal
- macOS `sips` for HEIC conversion

## License

MIT
