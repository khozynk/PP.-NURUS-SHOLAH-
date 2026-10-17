import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  BookOpen, 
  Search, 
  Award,
  SlidersHorizontal 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Student, StudentGrade, GradeComponent } from '../../types/database';
import { useToast } from '../common/Toast';

export const KitabiyahGradesPage: React.FC = () => {
  const { showToast } = useToast();
  const activeYear = dbService.getActiveAcademicYear();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const tracks = dbService.getTracks(); // Safinatun Najah & Iktisyaf
  const levels = dbService.getLevels().filter(l => l.program_id === 'prog-kitabiyah');
  const rombels = dbService.getRombels();
  const teachers = dbService.getTeachers();

  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || 'track-safinah');
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || 'lvl-mubtadi');
  const [selectedRombelId, setSelectedRombelId] = useState<string>(rombels[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || 'tchr-01');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Kitabiyah specific components
  const components = dbService.getGradeComponents().filter(c => c.category === 'kitabiyah' && c.status === 'aktif');

  const currentTrack = tracks.find(t => t.id === selectedTrackId);
  const currentLevel = levels.find(l => l.id === selectedLevelId);
  const currentRombel = rombels.find(r => r.id === selectedRombelId);

  // Filter levels when track changes
  useEffect(() => {
    const trackLevels = levels.filter(l => l.track_id === selectedTrackId);
    if (trackLevels.length > 0) {
      setSelectedLevelId(trackLevels[0].id);
    }
  }, [selectedTrackId]);

  const allStudents = dbService.getStudents().filter(s => s.status === 'aktif');
  const classStudents = allStudents.filter(s => {
    if (selectedRombelId && s.rombel_id !== selectedRombelId) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return s.nama_lengkap.toLowerCase().includes(q) || s.nis.includes(q);
    }
    return true;
  });

  // Load existing grades
  useEffect(() => {
    const subjectCode = currentTrack?.code === 'SAFINAH' ? 'sbj-01' : 'sbj-02';
    const existingGrades = dbService.getStudentGrades().filter(g => 
      g.rombel_id === selectedRombelId && 
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
        initialScores[st.id] = {
          'cmp-ktb-pemahaman': 85,
          'cmp-ktb-hafalan': 82,
          'cmp-ktb-bacaan': 85,
          'cmp-ktb-adab': 90,
          'cmp-ktb-ujian': 85
        };
        initialNotes[st.id] = '';
      }
    });

    setScores(initialScores);
    setNotes(initialNotes);
    setIsSaved(true);
  }, [selectedTrackId, selectedLevelId, selectedRombelId]);

  const handleScoreChange = (studentId: string, cmpId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [cmpId]: clamped
      }
    }));
    setIsSaved(false);
  };

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
    if (finalGrade >= 85) return 'Jayyid Jiddan (A)';
    if (finalGrade >= 75) return 'Jayyid (B)';
    if (finalGrade >= 65) return 'Maqbul (C)';
    return 'Rasib / Bimbingan';
  };

  const handleSaveAll = () => {
    if (!selectedRombelId) {
      showToast('Pilih Rombel', 'Pilih Rombel Kitabiyah.', 'warning');
      return;
    }

    const subjectId = currentTrack?.code === 'SAFINAH' ? 'sbj-01' : 'sbj-02';

    const batchGrades: Partial<StudentGrade>[] = classStudents.map(st => {
      const finalG = calculateFinalGrade(st.id);
      return {
        student_id: st.id,
        academic_year_id: activeYear?.id || 'ay-2026-2027',
        period_id: activePeriod?.id || 'period-2026-1',
        program_id: 'prog-kitabiyah',
        level_id: selectedLevelId,
        rombel_id: selectedRombelId,
        subject_id: subjectId,
        teacher_id: selectedTeacherId,
        component_grades: scores[st.id] || {},
        final_grade: finalG,
        predikat: getPredikat(finalG),
        catatan: notes[st.id] || '',
        updated_by: 'Ustadz Pengampu Kitabiyah'
      };
    });

    try {
      dbService.bulkSaveStudentGrades(batchGrades);
      setIsSaved(true);
      showToast('TERSIMPAN', `Nilai Kitabiyah ${classStudents.length} santri berhasil disimpan!`, 'success');
    } catch (err: any) {
      showToast('Gagal', err.message || 'Error saat menyimpan nilai Kitabiyah.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <BookOpenCheck className="w-4 h-4" />
            <span>AKADEMIK &bull; PENILAIAN KHUSUS KITABIYAH</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Modul Penilaian Kitabiyah (Safinah & Iktisyaf)
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Mendukung Safinatun Najah (Mubtadi', Mutawassith, Mutaqoddim) & Iktisyaf (Juz 1, 2, Al-Kasyaf).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaved ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TERSIMPAN</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 animate-pulse">
              <span>ADA BELUM DISIMPAN</span>
            </span>
          )}

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-teal-800 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Nilai Kitab</span>
          </button>
        </div>
      </div>

      {/* Kitab Selector Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">1. Kurikulum Kitab *</label>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-teal-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {tracks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">2. Tingkat Kitab *</label>
            <select
              value={selectedLevelId}
              onChange={(e) => setSelectedLevelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {levels.filter(l => l.track_id === selectedTrackId).map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">3. Rombel Belajar *</label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">4. Ustadz Pengampu</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="text-xs text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl font-medium border border-teal-200/60">
            Kitab: <strong className="font-bold">{currentTrack?.name}</strong> &bull; Tingkat: <strong className="font-bold">{currentLevel?.name}</strong>
          </div>
        </div>
      </div>

      {/* Main Kitab Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-teal-900 text-white border-b border-teal-950 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Santri</th>
                {components.map(cmp => (
                  <th key={cmp.id} className="px-3 py-3 text-center min-w-[90px]">
                    <div>{cmp.name}</div>
                    <div className="text-[10px] font-normal text-teal-200">({cmp.weight}%)</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center bg-teal-800 text-amber-300 font-extrabold min-w-[100px]">
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

                      {/* Kitab Components */}
                      {components.map(cmp => {
                        const val = scores[st.id]?.[cmp.id] ?? 85;
                        return (
                          <td key={cmp.id} className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={val}
                              onChange={(e) => handleScoreChange(st.id, cmp.id, parseInt(e.target.value))}
                              className="w-16 text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1 focus:ring-2 focus:ring-teal-500 focus:bg-white focus:outline-none"
                            />
                          </td>
                        );
                      })}

                      <td className="px-4 py-3 text-center bg-teal-50/60 font-extrabold text-base text-teal-900">
                        {finalG}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          finalG >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          finalG >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {predikat}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Catatan keaktifan kitab..."
                          value={notes[st.id] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [st.id]: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-teal-500 focus:bg-white focus:outline-none"
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
