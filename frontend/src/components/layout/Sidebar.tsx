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
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen = false,
  onCloseMobile,
}) => {
  // Max 5 core modules as mandated by DESIGN.md Section 5
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Compass, badge: 'Aktif' },
    { id: 'narrative', label: 'Narrative Monitor', icon: Radio },
    { id: 'network', label: 'Network Graph', icon: Share2 },
    { id: 'targets', label: 'Target Directory', icon: Users },
    { id: 'reports', label: 'Case Reports', icon: FileCheck2 },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-[230px] border-r border-slate-800/80 bg-[#0A0E17] flex flex-col justify-between shrink-0 select-none transition-all duration-200 ease-out z-40 ${
          isMobileMenuOpen
            ? 'fixed inset-y-0 left-0 shadow-2xl translate-x-0'
            : '-translate-x-full md:translate-x-0 md:relative hidden md:flex'
        }`}
      >
        {/* Navigation Modules (Clean, max 5 items per Linear standard) */}
        <div className="p-3 space-y-5 overflow-y-auto">
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2.5 mb-2 font-mono">
              MODUL UTAMA
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-mono bg-sky-500/10 text-sky-400 border border-sky-500/25">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Platform Ingestion Feed Status */}
          <div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2.5 mb-2 font-mono">
              INGESTION FEED
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-md p-2.5 space-y-2 text-xs shadow-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span> X (Twitter)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium shrink-0">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span> YouTube
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium shrink-0">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 font-mono text-[11px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span> Instagram
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium shrink-0">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info: Engine Status */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0A0E17]/60 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 truncate">
              XGBoost &bull; Chroma &bull; Llama
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
