import React from 'react';
import {
  Compass,
  Radio,
  Share2,
  Users,
  FileCheck2,
  Cpu,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  // Max 5 core modules as mandated by DESIGN.md Section 5
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: 'Aktif' },
    { id: 'narrative', label: 'Narrative Monitor', icon: Radio },
    { id: 'network', label: 'Network Graph', icon: Share2 },
    { id: 'targets', label: 'Target Directory', icon: Users },
    { id: 'reports', label: 'Case Reports', icon: FileCheck2 },
  ];

  return (
    <aside className="w-[220px] border-r border-[#1E293B] bg-[#090D16] flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Modules (Clean, max 5 items) */}
      <div className="p-3 space-y-5">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#64748B] px-2.5 mb-2">
            MODUL UTAMA
          </div>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-[13px] font-medium transition-colors duration-120 ${
                    isActive
                      ? 'bg-[#1E293B] text-sky-400 border border-sky-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Platform Status Summary (Subtle, zero clutter) */}
        <div>
          <div className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#64748B] px-2.5 mb-2">
            INGESTION FEED
          </div>
          <div className="bg-[#0F172A] border border-[#1E293B] rounded p-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> X (Twitter)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Ready</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> YouTube
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Ready</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Instagram
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info: Engine Status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#090D16]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] font-mono text-slate-300 truncate">
            XGBoost &bull; Chroma &bull; Llama
          </span>
        </div>
      </div>
    </aside>
  );
};
