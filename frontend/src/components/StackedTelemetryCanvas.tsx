import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, Gauge, Flame } from 'lucide-react';
import { TelemetryCompareResponse } from '../types';

interface StackedTelemetryCanvasProps {
  data: TelemetryCompareResponse | null;
  driver1: string;
  driver2?: string;
}

export const StackedTelemetryCanvas: React.FC<StackedTelemetryCanvasProps> = ({
  data,
  driver1,
  driver2,
}) => {
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);

  if (!data || !data.telemetry_points || data.telemetry_points.length === 0) {
    return (
      <div className="f1-panel p-6 flex flex-col items-center justify-center min-h-[380px] font-mono text-xs text-gray-500">
        <Activity className="w-5 h-5 animate-pulse text-red-500 mb-2" />
        LOADING HIGH-FREQUENCY SENSOR STREAMS...
      </div>
    );
  }

  const points = data.telemetry_points;
  const d1Key = driver1;

  return (
    <div className="space-y-2 select-none">
      {/* Channel 1: Velocity / Speed */}
      <div className="f1-panel p-2">
        <div className="flex items-center justify-between pb-1 px-2 border-b border-[#18202d] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-red-600"></span>
            <span className="font-bold text-white tracking-wider">VELOCITY // SPEED (KM/H)</span>
            <span className="text-red-400 font-bold ml-2">DRV {d1Key}</span>
            {driver2 && <span className="text-cyan-400 font-bold ml-2">DRV {driver2}</span>}
          </div>
          <span className="text-gray-500 text-[10px]">RADAR TRAP MAX: 352 KM/H</span>
        </div>

        <div className="h-[120px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#161c27" vertical={false} />
              <XAxis dataKey="distance" hide domain={['dataMin', 'dataMax']} />
              <YAxis domain={[50, 360]} stroke="#374151" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090b10', borderColor: '#222c3e', fontSize: '11px', fontFamily: 'monospace' }}
                labelFormatter={(v) => `DIST: ${v}m`}
              />
              <Line type="monotone" dataKey={`${d1Key}_speed`} stroke="#e10600" strokeWidth={1.8} dot={false} isAnimationActive={false} />
              {driver2 && (
                <Line type="monotone" dataKey={`${driver2}_speed`} stroke="#00e5ff" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel 2: Pedal Dynamics (Throttle & Brake) */}
      <div className="f1-panel p-2">
        <div className="flex items-center justify-between pb-1 px-2 border-b border-[#18202d] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-500"></span>
            <span className="font-bold text-white tracking-wider">PEDAL DYNAMICS // THROTTLE (GREEN) & BRAKE (RED)</span>
          </div>
          <span className="text-gray-500 text-[10px]">PERCENTAGE LOAD [0 - 100%]</span>
        </div>

        <div className="h-[105px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#161c27" vertical={false} />
              <XAxis dataKey="distance" hide domain={['dataMin', 'dataMax']} />
              <YAxis domain={[0, 100]} stroke="#374151" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090b10', borderColor: '#222c3e', fontSize: '11px', fontFamily: 'monospace' }}
                labelFormatter={(v) => `DIST: ${v}m`}
              />
              <Line type="monotone" dataKey={`${d1Key}_throttle`} stroke="#00e676" strokeWidth={1.6} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey={`${d1Key}_brake`} stroke="#ff1744" strokeWidth={1.6} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel 3: Transmission (Gear) & Engine RPM */}
      <div className="f1-panel p-2">
        <div className="flex items-center justify-between pb-1 px-2 border-b border-[#18202d] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-amber-400"></span>
            <span className="font-bold text-white tracking-wider">TRANSMISSION // GEAR RATIO (STEPPED) & ENGINE RPM</span>
          </div>
          <span className="text-gray-500 text-[10px]">DISTANCE (0m - 5,793m)</span>
        </div>

        <div className="h-[115px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 5, right: 15, left: -15, bottom: 18 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#161c27" />
              <XAxis
                dataKey="distance"
                stroke="#374151"
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <YAxis yAxisId="gear" domain={[1, 8]} stroke="#374151" tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090b10', borderColor: '#222c3e', fontSize: '11px', fontFamily: 'monospace' }}
                labelFormatter={(v) => `DIST: ${v}m`}
              />
              <Line yAxisId="gear" type="stepAfter" dataKey={`${d1Key}_gear`} stroke="#90a4ae" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
