import React from 'react';
import { SlidersHorizontal, Info } from 'lucide-react';
import { FeatureImportanceItem } from '../types';

interface FeatureImportanceProps {
  features: FeatureImportanceItem[];
  loading: boolean;
}

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({ features, loading }) => {
  if (loading) {
    return (
      <div className="f1-card p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#1f2737] rounded w-1/3"></div>
          <div className="h-8 bg-[#161d2a] rounded"></div>
          <div className="h-8 bg-[#161d2a] rounded"></div>
        </div>
      </div>
    );
  }

  if (!features || features.length === 0) return null;

  return (
    <div className="f1-card p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1f2737] gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            Decision Tree Feature Importance Hierarchy
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Gini / MSE reduction ranking: which telemetry metrics dictate lap time variation the most?
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#161d2a] px-2.5 py-1 rounded-md border border-[#232d3f]">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Derived from Decision Tree splits</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {features.slice(0, 8).map((item, idx) => {
          return (
            <div key={item.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-300 font-sans font-medium flex items-center gap-2">
                  <span className="w-4 text-gray-500 font-mono text-[11px]">{idx + 1}.</span>
                  {item.feature.replace(/_/g, ' ')}
                </span>
                <span className="text-emerald-400 font-bold">{item.percentage}%</span>
              </div>
              <div className="w-full bg-[#161d2a] h-2 rounded-full overflow-hidden border border-[#232d3f]">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 3)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
