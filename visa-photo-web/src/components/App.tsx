import { useState, useRef, useCallback } from "preact/hooks";
import { PRESETS, PRESET_KEYS } from "../lib/presets";
import { containerForImage, calcGuides } from "../lib/crop";
import { cropAndExport, generatePrintLayout, generatePrintPdf, autoEnhance } from "../lib/process";
import { removeBackground, MODELS, type BgModel } from "../lib/background";

interface Photo {
  file: File;
  url: string;
  name: string;
  rotation: number;
}

export default function App() {
  const [preset, setPreset] = useState("turkey");
  const [customW, setCustomW] = useState("600");
  const [customH, setCustomH] = useState("600");
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
  const [tab, setTab] = useState<"photos" | "settings">("photos");
  const [activeModel, setActiveModel] = useState<BgModel>(MODELS[0]);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pr = { ...PRESETS[preset] };
  if (preset === "custom") {
    const w = parseInt(customW); if (w > 0) pr.digital_width = w;
    const h = parseInt(customH); if (h > 0) pr.digital_height = h;
  }
  const currentPhoto = selected !== null ? photos[selected] : null;
  const img = imgRef.current;
  const [contW, contH] = img ? containerForImage(img.naturalWidth, img.naturalHeight) : [500, 620];
  const guides = pr ? calcGuides(cropCx, cropCy, pr, contW, contH, cropScale) : null;

  const brVal = 1 + brightness / 100;
  const ctVal = 1 + contrast / 100;
  const shVal = (shadows / 100) * 0.3;
  const filterStyle = `brightness(${(brVal + shVal).toFixed(2)}) contrast(${ctVal.toFixed(2)})`;
  const rotateStyle = currentPhoto ? `rotate(${currentPhoto.rotation}deg)` : "";

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = [...photos];
    for (const f of files) {
      if (!f.type.startsWith("image/")) continue;
      newPhotos.push({ file: f, url: URL.createObjectURL(f), name: f.name, rotation: 0 });
    }
    setPhotos(newPhotos);
    if (selected === null && newPhotos.length > 0) { setSelected(0); setCropCx(0.5); setCropCy(0.4); }
  };

  const rotate = (dir: 90 | -90) => {
    if (selected === null) return;
    const np = [...photos]; np[selected].rotation = (np[selected].rotation + dir + 360) % 360; setPhotos(np);
  };

  const updateCropPos = useCallback((e: MouseEvent) => {
    const el = containerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    setCropCx(Math.max(0, Math.min(1, (e.clientX - rect.left) / contW)));
    setCropCy(Math.max(0, Math.min(1, (e.clientY - rect.top) / contH)));
  }, [contW, contH]);

  const handleSave = async () => {
    if (!currentPhoto || !imgRef.current) return;
    setStatus("Processing...");
    try {
      const blob = await cropAndExport(imgRef.current, pr, cropCx, cropCy, cropScale, brightness, contrast, shadows, usePng, currentPhoto.rotation);
      const ext = usePng ? "png" : "jpg";
      const stem = personName.trim() || currentPhoto.name.replace(/\.[^.]+$/, "");
      download(blob, `${stem}_${preset}.${ext}`);
      const printBlob = await generatePrintLayout(pr, blob);
      download(printBlob, `${stem}_${preset}_A4.png`);
      const pdfBlob = await generatePrintPdf(pr, blob);
      download(pdfBlob, `${stem}_${preset}_A4.pdf`);
      setStatus(`Saved! ${(blob.size / 1024).toFixed(0)}KB + A4 PNG + PDF`);
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  const doRemoveBg = async (transparent: boolean) => {
    if (!currentPhoto || !imgRef.current) return;
    try {
      const blob = await removeBackground(imgRef.current, activeModel, transparent, setStatus);
      const suffix = transparent ? "_alpha.png" : "_nobg.png";
      const np: Photo = { file: new File([blob], currentPhoto.name.replace(/\.[^.]+$/, suffix)), url: URL.createObjectURL(blob), name: currentPhoto.name.replace(/\.[^.]+$/, suffix), rotation: 0 };
      const all = [...photos, np]; setPhotos(all); setSelected(all.length - 1);
      setStatus(transparent ? "BG removed (transparent)!" : "BG removed (white)!");
    } catch (e: any) { setStatus(`Error: ${e.message}`); }
  };

  // --- Btn style helpers ---
  const btnBase = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ";
  const btnGhost = btnBase + "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white ";
  const btnActive = btnBase + "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 ";
  const btnGreen = btnBase + "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 ";
  const btnPurple = btnBase + "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 ";
  const btnAmber = btnBase + "bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 ";

  return (
    <div class="flex flex-col h-screen bg-[#0d0d1a] text-gray-200">
      {/* Header */}
      <div class="px-5 py-3 bg-gradient-to-r from-[#12122a] to-[#1a1a35] border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold tracking-tight bg-gradient-to-r from-rose-400 to-rose-500 bg-clip-text text-transparent">Visa Photo</h1>
          <p class="text-[11px] text-gray-500">Free AI biometric photo tool</p>
        </div>
        <div class="flex gap-4 items-center">
          <a href="https://github.com/fortunto2/visa-photo/releases/latest" target="_blank"
            class="text-[11px] text-gray-400 hover:text-rose-400 transition-colors">
            Download Desktop
          </a>
          <a href="https://github.com/fortunto2/visa-photo" target="_blank"
            class="text-[11px] text-gray-400 hover:text-rose-400 transition-colors">
            GitHub
          </a>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div class="w-64 bg-gradient-to-b from-[#0f1628] to-[#0a0f1e] border-r border-white/5 flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div class="flex">
            {(["photos", "settings"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                class={`flex-1 py-2.5 text-xs font-medium uppercase tracking-widest transition-all ${tab === t ? "text-rose-400 border-b-2 border-rose-500 bg-white/[0.02]" : "text-gray-600 hover:text-gray-400 border-b-2 border-transparent"}`}>
                {t}
              </button>
            ))}
          </div>

          <div class="p-3 flex-1 overflow-y-auto space-y-3">
            {tab === "photos" ? (
              <>
                <div>
                  <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Country</h3>
                  <div class="space-y-0.5">
                    {PRESET_KEYS.map((k) => (
                      <button key={k} onClick={() => setPreset(k)}
                        class={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${preset === k
                          ? "bg-gradient-to-r from-rose-500/90 to-rose-600/90 text-white shadow-md shadow-rose-500/20 font-medium"
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"}`}>
                        {PRESETS[k].name}
                      </button>
                    ))}
                  </div>
                </div>
                <div class="p-2.5 bg-white/[0.03] rounded-lg border border-white/5">
                  <div class="text-[11px] text-gray-300 font-medium">{pr.digital_width}x{pr.digital_height}px</div>
                  <div class="text-[10px] text-gray-500">{pr.print_width_mm}x{pr.print_height_mm}mm | {pr.photo_count} pcs</div>
                  <div class="text-[10px] text-gray-600 italic mt-0.5">{pr.notes}</div>
                </div>
                {preset === "custom" && (
                  <div class="flex gap-2 mt-1">
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
                    <span class="text-[9px] text-gray-600 self-center">px</span>
                  </div>
                )}

                <div>
                  <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">Photos</h3>
                  <label class={btnPurple + " block w-full text-center cursor-pointer mb-2"}>
                    + Add Photos
                    <input type="file" accept="image/*" multiple class="hidden"
                      onChange={(e) => handleFiles((e.target as HTMLInputElement).files)} />
                  </label>
                  <div class="space-y-0.5">
                    {photos.filter((p) => !p.name.includes("_nobg") && !p.name.includes("_alpha")).map((p) => {
                      const idx = photos.indexOf(p);
                      return (
                        <button key={p.url} onClick={() => { setSelected(idx); setCropCx(0.5); setCropCy(0.4); }}
                          class={`block w-full text-left px-3 py-1.5 rounded-lg text-[11px] truncate transition-all ${selected === idx
                            ? "bg-white/10 text-white border border-rose-500/50"
                            : "text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent"}`}>
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 class="text-[9px] uppercase text-gray-600 mb-1.5 tracking-[0.15em] font-semibold">BG Removal Model</h3>
                <div class="space-y-1">
                  {MODELS.map((m) => (
                    <div key={m.id}
                      class={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${activeModel.id === m.id
                        ? "bg-emerald-500/10 border border-emerald-500/30"
                        : "bg-white/[0.02] border border-white/5 hover:border-white/10"}`}>
                      <div class="flex-1 min-w-0">
                        <div class="text-[11px] text-gray-200 font-medium">{m.name}</div>
                        <div class="text-[10px] text-gray-500">{m.sizeMb}MB {"*".repeat(m.quality)}</div>
                      </div>
                      {activeModel.id !== m.id ? (
                        <button onClick={() => setActiveModel(m)} class={btnGhost + " !text-[9px] !px-2 !py-1"}>Select</button>
                      ) : (
                        <span class="text-emerald-400 text-sm">&#10003;</span>
                      )}
                    </div>
                  ))}
                </div>
                <p class="text-[9px] text-gray-600 mt-1">Downloads on first use, cached in browser.</p>
              </>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div class="flex-1 p-5 overflow-y-auto bg-[#0d0d1a]">
          {currentPhoto ? (
            <div class="flex flex-col gap-3">
              {/* Image container */}
              <div ref={containerRef}
                class="relative rounded-xl overflow-hidden cursor-move select-none bg-black/40 border border-white/10 shadow-2xl shadow-black/50"
                style={{ width: contW, height: contH }}
                onMouseDown={(e) => { updateCropPos(e); setDragging(true); }}
                onMouseMove={(e) => dragging && updateCropPos(e)}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
                onWheel={(e) => { e.preventDefault(); setCropScale((s) => Math.max(0.3, Math.min(1, s - e.deltaY / 100 * 0.05))); }}>
                <img ref={imgRef} src={currentPhoto.url}
                  class="w-full h-full object-contain pointer-events-none transition-transform duration-150"
                  style={{ filter: filterStyle, transform: rotateStyle }}
                  onLoad={() => setCropScale((s) => s)} />

                {guides && (
                  <>
                    <div class="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: 0, width: "100%", height: guides.top }} />
                    <div class="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: guides.top + guides.height, width: "100%", bottom: 0 }} />
                    <div class="absolute bg-black/50 pointer-events-none" style={{ left: 0, top: guides.top, width: guides.left, height: guides.height }} />
                    <div class="absolute bg-black/50 pointer-events-none" style={{ left: guides.left + guides.width, top: guides.top, right: 0, height: guides.height }} />
                    <div class="absolute border-2 border-dashed border-rose-500 pointer-events-none shadow-[0_0_12px_rgba(233,69,96,0.3)]"
                      style={{ left: guides.left, top: guides.top, width: guides.width, height: guides.height }} />
                    <div class="absolute border-t-[1.5px] border-dashed border-amber-400/70 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.headTopY, width: guides.width }} />
                    <div class="absolute border-t-[1.5px] border-dashed border-amber-400/70 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.chinY, width: guides.width }} />
                    <div class="absolute border-t-[1.5px] border-dashed border-emerald-400/70 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.eyeY, width: guides.width }} />
                    {(() => {
                      const oh = guides.faceHeight, ow = oh * 0.65;
                      return <div class="absolute border-[1.5px] border-dashed border-sky-400/40 rounded-full pointer-events-none"
                        style={{ left: guides.left + (guides.width - ow) / 2, top: guides.top + guides.headTopY, width: ow, height: oh }} />;
                    })()}
                  </>
                )}
              </div>

              {/* Controls toolbar */}
              <div class="flex items-center gap-1.5 flex-wrap p-2 bg-white/[0.02] rounded-xl border border-white/5">
                <button onClick={() => rotate(-90)} class={btnGhost}>CCW</button>
                <button onClick={() => rotate(90)} class={btnGhost}>CW</button>

                <div class="w-px h-5 bg-white/10 mx-1" />
                <span class="text-[10px] text-gray-500 font-medium">Crop</span>
                <input type="range" min="30" max="100" value={cropScale * 100}
                  class="w-24 accent-rose-500 h-1.5"
                  onInput={(e) => setCropScale(Number((e.target as HTMLInputElement).value) / 100)} />

                <div class="w-px h-5 bg-white/10 mx-1" />
                <button onClick={() => setUsePng(false)} class={!usePng ? btnActive : btnGhost}>JPEG</button>
                <button onClick={() => setUsePng(true)} class={usePng ? btnActive : btnGhost}>PNG</button>

                <div class="w-px h-5 bg-white/10 mx-1" />
                <button onClick={() => doRemoveBg(false)} class={btnGreen}>Remove BG</button>
                <button onClick={() => doRemoveBg(true)} class={btnGhost + " !border-emerald-500/30 !text-emerald-400 hover:!bg-emerald-500/10"}>Alpha</button>
              </div>

              {/* Adjustments */}
              <div class="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[9px] uppercase text-gray-600 tracking-[0.15em] font-semibold">Adjustments</span>
                  <div class="flex gap-1.5">
                    <button onClick={() => { setBrightness(0); setContrast(0); setShadows(0); }}
                      class={btnGhost + " !text-[9px] !px-2 !py-0.5"}>Reset</button>
                    <button onClick={() => {
                        if (!imgRef.current) return;
                        const { brightness: b, contrast: c, shadows: s } = autoEnhance(imgRef.current);
                        setBrightness(b); setContrast(c); setShadows(s);
                        setStatus(`Auto: brightness ${b}, contrast ${c}, shadows ${s}`);
                      }}
                      class={btnAmber + " !text-[9px] !px-2 !py-0.5"}>Auto</button>
                  </div>
                </div>
                {[
                  { label: "Brightness", value: brightness, set: setBrightness, min: -50, max: 50 },
                  { label: "Contrast", value: contrast, set: setContrast, min: -50, max: 50 },
                  { label: "Shadows", value: shadows, set: setShadows, min: 0, max: 80 },
                ].map((s) => (
                  <div key={s.label} class="flex items-center gap-3 mb-1.5">
                    <label class="w-16 text-[11px] text-gray-500">{s.label}</label>
                    <input type="range" min={s.min} max={s.max} value={s.value}
                      class="flex-1 accent-rose-500 h-1.5"
                      onInput={(e) => s.set(Number((e.target as HTMLInputElement).value))} />
                    <span class="w-7 text-right text-[11px] text-gray-500 tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div class="flex gap-2 items-center">
                <input type="text" placeholder="Name (e.g. John)" value={personName}
                  onInput={(e) => setPersonName((e.target as HTMLInputElement).value)}
                  class="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 outline-none focus:border-rose-500/50 focus:bg-white/[0.07] transition-all placeholder:text-gray-600" />
                <button onClick={handleSave}
                  class="px-6 py-2.5 bg-gradient-to-b from-rose-500 to-rose-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:from-rose-400 hover:to-rose-500 transition-all">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <label class="cursor-pointer block">
              <input type="file" accept="image/*" multiple class="hidden"
                onChange={(e) => handleFiles((e.target as HTMLInputElement).files)} />
              <div class="relative rounded-xl overflow-hidden border-2 border-dashed border-white/10 hover:border-rose-500/40 transition-all group"
                style={{ width: contW, height: contH }}>
                {/* Empty template with face guides */}
                <div class="absolute inset-0 bg-gradient-to-b from-gray-100 to-gray-200" />
                {guides && (
                  <>
                    <div class="absolute border-2 border-dashed border-rose-400/30 pointer-events-none"
                      style={{ left: guides.left, top: guides.top, width: guides.width, height: guides.height }} />
                    <div class="absolute border-t border-dashed border-amber-400/30 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.headTopY, width: guides.width }} />
                    <div class="absolute border-t border-dashed border-amber-400/30 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.chinY, width: guides.width }} />
                    <div class="absolute border-t border-dashed border-emerald-400/30 pointer-events-none"
                      style={{ left: guides.left, top: guides.top + guides.eyeY, width: guides.width }} />
                    {(() => {
                      const oh = guides.faceHeight, ow = oh * 0.65;
                      return <div class="absolute border border-dashed border-sky-400/20 rounded-full pointer-events-none"
                        style={{ left: guides.left + (guides.width - ow) / 2, top: guides.top + guides.headTopY, width: ow, height: oh }} />;
                    })()}
                  </>
                )}
                {/* Upload prompt overlay */}
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/30 transition-all">
                  <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 transition-all">
                    <svg class="w-8 h-8 text-white/60 group-hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p class="text-sm text-white/70 font-medium group-hover:text-white transition-colors">Click to add photo</p>
                  <p class="text-[11px] text-white/40 mt-1">or drag & drop</p>
                  <p class="text-[10px] text-white/30 mt-3">{pr.digital_width}x{pr.digital_height}px | {pr.name}</p>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div class="px-5 py-1.5 bg-[#0a0a18] border-t border-white/5 text-[10px] text-gray-500 flex items-center gap-2">
        <div class="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
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
