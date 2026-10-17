import React from 'react';
import { 
  BookOpen, 
  BookmarkCheck, 
  Clock, 
  BookCheck, 
  CalendarCheck2, 
  FileCheck2, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Award, 
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  SlidersHorizontal,
  Sparkles,
  FileBarChart
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Card3D } from '../common/Card3D';

interface AcademicDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ onNavigate }) => {
  const activePeriod = dbService.getActiveAcademicPeriod();
  const activeYear = dbService.getActiveAcademicYear();
  const tahfidzStats = dbService.getTahfidzStats();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');
  const subjects = dbService.getSubjects();
  const schedules = dbService.getSchedules();
  const attendanceRecords = dbService.getAttendanceRecords();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceRecords.filter(a => a.tanggal === todayStr);
  const todayHadir = todayAttendance.filter(a => a.status === 'Hadir').length;
  const todayTotal = todayAttendance.length;
  const todayAttendanceRate = todayTotal > 0 ? Math.round((todayHadir / todayTotal) * 100) : 98;

  const cards = [
    {
      id: 'akademik_tahfidz',
      title: 'Modul Tahfidz Al-Qur\'an',
      description: 'Pencatatan setoran hafalan baru, target juz, dan grafik perkembangan santri',
      icon: BookmarkCheck,
      color: 'bg-emerald-500',
      badge: `${tahfidzStats.setoranToday} Setoran Hari Ini`,
      stats: `${tahfidzStats.totalTahfidzStudents} Santri Tahfidz`
    },
    {
      id: 'akademik_murojaah',
      title: 'Modul Murojaah',
      description: 'Pengulangan juz harian/mingguan, klasifikasi kelancaran & evaluasi juz bermasalah',
      icon: Clock,
      color: 'bg-amber-500',
      badge: `${tahfidzStats.murojaahToday} Murojaah Hari Ini`,
      stats: `${tahfidzStats.totalMurojaahs} Total Rekod`
    },
    {
      id: 'akademik_kitabiyah',
      title: 'Penilaian Kitabiyah',
      description: 'Penilaian Safinatun Najah (Mubtadi, Mutawassith, Mutaqoddim) & Iktisyaf (Juz 1, 2, Al-Kasyaf)',
      icon: BookOpenCheck,
      color: 'bg-teal-600',
      badge: 'Safinah & Iktisyaf',
      stats: '6 Tingkat Kitab'
    },
    {
      id: 'akademik_btq',
      title: 'Modul BTQ',
      description: 'Evaluasi Makharijul Huruf, Tajwid, Kelancaran, Membaca Al-Qur\'an, & Menulis Arab',
      icon: BookCheck,
      color: 'bg-sky-600',
      badge: '4 Level Kemampuan',
      stats: 'Tartil & Tajwid'
    },
    {
      id: 'akademik_absensi',
      title: 'Absensi Presensi Class',
      description: 'Input absensi per kelas/rombel, default HADIR, kalender bulanan & peringatan alpa',
      icon: CalendarCheck2,
      color: 'bg-indigo-600',
      badge: `${todayAttendanceRate}% Kehadiran`,
      stats: `${students.length} Santri Aktif`
    },
    {
      id: 'akademik_nilai',
      title: 'Nilai Santri & Auto-Save',
      description: 'Input nilai per komponen, pembobotan fleksibel, predikat, dan penyimpanan otomatis',
      icon: CheckSquare,
      color: 'bg-blue-600',
      badge: 'Auto-Save Active',
      stats: `${subjects.length} Materi Pembelajaran`
    },
    {
      id: 'akademik_jadwal',
      title: 'Jadwal Pembelajaran',
      description: 'Penjadwalan harian, mingguan, per rombel, dan per ustadz pengampu',
      icon: CalendarDays,
      color: 'bg-purple-600',
      badge: `${schedules.length} Sesi Jadwal`,
      stats: 'Senin - Minggu'
    },
    {
      id: 'akademik_rapor',
      title: 'Rapor Santri Digital',
      description: 'Cetak & export rapor resmi lengkap Kop Pondok Nurus Sholah, Nilai, Absensi, & Catatan',
      icon: FileCheck2,
      color: 'bg-rose-600',
      badge: 'Format Cetak Resmi',
      stats: 'PDF & Print Ready'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-emerald-700/60 shadow-[0_16px_36px_-8px_rgba(4,120,87,0.35),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(4,120,87,0.8)]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="badge-3d bg-emerald-500/30 text-emerald-100 mb-3 border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Akademik & Kurikulum Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              Dashboard Akademik & Pembelajaran
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
              Sistem Manajemen Akademik Terpadu PP Nurus Sholah Batulabang Akkor. Terintegrasi dengan Tahfidz, Murojaah, BTQ, Kitabiyah, Absensi, dan Rapor Santri.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-4 min-w-[240px] text-right shadow-[0_6px_16px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)]">
            <div className="text-xs text-emerald-200 uppercase font-bold tracking-wider">Periode Aktif Pembelajaran</div>
            <div className="text-lg font-bold text-white mt-1">
              {activePeriod?.name || 'Semester 1 (Ganjil)'}
            </div>
            <div className="text-xs text-emerald-100/80 mt-0.5">
              Tahun Ajaran {activeYear?.nama_tahun_ajaran || '2026/2027'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card3D className="p-4.5 border-emerald-200/60">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Santri Aktif</span>
            <div className="icon-orb-3d w-8 h-8 bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-2">{students.length}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Terhubung ke Rombel & Program</div>
        </Card3D>

        <Card3D className="p-4.5 border-emerald-200/60">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Santri Tahfidz</span>
            <div className="icon-orb-3d w-8 h-8 bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-2">{tahfidzStats.totalTahfidzStudents}</div>
          <div className="text-xs text-slate-500 mt-1">{tahfidzStats.setoranToday} Setoran Hari Ini</div>
        </Card3D>

        <Card3D className="p-4.5 border-amber-200/60">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Rata-Rata Nilai Tahfidz</span>
            <div className="icon-orb-3d w-8 h-8 bg-amber-50 text-amber-600 border border-amber-200/60">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-2">{tahfidzStats.avgScore} <span className="text-sm font-normal text-slate-500">/ 100</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Kualitas Sangat Baik & Baik</div>
        </Card3D>

        <Card3D className="p-4.5 border-indigo-200/60">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Persentase Kehadiran</span>
            <div className="icon-orb-3d w-8 h-8 bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-2">{todayAttendanceRate}%</div>
          <div className="text-xs text-indigo-600 font-medium mt-1">Presensi Harian Berjalan</div>
        </Card3D>
      </div>

      {/* Main Feature Cards Navigation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Modul Akademik Terintegrasi</span>
          </h2>
          <span className="text-xs text-slate-500">Pilih menu untuk mengelola data akademik</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <Card3D
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className="p-5 flex flex-col justify-between group hover:border-emerald-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`icon-orb-3d p-3 rounded-xl ${card.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="badge-3d bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{card.stats}</span>
                  <div className="flex items-center gap-1 font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>

      {/* Quick Configurations Bar */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Konfigurasi Komponen Penilaian & Periode</h4>
            <p className="text-xs text-slate-500">Atur bobot rumus nilai, jenis setoran tahfidz, level BTQ, dan periode semester</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigate('akademik_penilaian')}
            className="px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Atur Bobot Penilaian
          </button>
          <button
            onClick={() => onNavigate('akademik_rekap')}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <FileBarChart className="w-4 h-4" />
            <span>Rekap Akademik Global</span>
          </button>
        </div>
      </div>
    </div>
  );
};
