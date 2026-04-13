# Visa Photo

Desktop app for preparing biometric visa/passport photos. Built with Rust + Dioxus.

## Features

- **Country presets**: Turkey (ikamet), USA (Green Card), Schengen, custom sizes
- **Crop & scale**: drag to position, scroll wheel or slider to zoom
- **Face guides**: head/chin/eye lines and face oval per ICAO standards
- **Rotation**: 90° CW/CCW, applied non-destructively
- **Adjustments**: brightness, contrast, shadow lift with live preview
- **Export**: JPEG (with size limit) or PNG (lossless)
- **Print layout**: A4 sheet with N copies at 300 DPI
- **HEIC import**: auto-converts via `sips` (macOS)

## Usage

```bash
cargo run
```

1. Drop photos into `photos/originals/` or click "+ Add"
2. Select a country preset
3. Click a photo, drag the crop frame, align face with guides
4. Enter a name, click "Save"

Output goes to `photos/processed/{name}/`.

## Presets (presets.toml)

| Preset | Digital size | Print size | Face height |
|--------|-------------|------------|-------------|
| Turkey | 600×720 | 50×60mm | 56.7% |
| USA | 600×600 | 51×51mm | 50-69% |
| Schengen | 413×531 | 35×45mm | 71-80% |

Edit `presets.toml` to add more countries.

## Requirements

- Rust 1.75+
- macOS (uses `sips` for HEIC conversion, `open` for Finder)

## License

MIT
