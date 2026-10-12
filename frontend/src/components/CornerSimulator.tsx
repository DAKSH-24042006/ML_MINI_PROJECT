import React, { useState, useEffect } from 'react';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  Trophy,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Compass,
  Zap,
  Gauge,
  Target,
  BarChart2,
  CheckCircle2
} from 'lucide-react';
import { predictCornerLap } from '../services/api';
import { CornerPredictResponse } from '../types';

export const CornerSimulator: React.FC = () => {
  // Realistic corner apex speeds bound to physical grip limits (km/h)
  const [c1Apex, setC1Apex] = useState<number>(75.5); // T1-T2 Rettifilo Chicane
  const [c2Apex, setC2Apex] = useState<number>(118.5); // T4-T5 Roggia Chicane
  const [c3Apex, setC3Apex] = useState<number>(168.5); // T6-T7 Lesmo
  const [c4Apex, setC4Apex] = useState<number>(196.5); // T8-T10 Ascari Chicane
  const [c5Apex, setC5Apex] = useState<number>(218.5); // T11 Parabolica

  // Realistic straight top speeds bound to aero drag and ERS deployment (km/h)
  const [s1Top, setS1Top] = useState<number>(352.0); // Rettifilo Main Straight
  const [s2Top, setS2Top] = useState<number>(312.0); // Curva Grande Straight
  const [s3Top, setS3Top] = useState<number>(272.0); // Lesmo Approach Straight
  const [s4Top, setS4Top] = useState<number>(338.0); // Serraglio Straight
  const [s5Top, setS5Top] = useState<number>(346.0); // Back straight to Parabolica
  const [s6Top, setS6Top] = useState<number>(332.0); // Pit Straight Entry

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<CornerPredictResponse | null>(null);
  const [activePreset, setActivePreset] = useState<string>('custom');

  // Trigger prediction whenever parameters update
  const runPrediction = async (overrides?: Record<string, number>) => {
    setLoading(true);
    try {
      const payload = {
        c1_apex: overrides?.c1_apex ?? c1Apex,
        c2_apex: overrides?.c2_apex ?? c2Apex,
        c3_apex: overrides?.c3_apex ?? c3Apex,
        c4_apex: overrides?.c4_apex ?? c4Apex,
        c5_apex: overrides?.c5_apex ?? c5Apex,
        s1_top: overrides?.s1_top ?? s1Top,
        s2_top: overrides?.s2_top ?? s2Top,
        s3_top: overrides?.s3_top ?? s3Top,
        s4_top: overrides?.s4_top ?? s4Top,
        s5_top: overrides?.s5_top ?? s5Top,
        s6_top: overrides?.s6_top ?? s6Top,
      };
      const res = await predictCornerLap(payload);
      setPrediction(res);
    } catch (err) {
      console.error('Failed to run corner prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [c1Apex, c2Apex, c3Apex, c4Apex, c5Apex, s1Top, s2Top, s3Top, s4Top, s5Top, s6Top]);

  const handleApplyPreset = (preset: 'pole' | 'late_braker' | 'low_drag' | 'high_downforce') => {
    setActivePreset(preset);
    if (preset === 'pole') {
      setC1Apex(76.2);
      setC2Apex(119.5);
      setC3Apex(169.5);
      setC4Apex(198.0);
      setC5Apex(219.8);
      setS1Top(354.8);
      setS2Top(314.5);
      setS3Top(272.0);
      setS4Top(341.0);
      setS5Top(349.5);
      setS6Top(334.0);
    } else if (preset === 'late_braker') {
      setC1Apex(81.5);
      setC2Apex(124.5);
      setC3Apex(173.0);
      setC4Apex(202.0);
      setC5Apex(221.5);
      setS1Top(350.0);
      setS2Top(310.0);
      setS3Top(270.0);
      setS4Top(337.0);
      setS5Top(344.0);
      setS6Top(330.0);
    } else if (preset === 'low_drag') {
      setC1Apex(73.5);
      setC2Apex(116.0);
      setC3Apex(166.5);
      setC4Apex(194.0);
      setC5Apex(216.0);
      setS1Top(359.5);
      setS2Top(318.0);
      setS3Top(275.5);
      setS4Top(346.0);
      setS5Top(353.5);
      setS6Top(338.0);
    } else if (preset === 'high_downforce') {
      setC1Apex(82.5);
      setC2Apex(125.0);
      setC3Apex(174.5);
      setC4Apex(204.0);
      setC5Apex(224.5);
      setS1Top(346.0);
      setS2Top(306.0);
      setS3Top(268.0);
      setS4Top(332.0);
      setS5Top(340.0);
      setS6Top(326.0);
    }
  };

  const handleResetToBaseline = () => {
    setActivePreset('custom');
    setC1Apex(75.5);
    setC2Apex(118.5);
    setC3Apex(168.5);
    setC4Apex(196.5);
    setC5Apex(218.5);
    setS1Top(352.0);
    setS2Top(312.0);
    setS3Top(272.0);
    setS4Top(338.0);
    setS5Top(346.0);
    setS6Top(332.0);
  };

  const onSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    setActivePreset('custom');
    setter(val);
  };

  // Corner definitions with benchmarks
  const CORNERS = [
    {
      id: 'c1',
      title: 'T1–T2 VARIANTE DEL RETTIFILO',
      sub: 'Low-speed chicane // 350+ km/h heavy braking zone',
      val: c1Apex,
      setVal: (v: number) => onSliderChange(setC1Apex, v),
      min: 65.0,
      max: 88.0,
      pole: 76.2,
      gear: '2nd Gear',
      gForce: '4.8G Decel',
    },
    {
      id: 'c2',
      title: 'T4–T5 VARIANTE DELLA ROGGIA',
      sub: 'Curb-hopping chicane // Technical direction change',
      val: c2Apex,
      setVal: (v: number) => onSliderChange(setC2Apex, v),
      min: 105.0,
      max: 135.0,
      pole: 119.5,
      gear: '3rd Gear',
      gForce: '3.6G Lateral',
    },
    {
      id: 'c3',
      title: 'T6–T7 CURVA DI LESMO (1 & 2)',
      sub: 'Medium-speed right-handers // Downforce dependent',
      val: c3Apex,
      setVal: (v: number) => onSliderChange(setC3Apex, v),
      min: 150.0,
      max: 185.0,
      pole: 169.5,
      gear: '5th Gear',
      gForce: '3.9G Lateral',
    },
    {
      id: 'c4',
      title: 'T8–T10 VARIANTE ASCARI',
      sub: 'High-speed complex // High aerodynamic commitment',
      val: c4Apex,
      setVal: (v: number) => onSliderChange(setC4Apex, v),
      min: 180.0,
      max: 215.0,
      pole: 198.0,
      gear: '6th Gear',
      gForce: '4.2G Lateral',
    },
    {
      id: 'c5',
      title: 'T11 CURVA PARABOLICA (ALBORETO)',
      sub: 'Long sweeping radius onto main rettifilo straight',
      val: c5Apex,
      setVal: (v: number) => onSliderChange(setC5Apex, v),
      min: 200.0,
      max: 235.0,
      pole: 219.8,
      gear: '6th Gear',
      gForce: '4.5G Lateral',
    },
  ];

  // Straight definitions with benchmarks
  const STRAIGHTS = [
    {
      id: 's1',
      title: 'MAIN RETTIFILO STRAIGHT (S1)',
      sub: 'Primary DRS speed trap // Start/finish run to Turn 1',
      val: s1Top,
      setVal: (v: number) => onSliderChange(setS1Top, v),
      min: 335.0,
      max: 368.0,
      pole: 354.8,
      gear: '8th Gear',
    },
    {
      id: 's2',
      title: 'CURVA GRANDE FULL THROTTLE (S2)',
      sub: 'Curva Biassono flat-out acceleration sweep',
      val: s2Top,
      setVal: (v: number) => onSliderChange(setS2Top, v),
      min: 295.0,
      max: 330.0,
      pole: 314.5,
      gear: '7th Gear',
    },
    {
      id: 's3',
      title: 'LESMO APPROACH STRAIGHT (S3)',
      sub: 'Short burst between Roggia exit and Lesmo 1 entry',
      val: s3Top,
      setVal: (v: number) => onSliderChange(setS3Top, v),
      min: 255.0,
      max: 290.0,
      pole: 272.0,
      gear: '6th Gear',
    },
    {
      id: 's4',
      title: 'CURVA DEL SERRAGLIO STRAIGHT (S4)',
      sub: 'Under the bridge drag run leading into Ascari braking',
      val: s4Top,
      setVal: (v: number) => onSliderChange(setS4Top, v),
      min: 325.0,
      max: 355.0,
      pole: 341.0,
      gear: '8th Gear',
    },
    {
      id: 's5',
      title: 'BACK STRAIGHT TO PARABOLICA (S5)',
      sub: 'Long second DRS deployment zone before Alboreto',
      val: s5Top,
      setVal: (v: number) => onSliderChange(setS5Top, v),
      min: 330.0,
      max: 362.0,
      pole: 349.5,
      gear: '8th Gear',
    },
    {
      id: 's6',
      title: 'PIT STRAIGHT LAUNCH (S6)',
      sub: 'Parabolica exit carry-through to start line',
      val: s6Top,
      setVal: (v: number) => onSliderChange(setS6Top, v),
      min: 315.0,
      max: 350.0,
      pole: 332.0,
      gear: '7th Gear',
    },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. TOP HEADER & QUICK PRESETS */}
      <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#18202d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  AUTODROMO DI MONZA // CORNER & STRAIGHT TELEMETRY SIMULATOR
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#131924] text-cyan-400 border border-[#1f2a3a] font-bold">
                  AUTONOMOUS ML ENGINE
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Tune apex minimum cornering velocities and straight top speeds. The ensemble model (Linear Regression, SVR, Decision Tree) dynamically predicts lap times against Carlos Sainz's 2023 Pole Benchmark (84.444s).
              </p>
            </div>
          </div>

          {/* Presets & Reset */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-500 text-[10px] mr-1">SETUP PRESETS:</span>
            <button
              onClick={() => handleApplyPreset('pole')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                activePreset === 'pole'
                  ? 'bg-red-600 text-white border-red-500 shadow-lg'
                  : 'bg-[#121824] text-gray-300 hover:text-white border-[#1e2738]'
              }`}
            >
              🏆 POLE BENCHMARK
            </button>
            <button
              onClick={() => handleApplyPreset('late_braker')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                activePreset === 'late_braker'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-lg'
                  : 'bg-[#121824] text-gray-300 hover:text-white border-[#1e2738]'
              }`}
            >
              ⚡ LATE BRAKER
            </button>
            <button
              onClick={() => handleApplyPreset('high_downforce')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                activePreset === 'high_downforce'
                  ? 'bg-purple-600 text-white border-purple-500 shadow-lg'
                  : 'bg-[#121824] text-gray-300 hover:text-white border-[#1e2738]'
              }`}
            >
              🎯 HIGH DOWNFORCE
            </button>
            <button
              onClick={() => handleApplyPreset('low_drag')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                activePreset === 'low_drag'
                  ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg'
                  : 'bg-[#121824] text-gray-300 hover:text-white border-[#1e2738]'
              }`}
            >
              🚀 LOW DRAG MONZA
            </button>
            <button
              onClick={handleResetToBaseline}
              className="px-2.5 py-1.5 rounded bg-[#141b28] hover:bg-[#1e2738] text-gray-400 hover:text-white border border-[#232f42] text-xs font-bold transition-all ml-1 flex items-center gap-1"
              title="Reset all parameters to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC ML PREDICTION HERO DECK */}
        {prediction && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {/* Predicted Lap Time */}
            <div className="bg-[#0e131d] p-3.5 rounded-lg border border-[#1c2638] relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  PREDICTED LAP TIME
                </span>
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-white">
                  {prediction.predicted_lap_time.toFixed(3)}s
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-2">
                <span>SVR: {prediction.svr_pred}s</span>
                <span>•</span>
                <span>OLS: {prediction.linear_regression_pred}s</span>
              </div>
            </div>

            {/* Delta vs Pole */}
            <div
              className={`p-3.5 rounded-lg border relative overflow-hidden ${
                prediction.is_faster_than_pole
                  ? 'bg-emerald-950/20 border-emerald-800/60'
                  : 'bg-rose-950/20 border-rose-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  DELTA VS MONZA POLE
                </span>
                {prediction.is_faster_than_pole ? (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-black ${
                    prediction.is_faster_than_pole ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {prediction.delta_vs_pole > 0 ? `+${prediction.delta_vs_pole.toFixed(3)}` : prediction.delta_vs_pole.toFixed(3)}s
                </span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {prediction.is_faster_than_pole
                  ? '▲ Faster than Carlos Sainz 1:20.444 Pole'
                  : '▼ Trailing Carlos Sainz 1:20.444 Pole'}
              </div>
            </div>

            {/* Driving Profile */}
            <div className="bg-[#0e131d] p-3.5 rounded-lg border border-[#1c2638] relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  DRIVING PROFILE
                </span>
                <Activity className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="mt-1">
                <span className="text-sm font-black text-purple-300 block truncate">
                  {prediction.driving_style}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1.5">
                Clustered via K-Means Unsupervised Cornering Vectors
              </div>
            </div>

            {/* Critical Sector */}
            <div className="bg-[#0e131d] p-3.5 rounded-lg border border-[#1c2638] relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  CRITICAL SENSITIVITY SECTOR
                </span>
                <Target className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-1">
                <span className="text-sm font-black text-amber-300 block truncate">
                  {prediction.feature_importances[0]?.label || 'T1-T2 Chicane Apex'}
                </span>
              </div>
              <div className="text-[10px] text-amber-400/80 mt-1.5 font-bold">
                Impact Weight: {prediction.feature_importances[0]?.importance_pct || 28.5}% Gini Split
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CORNER APEX SPEEDS WORKBENCH (5 KEY CHICANES & TURNS) */}
      <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#18202d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-none shadow-[0_0_8px_#00f0ff]"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              CORNER APEX VELOCITIES // MINIMUM CORNERING APEX SPEED (KM/H)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-sans">
            Governs trail-braking compression and mechanical/aero lateral grip limits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORNERS.map((c) => {
            const deltaFromPole = c.val - c.pole;
            return (
              <div key={c.id} className="bg-[#0e131d] p-3 rounded-lg border border-[#1c2638] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div>
                      <span className="text-xs font-bold text-white block">{c.title}</span>
                      <span className="text-[10px] text-gray-400 block font-sans">{c.sub}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141b27] text-cyan-300 font-bold border border-[#202b3d] shrink-0">
                      {c.gear}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5 mb-1">
                    <span className="text-lg font-black text-cyan-400">{c.val.toFixed(1)} km/h</span>
                    <div className="text-[10px] text-right">
                      <span className="text-gray-500">Pole: {c.pole} km/h </span>
                      <span className={deltaFromPole >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        ({deltaFromPole >= 0 ? `+${deltaFromPole.toFixed(1)}` : deltaFromPole.toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={c.min}
                    max={c.max}
                    step="0.5"
                    value={c.val}
                    onChange={(e) => c.setVal(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-[9px] text-gray-500 mt-1 pt-1 border-t border-[#161f2c]">
                  <span>{c.min} km/h (Conservative)</span>
                  <span>{c.gForce}</span>
                  <span>{c.max} km/h (Aggressive)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. STRAIGHT TOP SPEEDS WORKBENCH (6 FULL THROTTLE SPEED TRAPS) */}
      <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333]">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#18202d]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-none shadow-[0_0_8px_#ff2040]"></span>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              STRAIGHT TOP SPEEDS // TRAP VELOCITIES & DRS EFFICIENCY (KM/H)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-sans">
            Governs low-drag aerodynamic wing angle and ERS hybrid power deployment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRAIGHTS.map((s) => {
            const deltaFromPole = s.val - s.pole;
            return (
              <div key={s.id} className="bg-[#0e131d] p-3 rounded-lg border border-[#1c2638] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div>
                      <span className="text-xs font-bold text-white block">{s.title}</span>
                      <span className="text-[10px] text-gray-400 block font-sans">{s.sub}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141b27] text-red-300 font-bold border border-[#202b3d] shrink-0">
                      {s.gear}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2.5 mb-1">
                    <span className="text-lg font-black text-red-400">{s.val.toFixed(1)} km/h</span>
                    <div className="text-[10px] text-right">
                      <span className="text-gray-500">Pole: {s.pole} km/h </span>
                      <span className={deltaFromPole >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        ({deltaFromPole >= 0 ? `+${deltaFromPole.toFixed(1)}` : deltaFromPole.toFixed(1)})
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step="0.5"
                    value={s.val}
                    onChange={(e) => s.setVal(parseFloat(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between text-[9px] text-gray-500 mt-1 pt-1 border-t border-[#161f2c]">
                  <span>{s.min} km/h (High Aero Drag)</span>
                  <span>{s.max} km/h (Monza Low Drag Spec)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTOR-BY-SECTOR FEATURE SENSITIVITY RANKING */}
      {prediction && prediction.feature_importances && (
        <div className="f1-panel p-4 bg-[#0a0d14] border border-[#1b2333]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#18202d]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                DECISION TREE SENSITIVITY // FEATURE WEIGHT ATTRIBUTION
              </h3>
            </div>
            <span className="text-[10px] text-gray-500">
              Mean Decrease in Impurity (MDI) across all Monza telemetry features
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {prediction.feature_importances.map((item, idx) => (
              <div
                key={item.feature}
                className="bg-[#0e131d] p-2.5 rounded border border-[#1c2638] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="text-[10px] text-gray-500 font-bold">#{idx + 1}</span>
                  <span className="text-gray-200 font-semibold truncate text-[11px]">{item.label}</span>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black ${
                      item.is_corner ? 'text-cyan-400' : 'text-red-400'
                    }`}
                  >
                    {item.importance_pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
