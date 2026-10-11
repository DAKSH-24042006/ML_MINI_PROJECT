import React from 'react';
import { Calendar, MapPin, Flag, Users, Play, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SessionInfo, PreprocessingStats } from '../types';

interface SessionSelectorProps {
  sessions: SessionInfo[];
  selectedSeason: number;
  selectedGP: string;
  selectedSession: string;
  selectedDrivers: string[];
  loading: boolean;
  onSeasonChange: (season: number) => void;
  onGPChange: (gp: string) => void;
  onSessionChange: (session: string) => void;
  onToggleDriver: (driver: string) => void;
  onLoadData: () => void;
  stats: PreprocessingStats | null;
  dataSource: string | null;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  selectedSeason,
  selectedGP,
  selectedSession,
  selectedDrivers,
  loading,
  onSeasonChange,
  onGPChange,
  onSessionChange,
  onToggleDriver,
  onLoadData,
  stats,
  dataSource,
}) => {
  const currentSessionConfig = sessions.find(
    (s) => s.location.toLowerCase() === selectedGP.toLowerCase()
  ) || sessions[0];

  const availableDrivers = currentSessionConfig?.key_drivers || ["VER", "PER", "SAI", "LEC", "HAM", "RUS", "NOR", "ALO"];

  return (
    <div className="f1-card p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1f2737]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            Dataset & Telemetry Acquisition Controls
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure FastF1 session parameters, select driver telemetry streams, and run preprocessing.
          </p>
        </div>

        {dataSource && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161c28] border border-[#222c3e] text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400">Data Source:</span>
            <span className="font-semibold text-cyan-300 uppercase tracking-wide">
              {dataSource.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {/* Season Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-500" /> Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => onSeasonChange(Number(e.target.value))}
            className="w-full bg-[#161d2a] border border-[#232d3f] text-gray-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value={2023}>2023 Championship</option>
            <option value={2024}>2024 Championship</option>
          </select>
        </div>

        {/* Grand Prix Location */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500" /> Grand Prix / Circuit
          </label>
          <select
            value={selectedGP}
            onChange={(e) => onGPChange(e.target.value)}
            className="w-full bg-[#161d2a] border border-[#232d3f] text-gray-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="Monza">Italian GP (Monza - High Speed)</option>
            <option value="Silverstone">British GP (Silverstone - Aero/Downforce)</option>
            <option value="Sakhir">Bahrain GP (Sakhir - Braking Demands)</option>
          </select>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-gray-500" /> Session Type
          </label>
          <select
            value={selectedSession}
            onChange={(e) => onSessionChange(e.target.value)}
            className="w-full bg-[#161d2a] border border-[#232d3f] text-gray-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-red-500"
          >
            <option value="R">Race (R - Full Stints & Degradation)</option>
            <option value="Q">Qualifying (Q - Max Peak Throttle)</option>
          </select>
        </div>

        {/* Load Action Button */}
        <div className="flex items-end">
          <button
            onClick={onLoadData}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Processing Telemetry...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Acquire & Preprocess</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Driver Filter Badges */}
      <div className="mt-4 pt-3 border-t border-[#1a2230]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-gray-500" /> Filter Drivers for Stint Analysis:
          </span>
          <span className="text-[11px] text-gray-500">
            {selectedDrivers.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableDrivers.map((driver) => {
            const isSelected = selectedDrivers.includes(driver);
            return (
              <button
                key={driver}
                onClick={() => onToggleDriver(driver)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white border border-red-500 shadow-sm shadow-red-600/50'
                    : 'bg-[#161d2a] text-gray-400 border border-[#232d3f] hover:border-gray-600'
                }`}
              >
                {driver}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preprocessing Audit Stats */}
      {stats && (
        <div className="mt-4 pt-3 border-t border-[#1a2230] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Raw Laps</span>
            <span className="text-sm font-bold text-gray-200 font-mono">{stats.raw_laps}</span>
          </div>
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Cleaned Laps</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{stats.clean_laps}</span>
          </div>
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">In/Out Laps Filtered</span>
            <span className="text-sm font-bold text-amber-400 font-mono">{stats.removed_in_out_laps}</span>
          </div>
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Outlier / SC Laps</span>
            <span className="text-sm font-bold text-rose-400 font-mono">{stats.removed_outlier_sc_laps}</span>
          </div>
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Session Median</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">{stats.session_median_lap_time}s</span>
          </div>
          <div className="bg-[#0e121a] p-2.5 rounded-lg border border-[#1b2230]">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Active Drivers</span>
            <span className="text-sm font-bold text-gray-300 font-mono">{stats.drivers_count}</span>
          </div>
        </div>
      )}
    </div>
  );
};
