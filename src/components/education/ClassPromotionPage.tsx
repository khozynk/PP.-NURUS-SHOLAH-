import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Filter, 
  Users, 
  GraduationCap, 
  Sparkles,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Student, EducationProgram, EducationLevel, Rombel, AcademicYear } from '../../types/database';
import { useToast } from '../common/Toast';

export const ClassPromotionPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const academicYears = dbService.getAcademicYears();
  const activeYear = dbService.getActiveAcademicYear();
  const programs = dbService.getPrograms();
  const tracks = dbService.getTracks();
  const levels = dbService.getLevels();
  const rombels = dbService.getRombels();
  const students = dbService.getStudents();

  // Step 1: Filter Selection
  const [sourceYearId, setSourceYearId] = useState<string>(activeYear?.id || academicYears[0]?.id || '');
  const [targetYearId, setTargetYearId] = useState<string>(activeYear?.id || academicYears[0]?.id || '');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedLevelId, setSelectedLevelId] = useState<string>('all');
  const [selectedRombelId, setSelectedRombelId] = useState<string>('all');

  // Step 2: Student Decision Mapping
  // studentId -> { action: 'naik'|'tetap'|'pindah_program'|'pindah_tingkat'|'lulus'|'keluar'|'pindah_pondok', targetRombelId?: string, notes?: string }
  type ActionType = 'naik' | 'tetap' | 'pindah_program' | 'pindah_tingkat' | 'lulus' | 'keluar' | 'pindah_pondok';
  
  const [studentDecisions, setStudentDecisions] = useState<Record<string, {
    action: ActionType;
    targetProgramId?: string;
    targetTrackId?: string | null;
    targetLevelId?: string | null;
    targetClassId?: string;
    targetRombelId?: string | null;
    notes?: string;
  }>>({});

  // Preview Mode
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Eligible students based on source filters
  const eligibleStudents = students.filter(s => {
    if (s.status !== 'aktif' || s.is_archived) return false;
    if (selectedProgramId !== 'all' && s.program_id !== selectedProgramId) return false;
    if (selectedLevelId !== 'all' && s.level_id !== selectedLevelId) return false;
    if (selectedRombelId !== 'all' && s.rombel_id !== selectedRombelId) return false;
    return true;
  });

  const getDecision = (studentId: string) => {
    return studentDecisions[studentId] || { action: 'naik' };
  };

  const updateDecision = (studentId: string, partial: Partial<{
    action: ActionType;
    targetProgramId?: string;
    targetTrackId?: string | null;
    targetLevelId?: string | null;
    targetClassId?: string;
    targetRombelId?: string | null;
    notes?: string;
  }>) => {
    setStudentDecisions(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { action: 'naik' }),
        ...partial
      }
    }));
  };

  const handleBulkSetAction = (action: ActionType) => {
    const updated: typeof studentDecisions = { ...studentDecisions };
    eligibleStudents.forEach(s => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        action
      };
    });
    setStudentDecisions(updated);
    showToast('Terapkan Masal', `Seluruh santri diset menjadi "${action.toUpperCase()}".`, 'info');
  };

  // Summary counts
  const summary = eligibleStudents.reduce((acc, s) => {
    const act = getDecision(s.id).action;
    acc[act] = (acc[act] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExecutePromotion = async () => {
    setIsProcessing(true);
    try {
      const payload = eligibleStudents.map(s => {
        const dec = getDecision(s.id);
        return {
          studentId: s.id,
          action: dec.action,
          targetProgramId: (dec.targetProgramId || s.program_id) || undefined,
          targetTrackId: (dec.targetTrackId !== undefined ? dec.targetTrackId : s.track_id) || undefined,
          targetLevelId: (dec.targetLevelId !== undefined ? dec.targetLevelId : s.level_id) || undefined,
          targetClassId: dec.targetClassId || s.kelas_id || undefined,
          targetRombelId: (dec.targetRombelId !== undefined ? dec.targetRombelId : s.rombel_id) || undefined,
          notes: dec.notes
        };
      });

      const res = dbService.processClassPromotion({
        sourceAcademicYearId: sourceYearId,
        targetAcademicYearId: targetYearId,
        promotions: payload,
        currentUser
      });

      showToast('Berhasil Diproses', res.message, 'success');
      setIsPreviewOpen(false);
      setStudentDecisions({});
    } catch (err: any) {
      showToast('Gagal Proses', err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-700" />
          <span>Kenaikan & Mutasi Jenjang Kelas</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Proses perpindahan tingkat akademik antar tahun ajaran secara batch dengan audit log otomatis
        </p>
      </div>

      {/* Filter / Source & Target Academic Years */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>1. Tentukan Periode & Kelompok Santri Asal</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran Asal
            </label>
            <select
              value={sourceYearId}
              onChange={e => setSourceYearId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>TA {y.nama_tahun_ajaran}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran Tujuan
            </label>
            <select
              value={targetYearId}
              onChange={e => setTargetYearId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none font-semibold text-emerald-800"
            >
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>TA {y.nama_tahun_ajaran} ({y.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Program Asal
            </label>
            <select
              value={selectedProgramId}
              onChange={e => {
                setSelectedProgramId(e.target.value);
                setSelectedLevelId('all');
                setSelectedRombelId('all');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Semua Program</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tingkat / Jenjang Asal
            </label>
            <select
              value={selectedLevelId}
              onChange={e => setSelectedLevelId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Semua Tingkat</option>
              {levels
                .filter(l => selectedProgramId === 'all' || l.program_id === selectedProgramId)
                .map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rombel Asal
            </label>
            <select
              value={selectedRombelId}
              onChange={e => setSelectedRombelId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="all">Semua Rombel</option>
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List & Decision Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Daftar Santri Terpilih ({eligibleStudents.length} Santri)</span>
            </h2>
            <p className="text-xs text-slate-500">Tentukan status kenaikan perorangan atau gunakan tombol aksi cepat masal</p>
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Aksi Cepat:</span>
            <button
              onClick={() => handleBulkSetAction('naik')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
            >
              Set Semua Naik
            </button>
            <button
              onClick={() => handleBulkSetAction('tetap')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            >
              Set Semua Tetap
            </button>
            <button
              onClick={() => handleBulkSetAction('lulus')}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 transition-colors cursor-pointer"
            >
              Set Semua Lulus
            </button>
          </div>
        </div>

        {/* Student Decision Table */}
        {eligibleStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada santri aktif yang cocok dengan kriteria filter asal di atas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">Nama Santri & NIS</th>
                  <th className="py-2.5 px-3">Program / Rombel Asal</th>
                  <th className="py-2.5 px-3 w-44">Status Kenaikan</th>
                  <th className="py-2.5 px-3 w-48">Rombel Tujuan</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eligibleStudents.map((s, idx) => {
                  const dec = getDecision(s.id);
                  const prog = programs.find(p => p.id === s.program_id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{s.nama_lengkap}</p>
                        <p className="text-[11px] font-mono text-slate-500">NIS: {s.nis}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800">{prog?.name || '-'}</p>
                        <p className="text-[11px] text-slate-500">{s.rombel || 'Tanpa Rombel'}</p>
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={dec.action}
                          onChange={e => updateDecision(s.id, { action: e.target.value as ActionType })}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none ${
                            dec.action === 'naik' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                            dec.action === 'tetap' ? 'border-amber-300 bg-amber-50 text-amber-800' :
                            dec.action === 'lulus' ? 'border-purple-300 bg-purple-50 text-purple-800' :
                            dec.action === 'pindah_program' || dec.action === 'pindah_tingkat' ? 'border-sky-300 bg-sky-50 text-sky-800' :
                            'border-rose-300 bg-rose-50 text-rose-800'
                          }`}
                        >
                          <option value="naik">Naik Tingkat</option>
                          <option value="tetap">Tetap (Mengulang)</option>
                          <option value="pindah_tingkat">Pindah Tingkat</option>
                          <option value="pindah_program">Pindah Program</option>
                          <option value="lulus">Lulus (Tamat)</option>
                          <option value="keluar">Keluar</option>
                          <option value="pindah_pondok">Pindah Pondok</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        {dec.action !== 'lulus' && dec.action !== 'keluar' && dec.action !== 'pindah_pondok' ? (
                          <select
                            value={dec.targetRombelId || ''}
                            onChange={e => updateDecision(s.id, { targetRombelId: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
                          >
                            <option value="">-- Tetap di Rombel Sama / Otomatis --</option>
                            {rombels.map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tidak membutuhkan rombel</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={dec.notes || ''}
                          onChange={e => updateDecision(s.id, { notes: e.target.value })}
                          placeholder="Catatan..."
                          className="w-full px-2 py-1 rounded border border-slate-200 text-xs focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Bottom */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600">Ringkasan Keputusan:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              {summary['naik'] || 0} Naik
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              {summary['tetap'] || 0} Tetap
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
              {summary['lulus'] || 0} Lulus
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
              {(summary['keluar'] || 0) + (summary['pindah_pondok'] || 0)} Keluar/Pindah
            </span>
          </div>

          <button
            onClick={() => setIsPreviewOpen(true)}
            disabled={eligibleStudents.length === 0}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer self-end sm:self-auto"
          >
            <span>TAMPILKAN PREVIEW HASIL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                    Verifikasi Akhir Sebelum Proses
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight mt-1">
                    Preview Kenaikan Kelas Massal
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Konfirmasi pemindahan data santri dari tahun ajaran asal ke tahun ajaran tujuan
                  </p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-slate-400">Total Santri</p>
                  <p className="text-lg font-bold font-mono text-slate-900">{eligibleStudents.length} Santri</p>
                </div>
                <div>
                  <p className="text-slate-400">Naik Tingkat</p>
                  <p className="text-lg font-bold font-mono text-emerald-700">{summary['naik'] || 0} Santri</p>
                </div>
                <div>
                  <p className="text-slate-400">Mengulang / Tetap</p>
                  <p className="text-lg font-bold font-mono text-amber-700">{summary['tetap'] || 0} Santri</p>
                </div>
                <div>
                  <p className="text-slate-400">Lulus / Mutasi</p>
                  <p className="text-lg font-bold font-mono text-purple-700">
                    {(summary['lulus'] || 0) + (summary['keluar'] || 0) + (summary['pindah_pondok'] || 0)} Santri
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Santri</th>
                      <th className="py-2 px-3">Status Baru</th>
                      <th className="py-2 px-3">Rombel Tujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleStudents.slice(0, 8).map(s => {
                      const dec = getDecision(s.id);
                      const targetR = rombels.find(r => r.id === dec.targetRombelId);

                      return (
                        <tr key={s.id}>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {s.nama_lengkap} (NIS: {s.nis})
                          </td>
                          <td className="py-2 px-3 font-bold uppercase text-[11px] text-emerald-800">
                            {dec.action}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {targetR?.name || s.rombel || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {eligibleStudents.length > 8 && (
                  <div className="p-2 bg-slate-50 text-center text-[11px] text-slate-500 italic">
                    ... dan {eligibleStudents.length - 8} santri lainnya akan diproses bersamaan.
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Setiap perubahan akan dicatat ke dalam <strong>Riwayat Pendidikan Santri</strong> dan <strong>Audit Log Sistem</strong>. Tindakan ini tidak menghapus data historis tahun ajaran sebelumnya.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Kembali & Edit
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecutePromotion}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>KONFIRMASI & PROSES SEKARANG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
