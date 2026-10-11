import React, { useState, useEffect } from 'react';
import { Sliders, Play, RotateCcw, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { predictCustomLap } from '../services/api';
import { CustomPredictResponse } from '../types';

export const SimulatorView: React.FC = () => {
  const [avgSpeed, setAvgSpeed] = useState<number>(249.0);
  const [maxSpeed, setMaxSpeed] = useState<number>(351.0);
  const [fullThrottle, setFullThrottle] = useState<number>(75.0);
  const [brakePct, setBrakePct] = useState<number>(13.5);
  const [brakeIntensity, setBrakeIntensity] = useState<number>(76.0);
  const [tyreAge, setTyreAge] = useState<number>(5.0);
  const [gearShifts, setGearShifts] = useState<number>(42);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CustomPredictResponse | null>(null);

  // Trigger live prediction when user changes any slider
  const runPrediction = async (
    speed = avgSpeed,
    throttle = fullThrottle,
    brake = brakePct,
    tyre = tyreAge
  ) => {
    setLoading(true);
    try {
      const res = await predictCustomLap({
        avg_speed: speed,
        max_speed: maxSpeed,
        min_speed: 80.0,
        speed_std: 60.0,
        avg_throttle: throttle + 10.0,
        full_throttle_pct: throttle,
        brake_pct: brake,
        braking_intensity_avg: brakeIntensity,
        avg_rpm: 11000.0,
        max_rpm: 12400.0,
        avg_gear: 6.0,
        gear_shifts_count: gearShifts,
        drs_usage_pct: 16.5,
        tyre_age: tyre,
      });
      setResult(res);
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, []);

  const handleApplyPreset = (preset: 'quali' | 'race' | 'tyre_deg') => {
    if (preset === 'quali') {
      setAvgSpeed(252.5);
      setMaxSpeed(355.0);
      setFullThrottle(79.0);
      setBrakePct(12.0);
      setBrakeIntensity(88.0);
      setTyreAge(1.0);
      setGearShifts(40);
      runPrediction(252.5, 79.0, 12.0, 1.0);
    } else if (preset === 'race') {
      setAvgSpeed(248.5);
      setMaxSpeed(350.0);
      setFullThrottle(73.5);
      setBrakePct(13.8);
      setBrakeIntensity(75.0);
      setTyreAge(12.0);
      setGearShifts(42);
      runPrediction(248.5, 73.5, 13.8, 12.0);
    } else if (preset === 'tyre_deg') {
      setAvgSpeed(243.0);
      setMaxSpeed(346.0);
      setFullThrottle(66.0);
      setBrakePct(16.5);
      setBrakeIntensity(68.0);
      setTyreAge(28.0);
      setGearShifts(44);
      runPrediction(243.0, 66.0, 16.5, 28.0);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header & Presets */}
      <div className="f1-panel p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#1a212d] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                VIRTUAL LAP SIMULATOR // WHAT-IF TELEMETRY PREDICTOR
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-sans mt-0.5">
              Simulate arbitrary driving styles, corner commitment, and tyre ages through the trained ML models.
            </p>
          </div>

          {/* Quick Setup Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">SETUP PRESETS:</span>
            <button
              onClick={() => handleApplyPreset('quali')}
              className="bg-[#151c27] hover:bg-red-950/60 border border-[#222c3e] hover:border-red-500 text-gray-200 hover:text-white px-2.5 py-1 text-[11px] font-bold transition-all"
            >
              QUALIFYING PUSH
            </button>
            <button
              onClick={() => handleApplyPreset('race')}
              className="bg-[#151c27] hover:bg-cyan-950/60 border border-[#222c3e] hover:border-cyan-500 text-gray-200 hover:text-white px-2.5 py-1 text-[11px] font-bold transition-all"
            >
              RACE STINT
            </button>
            <button
              onClick={() => handleApplyPreset('tyre_deg')}
              className="bg-[#151c27] hover:bg-amber-950/60 border border-[#222c3e] hover:border-amber-500 text-gray-200 hover:text-white px-2.5 py-1 text-[11px] font-bold transition-all"
            >
              TYRE CONSERVATION
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {/* Average Speed */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">AVERAGE VELOCITY</span>
              <span className="text-white font-bold text-sm">{avgSpeed.toFixed(1)} km/h</span>
            </div>
            <input
              type="range"
              min={225}
              max={256}
              step={0.5}
              value={avgSpeed}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAvgSpeed(val);
                runPrediction(val, fullThrottle, brakePct, tyreAge);
              }}
              className="w-full accent-red-600 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>225 km/h</span>
              <span>256 km/h</span>
            </div>
          </div>

          {/* Full Throttle % */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">FULL THROTTLE COMMITMENT</span>
              <span className="text-emerald-400 font-bold text-sm">{fullThrottle.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={85}
              step={0.5}
              value={fullThrottle}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFullThrottle(val);
                runPrediction(avgSpeed, val, brakePct, tyreAge);
              }}
              className="w-full accent-emerald-500 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>50%</span>
              <span>85%</span>
            </div>
          </div>

          {/* Braking % */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">BRAKING ZONE DURATION</span>
              <span className="text-rose-400 font-bold text-sm">{brakePct.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min={9}
              max={22}
              step={0.5}
              value={brakePct}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBrakePct(val);
                runPrediction(avgSpeed, fullThrottle, val, tyreAge);
              }}
              className="w-full accent-rose-500 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>9%</span>
              <span>22%</span>
            </div>
          </div>

          {/* Tyre Age */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">TYRE AGE (COMPLETED LAPS)</span>
              <span className="text-amber-400 font-bold text-sm">{tyreAge.toFixed(0)} LAPS</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={tyreAge}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTyreAge(val);
                runPrediction(avgSpeed, fullThrottle, brakePct, val);
              }}
              className="w-full accent-amber-500 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>1 LAP (FRESH)</span>
              <span>40 LAPS (DEGRADED)</span>
            </div>
          </div>

          {/* Braking Intensity */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">BRAKE PEDAL PEAK PRESSURE</span>
              <span className="text-cyan-400 font-bold text-sm">{brakeIntensity.toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={1}
              value={brakeIntensity}
              onChange={(e) => {
                setBrakeIntensity(Number(e.target.value));
              }}
              className="w-full accent-cyan-500 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Gear Shifts */}
          <div className="bg-[#11151e] p-3 border border-[#1b2331]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">TRANSMISSION SHIFTS PER LAP</span>
              <span className="text-purple-400 font-bold text-sm">{gearShifts} SHIFTS</span>
            </div>
            <input
              type="range"
              min={32}
              max={55}
              step={1}
              value={gearShifts}
              onChange={(e) => {
                setGearShifts(Number(e.target.value));
              }}
              className="w-full accent-purple-500 bg-[#1e2736] h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1">
              <span>32 SHIFTS</span>
              <span>55 SHIFTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Output HUD */}
      {result && (
        <div className="f1-panel p-4">
          <div className="pb-3 border-b border-[#1a212d] mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white tracking-widest uppercase">
              MODEL REAL-TIME INFERENCE OUTPUT
            </span>
            <span className="text-[10px] text-emerald-400">CALCULATED IN &lt; 15MS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Predicted Lap Time */}
            <div className="bg-[#10141d] p-3.5 border border-[#1b2331]">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">
                PREDICTED LAP TIME
              </span>
              <div className="text-2xl font-black text-white">
                {result.predicted_lap_formatted}
              </div>
              <div className="text-[11px] text-cyan-400 font-bold mt-1">
                ({result.predicted_lap_time}s)
              </div>
            </div>

            {/* Delta vs Median */}
            <div className="bg-[#10141d] p-3.5 border border-[#1b2331]">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">
                DELTA VS MEDIAN REF ({result.median_benchmark}s)
              </span>
              <div className={`text-2xl font-black ${result.delta_vs_median <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.delta_vs_median <= 0 ? `${result.delta_vs_median.toFixed(3)}s` : `+${result.delta_vs_median.toFixed(3)}s`}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {result.delta_vs_median <= 0 ? 'FASTER THAN MEDIAN' : 'SLOWER THAN MEDIAN'}
              </div>
            </div>

            {/* Performance Classification */}
            <div className="bg-[#10141d] p-3.5 border border-[#1b2331]">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">
                PERFORMANCE CATEGORY
              </span>
              <div className="text-lg font-black text-white">
                {result.performance_label}
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                CONFIDENCE: {result.confidence_pct}%
              </div>
            </div>

            {/* Assigned Cluster */}
            <div className="bg-[#10141d] p-3.5 border border-[#1b2331]">
              <span className="text-[10px] text-gray-500 uppercase block mb-1">
                UNSUPERVISED STINT CLUSTER
              </span>
              <div className="text-xs font-bold text-gray-200 mt-1">
                {result.cluster_label}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                K-MEANS (K=3) // 2D PCA PARTITION
              </div>
            </div>
          </div>

          {/* Estimated Sector Splits */}
          <div className="mt-4 pt-3 border-t border-[#1a212d] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#0b0e14] p-2 border border-[#161d28]">
              <span className="text-[10px] text-gray-500 block">ESTIMATED SECTOR 1</span>
              <span className="font-bold text-purple-400">{result.sector_splits.sector_1.toFixed(3)}s</span>
            </div>
            <div className="bg-[#0b0e14] p-2 border border-[#161d28]">
              <span className="text-[10px] text-gray-500 block">ESTIMATED SECTOR 2</span>
              <span className="font-bold text-cyan-400">{result.sector_splits.sector_2.toFixed(3)}s</span>
            </div>
            <div className="bg-[#0b0e14] p-2 border border-[#161d28]">
              <span className="text-[10px] text-gray-500 block">ESTIMATED SECTOR 3</span>
              <span className="font-bold text-yellow-400">{result.sector_splits.sector_3.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
