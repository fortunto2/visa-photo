# Visa Photo

**Free, offline, AI-powered tool for biometric visa & passport photos.**

Crop to exact country specs, remove background with Apple Vision AI (0.2s), add face guides per ICAO standards. No cloud, no subscription, no watermarks. Your photos never leave your machine.

<p align="center">
  <img src="docs/demo.png" alt="Visa Photo app" width="600">
</p>

## Highlights

- **AI Background Removal** — Apple Vision Neural Engine (macOS) or ONNX models (cross-platform)
- **Country Presets** — Turkey, USA Green Card, Schengen, custom sizes
- **ICAO Face Guides** — head, chin, eye lines + face oval overlay
- **Print Layout** — A4 sheet with N copies at 300 DPI, ready for print shop
- **Fully Offline** — no internet needed after install

## Install

### macOS (Homebrew)

```bash
brew install fortunto2/tap/visa-photo
```

### macOS / Linux / Windows (Download)

Download from [Releases](https://github.com/fortunto2/visa-photo/releases/latest):

| Platform | File |
|----------|------|
| macOS Apple Silicon (M1/M2/M3) | `visa-photo-macos-arm64.tar.gz` |
| macOS Intel | `visa-photo-macos-x64.tar.gz` |
| Linux x64 | `visa-photo-linux-x64.tar.gz` |
| Windows x64 | `visa-photo-windows-x64.zip` |

```bash
# macOS/Linux: extract and run
tar xzf visa-photo-*.tar.gz
./visa-photo
```

### Build from source

```bash
git clone https://github.com/fortunto2/visa-photo.git
cd visa-photo
cargo build --release

# macOS: compile Vision AI tool (optional, for background removal)
swiftc -O -o tools/rembg-vision tools/rembg-vision.swift \
  -framework Vision -framework AppKit -framework CoreImage
```

## Usage

1. Add photos (drag to `photos/originals/` or click "+ Add")
2. Pick a country preset
3. Click a photo — drag crop frame, align face with guides
4. Zoom crop with scroll wheel or slider
5. Click **"Remove bg"** for white background
6. Enter name, click **"Save"**

Output: `photos/processed/{name}/`

## Background Removal

| Engine | Size | Speed | Quality | Platform |
|--------|------|-------|---------|----------|
| Apple Vision | built-in | 0.2s | Best | macOS 13+ |
| Silueta | 43 MB | <1s | OK | all |
| U2Net Human | 176 MB | 2-4s | Good | all |

Select engine in **Settings** tab. ONNX models download on demand from the app.

## Presets

Edit `presets.toml` to add countries (or use the built-in editor):

| Preset | Digital | Print | Face height |
|--------|---------|-------|-------------|
| Turkey (ikamet) | 600x720 | 50x60mm | 56.7% |
| USA (Green Card) | 600x600 | 51x51mm | 50-69% |
| Schengen | 413x531 | 35x45mm | 71-80% |
| Custom | any | any | configurable |

## Tech Stack

Rust + [Dioxus](https://dioxuslabs.com) desktop (webview) + [image](https://crates.io/crates/image) + [ort](https://crates.io/crates/ort) (ONNX Runtime) + Apple Vision framework

## License

MIT
