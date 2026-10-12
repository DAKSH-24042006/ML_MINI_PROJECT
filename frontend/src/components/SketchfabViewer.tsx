import React, { useState } from 'react';
import { Box, Compass, ExternalLink, Maximize2, RefreshCw, Layers, Zap, Info } from 'lucide-react';

type ModelViewMode = 'car' | 'track' | 'split';

export const SketchfabViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<ModelViewMode>('split');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const carEmbedUrl =
    'https://sketchfab.com/models/9b2fc584679e468ca3a7cb98a75857d2/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_controls=1';
  const trackEmbedUrl =
    'https://sketchfab.com/models/f7f6e15d59c54aaeae81020b898909b4/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_controls=1';

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Controls Header */}
      <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#18202d] gap-3">
          <div className="flex items-center gap-2.5">
            <Box className="w-5 h-5 text-red-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  SKETCHFAB 3D MOTORSPORT SHOWCASE
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-950/80 border border-red-800 text-red-300 font-bold uppercase">
                  OFFICIAL 3D CAD
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Authentic 3D F1 2022 Aerodynamic Car and Autodromo Nazionale Monza Circuit models.
              </p>
            </div>
          </div>

          {/* Model Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#101622] rounded-lg border border-[#1d2738] p-0.5 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'split' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                SPLIT DUAL VIEW
              </button>
              <button
                onClick={() => setViewMode('car')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'car' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                F1 2022 CAR
              </button>
              <button
                onClick={() => setViewMode('track')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'track' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                MONZA CIRCUIT
              </button>
            </div>
          </div>
        </div>

        {/* Quick Spec Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="bg-[#101520] p-2.5 rounded border border-[#1a2333]">
            <span className="text-[10px] text-gray-400 block uppercase">3D CAR SPECIFICATION</span>
            <span className="text-white font-bold block mt-0.5">FIA 2022 Ground-Effect CAD</span>
            <span className="text-[10px] text-cyan-400">Venturi floor tunnels & 18" rims</span>
          </div>
          <div className="bg-[#101520] p-2.5 rounded border border-[#1a2333]">
            <span className="text-[10px] text-gray-400 block uppercase">CIRCUIT GEOMETRY</span>
            <span className="text-white font-bold block mt-0.5">Autodromo Nazionale Monza</span>
            <span className="text-[10px] text-amber-400">5.793 km // 11 High-Speed Turns</span>
          </div>
          <div className="bg-[#101520] p-2.5 rounded border border-[#1a2333]">
            <span className="text-[10px] text-gray-400 block uppercase">RENDERING ENGINE</span>
            <span className="text-white font-bold block mt-0.5">Sketchfab WebGL PBR</span>
            <span className="text-[10px] text-emerald-400">Zero Lag • Smooth 60 FPS</span>
          </div>
          <div className="bg-[#101520] p-2.5 rounded border border-[#1a2333]">
            <span className="text-[10px] text-gray-400 block uppercase">INTERACTION</span>
            <span className="text-white font-bold block mt-0.5">Free 360° Orbit & Zoom</span>
            <span className="text-[10px] text-gray-400">Left-Drag orbit • Scroll zoom</span>
          </div>
        </div>
      </div>

      {/* Main 3D Model Display Grid */}
      <div
        className={`grid gap-4 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* CAR 3D VIEWER */}
        {(viewMode === 'split' || viewMode === 'car') && (
          <div className="f1-panel p-3 bg-[#090c12] border border-[#1c2536] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#18212e] mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-bold text-white">F1 2022 GENERIC CAR (3D CAD)</span>
              </div>
              <a
                href="https://sketchfab.com/3d-models/f1-2022-generic-9b2fc584679e468ca3a7cb98a75857d2"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>TheoDevF1</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative w-full h-[460px] rounded-lg overflow-hidden border border-[#17202e] bg-[#05070c]">
              <iframe
                title="F1 2022 Generic Car"
                src={carEmbedUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>🏎️ Monocoque, Halo, Front & Rear Wings, Underfloor</span>
              <span className="text-cyan-400 font-bold">Use Mouse to Orbit & Zoom in 3D</span>
            </div>
          </div>
        )}

        {/* TRACK 3D VIEWER */}
        {(viewMode === 'split' || viewMode === 'track') && (
          <div className="f1-panel p-3 bg-[#090c12] border border-[#1c2536] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#18212e] mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-white">AUTODROMO MONZA 3D CIRCUIT</span>
              </div>
              <a
                href="https://sketchfab.com/3d-models/cartoon-race-track-monza-f7f6e15d59c54aaeae81020b898909b4"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>RCC Design</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative w-full h-[460px] rounded-lg overflow-hidden border border-[#17202e] bg-[#05070c]">
              <iframe
                title="Cartoon Race Track Monza"
                src={trackEmbedUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
              />
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
              <span>🏁 Complete Monza Circuit: Curva Grande, Lesmo, Ascari, Parabolica</span>
              <span className="text-amber-400 font-bold">360° Circuit Overview</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
