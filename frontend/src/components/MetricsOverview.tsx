import React from 'react';
import { Timer, Zap, Gauge, Award, Flame, Activity } from 'lucide-react';
import { DriverSummary } from '../types';

interface MetricsOverviewProps {
  driverSummaries: DriverSummary[];
  totalLaps: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  driverSummaries,
  totalLaps,
}) => {
  if (!driverSummaries || driverSummaries.length === 0) return null;

  // Compute aggregate statistics
  const bestLap = Math.min(...driverSummaries.map((d) => d.best_lap_time || 999));
  const bestDriver = driverSummaries.find((d) => d.best_lap_time === bestLap)?.driver || 'N/A';
  
  const avgSpeed = (
    driverSummaries.reduce((acc, d) => acc + d.avg_speed, 0) / driverSummaries.length
  ).toFixed(1);

  const maxSpeed = Math.max(...driverSummaries.map((d) => d.max_speed || 0)).toFixed(1);

  const avgFullThrottle = (
    driverSummaries.reduce((acc, d) => acc + d.avg_full_throttle, 0) / driverSummaries.length
  ).toFixed(1);

  const avgBrake = (
    driverSummaries.reduce((acc, d) => acc + d.avg_braking, 0) / driverSummaries.length
  ).toFixed(1);

  const avgConsistency = (
    driverSummaries.reduce((acc, d) => acc + d.lap_consistency_std, 0) / driverSummaries.length
  ).toFixed(3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* Fastest Lap Card */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Award className="w-3.5 h-3.5 text-red-500" />
          <span>Session Benchmark</span>
        </div>
        <div className="text-xl font-black font-mono text-white tracking-tight">
          {bestLap.toFixed(3)}s
        </div>
        <div className="text-[11px] font-mono text-red-400 mt-1 font-bold">
          P1: {bestDriver}
        </div>
      </div>

      {/* Average Speed Card */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span>Average Speed</span>
        </div>
        <div className="text-xl font-black font-mono text-cyan-300 tracking-tight">
          {avgSpeed}
          <span className="text-xs text-gray-400 font-normal ml-1">km/h</span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Across all stints</div>
      </div>

      {/* Max Top Speed */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Max Trap Speed</span>
        </div>
        <div className="text-xl font-black font-mono text-amber-300 tracking-tight">
          {maxSpeed}
          <span className="text-xs text-gray-400 font-normal ml-1">km/h</span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Speed trap maximum</div>
      </div>

      {/* Full Throttle % */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Flame className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Throttle %</span>
        </div>
        <div className="text-xl font-black font-mono text-emerald-300 tracking-tight">
          {avgFullThrottle}%
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Throttle &gt; 95% ratio</div>
      </div>

      {/* Braking Demand */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span>Braking %</span>
        </div>
        <div className="text-xl font-black font-mono text-rose-300 tracking-tight">
          {avgBrake}%
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Lap braking zone</div>
      </div>

      {/* Consistency */}
      <div className="f1-card p-3.5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110"></div>
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-1">
          <Timer className="w-3.5 h-3.5 text-purple-400" />
          <span>Pace Consistency</span>
        </div>
        <div className="text-xl font-black font-mono text-purple-300 tracking-tight">
          ±{avgConsistency}s
        </div>
        <div className="text-[11px] text-gray-400 mt-1">Stint Lap σ variation</div>
      </div>
    </div>
  );
};
