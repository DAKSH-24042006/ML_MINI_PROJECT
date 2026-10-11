import React from 'react';
import { Network, Play, Sparkles } from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { ClusteringResponse } from '../types';

interface ClusteringCardProps {
  data: ClusteringResponse | null;
  loading: boolean;
  k: number;
  onKChange: (k: number) => void;
  onRunClustering: (k: number) => void;
}

const CLUSTER_COLORS = ['#e10600', '#00d2be', '#ff8700', '#a855f7', '#38bdf8'];

export const ClusteringCard: React.FC<ClusteringCardProps> = ({
  data,
  loading,
  k,
  onKChange,
  onRunClustering,
}) => {
  return (
    <div className="f1-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2737] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Module 3
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              Unsupervised Driver Stint Clustering (K-Means)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Discover natural driving performance patterns and tyre management profiles via K-Means and PCA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Clusters (K):</span>
            <select
              value={k}
              onChange={(e) => onKChange(Number(e.target.value))}
              className="bg-[#161d2a] border border-[#232d3f] text-gray-200 text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value={2}>K = 2</option>
              <option value={3}>K = 3 (Default)</option>
              <option value={4}>K = 4</option>
              <option value={5}>K = 5</option>
            </select>
          </div>
          <button
            onClick={() => onRunClustering(k)}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#161d2a] hover:bg-[#1f2738] border border-[#232d3f] hover:border-purple-500/50 text-purple-300 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-purple-400" />
            <span>Run Clustering</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-7 h-7 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-gray-400">Performing K-Means partition & 2D PCA dimensionality reduction...</p>
        </div>
      )}

      {!loading && data && (
        <div className="mt-4 space-y-4">
          {/* PCA Variance Explained pill */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/30 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>PCA Explained Variance:</span>
              <span className="font-mono text-purple-300 font-bold">
                PC1 ({data.explained_variance_pct[0]}%), PC2 ({data.explained_variance_pct[1]}%)
              </span>
            </div>
            <span className="text-[11px] text-gray-400">Total: {(data.explained_variance_pct[0] + data.explained_variance_pct[1]).toFixed(1)}%</span>
          </div>

          {/* 2D PCA Scatter Visualization */}
          <div className="h-[250px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2433" />
                <XAxis
                  type="number"
                  dataKey="pca_x"
                  name="PC1"
                  stroke="#4b5563"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="pca_y"
                  name="PC2"
                  stroke="#4b5563"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length > 0) {
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-[#0f141f] border border-[#263147] p-2.5 rounded-lg text-xs font-mono">
                          <p className="font-bold text-white font-sans">{pt.driver} - Lap {pt.lap_number}</p>
                          <p className="text-cyan-400">Lap Time: {pt.lap_time}s</p>
                          <p className="text-amber-400">Avg Speed: {pt.avg_speed} km/h</p>
                          <p className="text-purple-400">Cluster {pt.cluster + 1}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                {Array.from({ length: data.k }).map((_, cIdx) => (
                  <Scatter
                    key={cIdx}
                    name={`Cluster ${cIdx + 1}`}
                    data={data.scatter_points.filter((p) => p.cluster === cIdx)}
                    fill={CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic Cluster Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {data.clusters.map((c, idx) => (
              <div
                key={c.cluster_id}
                className="p-3 rounded-lg bg-[#0e121a] border border-[#1d2535] relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-1.5 h-full"
                  style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
                ></div>
                <div className="pl-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white">{c.label}</span>
                    <span className="font-mono text-[11px] text-gray-400">
                      {c.size} laps ({c.percentage}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-gray-400 mt-2">
                    <div>
                      Avg Speed: <span className="text-gray-200 font-bold">{c.avg_speed} km/h</span>
                    </div>
                    <div>
                      Throttle: <span className="text-emerald-400 font-bold">{c.full_throttle_pct}%</span>
                    </div>
                    <div>
                      Brake: <span className="text-rose-400 font-bold">{c.brake_pct}%</span>
                    </div>
                    <div>
                      Tyre Age: <span className="text-amber-400 font-bold">{c.avg_tyre_age} laps</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
