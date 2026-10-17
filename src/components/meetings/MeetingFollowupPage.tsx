import React, { useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Building2, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { MeetingFollowup } from '../../types/database';

interface MeetingFollowupPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingFollowupPage: React.FC<MeetingFollowupPageProps> = ({ onNavigate }) => {
  const followups = dbService.getMeetingFollowups();
  const meetings = dbService.getPondokMeetings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const nowTime = new Date().getTime();

  const filteredFollowups = followups.filter(f => {
    const matchSearch = f.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        f.pic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        f.unit_bagian.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        f.sumber_rapat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || f.prioritas === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const getDeadlineAlert = (deadlineStr: string, status: string) => {
    if (status === 'Selesai') return null;

    const dlTime = new Date(deadlineStr).getTime();
    const diffDays = Math.ceil((dlTime - nowTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5" /> Tindak lanjut rapat terlambat ({Math.abs(diffDays)} Hari)
        </span>
      );
    } else if (diffDays <= 3) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Jatuh tempo dalam {diffDays} hari lagi
        </span>
      );
    }
    return null;
  };

  const handleUpdateProgress = (id: string, progress: number) => {
    dbService.saveMeetingFollowup({
      id,
      progress_percent: progress
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4 text-teal-600" /> Monitoring Tindak Lanjut Rapat
          </div>
          <h1 className="text-xl font-bold text-slate-900">Pelaksanaan & Progress Keputusan Rapat</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pemantauan progres 0% s.d 100% penanggung jawab tugas hasil musyawarah</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tugas, PIC, unit bagian, atau sumber rapat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Berjalan">Berjalan</option>
            <option value="Selesai">Selesai</option>
            <option value="Terlambat">Terlambat</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Prioritas</option>
            <option value="Rendah">Rendah</option>
            <option value="Sedang">Sedang</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sangat Penting">Sangat Penting</option>
          </select>
        </div>
      </div>

      {/* Followups Cards */}
      <div className="space-y-4">
        {filteredFollowups.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Tidak ada tugas tindak lanjut ditemukan</div>
          </div>
        ) : (
          filteredFollowups.map((flw) => (
            <div key={flw.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {flw.unit_bagian}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      flw.prioritas === 'Sangat Penting' ? 'bg-rose-100 text-rose-800' :
                      flw.prioritas === 'Tinggi' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Prioritas: {flw.prioritas}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{flw.judul}</h3>
                  <p className="text-xs text-slate-500">Sumber: {flw.sumber_rapat}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getDeadlineAlert(flw.deadline, flw.status)}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    flw.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    flw.status === 'Berjalan' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {flw.status}
                  </span>
                </div>
              </div>

              {/* Progress Slider Controls */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Progres Ketercapaian Tuntas</span>
                  <span className="text-emerald-700 font-extrabold text-sm">{flw.progress_percent}%</span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${flw.progress_percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-medium">Ubah Progress Quick:</span>
                  <div className="flex items-center gap-1">
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleUpdateProgress(flw.id, pct)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          flw.progress_percent === pct
                            ? 'bg-emerald-700 text-white shadow'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span>PIC: <strong>{flw.pic}</strong></span>
                <span>Deadline: <strong>{flw.deadline}</strong></span>
                <button
                  onClick={() => onNavigate('meet_detail', { meetingId: flw.meeting_id })}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Buka Detail Rapat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
