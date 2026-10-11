import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { DriverSummary } from '../types';

interface DriverComparisonProps {
  drivers: DriverSummary[];
}

export const DriverComparison: React.FC<DriverComparisonProps> = ({ drivers }) => {
  if (!drivers || drivers.length === 0) return null;

  const minLapTime = Math.min(...drivers.map((d) => d.best_lap_time));

  return (
    <div className="f1-card p-5 mb-6">
      <div className="pb-3 border-b border-[#1f2737] mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Driver Telemetry & Stint Comparison Table
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Side-by-side comparison of pace, high-speed commitment, and lap consistency across drivers.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1f2737] text-gray-400 font-sans">
              <th className="pb-2 font-semibold">Driver</th>
              <th className="pb-2 font-semibold">Clean Laps</th>
              <th className="pb-2 font-semibold">Best Lap (s)</th>
              <th className="pb-2 font-semibold">Avg Lap (s)</th>
              <th className="pb-2 font-semibold">Avg Speed (km/h)</th>
              <th className="pb-2 font-semibold">Max Speed (km/h)</th>
              <th className="pb-2 font-semibold">Full Throttle %</th>
              <th className="pb-2 font-semibold">Braking %</th>
              <th className="pb-2 font-semibold">Consistency (σ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18202d]">
            {drivers.map((d) => {
              const isP1 = d.best_lap_time === minLapTime;
              return (
                <tr key={d.driver} className={isP1 ? 'bg-red-950/20' : ''}>
                  <td className="py-2.5 font-bold font-sans text-gray-200 flex items-center gap-1.5">
                    {isP1 && <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />}
                    <span className="text-white px-2 py-0.5 rounded bg-[#161d2a] border border-[#232d3f]">
                      {d.driver}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-400">{d.laps_completed}</td>
                  <td className="py-2.5 font-bold text-red-400">{d.best_lap_time.toFixed(3)}s</td>
                  <td className="py-2.5 text-gray-300">{d.avg_lap_time.toFixed(3)}s</td>
                  <td className="py-2.5 text-cyan-300">{d.avg_speed.toFixed(1)}</td>
                  <td className="py-2.5 text-amber-300 font-bold">{d.max_speed.toFixed(1)}</td>
                  <td className="py-2.5 text-emerald-400">{d.avg_full_throttle.toFixed(1)}%</td>
                  <td className="py-2.5 text-rose-400">{d.avg_braking.toFixed(1)}%</td>
                  <td className="py-2.5 text-purple-300">±{d.lap_consistency_std.toFixed(3)}s</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
