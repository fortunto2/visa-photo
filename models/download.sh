#!/bin/bash
# Download ONNX models for background removal
set -e
cd "$(dirname "$0")"

download() {
    local name=$1 url=$2
    if [ -f "$name" ]; then
        echo "$name already exists ($(du -h $name | cut -f1))"
    else
        echo "Downloading $name..."
        curl -L -o "$name" "$url"
        echo "Done: $(du -h $name | cut -f1)"
    fi
}

# Fast model (~4.7MB) — good for quick preview
download "u2netp.onnx" \
    "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx"

# Human segmentation (~176MB) — best for portraits
download "u2net_human_seg.onnx" \
    "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx"

# High quality model (~43MB) — general purpose
download "silueta.onnx" \
    "https://github.com/danielgatis/rembg/releases/download/v0.0.0/silueta.onnx"
