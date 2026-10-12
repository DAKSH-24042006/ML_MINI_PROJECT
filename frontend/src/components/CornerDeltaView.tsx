import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Flag, Gauge } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import { compareCorners } from '../services/api';
import { CornerCompareResponse } from '../types';
import { InteractiveMonzaMap } from './InteractiveMonzaMap';

const DRIVER_OPTIONS = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', color: '#1e41ff' },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#e80020' },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#e80020' },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00d2be' },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00d2be' },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#ff8000' },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#ff8000' },
  { code: 'PER', name: 'Sergio Pérez', team: 'Red Bull Racing', color: '#1e41ff' },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#006f62' },
];

export const CornerDeltaView: React.FC = () => {
  const [driver1, setDriver1] = useState<string>('VER');
  const [driver2, setDriver2] = useState<string>('HAM');
  const [season, setSeason] = useState<number>(2023);
  const [session, setSession] = useState<string>('R');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CornerCompareResponse | null>(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  const loadComparison = async (d1: string, d2: string, yr: number, sess: string) => {
    setLoading(true);
    try {
      const res = await compareCorners(d1, d2, yr, sess);
      setData(res);
    } catch (err) {
      console.error('Failed to load corner comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison(driver1, driver2, season, session);
  }, [driver1, driver2, season, session]);

  if (loading && !data) {
    return (
      <div className="f1-panel p-12 text-center font-mono">
        <Activity className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
        <span className="text-sm text-gray-300">COMPUTING CONTINUOUS TRACK DELTAS & CORNER ATTRIBUTIONS...</span>
      </div>
    );
  }

  if (!data) return null;

  const d1Meta = data.driver1;
  const d2Meta = data.driver2;
  const winnerMeta = data.overall_winner === d1Meta.code ? d1Meta : d2Meta;
  const deltaAbs = Math.abs(data.total_lap_delta);

  return (
    <div className="space-y-6 font-mono select-none">
      {/* Top Header with Season (2023 / 2024) & Session (Race / Quali) Toggles */}
      <div className="f1-panel p-4 bg-[#0e131d] border border-[#1b2333]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#1a2333] mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                HEAD-TO-HEAD DRIVER CORNER & STRAIGHT DELTA DUEL
              </h2>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Select any two drivers to render simultaneous speed curves and dynamic color advantage along the Monza circuit.
              </p>
            </div>
          </div>

          {/* Interactive Controls: Season Toggle & Session Format Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Season Toggle: 2023 vs 2024 */}
            <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-[#1d2636]">
              <span className="text-[10px] text-gray-400 px-2 font-bold uppercase">SEASON:</span>
              <button
                onClick={() => setSeason(2023)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  season === 2023
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2023
              </button>
              <button
                onClick={() => setSeason(2024)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  season === 2024
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                2024
              </button>
            </div>

            {/* Session Format Toggle: Race (R) vs Qualifying (Q) */}
            <div className="flex items-center gap-1 bg-[#0b0e14] p-1 rounded-lg border border-[#1d2636]">
              <span className="text-[10px] text-gray-400 px-2 font-bold uppercase">FORMAT:</span>
              <button
                onClick={() => setSession('R')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  session === 'R'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏁 RACE [R]
              </button>
              <button
                onClick={() => setSession('Q')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  session === 'Q'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚡ QUALI [Q] (DRS OPEN)
              </button>
            </div>
          </div>
        </div>

        {/* Driver 1 vs Driver 2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Driver 1 */}
          <div className="bg-[#121824] p-3 rounded-lg border border-[#1f2838]">
            <label className="text-[10px] text-gray-400 block mb-1.5 uppercase font-sans">
              Driver 1 (Reference)
            </label>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block flex-shrink-0 shadow"
                style={{ backgroundColor: d1Meta.color }}
              />
              <select
                value={driver1}
                onChange={(e) => setDriver1(e.target.value)}
                className="bg-[#0b0e14] text-white text-xs rounded border border-[#242f44] px-2.5 py-1.5 w-full focus:outline-none focus:border-red-500 font-bold"
              >
                {DRIVER_OPTIONS.map((d) => (
                  <option key={d.code} value={d.code} disabled={d.code === driver2}>
                    {d.code} — {d.name} ({d.team})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 text-[11px] flex justify-between text-gray-400">
              <span>{season} {session === 'Q' ? 'Quali' : 'Race'} Pace:</span>
              <span className="font-bold text-white">{d1Meta.lap_time.toFixed(3)}s</span>
            </div>
          </div>

          {/* Overall Advantage HUD */}
          <div className="bg-[#0b0e14] p-3 rounded-lg border border-[#1d2636] text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-0.5">
              CIRCUIT ADVANTAGE ({season} {session === 'Q' ? 'QUALI' : 'RACE'})
            </span>
            <div className="text-xl font-extrabold flex items-center justify-center gap-2">
              <span style={{ color: winnerMeta.color }}>{winnerMeta.code}</span>
              <span className="text-white">
                {data.total_lap_delta === 0 ? 'TIED' : `-${deltaAbs.toFixed(3)}s`}
              </span>
            </div>
            <span
              className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${winnerMeta.color}20`, color: winnerMeta.color }}
            >
              {data.total_lap_delta <= 0 ? `${d1Meta.code} FASTER ACROSS LAP` : `${d2Meta.code} FASTER ACROSS LAP`}
            </span>
          </div>

          {/* Driver 2 */}
          <div className="bg-[#121824] p-3 rounded-lg border border-[#1f2838]">
            <label className="text-[10px] text-gray-400 block mb-1.5 uppercase font-sans">
              Driver 2 (Challenger)
            </label>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block flex-shrink-0 shadow"
                style={{ backgroundColor: d2Meta.color }}
              />
              <select
                value={driver2}
                onChange={(e) => setDriver2(e.target.value)}
                className="bg-[#0b0e14] text-white text-xs rounded border border-[#242f44] px-2.5 py-1.5 w-full focus:outline-none focus:border-red-500 font-bold"
              >
                {DRIVER_OPTIONS.map((d) => (
                  <option key={d.code} value={d.code} disabled={d.code === driver1}>
                    {d.code} — {d.name} ({d.team})
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 text-[11px] flex justify-between text-gray-400">
              <span>{season} {session === 'Q' ? 'Quali' : 'Race'} Pace:</span>
              <span className="font-bold text-white">{d2Meta.lap_time.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visualizer: Left Track Map + Right Dual Comparison Line Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Vector Map */}
        <div className="h-full">
          <InteractiveMonzaMap
            segments={data.segments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={(id) => setSelectedSegmentId(id)}
            driver1Code={d1Meta.code}
            driver1Color={d1Meta.color}
            driver2Code={d2Meta.code}
            driver2Color={d2Meta.color}
          />
        </div>

        {/* Dual Line Graph: Telemetry Speed Comparison (km/h) + Delta Line */}
        <div className="f1-panel p-4 flex flex-col justify-between bg-[#0a0d14] border border-[#1b2333]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#18202d]">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  TELEMETRY VELOCITY & DELTA COMPARISON (0M → 5,793M)
                </span>
              </div>
              <span className="text-[10px] text-gray-500">MONZA SPEED PROFILE</span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans mt-1">
              Solid curves represent continuous speed for each driver in their official team colors. Dotted white line shows the time delta.
            </p>
          </div>

          <div className="py-4 h-[440px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.trace} margin={{ top: 15, right: 20, left: 0, bottom: 10 }}>
                <XAxis
                  dataKey="distance"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(val) => `${Math.round(val)}m`}
                />
                <YAxis
                  yAxisId="speed"
                  domain={[60, 370]}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  tickFormatter={(val) => `${val}k`}
                />
                <YAxis
                  yAxisId="delta"
                  orientation="right"
                  domain={[-1.2, 1.2]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(val) => `${val > 0 ? `+${val}` : val}s`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#0e131d] p-3 rounded-lg border border-[#232d3f] text-xs font-mono shadow-2xl">
                          <span className="text-gray-400 block text-[10px] mb-1">
                            Track Distance: {item.distance}m
                          </span>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 font-bold" style={{ color: d1Meta.color }}>
                              <span>{d1Meta.code} Speed:</span>
                              <span>{item.d1_speed} km/h</span>
                            </div>
                            <div className="flex justify-between gap-4 font-bold" style={{ color: d2Meta.color }}>
                              <span>{d2Meta.code} Speed:</span>
                              <span>{item.d2_speed} km/h</span>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#1a2333] flex justify-between font-bold text-gray-200">
                            <span>Time Delta:</span>
                            <span style={{ color: item.leader_color }}>
                              {item.leader} leads ({item.delta_time > 0 ? `+${item.delta_time}` : item.delta_time}s)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <ReferenceLine yAxisId="delta" y={0} stroke="#374151" strokeDasharray="3 3" />

                {/* Driver 1 Speed Line */}
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="d1_speed"
                  name={`${d1Meta.code} Speed (km/h)`}
                  stroke={d1Meta.color}
                  strokeWidth={2.5}
                  dot={false}
                />

                {/* Driver 2 Speed Line */}
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="d2_speed"
                  name={`${d2Meta.code} Speed (km/h)`}
                  stroke={d2Meta.color}
                  strokeWidth={2.5}
                  dot={false}
                />

                {/* Time Delta Line */}
                <Line
                  yAxisId="delta"
                  type="monotone"
                  dataKey="delta_time"
                  name="Time Delta (s)"
                  stroke="#ffffff"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-[#18202d] flex items-center justify-between text-[10px] text-gray-500">
            <span>START: T1 BRAKING (-130m)</span>
            <span>MID: LESMO / SERRAGLIO</span>
            <span>END: PARABOLICA LAUNCH</span>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Matrix Table */}
      <div className="f1-panel p-4 bg-[#0e131d]">
        <div className="flex items-center justify-between pb-3 border-b border-[#18202d] mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              TURN-BY-TURN TELEMETRY & ATTRIBUTION MATRIX
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-sans">
            Click row or track segment on map to view detailed telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1f2737] text-gray-400 font-sans text-[11px]">
                <th className="pb-2 font-semibold">Sector</th>
                <th className="pb-2 font-semibold">Sector Name</th>
                <th className="pb-2 font-semibold">Type</th>
                <th className="pb-2 font-semibold" style={{ color: d1Meta.color }}>{d1Meta.code} Speed</th>
                <th className="pb-2 font-semibold" style={{ color: d2Meta.color }}>{d2Meta.code} Speed</th>
                <th className="pb-2 font-semibold">Speed Delta</th>
                <th className="pb-2 font-semibold">Winner</th>
                <th className="pb-2 font-semibold">Estimated Gain</th>
                <th className="pb-2 font-semibold">Corner Driving Style</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17202e]">
              {data.segments.map((seg) => {
                const isSelected = selectedSegmentId === seg.segment_id;
                const isCorner = seg.type === 'corner';

                return (
                  <tr
                    key={seg.segment_id}
                    onClick={() => setSelectedSegmentId(isSelected ? null : seg.segment_id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-red-950/20 border-l-2 border-red-500' : 'hover:bg-[#141b27]'
                    }`}
                  >
                    <td className="py-2.5 font-bold text-gray-300">
                      <span className="px-1.5 py-0.5 rounded bg-[#161c28] border border-[#222c3e]">
                        {seg.segment_id}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-white">{seg.segment_name}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCorner
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {seg.type}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold" style={{ color: d1Meta.color }}>
                      {seg.d1_speed} km/h
                    </td>
                    <td className="py-2.5 font-bold" style={{ color: d2Meta.color }}>
                      {seg.d2_speed} km/h
                    </td>
                    <td className="py-2.5 font-bold text-gray-200">
                      {seg.delta_speed > 0 ? `+${seg.delta_speed}` : seg.delta_speed} km/h
                    </td>
                    <td className="py-2.5 font-bold">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                        style={{ backgroundColor: `${seg.winner_color}25`, color: seg.winner_color }}
                      >
                        {seg.winner}
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-semibold">
                      {seg.time_delta_gain > 0 ? `+${seg.time_delta_gain}` : seg.time_delta_gain}s
                    </td>
                    <td className="py-2.5 text-gray-400 text-[11px]">
                      {isCorner ? (
                        <span className="text-gray-300">{seg.d1_style}</span>
                      ) : (
                        <span className="text-gray-500">Full Throttle Straight</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
