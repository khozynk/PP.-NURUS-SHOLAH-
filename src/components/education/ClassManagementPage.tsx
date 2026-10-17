import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, Users, School, BookOpen, ArrowRight, Filter } from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { SchoolClass } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface ClassManagementPageProps {
  onNavigateToRombel?: (classId: string) => void;
}

export const ClassManagementPage: React.FC<ClassManagementPageProps> = ({ onNavigateToRombel }) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [classes, setClasses] = useState<SchoolClass[]>(() => dbService.getClasses());
  const [programs] = useState(() => dbService.getPrograms());
  const [tracks] = useState(() => dbService.getTracks());
  const [levels] = useState(() => dbService.getLevels());
  const [academicYears] = useState(() => dbService.getAcademicYears());
  const [teachers] = useState(() => dbService.getTeachers());
  const [rombels, setRombels] = useState(() => dbService.getRombels());
  const [students, setStudents] = useState(() => dbService.getStudents());

  const [programFilter, setProgramFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [form, setForm] = useState({
    nama_kelas: '',
    program_id: '',
    track_id: '',
    level_id: '',
    academic_year_id: '',
    tingkat: '',
    wali_kelas_id: '',
    tahun_ajaran: '2026/2027',
    kapasitas: 40,
    status: 'aktif' as 'aktif' | 'nonaktif'
  });

  const reloadData = () => {
    setClasses(dbService.getClasses());
    setRombels(dbService.getRombels());
    setStudents(dbService.getStudents());
  };

  const handleOpenAdd = () => {
    setEditingClass(null);
    const activeAy = dbService.getActiveAcademicYear();
    setForm({
      nama_kelas: '',
      program_id: programs[0]?.id || '',
      track_id: '',
      level_id: '',
      academic_year_id: activeAy?.id || '',
      tingkat: '',
      wali_kelas_id: '',
      tahun_ajaran: activeAy?.nama_tahun_ajaran || '2026/2027',
      kapasitas: 40,
      status: 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: SchoolClass) => {
    setEditingClass(cls);
    setForm({
      nama_kelas: cls.nama_kelas,
      program_id: cls.program_id || '',
      track_id: cls.track_id || '',
      level_id: cls.level_id || '',
      academic_year_id: cls.academic_year_id || '',
      tingkat: cls.tingkat,
      wali_kelas_id: cls.wali_kelas_id || '',
      tahun_ajaran: cls.tahun_ajaran,
      kapasitas: cls.kapasitas,
      status: cls.status || 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teacher = teachers.find(t => t.id === form.wali_kelas_id);
      const ay = academicYears.find(y => y.id === form.academic_year_id);

      const payload = {
        ...form,
        track_id: form.track_id || null,
        level_id: form.level_id || null,
        wali_kelas_nama: teacher?.nama_lengkap || undefined,
        tahun_ajaran: ay?.nama_tahun_ajaran || form.tahun_ajaran
      };

      if (editingClass) {
        dbService.updateClass(editingClass.id, payload, currentUser);
        showToast('Berhasil', `Data kelas "${form.nama_kelas}" diperbarui.`, 'success');
      } else {
        dbService.createClass(payload, currentUser);
        showToast('Berhasil', `Kelas "${form.nama_kelas}" berhasil ditambahkan.`, 'success');
      }
      setIsModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = (cls: SchoolClass) => {
    if (confirm(`Yakin ingin menghapus kelas "${cls.nama_kelas}"?`)) {
      try {
        dbService.deleteClass(cls.id, currentUser);
        showToast('Berhasil', `Kelas "${cls.nama_kelas}" berhasil dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  const filteredClasses = classes.filter(c => {
    if (programFilter !== 'all' && c.program_id !== programFilter) return false;
    if (academicYearFilter !== 'all' && c.academic_year_id !== academicYearFilter && c.tahun_ajaran !== academicYearFilter) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Kelas Pendidikan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar kelas terhubung program, track, tingkatan, tahun ajaran, dan kapasitas rombel
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filter:</span>
        </div>

        <select
          value={programFilter}
          onChange={e => setProgramFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
        >
          <option value="all">Semua Program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={academicYearFilter}
          onChange={e => setAcademicYearFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
        >
          <option value="all">Semua Tahun Ajaran</option>
          {academicYears.map(y => (
            <option key={y.id} value={y.id}>TA {y.nama_tahun_ajaran}</option>
          ))}
        </select>

        <div className="ml-auto text-xs text-slate-500 font-mono">
          Menampilkan <strong>{filteredClasses.length}</strong> kelas
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map((cls) => {
          const prog = programs.find(p => p.id === cls.program_id);
          const track = tracks.find(t => t.id === cls.track_id);
          const teacher = teachers.find(t => t.id === cls.wali_kelas_id);
          const clsRombels = rombels.filter(r => r.class_id === cls.id);
          const enrolledStudents = students.filter(s => s.kelas_id === cls.id && s.status === 'aktif');
          const isFull = enrolledStudents.length >= cls.kapasitas;

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {cls.tingkat || prog?.name || 'Kelas'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    TA {cls.tahun_ajaran}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">
                    {cls.nama_kelas}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {prog?.name || 'Program'}{track ? ` &bull; ${track.name}` : ''}
                  </p>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                  <div>
                    Wali Kelas: <span className="font-semibold text-slate-800">{cls.wali_kelas_nama || teacher?.nama_lengkap || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-mono">
                    <span className="text-slate-500">Kapasitas:</span>
                    <span className="font-bold text-slate-800">{enrolledStudents.length} / {cls.kapasitas} santri</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500">Rombel Terbuka:</span>
                    <span className="font-bold text-sky-700">{clsRombels.length} Rombel</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      isFull ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, (enrolledStudents.length / cls.kapasitas) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {onNavigateToRombel ? (
                  <button
                    onClick={() => onNavigateToRombel(cls.id)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Rombel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">{cls.id}</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Edit Kelas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Hapus Kelas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Edit Kelas Pendidikan' : 'Tambah Kelas Pendidikan Baru'}
        subtitle="PP Nurus Sholah Batulabang Akkor"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama_kelas}
                onChange={e => setForm({ ...form, nama_kelas: e.target.value })}
                placeholder="Contoh: Safinatun Najah - Mubtadi' / Tahfidz Halaqah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Pendidikan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.program_id}
                onChange={e => setForm({ ...form, program_id: e.target.value, track_id: '', level_id: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang / Track (Opsional)
              </label>
              <select
                value={form.track_id}
                onChange={e => setForm({ ...form, track_id: e.target.value, level_id: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Tanpa Cabang --</option>
                {tracks
                  .filter(t => !form.program_id || t.program_id === form.program_id)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat / Jenjang
              </label>
              <select
                value={form.level_id}
                onChange={e => {
                  const lvl = levels.find(l => l.id === e.target.value);
                  setForm({ ...form, level_id: e.target.value, tingkat: lvl?.name || form.tingkat });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Tingkatan --</option>
                {levels
                  .filter(l => (!form.program_id || l.program_id === form.program_id) && (!form.track_id || l.track_id === form.track_id))
                  .map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.academic_year_id}
                onChange={e => setForm({ ...form, academic_year_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.nama_tahun_ajaran} ({y.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wali Kelas
              </label>
              <select
                value={form.wali_kelas_id}
                onChange={e => setForm({ ...form, wali_kelas_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Wali Kelas --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kapasitas Maksimal Santri <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.kapasitas}
                onChange={e => setForm({ ...form, kapasitas: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
