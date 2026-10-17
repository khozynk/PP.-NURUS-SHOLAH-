import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCheck, 
  UserMinus, 
  LogOut, 
  History, 
  BookOpen, 
  Award, 
  FileText, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Sliders, 
  Building2, 
  X,
  FileCheck2,
  CalendarCheck2,
  ScrollText,
  DoorOpen,
  Briefcase,
  Layers,
  Sparkles,
  UserX,
  UserPlus,
  GitFork,
  Calendar,
  School,
  TrendingUp,
  Bed,
  Clock,
  BookCheck,
  CheckSquare,
  BookmarkCheck,
  BookOpenCheck,
  FileBarChart,
  CalendarDays,
  SlidersHorizontal,
  FileSpreadsheet,
  Inbox,
  Send,
  FolderArchive,
  FileCode,
  Hash,
  MailCheck,
  FilePlus,
  FolderOpen,
  ListTodo,
  Edit3
} from 'lucide-react';
import { dbService } from '../../services/db';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpen,
  onClose
}) => {
  const stats = dbService.getDashboardStats();
  const settings = dbService.getSettings();

  const sections: NavSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'DATA SANTRI',
      items: [
        { id: 'santri_aktif', label: 'Santri Aktif', icon: Users, count: stats.totalAktif },
        { id: 'calon_santri', label: 'Calon Santri', icon: UserPlus, count: stats.santriCalon },
        { id: 'alumni', label: 'Alumni', icon: GraduationCap, count: stats.totalAlumni },
        { id: 'santri_lulus', label: 'Santri Lulus', icon: UserCheck, count: stats.santriLulus },
        { id: 'santri_pindah', label: 'Santri Pindah', icon: DoorOpen, count: stats.santriPindah },
        { id: 'santri_keluar', label: 'Santri Keluar', icon: UserMinus, count: stats.santriKeluar },
        { id: 'santri_tidak_aktif', label: 'Santri Tidak Aktif', icon: UserX, count: stats.santriTidakAktif || 0 },
        { id: 'riwayat_santri', label: 'Riwayat & Mutasi', icon: History }
      ]
    },
    {
      title: 'PENDIDIKAN',
      items: [
        { id: 'pendidikan_dashboard', label: 'Dashboard Pendidikan', icon: LayoutDashboard },
        { id: 'pendidikan_program', label: 'Struktur Program', icon: GitFork, count: dbService.getPrograms().length },
        { id: 'pendidikan_tahun_ajaran', label: 'Tahun Ajaran', icon: Calendar },
        { id: 'pendidikan_kelas', label: 'Kelas', icon: Layers, count: dbService.getClasses().length },
        { id: 'pendidikan_rombel', label: 'Rombel', icon: School, count: dbService.getRombels().length },
        { id: 'pendidikan_kenaikan', label: 'Kenaikan Kelas', icon: TrendingUp },
        { id: 'pendidikan_guru', label: 'Ustadz / Guru', icon: UserCheck, count: dbService.getTeachers().length },
        { id: 'pendidikan_mapel', label: 'Mata Pelajaran / Materi', icon: BookOpen, count: dbService.getSubjects().length }
      ]
    },
    {
      title: 'AKADEMIK',
      items: [
        { id: 'akademik_dashboard', label: 'Dashboard Akademik', icon: LayoutDashboard },
        { id: 'akademik_mapel', label: 'Mata Pelajaran / Materi', icon: BookOpen, count: dbService.getSubjects().length },
        { id: 'akademik_jadwal', label: 'Jadwal', icon: CalendarDays, count: dbService.getSchedules().length },
        { id: 'akademik_penilaian', label: 'Penilaian', icon: SlidersHorizontal },
        { id: 'akademik_nilai', label: 'Nilai Santri', icon: CheckSquare },
        { id: 'akademik_absensi', label: 'Absensi', icon: CalendarCheck2 },
        { id: 'akademik_tahfidz', label: 'Tahfidz', icon: BookmarkCheck, count: dbService.getTahfidzRecords().length },
        { id: 'akademik_murojaah', label: 'Murojaah', icon: Clock },
        { id: 'akademik_btq', label: 'BTQ', icon: BookCheck },
        { id: 'akademik_kitabiyah', label: 'Penilaian Kitabiyah', icon: BookOpenCheck },
        { id: 'akademik_rapor', label: 'Rapor', icon: FileCheck2 },
        { id: 'akademik_rekap', label: 'Rekap Akademik', icon: FileBarChart }
      ]
    },
    {
      title: 'ASRAMA',
      items: [
        { id: 'asrama_gedung', label: 'Gedung Asrama', icon: Building2, count: dbService.getDormBuildings().length },
        { id: 'asrama_kamar', label: 'Kamar Santri', icon: Bed, count: dbService.getDormRooms().length },
        { id: 'asrama_penempatan', label: 'Penempatan Santri', icon: Users },
        { id: 'asrama_riwayat', label: 'Riwayat Pindah Kamar', icon: History }
      ]
    },
    {
      title: 'KEGIATAN',
      items: [
        { id: 'kegiatan_absensi', label: 'Absensi', icon: CalendarCheck2, badge: 'Segera' },
        { id: 'kegiatan_prestasi', label: 'Prestasi', icon: Award, badge: 'Segera' },
        { id: 'kegiatan_pembinaan', label: 'Pembinaan', icon: ShieldCheck, badge: 'Segera' }
      ]
    },
    {
      title: 'ADMINISTRASI',
      items: [
        { id: 'admin_dashboard', label: 'Dashboard Administrasi', icon: LayoutDashboard },
        { id: 'admin_surat_masuk', label: 'Surat Masuk', icon: Inbox },
        { id: 'admin_surat_keluar', label: 'Surat Keluar', icon: Send },
        { id: 'admin_surat_santri', label: 'Surat Santri', icon: FileText },
        { id: 'admin_surat_keterangan', label: 'Surat Keterangan', icon: FileCheck2 },
        { id: 'admin_surat_izin', label: 'Surat Izin', icon: CalendarDays },
        { id: 'admin_surat_pengantar', label: 'Surat Pengantar', icon: Send },
        { id: 'admin_surat_panggilan', label: 'Surat Panggilan', icon: MailCheck },
        { id: 'admin_surat_pernyataan', label: 'Surat Pernyataan', icon: ScrollText },
        { id: 'admin_surat_tugas', label: 'Surat Tugas', icon: Briefcase },
        { id: 'admin_surat_rekomendasi', label: 'Surat Rekomendasi', icon: Award },
        { id: 'admin_template_surat', label: 'Template Surat', icon: FileCode },
        { id: 'admin_nomor_surat', label: 'Nomor Surat', icon: Hash },
        { id: 'admin_dokumen_santri', label: 'Dokumen Santri', icon: FolderOpen },
        { id: 'admin_arsip_dokumen', label: 'Arsip Dokumen', icon: FolderArchive }
      ]
    },
    {
      title: 'RAPAT & EVALUASI',
      items: [
        { id: 'meet_dashboard', label: 'Dashboard Rapat', icon: LayoutDashboard },
        { id: 'meet_agenda_list', label: 'Agenda Rapat', icon: ListTodo },
        { id: 'meet_live_notulen', label: 'Studio Notulen (Live)', icon: Edit3 },
        { id: 'meet_monthly', label: 'Rapat Bulanan', icon: Calendar },
        { id: 'meet_results', label: 'Hasil Rapat', icon: FileCheck2 },
        { id: 'meet_followup', label: 'Tindak Lanjut', icon: CheckSquare },
        { id: 'meet_reports', label: 'Laporan Hasil', icon: FileBarChart },
        { id: 'meet_calendar', label: 'Kalender Rapat', icon: CalendarDays },
        { id: 'meet_archives', label: 'Arsip Rapat', icon: FolderArchive }
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { id: 'laporan_santri', label: 'Laporan Santri', icon: BarChart3 },
        { id: 'laporan_status', label: 'Laporan Status Santri', icon: BarChart3 },
        { id: 'laporan_pendidikan', label: 'Laporan Pendidikan', icon: BarChart3 },
        { id: 'laporan_alumni', label: 'Laporan Alumni', icon: BarChart3 },
        { id: 'laporan_administrasi', label: 'Laporan Administrasi', icon: BarChart3 }
      ]
    },
    {
      title: 'PENGATURAN',
      items: [
        { id: 'profil_pesantren', label: 'Profil Pesantren', icon: Building2 },
        { id: 'pengguna', label: 'Pengguna & Hak Akses', icon: Users, count: dbService.getUsers().length },
        { id: 'hak_akses', label: 'Matriks Hak Akses', icon: ShieldCheck },
        { id: 'pengaturan_app', label: 'Pengaturan Aplikasi', icon: Sliders },
        { id: 'audit_log', label: 'Audit Log Sistem', icon: History }
      ]
    }
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity overscroll-none touch-none"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 pointer-events-auto visible' : '-translate-x-full pointer-events-none invisible lg:visible lg:pointer-events-auto'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80 bg-slate-950/60 shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-emerald-800 shrink-0 shadow-md border border-emerald-500/40" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
              <img 
                src={settings.logo} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="leading-none">
              <span className="font-bold text-white text-sm truncate block max-w-[150px]">
                {settings.nama_singkat || 'PP Nurus Sholah'}
              </span>
              <span className="block text-[10px] text-emerald-400 mt-0.5 truncate max-w-[150px]">
                {settings.nama_pesantren ? 'Sistem Data Santri' : 'Sistem Data Santri'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden active:scale-95"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-xs">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all font-medium ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-[0_3px_0_0_#065f46,0_6px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] border border-emerald-500/30 -translate-y-0.5'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80 hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                          isActive ? 'bg-emerald-800 text-emerald-100 shadow-inner' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.count}
                        </span>
                      )}

                      {item.badge && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold tracking-wide border border-slate-700/50">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Versi Fondasi 1.0</span>
          <span className="text-emerald-400">Palengaan, Madura</span>
        </div>
      </aside>
    </>
  );
};
