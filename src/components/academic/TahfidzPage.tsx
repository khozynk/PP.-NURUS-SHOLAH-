import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  Plus, 
  Search, 
  Filter, 
  Award, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  History, 
  Users, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { dbService } from '../../services/db';
import { TahfidzRecord, TahfidzTarget, Student } from '../../types/database';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { authService } from '../../services/auth';

export const TahfidzPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const records = dbService.getTahfidzRecords();
  const targets = dbService.getTahfidzTargets();
  const auditLogs = dbService.getTahfidzAuditLogs();
  const stats = dbService.getTahfidzStats();
  const teachers = dbService.getTeachers();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');

  const [activeTab, setActiveTab] = useState<'setoran' | 'target' | 'audit_log'>('setoran');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');

  // New Setoran Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [recordForm, setRecordForm] = useState<Partial<TahfidzRecord>>({
    student_id: '',
    teacher_id: teachers[0]?.id || 'tchr-03',
    tanggal: new Date().toISOString().slice(0, 10),
    juz: 1,
    surah: 'Al-Baqarah',
    ayat_mulai: 1,
    ayat_selesai: 20,
    halaman_mulai: 1,
    halaman_selesai: 2,
    jenis_setoran: 'Hafalan Baru',
    nilai: 85,
    kualitas: 'Sangat Baik',
    catatan: ''
  });

  // Target Modal
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [targetForm, setTargetForm] = useState<Partial<TahfidzTarget>>({
    student_id: '',
    target_juz: 5,
    target_surah: 'An-Nisa',
    target_ayat: '1-176',
    target_halaman: 100,
    tanggal_mulai: new Date().toISOString().slice(0, 10),
    target_selesai: '2026-12-20',
    status: 'Berjalan',
    notes: ''
  });

  // Edit Correction Modal
  const [editingRecord, setEditingRecord] = useState<TahfidzRecord | null>(null);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [correctionScore, setCorrectionScore] = useState<number>(85);
  const [correctionQuality, setCorrectionQuality] = useState<string>('Baik');

  const filteredRecords = records.filter(r => {
    if (selectedStudentFilter !== 'all' && r.student_id !== selectedStudentFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const st = students.find(s => s.id === r.student_id);
      return st?.nama_lengkap.toLowerCase().includes(q) || r.surah.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenRecordModal = () => {
    setRecordForm({
      student_id: students[0]?.id || '',
      teacher_id: teachers[0]?.id || 'tchr-03',
      tanggal: new Date().toISOString().slice(0, 10),
      juz: 1,
      surah: 'Al-Baqarah',
      ayat_mulai: 1,
      ayat_selesai: 20,
      halaman_mulai: 1,
      halaman_selesai: 2,
      jenis_setoran: 'Hafalan Baru',
      nilai: 85,
      kualitas: 'Sangat Baik',
      catatan: ''
    });
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.student_id || !recordForm.surah) {
      showToast('Data Belum Lengkap', 'Pilih Santri dan nama Surah.', 'warning');
      return;
    }

    try {
      dbService.addTahfidzRecord(recordForm, currentUser || undefined);
      showToast('Setoran Berhasil', 'Setoran hafalan santri berhasil dicatat.', 'success');
      setIsRecordModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Error saat mencatat setoran.', 'error');
    }
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetForm.student_id) {
      showToast('Pilih Santri', 'Pilih santri penerima target.', 'warning');
      return;
    }

    try {
      dbService.saveTahfidzTarget(targetForm);
      showToast('Target Disimpan', 'Target hafalan santri berhasil diperbarui.', 'success');
      setIsTargetModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan target.', 'error');
    }
  };

  const handleOpenCorrection = (r: TahfidzRecord) => {
    setEditingRecord(r);
    setCorrectionScore(r.nilai);
    setCorrectionQuality(r.kualitas);
    setCorrectionReason('');
  };

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !currentUser) return;
    if (!correctionReason.trim()) {
      showToast('Alasan Wajib Diisi', 'Tuliskan alasan koreksi nilai setoran.', 'warning');
      return;
    }

    try {
      dbService.updateTahfidzRecord(
        editingRecord.id,
        { nilai: correctionScore, kualitas: correctionQuality },
        currentUser,
        correctionReason
      );
      showToast('Koreksi Disimpan', 'Nilai lama dan alasan koreksi berhasil masuk Audit Log.', 'success');
      setEditingRecord(null);
    } catch (err: any) {
      showToast('Gagal Koreksi', err.message || 'Error saat mengoreksi nilai.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <BookmarkCheck className="w-4 h-4" />
            <span>AKADEMIK &bull; MODUL TAHFIDZ AL-QUR'AN</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Perkembangan Hafalan Santri
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Pencatatan ziyadah setoran baru, target hafalan, kualitas, dan audit log perubahan nilai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTargetModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Atur Target Hafalan</span>
          </button>
          <button
            onClick={handleOpenRecordModal}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Input Setoran Hafalan</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Santri Program Tahfidz</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.totalTahfidzStudents} Santri</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Halaqah Putra & Putri</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Setoran Hari Ini</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.setoranToday} Setoran</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.totalRecords} Total Riwayat</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Rata-Rata Nilai</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Sangat Baik & Mutqin</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Target Tercapai</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{stats.targetAchieved} Santri</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">{stats.targetDelayed} Perlu Ditingkatkan</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('setoran')}
              className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'setoran' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              Riwayat Setoran ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('target')}
              className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'target' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              Target Hafalan ({targets.length})
            </button>
            <button
              onClick={() => setActiveTab('audit_log')}
              className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'audit_log' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              Audit Log Koreksi ({auditLogs.length})
            </button>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri / surah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Setoran Table */}
        {activeTab === 'setoran' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Santri</th>
                  <th className="px-4 py-3">Penerima Setoran</th>
                  <th className="px-4 py-3 text-center">Juz</th>
                  <th className="px-4 py-3">Surah & Ayat</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 text-center">Nilai & Kualitas</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                      Belum ada rekod setoran hafalan.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(r => {
                    const st = students.find(s => s.id === r.student_id);
                    const tchr = teachers.find(t => t.id === r.teacher_id);

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {r.tanggal}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {st?.nama_lengkap || 'Santri'}
                          <div className="text-[10px] text-slate-400 font-normal">NIS: {st?.nis}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {tchr?.nama_panggilan || tchr?.nama_lengkap || 'Ustadz'}
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-emerald-800 bg-emerald-50 rounded-lg">
                          Juz {r.juz}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {r.surah} : {r.ayat_mulai}-{r.ayat_selesai}
                          <div className="text-[10px] text-slate-400">Hal. {r.halaman_mulai || '-'}-{r.halaman_selesai || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {r.jenis_setoran}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-extrabold text-sm text-slate-800">{r.nilai}</div>
                          <div className="text-[10px] font-semibold text-emerald-700">{r.kualitas}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                          {r.catatan || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenCorrection(r)}
                            className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium"
                            title="Koreksi Nilai Setoran"
                          >
                            Koreksi
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Target Hafalan with Progress Bars */}
        {activeTab === 'target' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targets.map(tgt => {
              const st = students.find(s => s.id === tgt.student_id);
              // Calculate rough % based on target_juz (e.g. 3 of 5 juz = 60%)
              const stRecords = records.filter(r => r.student_id === tgt.student_id);
              const maxJuzSetor = stRecords.length > 0 ? Math.max(...stRecords.map(r => r.juz)) : 0;
              const progressPct = Math.min(100, Math.round((maxJuzSetor / (tgt.target_juz || 1)) * 100));

              return (
                <div key={tgt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{st?.nama_lengkap || 'Santri'}</h3>
                      <div className="text-xs text-slate-500">NIS: {st?.nis}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tgt.status === 'Tercapai' ? 'bg-emerald-100 text-emerald-800' :
                      tgt.status === 'Berjalan' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tgt.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Target Juz: <strong className="text-slate-800">Juz {tgt.target_juz}</strong></span>
                      <span>Target Surah: <strong className="text-slate-800">{tgt.target_surah} ({tgt.target_ayat})</strong></span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Mulai: {tgt.tanggal_mulai}</span>
                      <span>Batas Selesai: {tgt.target_selesai}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Capaian Terakhir: Juz {maxJuzSetor}</span>
                      <span className="text-emerald-700 font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Audit Log Koreksi Nilai */}
        {activeTab === 'audit_log' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <tr>
                  <th className="px-4 py-3">Waktu Koreksi</th>
                  <th className="px-4 py-3">Santri</th>
                  <th className="px-4 py-3">Nilai Lama</th>
                  <th className="px-4 py-3">Nilai Baru</th>
                  <th className="px-4 py-3">User Pengubah</th>
                  <th className="px-4 py-3">Alasan Koreksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                      Belum ada histori koreksi nilai setoran.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => {
                    const st = students.find(s => s.id === log.student_id);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {st?.nama_lengkap || 'Santri'}
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-bold line-through">
                          {log.nilai_lama} ({log.kualitas_lama})
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">
                          {log.nilai_baru} ({log.kualitas_baru})
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {log.user_nama}
                        </td>
                        <td className="px-4 py-3 italic text-slate-600">
                          "{log.alasan}"
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Setoran Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Catat Setoran Hafalan Baru"
      >
        <form onSubmit={handleSaveRecord} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Pilih Santri *</label>
            <select
              value={recordForm.student_id}
              onChange={(e) => setRecordForm({ ...recordForm, student_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Pilih Santri --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} (NIS: {s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tanggal *</label>
              <input
                type="date"
                value={recordForm.tanggal}
                onChange={(e) => setRecordForm({ ...recordForm, tanggal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Juz Al-Qur'an (1-30) *</label>
              <input
                type="number"
                min={1}
                max={30}
                value={recordForm.juz}
                onChange={(e) => setRecordForm({ ...recordForm, juz: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-slate-600 font-medium mb-1">Nama Surah *</label>
              <input
                type="text"
                placeholder="e.g. Al-Baqarah"
                value={recordForm.surah}
                onChange={(e) => setRecordForm({ ...recordForm, surah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Ayat Mulai</label>
              <input
                type="number"
                value={recordForm.ayat_mulai}
                onChange={(e) => setRecordForm({ ...recordForm, ayat_mulai: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Ayat Selesai</label>
              <input
                type="number"
                value={recordForm.ayat_selesai}
                onChange={(e) => setRecordForm({ ...recordForm, ayat_selesai: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Jenis Setoran</label>
              <select
                value={recordForm.jenis_setoran}
                onChange={(e) => setRecordForm({ ...recordForm, jenis_setoran: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Hafalan Baru">Hafalan Baru</option>
                <option value="Murojaah">Murojaah</option>
                <option value="Tasmi'">Tasmi'</option>
                <option value="Ujian Hafalan">Ujian Hafalan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Nilai (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={recordForm.nilai}
                onChange={(e) => setRecordForm({ ...recordForm, nilai: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Kualitas Hafalan</label>
              <select
                value={recordForm.kualitas}
                onChange={(e) => setRecordForm({ ...recordForm, kualitas: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Perlu Murojaah">Perlu Murojaah</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Catatan Ustadz</label>
            <input
              type="text"
              placeholder="Catatan makhraj, tajwid, waqaf..."
              value={recordForm.catatan || ''}
              onChange={(e) => setRecordForm({ ...recordForm, catatan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-xs"
            >
              Simpan Setoran
            </button>
          </div>
        </form>
      </Modal>

      {/* Target Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Atur Target Hafalan Santri"
      >
        <form onSubmit={handleSaveTarget} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Pilih Santri Target *</label>
            <select
              value={targetForm.student_id}
              onChange={(e) => setTargetForm({ ...targetForm, student_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Pilih Santri --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Jumlah Juz</label>
              <input
                type="number"
                min={1}
                max={30}
                value={targetForm.target_juz}
                onChange={(e) => setTargetForm({ ...targetForm, target_juz: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Surah Akhir</label>
              <input
                type="text"
                placeholder="e.g. An-Nisa / At-Taubah"
                value={targetForm.target_surah}
                onChange={(e) => setTargetForm({ ...targetForm, target_surah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tanggal Selesai Target</label>
              <input
                type="date"
                value={targetForm.target_selesai}
                onChange={(e) => setTargetForm({ ...targetForm, target_selesai: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Status Target</label>
              <select
                value={targetForm.status}
                onChange={(e) => setTargetForm({ ...targetForm, status: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Belum Mulai">Belum Mulai</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Tercapai">Tercapai</option>
                <option value="Terlambat">Terlambat</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTargetModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-xs"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </Modal>

      {/* Correction Modal */}
      {editingRecord && (
        <Modal
          isOpen={!!editingRecord}
          onClose={() => setEditingRecord(null)}
          title="Koreksi Nilai Setoran & Audit Log"
        >
          <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
              Perubahan nilai setoran lama ({editingRecord.nilai}) ke nilai baru wajib menyertakan alasan resmi yang dicatat di audit log.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nilai Koreksi Baru</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={correctionScore}
                  onChange={(e) => setCorrectionScore(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Kualitas Baru</label>
                <select
                  value={correctionQuality}
                  onChange={(e) => setCorrectionQuality(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Sangat Baik">Sangat Baik</option>
                  <option value="Baik">Baik</option>
                  <option value="Cukup">Cukup</option>
                  <option value="Perlu Murojaah">Perlu Murojaah</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Alasan Perubahan *</label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Salah pencatatan nilai saat halaqah..."
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-xs"
              >
                Simpan Audit Log Koreksi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
