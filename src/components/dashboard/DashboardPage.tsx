import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  DoorOpen, 
  UserMinus, 
  UserPlus, 
  BookOpen, 
  Layers, 
  ArrowRight,
  Database,
  Sparkles,
  ShieldAlert,
  Clock,
  Search,
  School,
  Trash2
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { StatusBadge } from '../common/Badge';
import { Student } from '../../types/database';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import { Card3D } from '../common/Card3D';

interface DashboardPageProps {
  onNavigate: (viewId: string) => void;
  onOpenAddStudent: () => void;
  onSelectStudent: (student: Student) => void;
  onDataChange: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddStudent,
  onSelectStudent,
  onDataChange
}) => {
  const currentUser = authService.getCurrentUser();
  const stats = dbService.getDashboardStats();
  const allStudents = dbService.getStudents();
  const settings = dbService.getSettings();
  const recentLogs = dbService.getAuditLogs().slice(0, 4);

  // Take the most recently added 5 students
  const recentStudents = [...allStudents].slice(0, 5);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const { showToast } = useToast();

  const handleLoadDemo = () => {
    dbService.loadDemoData();
    showToast('Data Demo Dimuat', 'Dataset demo testing berhasil dimuat.', 'info');
    onDataChange();
  };

  const handleConfirmReset = () => {
    dbService.resetDatabaseToEmpty('all_operational');
    setShowResetDialog(false);
    showToast('Database Dikosongkan', 'Semua data operasional telah direset ke kondisi awal 0 data.', 'info');
    onDataChange();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-emerald-700/60 shadow-[0_16px_36px_-8px_rgba(4,120,87,0.35),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(4,120,87,0.8)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="badge-3d bg-emerald-500/30 text-emerald-100 mb-2 border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{settings.nama_pesantren}</span>
              <span>·</span>
              <span>Batulabang Akkor</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Ahlan wa Sahlan, {currentUser?.nama_lengkap || 'Pengguna'}!
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Anda masuk sebagai <span className="font-bold text-white capitalize bg-emerald-800/60 px-2 py-0.5 rounded-md border border-emerald-600/40">{authService.getRoleLabel(currentUser?.role || 'admin')}</span>. Sistem siap digunakan untuk mengelola data santri, alumni, dan administrasi pesantren.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddStudent}
              className="btn-3d btn-3d-white px-4 py-2.5 text-xs sm:text-sm gap-2"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>+ Tambah Santri</span>
            </button>
            <button
              onClick={() => onNavigate('santri_aktif')}
              className="btn-3d bg-emerald-800 hover:bg-emerald-750 text-white border border-emerald-600 border-b-[3.5px] border-b-emerald-950 px-4 py-2.5 text-xs sm:text-sm gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              <span>Daftar Santri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Database Empty Banner Notice if 0 data */}
      {stats.isDatabaseEmpty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">Database Baru Masih Kosong (0 Data)</h2>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Semua metrik di bawah akurat 0 (tanpa angka palsu). Anda dapat mulai menambahkan santri asli secara manual atau memuat contoh data pengujian bertanda khusus <span className="font-semibold">[DATA DEMO]</span>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadDemo}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muat DATA DEMO</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION B: 8 KEY METRICS CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Statistik Riil Data Pesantren
          </h2>
          <span className="text-[11px] text-slate-400">
            Terhubung langsung ke tabel database
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* 1. Total Santri Aktif */}
          <Card3D 
            onClick={() => onNavigate('santri_aktif')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-emerald-200/60 hover:border-emerald-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Total Santri Aktif</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200/80 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.totalAktif}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="truncate">Status aktif di asrama</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Card3D>

          {/* 2. Total Alumni */}
          <Card3D 
            onClick={() => onNavigate('alumni')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-amber-200/60 hover:border-amber-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Total Alumni</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-200/80 shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.totalAlumni}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="truncate">Terhubung data santri</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Card3D>

          {/* 3. Total Guru / Ustadz */}
          <Card3D 
            onClick={() => onNavigate('pendidikan_guru')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-blue-200/60 hover:border-blue-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Total Guru / Ustadz</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border border-blue-200/80 shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.totalGuru}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="truncate">Dewan asatidz pengajar</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Card3D>

          {/* 4. Total Kelas */}
          <Card3D 
            onClick={() => onNavigate('pendidikan_kelas')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-purple-200/60 hover:border-purple-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Total Kelas</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 border border-purple-200/80 shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.totalKelas}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="truncate">Rombel Tsanawiyah, Aliyah</span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </Card3D>

          {/* 5. Santri Baru */}
          <Card3D 
            onClick={() => onNavigate('santri_aktif')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-sky-200/60 hover:border-sky-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Santri Baru</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 border border-sky-200/80 shrink-0">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.santriBaru}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              Angkatan 2026 / Calon
            </div>
          </Card3D>

          {/* 6. Santri Lulus */}
          <Card3D 
            onClick={() => onNavigate('santri_lulus')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-indigo-200/60 hover:border-indigo-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Santri Lulus</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200/80 shrink-0">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.santriLulus}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              Tamat kurikulum
            </div>
          </Card3D>

          {/* 7. Santri Pindah */}
          <Card3D 
            onClick={() => onNavigate('santri_pindah')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-orange-200/60 hover:border-orange-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Santri Pindah</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700 border border-orange-200/80 shrink-0">
                <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.santriPindah}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              Mutasi lembaga lain
            </div>
          </Card3D>

          {/* 8. Santri Keluar */}
          <Card3D 
            onClick={() => onNavigate('santri_keluar')}
            className="p-3.5 sm:p-4.5 lg:p-5 group border-rose-200/60 hover:border-rose-400"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Santri Keluar</span>
              <div className="icon-orb-3d w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border border-rose-200/80 shrink-0">
                <UserMinus className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono tabular-nums text-slate-900 tracking-tight drop-shadow-xs">
              {stats.santriKeluar}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate">
              Pengunduran diri
            </div>
          </Card3D>
        </div>

        {/* GRAFIK PERGERAKAN STATUS SANTRI (Section 27: Data Database Riil) */}
        <div className="mt-4 p-4 sm:p-6 card-3d">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pergerakan Status Santri Pesantren</h3>
              <p className="text-[11px] text-slate-500">Visualisasi real-time status seluruh record santri di database</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              Total {stats.totalAktif + stats.totalAlumni + stats.santriLulus + stats.santriPindah + stats.santriKeluar + (stats.santriTidakAktif || 0)} Santri
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200/80 text-center shadow-[0_3px_0_0_#a7f3d0,0_4px_8px_rgba(16,185,129,0.08)]">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Aktif</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-900 font-mono mt-0.5">{stats.totalAktif}</div>
              <span className="text-[10px] text-emerald-700">Mukim Belajar</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-200/80 text-center shadow-[0_3px_0_0_#e9d5ff,0_4px_8px_rgba(168,85,247,0.08)]">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Alumni</span>
              <div className="text-lg sm:text-xl font-bold text-purple-900 font-mono mt-0.5">{stats.totalAlumni}</div>
              <span className="text-[10px] text-purple-700">Tercatat di Ikatan</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200/80 text-center shadow-[0_3px_0_0_#c7d2fe,0_4px_8px_rgba(99,102,241,0.08)]">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Lulus</span>
              <div className="text-lg sm:text-xl font-bold text-indigo-900 font-mono mt-0.5">{stats.santriLulus}</div>
              <span className="text-[10px] text-indigo-700">Tamat Kurikulum</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-orange-50 to-white border border-orange-200/80 text-center shadow-[0_3px_0_0_#fed7aa,0_4px_8px_rgba(249,115,22,0.08)]">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">Pindah</span>
              <div className="text-lg sm:text-xl font-bold text-orange-900 font-mono mt-0.5">{stats.santriPindah}</div>
              <span className="text-[10px] text-orange-700">Mutasi Lembaga</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-rose-50 to-white border border-rose-200/80 text-center shadow-[0_3px_0_0_#fecdd3,0_4px_8px_rgba(244,63,94,0.08)]">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Keluar</span>
              <div className="text-lg sm:text-xl font-bold text-rose-900 font-mono mt-0.5">{stats.santriKeluar}</div>
              <span className="text-[10px] text-rose-700">Berhenti</span>
            </div>
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-slate-100 to-white border border-slate-200/80 text-center shadow-[0_3px_0_0_#e2e8f0,0_4px_8px_rgba(100,116,139,0.08)]">
              <span className="text-[10px] font-bold text-slate-700 uppercase block">Tidak Aktif</span>
              <div className="text-lg sm:text-xl font-bold text-slate-800 font-mono mt-0.5">{stats.santriTidakAktif || 0}</div>
              <span className="text-[10px] text-slate-500">Nonaktif Sementara</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN LOWER SECTION: Recent Students & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Santri Terkini */}
        <div className="lg:col-span-2 card-3d p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Santri Terbaru Ditambahkan</h2>
              <p className="text-xs text-slate-500">Daftar santri terbaru yang tersimpan di sistem</p>
            </div>
            <button
              onClick={() => onNavigate('santri_aktif')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentStudents.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum Ada Data Santri</p>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Tabel santri masih kosong (0 data)</p>
              <button
                onClick={onOpenAddStudent}
                className="btn-3d btn-3d-emerald px-4 py-2 text-xs"
              >
                + Tambah Santri Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentStudents.map((std) => (
                <div
                  key={std.id}
                  onClick={() => onSelectStudent(std)}
                  className="py-3 sm:py-3.5 flex items-center justify-between hover:bg-slate-50/90 -mx-2 px-3 rounded-xl transition-all cursor-pointer group hover:translate-x-0.5 hover:shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs border border-emerald-200">
                      {std.nama_lengkap.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                        {std.nama_lengkap}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">NIS: {std.nis}</span>
                        <span>·</span>
                        <span>{std.program}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={std.status} size="sm" />
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 col): Audit Log & Quick Info */}
        <div className="space-y-6">
          {/* Audit Log Box */}
          <div className="card-3d p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Audit Log Terkini</span>
              </h2>
              <button
                onClick={() => onNavigate('audit_log')}
                className="text-xs text-emerald-700 hover:underline font-medium"
              >
                Detail
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Pencatatan riil seluruh mutasi, login, dan modifikasi data.
            </p>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                      {log.user_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.waktu}</span>
                  </div>
                  <div className="font-medium text-emerald-800">
                    {log.aktivitas} · {log.modul}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {log.data_terkait}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Database Tools Box */}
          <div className="card-3d bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-slate-200 p-5 sm:p-6 border border-slate-700/80 shadow-[0_16px_36px_-8px_rgba(15,23,42,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Pengujian Basis Data</span>
            </h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Anda dapat menguji kondisi awal kosong (0 data) atau memuat dataset demo santri untuk evaluasi sistem.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleLoadDemo}
                className="btn-3d btn-3d-emerald w-full py-2.5 px-3 text-xs gap-2 font-semibold"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Muat Dataset Demo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="btn-3d w-full py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/80 border-b-[3.5px] border-b-rose-950 text-xs font-semibold gap-2 transition-all cursor-pointer shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Kosongkan Database (Reset 0)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOG KONFIRMASI RESET DATABASE */}
      <ConfirmDialog
        isOpen={showResetDialog}
        title="Kosongkan Seluruh Basis Data"
        message="PERINGATAN: Apakah Anda yakin ingin mengosongkan seluruh data santri, rombel, transaksi, dan hasil rapat untuk menguji kondisi awal 0 data (empty state)? Akun login Administrator tetap aman."
        confirmText="Ya, Kosongkan Basis Data"
        cancelText="Batalkan"
        isDangerous={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};
