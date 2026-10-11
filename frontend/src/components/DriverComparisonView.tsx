import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Users, Activity } from 'lucide-react';
import { TelemetryCompareResponse, DriverSummary } from '../types';

interface DriverComparisonViewProps {
  telemetryData: TelemetryCompareResponse | null;
  driverSummaries: DriverSummary[];
  driver1: string;
  driver2: string;
  onDriver1Change: (d: string) => void;
  onDriver2Change: (d: string) => void;
  availableDrivers: string[];
}

export const DriverComparisonView: React.FC<DriverComparisonViewProps> = ({
  telemetryData,
  driverSummaries,
  driver1,
  driver2,
  onDriver1Change,
  onDriver2Change,
  availableDrivers,
}) => {
  const points = telemetryData?.telemetry_points || [];

  // Calculate speed delta curve (Driver 1 - Driver 2)
  const pointsWithDelta = points.map((pt) => {
    const s1 = pt[`${driver1}_speed`] || 0;
    const s2 = pt[`${driver2}_speed`] || 0;
    return {
      ...pt,
      speed_delta: Number((s1 - s2).toFixed(1)),
    };
  });

  const d1Summary = driverSummaries.find((d) => d.driver === driver1);
  const d2Summary = driverSummaries.find((d) => d.driver === driver2);

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Top Driver Selector Bar */}
      <div className="f1-panel p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">
            HEAD-TO-HEAD TELEMETRY OVERLAY & SPEED DELTA
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Driver 1 */}
          <div className="flex items-center gap-1.5 bg-[#11151e] border border-red-500 px-2 py-1">
            <span className="w-2.5 h-2.5 bg-red-600"></span>
            <span className="text-gray-400">PRIMARY:</span>
            <select
              value={driver1}
              onChange={(e) => onDriver1Change(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              {availableDrivers.map((d) => (
                <option key={d} value={d} className="bg-[#0f131a]">{d}</option>
              ))}
            </select>
          </div>

          <span className="text-gray-500 font-bold">VS</span>

          {/* Driver 2 */}
          <div className="flex items-center gap-1.5 bg-[#11151e] border border-cyan-400 px-2 py-1">
            <span className="w-2.5 h-2.5 bg-cyan-400"></span>
            <span className="text-gray-400">REFERENCE:</span>
            <select
              value={driver2}
              onChange={(e) => onDriver2Change(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none"
            >
              {availableDrivers.map((d) => (
                <option key={d} value={d} className="bg-[#0f131a]">{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Speed Overlaid Chart */}
      <div className="f1-panel p-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#18202d] text-xs">
          <span className="text-gray-300 font-bold">OVERLAID SPEED CURVE (KM/H)</span>
          <span className="text-gray-500 text-[10px]">DISTANCE (0m - 5,793m)</span>
        </div>

        <div className="h-[210px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pointsWithDelta} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#161c27" />
              <XAxis dataKey="distance" stroke="#374151" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <YAxis domain={[60, 360]} stroke="#374151" tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#090b10', borderColor: '#222c3e', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line type="monotone" dataKey={`${driver1}_speed`} name={`${driver1} Speed`} stroke="#e10600" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey={`${driver2}_speed`} name={`${driver2} Speed`} stroke="#00e5ff" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed Delta Curve (Driver 1 - Driver 2) */}
      <div className="f1-panel p-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#18202d] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-yellow-400"></span>
            <span className="text-gray-300 font-bold">SPEED DELTA CURVE (Δ KM/H = {driver1} - {driver2})</span>
          </div>
          <span className="text-gray-500 text-[10px]">POSITIVE = {driver1} FASTER | NEGATIVE = {driver2} FASTER</span>
        </div>

        <div className="h-[120px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pointsWithDelta} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#161c27" />
              <XAxis dataKey="distance" stroke="#374151" tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <YAxis domain={[-35, 35]} stroke="#374151" tick={{ fill: '#64748b', fontSize: 9 }} />
              <Tooltip contentStyle={{ backgroundColor: '#090b10', borderColor: '#222c3e', fontSize: '11px' }} />
              <Line type="monotone" dataKey="speed_delta" name="Speed Delta (km/h)" stroke="#facc15" strokeWidth={1.8} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-side KPI Comparison */}
      {d1Summary && d2Summary && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#10141d] p-3 border border-red-900/40">
            <span className="text-red-400 font-bold text-sm block mb-1">DRIVER: {driver1}</span>
            <div className="space-y-1 text-gray-400 text-[11px]">
              <div>BEST LAP: <span className="text-white font-bold">{d1Summary.best_lap_time.toFixed(3)}s</span></div>
              <div>AVG SPEED: <span className="text-white font-bold">{d1Summary.avg_speed.toFixed(1)} km/h</span></div>
              <div>FULL THROTTLE: <span className="text-emerald-400 font-bold">{d1Summary.avg_full_throttle.toFixed(1)}%</span></div>
              <div>BRAKING DEMAND: <span className="text-rose-400 font-bold">{d1Summary.avg_braking.toFixed(1)}%</span></div>
            </div>
          </div>

          <div className="bg-[#10141d] p-3 border border-cyan-900/40">
            <span className="text-cyan-400 font-bold text-sm block mb-1">DRIVER: {driver2}</span>
            <div className="space-y-1 text-gray-400 text-[11px]">
              <div>BEST LAP: <span className="text-white font-bold">{d2Summary.best_lap_time.toFixed(3)}s</span></div>
              <div>AVG SPEED: <span className="text-white font-bold">{d2Summary.avg_speed.toFixed(1)} km/h</span></div>
              <div>FULL THROTTLE: <span className="text-emerald-400 font-bold">{d2Summary.avg_full_throttle.toFixed(1)}%</span></div>
              <div>BRAKING DEMAND: <span className="text-rose-400 font-bold">{d2Summary.avg_braking.toFixed(1)}%</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
