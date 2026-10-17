import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Users, 
  GraduationCap, 
  Building2, 
  Bed, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  School,
  Calendar,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { dbService } from '../../services/db';

interface EducationDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const EducationDashboard: React.FC<EducationDashboardProps> = ({ onNavigate }) => {
  const stats = dbService.getEducationStats();
  const activeYear = dbService.getActiveAcademicYear();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-[0_16px_36px_-8px_rgba(4,120,87,0.35),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(4,120,87,0.8)] border border-emerald-700/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <BookOpen className="w-64 h-64 text-white -mr-16" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="badge-3d bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Tahun Ajaran Aktif: {activeYear?.nama_tahun_ajaran || '2026/2027'}</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Dashboard Akademik & Kepesantrenan
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Pusat data real-time struktur program (Tahfidz, Kitabiyah, BTQ), rombel belajar, penempatan kamar santri, dan dewan asatidz PP Nurus Sholah.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={() => onNavigate('pendidikan_program')}
              className="btn-3d btn-3d-emerald px-4 py-2 text-xs gap-1.5"
            >
              <span>Kelola Struktur Program</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('pendidikan_kenaikan')}
              className="btn-3d bg-slate-800 hover:bg-slate-750 text-emerald-100 hover:text-white text-xs border border-slate-700 border-b-[3px] border-b-slate-950 px-4 py-2 gap-1.5 shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Proses Kenaikan Kelas</span>
            </button>
            <button
              onClick={() => onNavigate('asrama_gedung_kamar')}
              className="btn-3d bg-slate-800 hover:bg-slate-750 text-emerald-100 hover:text-white text-xs border border-slate-700 border-b-[3px] border-b-slate-950 px-4 py-2 gap-1.5 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Monitoring Kamar Asrama</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('santri_aktif')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2.5">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Santri Aktif</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalSantriAktif}
          </p>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('pendidikan_program')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-teal-50 text-teal-700 border border-teal-200/60 mb-2.5">
            <BookOpen className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Program Utama</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalPrograms}
          </p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('pendidikan_kelas')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2.5">
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Kelas Pendidikan</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalClasses}
          </p>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('pendidikan_rombel')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-sky-50 text-sky-700 border border-sky-200/60 mb-2.5">
            <School className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Rombel Belajar</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalRombels}
          </p>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => onNavigate('pendidikan_guru')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-amber-50 text-amber-700 border border-amber-200/60 mb-2.5">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Dewan Asatidz</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalTeachers}
          </p>
        </div>

        {/* Metric 6 */}
        <div 
          onClick={() => onNavigate('asrama_gedung_kamar')}
          className="card-3d p-4 cursor-pointer group"
        >
          <div className="icon-orb-3d w-9 h-9 bg-purple-50 text-purple-700 border border-purple-200/60 mb-2.5">
            <Bed className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Kamar Asrama</p>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-0.5">
            {stats.totalDormRooms}
          </p>
        </div>
      </div>

      {/* Warning & Attention Card */}
      {(stats.santriWithoutClassCount > 0 || stats.santriWithoutRombelCount > 0 || stats.santriWithoutRoomCount > 0 || stats.fullRoomsCount > 0) && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900">
              Perhatian & Verifikasi Penempatan Santri
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500">Belum Ada Kelas</p>
                <p className="font-bold text-slate-800 font-mono text-sm">{stats.santriWithoutClassCount} Santri</p>
              </div>
              {stats.santriWithoutClassCount > 0 && (
                <button
                  onClick={() => onNavigate('santri_aktif')}
                  className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-semibold"
                >
                  Atur
                </button>
              )}
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500">Belum Ada Rombel</p>
                <p className="font-bold text-slate-800 font-mono text-sm">{stats.santriWithoutRombelCount} Santri</p>
              </div>
              {stats.santriWithoutRombelCount > 0 && (
                <button
                  onClick={() => onNavigate('pendidikan_rombel')}
                  className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-semibold"
                >
                  Tempatkan
                </button>
              )}
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500">Belum Ada Kamar</p>
                <p className="font-bold text-slate-800 font-mono text-sm">{stats.santriWithoutRoomCount} Santri</p>
              </div>
              {stats.santriWithoutRoomCount > 0 && (
                <button
                  onClick={() => onNavigate('asrama_gedung_kamar')}
                  className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-semibold"
                >
                  Kamar
                </button>
              )}
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-slate-500">Kamar Penuh</p>
                <p className="font-bold text-rose-600 font-mono text-sm">{stats.fullRoomsCount} Kamar Penuh</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">100% Kapasitas</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Distribusi per Program Pendidikan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Distribusi Santri per Program</span>
              </h2>
              <p className="text-xs text-slate-500">Jumlah santri aktif berdasarkan program keahlian</p>
            </div>
            <button
              onClick={() => onNavigate('pendidikan_program')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail Program</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.programDistribution.map((prog) => {
              const percentage = stats.totalSantriAktif > 0 
                ? Math.round((prog.count / stats.totalSantriAktif) * 100) 
                : 0;

              return (
                <div key={prog.programId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">
                      {prog.programName} ({prog.code})
                    </span>
                    <span className="font-mono text-slate-600">
                      <strong>{prog.count}</strong> santri ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Status Asrama & Kamar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-700" />
                <span>Okupansi Gedung Asrama</span>
              </h2>
              <p className="text-xs text-slate-500">Kapasitas hunian kamar santri per gedung</p>
            </div>
            <button
              onClick={() => onNavigate('asrama_gedung_kamar')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Detail Asrama</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.dormOccupancy.map((dorm) => {
              const percentage = dorm.capacity > 0 
                ? Math.round((dorm.occupied / dorm.capacity) * 100) 
                : 0;
              const isFull = dorm.occupied >= dorm.capacity && dorm.capacity > 0;

              return (
                <div key={dorm.buildingId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{dorm.buildingName}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        dorm.gender === 'putra' ? 'bg-sky-50 text-sky-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {dorm.gender === 'putra' ? 'Putra' : 'Putri'}
                      </span>
                    </div>
                    <span className="font-mono text-slate-600">
                      <strong>{dorm.occupied}</strong> / {dorm.capacity} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Distribusi Santri per Tingkat / Level */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-700" />
              <span>Distribusi Santri per Tingkat / Jenjang</span>
            </h2>
            <p className="text-xs text-slate-500">Jumlah santri aktif berdasarkan jenjang/tingkatan pendidikan</p>
          </div>
          <button
            onClick={() => onNavigate('pendidikan_kelas')}
            className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Detail Kelas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.levelDistribution.map((lvl) => {
            const percentage = stats.totalSantriAktif > 0 
              ? Math.round((lvl.count / stats.totalSantriAktif) * 100) 
              : 0;

            return (
              <div key={lvl.levelId} className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">
                      {lvl.levelName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lvl.programName}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {lvl.count} Santri
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rombel Belajar Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <School className="w-4 h-4 text-sky-700" />
              <span>Kapasitas Rombel Belajar (Rombongan Belajar)</span>
            </h2>
            <p className="text-xs text-slate-500">Indikator rasio santri terdaftar terhadap daya tampung rombel</p>
          </div>
          <button
            onClick={() => onNavigate('pendidikan_rombel')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Kelola Rombel</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.rombelDistribution.map((rombel) => {
            const isFull = rombel.count >= rombel.capacity;
            const pct = rombel.capacity > 0 ? Math.round((rombel.count / rombel.capacity) * 100) : 0;

            return (
              <div 
                key={rombel.rombelId}
                className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs truncate max-w-[170px]">
                    {rombel.rombelName}
                  </span>
                  {isFull ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      Penuh
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">
                      Sisa {Math.max(0, rombel.capacity - rombel.count)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Terdaftar:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {rombel.count} / {rombel.capacity} santri
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-rose-500' : 'bg-sky-600'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
