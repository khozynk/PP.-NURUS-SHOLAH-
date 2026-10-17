import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Save, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Student, Subject, StudentGrade, GradeComponent } from '../../types/database';
import { useToast } from '../common/Toast';

export const StudentGradesPage: React.FC = () => {
  const { showToast } = useToast();
  const activeYear = dbService.getActiveAcademicYear();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const programs = dbService.getPrograms();
  const levels = dbService.getLevels();
  const rombels = dbService.getRombels();
  const subjects = dbService.getSubjects();
  const teachers = dbService.getTeachers();
  const components = dbService.getGradeComponents().filter(c => c.category === 'umum' && c.status === 'aktif');

  // Filter Selectors
  const [selectedRombelId, setSelectedRombelId] = useState<string>(rombels[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Local Scores State (for Auto-Save)
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); // studentId -> { componentId: score }
  const [notes, setNotes] = useState<Record<string, string>>({}); // studentId -> note
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  const currentRombel = rombels.find(r => r.id === selectedRombelId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);
  const currentTeacher = teachers.find(t => t.id === selectedTeacherId);

  // Filter active students in selected rombel
  const allStudents = dbService.getStudents().filter(s => s.status === 'aktif');
  const classStudents = allStudents.filter(s => {
    if (selectedRombelId && s.rombel_id !== selectedRombelId) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return s.nama_lengkap.toLowerCase().includes(q) || s.nis.includes(q);
    }
    return true;
  });

  // Load existing grades from DB into local scores state
  useEffect(() => {
    const existingGrades = dbService.getStudentGrades().filter(g => 
      g.rombel_id === selectedRombelId && 
      g.subject_id === selectedSubjectId &&
      g.period_id === (activePeriod?.id || 'period-2026-1')
    );

    const initialScores: Record<string, Record<string, number>> = {};
    const initialNotes: Record<string, string> = {};

    classStudents.forEach(st => {
      const g = existingGrades.find(grade => grade.student_id === st.id);
      if (g) {
        initialScores[st.id] = g.component_grades || {};
        initialNotes[st.id] = g.catatan || '';
      } else {
        // Default default 80s
        initialScores[st.id] = {
          'cmp-harian': 80,
          'cmp-tugas': 80,
          'cmp-praktik': 80,
          'cmp-ujian': 80
        };
        initialNotes[st.id] = '';
      }
    });

    setScores(initialScores);
    setNotes(initialNotes);
    setIsSaved(true);
  }, [selectedRombelId, selectedSubjectId]);

  // Handle Score Input Change
  const handleScoreChange = (studentId: string, cmpId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [cmpId]: clamped
      }
    }));
    setIsSaved(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [studentId]: note
    }));
    setIsSaved(false);
  };

  // Compute final weighted grade
  const calculateFinalGrade = (studentId: string): number => {
    const stScores = scores[studentId] || {};
    let totalScore = 0;
    let totalWeight = 0;

    components.forEach(cmp => {
      const score = stScores[cmp.id] ?? 80;
      totalScore += (score * (cmp.weight / 100));
      totalWeight += cmp.weight;
    });

    if (totalWeight === 0) return 0;
    return Math.round(totalScore);
  };

  const getPredikat = (finalGrade: number): string => {
    if (finalGrade >= 90) return 'Mumtaz (A+)';
    if (finalGrade >= 85) return 'Sangat Baik (A)';
    if (finalGrade >= 75) return 'Baik (B)';
    if (finalGrade >= 65) return 'Cukup (C)';
    return 'Perlu Bimbingan (D)';
  };

  // Save Grades to DB
  const handleSaveAll = () => {
    if (!selectedRombelId || !selectedSubjectId) {
      showToast('Pilih Rombel & Subject', 'Pilih Rombel dan Mata Pelajaran.', 'warning');
      return;
    }

    const batchGrades: Partial<StudentGrade>[] = classStudents.map(st => {
      const finalG = calculateFinalGrade(st.id);
      return {
        student_id: st.id,
        academic_year_id: activeYear?.id || 'ay-2026-2027',
        period_id: activePeriod?.id || 'period-2026-1',
        program_id: st.program_id || 'prog-kitabiyah',
        level_id: st.level_id || null,
        rombel_id: selectedRombelId,
        subject_id: selectedSubjectId,
        teacher_id: selectedTeacherId || 'tchr-01',
        component_grades: scores[st.id] || {},
        final_grade: finalG,
        predikat: getPredikat(finalG),
        catatan: notes[st.id] || '',
        updated_by: currentTeacher?.nama_lengkap || 'Ustadz Pengajar'
      };
    });

    try {
      dbService.bulkSaveStudentGrades(batchGrades);
      setIsSaved(true);
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      showToast('TERSIMPAN', `Nilai ${classStudents.length} santri berhasil disimpan ke database.`, 'success');
    } catch (err: any) {
      showToast('Gagal Menyimpan', err.message || 'Error saat menyimpan nilai.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['No', 'NIS', 'Nama Santri', 'Rombel', 'Materi', ...components.map(c => `${c.name} (${c.weight}%)`), 'Nilai Akhir', 'Predikat', 'Catatan']
    ];

    classStudents.forEach((st, idx) => {
      const stScores = scores[st.id] || {};
      const finalG = calculateFinalGrade(st.id);
      const row = [
        (idx + 1).toString(),
        st.nis,
        `"${st.nama_lengkap}"`,
        `"${currentRombel?.name || ''}"`,
        `"${currentSubject?.nama || ''}"`,
        ...components.map(c => (stScores[c.id] ?? 80).toString()),
        finalG.toString(),
        `"${getPredikat(finalG)}"`,
        `"${notes[st.id] || ''}"`
      ];
      rows.push(row);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_${currentSubject?.kode || 'MAPEL'}_${currentRombel?.name || 'Rombel'}.csv`);
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
            <CheckSquare className="w-4 h-4" />
            <span>AKADEMIK &bull; NILAI SANTRI MATERI UMUM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Input & Rekapitulasi Nilai Santri
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Semester: <strong className="text-slate-700">{activePeriod?.name || 'Semester 1'}</strong> ({activeYear?.nama_tahun_ajaran || '2026/2027'})
          </p>
        </div>

        {/* Auto Save Status & Save Button */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            {isSaved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>TERSIMPAN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>ADA PERUBAHAN BELUM DISIMPAN</span>
              </span>
            )}
            {lastSavedTime && (
              <div className="text-[10px] text-slate-400 mt-0.5">Terakhir disimpan {lastSavedTime} WIB</div>
            )}
          </div>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai</span>
          </button>
        </div>
      </div>

      {/* Filter Selectors Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">1. Pilih Rombel Belajar *</label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">2. Mata Pelajaran / Materi *</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.nama} ({s.jenis})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">3. Ustadz Pengajar</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grade Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Daftar Nilai Rombel: {currentRombel?.name || 'Rombel'}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-emerald-700">{currentSubject?.nama || 'Materi'}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-600">({classStudents.length} Santri)</span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Bobot Aktif: {components.map(c => `${c.name} (${c.weight}%)`).join(', ')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Santri</th>
                {components.map(cmp => (
                  <th key={cmp.id} className="px-3 py-3 text-center min-w-[90px]">
                    <div>{cmp.name}</div>
                    <div className="text-[10px] font-normal text-emerald-700">({cmp.weight}%)</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center bg-emerald-50 text-emerald-900 font-bold min-w-[100px]">
                  Nilai Akhir
                </th>
                <th className="px-4 py-3 text-center">Predikat</th>
                <th className="px-4 py-3 min-w-[180px]">Catatan Ustadz</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6 + components.length} className="text-center py-10 text-slate-400 italic">
                    Tidak ada santri di rombel ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((st, idx) => {
                  const finalG = calculateFinalGrade(st.id);
                  const predikat = getPredikat(finalG);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {st.nis}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {st.nama_lengkap}
                      </td>

                      {/* Component Inputs */}
                      {components.map(cmp => {
                        const val = scores[st.id]?.[cmp.id] ?? 80;
                        return (
                          <td key={cmp.id} className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={val}
                              onChange={(e) => handleScoreChange(st.id, cmp.id, parseInt(e.target.value))}
                              className="w-16 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                            />
                          </td>
                        );
                      })}

                      {/* Calculated Final Grade */}
                      <td className="px-4 py-3 text-center bg-emerald-50/50 font-extrabold text-base text-emerald-800">
                        {finalG}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          finalG >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          finalG >= 75 ? 'bg-blue-100 text-blue-800' :
                          finalG >= 65 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {predikat}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Catatan perkembangan..."
                          value={notes[st.id] || ''}
                          onChange={(e) => handleNoteChange(st.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
