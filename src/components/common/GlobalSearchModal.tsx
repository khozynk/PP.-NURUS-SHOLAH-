import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, GraduationCap, X, ArrowRight, Shield, Clock } from 'lucide-react';
import { Student, Alumni } from '../../types/database';
import { dbService } from '../../services/db';
import { StatusBadge } from './Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
  onSelectAlumni?: (alumni: Alumni) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent
}) => {
  const [query, setQuery] = useState('');

  const students = dbService.getStudents();
  const alumniList = dbService.getAlumni();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Combined search results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();

    return students.filter((s) => {
      const matchName = s.nama_lengkap.toLowerCase().includes(q);
      const matchNis = s.nis.toLowerCase().includes(q);
      const matchNisn = (s.nisn || '').toLowerCase().includes(q);
      const matchNik = (s.nik || '').toLowerCase().includes(q);
      const matchKota = (s.kabupaten || '').toLowerCase().includes(q);
      const matchDesa = (s.desa || '').toLowerCase().includes(q);

      // Check if this student is also in alumni table
      const alumni = alumniList.find((a) => a.student_id === s.id);
      const matchIdAlumni = alumni ? alumni.id_alumni.toLowerCase().includes(q) : false;

      return matchName || matchNis || matchNisn || matchNik || matchKota || matchDesa || matchIdAlumni;
    }).slice(0, 10);
  }, [students, alumniList, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-16">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-emerald-700 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari santri aktif atau alumni (Ketik nama, NIS, NIK, ID Alumni, kota...)"
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-500 hover:bg-slate-200"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">Pencarian Global Santri & Alumni</p>
              <p className="mt-1">
                Ketik nama santri meskipun sudah berstatus <strong>ALUMNI</strong>, lulus, atau pindah.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <p className="text-slate-600 font-semibold">Tidak ditemukan santri yang cocok dengan "{query}".</p>
              <p className="mt-1">Pastikan ejaan nama atau nomor NIS sudah benar.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ditemukan {results.length} Data
              </div>
              {results.map((student) => {
                const alumni = alumniList.find((a) => a.student_id === student.id);
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSelectStudent(student);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 hover:border-emerald-200 border border-transparent transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-2xs">
                        {student.foto ? (
                          <img src={student.foto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.nama_lengkap.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                            {student.nama_lengkap}
                          </span>
                          <StatusBadge status={student.status} size="sm" />
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                          <span>NIS: {student.nis}</span>
                          {alumni && (
                            <span className="text-purple-700 font-semibold">
                              · ID Alumni: {alumni.id_alumni}
                            </span>
                          )}
                          <span className="text-slate-400 font-sans">
                            · {student.desa}, {student.kabupaten}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <span>Lihat Profil Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tekan ESC untuk menutup</span>
          <span className="text-emerald-700 font-medium">Sistem Pencarian Terpadu PP Nurus Sholah</span>
        </div>
      </div>
    </div>
  );
};
