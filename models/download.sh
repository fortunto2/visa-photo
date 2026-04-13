#!/bin/bash
# Download u2netp ONNX model for background removal (~4.7MB)
set -e
cd "$(dirname "$0")"

MODEL="u2netp.onnx"
URL="https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx"

if [ -f "$MODEL" ]; then
    echo "$MODEL already exists"
else
    echo "Downloading $MODEL..."
    curl -L -o "$MODEL" "$URL"
    echo "Done: $(du -h $MODEL)"
fi
