import { useState, useRef, useCallback } from "preact/hooks";
import { PRESETS, PRESET_KEYS, type Preset } from "../lib/presets";
import { containerForImage, calcGuides, type CropGuides } from "../lib/crop";
import { cropAndExport, generatePrintLayout } from "../lib/process";
import { removeBackground } from "../lib/background";

interface Photo {
  file: File;
  url: string;
  name: string;
}

export default function App() {
  const [preset, setPreset] = useState<string>("turkey");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [cropCx, setCropCx] = useState(0.5);
  const [cropCy, setCropCy] = useState(0.4);
  const [cropScale, setCropScale] = useState(1.0);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [usePng, setUsePng] = useState(false);
  const [personName, setPersonName] = useState("");
  const [status, setStatus] = useState("Ready");
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pr = PRESETS[preset];
  const currentPhoto = selected !== null ? photos[selected] : null;

  // Container size
  const img = imgRef.current;
  const [contW, contH] = img
    ? containerForImage(img.naturalWidth, img.naturalHeight)
    : [500, 620];

  const guides: CropGuides | null = pr
    ? calcGuides(cropCx, cropCy, pr, contW, contH, cropScale)
    : null;

  const brVal = 1 + brightness / 100;
  const ctVal = 1 + contrast / 100;
  const shVal = (shadows / 100) * 0.3;
  const filterStyle = `brightness(${(brVal + shVal).toFixed(2)}) contrast(${ctVal.toFixed(2)})`;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = [...photos];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      newPhotos.push({ file: f, url: URL.createObjectURL(f), name: f.name });
    }
    setPhotos(newPhotos);
    if (selected === null && newPhotos.length > 0) {
      setSelected(0);
      setCropCx(0.5);
      setCropCy(0.4);
    }
  };

  const updateCropPos = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCropCx(Math.max(0, Math.min(1, (e.clientX - rect.left) / contW)));
      setCropCy(Math.max(0, Math.min(1, (e.clientY - rect.top) / contH)));
    },
    [contW, contH],
  );

  const handleSave = async () => {
    if (!currentPhoto || !imgRef.current) return;
    setStatus("Processing...");
    try {
      const blob = await cropAndExport(
        imgRef.current, pr, cropCx, cropCy, cropScale,
        brightness, contrast, shadows, usePng,
      );
      const ext = usePng ? "png" : "jpg";
      const stem = personName.trim() || currentPhoto.name.replace(/\.[^.]+$/, "");
      download(blob, `${stem}_${preset}.${ext}`);

      // Print layout
      const printBlob = await generatePrintLayout(imgRef.current, pr, blob);
      download(printBlob, `${stem}_${preset}_A4.png`);

      setStatus(`Saved! ${(blob.size / 1024).toFixed(0)}KB`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const handleRemoveBg = async () => {
    if (!currentPhoto || !imgRef.current) return;
    try {
      const blob = await removeBackground(imgRef.current, setStatus);
      const url = URL.createObjectURL(blob);
      const newPhoto: Photo = {
        file: new File([blob], currentPhoto.name.replace(/\.[^.]+$/, "_nobg.png")),
        url,
        name: currentPhoto.name.replace(/\.[^.]+$/, "_nobg.png"),
      };
      const newPhotos = [...photos, newPhoto];
      setPhotos(newPhotos);
      setSelected(newPhotos.length - 1);
      setStatus("BG removed!");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div class="flex flex-col h-screen bg-[#1a1a2e] text-gray-200">
      {/* Header */}
      <div class="px-5 py-2 bg-[#16213e] border-b border-gray-700">
        <h1 class="text-lg font-semibold">Visa Photo</h1>
        <p class="text-xs text-gray-500">Free, offline, AI-powered biometric photo tool</p>
      </div>

      <div class="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div class="w-60 p-3 bg-[#0f3460] border-r border-gray-700 overflow-y-auto flex-shrink-0">
          <h3 class="text-[10px] uppercase text-gray-500 mb-1 tracking-wider">Country</h3>
          {PRESET_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setPreset(k)}
              class={`block w-full text-left px-2 py-1.5 mb-0.5 rounded text-xs ${preset === k ? "bg-[#e94560] text-white" : "bg-[#1a1a3e] text-gray-400 hover:bg-[#252550]"}`}
            >
              {PRESETS[k].name}
            </button>
          ))}
          <div class="mt-1 p-2 bg-[#1a1a3e] rounded text-[10px] text-gray-400 leading-relaxed">
            {pr.digital_width}x{pr.digital_height}px | {pr.print_width_mm}x{pr.print_height_mm}mm
            <br />
            <span class="text-gray-600 italic">{pr.notes}</span>
          </div>

          <h3 class="text-[10px] uppercase text-gray-500 mt-3 mb-1 tracking-wider">Photos</h3>
          <label class="block w-full text-center py-1.5 bg-[#533483] rounded text-xs text-white cursor-pointer hover:bg-[#6a42a0] mb-1">
            + Add
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              onChange={(e) => handleFiles((e.target as HTMLInputElement).files)}
            />
          </label>
          <div class="flex flex-col gap-px">
            {photos
              .filter((p) => !p.name.includes("_nobg"))
              .map((p, i) => {
                const realIdx = photos.indexOf(p);
                return (
                  <button
                    key={p.url}
                    onClick={() => { setSelected(realIdx); setCropCx(0.5); setCropCy(0.4); }}
                    class={`text-left px-2 py-1 rounded text-[10px] truncate ${selected === realIdx ? "bg-[#1a1a3e] text-white border border-[#e94560]" : "text-gray-500 hover:bg-[#1a1a3e]"}`}
                  >
                    {p.name}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Workspace */}
        <div class="flex-1 p-4 overflow-y-auto">
          {currentPhoto ? (
            <div class="flex flex-col gap-2">
              {/* Image container */}
              <div
                ref={containerRef}
                class="relative rounded overflow-hidden cursor-move border-2 border-gray-600 select-none bg-[#222]"
                style={{ width: contW, height: contH }}
                onMouseDown={(e) => { updateCropPos(e); setDragging(true); }}
                onMouseMove={(e) => dragging && updateCropPos(e)}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
                onWheel={(e) => {
                  e.preventDefault();
                  const dy = e.deltaY / 100;
                  setCropScale((s) => Math.max(0.3, Math.min(1, s - dy * 0.05)));
                }}
              >
                <img
                  ref={imgRef}
                  src={currentPhoto.url}
                  class="w-full h-full object-contain pointer-events-none"
                  style={{ filter: filterStyle }}
                  onLoad={() => setCropScale((s) => s)} // trigger re-render
                />

                {/* Crop overlay */}
                {guides && (
                  <>
                    <div class="absolute bg-[rgba(0,0,50,0.5)] pointer-events-none" style={{ left: 0, top: 0, width: "100%", height: guides.top }} />
                    <div class="absolute bg-[rgba(0,0,50,0.5)] pointer-events-none" style={{ left: 0, top: guides.top + guides.height, width: "100%", bottom: 0 }} />
                    <div class="absolute bg-[rgba(0,0,50,0.5)] pointer-events-none" style={{ left: 0, top: guides.top, width: guides.left, height: guides.height }} />
                    <div class="absolute bg-[rgba(0,0,50,0.5)] pointer-events-none" style={{ left: guides.left + guides.width, top: guides.top, right: 0, height: guides.height }} />
                    <div class="absolute border-2 border-dashed border-[#e94560] pointer-events-none" style={{ left: guides.left, top: guides.top, width: guides.width, height: guides.height }} />

                    {/* Head/chin lines */}
                    <div class="absolute border-t border-dashed border-[rgba(255,200,50,0.7)] pointer-events-none" style={{ left: guides.left, top: guides.top + guides.headTopY, width: guides.width }} />
                    <div class="absolute border-t border-dashed border-[rgba(255,200,50,0.7)] pointer-events-none" style={{ left: guides.left, top: guides.top + guides.chinY, width: guides.width }} />
                    {/* Eye line */}
                    <div class="absolute border-t border-dashed border-[rgba(80,255,120,0.7)] pointer-events-none" style={{ left: guides.left, top: guides.top + guides.eyeY, width: guides.width }} />
                    {/* Face oval */}
                    {(() => {
                      const ovalH = guides.faceHeight;
                      const ovalW = ovalH * 0.65;
                      return (
                        <div
                          class="absolute border border-dashed border-[rgba(80,180,255,0.5)] rounded-full pointer-events-none"
                          style={{
                            left: guides.left + (guides.width - ovalW) / 2,
                            top: guides.top + guides.headTopY,
                            width: ovalW,
                            height: ovalH,
                          }}
                        />
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Controls */}
              <div class="flex items-center gap-1 flex-wrap">
                <button onClick={() => setCropScale((s) => Math.max(0.3, s - 0.1))} class="px-3 py-1 bg-[#1a1a3e] border border-gray-600 rounded text-xs text-gray-400 hover:border-[#e94560]">-</button>
                <input type="range" min="30" max="100" value={cropScale * 100} class="w-20 accent-[#e94560]"
                  onInput={(e) => setCropScale(Number((e.target as HTMLInputElement).value) / 100)} />
                <button onClick={() => setCropScale((s) => Math.min(1, s + 0.1))} class="px-3 py-1 bg-[#1a1a3e] border border-gray-600 rounded text-xs text-gray-400 hover:border-[#e94560]">+</button>

                <span class="text-gray-700 mx-1">|</span>
                <button onClick={() => setUsePng(false)} class={`px-3 py-1 rounded text-xs ${!usePng ? "bg-[#e94560] text-white" : "bg-[#1a1a3e] text-gray-500 border border-gray-600"}`}>JPEG</button>
                <button onClick={() => setUsePng(true)} class={`px-3 py-1 rounded text-xs ${usePng ? "bg-[#e94560] text-white" : "bg-[#1a1a3e] text-gray-500 border border-gray-600"}`}>PNG</button>

                <span class="text-gray-700 mx-1">|</span>
                <button onClick={handleRemoveBg} class="px-3 py-1 bg-[#2d6a4f] text-white rounded text-xs hover:bg-[#40916c]">Remove BG</button>
              </div>

              {/* Adjustments */}
              <div class="p-2 bg-[#16213e] rounded text-xs">
                {[
                  { label: "Brightness", value: brightness, set: setBrightness, min: -50, max: 50 },
                  { label: "Contrast", value: contrast, set: setContrast, min: -50, max: 50 },
                  { label: "Shadows", value: shadows, set: setShadows, min: 0, max: 80 },
                ].map((s) => (
                  <div key={s.label} class="flex items-center gap-2 mb-1">
                    <label class="w-16 text-gray-500">{s.label}</label>
                    <input type="range" min={s.min} max={s.max} value={s.value} class="flex-1 accent-[#e94560]"
                      onInput={(e) => s.set(Number((e.target as HTMLInputElement).value))} />
                    <span class="w-6 text-right text-gray-600">{s.value}</span>
                  </div>
                ))}
                <button onClick={() => { setBrightness(0); setContrast(0); setShadows(0); }}
                  class="px-2 py-0.5 border border-gray-600 rounded text-gray-500 text-[10px] hover:border-[#e94560]">Reset</button>
              </div>

              {/* Save */}
              <div class="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Name (e.g. John)"
                  value={personName}
                  onInput={(e) => setPersonName((e.target as HTMLInputElement).value)}
                  class="flex-1 px-3 py-2 bg-[#1a1a3e] border border-gray-700 rounded text-sm text-gray-200 outline-none focus:border-[#e94560]"
                />
                <button onClick={handleSave} class="px-5 py-2 bg-[#e94560] text-white rounded text-sm font-semibold hover:bg-[#d63851]">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div class="flex items-center justify-center h-80 text-gray-600">
              Add photos and select one to start
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div class="px-5 py-1 bg-[#16213e] border-t border-gray-700 text-[10px] text-gray-600">
        {status}
      </div>
    </div>
  );
}

function download(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
