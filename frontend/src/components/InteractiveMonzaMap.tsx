import React, { useState } from 'react';
import { SegmentComparisonResult } from '../types';
import { Compass, Zap, X, MapPin } from 'lucide-react';

interface InteractiveMonzaMapProps {
  segments: SegmentComparisonResult[];
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string | null) => void;
  driver1Code: string;
  driver1Color: string;
  driver2Code: string;
  driver2Color: string;
}

// Highly accurate Monza coordinates matching official FIA layout (ViewBox: 0 0 1000 600)
// Layout:
// - S1: Bottom main straight going left-to-right (from Parabolica exit towards T1)
// - C1: T1 & T2 Rettifilo Chicane at bottom left / center
// - S2: Curva Grande sweep curving upwards into sector 2
// - C2: T4 & T5 Roggia Chicane
// - S3: Short straight towards Lesmo
// - C3: T6 & T7 Lesmo 1 & Lesmo 2 at the top-left loop
// - S4: Curva del Serraglio long back straight heading diagonally down-right to Ascari
// - C4: T8, T9, T10 Variante Ascari chicane in the middle
// - S5: Long back straight to Parabolica (bottom right)
// - C5: Turn 11 iconic Curva Parabolica (Alboreto) sweeping 180 deg right loop
// - S6: Pit straight finish line
const ACCURATE_MONZA_SEGMENTS: Record<string, {
  path: string;
  pinX: number;
  pinY: number;
  label: string;
  turnNum?: string;
}> = {
  // S1: Main straight across start/finish (x: 480 to 220, y: 470)
  S1: {
    path: 'M 780 470 L 415 470',
    pinX: 580,
    pinY: 495,
    label: 'Main Straight (Rettifilo)'
  },
  // C1: Variante del Rettifilo (T1 - T2 tight right-left chicane)
  C1: {
    path: 'M 415 470 L 398 470 L 390 445 L 406 430 L 395 410',
    pinX: 400,
    pinY: 395,
    label: 'Variante del Rettifilo',
    turnNum: '01-02'
  },
  // S2: Curva Grande (T3 high-speed wide left sweep)
  S2: {
    path: 'M 395 410 Q 370 380 280 425 Q 215 460 170 420 Q 145 390 150 330',
    pinX: 200,
    pinY: 460,
    label: 'Curva Grande (T3)',
    turnNum: '03'
  },
  // C2: Variante della Roggia (T4 - T5 chicane)
  C2: {
    path: 'M 150 330 L 160 270 L 140 260 L 150 220',
    pinX: 125,
    pinY: 260,
    label: 'Variante della Roggia',
    turnNum: '04-05'
  },
  // S3: Lesmo approach straight
  S3: {
    path: 'M 150 220 L 115 120',
    pinX: 110,
    pinY: 175,
    label: 'Lesmo Approach'
  },
  // C3: Curva di Lesmo 1 (T6) & Lesmo 2 (T7) - Top-left iconic double right
  C3: {
    path: 'M 115 120 Q 100 80 140 75 L 210 80 Q 235 85 245 115',
    pinX: 190,
    pinY: 55,
    label: 'Curva di Lesmo 1 & 2',
    turnNum: '06-07'
  },
  // S4: Curva del Serraglio long diagonal straight through DRS detection 1
  S4: {
    path: 'M 245 115 L 430 330',
    pinX: 350,
    pinY: 210,
    label: 'Curva del Serraglio Straight'
  },
  // C4: Variante Ascari (T8, T9, T10 high-speed chicane)
  C4: {
    path: 'M 430 330 Q 450 355 470 340 Q 495 325 515 350 L 530 365',
    pinX: 475,
    pinY: 375,
    label: 'Variante Ascari',
    turnNum: '08-10'
  },
  // S5: Long back straight to Parabolica (from Ascari exit towards Turn 11)
  S5: {
    path: 'M 530 365 L 860 365',
    pinX: 700,
    pinY: 345,
    label: 'Back Straight'
  },
  // C5: Curva Parabolica (Turn 11 - Curva Alboreto) wide 180° loop
  C5: {
    path: 'M 860 365 Q 920 370 920 425 Q 910 470 850 470',
    pinX: 935,
    pinY: 420,
    label: 'Curva Parabolica (Alboreto)',
    turnNum: '11'
  },
  // S6: Exit straight to start/finish line
  S6: {
    path: 'M 850 470 L 780 470',
    pinX: 810,
    pinY: 495,
    label: 'Parabolica Exit'
  }
};

