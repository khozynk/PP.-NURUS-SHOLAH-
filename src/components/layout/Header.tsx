import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  LogOut, 
  User, 
  Database, 
  Check, 
  Sparkles,
  ChevronDown,
  Building2,
  Search,
  Box,
  Cloud
} from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { cloudSyncService, SyncState } from '../../services/cloudSync';
import { RoleBadge } from '../common/Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNavigate: (viewId: string) => void;
  onOpenMyProfile: () => void;
  onDataChange: () => void;
  onOpenGlobalSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigate,
  onOpenMyProfile,
  onDataChange,
  onOpenGlobalSearch
}) => {
  const currentUser = authService.getCurrentUser();
  const settings = dbService.getSettings();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getStatus());

  useEffect(() => {
    const unsub = cloudSyncService.subscribeStatus(setSyncState);
    return () => unsub();
  }, []);

  // Check if any demo data exists
  const hasDemoData = dbService.getStudents().some(s => s.is_demo);
  const recentLogs = dbService.getAuditLogs().slice(0, 5);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors active:scale-95"
            aria-label="Menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-emerald-300/60 bg-gradient-to-b from-white to-emerald-50 shrink-0 transform group-hover:scale-105 transition-transform" style={{ boxShadow: '0 3px 6px -1px rgba(16,185,129,0.3), inset 0 1px 0 #fff' }}>
              <img 
                src={settings.logo} 
                alt="Logo Pesantren"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                <span>{settings.nama_singkat}</span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                  <Box className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                  <span>3D Mode</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Sistem Manajemen Data Santri · Batulabang Akkor
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search Input / Trigger (Section 28) */}
        {onOpenGlobalSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <button
              onClick={onOpenGlobalSearch}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs text-slate-400 hover:text-slate-600 transition-all text-left shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Cari santri & alumni...</span>
              </div>
              <kbd className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Right: Quick Demo Status, Notification, and User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger */}
          {onOpenGlobalSearch && (
            <button
              onClick={onOpenGlobalSearch}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
              title="Cari Santri & Alumni"
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {/* Demo status indicator if active */}
          {hasDemoData && (
            <span 
              onClick={() => onNavigate('pengaturan_app')}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold cursor-pointer hover:bg-amber-100 transition-colors"
              title="Aplikasi memuat data demo untuk keperluan evaluasi/testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>DATA DEMO AKTIF</span>
            </span>
          )}

          {/* Quick Database Toggle */}
          <button
            onClick={() => onNavigate('pengaturan_app')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200/80 shadow-[0_2px_0_0_#cbd5e1,0_3px_6px_rgba(0,0,0,0.04)] active:translate-y-0.5 active:shadow-none"
            title="Kelola Data & Reset"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database</span>
          </button>

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={() => onNavigate('pengaturan_app')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200/80 shadow-[0_2px_0_0_#cbd5e1,0_3px_6px_rgba(0,0,0,0.04)] active:translate-y-0.5 active:shadow-none"
            title={
              syncState.status === 'syncing'
                ? 'Sedang menyinkronkan data ke cloud...'
                : syncState.status === 'error'
                ? `Sinkronisasi terhambat: ${syncState.errorMessage || 'Periksa koneksi'}`
                : 'Data tersinkron otomatis lintas perangkat (Cloud Firestore)'
            }
          >
            <Cloud className={`w-3.5 h-3.5 ${
              syncState.status === 'syncing' 
                ? 'text-sky-500 animate-spin' 
                : syncState.status === 'error' 
                ? 'text-rose-500' 
                : 'text-sky-600'
            }`} />
            <span className="hidden md:inline text-[11px]">
              {syncState.status === 'syncing' ? 'Menyinkron...' : 'Cloud Sync'}
            </span>
            <span className={`w-2 h-2 rounded-full ${
              syncState.status === 'syncing' 
                ? 'bg-sky-500 animate-ping' 
                : syncState.status === 'error' 
                ? 'bg-rose-500' 
                : 'bg-emerald-500'
            }`} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-[0_2px_0_0_#cbd5e1,0_3px_6px_rgba(0,0,0,0.04)] active:translate-y-0.5 active:shadow-none transition-all relative"
              aria-label="Pemberitahuan aktivitas"
            >
              <Bell className="w-4 h-4" />
              {recentLogs.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
              )}
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 modal-3d p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Aktivitas Terkini (Audit)</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('audit_log');
                      }}
                      className="text-xs text-emerald-700 hover:underline font-semibold"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {recentLogs.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas tercatat.</p>
                    ) : (
                      recentLogs.map(log => (
                        <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 text-xs hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between text-slate-500 mb-1">
                            <span className="font-semibold text-slate-800">{log.user_name}</span>
                            <span className="text-[10px] text-slate-400">{log.waktu}</span>
                          </div>
                          <div className="text-slate-600 font-medium">{log.aktivitas}: {log.modul}</div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{log.data_terkait}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Menu (Section 12: [Foto] Nama Pengguna, Jabatan/Role) */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                  {currentUser.foto ? (
                    <img src={currentUser.foto} alt={currentUser.nama_lengkap} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.nama_lengkap.charAt(0)
                  )}
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-slate-800 max-w-[150px] truncate">
                    {currentUser.nama_lengkap}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {currentUser.jabatan ? `${currentUser.jabatan} · ` : ''}{authService.getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">{currentUser.nama_lengkap}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">@{currentUser.username} · {currentUser.email}</div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <RoleBadge role={currentUser.role} size="sm" />
                      </div>
                    </div>

                    <div className="py-1">
                      {/* 1. Profil Saya */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenMyProfile();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>Profil Saya</span>
                      </button>

                      {/* 2. Pengaturan */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('profil_pesantren');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>Pengaturan Pesantren</span>
                      </button>

                      {/* 3. Aktivitas Saya */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('audit_log');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Aktivitas Saya (Audit Log)</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span className="font-semibold">Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
