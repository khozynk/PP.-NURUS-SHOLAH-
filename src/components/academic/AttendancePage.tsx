import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  Save, 
  CheckCircle2, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Clock,
  Info 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { AttendanceRecord, Student } from '../../types/database';
import { useToast } from '../common/Toast';

export const AttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const activeYear = dbService.getActiveAcademicYear();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const rombels = dbService.getRombels();
  const subjects = dbService.getSubjects();
  const teachers = dbService.getTeachers();

  const [selectedRombelId, setSelectedRombelId] = useState<string>(rombels[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Status mapping for batch input
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  const currentRombel = rombels.find(r => r.id === selectedRombelId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Active students in selected rombel
  const allStudents = dbService.getStudents().filter(s => s.status === 'aktif');
  const classStudents = allStudents.filter(s => {
    if (selectedRombelId && s.rombel_id !== selectedRombelId) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return s.nama_lengkap.toLowerCase().includes(q) || s.nis.includes(q);
    }
    return true;
  });

  // Load attendance or default HADIR
  useEffect(() => {
    const existingRecords = dbService.getAttendanceRecords({
      rombelId: selectedRombelId,
      date: selectedDate
    });

    const initAtt: Record<string, AttendanceRecord['status']> = {};
    const initNotes: Record<string, string> = {};

    classStudents.forEach(st => {
      const rec = existingRecords.find(r => r.student_id === st.id);
      if (rec) {
        initAtt[st.id] = rec.status;
        initNotes[st.id] = rec.keterangan || '';
      } else {
        // Default HADIR for quick input!
        initAtt[st.id] = 'Hadir';
        initNotes[st.id] = '';
      }
    });

    setAttendanceMap(initAtt);
    setNotesMap(initNotes);
    setIsSavedSuccess(false);
  }, [selectedRombelId, selectedDate, selectedSubjectId]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsSavedSuccess(false);
  };

  const handleSaveAttendance = () => {
    if (!selectedRombelId) {
      showToast('Pilih Rombel', 'Pilih rombel yang diabsen.', 'warning');
      return;
    }

    const batch: Partial<AttendanceRecord>[] = classStudents.map(st => ({
      student_id: st.id,
      tanggal: selectedDate,
      period_id: activePeriod?.id || 'period-2026-1',
      rombel_id: selectedRombelId,
      subject_id: selectedSubjectId,
      teacher_id: selectedTeacherId,
      status: attendanceMap[st.id] || 'Hadir',
      keterangan: notesMap[st.id] || ''
    }));

    try {
      dbService.saveAttendanceBatch(batch);
      setIsSavedSuccess(true);
      showToast('SIMPAN ABSENSI', '✓ Absensi berhasil disimpan', 'success');
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan absensi.', 'error');
    }
  };

  // High Alpha / Attendance Warnings
  const highAlphaStudents = allStudents.filter(st => {
    const summary = dbService.getStudentAttendanceSummary(st.id);
    return summary.alpa >= 3 || (summary.total >= 5 && summary.percentage < 75);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <CalendarCheck2 className="w-4 h-4" />
            <span>AKADEMIK &bull; INPUT & REKAP ABSENSI SANTRI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Absensi Class & Halaqah
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Default HADIR otomatis. Ustadz cukup mengubah santri yang izin, sakit, alpa, atau dispensasi.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>SIMPAN ABSENSI</span>
        </button>
      </div>

      {/* Attendance Warnings Banner if high alpha */}
      {highAlphaStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Peringatan Kehadiran Santri (Threshold Alert)</h4>
            <p className="mt-0.5 text-amber-800">
              Terdapat <strong>{highAlphaStudents.length} santri</strong> dengan Alpa ≥ 3 hari atau tingkat kehadiran &lt; 75%:
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {highAlphaStudents.slice(0, 5).map(st => {
                const sum = dbService.getStudentAttendanceSummary(st.id);
                return (
                  <span key={st.id} className="bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-medium text-amber-900">
                    {st.nama_lengkap} (Alpa: {sum.alpa}, Kehadiran: {sum.percentage}%)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selector Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Tanggal Absensi *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Rombel Belajar *</label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Mata Pelajaran / Kegiatan</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Ustadz Pengampu</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="text-xs text-indigo-900 bg-indigo-50 px-3.5 py-1.5 rounded-xl font-medium border border-indigo-200/60">
            Rombel: <strong className="font-bold">{currentRombel?.name}</strong> &bull; Total: <strong className="font-bold">{classStudents.length} Santri</strong>
          </div>
        </div>
      </div>

      {/* Main Attendance Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-white border-b border-slate-900 font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">NIS</th>
                <th className="px-4 py-3">Nama Santri</th>
                <th className="px-4 py-3 text-center min-w-[320px]">Pilihan Status Presensi</th>
                <th className="px-4 py-3">Keterangan / Alasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 italic">
                    Tidak ada santri di rombel ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((st, idx) => {
                  const currentStatus = attendanceMap[st.id] || 'Hadir';

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

                      {/* Radio status options */}
                      <td className="px-4 py-2 text-center">
                        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'Hadir')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${currentStatus === 'Hadir' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'Izin')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${currentStatus === 'Izin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'Sakit')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${currentStatus === 'Sakit' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'Alpa')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${currentStatus === 'Alpa' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Alpa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(st.id, 'Dispensasi')}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${currentStatus === 'Dispensasi' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            Dispensasi
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Alasan izin/sakit/dispensasi..."
                          value={notesMap[st.id] || ''}
                          onChange={(e) => setNotesMap(prev => ({ ...prev, [st.id]: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
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
