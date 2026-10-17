import React, { useState } from 'react';
import { 
  School, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  UserPlus, 
  UserMinus, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  GraduationCap,
  Layers,
  X
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Rombel, Student, SchoolClass } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const RombelPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [rombels, setRombels] = useState<Rombel[]>(() => dbService.getRombels());
  const [classes] = useState<SchoolClass[]>(() => dbService.getClasses());
  const [academicYears] = useState(() => dbService.getAcademicYears());
  const [teachers] = useState(() => dbService.getTeachers());
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents());

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  // Rombel Form Modal
  const [isRombelModalOpen, setIsRombelModalOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<Rombel | null>(null);
  const [rombelForm, setRombelForm] = useState({
    class_id: '',
    academic_year_id: '',
    name: '',
    code: '',
    capacity: 30,
    homeroom_teacher_id: '',
    mentor_id: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
    notes: ''
  });

  // Manage Students Modal (Drawer / Dialog)
  const [managingRombel, setManagingRombel] = useState<Rombel | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [targetTransferRombelId, setTargetTransferRombelId] = useState('');

  const reloadData = () => {
    setRombels(dbService.getRombels());
    setStudents(dbService.getStudents());
  };

  const handleOpenAddRombel = () => {
    setEditingRombel(null);
    const activeAy = dbService.getActiveAcademicYear();
    setRombelForm({
      class_id: classes[0]?.id || '',
      academic_year_id: activeAy?.id || academicYears[0]?.id || '',
      name: '',
      code: '',
      capacity: 30,
      homeroom_teacher_id: '',
      mentor_id: '',
      status: 'aktif',
      notes: ''
    });
    setIsRombelModalOpen(true);
  };

  const handleOpenEditRombel = (r: Rombel) => {
    setEditingRombel(r);
    setRombelForm({
      class_id: r.class_id,
      academic_year_id: r.academic_year_id,
      name: r.name,
      code: r.code,
      capacity: r.capacity,
      homeroom_teacher_id: r.homeroom_teacher_id || '',
      mentor_id: r.mentor_id || '',
      status: r.status,
      notes: r.notes || ''
    });
    setIsRombelModalOpen(true);
  };

  const handleSaveRombel = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...rombelForm,
        homeroom_teacher_id: rombelForm.homeroom_teacher_id || null,
        mentor_id: rombelForm.mentor_id || null
      };

      if (editingRombel) {
        dbService.updateRombel(editingRombel.id, payload, currentUser);
        showToast('Berhasil', `Rombel "${rombelForm.name}" berhasil diperbarui.`, 'success');
      } else {
        dbService.createRombel(payload, currentUser);
        showToast('Berhasil', `Rombel "${rombelForm.name}" berhasil ditambahkan.`, 'success');
      }
      setIsRombelModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDeleteRombel = (r: Rombel) => {
    if (confirm(`Hapus rombel "${r.name}"?`)) {
      try {
        dbService.deleteRombel(r.id, currentUser);
        showToast('Berhasil', `Rombel "${r.name}" berhasil dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // Student Actions in Rombel
  const handleAssignStudent = (studentId: string) => {
    if (!managingRombel) return;
    try {
      dbService.assignStudentToRombel(studentId, managingRombel.id, currentUser);
      showToast('Berhasil', 'Santri berhasil dimasukkan ke rombel.', 'success');
      reloadData();
      setIsAddStudentOpen(false);
    } catch (err: any) {
      showToast('Gagal Menempatkan', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (confirm(`Keluarkan ${studentName} dari rombel ini?`)) {
      try {
        dbService.removeStudentFromRombel(studentId, currentUser);
        showToast('Berhasil', `Santri ${studentName} dikeluarkan dari rombel.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  const handleMoveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToTransfer || !targetTransferRombelId) return;

    try {
      dbService.moveStudentRombel(
        studentToTransfer.id, 
        targetTransferRombelId, 
        'Dipindahkan oleh admin', 
        currentUser
      );
      showToast('Berhasil Pindah', `Santri ${studentToTransfer.nama_lengkap} berhasil dipindahkan ke rombel tujuan.`, 'success');
      setStudentToTransfer(null);
      setTargetTransferRombelId('');
      reloadData();
    } catch (err: any) {
      showToast('Gagal Pindah', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const filteredRombels = rombels.filter(r => {
    if (classFilter !== 'all' && r.class_id !== classFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-6 h-6 text-sky-700" />
            <span>Rombel Belajar (Rombongan Belajar)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengelompokan santri per rombel (A, B, Halaqah) dengan batas kuota kapasitas dan wali kelas
          </p>
        </div>

        <button
          onClick={handleOpenAddRombel}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rombel Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama rombel atau kode..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
        >
          <option value="all">Semua Kelas Induk</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.nama_kelas}</option>
          ))}
        </select>

        <span className="text-xs font-mono text-slate-500 ml-auto">
          Total <strong>{filteredRombels.length}</strong> Rombel
        </span>
      </div>

      {/* Grid Rombel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRombels.map((rombel) => {
          const cls = classes.find(c => c.id === rombel.class_id);
          const homeroom = teachers.find(t => t.id === rombel.homeroom_teacher_id);
          const mentor = teachers.find(t => t.id === rombel.mentor_id);
          const ay = academicYears.find(y => y.id === rombel.academic_year_id);
          
          const members = students.filter(s => s.rombel_id === rombel.id && s.status === 'aktif');
          const isFull = members.length >= rombel.capacity;
          const percentage = rombel.capacity > 0 ? Math.round((members.length / rombel.capacity) * 100) : 0;

          return (
            <div
              key={rombel.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isFull ? 'border-amber-300 ring-1 ring-amber-300/50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {rombel.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      TA {ay?.nama_tahun_ajaran || '2026/2027'}
                    </span>
                  </div>

                  {isFull ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Kapasitas Penuh</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Tersedia
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {rombel.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas: <span className="font-semibold text-slate-700">{cls?.nama_kelas || '-'}</span>
                  </p>
                </div>

                {/* Info Card */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Wali Kelas:</span>
                    <span className="font-semibold text-slate-800">{homeroom?.nama_lengkap || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pembimbing:</span>
                    <span className="font-medium text-slate-700">{mentor?.nama_lengkap || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                    <span className="text-slate-500">Santri Terdaftar:</span>
                    <span className="font-bold text-slate-900">
                      {members.length} / {rombel.capacity} santri
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-rose-500' : 'bg-sky-600'
                      }`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {rombel.notes && (
                  <p className="text-[11px] text-slate-400 italic">
                    {rombel.notes}
                  </p>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setManagingRombel(rombel)}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Kelola Santri ({members.length})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditRombel(rombel)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Edit Rombel"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRombel(rombel)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Hapus Rombel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD / EDIT ROMBEL */}
      <Modal
        isOpen={isRombelModalOpen}
        onClose={() => setIsRombelModalOpen(false)}
        title={editingRombel ? 'Edit Rombel Belajar' : 'Tambah Rombel Belajar Baru'}
        subtitle="PP Nurus Sholah Batulabang Akkor"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRombel} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Rombel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rombelForm.name}
                onChange={e => setRombelForm({ ...rombelForm, name: e.target.value })}
                placeholder="Contoh: Rombel A (Mubtadi' Putra) / Halaqah 1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Rombel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={rombelForm.code}
                onChange={e => setRombelForm({ ...rombelForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: MUB-A / THF-1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Maksimal <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={rombelForm.capacity}
                onChange={e => setRombelForm({ ...rombelForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Induk <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={rombelForm.class_id}
                onChange={e => setRombelForm({ ...rombelForm, class_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nama_kelas} ({c.tingkat})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={rombelForm.academic_year_id}
                onChange={e => setRombelForm({ ...rombelForm, academic_year_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>TA {y.nama_tahun_ajaran}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wali Kelas
              </label>
              <select
                value={rombelForm.homeroom_teacher_id}
                onChange={e => setRombelForm({ ...rombelForm, homeroom_teacher_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Tanpa Wali Kelas --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pembimbing / Pendamping
              </label>
              <select
                value={rombelForm.mentor_id}
                onChange={e => setRombelForm({ ...rombelForm, mentor_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Tanpa Pembimbing --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Rombel
              </label>
              <textarea
                rows={2}
                value={rombelForm.notes}
                onChange={e => setRombelForm({ ...rombelForm, notes: e.target.value })}
                placeholder="Catatan khusus rombel..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRombelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Simpan Rombel
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: MANAGE STUDENTS IN ROMBEL (DRAWER DIALOG) */}
      {managingRombel && (
        <Modal
          isOpen={true}
          onClose={() => setManagingRombel(null)}
          title={`Kelola Santri: ${managingRombel.name}`}
          subtitle={`Kapasitas: ${students.filter(s => s.rombel_id === managingRombel.id && s.status === 'aktif').length} / ${managingRombel.capacity} santri`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  placeholder="Cari santri dalam rombel..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Santri ke Rombel</span>
              </button>
            </div>

            {/* List of current members */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {students
                .filter(s => s.rombel_id === managingRombel.id && s.status === 'aktif')
                .filter(s => !studentSearch || s.nama_lengkap.toLowerCase().includes(studentSearch.toLowerCase()) || s.nis.includes(studentSearch))
                .map((student, idx) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-slate-400 font-mono text-[11px] text-right">
                        {idx + 1}.
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{student.nama_lengkap}</p>
                        <p className="text-[11px] font-mono text-slate-500">
                          NIS: {student.nis} &bull; {student.jenis_kelamin === 'L' ? 'Putra' : 'Putri'} &bull; {student.asrama || 'Non-Asrama'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStudentToTransfer(student);
                          setTargetTransferRombelId('');
                        }}
                        title="Pindahkan ke rombel lain"
                        className="px-2 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Pindah</span>
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student.id, student.nama_lengkap)}
                        title="Keluarkan dari rombel"
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {students.filter(s => s.rombel_id === managingRombel.id && s.status === 'aktif').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada santri yang ditempatkan pada rombel ini.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setManagingRombel(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: TAMBAH SANTRI KE ROMBEL */}
      {isAddStudentOpen && managingRombel && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddStudentOpen(false)}
          title={`Pilih Santri Masuk Rombel: ${managingRombel.name}`}
          subtitle="Daftar santri aktif yang belum masuk rombel atau perlu penempatan"
          maxWidth="lg"
        >
          <div className="space-y-3">
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {students
                .filter(s => s.status === 'aktif' && s.rombel_id !== managingRombel.id)
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{s.nama_lengkap}</p>
                      <p className="text-[11px] font-mono text-slate-500">
                        NIS: {s.nis} &bull; Rombel Saat Ini: <strong className="text-slate-700">{s.rombel || 'Belum Ada'}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => handleAssignStudent(s.id)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pilih</span>
                    </button>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: PINDAH SANTRI KE ROMBEL LAIN */}
      {studentToTransfer && (
        <Modal
          isOpen={true}
          onClose={() => setStudentToTransfer(null)}
          title={`Pindahkan Santri: ${studentToTransfer.nama_lengkap}`}
          subtitle={`Rombel asal: ${studentToTransfer.rombel || '-'}`}
          maxWidth="md"
        >
          <form onSubmit={handleMoveStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Rombel Tujuan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={targetTransferRombelId}
                onChange={e => setTargetTransferRombelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Rombel Tujuan --</option>
                {rombels
                  .filter(r => r.id !== studentToTransfer.rombel_id)
                  .map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) - Kapasitas: {r.capacity}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToTransfer(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Konfirmasi Pindah Rombel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
