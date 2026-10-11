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
import { Activity, Gauge, Zap } from 'lucide-react';
import { TelemetryCompareResponse } from '../types';

interface TelemetryTraceChartProps {
  data: TelemetryCompareResponse | null;
  loading: boolean;
  driver1: string;
  driver2: string;
  onDriver1Change: (d: string) => void;
  onDriver2Change: (d: string) => void;
  availableDrivers: string[];
}

export const TelemetryTraceChart: React.FC<TelemetryTraceChartProps> = ({
  data,
  loading,
  driver1,
  driver2,
  onDriver1Change,
  onDriver2Change,
  availableDrivers,
}) => {
  const [activeTab, setActiveTab] = useState<'speed' | 'throttle_brake' | 'gear_rpm'>('speed');

  if (loading || !data) {
    return (
      <div className="f1-card p-6 mb-6 flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-gray-400">Loading synchronized high-frequency telemetry curves...</p>
      </div>
    );
  }

  const { driver_1, driver_2, telemetry_points } = data;

  return (
    <div className="f1-card p-5 mb-6">
      {/* Header with Driver Selectors and Tab Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#1f2737] gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            High-Frequency Telemetry Comparison (Distance-Aligned)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Compare throttle commitment, braking points, and apex speeds corner-by-corner.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Driver 1 */}
          <div className="flex items-center gap-1.5 bg-[#161d2a] px-2.5 py-1 rounded-md border border-red-500/40">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <select
              value={driver1}
              onChange={(e) => onDriver1Change(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
            >
              {availableDrivers.map((d) => (
                <option key={d} value={d} className="bg-[#121721] text-white">
                  {d}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-mono text-red-400 font-semibold ml-1">
              {driver_1.lap_time ? `${driver_1.lap_time}s` : ''}
            </span>
          </div>

          <span className="text-xs font-bold text-gray-500">VS</span>

          {/* Driver 2 */}
          <div className="flex items-center gap-1.5 bg-[#161d2a] px-2.5 py-1 rounded-md border border-cyan-500/40">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <select
              value={driver2}
              onChange={(e) => onDriver2Change(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
            >
              {availableDrivers.map((d) => (
                <option key={d} value={d} className="bg-[#121721] text-white">
                  {d}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold ml-1">
              {driver_2.lap_time ? `${driver_2.lap_time}s` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 mb-2">
        <button
          onClick={() => setActiveTab('speed')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'speed'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-[#161d2a] text-gray-400 hover:text-gray-200'
          }`}
        >
          Speed vs Distance (km/h)
        </button>
        <button
          onClick={() => setActiveTab('throttle_brake')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'throttle_brake'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-[#161d2a] text-gray-400 hover:text-gray-200'
          }`}
        >
          Throttle & Brake (%)
        </button>
        <button
          onClick={() => setActiveTab('gear_rpm')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'gear_rpm'
              ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
              : 'bg-[#161d2a] text-gray-400 hover:text-gray-200'
          }`}
        >
          Gear & RPM
        </button>
      </div>

      {/* Chart View */}
      <div className="h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={telemetry_points} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2433" vertical={false} />
            <XAxis
              dataKey="distance"
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)} km`}
            />
            <YAxis
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              domain={activeTab === 'speed' ? [50, 360] : activeTab === 'throttle_brake' ? [0, 105] : ['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f141f',
                borderColor: '#263147',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f3f4f6',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />

            {activeTab === 'speed' && (
              <>
                <Line
                  type="monotone"
                  dataKey={`${driver1}_speed`}
                  name={`${driver1} Speed (km/h)`}
                  stroke="#e10600"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={`${driver2}_speed`}
                  name={`${driver2} Speed (km/h)`}
                  stroke="#00d2be"
                  strokeWidth={2}
                  dot={false}
                />
              </>
            )}

            {activeTab === 'throttle_brake' && (
              <>
                <Line
                  type="monotone"
                  dataKey={`${driver1}_throttle`}
                  name={`${driver1} Throttle (%)`}
                  stroke="#e10600"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={`${driver2}_throttle`}
                  name={`${driver2} Throttle (%)`}
                  stroke="#00d2be"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="stepAfter"
                  dataKey={`${driver1}_brake`}
                  name={`${driver1} Brake`}
                  stroke="#ff8700"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="stepAfter"
                  dataKey={`${driver2}_brake`}
                  name={`${driver2} Brake`}
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </>
            )}

            {activeTab === 'gear_rpm' && (
              <>
                <Line
                  type="stepAfter"
                  dataKey={`${driver1}_gear`}
                  name={`${driver1} Gear`}
                  stroke="#e10600"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="stepAfter"
                  dataKey={`${driver2}_gear`}
                  name={`${driver2} Gear`}
                  stroke="#00d2be"
                  strokeWidth={2}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
