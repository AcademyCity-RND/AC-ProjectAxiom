import React from 'react';
import {
  Compass,
  Radio,
  Share2,
  Users,
  FileCheck2,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
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
        className={`border-r border-slate-800/80 bg-[#0A0E17] flex flex-col justify-between shrink-0 select-none transition-all duration-200 ease-out h-full overflow-hidden ${
          isCollapsed ? 'md:w-[64px]' : 'md:w-[220px]'
        } ${
          isMobileMenuOpen
            ? 'fixed inset-y-0 left-0 w-[240px] shadow-2xl translate-x-0 z-50'
            : '-translate-x-full md:translate-x-0 hidden md:flex'
        }`}
      >
        {/* Navigation Modules */}
        <div className="p-2.5 space-y-4 overflow-y-auto flex-1">
          <div>
            {!isCollapsed ? (
              <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2 mb-2 font-mono">
                MODUL UTAMA
              </div>
            ) : (
              <div className="h-2" />
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'
                    } rounded-md text-[13px] font-medium transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50 cursor-pointer ${
                      isActive
                        ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded font-mono bg-sky-500/10 text-sky-400 border border-sky-500/25 shrink-0">
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
            {!isCollapsed ? (
              <>
                <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-2 mb-2 font-mono">
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
              </>
            ) : (
              <div
                className="py-2 flex flex-col items-center gap-2 bg-slate-900/40 border border-slate-800/60 rounded-md"
                title="Feed Platform: X, YouTube, Instagram (All Online)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            )}
          </div>
        </div>

        {/* Footer: Sidebar Collapse Toggle + Engine Info */}
        <div className="p-2.5 border-t border-slate-800/80 bg-[#0A0E17]/80 shrink-0 space-y-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`hidden md:flex items-center ${
                isCollapsed ? 'justify-center w-full py-1.5' : 'justify-between w-full px-2 py-1.5'
              } text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors text-xs font-mono cursor-pointer`}
              title={isCollapsed ? 'Tampilkan Label Sidebar' : 'Sembunyikan Label Sidebar (Ikon Saja)'}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-sky-400 shrink-0" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                {!isCollapsed && <span className="text-[11px] text-slate-400 truncate">Kecilkan Sidebar</span>}
              </div>
            </button>
          )}

          <div
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} text-xs text-slate-400`}
            title="Engine: XGBoost • Chroma • Llama"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-slate-400 truncate">
                XGBoost &bull; Chroma &bull; Llama
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
