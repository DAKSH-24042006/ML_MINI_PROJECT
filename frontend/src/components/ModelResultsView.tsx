import React, { useState } from 'react';
import { BarChart3, CheckCircle, Award } from 'lucide-react';
import { RegressionResponse, ClassificationResponse, ClusteringResponse } from '../types';

interface ModelResultsViewProps {
  regressionData: RegressionResponse | null;
  classificationData: ClassificationResponse | null;
  clusteringData: ClusteringResponse | null;
  onRunRegression?: (testSize: number) => void;
  onRunClassification?: (testSize: number) => void;
  onRunClustering?: (k: number) => void;
}

export const ModelResultsView: React.FC<ModelResultsViewProps> = ({
  regressionData,
  classificationData,
  clusteringData,
}) => {
  const [selectedCMModel, setSelectedCMModel] = useState<string>('Logistic Regression');

  const cm = classificationData?.confusion_matrices[selectedCMModel] || null;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Module 1: Regression Benchmarks */}
      <div className="f1-panel p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a212d] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 border border-cyan-800">
              MODULE 1
            </span>
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              LAP TIME REGRESSION BENCHMARK MATRIX
            </span>
          </div>
          {regressionData && (
            <span className="text-[10px] text-cyan-400 font-bold">
              OPTIMAL: {regressionData.best_model}
            </span>
          )}
        </div>

        {regressionData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#18202d] text-gray-500 text-[10px]">
                  <th className="pb-2">ALGORITHM</th>
                  <th className="pb-2">MAE (SECONDS)</th>
                  <th className="pb-2">RMSE (SECONDS)</th>
                  <th className="pb-2">R² TEST SCORE</th>
                  <th className="pb-2">R² TRAIN SCORE</th>
                  <th className="pb-2">EVALUATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151c27]">
                {regressionData.metrics.map((m) => {
                  const isBest = m.model === regressionData.best_model;
                  return (
                    <tr key={m.model} className={isBest ? 'bg-cyan-950/20' : ''}>
                      <td className="py-2.5 font-bold text-gray-200">{m.model}</td>
                      <td className="py-2.5 text-gray-300">{m.mae.toFixed(4)}s</td>
                      <td className="py-2.5 font-bold text-cyan-300">{m.rmse.toFixed(4)}s</td>
                      <td className="py-2.5 font-bold text-emerald-400">
                        {(m.r2_test * 100).toFixed(1)}% ({m.r2_test.toFixed(4)})
                      </td>
                      <td className="py-2.5 text-gray-400">{(m.r2_train * 100).toFixed(1)}%</td>
                      <td className="py-2.5">
                        {isBest ? (
                          <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 border border-cyan-800 font-bold">
                            OPTIMAL REGRESSOR
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">BENCHMARK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-gray-500 font-mono animate-pulse">
            CALCULATING REGRESSION BENCHMARKS...
          </div>
        )}
      </div>

      {/* Module 2: Classification Benchmarks */}
      <div className="f1-panel p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a212d] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 border border-amber-800">
              MODULE 2
            </span>
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              PERFORMANCE CLASSIFICATION BENCHMARK MATRIX
            </span>
          </div>
          {classificationData && (
            <span className="text-[10px] text-amber-400 font-bold">
              OPTIMAL: {classificationData.best_model}
            </span>
          )}
        </div>

        {classificationData ? (
          <>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#18202d] text-gray-500 text-[10px]">
                    <th className="pb-2">ALGORITHM</th>
                    <th className="pb-2">ACCURACY</th>
                    <th className="pb-2">PRECISION</th>
                    <th className="pb-2">RECALL</th>
                    <th className="pb-2">F1-SCORE</th>
                    <th className="pb-2">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#151c27]">
                  {classificationData.metrics.map((m) => {
                    const isSelected = m.model === selectedCMModel;
                    return (
                      <tr key={m.model} className={isSelected ? 'bg-amber-950/20' : ''}>
                        <td className="py-2.5 font-bold text-gray-200">{m.model}</td>
                        <td className="py-2.5 font-bold text-emerald-400">{(m.accuracy * 100).toFixed(1)}%</td>
                        <td className="py-2.5 text-gray-300">{(m.precision * 100).toFixed(1)}%</td>
                        <td className="py-2.5 text-gray-300">{(m.recall * 100).toFixed(1)}%</td>
                        <td className="py-2.5 font-bold text-amber-300">{m.f1_score.toFixed(4)}</td>
                        <td className="py-2.5">
                          <button
                            onClick={() => setSelectedCMModel(m.model)}
                            className={`text-[10px] px-2 py-0.5 font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-black'
                                : 'bg-[#151c27] text-gray-400 hover:text-white'
                            }`}
                          >
                            SELECT MATRIX
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Confusion Matrix */}
            {cm && (
              <div className="pt-3 border-t border-[#18202d] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-white block">
                    CONFUSION MATRIX: {selectedCMModel}
                  </span>
                  <span className="text-[10px] text-gray-500 font-sans">
                    True vs False classification counts on 25% test split
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs max-w-sm w-full">
                  <div className="bg-emerald-950/30 p-2 border border-emerald-900/50">
                    <span className="text-[9px] text-gray-400 block uppercase">TRUE NEGATIVE</span>
                    <span className="text-base font-bold text-emerald-400">{cm.true_negative}</span>
                  </div>
                  <div className="bg-rose-950/30 p-2 border border-rose-900/50">
                    <span className="text-[9px] text-gray-400 block uppercase">FALSE POSITIVE</span>
                    <span className="text-base font-bold text-rose-400">{cm.false_positive}</span>
                  </div>
                  <div className="bg-rose-950/30 p-2 border border-rose-900/50">
                    <span className="text-[9px] text-gray-400 block uppercase">FALSE NEGATIVE</span>
                    <span className="text-base font-bold text-rose-400">{cm.false_negative}</span>
                  </div>
                  <div className="bg-emerald-950/30 p-2 border border-emerald-900/50">
                    <span className="text-[9px] text-gray-400 block uppercase">TRUE POSITIVE</span>
                    <span className="text-base font-bold text-emerald-400">{cm.true_positive}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-xs text-gray-500 font-mono animate-pulse">
            CALCULATING CLASSIFICATION BENCHMARKS...
          </div>
        )}
      </div>

      {/* Module 3: K-Means Clustering */}
      {clusteringData && (
        <div className="f1-panel p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a212d] mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-purple-950 text-purple-400 px-1.5 py-0.5 border border-purple-800">
                MODULE 3
              </span>
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                UNSUPERVISED K-MEANS STINT PARTITIONS (K={clusteringData.k})
              </span>
            </div>
            <span className="text-[10px] text-purple-400 font-bold">
              PCA VARIANCE: PC1 ({clusteringData.explained_variance_pct[0]}%), PC2 ({clusteringData.explained_variance_pct[1]}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {clusteringData.clusters.map((c) => (
              <div key={c.cluster_id} className="bg-[#11151e] p-3 border border-[#1b2333]">
                <span className="text-xs font-bold text-white block mb-1">{c.label}</span>
                <span className="text-[10px] text-gray-400 block mb-2">{c.size} LAPS ({c.percentage}%)</span>
                <div className="space-y-1 text-[11px] text-gray-400">
                  <div>AVG SPEED: <span className="text-white font-bold">{c.avg_speed} km/h</span></div>
                  <div>FULL THROTTLE: <span className="text-emerald-400 font-bold">{c.full_throttle_pct}%</span></div>
                  <div>BRAKING: <span className="text-rose-400 font-bold">{c.brake_pct}%</span></div>
                  <div>TYRE LIFE: <span className="text-amber-400 font-bold">{c.avg_tyre_age} laps</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
