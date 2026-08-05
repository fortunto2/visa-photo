import { useState, useRef, useMemo } from "preact/hooks";
import { jsPDF } from "jspdf";
import { PRESETS, PRESET_KEYS } from "../lib/presets";

interface Photo {
  file: File;
  url: string;
  name: string;
}

const PAPER_SIZES: Record<string, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: "A4 (210×297mm)" },
  letter: { w: 216, h: 279, label: "Letter (216×279mm)" },
  a3: { w: 297, h: 420, label: "A3 (297×420mm)" },
  "10x15": { w: 102, h: 152, label: "10×15cm" },
};

// Build photo size options from presets, group by unique print dimensions
function buildPhotoSizes() {
  const sizeMap = new Map<string, { w: number; h: number; names: string[] }>();
  for (const key of PRESET_KEYS) {
    if (key === "custom") continue;
    const p = PRESETS[key];
    const sizeKey = `${p.print_width_mm}x${p.print_height_mm}`;
    const existing = sizeMap.get(sizeKey);
    if (existing) {
      existing.names.push(p.name);
    } else {
      sizeMap.set(sizeKey, { w: p.print_width_mm, h: p.print_height_mm, names: [p.name] });
    }
  }
  const result: Record<string, { w: number; h: number; label: string; countries: string }> = {};
  for (const [key, val] of sizeMap) {
    const short = val.names.length > 2
      ? `${val.names[0]} +${val.names.length - 1}`
      : val.names.join(", ");
    result[key] = { w: val.w, h: val.h, label: `${val.w}×${val.h}mm (${short})`, countries: val.names.join(", ") };
  }
  result["custom"] = { w: 35, h: 45, label: "Custom", countries: "" };
  return result;
}

const PHOTO_SIZES = buildPhotoSizes();
const PHOTO_SIZE_KEYS = Object.keys(PHOTO_SIZES);

