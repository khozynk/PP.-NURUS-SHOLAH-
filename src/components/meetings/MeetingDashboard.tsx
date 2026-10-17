import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  CheckSquare, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  Users, 
  Building2, 
  FileCheck2, 
  FolderArchive,
  TrendingUp,
  AlertTriangle,
  FileBarChart,
  Edit3
} from 'lucide-react';
import { dbService } from '../../services/db';

interface MeetingDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingDashboard: React.FC<MeetingDashboardProps> = ({ onNavigate }) => {
  const stats = dbService.getMeetingDashboardStats();
  const meetings = dbService.getPondokMeetings();
  const followups = dbService.getMeetingFollowups();
  const decisions = dbService.getMeetingDecisions();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredMeetings = meetings.filter(m => {
    const matchSearch = m.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.nomor_rapat && m.nomor_rapat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        m.pimpinan_rapat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'ALL' || m.jenis_rapat === filterType;
    return matchSearch && matchType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELESAI':
      case 'Selesai':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3"/> Selesai</span>;
      case 'BERLANGSUNG':
      case 'Berlangsung':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit animate-pulse"><Clock className="w-3 h-3"/> Berlangsung</span>;
      case 'TERJADWAL':
      case 'Mendatang':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit"><Calendar className="w-3 h-3"/> Terjadwal</span>;
      case 'DITUNDA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Ditunda</span>;
      case 'DIBATALKAN':
      case 'Dibatalkan':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3"/> Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-emerald-700/60 shadow-[0_16px_36px_-8px_rgba(4,120,87,0.35),inset_0_1.5px_0_rgba(255,255,255,0.3),inset_0_-3px_0_rgba(4,120,87,0.8)]">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Calendar className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="badge-3d bg-emerald-700/60 text-emerald-200 text-xs mb-2 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PP Nurus Sholah Batulabang Akkor</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">Dashboard Rapat & Evaluasi Bulanan</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
              Pusat perencanaan, pencatatan hasil musyawarah, keputusan pimpinan, pemantauan progress tindak lanjut, dan pelaporan rapat resmi pesantren.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('meet_monthly')}
              className="btn-3d btn-3d-amber px-4 py-2.5 text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Agenda Rapat</span>
            </button>
            <button
              onClick={() => onNavigate('meet_reports')}
              className="btn-3d bg-white/15 hover:bg-white/25 text-white text-xs px-4 py-2.5 backdrop-blur-sm border border-white/25 border-b-[3px] border-b-black/30 gap-1.5"
            >
              <FileBarChart className="w-4 h-4" />
              <span>Laporan Bulanan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Bar (Mobile-first responsive) */}
      <div className="card-3d p-4.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quick Actions (Aksi Cepat 3D)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          <button
            onClick={() => onNavigate('meet_live_notulen')}
            className="btn-3d p-2.5 bg-gradient-to-b from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-300 border-b-[3px] border-b-amber-400 text-amber-950 text-xs font-bold flex flex-col items-center justify-center gap-1 text-center shadow-xs cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-amber-700" />
            <span>Studio Notulen</span>
          </button>
          <button
            onClick={() => onNavigate('meet_monthly')}
            className="btn-3d p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 border-b-[3px] border-b-emerald-300 text-emerald-800 text-xs font-semibold flex flex-col items-center justify-center gap-1 text-center cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>+ Buat Rapat</span>
          </button>
          <button
            onClick={() => onNavigate('meet_agenda_list')}
            className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium flex flex-col items-center justify-center gap-1 text-center transition-all"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>+ Agenda Bulanan</span>
          </button>
          <button
            onClick={() => onNavigate('meet_results')}
            className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium flex flex-col items-center justify-center gap-1 text-center transition-all"
          >
            <FileCheck2 className="w-4 h-4 text-amber-600" />
            <span>+ Hasil Rapat</span>
          </button>
          <button
            onClick={() => onNavigate('meet_followup')}
            className="p-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-medium flex flex-col items-center justify-center gap-1 text-center transition-all"
          >
            <CheckSquare className="w-4 h-4 text-purple-600" />
            <span>+ Keputusan</span>
          </button>
          <button
            onClick={() => onNavigate('meet_followup')}
            className="p-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-medium flex flex-col items-center justify-center gap-1 text-center transition-all"
          >
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>+ Tindak Lanjut</span>
          </button>
          <button
            onClick={() => onNavigate('meet_reports')}
            className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-medium flex flex-col items-center justify-center gap-1 text-center transition-all"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>+ Laporan Bulanan</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Rapat</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.totalMeetings}</div>
          <div className="text-[11px] text-slate-500 mt-1">Seluruh arsip rapat</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Rapat Bulan Ini</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.meetingsThisMonth}</div>
          <div className="text-[11px] text-blue-600 mt-1">Bulan berjalan</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Agenda Mendatang</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{stats.upcomingAgendas}</div>
          <div className="text-[11px] text-amber-600 mt-1">Belum terlaksana</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Keputusan</span>
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats.totalDecisions}</div>
          <div className="text-[11px] text-purple-600 mt-1">Poin hasil musyawarah</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tindak Lanjut</span>
            <div className="p-1.5 bg-teal-50 rounded-lg text-teal-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-teal-700">{stats.totalFollowups}</div>
          <div className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{stats.followupCompleted} Selesai</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium text-rose-700">Terlambat & Pending</span>
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700">{stats.followupOverdue}</div>
          <div className="text-[11px] text-rose-600 mt-1">Tugas lewat deadline</div>
        </div>
      </div>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Tindak Lanjut Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-teal-600" /> Status Tindak Lanjut
            </h3>
            <button
              onClick={() => onNavigate('meet_followup')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
            >
              Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-slate-600">Belum Dimulai</span>
                <span className="font-bold text-slate-800">{stats.followupNotStarted} Tugas</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all"
                  style={{ width: `${stats.totalFollowups ? (stats.followupNotStarted / stats.totalFollowups) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-amber-700">Berjalan (In Progress)</span>
                <span className="font-bold text-amber-700">{stats.followupInProgress} Tugas</span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${stats.totalFollowups ? (stats.followupInProgress / stats.totalFollowups) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-emerald-700">Selesai (Completed 100%)</span>
                <span className="font-bold text-emerald-700">{stats.followupCompleted} Tugas</span>
              </div>
              <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${stats.totalFollowups ? (stats.followupCompleted / stats.totalFollowups) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-rose-700 font-semibold">Terlambat (Overdue)</span>
                <span className="font-bold text-rose-700">{stats.followupOverdue} Tugas</span>
              </div>
              <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all"
                  style={{ width: `${stats.totalFollowups ? (stats.followupOverdue / stats.totalFollowups) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Laporan Pending Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileBarChart className="w-4 h-4 text-indigo-600" /> Status Laporan Hasil
            </h3>
            <button
              onClick={() => onNavigate('meet_reports')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
            >
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-lg">
                {stats.reportsPending}
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">Laporan Belum Dibuat / Approved</div>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Rapat selesai yang membutuhkan draf atau pengesahan laporan resmi.
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold text-lg">
                {stats.totalReports}
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">Total Berkas Laporan</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Tersimpan di database & siap dicetak PDF.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Kalender & Quick Links */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" /> Kalender & Akses Cepat
            </h3>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigate('meet_calendar')}
              className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-medium text-slate-700 transition-all"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Buka Kalender Rapat Bulanan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('meet_results')}
              className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-medium text-slate-700 transition-all"
            >
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-amber-600" />
                <span>Hasil & Risalah Rapat</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('meet_archives')}
              className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left flex items-center justify-between text-xs font-medium text-slate-700 transition-all"
            >
              <div className="flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-purple-600" />
                <span>Arsip Permanen Musyawarah</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory of Meetings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Agenda & Jadwal Rapat Pesantren
            </h2>
            <p className="text-xs text-slate-500">Daftar agenda musyawarah pengurus, pengasuh, dewan guru & kepanitiaan</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari rapat, nomor, pimpinan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Semua Jenis Rapat</option>
                <option value="Rapat Bulanan">Rapat Bulanan</option>
                <option value="Rapat Pengurus">Rapat Pengurus</option>
                <option value="Rapat Pengasuh">Rapat Pengasuh</option>
                <option value="Rapat Guru/Ustadz">Rapat Guru/Ustadz</option>
                <option value="Rapat Evaluasi">Rapat Evaluasi</option>
                <option value="Rapat Akademik">Rapat Akademik</option>
                <option value="Rapat Keuangan">Rapat Keuangan</option>
                <option value="Rapat Kegiatan">Rapat Kegiatan</option>
                <option value="Rapat Khusus">Rapat Khusus</option>
              </select>
            </div>
          </div>
        </div>

        {filteredMeetings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Tidak ada data rapat ditemukan</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau buat agenda rapat baru.
            </p>
            <button
              onClick={() => onNavigate('meet_monthly')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-all inline-flex items-center gap-1 mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Agenda Rapat Baru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMeetings.map((mtg) => (
              <div
                key={mtg.id}
                className="p-4 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {mtg.nomor_rapat || 'RPT/NS'}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {mtg.jenis_rapat}
                    </span>
                    {getStatusBadge(mtg.status)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => onNavigate('meet_detail', { meetingId: mtg.id })}>
                    {mtg.judul_rapat}
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {mtg.hari}, {mtg.tanggal}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {mtg.waktu_mulai} - {mtg.waktu_selesai} WIB
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {mtg.tempat}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-emerald-800">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      Pimpinan: {mtg.pimpinan_rapat}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onNavigate('meet_detail', { meetingId: mtg.id })}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>Buka Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
