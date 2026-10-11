import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Timer,
  Sliders,
  Users,
  GitBranch,
  BarChart3,
  Cpu,
} from 'lucide-react';

export type ViewTab =
  | 'overview'
  | 'telemetry'
  | 'lap-analysis'
  | 'simulator'
  | 'driver-compare'
  | 'features'
  | 'models';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const NAV_ITEMS: Array<{ id: ViewTab; label: string; icon: React.FC<{ className?: string }>; code: string }> = [
  { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard, code: '01' },
  { id: 'telemetry', label: 'TELEMETRY', icon: Activity, code: '02' },
  { id: 'lap-analysis', label: 'LAP ANALYSIS', icon: Timer, code: '03' },
  { id: 'simulator', label: 'SIMULATOR', icon: Sliders, code: '04' },
  { id: 'driver-compare', label: 'DRIVER COMPARE', icon: Users, code: '05' },
  { id: 'features', label: 'FEATURE ANALYSIS', icon: GitBranch, code: '06' },
  { id: 'models', label: 'MODEL RESULTS', icon: BarChart3, code: '07' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-56 bg-[#090b0f] border-r border-[#1a212d] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-3.5 border-b border-[#1a212d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-none shadow-[0_0_8px_#e10600]"></span>
            <span className="font-mono text-xs font-black tracking-widest text-white uppercase">
              F1 ENGINEERING
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-500">v1.2</span>
        </div>

        {/* System Subtitle */}
        <div className="px-3.5 py-2 border-b border-[#141a24] bg-[#0c0e14]">
          <span className="text-[9px] font-mono tracking-wider uppercase text-gray-500 block">
            WORKSTATION // TELEMETRY
          </span>
          <span className="text-[11px] font-mono font-bold text-gray-300">
            ACTIVE STINT ANALYZER
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-1.5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs font-mono font-bold transition-all relative ${
                  isActive
                    ? 'bg-[#151a24] text-white border-l-2 border-red-600'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#0f131a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-gray-500'}`} />
                  <span className="tracking-wider">{item.label}</span>
                </div>
                <span className={`text-[10px] ${isActive ? 'text-red-400 font-bold' : 'text-gray-600'}`}>
                  {item.code}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-[#1a212d] bg-[#090b10] text-[10px] font-mono text-gray-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>FASTF1 ENGINE</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SAMPLE RATE</span>
          <span className="text-gray-300">100 HZ CACHED</span>
        </div>
        <div className="flex items-center justify-between">
          <span>TELEMETRY STREAM</span>
          <span className="text-cyan-400 font-bold">SYNCED</span>
        </div>
      </div>
    </aside>
  );
};