export default function PrintLayout() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [paper, setPaper] = useState("a4");
  const [photoSize, setPhotoSize] = useState(PHOTO_SIZE_KEYS[0]);
  const [customW, setCustomW] = useState("35");
  const [customH, setCustomH] = useState("45");
  const [gapMm, setGapMm] = useState(0);
  const [status, setStatus] = useState("Drop photos or click to add");
  const [generating, setGenerating] = useState(false);
  const [printMode, setPrintMode] = useState<"none" | "inkjet" | "photo" | "gradient">("none");
  const dropRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paperDef = PAPER_SIZES[paper];
  // The custom branch used to omit label/countries, so the union had no such properties and
  // reading them below did not typecheck once `astro check` was turned on.
  const photoDef = photoSize === "custom"
    ? {
        w: Math.max(10, parseInt(customW) || 35),
        h: Math.max(10, parseInt(customH) || 45),
        label: "Custom",
        countries: "",
      }
    : PHOTO_SIZES[photoSize];

  // Compute grid
  const grid = useMemo(() => {
    const margin = 3; // mm edge margin
    const usableW = paperDef.w - margin * 2;
    const usableH = paperDef.h - margin * 2;
    const cols = Math.floor((usableW + gapMm) / (photoDef.w + gapMm));
    const rows = Math.floor((usableH + gapMm) / (photoDef.h + gapMm));
    const totalW = cols * photoDef.w + (cols - 1) * gapMm;
    const totalH = rows * photoDef.h + (rows - 1) * gapMm;
    const offsetX = margin + (usableW - totalW) / 2;
    const offsetY = margin + (usableH - totalH) / 2;
    return { cols, rows, total: cols * rows, offsetX, offsetY };
  }, [paperDef, photoDef, gapMm]);

  // Preview scale: fit paper preview into ~500px
  const previewScale = Math.min(500 / paperDef.w, 700 / paperDef.h);
  const pvW = paperDef.w * previewScale;
  const pvH = paperDef.h * previewScale;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = [...photos];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      newPhotos.push({ file: f, url: URL.createObjectURL(f), name: f.name });
    }
    setPhotos(newPhotos);
    setStatus(`${newPhotos.length} photo(s) loaded`);
  };

  const removePhoto = (idx: number) => {
    const np = photos.filter((_, i) => i !== idx);
    setPhotos(np);
    setStatus(`${np.length} photo(s) loaded`);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer?.files ?? null);
  };

  const generatePdf = async () => {
    if (photos.length === 0) { setStatus("Add photos first"); return; }
    setGenerating(true);
    setStatus("Generating PDF...");

    try {
      // Load all images
      const images = await Promise.all(
        photos.map((p) => new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = p.url;
        }))
      );

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [paperDef.w, paperDef.h] });

      // Convert each image to data URL at target resolution
      const dpi = 300;
      const targetPxW = Math.round(photoDef.w / 25.4 * dpi);
      const targetPxH = Math.round(photoDef.h / 25.4 * dpi);

      // Render photo with given correction strength (0 = none, 1 = full)
      const renderPhoto = (img: HTMLImageElement, strength: number) => {
        const c = document.createElement("canvas");
        c.width = targetPxW;
        c.height = targetPxH;
        const ctx = c.getContext("2d")!;

        const srcRatio = img.naturalWidth / img.naturalHeight;
        const tgtRatio = targetPxW / targetPxH;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (srcRatio > tgtRatio) {
          sw = img.naturalHeight * tgtRatio;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / tgtRatio;
          sy = (img.naturalHeight - sh) / 2;
        }

        if (strength > 0) {
          const sat = 1 - 0.35 * strength;       // saturation: 1.0 → 0.65
          const hue = Math.round(-10 * strength); // hue: 0 → -10 (cooler)
          const bri = 1 - 0.05 * strength;        // brightness: 1.0 → 0.95
          ctx.filter = `saturate(${sat.toFixed(2)}) hue-rotate(${hue}deg) brightness(${bri.toFixed(2)})`;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetPxW, targetPxH);
        return c.toDataURL("image/jpeg", 0.95);
      };

      // Determine correction strength per mode
      const modeStrength = printMode === "inkjet" ? 1.0 : printMode === "photo" ? 0.5 : 0;

      // Place on grid
      let placed = 0;
      for (let row = 0; row < grid.rows && placed < grid.total; row++) {
        // Gradient mode: each row gets different strength (0 to 1)
        const rowStrength = printMode === "gradient"
          ? row / Math.max(1, grid.rows - 1)
          : modeStrength;

        for (let col = 0; col < grid.cols && placed < grid.total; col++) {
          const img = images[placed % images.length];
          const du = renderPhoto(img, rowStrength);
          const x = grid.offsetX + col * (photoDef.w + gapMm);
          const y = grid.offsetY + row * (photoDef.h + gapMm);
          pdf.addImage(du, "JPEG", x, y, photoDef.w, photoDef.h);
          placed++;
        }
      }


      // Cut guides — light gray lines
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      for (let row = 0; row <= grid.rows; row++) {
        const y = grid.offsetY + row * (photoDef.h + gapMm) - gapMm / 2;
        pdf.line(grid.offsetX - 2, y, grid.offsetX + grid.cols * (photoDef.w + gapMm) - gapMm + 2, y);
      }
      for (let col = 0; col <= grid.cols; col++) {
        const x = grid.offsetX + col * (photoDef.w + gapMm) - gapMm / 2;
        pdf.line(x, grid.offsetY - 2, x, grid.offsetY + grid.rows * (photoDef.h + gapMm) - gapMm + 2);
      }

      const blob = pdf.output("blob");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `print_layout_${paper}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus(`PDF saved! ${Math.min(photos.length, grid.total)} photos on ${PAPER_SIZES[paper].label}`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setGenerating(false);
  };

  const btnBase = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ";
  const btnGhost = btnBase + "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white ";
  const btnActive = btnBase + "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 ";
  const btnGreen = btnBase + "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 ";

  return (
    <div class="flex flex-col h-screen bg-[#0d0d1a] text-gray-200">
      {/* Header */}
      <div class="px-5 py-3 bg-gradient-to-r from-[#12122a] to-[#1a1a35] border-b border-white/5 flex items-center justify-between">
        <a href="/" class="group">
          <h1 class="text-lg font-bold tracking-tight bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent group-hover:from-rose-300 group-hover:to-rose-400 transition-all">Print Layout</h1>
          <p class="text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors">Arrange photos on paper for printing</p>
        </a>
        <div class="flex gap-2 items-center">
          <a href="/"
            class="px-3 py-1.5 text-[11px] rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all">
            Visa Photo
          </a>
          <a href="https://github.com/fortunto2/visa-photo" target="_blank"
            class="px-3 py-1.5 text-[11px] rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all">
            GitHub
          </a>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div class="w-64 bg-gradient-to-b from-[#0f1628] to-[#0a0f1e] border-r border-white/5 flex flex-col flex-shrink-0 p-3 gap-3 overflow-y-auto">
          {/* Paper size */}
          <div>
            <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Paper</h3>
            <div class="space-y-0.5">
              {Object.entries(PAPER_SIZES).map(([k, v]) => (
                <button key={k} onClick={() => setPaper(k)}
                  class={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${paper === k
                    ? "bg-gradient-to-r from-rose-500/90 to-rose-600/90 text-white shadow-md shadow-rose-500/20 font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Photo size */}
          <div>
            <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Photo Size</h3>
            <div class="space-y-0.5">
              {PHOTO_SIZE_KEYS.map((k) => { const v = PHOTO_SIZES[k]; return (
                <button key={k} onClick={() => setPhotoSize(k)}
                  class={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${photoSize === k
                    ? "bg-gradient-to-r from-violet-500/90 to-violet-600/90 text-white shadow-md shadow-violet-500/20 font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                  {v.label}
                </button>
              ); })}
            </div>
            {photoSize === "custom" && (
              <div class="flex gap-2 mt-2">
                <div class="flex items-center gap-1">
                  <span class="text-[10px] text-gray-500">W:</span>
                  <input type="number" value={customW}
                    onInput={(e) => setCustomW((e.target as HTMLInputElement).value)}
                    class="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px] text-gray-200 outline-none focus:border-rose-500/50" />
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[10px] text-gray-500">H:</span>
                  <input type="number" value={customH}
                    onInput={(e) => setCustomH((e.target as HTMLInputElement).value)}
                    class="w-14 px-2 py-1 bg-white/5 border border-white/10 rounded text-[11px] text-gray-200 outline-none focus:border-rose-500/50" />
                </div>
                <span class="text-[9px] text-gray-600 self-center">mm</span>
              </div>
            )}
          </div>

          {/* Gap */}
          <div>
            <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Gap: {gapMm}mm</h3>
            <input type="range" min="0" max="10" value={gapMm}
              class="w-full accent-rose-500 h-1.5"
              onInput={(e) => setGapMm(Number((e.target as HTMLInputElement).value))} />
          </div>

          {/* Print correction */}
          <div>
            <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Print Color</h3>
            {([
              { key: "none", label: "No correction", desc: "For screen or calibrated printer" },
              { key: "inkjet", label: "Inkjet (Epson, Canon, HP)", desc: "Fixes yellow cast on photo paper" },
              { key: "photo", label: "Photo printer (dye-sub)", desc: "Canon Selphy, DNP, etc." },
              { key: "gradient", label: "Test sheet", desc: "Each row = different correction, pick best" },
            ] as const).map((opt) => (
              <label key={opt.key} class={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all mb-0.5 ${
                printMode === opt.key
                  ? "bg-white/[0.06] border border-white/10"
                  : "hover:bg-white/[0.03] border border-transparent"
              }`}>
                <input type="radio" name="printMode" checked={printMode === opt.key}
                  onChange={() => setPrintMode(opt.key)}
                  class="w-3 h-3 accent-rose-500" />
                <div>
                  <div class="text-[11px] text-gray-300">{opt.label}</div>
                  <div class="text-[9px] text-gray-600">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Info */}
          <div class="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
            <div class="text-[11px] text-gray-300 font-medium">{grid.cols} x {grid.rows} = {grid.total} slots</div>
            <div class="text-[10px] text-gray-500">{photoDef.w}x{photoDef.h}mm on {PAPER_SIZES[paper].label}</div>
            {photoDef.countries && (
              <div class="text-[10px] text-gray-500 mt-0.5">{photoDef.countries}</div>
            )}
            <div class="text-[10px] text-gray-500 mt-0.5">{photos.length} photo(s) loaded</div>
          </div>

          {/* Photos list */}
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <h3 class="text-[9px] uppercase text-gray-600 tracking-[0.15em] font-semibold">Photos</h3>
              {photos.length > 0 && (
                <button onClick={() => { photos.forEach((p) => URL.revokeObjectURL(p.url)); setPhotos([]); setStatus("Cleared"); }}
                  class="text-[9px] text-gray-600 hover:text-rose-400 transition-colors cursor-pointer">Clear all</button>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()}
              class={btnGhost + " block w-full text-center cursor-pointer mb-2 !bg-violet-500/10 !border-violet-500/30 !text-violet-300 hover:!bg-violet-500/20"}>
              + Add Photos
            </button>
            <div class="space-y-0.5 max-h-40 overflow-y-auto">
              {photos.map((p, i) => (
                <div key={p.url} class="flex items-center gap-1.5 group">
                  <img src={p.url} class="w-6 h-6 rounded object-cover flex-shrink-0" />
                  <span class="flex-1 text-[11px] text-gray-400 truncate">{p.name}</span>
                  <button onClick={() => removePhoto(i)}
                    class="text-[10px] text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity px-1">x</button>
                </div>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button onClick={generatePdf} disabled={generating || photos.length === 0}
            class={`${btnActive} w-full !py-2.5 !text-sm ${(generating || photos.length === 0) ? "opacity-50 cursor-not-allowed" : ""}`}>
            {generating ? "Generating..." : "Download PDF"}
          </button>
        </div>

        {/* Preview */}
        <div class="flex-1 p-5 overflow-y-auto bg-[#0d0d1a] flex items-start justify-center"
          ref={dropRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}>

          <input ref={fileInputRef} type="file" accept="image/*" multiple class="hidden"
            onChange={(e) => { handleFiles((e.target as HTMLInputElement).files); (e.target as HTMLInputElement).value = ""; }} />

          {photos.length === 0 ? (
            <div class="cursor-pointer block mt-8" onClick={() => fileInputRef.current?.click()}>
              <div class="rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-rose-500/40 transition-all group"
                style={{ width: pvW, height: pvH }}>
                <div class="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.04] transition-all">
                  <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-all">
                    <svg class="w-8 h-8 text-white/60 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p class="text-sm text-white/70 font-medium group-hover:text-white transition-colors">Drop photos here</p>
                  <p class="text-[11px] text-white/40 mt-1">or click to browse</p>
                  <p class="text-[10px] text-white/30 mt-3">{grid.cols}x{grid.rows} grid | {photoDef.w}x{photoDef.h}mm each</p>
                </div>
              </div>
            </div>
          ) : (
            <div class="mt-4">
              {/* Paper preview */}
              <div class="bg-white rounded-lg shadow-2xl shadow-black/50 relative"
                style={{ width: pvW, height: pvH }}>
                {Array.from({ length: grid.total }).map((_, i) => {
                  const row = Math.floor(i / grid.cols);
                  const col = i % grid.cols;
                  const x = grid.offsetX + col * (photoDef.w + gapMm);
                  const y = grid.offsetY + row * (photoDef.h + gapMm);
                  const photo = photos.length > 0 ? photos[i % photos.length] : null;

                  // Preview filter matching PDF correction
                  const s = printMode === "gradient"
                    ? row / Math.max(1, grid.rows - 1)
                    : printMode === "inkjet" ? 1.0 : printMode === "photo" ? 0.5 : 0;
                  const prevFilter = s > 0
                    ? `saturate(${(1 - 0.40 * s).toFixed(2)}) brightness(${(1 - 0.12 * s).toFixed(2)}) contrast(${(1 + 0.08 * s).toFixed(2)}) hue-rotate(${Math.round(-8 * s)}deg)`
                    : undefined;

                  return (
                    <div key={i} class="absolute overflow-hidden"
                      style={{
                        left: x * previewScale,
                        top: y * previewScale,
                        width: photoDef.w * previewScale,
                        height: photoDef.h * previewScale,
                      }}>
                      {photo ? (
                        <img src={photo.url} class="w-full h-full object-cover"
                          style={prevFilter ? { filter: prevFilter } : undefined} />
                      ) : (
                        <div class="w-full h-full bg-gray-100 border border-gray-200" />
                      )}
                    </div>
                  );
                })}

                {/* Cut guide lines */}
                {Array.from({ length: grid.rows + 1 }).map((_, row) => {
                  const y = (grid.offsetY + row * (photoDef.h + gapMm) - gapMm / 2) * previewScale;
                  const x1 = (grid.offsetX - 2) * previewScale;
                  const x2 = (grid.offsetX + grid.cols * (photoDef.w + gapMm) - gapMm + 2) * previewScale;
                  return <div key={`h${row}`} class="absolute border-t border-dashed border-gray-300"
                    style={{ left: x1, top: y, width: x2 - x1 }} />;
                })}
                {Array.from({ length: grid.cols + 1 }).map((_, col) => {
                  const x = (grid.offsetX + col * (photoDef.w + gapMm) - gapMm / 2) * previewScale;
                  const y1 = (grid.offsetY - 2) * previewScale;
                  const y2 = (grid.offsetY + grid.rows * (photoDef.h + gapMm) - gapMm + 2) * previewScale;
                  return <div key={`v${col}`} class="absolute border-l border-dashed border-gray-300"
                    style={{ left: x, top: y1, height: y2 - y1 }} />;
                })}
              </div>
              <canvas ref={canvasRef} class="hidden" />
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div class="px-5 py-1.5 bg-[#0a0a18] border-t border-white/5 text-[10px] text-gray-500 flex items-center gap-2">
        <div class={`w-1.5 h-1.5 rounded-full ${photos.length > 0 ? "bg-emerald-500/80" : "bg-gray-600"}`} />
        {status}
      </div>
    </div>
  );
}
