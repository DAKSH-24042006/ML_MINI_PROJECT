import React from 'react';
import { TrendingUp, Award, Play, CheckCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { RegressionResponse } from '../types';

interface RegressionCardProps {
  data: RegressionResponse | null;
  loading: boolean;
  onRunRegression: (testSize: number) => void;
  testSize: number;
  onTestSizeChange: (size: number) => void;
}

export const RegressionCard: React.FC<RegressionCardProps> = ({
  data,
  loading,
  onRunRegression,
  testSize,
  onTestSizeChange,
}) => {
  return (
    <div className="f1-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2737] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Module 1
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Lap Time Regression Analysis
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Predict continuous lap times using telemetry metrics (Linear Regression vs Decision Tree vs SVR).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Test Split:</span>
            <select
              value={testSize}
              onChange={(e) => onTestSizeChange(Number(e.target.value))}
              className="bg-[#161d2a] border border-[#232d3f] text-gray-200 text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value={0.20}>20%</option>
              <option value={0.25}>25%</option>
              <option value={0.30}>30%</option>
            </select>
          </div>
          <button
            onClick={() => onRunRegression(testSize)}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#161d2a] hover:bg-[#1f2738] border border-[#232d3f] hover:border-cyan-500/50 text-cyan-300 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" />
            <span>Train Models</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-7 h-7 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-gray-400">Training Linear Regression, Decision Tree & SVR models...</p>
        </div>
      )}

      {!loading && data && (
        <div className="mt-4 space-y-4">
          {/* Best Model Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300">Top Performing Regressor:</span>
              <span className="font-bold text-cyan-300 font-mono text-sm">{data.best_model}</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Train: <span className="font-mono text-gray-200 font-bold">{data.train_samples}</span> laps | Test:{' '}
              <span className="font-mono text-gray-200 font-bold">{data.test_samples}</span> laps
            </div>
          </div>

          {/* Model Metrics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f2737] text-gray-400">
                  <th className="pb-2 font-semibold">Algorithm</th>
                  <th className="pb-2 font-semibold">MAE (Seconds)</th>
                  <th className="pb-2 font-semibold">RMSE (Seconds)</th>
                  <th className="pb-2 font-semibold">R² Test</th>
                  <th className="pb-2 font-semibold">R² Train</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d] font-mono">
                {data.metrics.map((m) => {
                  const isBest = m.model === data.best_model;
                  return (
                    <tr key={m.model} className={isBest ? 'bg-cyan-950/20' : ''}>
                      <td className="py-2.5 font-sans font-bold text-gray-200 flex items-center gap-2">
                        {isBest && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                        {m.model}
                      </td>
                      <td className="py-2.5 text-gray-300">{m.mae.toFixed(4)}s</td>
                      <td className="py-2.5 font-bold text-cyan-300">{m.rmse.toFixed(4)}s</td>
                      <td className="py-2.5 font-bold text-emerald-400">
                        {(m.r2_test * 100).toFixed(1)}% ({m.r2_test.toFixed(4)})
                      </td>
                      <td className="py-2.5 text-gray-400">{(m.r2_train * 100).toFixed(1)}%</td>
                      <td className="py-2.5 font-sans">
                        {isBest ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            OPTIMAL
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">Benchmark</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Error Comparison Chart */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">Model Error Metric Comparison (Lower is Better)</h4>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2433" vertical={false} />
                  <XAxis dataKey="model" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f141f',
                      borderColor: '#263147',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="mae" name="MAE (s)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rmse" name="RMSE (s)" fill="#e10600" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
