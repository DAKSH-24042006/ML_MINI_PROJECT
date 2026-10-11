import React from 'react';
import { Flag, Gauge, RefreshCw, Cpu, Activity } from 'lucide-react';
import { SessionInfo } from '../types';

interface TelemetryHeaderProps {
  sessions: SessionInfo[];
  selectedSeason: number;
  selectedGP: string;
  selectedSession: string;
  selectedDriver: string;
  availableDrivers: string[];
  benchmarkLap: number;
  currentLapTime: number;
  loading: boolean;
  onSeasonChange: (s: number) => void;
  onGPChange: (gp: string) => void;
  onSessionChange: (sess: string) => void;
  onDriverChange: (drv: string) => void;
  onReload: () => void;
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({
  sessions,
  selectedSeason,
  selectedGP,
  selectedSession,
  selectedDriver,
  availableDrivers,
  benchmarkLap,
  currentLapTime,
  loading,
  onSeasonChange,
  onGPChange,
  onSessionChange,
  onDriverChange,
  onReload,
}) => {
  const delta = currentLapTime > 0 && benchmarkLap > 0 ? currentLapTime - benchmarkLap : 0;
  const isFaster = delta <= 0;

  return (
    <header className="h-12 bg-[#0a0d12] border-b border-[#1a212d] flex items-center justify-between px-4 shrink-0 font-mono text-xs z-30 select-none">
      {/* Title & Stream Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#1a212d]">
          <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
          <span className="font-bold text-white tracking-wider uppercase text-[11px]">
            F1 TELEMETRY // DRIVER PERFORMANCE ANALYSIS
          </span>
        </div>

        {/* Real-time delta badge */}
        <div className="hidden md:flex items-center gap-2 text-[11px]">
          <span className="text-gray-500 uppercase">SESSION REF:</span>
          <span className="text-gray-300 font-bold">{benchmarkLap > 0 ? `${benchmarkLap.toFixed(3)}s` : '--'}</span>
          <span
            className={`px-1.5 py-0.5 rounded-none font-bold text-[10px] ${
              isFaster
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                : 'bg-red-950/60 text-red-400 border border-red-800/60'
            }`}
          >
            {isFaster ? `Δ ${delta.toFixed(3)}s` : `Δ +${delta.toFixed(3)}s`}
          </span>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="flex items-center gap-2">
        {/* Season */}
        <div className="flex items-center bg-[#11151e] border border-[#1d2535] px-2 py-1">
          <span className="text-[10px] text-gray-500 mr-1.5 font-sans font-semibold">SEASON:</span>
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="bg-transparent text-gray-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value={2023} className="bg-[#0f131a]">2023</option>
            <option value={2024} className="bg-[#0f131a]">2024</option>
          </select>
        </div>

        {/* Grand Prix / Track */}
        <div className="flex items-center bg-[#11151e] border border-[#1d2535] px-2 py-1">
          <span className="text-[10px] text-gray-500 mr-1.5 font-sans font-semibold">TRACK:</span>
          <select
            value={selectedGP}
            onChange={(e) => onGPChange(e.target.value)}
            className="bg-transparent text-gray-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value="Monza" className="bg-[#0f131a]">MONZA (AUTODROMO)</option>
            <option value="Silverstone" className="bg-[#0f131a]">SILVERSTONE</option>
            <option value="Sakhir" className="bg-[#0f131a]">SAKHIR (BAHRAIN)</option>
          </select>
        </div>

        {/* Session Type */}
        <div className="flex items-center bg-[#11151e] border border-[#1d2535] px-2 py-1">
          <span className="text-[10px] text-gray-500 mr-1.5 font-sans font-semibold">SESS:</span>
          <select
            value={selectedSession}
            onChange={(e) => onSessionChange(e.target.value)}
            className="bg-transparent text-gray-200 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value="R" className="bg-[#0f131a]">RACE [R]</option>
            <option value="Q" className="bg-[#0f131a]">QUALIFYING [Q]</option>
          </select>
        </div>

        {/* Driver */}
        <div className="flex items-center bg-[#161c28] border border-red-600/60 px-2 py-1">
          <span className="text-[10px] text-red-400 mr-1.5 font-sans font-bold">DRV:</span>
          <select
            value={selectedDriver}
            onChange={(e) => onDriverChange(e.target.value)}
            className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            {availableDrivers.map((d) => (
              <option key={d} value={d} className="bg-[#0f131a] text-white">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Reload / Refresh Button */}
        <button
          onClick={onReload}
          disabled={loading}
          title="Reload session and re-run pipeline"
          className="bg-[#11151e] hover:bg-[#1a2230] border border-[#1d2535] p-1.5 text-gray-300 hover:text-white transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-500' : ''}`} />
        </button>
      </div>
    </header>
  );
};
