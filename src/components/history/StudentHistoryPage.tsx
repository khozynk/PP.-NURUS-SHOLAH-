import React, { useState, useMemo } from 'react';
import { History, Search, Filter, Calendar, User, ArrowRight } from 'lucide-react';
import { dbService } from '../../services/db';
import { Student } from '../../types/database';
import { EmptyState } from '../common/EmptyState';

interface StudentHistoryPageProps {
  onSelectStudent: (student: Student) => void;
}

export const StudentHistoryPage: React.FC<StudentHistoryPageProps> = ({ onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const histories = dbService.getStudentHistories();
  const students = dbService.getStudents();
  const users = dbService.getUsers();

  const joinedHistories = useMemo(() => {
    return histories.map(h => {
      const student = students.find(s => s.id === h.student_id);
      const user = users.find(u => u.id === h.user_id);
      return {
        ...h,
        student,
        userName: user?.nama_lengkap || 'Administrator'
      };
    });
  }, [histories, students, users]);

  const filtered = useMemo(() => {
    return joinedHistories.filter(item => {
      if (typeFilter !== 'all' && item.jenis_perubahan !== typeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = item.student?.nama_lengkap.toLowerCase().includes(q) || false;
        const matchNis = item.student?.nis.toLowerCase().includes(q) || false;
        const matchKet = item.keterangan.toLowerCase().includes(q);
        return matchName || matchNis || matchKet;
      }
      return true;
    });
  }, [joinedHistories, typeFilter, searchTerm]);

  const types = Array.from(new Set(histories.map(h => h.jenis_perubahan)));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Riwayat Perubahan & Mutasi Santri (Student History)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Tabel histori terstruktur mencatat seluruh perpindahan kelas, perubahan status, kelulusan, dan catatan akademik
        </p>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari santri, NIS, atau keterangan perubahan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter jenis perubahan riwayat santri"
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Jenis Perubahan</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* History Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Belum Ada Riwayat Tercatat"
          description="Catatan riwayat akan otomatis bertambah ketika ada pendaftaran santri baru, perubahan kelas, atau mutasi status."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filtered.map(item => (
              <div key={item.id} className="relative">
                <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.jenis_perubahan}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">
                        {item.tanggal}
                      </span>
                    </div>

                    {item.student && (
                      <button
                        onClick={() => onSelectStudent(item.student!)}
                        className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>{item.student.nama_lengkap} (NIS: {item.student.nis})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 mb-2 leading-relaxed">{item.keterangan}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    {item.status_lama && (
                      <span>
                        Status: <span className="font-semibold text-slate-700">{item.status_lama}</span> &rarr; <span className="font-semibold text-emerald-700">{item.status_baru}</span>
                      </span>
                    )}
                    {item.kelas_baru && (
                      <span>
                        Kelas: <span className="font-semibold text-slate-700">{item.kelas_baru}</span>
                      </span>
                    )}
                    <span className="ml-auto text-slate-400">Dicatat oleh: {item.userName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
