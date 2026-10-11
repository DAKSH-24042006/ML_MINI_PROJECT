import React from 'react';
import { GitBranch, Info, Zap } from 'lucide-react';
import { FeatureImportanceItem } from '../types';

interface FeatureAnalysisViewProps {
  features: FeatureImportanceItem[];
  loading: boolean;
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  avg_speed: 'Dominant factor: higher straightline speed and carry-through across Curva Grande',
  full_throttle_pct: 'Corner exit traction: percentage of lap spent at wide open throttle (WOT)',
  brake_pct: 'Braking zone efficiency: minimizing time spent decelerating into Rettifilo chicane',
  speed_std: 'Cornering dynamics: velocity variance between low-speed hairpins and straights',
  tyre_age: 'Thermal degradation: lap time decay as tyre rubber graining accumulates',
  braking_intensity_avg: 'Threshold braking pressure: initial pedal spike before trail braking',
  max_speed: 'Top-end trap velocity before braking points (aided by DRS and slipstream)',
  avg_rpm: 'Power unit operational window: keeping hybrid energy deployment optimized',
};

export const FeatureAnalysisView: React.FC<FeatureAnalysisViewProps> = ({
  features,
  loading,
}) => {
  return (
    <div className="space-y-4 font-mono select-none">
      <div className="f1-panel p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1a212d] gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                WHAT DRIVES LAP PERFORMANCE? // TELEMETRY FEATURE SENSITIVITY
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              Ranked Gini & MSE reduction weights extracted dynamically from the trained Decision Tree splits.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-[#11151e] px-2.5 py-1 border border-[#1d2535]">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>CALCULATED DYNAMICALLY ACROSS 192 LAPS</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-xs text-gray-500">
            COMPUTING FEATURE COEFFICIENTS...
          </div>
        ) : (
          <div className="space-y-3">
            {features.slice(0, 8).map((item, idx) => {
              const desc = FEATURE_DESCRIPTIONS[item.feature] || 'Telemetry parameter correlated with lap time variance';

              return (
                <div key={item.feature} className="bg-[#11151e] p-3 border border-[#18202d] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-[10px]">#{idx + 1}</span>
                      <span className="font-bold text-white tracking-wider uppercase">
                        {item.feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-red-400 font-bold">{item.percentage}% IMPACT</span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-[#0a0d12] h-2 rounded-none overflow-hidden border border-[#1e2736]">
                    <div
                      className="bg-red-600 h-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    ></div>
                  </div>

                  <p className="text-[11px] font-sans text-gray-400">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
