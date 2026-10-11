import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface CircuitMapProps {
  trackName: string;
  activeDistancePct?: number; // 0 to 100
}

export const CircuitMap: React.FC<CircuitMapProps> = ({ trackName, activeDistancePct = 40 }) => {
  const isMonza = trackName.toLowerCase().includes('monza');

  return (
    <div className="f1-panel p-3 flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between pb-2 border-b border-[#1a212d]">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-red-500" />
          <span className="font-mono text-xs font-bold text-gray-200 uppercase tracking-wider">
            {isMonza ? 'AUTODROMO NAZIONALE MONZA' : 'CIRCUIT VECTOR MAP'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">5.793 KM // HIGH DOWNSPEED</span>
      </div>

      {/* SVG Map of Monza */}
      <div className="relative py-2 flex items-center justify-center">
        <svg
          viewBox="0 0 400 220"
          className="w-full h-44 drop-shadow-[0_0_10px_rgba(225,6,0,0.15)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Sector Backdrops */}
          <path
            d="M 50 180 L 190 180 Q 220 180 230 160 L 250 110"
            stroke="#9333ea"
            strokeWidth="3.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          <path
            d="M 250 110 L 280 60 Q 300 35 340 40 Q 370 45 365 75 L 340 130"
            stroke="#06b6d4"
            strokeWidth="3.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />
          <path
            d="M 340 130 L 270 170 Q 240 190 200 190 L 90 190 Q 50 190 50 180 Z"
            stroke="#eab308"
            strokeWidth="3.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
          />

          {/* Main Track Trace Line */}
          <path
            d="M 50 180 L 190 180 Q 220 180 230 160 L 250 110 Q 260 85 280 60 Q 300 35 340 40 Q 370 45 365 75 L 340 130 Q 320 160 270 170 Q 240 190 200 190 L 90 190 Q 50 190 50 180 Z"
            stroke="#374151"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 50 180 L 190 180 Q 220 180 230 160 L 250 110 Q 260 85 280 60 Q 300 35 340 40 Q 370 45 365 75 L 340 130 Q 320 160 270 170 Q 240 190 200 190 L 90 190 Q 50 190 50 180 Z"
            stroke="#e10600"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start / Finish Line */}
          <line x1="80" y1="172" x2="80" y2="188" stroke="#ffffff" strokeWidth="3" />
          <text x="83" y="176" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold">S/F</text>

          {/* Corner Callout Markers */}
          <circle cx="215" cy="172" r="3" fill="#ff1744" />
          <text x="210" y="164" fill="#9ca3af" fontSize="7" fontFamily="monospace">T1-2 RETTIFILO</text>

          <circle cx="250" cy="110" r="3" fill="#ff9100" />
          <text x="255" y="108" fill="#9ca3af" fontSize="7" fontFamily="monospace">CURVA GRANDE</text>

          <circle cx="340" cy="40" r="3" fill="#ff1744" />
          <text x="290" y="32" fill="#9ca3af" fontSize="7" fontFamily="monospace">T4-5 ROGGIA</text>

          <circle cx="365" cy="75" r="3" fill="#00e5ff" />
          <text x="340" y="88" fill="#9ca3af" fontSize="7" fontFamily="monospace">LESMO 1 & 2</text>

          <circle cx="270" cy="170" r="3" fill="#ff1744" />
          <text x="275" y="162" fill="#9ca3af" fontSize="7" fontFamily="monospace">ASCARI CHICANE</text>

          <circle cx="140" cy="190" r="3" fill="#00e5ff" />
          <text x="125" y="202" fill="#9ca3af" fontSize="7" fontFamily="monospace">CURVA PARABOLICA</text>

          {/* Telemetry Car Tracker Cursor */}
          <circle cx="230" cy="160" r="5" fill="#e10600" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
        </svg>
      </div>

      {/* Sector Legend */}
      <div className="pt-2 border-t border-[#1a212d] grid grid-cols-3 gap-1 font-mono text-[10px]">
        <div className="flex items-center gap-1.5 bg-[#121620] px-2 py-1 border border-[#1b2331]">
          <span className="w-2 h-2 bg-purple-500 rounded-none"></span>
          <span className="text-gray-400">SEC 1:</span>
          <span className="text-gray-200 font-bold">26.3s</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#121620] px-2 py-1 border border-[#1b2331]">
          <span className="w-2 h-2 bg-cyan-400 rounded-none"></span>
          <span className="text-gray-400">SEC 2:</span>
          <span className="text-gray-200 font-bold">27.1s</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#121620] px-2 py-1 border border-[#1b2331]">
          <span className="w-2 h-2 bg-yellow-400 rounded-none"></span>
          <span className="text-gray-400">SEC 3:</span>
          <span className="text-gray-200 font-bold">31.4s</span>
        </div>
      </div>
    </div>
  );
};
