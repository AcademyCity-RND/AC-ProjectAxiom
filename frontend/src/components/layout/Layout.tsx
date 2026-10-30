import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#090D16] text-slate-100 font-sans antialiased">
      <Header
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        {/* Main Workspace Canvas with generous padding (> 25% whitespace ratio) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {children}
        </main>
      </div>
    </div>
  );
};
