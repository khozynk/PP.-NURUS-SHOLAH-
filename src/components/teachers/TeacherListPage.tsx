import React, { useState } from 'react';
import { 
  UserCheck, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  GraduationCap, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  XCircle,
  Clock,
  ShieldCheck,
  School,
  X
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Teacher } from '../../types/database';
import { TeacherDetailModal } from './TeacherDetailModal';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const TeacherListPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [teachers, setTeachers] = useState<Teacher[]>(() => dbService.getTeachers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [jabatanFilter, setJabatanFilter] = useState<string>('all');

  // Detail Modal
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    nama_panggilan: '',
    gelar: '',
    foto: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    nomor_hp: '',
    email: '',
    pendidikan_terakhir: "S1 Syari'ah / Ma'had Aly",
    keahlian: '',
    jabatan: 'Dewan Asatidz & Pengajar Kitab',
    status: 'aktif' as 'aktif' | 'nonaktif',
    tahun_mulai: new Date().getFullYear(),
    catatan: ''
  });

  const reloadData = () => {
    setTeachers(dbService.getTeachers());
  };

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nip: `UST-${new Date().getFullYear()}-${String(teachers.length + 1).padStart(3, '0')}`,
      nama_lengkap: '',
      nama_panggilan: '',
      gelar: 'Lc.',
      foto: '',
      jenis_kelamin: 'L',
      tempat_lahir: 'Pamekasan',
      tanggal_lahir: '1990-01-01',
      alamat: 'PP Nurus Sholah Batulabang Akkor',
      nomor_hp: '08',
      email: '',
      pendidikan_terakhir: "S1 Syari'ah / Ma'had Aly",
      keahlian: 'Kajian Kitab Kuning & Fiqih',
      jabatan: 'Dewan Asatidz & Pengajar Kitab',
      status: 'aktif',
      tahun_mulai: new Date().getFullYear(),
      catatan: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      nip: t.nip || '',
      nama_lengkap: t.nama_lengkap,
      nama_panggilan: t.nama_panggilan || '',
      gelar: t.gelar || '',
      foto: t.foto || '',
      jenis_kelamin: t.jenis_kelamin || 'L',
      tempat_lahir: t.tempat_lahir || '',
      tanggal_lahir: t.tanggal_lahir || '',
      alamat: t.alamat || '',
      nomor_hp: t.nomor_hp || '',
      email: t.email || '',
      pendidikan_terakhir: t.pendidikan_terakhir || '',
      keahlian: t.keahlian || t.bidang_studi || '',
      jabatan: t.jabatan || 'Dewan Asatidz',
      status: (t.status === 'tidak_aktif' ? 'nonaktif' : 'aktif') as 'aktif' | 'nonaktif',
      tahun_mulai: Number(t.tahun_mulai) || 2020,
      catatan: t.catatan || ''
    });
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap.trim()) {
      showToast('Peringatan', 'Nama lengkap ustadz wajib diisi.', 'error');
      return;
    }

    try {
      if (editingTeacher) {
        dbService.updateTeacher(editingTeacher.id, {
          nip: formData.nip,
          nama_lengkap: formData.nama_lengkap,
          nama_panggilan: formData.nama_panggilan,
          gelar: formData.gelar,
          foto: formData.foto,
          jenis_kelamin: formData.jenis_kelamin,
          tempat_lahir: formData.tempat_lahir,
          tanggal_lahir: formData.tanggal_lahir,
          alamat: formData.alamat,
          nomor_hp: formData.nomor_hp,
          email: formData.email,
          pendidikan_terakhir: formData.pendidikan_terakhir,
          keahlian: formData.keahlian,
          bidang_studi: formData.keahlian,
          jabatan: formData.jabatan,
          status: formData.status,
          tahun_mulai: Number(formData.tahun_mulai),
          catatan: formData.catatan
        }, currentUser);
        showToast('Berhasil', `Data ustadz "${formData.nama_lengkap}" berhasil diperbarui.`, 'success');
      } else {
        dbService.createTeacher({
          nip: formData.nip,
          nama_lengkap: formData.nama_lengkap,
          nama_panggilan: formData.nama_panggilan,
          gelar: formData.gelar,
          foto: formData.foto,
          jenis_kelamin: formData.jenis_kelamin,
          tempat_lahir: formData.tempat_lahir,
          tanggal_lahir: formData.tanggal_lahir,
          alamat: formData.alamat,
          nomor_hp: formData.nomor_hp,
          email: formData.email,
          pendidikan_terakhir: formData.pendidikan_terakhir,
          keahlian: formData.keahlian,
          bidang_studi: formData.keahlian,
          jabatan: formData.jabatan,
          status: formData.status,
          tahun_mulai: Number(formData.tahun_mulai),
          catatan: formData.catatan
        }, currentUser);
        showToast('Berhasil', `Ustadz baru "${formData.nama_lengkap}" berhasil ditambahkan.`, 'success');
      }

      setIsFormOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDelete = (t: Teacher) => {
    if (!window.confirm(`Yakin ingin menonaktifkan/menghapus Ustadz ${t.nama_lengkap}?`)) {
      return;
    }

    try {
      dbService.deleteTeacher(t.id, currentUser);
      showToast('Berhasil', `Data Ustadz ${t.nama_lengkap} telah dinonaktifkan.`, 'success');
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menghapus ustadz.', 'error');
    }
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = 
      t.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.nip && t.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.keahlian && t.keahlian.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.jabatan && t.jabatan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesGender = genderFilter === 'all' || t.jenis_kelamin === genderFilter;
    const matchesJabatan = jabatanFilter === 'all' || (t.jabatan && t.jabatan.toLowerCase().includes(jabatanFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesGender && matchesJabatan;
  });

  const rombels = dbService.getRombels();
  const subjects = dbService.getSubjects();

  // Statistics
  const totalCount = teachers.length;
  const activeCount = teachers.filter(t => t.status === 'aktif').length;
  const homeroomCount = teachers.filter(t => rombels.some(r => r.homeroom_teacher_id === t.id)).length;
  const mentorCount = teachers.filter(t => rombels.some(r => r.mentor_id === t.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-700" />
            <span>Dewan Asatidz & Dewan Guru</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen data dewan asatidz, wali kelas, guru kitabiyah, pembimbing tahfidz & pengasuh PP Nurus Sholah
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ustadz / Guru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Asatidz</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ustadz Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-2">{activeCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Wali Kelas Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-sky-800 mt-2">{homeroomCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pembimbing Halaqah</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-purple-800 mt-2">{mentorCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama ustadz, NIP, keahlian, atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif Saja</option>
              <option value="nonaktif">Nonaktif</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki (Ustadz)</option>
              <option value="P">Perempuan (Ustadzah)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm sm:text-base">Data Ustadz Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tidak ada ustadz yang sesuai dengan kata kunci atau filter yang Anda terapkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => {
            const isHomeroom = rombels.some(r => r.homeroom_teacher_id === t.id);
            const isMentor = rombels.some(r => r.mentor_id === t.id);
            const taughtSubjectCount = dbService.getTeacherSubjects(t.id).length;

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Card Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0 overflow-hidden">
                      {t.foto ? (
                        <img src={t.foto} alt={t.nama_lengkap} className="w-full h-full object-cover" />
                      ) : (
                        <span>{t.nama_lengkap.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'aktif' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {t.jenis_kelamin === 'L' ? 'Ustadz' : 'Ustadzah'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1 truncate" title={t.nama_lengkap}>
                        {t.nama_lengkap}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        {t.nip || 'NIP Belum Ada'}
                      </p>
                    </div>
                  </div>

                  {/* Badges / Roles */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {t.jabatan || 'Dewan Guru'}
                    </span>
                    {isHomeroom && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        Wali Kelas
                      </span>
                    )}
                    {isMentor && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        Pembimbing
                      </span>
                    )}
                  </div>

                  {/* Key Info Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Keahlian:</span>
                      <span className="font-semibold text-slate-800">{t.keahlian || t.bidang_studi || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pendidikan:</span>
                      <span className="font-medium text-slate-700">{t.pendidikan_terakhir || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Materi Diampu:</span>
                      <span className="font-mono font-semibold text-emerald-800">{taughtSubjectCount} Kitab/Mapel</span>
                    </div>
                    {t.nomor_hp && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">WhatsApp:</span>
                        <span className="font-mono text-slate-700">{t.nomor_hp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      setIsDetailOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profil Lengkap</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Edit Data Ustadz"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus / Nonaktifkan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Detail Modal (All 7 Tabs) */}
      <TeacherDetailModal
        teacher={selectedTeacher}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(t) => {
          setIsDetailOpen(false);
          handleOpenEdit(t);
        }}
      />

      {/* Teacher Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTeacher ? 'Ubah Data Ustadz / Guru' : 'Tambah Ustadz / Guru Baru'}
        subtitle="Kelola biodata, amanah jabatan, dan bidang keilmuan dewan asatidz"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP / NIK Ustadz <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600/30"
                placeholder="Contoh: UST-2026-001"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Mengajar <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="aktif">Aktif Mengajar</option>
                <option value="nonaktif">Nonaktif / Cuti</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Ust. H. Ahmad Baihaqi, Lc., M.Pd."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={formData.nama_panggilan}
                onChange={(e) => setFormData({ ...formData, nama_panggilan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Ust. Baihaqi"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="L">Laki-laki (Ustadz)</option>
                <option value="P">Perempuan (Ustadzah)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Pamekasan"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={formData.nomor_hp}
                onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                placeholder="ustadz@nurussolah.id"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
              <input
                type="text"
                value={formData.pendidikan_terakhir}
                onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Ma'had Aly / S1 Dirasat Islamiyah"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Mulai Mengajar</label>
              <input
                type="number"
                value={formData.tahun_mulai}
                onChange={(e) => setFormData({ ...formData, tahun_mulai: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bidang Keahlian / Fan Ilmu</label>
              <input
                type="text"
                value={formData.keahlian}
                onChange={(e) => setFormData({ ...formData, keahlian: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Fiqih Salafiyah, Nahwu-Sharaf, Tahfidz 30 Juz"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jabatan Kepengurusan</label>
              <input
                type="text"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Wali Kelas / Guru Kitab / Pembina Kamar"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili Lengkap</label>
              <textarea
                rows={2}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Dusun Batulabang, Desa Akkor, Palengaan..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Catatan Khusus</label>
              <textarea
                rows={2}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Catatan mengenai riwayat amanah atau penugasan khusus di pondok..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              {editingTeacher ? 'Simpan Perubahan' : 'Tambah Ustadz'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
