import React from 'react';
import { LayoutDashboard, Users, GraduationCap, Menu, Plus } from 'lucide-react';

interface MobileNavProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenSidebar: () => void;
  onQuickAddStudent: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onNavigate,
  onOpenSidebar,
  onQuickAddStudent
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 lg:hidden px-3 pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-4px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-full select-none">
      <div className="flex items-center justify-around h-13 max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all active:scale-90 ${
            currentView === 'dashboard' 
              ? 'text-emerald-700 font-bold scale-105' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-emerald-50 shadow-xs' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Beranda</span>
        </button>

        {/* Santri Aktif */}
        <button
          onClick={() => onNavigate('santri_aktif')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all active:scale-90 ${
            currentView === 'santri_aktif' 
              ? 'text-emerald-700 font-bold scale-105' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentView === 'santri_aktif' ? 'bg-emerald-50 shadow-xs' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Santri</span>
        </button>

        {/* Quick Add Floating 3D Button */}
        <button
          onClick={onQuickAddStudent}
          className="btn-3d btn-3d-emerald flex items-center justify-center w-12 h-12 rounded-2xl -mt-5 border-2 border-white shadow-[0_8px_16px_rgba(5,150,105,0.4)] active:scale-95"
          aria-label="Tambah Santri Baru"
        >
          <Plus className="w-6 h-6 text-white stroke-[2.5]" />
        </button>

        {/* Alumni */}
        <button
          onClick={() => onNavigate('alumni')}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all active:scale-90 ${
            currentView === 'alumni' 
              ? 'text-emerald-700 font-bold scale-105' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentView === 'alumni' ? 'bg-emerald-50 shadow-xs' : ''}`}>
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Alumni</span>
        </button>

        {/* Menu Drawer */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center w-14 h-full gap-1 text-slate-500 hover:text-slate-800 transition-all active:scale-90"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};
