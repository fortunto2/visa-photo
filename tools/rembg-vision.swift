#!/usr/bin/env swift
/// Remove background using Apple Vision VNGeneratePersonSegmentationRequest.
/// Neural Engine — no model download needed, works on macOS 13+.
/// Usage: swift rembg-vision.swift input.png output.png [quality]
///   quality: fast (default), balanced, accurate

import Foundation
import CoreImage
import CoreGraphics
import Vision
import AppKit

guard CommandLine.arguments.count >= 3 else {
    fputs("Usage: rembg-vision <input> <output> [fast|balanced|accurate]\n", stderr)
    exit(1)
}

let inputPath = CommandLine.arguments[1]
let outputPath = CommandLine.arguments[2]
let qualityStr = CommandLine.arguments.count > 3 ? CommandLine.arguments[3] : "accurate"

// Load image
guard let inputImage = NSImage(contentsOfFile: inputPath),
      let tiffData = inputImage.tiffRepresentation,
      let ciImage = CIImage(data: tiffData) else {
    fputs("Error: Cannot load image \(inputPath)\n", stderr)
    exit(1)
}

let cgImage = CIContext().createCGImage(ciImage, from: ciImage.extent)!

// Create segmentation request
let request = VNGeneratePersonSegmentationRequest()
switch qualityStr {
case "fast": request.qualityLevel = .fast
case "balanced": request.qualityLevel = .balanced
default: request.qualityLevel = .accurate
}

// Run
let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
let t0 = CFAbsoluteTimeGetCurrent()
try handler.perform([request])
let elapsed = CFAbsoluteTimeGetCurrent() - t0

guard let result = request.results?.first,
      let maskBuffer = result.pixelBuffer as CVPixelBuffer? else {
    fputs("Error: No segmentation result\n", stderr)
    exit(1)
}

fputs("[vision] Segmentation done in \(String(format: "%.2f", elapsed))s (\(qualityStr))\n", stderr)

// Convert mask to CIImage and resize to match input
let maskCI = CIImage(cvPixelBuffer: maskBuffer)
let scaleX = ciImage.extent.width / maskCI.extent.width
let scaleY = ciImage.extent.height / maskCI.extent.height
let scaledMask = maskCI.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

// Composite: foreground over white background
let white = CIImage(color: CIColor.white).cropped(to: ciImage.extent)
let blended = ciImage.applyingFilter("CIBlendWithMask", parameters: [
    kCIInputBackgroundImageKey: white,
    kCIInputMaskImageKey: scaledMask
])

// Save as PNG
let context = CIContext()
guard let cgOutput = context.createCGImage(blended, from: blended.extent) else {
    fputs("Error: Failed to render output\n", stderr)
    exit(1)
}

let url = URL(fileURLWithPath: outputPath)
guard let dest = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil) else {
    fputs("Error: Cannot create output file\n", stderr)
    exit(1)
}
CGImageDestinationAddImage(dest, cgOutput, nil)
CGImageDestinationFinalize(dest)

fputs("[vision] Saved: \(outputPath)\n", stderr)