export const InteractiveMonzaMap: React.FC<InteractiveMonzaMapProps> = ({
  segments,
  selectedSegmentId,
  onSelectSegment,
  driver1Code,
  driver1Color,
  driver2Code,
  driver2Color,
}) => {
  const activeSegmentData = segments.find((s) => s.segment_id === selectedSegmentId) || null;

  return (
    <div className="f1-panel p-4 flex flex-col h-full select-none bg-[#0a0d14] border border-[#1b2333] relative">
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#18202d] gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-red-500" />
          <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
            AUTODROMO NAZIONALE MONZA // SECTOR ADVANTAGE MAP
          </span>
        </div>

        {/* Driver Color Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121824] border border-[#1e2738]">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: driver1Color }}
            />
            <span className="text-gray-200 font-semibold">{driver1Code} Advantage</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121824] border border-[#1e2738]">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
              style={{ backgroundColor: driver2Color }}
            />
            <span className="text-gray-200 font-semibold">{driver2Code} Advantage</span>
          </div>
        </div>
      </div>

      {/* High Precision SVG Track Vector */}
      <div className="relative py-4 flex-1 flex items-center justify-center min-h-[360px]">
        <svg
          viewBox="50 30 920 500"
          className="w-full h-auto max-h-[460px] drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Circuit Asphalt Shadow Foundation */}
          <path
            d="M 780 470 L 415 470 L 398 470 L 390 445 L 406 430 L 395 410 Q 370 380 280 425 Q 215 460 170 420 Q 145 390 150 330 L 160 270 L 140 260 L 150 220 L 115 120 Q 100 80 140 75 L 210 80 Q 235 85 245 115 L 430 330 Q 450 355 470 340 Q 495 325 515 350 L 530 365 L 860 365 Q 920 370 920 425 Q 910 470 850 470 Z"
            stroke="#161c28"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Segments */}
          {segments.map((seg) => {
            const config = ACCURATE_MONZA_SEGMENTS[seg.segment_id];
            if (!config) return null;

            const isSelected = selectedSegmentId === seg.segment_id;
            const strokeColor = seg.winner_color || '#4b5563';

            return (
              <g
                key={seg.segment_id}
                className="cursor-pointer group"
                onClick={() => onSelectSegment(isSelected ? null : seg.segment_id)}
              >
                {/* Glow outline on selection or hover */}
                {isSelected && (
                  <path
                    d={config.path}
                    stroke={strokeColor}
                    strokeWidth="28"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                )}

                {/* Road surface */}
                <path
                  d={config.path}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '12' : '9'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-200 group-hover:brightness-125"
                />

                {/* Turn Number Tag Badge */}
                {config.turnNum && (
                  <g className="transition-transform duration-200 group-hover:scale-110">
                    <circle
                      cx={config.pinX}
                      cy={config.pinY}
                      r={isSelected ? '14' : '12'}
                      fill="#0b0e14"
                      stroke={strokeColor}
                      strokeWidth="2"
                    />
                    <text
                      x={config.pinX}
                      y={config.pinY + 4}
                      fill="#ffffff"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {config.turnNum}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Start/Finish Line with Checkered Flag Symbol */}
          <line x1="720" y1="456" x2="720" y2="484" stroke="#ffffff" strokeWidth="4" />
          <text x="715" y="446" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold">S/F 🏁</text>

          {/* Corner Names Annotation on Track */}
          <text x="415" y="495" fill="#9ca3af" fontSize="11" fontFamily="monospace">RETTIFILO</text>
          <text x="210" y="475" fill="#9ca3af" fontSize="11" fontFamily="monospace">CURVA GRANDE</text>
          <text x="145" y="275" fill="#9ca3af" fontSize="11" fontFamily="monospace">ROGGIA</text>
          <text x="175" y="40" fill="#9ca3af" fontSize="11" fontFamily="monospace">LESMO 1 & 2</text>
          <text x="360" y="235" fill="#9ca3af" fontSize="11" fontFamily="monospace">SERRAGLIO</text>
          <text x="470" y="395" fill="#9ca3af" fontSize="11" fontFamily="monospace">ASCARI</text>
          <text x="830" y="345" fill="#9ca3af" fontSize="11" fontFamily="monospace">PARABOLICA</text>
        </svg>

        {/* Segment Info Box (Appears ONLY on Click, can be closed) */}
        {activeSegmentData && (
          <div className="absolute top-4 right-4 w-84 max-w-[90vw] bg-[#0e131d]/95 backdrop-blur-md p-4 rounded-xl border border-[#232d3f] shadow-2xl font-mono text-xs z-20 animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1c2637] mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">
                  {activeSegmentData.segment_name}
                </span>
              </div>
              <button
                onClick={() => onSelectSegment(null)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1a2333] transition-colors"
                title="Close Info"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Winner Badge */}
            <div className="mb-3">
              <span
                className="inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: `${activeSegmentData.winner_color}25`,
                  color: activeSegmentData.winner_color,
                  border: `1px solid ${activeSegmentData.winner_color}50`
                }}
              >
                {activeSegmentData.winner} HOLDS ADVANTAGE
              </span>
            </div>

            {/* Speeds Side-by-Side */}
            <div className="grid grid-cols-2 gap-3 bg-[#080b10] p-2.5 rounded-lg border border-[#161d2a] mb-3">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">
                  {activeSegmentData.type === 'corner' ? 'Apex Velocity' : 'Peak Velocity'}
                </span>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold" style={{ color: driver1Color }}>{driver1Code}:</span>
                    <span className="font-bold text-white">{activeSegmentData.d1_speed} km/h</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold" style={{ color: driver2Color }}>{driver2Code}:</span>
                    <span className="font-bold text-white">{activeSegmentData.d2_speed} km/h</span>
                  </div>
                </div>
              </div>

              <div className="border-l border-[#192233] pl-3">
                <span className="text-gray-400 block text-[10px] uppercase">Delta / Time Gain</span>
                <span className="font-extrabold text-white text-base mt-0.5 block">
                  {activeSegmentData.delta_speed > 0 ? `+${activeSegmentData.delta_speed}` : activeSegmentData.delta_speed} km/h
                </span>
                <span className="text-xs text-emerald-400 font-bold block mt-0.5">
                  Est. Gain: {activeSegmentData.time_delta_gain > 0 ? `+${activeSegmentData.time_delta_gain}` : activeSegmentData.time_delta_gain}s
                </span>
              </div>
            </div>

            {/* Driving Dynamics */}
            {activeSegmentData.type === 'corner' ? (
              <div className="space-y-1.5 text-[11px] text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Braking Distance:</span>
                  <span>{activeSegmentData.d1_braking_m}m vs {activeSegmentData.d2_braking_m}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Corner Exit Speed:</span>
                  <span>{activeSegmentData.d1_exit_speed} km/h vs {activeSegmentData.d2_exit_speed} km/h</span>
                </div>
                {activeSegmentData.d1_style && (
                  <div className="flex justify-between pt-1 border-t border-[#1a2333]">
                    <span className="text-gray-400">ML Corner Profile:</span>
                    <span className="text-cyan-300 font-semibold">{activeSegmentData.d1_style}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-gray-300 flex justify-between">
                <span className="text-gray-400">Throttle Commitment:</span>
                <span className="text-emerald-400 font-semibold">100% WOT Section</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#18202d] flex items-center justify-between text-[10px] font-mono text-gray-400">
        <span>Click any turn or straight path to open telemetry metrics</span>
        <span className="text-red-400 font-semibold">CIRCUIT LENGTH: 5.793 KM</span>
      </div>
    </div>
  );
};
