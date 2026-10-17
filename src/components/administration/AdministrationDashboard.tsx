import React from 'react';
import { 
  Inbox, 
  Send, 
  FileText, 
  Clock, 
  CheckCircle2, 
  FolderOpen, 
  AlertCircle, 
  FolderArchive, 
  BarChart3, 
  Plus, 
  Search, 
  ArrowRight,
  Sparkles,
  FileCheck2,
  Mail,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { dbService } from '../../services/db';

interface AdministrationDashboardProps {
  onNavigate: (viewId: string) => void;
}

export const AdministrationDashboard: React.FC<AdministrationDashboardProps> = ({ onNavigate }) => {
  const stats = dbService.getAdministrationStats();
  const settings = dbService.getSettings();
  const incoming = dbService.getIncomingLetters();
  const outgoing = dbService.getOutgoingLetters();
  const studentLetters = dbService.getStudentLetters();
  const templates = dbService.getLetterTemplates();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-emerald-700/60 shadow-[0_16px_36px_-8px_rgba(4,120,87,0.35),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(4,120,87,0.8)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="badge-3d bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 text-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem Persuratan & Digitalisasi Arsip</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              Dashboard Administrasi & Tata Usaha
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Pengelolaan surat masuk, surat keluar, penerbitan surat santri, dokumen legalitas, dan arsip digital {settings.nama_pesantren || 'PP Nurus Sholah'}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('admin_surat_santri')}
              className="btn-3d btn-3d-emerald text-xs px-4 py-2.5 gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Surat Santri</span>
            </button>
            <button
              onClick={() => onNavigate('admin_surat_masuk')}
              className="btn-3d bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs px-4 py-2.5 gap-2 border border-slate-700 border-b-[3px] border-b-slate-950"
            >
              <Inbox className="w-4 h-4 text-emerald-400" />
              <span>Surat Masuk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Surat Masuk */}
        <div 
          onClick={() => onNavigate('admin_surat_masuk')}
          className="card-3d p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Masuk (Bulan Ini)
            </span>
            <div className="icon-orb-3d w-10 h-10 bg-blue-50 text-blue-600 border border-blue-200/60">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 drop-shadow-xs">
              {stats.incomingThisMonth}
            </span>
            <span className="text-xs font-medium text-slate-500">
              dari total {stats.incomingCount} surat
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
            <span>Lihat Surat Masuk</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Surat Keluar */}
        <div 
          onClick={() => onNavigate('admin_surat_keluar')}
          className="card-3d p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Keluar (Bulan Ini)
            </span>
            <div className="icon-orb-3d w-10 h-10 bg-purple-50 text-purple-600 border border-purple-200/60">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 drop-shadow-xs">
              {stats.outgoingThisMonth}
            </span>
            <span className="text-xs font-medium text-slate-500">
              dari total {stats.outgoingCount} surat
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
            <span>Kelola Surat Keluar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Surat Santri Diterbitkan */}
        <div 
          onClick={() => onNavigate('admin_surat_santri')}
          className="card-3d p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Santri Terbit
            </span>
            <div className="icon-orb-3d w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalStudentLetters}
            </span>
            <span className="text-xs font-medium text-emerald-600 font-semibold">
              Terhubung DB
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
            <span>Generator & Profil Surat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Status Dokumen Santri */}
        <div 
          onClick={() => onNavigate('admin_dokumen_santri')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kelengkapan Berkas
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-emerald-600">{stats.completeStudents}</span>
              <span className="text-xs text-slate-500 ml-1">Lengkap</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-600">{stats.incompleteStudents}</span>
              <span className="text-xs text-slate-500 ml-1">Belum</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-medium">
            <span>Verifikasi Dokumen</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Action Alerts & Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alert 1: Surat Belum Selesai */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Surat Belum Selesai</h4>
              <p className="text-sm font-extrabold text-amber-800">{stats.lettersUnfinished} Surat Diproses</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('admin_surat_masuk')}
            className="text-xs font-bold text-amber-800 bg-white px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-100 transition-colors"
          >
            Tinjau
          </button>
        </div>

        {/* Alert 2: Perlu Tanda Tangan */}
        <div className="bg-indigo-50/80 rounded-2xl p-4 border border-indigo-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Perlu Tanda Tangan</h4>
              <p className="text-sm font-extrabold text-indigo-800">{stats.lettersNeedSign} Draft Surat</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('admin_surat_keluar')}
            className="text-xs font-bold text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-300 shadow-2xs hover:bg-indigo-100 transition-colors"
          >
            Proses
          </button>
        </div>

        {/* Alert 3: Arsip Dokumen Pondok */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Arsip Digital Pesantren</h4>
              <p className="text-sm font-extrabold text-emerald-800">{stats.totalArchives} Berkas Legalitas</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('admin_arsip_dokumen')}
            className="text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs hover:bg-emerald-100 transition-colors"
          >
            Buka Arsip
          </button>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span>Modul Operasional Administrasi</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick Item 1 */}
          <div 
            onClick={() => onNavigate('admin_surat_santri')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Generator Surat Santri</h4>
                <span className="text-xs text-slate-500">Otomatisasi biodata santri</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Cetak Surat Keterangan Santri, Surat Aktif, Surat Izin, Surat Pengantar & Rekomendasi secara instan dari database.
            </p>
          </div>

          {/* Quick Item 2 */}
          <div 
            onClick={() => onNavigate('admin_template_surat')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Template Surat Custom</h4>
                <span className="text-xs text-slate-500">{templates.length} Template Aktif</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Kelola format dan placeholder variabel <code className="text-emerald-700 font-bold">{`{{nama_santri}}`}</code>, <code className="text-emerald-700 font-bold">{`{{nis}}`}</code> untuk semua jenis surat.
            </p>
          </div>

          {/* Quick Item 3 */}
          <div 
            onClick={() => onNavigate('admin_dokumen_santri')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Pendataan Dokumen Santri</h4>
                <span className="text-xs text-slate-500">Scan KK, Akta, Ijazah</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Verifikasi kelengkapan berkas fisik & digital seluruh santri aktif beserta tanggal kedaluwarsa dokumen.
            </p>
          </div>

          {/* Quick Item 4 */}
          <div 
            onClick={() => onNavigate('admin_nomor_surat')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Penomoran Surat Otomatis</h4>
                <span className="text-xs text-slate-500">Anti Nomor Ganda</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Pengaturan penomoran dinamis dengan format kode pondok, nomor urut, bulan romawi, dan tahun.
            </p>
          </div>

          {/* Quick Item 5 */}
          <div 
            onClick={() => onNavigate('admin_arsip_dokumen')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Arsip Dokumen Pesantren</h4>
                <span className="text-xs text-slate-500">Dokumen Wakaf & IJOP</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Pusat penyimpanan digital sertifikat tanah wakaf, perizinan Kemenag, SK pengasuh, dan berkas penting.
            </p>
          </div>

          {/* Quick Item 6 */}
          <div 
            onClick={() => onNavigate('admin_surat_masuk')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Agendaris Surat Masuk & Keluar</h4>
                <span className="text-xs text-slate-500">Ekspedisi digital</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Pencatatan registrasi surat masuk instansi luar dan pengarsipan distribusi surat keluar resmi pesantren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
