import React, { useState } from 'react';
import { Target, Award, Play, CheckCircle } from 'lucide-react';
import { ClassificationResponse } from '../types';

interface ClassificationCardProps {
  data: ClassificationResponse | null;
  loading: boolean;
  onRunClassification: (testSize: number) => void;
  testSize: number;
}

export const ClassificationCard: React.FC<ClassificationCardProps> = ({
  data,
  loading,
  onRunClassification,
  testSize,
}) => {
  const [selectedModelCM, setSelectedModelCM] = useState<string>('Logistic Regression');

  const activeCM = data?.confusion_matrices[selectedModelCM] ||
    (data && data.metrics.length > 0 ? data.confusion_matrices[data.metrics[0].model] : null);

  return (
    <div className="f1-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2737] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Module 2
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Lap Performance Classification
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Classify High Performance vs Low Performance laps using median lap-time thresholding.
          </p>
        </div>

        <button
          onClick={() => onRunClassification(testSize)}
          disabled={loading}
          className="flex items-center gap-1.5 bg-[#161d2a] hover:bg-[#1f2738] border border-[#232d3f] hover:border-amber-500/50 text-amber-300 font-semibold text-xs py-1.5 px-3 rounded-lg transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-amber-400" />
          <span>Train Classifiers</span>
        </button>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-7 h-7 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs text-gray-400">Evaluating Logistic Regression, Decision Tree & SVC classifiers...</p>
        </div>
      )}

      {!loading && data && (
        <div className="mt-4 space-y-4">
          {/* Threshold info banner */}
          <div className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-[#161d2a] border border-[#232d3f] text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Classification Cutoff:</span>
              <span className="font-mono font-bold text-amber-400">
                ≤ {data.threshold_used_seconds}s (Session Median)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400">Best Classifier:</span>
              <span className="font-mono font-bold text-emerald-300">{data.best_model}</span>
            </div>
          </div>

          {/* Classification Metrics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f2737] text-gray-400">
                  <th className="pb-2 font-semibold">Algorithm</th>
                  <th className="pb-2 font-semibold">Accuracy</th>
                  <th className="pb-2 font-semibold">Precision</th>
                  <th className="pb-2 font-semibold">Recall</th>
                  <th className="pb-2 font-semibold">F1-Score</th>
                  <th className="pb-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d] font-mono">
                {data.metrics.map((m) => {
                  const isBest = m.model === data.best_model;
                  const isSelected = m.model === selectedModelCM;
                  return (
                    <tr key={m.model} className={isSelected ? 'bg-amber-950/20' : ''}>
                      <td className="py-2.5 font-sans font-bold text-gray-200 flex items-center gap-2">
                        {isBest && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                        {m.model}
                      </td>
                      <td className="py-2.5 font-bold text-emerald-400">{(m.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-2.5 text-gray-300">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="py-2.5 text-gray-300">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="py-2.5 font-bold text-amber-300">{m.f1_score.toFixed(4)}</td>
                      <td className="py-2.5 font-sans">
                        <button
                          onClick={() => setSelectedModelCM(m.model)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-[#1b2230] text-gray-400 hover:text-white'
                          }`}
                        >
                          View Matrix
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Interactive Confusion Matrix */}
          {activeCM && (
            <div className="pt-3 border-t border-[#1a2230]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-300">
                  Confusion Matrix: <span className="text-amber-400 font-bold">{selectedModelCM}</span>
                </h4>
                <span className="text-[11px] text-gray-500 font-mono">
                  Test Samples: {data.test_samples}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-center font-mono">
                {/* True Negative */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <div className="text-[11px] text-gray-400 font-sans uppercase">True Negative (TN)</div>
                  <div className="text-xl font-bold text-emerald-400">{activeCM.true_negative}</div>
                  <div className="text-[10px] text-gray-500 font-sans">Predicted Low, Actual Low</div>
                </div>

                {/* False Positive */}
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40">
                  <div className="text-[11px] text-gray-400 font-sans uppercase">False Positive (FP)</div>
                  <div className="text-xl font-bold text-rose-400">{activeCM.false_positive}</div>
                  <div className="text-[10px] text-gray-500 font-sans">Predicted High, Actual Low (Type I)</div>
                </div>

                {/* False Negative */}
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/40">
                  <div className="text-[11px] text-gray-400 font-sans uppercase">False Negative (FN)</div>
                  <div className="text-xl font-bold text-rose-400">{activeCM.false_negative}</div>
                  <div className="text-[10px] text-gray-500 font-sans">Predicted Low, Actual High (Type II)</div>
                </div>

                {/* True Positive */}
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                  <div className="text-[11px] text-gray-400 font-sans uppercase">True Positive (TP)</div>
                  <div className="text-xl font-bold text-emerald-400">{activeCM.true_positive}</div>
                  <div className="text-[10px] text-gray-500 font-sans">Predicted High, Actual High</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
