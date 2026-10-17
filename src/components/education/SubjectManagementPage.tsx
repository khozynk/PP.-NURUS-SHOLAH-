import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserCheck, 
  GraduationCap, 
  Layers, 
  School, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  X,
  Sparkles
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Subject, Teacher, EducationProgram, EducationTrack, EducationLevel, Rombel, TeacherSubjectAssignment } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const SubjectManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [subjects, setSubjects] = useState<Subject[]>(() => dbService.getSubjects());
  const [programs] = useState<EducationProgram[]>(() => dbService.getPrograms());
  const [tracks] = useState<EducationTrack[]>(() => dbService.getTracks());
  const [levels] = useState<EducationLevel[]>(() => dbService.getLevels());
  const [teachers] = useState<Teacher[]>(() => dbService.getTeachers());
  const [rombels] = useState<Rombel[]>(() => dbService.getRombels());
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>(() => dbService.getTeacherSubjects());
  const activeYear = dbService.getActiveAcademicYear();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('all');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    program_id: '',
    track_id: '',
    level_id: '',
    nama: '',
    kode: '',
    jenis: 'Kitab',
    deskripsi: '',
    status: 'aktif' as 'aktif' | 'nonaktif'
  });

  // Assign Teacher Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetSubjectForAssign, setTargetSubjectForAssign] = useState<Subject | null>(null);
  const [assignForm, setAssignForm] = useState({
    teacher_id: '',
    rombel_id: '',
    academic_year_id: activeYear?.id || '',
    role: 'pengajar_utama' as 'pengajar_utama' | 'asisten' | 'penguji'
  });

  const reloadData = () => {
    setSubjects(dbService.getSubjects());
    setAssignments(dbService.getTeacherSubjects());
  };

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setSubjectForm({
      program_id: programs[0]?.id || 'prog-kitabiyah',
      track_id: '',
      level_id: '',
      nama: '',
      kode: `MP-${String(subjects.length + 1).padStart(2, '0')}`,
      jenis: 'Kitab',
      deskripsi: '',
      status: 'aktif'
    });
    setIsSubjectModalOpen(true);
  };

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setSubjectForm({
      program_id: s.program_id || programs[0]?.id || '',
      track_id: s.track_id || '',
      level_id: s.level_id || '',
      nama: s.nama,
      kode: s.kode,
      jenis: s.jenis,
      deskripsi: s.deskripsi || '',
      status: s.status
    });
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nama.trim() || !subjectForm.kode.trim() || !subjectForm.program_id) {
      showToast('Peringatan', 'Lengkapi nama materi, kode, dan program pendidikan.', 'error');
      return;
    }

    try {
      if (editingSubject) {
        dbService.updateSubject(editingSubject.id, {
          program_id: subjectForm.program_id,
          track_id: subjectForm.track_id || null,
          level_id: subjectForm.level_id || null,
          nama: subjectForm.nama,
          kode: subjectForm.kode,
          jenis: subjectForm.jenis,
          deskripsi: subjectForm.deskripsi,
          status: subjectForm.status
        }, currentUser);
        showToast('Berhasil', `Materi "${subjectForm.nama}" diperbarui.`, 'success');
      } else {
        dbService.createSubject({
          program_id: subjectForm.program_id,
          track_id: subjectForm.track_id || null,
          level_id: subjectForm.level_id || null,
          nama: subjectForm.nama,
          kode: subjectForm.kode,
          jenis: subjectForm.jenis,
          deskripsi: subjectForm.deskripsi,
          status: subjectForm.status
        }, currentUser);
        showToast('Berhasil', `Materi baru "${subjectForm.nama}" ditambahkan.`, 'success');
      }
      setIsSubjectModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan materi.', 'error');
    }
  };

  const handleDeleteSubject = (s: Subject) => {
    if (!window.confirm(`Yakin ingin menghapus materi ${s.nama}?`)) return;
    try {
      dbService.deleteSubject(s.id, currentUser);
      showToast('Berhasil', `Materi "${s.nama}" dihapus.`, 'success');
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menghapus materi.', 'error');
    }
  };

  const handleOpenAssign = (s: Subject) => {
    setTargetSubjectForAssign(s);
    setAssignForm({
      teacher_id: teachers[0]?.id || '',
      rombel_id: rombels[0]?.id || '',
      academic_year_id: activeYear?.id || '',
      role: 'pengajar_utama'
    });
    setIsAssignModalOpen(true);
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSubjectForAssign || !assignForm.teacher_id || !assignForm.rombel_id) {
      showToast('Peringatan', 'Pilih ustadz pengajar dan rombel sasaran.', 'error');
      return;
    }

    try {
      dbService.assignTeacherSubject({
        teacher_id: assignForm.teacher_id,
        subject_id: targetSubjectForAssign.id,
        rombel_id: assignForm.rombel_id,
        academic_year_id: assignForm.academic_year_id || activeYear?.id || '2026/2027',
        role: assignForm.role
      }, currentUser);

      showToast('Berhasil', 'Penugasan ustadz berhasil ditambahkan.', 'success');
      setIsAssignModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menugaskan ustadz.', 'error');
    }
  };

  const handleRemoveAssign = (assignId: string) => {
    if (!window.confirm('Hapus penugasan pengajar ini?')) return;
    try {
      dbService.removeTeacherSubject(assignId, currentUser);
      showToast('Berhasil', 'Penugasan pengajar dihapus.', 'success');
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menghapus penugasan.', 'error');
    }
  };

  // Filtered subjects
  const filteredSubjects = subjects.filter(s => {
    if (programFilter !== 'all' && s.program_id !== programFilter) return false;
    if (jenisFilter !== 'all' && s.jenis !== jenisFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match = s.nama.toLowerCase().includes(term) || s.kode.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>Mata Pelajaran & Materi Pengajian</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Master kurikulum kitab kuning, tahfidz, BTQ, dan distribusi pengampu dewan asatidz
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
            >
              <option value="all">Semua Program</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
            >
              <option value="all">Semua Jenis</option>
              <option value="Kitab">Kitab Kuning</option>
              <option value="Tahfidz">Tahfidz</option>
              <option value="BTQ">BTQ</option>
              <option value="Murojaah">Murojaah</option>
              <option value="Al-Qur'an">Al-Qur'an</option>
              <option value="Akhlak">Akhlak</option>
              <option value="Umum">Umum</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm sm:text-base">Belum Ada Materi Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Silakan buat materi baru atau ubah kriteria filter pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map(s => {
            const prog = programs.find(p => p.id === s.program_id);
            const trk = tracks.find(t => t.id === s.track_id);
            const lvl = levels.find(l => l.id === s.level_id);
            const subAssignments = assignments.filter(a => a.subject_id === s.id);

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {s.kode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {s.jenis}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{s.nama}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Program: <strong className="text-slate-700">{prog?.name || 'Program'}</strong>
                      {trk && ` \u2022 ${trk.name}`}
                      {lvl && ` \u2022 ${lvl.name}`}
                    </p>
                  </div>

                  {s.deskripsi && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {s.deskripsi}
                    </p>
                  )}

                  {/* Assigned Teachers */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                        <span>Pengampu Asatidz ({subAssignments.length}):</span>
                      </span>
                      <button
                        onClick={() => handleOpenAssign(s)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        + Tugaskan
                      </button>
                    </div>

                    {subAssignments.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Belum ada ustadz yang ditugaskan mengampu materi ini.</p>
                    ) : (
                      <div className="space-y-1">
                        {subAssignments.map(asg => {
                          const t = teachers.find(tch => tch.id === asg.teacher_id);
                          const r = rombels.find(rm => rm.id === asg.rombel_id);

                          return (
                            <div
                              key={asg.id}
                              className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="font-semibold text-slate-800 truncate block">
                                  {t?.nama_lengkap || 'Ustadz'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  Rombel: {r?.name || 'Semua'}
                                </span>
                              </div>

                              <button
                                onClick={() => handleRemoveAssign(asg.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer shrink-0"
                                title="Hapus penugasan"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-1 pt-3 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenAssign(s)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold mr-auto flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tugaskan Pengajar</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    title="Edit Materi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus Materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Subject */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Ubah Data Materi / Kitab' : 'Tambah Materi / Kitab Baru'}
        subtitle="Master mata pelajaran dan silabus kurikulum pesantren"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSubject} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Program Pendidikan <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={subjectForm.program_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, program_id: e.target.value, track_id: '', level_id: '' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cabang / Track (Opsional)</label>
              <select
                value={subjectForm.track_id}
                onChange={(e) => setSubjectForm({ ...subjectForm, track_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="">-- Seluruh Cabang --</option>
                {tracks.filter(t => !subjectForm.program_id || t.program_id === subjectForm.program_id).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tingkatan / Level (Opsional)</label>
              <select
                value={subjectForm.level_id}
                onChange={(e) => setSubjectForm({ ...subjectForm, level_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="">-- Seluruh Tingkatan --</option>
                {levels.filter(l => !subjectForm.track_id || l.track_id === subjectForm.track_id).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Materi / Kitab <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={subjectForm.nama}
                onChange={(e) => setSubjectForm({ ...subjectForm, nama: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Safinatun Najah - Bab Fiqih"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Materi <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={subjectForm.kode}
                onChange={(e) => setSubjectForm({ ...subjectForm, kode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                placeholder="Contoh: KTB-SFN-01"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Materi</label>
              <select
                value={subjectForm.jenis}
                onChange={(e) => setSubjectForm({ ...subjectForm, jenis: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="Kitab">Kitab Kuning</option>
                <option value="Tahfidz">Tahfidz</option>
                <option value="BTQ">BTQ</option>
                <option value="Murojaah">Murojaah</option>
                <option value="Al-Qur'an">Al-Qur'an</option>
                <option value="Akhlak">Akhlak</option>
                <option value="Umum">Umum</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Materi</label>
              <select
                value={subjectForm.status}
                onChange={(e) => setSubjectForm({ ...subjectForm, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="aktif">Aktif Digunakan</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Silabus / Pokok Bahasan</label>
            <textarea
              rows={2}
              value={subjectForm.deskripsi}
              onChange={(e) => setSubjectForm({ ...subjectForm, deskripsi: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              placeholder="Rangkuman kompetensi dan kajian materi..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Materi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Teacher to Subject (Requirement 19) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Tugaskan Pengajar: ${targetSubjectForAssign?.nama || 'Materi'}`}
        subtitle="Hubungkan dewan asatidz dengan materi pengajian dan rombel belajar"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAssign} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ustadz / Guru Pengampu <span className="text-rose-500">*</span></label>
            <select
              required
              value={assignForm.teacher_id}
              onChange={(e) => setAssignForm({ ...assignForm, teacher_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="">-- Pilih Ustadz --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nama_lengkap} &bull; {t.jabatan} ({t.keahlian || 'Umum'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rombel Target <span className="text-rose-500">*</span></label>
              <select
                required
                value={assignForm.rombel_id}
                onChange={(e) => setAssignForm({ ...assignForm, rombel_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="">-- Pilih Rombel --</option>
                {rombels.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peran Penugasan</label>
              <select
                value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="pengajar_utama">Pengajar Utama</option>
                <option value="asisten">Asisten / Muallim</option>
                <option value="penguji">Penguji Munaqasyah</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Penugasan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
