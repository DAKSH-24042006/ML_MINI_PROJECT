import React from 'react';
import { Gauge, Activity, Cpu } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-[#1f2737] bg-[#0f131c]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                Formula 1
              </span>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                DRIVER PERFORMANCE ANALYZER
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Machine Learning-Based Formula 1 Telemetry Analytics • Academic Lab Project
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#161d2a] border border-[#232d3f] text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>FastF1 + Scikit-Learn</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
