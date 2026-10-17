import React, { useState } from 'react';
import { 
  FileBarChart, 
  Award, 
  Search, 
  Download, 
  Trophy, 
  Users, 
  BookmarkCheck, 
  BookOpenCheck, 
  School,
  FileSpreadsheet
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Student } from '../../types/database';

export const AcademicSummaryPage: React.FC = () => {
  const activePeriod = dbService.getActiveAcademicPeriod();
  const activeYear = dbService.getActiveAcademicYear();
  const rombels = dbService.getRombels();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');
  const grades = dbService.getStudentGrades();

  const [selectedRombelId, setSelectedRombelId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate average grade per student
  const studentSummaries = students.map(st => {
    const stGrades = grades.filter(g => g.student_id === st.id);
    const totalG = stGrades.reduce((acc, g) => acc + g.final_grade, 0);
    const avg = stGrades.length > 0 ? Math.round(totalG / stGrades.length) : 85;
    const rombelObj = rombels.find(r => r.id === st.rombel_id);

    return {
      student: st,
      avgGrade: avg,
      gradesCount: stGrades.length,
      rombelName: rombelObj?.name || 'Rombel A'
    };
  });

  // Sort by ranking
  studentSummaries.sort((a, b) => b.avgGrade - a.avgGrade);

  const filteredSummaries = studentSummaries.filter(item => {
    if (selectedRombelId !== 'all' && item.student.rombel_id !== selectedRombelId) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return item.student.nama_lengkap.toLowerCase().includes(q) || item.student.nis.includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Peringkat', 'NIS', 'Nama Santri', 'Rombel', 'Program', 'Rata-Rata Nilai', 'Predikat']
    ];

    filteredSummaries.forEach((item, idx) => {
      rows.push([
        (idx + 1).toString(),
        item.student.nis,
        `"${item.student.nama_lengkap}"`,
        `"${item.rombelName}"`,
        `"${item.student.program}"`,
        item.avgGrade.toString(),
        item.avgGrade >= 85 ? 'Mumtaz / Sangat Baik' : item.avgGrade >= 75 ? 'Jayyid / Baik' : 'Cukup'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Akademik_Pondok_${activePeriod?.name || 'Semester'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>AKADEMIK &bull; REKAPITULASI & PERINGKAT GLOBAL</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Rekapitulasi Akademik & Ranking Santri
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Leaderboard prestasi akademik santri lintas program, rombel, dan materi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Rekap CSV</span>
        </button>
      </div>

      {/* Top 3 Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSummaries.slice(0, 3).map((item, idx) => (
          <div key={item.student.id} className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-slate-900 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-800" />
                Juara {idx + 1}
              </span>
              <span className="text-xs text-emerald-200 font-mono">{item.student.nis}</span>
            </div>

            <div className="mt-3">
              <h3 className="font-bold text-lg text-white">{item.student.nama_lengkap}</h3>
              <div className="text-xs text-emerald-100">{item.rombelName} &bull; {item.student.program}</div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs">
              <span className="text-emerald-200">Rata-Rata Nilai</span>
              <span className="text-xl font-black text-amber-300">{item.avgGrade}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Filter Rombel:</span>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Rombel</option>
              {rombels.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-16">Rank</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3">Rombel Belajar</th>
                <th className="px-4 py-3">Program Utama</th>
                <th className="px-4 py-3 text-center">Rata-Rata Nilai</th>
                <th className="px-4 py-3 text-center">Predikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSummaries.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 text-center font-bold">
                    <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs ${
                      idx === 0 ? 'bg-amber-400 text-slate-900 font-black' :
                      idx === 1 ? 'bg-slate-300 text-slate-900 font-bold' :
                      idx === 2 ? 'bg-amber-700 text-white font-bold' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{item.student.nis}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{item.student.nama_lengkap}</td>
                  <td className="px-4 py-3 font-medium">{item.rombelName}</td>
                  <td className="px-4 py-3 text-slate-600">{item.student.program}</td>
                  <td className="px-4 py-3 text-center font-extrabold text-sm text-emerald-800 bg-emerald-50/60">
                    {item.avgGrade}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] ${
                      item.avgGrade >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.avgGrade >= 85 ? 'Mumtaz (A)' : 'Jayyid (B)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
