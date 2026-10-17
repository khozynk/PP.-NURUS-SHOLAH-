import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Building2, 
  Users, 
  ArrowRight, 
  FileCheck2, 
  Printer 
} from 'lucide-react';
import { dbService } from '../../services/db';

interface MeetingArchivesPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingArchivesPage: React.FC<MeetingArchivesPageProps> = ({ onNavigate }) => {
  const meetings = dbService.getPondokMeetings();
  const decisions = dbService.getMeetingDecisions();
  const reports = dbService.getMeetingReports();

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredMeetings = meetings.filter(m => {
    const matchSearch = m.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.nomor_rapat && m.nomor_rapat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        m.pimpinan_rapat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchYear = yearFilter === 'ALL' || m.tahun?.toString() === yearFilter || new Date(m.tanggal).getFullYear().toString() === yearFilter;
    const matchType = typeFilter === 'ALL' || m.jenis_rapat === typeFilter;
    return matchSearch && matchYear && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 uppercase tracking-wider mb-1">
            <FolderArchive className="w-4 h-4 text-purple-600" /> Arsip Digital Musyawarah
          </div>
          <h1 className="text-xl font-bold text-slate-900">Arsip Permanen Rapat & Keputusan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Penyimpanan sejarah naskah rapat, risalah, dan berkas penetapan keputusan pimpinan</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul rapat, nomor arsip, pimpinan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="Rapat Bulanan">Rapat Bulanan</option>
            <option value="Rapat Pengurus">Rapat Pengurus</option>
            <option value="Rapat Pengasuh">Rapat Pengasuh</option>
            <option value="Rapat Evaluasi">Rapat Evaluasi</option>
          </select>
        </div>
      </div>

      {/* Archive Items */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
            <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Arsip tidak ditemukan</div>
          </div>
        ) : (
          filteredMeetings.map((m) => {
            const mDecisions = decisions.filter(d => d.meeting_id === m.id);
            const mReport = reports.find(r => r.meeting_id === m.id);

            return (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                      {m.nomor_rapat || 'RPT/NS'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.jenis_rapat}
                    </span>
                    <span className="text-xs font-bold text-emerald-800">
                      {m.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{m.judul_rapat}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>{m.hari}, {m.tanggal} ({m.waktu_mulai})</span>
                    <span>Pimpinan: {m.pimpinan_rapat}</span>
                    <span>Total Keputusan: <strong>{mDecisions.length}</strong></span>
                    {mReport && <span className="text-emerald-700 font-semibold">✓ Laporan Terbit</span>}
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('meet_detail', { meetingId: m.id })}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-all flex items-center gap-1 self-end md:self-center"
                >
                  <span>Buka Berkas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
