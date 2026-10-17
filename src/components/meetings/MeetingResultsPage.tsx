import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Users, 
  FileText 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { MeetingResult } from '../../types/database';

interface MeetingResultsPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingResultsPage: React.FC<MeetingResultsPageProps> = ({ onNavigate }) => {
  const results = dbService.getMeetingResults();
  const meetings = dbService.getPondokMeetings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredResults = results.filter(res => {
    const meeting = meetings.find(m => m.id === res.meeting_id);
    const matchSearch = res.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        res.keputusan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (meeting && meeting.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || res.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4 text-emerald-600" /> Modul Hasil & Risalah Musyawarah
          </div>
          <h1 className="text-xl font-bold text-slate-900">Hasil Rapat & Keputusan Pesantren</h1>
          <p className="text-xs text-slate-500 mt-0.5">Daftar keputusan resmi, risalah pembahasan, dan naskah rekomendasi rapat</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('meet_live_notulen')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Buka Studio Notulen untuk pencatatan hasil musyawarah secara langsung"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>Studio Notulen (Catat Langsung)</span>
          </button>

          <button
            onClick={() => onNavigate('meet_monthly')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Buat Hasil Rapat Baru
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ringkasan, keputusan, atau nama rapat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium w-full sm:w-auto"
        >
          <option value="ALL">Semua Status Hasil</option>
          <option value="DRAFT">DRAFT</option>
          <option value="DIPERIKSA">DIPERIKSA</option>
          <option value="DISETUJUI">DISETUJUI</option>
          <option value="DIARSIPKAN">DIARSIPKAN</option>
        </select>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Belum ada hasil rapat terdaftar</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hasil rapat dihasilkan dari rapat yang telah diselesaikan.
            </p>
          </div>
        ) : (
          filteredResults.map((res) => {
            const meeting = meetings.find(m => m.id === res.meeting_id);
            return (
              <div key={res.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                      {meeting?.nomor_rapat || 'RPT/NS'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{meeting?.judul_rapat || 'Musyawarah Pesantren'}</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold w-fit ${
                    res.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    res.status === 'DIPERIKSA' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {res.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                    <div className="font-bold text-slate-700 uppercase text-[10px]">Ringkasan Pembahasan</div>
                    <p className="text-slate-800 whitespace-pre-line">{res.ringkasan}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-xl space-y-1 border border-emerald-100">
                    <div className="font-bold text-emerald-900 uppercase text-[10px]">Keputusan Utama</div>
                    <p className="text-emerald-950 font-medium whitespace-pre-line">{res.keputusan}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Dibuat Oleh: <strong>{res.dibuat_oleh}</strong> ({res.tanggal})</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('meet_live_notulen', { meetingId: res.meeting_id })}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Buka Studio Notulen untuk hasil ini"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Studio Notulen</span>
                    </button>

                    <button
                      onClick={() => onNavigate('meet_detail', { meetingId: res.meeting_id })}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
