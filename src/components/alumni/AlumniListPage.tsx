import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  Download, 
  Briefcase, 
  Building2, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin, 
  Eye, 
  Edit3,
  Calendar,
  Sparkles,
  Printer,
  CreditCard,
  History,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { dbService, calculateStudyDuration } from '../../services/db';
import { Alumni, Student } from '../../types/database';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { authService } from '../../services/auth';
import { AlumniCardModal } from './AlumniCardModal';

interface AlumniListPageProps {
  onSelectStudent: (student: Student) => void;
  onDataChange: () => void;
}

export const AlumniListPage: React.FC<AlumniListPageProps> = ({
  onSelectStudent,
  onDataChange
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();
  const settings = dbService.getSettings();

  // Search & Filters (Section 21)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [tahunLulusFilter, setTahunLulusFilter] = useState<string>('all');
  const [tahunMasukFilter, setTahunMasukFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);

  // Modals state
  const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<{ alumni: Alumni; student?: Student } | null>(null);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);
  const [cardAlumni, setCardAlumni] = useState<{ alumni: Alumni; student?: Student } | null>(null);

  // Edit form states (Section 10)
  const [editPendidikan, setEditPendidikan] = useState('');
  const [editKampus, setEditKampus] = useState('');
  const [editJurusan, setEditJurusan] = useState('');
  const [editPekerjaan, setEditPekerjaan] = useState('');
  const [editTempatKerja, setEditTempatKerja] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editKotaTinggal, setEditKotaTinggal] = useState('');
  const [editStatus, setEditStatus] = useState<Alumni['status']>('kuliah');
  const [editHp, setEditHp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCatatan, setEditCatatan] = useState('');

  const canEdit = authService.hasPermission('alumni.edit') || authService.hasPermission('alumni.update');
  const canExport = authService.hasPermission('alumni.export');
  const canPrint = authService.hasPermission('alumni.print');

  const alumniList = dbService.getAlumni();
  const students = dbService.getStudents();

  // Relational join with students (Section 23: students.id tetap, alumni.student_id terhubung)
  const joinedAlumni = useMemo(() => {
    return alumniList.map(a => {
      const student = students.find(s => s.id === a.student_id);
      return {
        alumni: a,
        student
      };
    });
  }, [alumniList, students]);

  // Statistik Real-Time Database (Section 20: Dashboard Alumni)
  const stats = useMemo(() => {
    const totalAlumni = joinedAlumni.length;
    const currentYear = new Date().getFullYear();
    const tahunIni = joinedAlumni.filter(j => Number(j.alumni.tahun_lulus) === currentYear).length;
    const tahunSebelumnya = joinedAlumni.filter(j => Number(j.alumni.tahun_lulus) === (currentYear - 1)).length;
    
    const putra = joinedAlumni.filter(j => j.student?.jenis_kelamin === 'L').length;
    const putri = joinedAlumni.filter(j => j.student?.jenis_kelamin === 'P').length;

    const kuliah = joinedAlumni.filter(j => j.alumni.status === 'kuliah' || !!j.alumni.pendidikan_lanjutan).length;
    const bekerja = joinedAlumni.filter(j => j.alumni.status === 'bekerja' || j.alumni.status === 'wirausaha' || !!j.alumni.pekerjaan).length;
    const belumUpdate = joinedAlumni.filter(j => j.alumni.status === 'belum_terlacak' && !j.alumni.pekerjaan && !j.alumni.pendidikan_lanjutan).length;

    // Distribusi tahun lulus
    const yearCounts: Record<string, number> = {};
    joinedAlumni.forEach(j => {
      const yr = String(j.alumni.tahun_lulus || 'Lainnya');
      yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    });

    return {
      totalAlumni,
      tahunIni,
      tahunSebelumnya,
      putra,
      putri,
      kuliah,
      bekerja,
      belumUpdate,
      yearCounts
    };
  }, [joinedAlumni]);

  // Distinct filter values
  const availableYearsLulus = useMemo(() => {
    const set = new Set(alumniList.map(a => String(a.tahun_lulus)).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [alumniList]);

  const availableYearsMasuk = useMemo(() => {
    const set = new Set(alumniList.map(a => String(a.tahun_masuk)).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [alumniList]);

  const availablePrograms = useMemo(() => {
    const set = new Set(alumniList.map(a => a.program).filter(Boolean));
    return Array.from(set);
  }, [alumniList]);

  // Filter Logic (Section 21)
  const filteredAlumni = useMemo(() => {
    return joinedAlumni.filter(({ alumni, student }) => {
      if (statusFilter !== 'all' && alumni.status !== statusFilter) return false;
      if (programFilter !== 'all' && alumni.program !== programFilter) return false;
      if (tahunLulusFilter !== 'all' && String(alumni.tahun_lulus) !== tahunLulusFilter) return false;
      if (tahunMasukFilter !== 'all' && String(alumni.tahun_masuk) !== tahunMasukFilter) return false;
      if (genderFilter !== 'all' && student?.jenis_kelamin !== genderFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = student?.nama_lengkap.toLowerCase().includes(q) || false;
        const matchNis = student?.nis.toLowerCase().includes(q) || false;
        const matchIdAlumni = alumni.id_alumni.toLowerCase().includes(q);
        const matchHp = alumni.nomor_hp.toLowerCase().includes(q) || student?.nomor_hp.toLowerCase().includes(q) || false;
        const matchPekerjaan = (alumni.pekerjaan || '').toLowerCase().includes(q);
        const matchKampus = (alumni.pendidikan_lanjutan || '').toLowerCase().includes(q);
        const matchKota = (alumni.kota_tinggal || alumni.alamat || '').toLowerCase().includes(q);

        return matchName || matchNis || matchIdAlumni || matchHp || matchPekerjaan || matchKampus || matchKota;
      }

      return true;
    });
  }, [joinedAlumni, statusFilter, programFilter, tahunLulusFilter, tahunMasukFilter, genderFilter, searchTerm]);

  const handleOpenEdit = (alumni: Alumni) => {
    setEditingAlumni(alumni);
    setEditPendidikan(alumni.pendidikan_lanjutan || '');
    setEditKampus(alumni.kampus_sekolah || '');
    setEditJurusan(alumni.jurusan || '');
    setEditPekerjaan(alumni.pekerjaan || '');
    setEditTempatKerja(alumni.tempat_kerja || '');
    setEditJabatan(alumni.jabatan || '');
    setEditKotaTinggal(alumni.kota_tinggal || '');
    setEditStatus(alumni.status);
    setEditHp(alumni.nomor_hp || '');
    setEditEmail(alumni.email || '');
    setEditCatatan(alumni.catatan || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlumni) return;

    dbService.updateAlumni(editingAlumni.id, {
      pendidikan_lanjutan: editPendidikan,
      kampus_sekolah: editKampus,
      jurusan: editJurusan,
      pekerjaan: editPekerjaan,
      tempat_kerja: editTempatKerja,
      jabatan: editJabatan,
      kota_tinggal: editKotaTinggal,
      status: editStatus,
      nomor_hp: editHp,
      email: editEmail,
      catatan: editCatatan
    }, currentUser || undefined);

    showToast('Alumni Diperbarui', 'Data karir & pendidikan alumni berhasil diperbarui.', 'success');
    setEditingAlumni(null);
    onDataChange();
  };

  // Export CSV / Excel (Section 24)
  const handleExportCSV = () => {
    if (filteredAlumni.length === 0) return;
    const headers = [
      'ID Alumni',
      'NIS',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Tahun Masuk',
      'Tahun Lulus',
      'Tanggal Lulus',
      'Lama Belajar',
      'Program',
      'Kelas Terakhir',
      'Nomor Ijazah',
      'Predikat',
      'Status Aktivitas',
      'Pendidikan Lanjutan',
      'Pekerjaan',
      'Tempat Kerja',
      'Jabatan',
      'Kota Domisili',
      'Nomor HP',
      'Email'
    ];

    const rows = filteredAlumni.map(({ alumni, student }) => [
      `"${alumni.id_alumni}"`,
      `"${student?.nis || ''}"`,
      `"${student?.nama_lengkap || 'Santri Terkait'}"`,
      `"${student?.jenis_kelamin || ''}"`,
      `"${alumni.tahun_masuk}"`,
      `"${alumni.tahun_lulus}"`,
      `"${alumni.tanggal_lulus}"`,
      `"${alumni.lama_belajar || ''}"`,
      `"${alumni.program}"`,
      `"${alumni.kelas_terakhir || ''}"`,
      `"${alumni.nomor_ijazah || ''}"`,
      `"${alumni.predikat || ''}"`,
      `"${alumni.status}"`,
      `"${alumni.pendidikan_lanjutan || ''}"`,
      `"${alumni.pekerjaan || ''}"`,
      `"${alumni.tempat_kerja || ''}"`,
      `"${alumni.jabatan || ''}"`,
      `"${alumni.kota_tinggal || alumni.alamat || ''}"`,
      `"${alumni.nomor_hp || ''}"`,
      `"${alumni.email || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_alumni_pp_nurus_sholah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor Berhasil', `Berhasil mengekspor ${filteredAlumni.length} data alumni ke format CSV.`, 'success');
  };

  const handlePrintList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Data Alumni & Penelusuran Karir</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {stats.totalAlumni} Terdaftar
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsip permanen alumni terhubung secara relasional (student_id &rarr; students.id) tanpa duplikasi record
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            <span>{showStats ? 'Sembunyikan Statistik' : 'Lihat Statistik'}</span>
          </button>

          {canPrint && (
            <button
              onClick={handlePrintList}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Cetak Berkas Daftar Alumni"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Rekap</span>
            </button>
          )}

          {canExport && (
            <button
              onClick={handleExportCSV}
              disabled={filteredAlumni.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel / CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD STATISTIK ALUMNI (Section 20: Real data from database) */}
      {showStats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Alumni</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{stats.totalAlumni}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Terverifikasi di sistem</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Lulus Tahun Ini</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">{stats.tahunIni}</div>
              <span className="text-[10px] text-slate-500">Thn {new Date().getFullYear()}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tahun Sebelumnya</span>
              <div className="text-xl font-bold text-slate-800 mt-1">{stats.tahunSebelumnya}</div>
              <span className="text-[10px] text-slate-500">Thn {new Date().getFullYear() - 1}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Lanjut Kuliah</span>
              <div className="text-xl font-bold text-blue-700 mt-1">{stats.kuliah}</div>
              <span className="text-[10px] text-blue-600">Perguruan tinggi</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Bekerja / Usaha</span>
              <div className="text-xl font-bold text-amber-700 mt-1">{stats.bekerja}</div>
              <span className="text-[10px] text-amber-600">Karir & mandiri</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Gender (L / P)</span>
              <div className="text-base font-bold text-slate-800 mt-1">{stats.putra} L · {stats.putri} P</div>
              <span className="text-[10px] text-slate-500">Distribusi jenis kelamin</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Belum Update</span>
              <div className="text-xl font-bold text-rose-600 mt-1">{stats.belumUpdate}</div>
              <span className="text-[10px] text-slate-400">Perlu penelusuran</span>
            </div>
          </div>

          {/* Grafik Batang Tahun Lulus (Section 20) */}
          {Object.keys(stats.yearCounts).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Distribusi Kelulusan per Angkatan / Tahun Lulus</span>
                <span className="text-[11px] text-slate-400">Data riil database</span>
              </div>
              <div className="flex items-end gap-3 pt-2 overflow-x-auto pb-1">
                {Object.entries(stats.yearCounts).map(([yr, count]) => {
                  const maxCount = Math.max(...Object.values(stats.yearCounts), 1);
                  const heightPercent = Math.max(Math.round((count / maxCount) * 100), 15);
                  return (
                    <div key={yr} className="flex flex-col items-center gap-1.5 min-w-[50px]">
                      <span className="text-[10px] font-bold text-slate-700">{count}</span>
                      <div className="w-8 bg-emerald-700/80 hover:bg-emerald-800 rounded-t-lg transition-all" style={{ height: `${heightPercent}px` }} />
                      <span className="text-[10px] text-slate-500 font-mono">{yr}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FILTER & PENCARIAN GLOBAL (Section 21 & Section 28) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama alumni, NIS, ID Alumni (ALM-...), nomor HP, kota, kampus, atau pekerjaan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Status Aktivitas */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status aktivitas alumni"
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">Semua Aktivitas</option>
              <option value="kuliah">Kuliah / Studi Lanjut</option>
              <option value="bekerja">Bekerja</option>
              <option value="wirausaha">Wirausaha / Mandiri</option>
              <option value="aktif_organisasi">Aktif Ikatan Alumni</option>
              <option value="belum_terlacak">Belum Terlacak</option>
            </select>

            {/* Filter Tahun Lulus */}
            <select
              value={tahunLulusFilter}
              onChange={(e) => setTahunLulusFilter(e.target.value)}
              aria-label="Filter tahun lulus"
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">Semua Thn Lulus</option>
              {availableYearsLulus.map(yr => (
                <option key={yr} value={yr}>Lulus {yr}</option>
              ))}
            </select>

            {/* Filter Program */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              aria-label="Filter program"
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">Semua Program</option>
              {availablePrograms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Filter Gender */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              aria-label="Filter gender"
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
            >
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki (Putra)</option>
              <option value="P">Perempuan (Putri)</option>
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>Menampilkan <strong>{filteredAlumni.length}</strong> dari {alumniList.length} alumni</span>
          {(searchTerm || statusFilter !== 'all' || tahunLulusFilter !== 'all' || programFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTahunLulusFilter('all');
                setProgramFilter('all');
                setGenderFilter('all');
              }}
              className="text-emerald-700 hover:underline font-medium"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* TABLE ALUMNI LENGKAP (Section 7: Tabel Lengkap Kolom) */}
      {filteredAlumni.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Tidak Ada Data Alumni Ditemukan"
          description={
            alumniList.length === 0
              ? 'Belum ada data alumni di sistem. Ketika Anda memproses kelulusan santri aktif, data alumni otomatis terbuat dan terhubung tanpa perlu diketik ulang.'
              : 'Tidak ditemukan data alumni yang cocok dengan pencarian atau filter yang dipilih.'
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Foto & Nama</th>
                  <th className="py-3.5 px-4">ID Alumni / NIS</th>
                  <th className="py-3.5 px-4">Masuk / Lulus</th>
                  <th className="py-3.5 px-4">Lama Belajar</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Program</th>
                  <th className="py-3.5 px-4">Aktivitas / Karir</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Pendidikan Lanjutan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlumni.map(({ alumni, student }) => {
                  const duration = alumni.lama_belajar || calculateStudyDuration(
                    alumni.tahun_masuk,
                    alumni.tanggal_masuk,
                    alumni.tahun_lulus,
                    alumni.tanggal_lulus
                  ).text;

                  return (
                    <tr key={alumni.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* 1. Foto & Nama */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-2xs border border-emerald-700">
                            {student?.foto ? (
                              <img src={student.foto} alt={student.nama_lengkap} className="w-full h-full object-cover" />
                            ) : (
                              (student?.nama_lengkap || 'A').charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {student?.nama_lengkap || 'Santri Terkait'}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>JK: {student?.jenis_kelamin || '-'}</span>
                              {alumni.kota_tinggal && <span>· {alumni.kota_tinggal}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. ID Alumni & NIS */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-bold text-emerald-800">{alumni.id_alumni}</div>
                        <div className="text-[11px] text-slate-400">NIS: {student?.nis || '-'}</div>
                      </td>

                      {/* 3. Tahun Masuk & Tahun Lulus */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">Lulus: {alumni.tahun_lulus}</div>
                        <div className="text-[11px] text-slate-400">Masuk: {alumni.tahun_masuk}</div>
                      </td>

                      {/* 4. Lama Belajar */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{duration}</span>
                        </span>
                      </td>

                      {/* 5. Program */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-700">
                        <div className="font-medium truncate max-w-[150px]">{alumni.program}</div>
                        {alumni.kelas_terakhir && (
                          <div className="text-[11px] text-slate-400">{alumni.kelas_terakhir}</div>
                        )}
                      </td>

                      {/* 6. Pekerjaan / Karir */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{alumni.pekerjaan || 'Belum Diisi'}</div>
                        <div className="text-[11px] text-slate-400">{alumni.tempat_kerja || '-'}</div>
                      </td>

                      {/* 7. Pendidikan Lanjutan */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-slate-700">
                        <div className="font-medium truncate max-w-[180px]">{alumni.pendidikan_lanjutan || '-'}</div>
                        {alumni.jurusan && <div className="text-[11px] text-slate-400">{alumni.jurusan}</div>}
                      </td>

                      {/* 8. Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
                          alumni.status === 'kuliah' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          alumni.status === 'bekerja' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          alumni.status === 'wirausaha' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          alumni.status === 'aktif_organisasi' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {alumni.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* 9. Aksi: Lihat Profil, Edit, Cetak, Riwayat */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Aksi 1: Lihat Profil */}
                          <button
                            onClick={() => setSelectedAlumniDetail({ alumni, student })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                            title="Lihat Profil Alumni Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Aksi 2: Edit */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(alumni)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                              title="Edit / Update Data Alumni"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Aksi 3: Cetak Kartu Alumni */}
                          <button
                            onClick={() => setCardAlumni({ alumni, student })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-slate-100 transition-colors"
                            title="Cetak Kartu Tanda Alumni (QR Code)"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>

                          {/* Aksi 4: Riwayat / Lihat Santri Asal */}
                          {student && (
                            <button
                              onClick={() => onSelectStudent(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                              title="Lihat Timeline Riwayat Santri"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PROFIL DETAIL ALUMNI (Section 8) */}
      {selectedAlumniDetail && (
        <Modal
          isOpen={!!selectedAlumniDetail}
          onClose={() => setSelectedAlumniDetail(null)}
          title="Profil Alumni Pesantren"
          subtitle={`${selectedAlumniDetail.student?.nama_lengkap || ''} · ${selectedAlumniDetail.alumni.id_alumni}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Top Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-xs">
                {selectedAlumniDetail.student?.foto ? (
                  <img src={selectedAlumniDetail.student.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  (selectedAlumniDetail.student?.nama_lengkap || 'A').charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {selectedAlumniDetail.student?.nama_lengkap}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {selectedAlumniDetail.alumni.id_alumni}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-mono">NIS: {selectedAlumniDetail.student?.nis}</span>
                  <span>·</span>
                  <span>JK: {selectedAlumniDetail.student?.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span>·</span>
                  <span>{selectedAlumniDetail.student?.tempat_lahir}, {selectedAlumniDetail.student?.tanggal_lahir}</span>
                </div>
              </div>
            </div>

            {/* Bagian: RIWAYAT PESANTREN */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Riwayat Masa Pendidikan di Pesantren
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">Tahun Masuk</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAlumniDetail.alumni.tahun_masuk} {selectedAlumniDetail.alumni.tanggal_masuk ? `(${selectedAlumniDetail.alumni.tanggal_masuk})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Tahun Lulus</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAlumniDetail.alumni.tahun_lulus} {selectedAlumniDetail.alumni.tanggal_lulus ? `(${selectedAlumniDetail.alumni.tanggal_lulus})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Lama Belajar</span>
                  <span className="font-bold text-emerald-800">
                    {selectedAlumniDetail.alumni.lama_belajar || calculateStudyDuration(
                      selectedAlumniDetail.alumni.tahun_masuk,
                      selectedAlumniDetail.alumni.tanggal_masuk,
                      selectedAlumniDetail.alumni.tahun_lulus,
                      selectedAlumniDetail.alumni.tanggal_lulus
                    ).text}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Program Diselesaikan</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.program}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Kelas Terakhir</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.kelas_terakhir || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Predikat / Ijazah</span>
                  <span className="font-semibold text-slate-800">
                    {selectedAlumniDetail.alumni.predikat || 'Lulus'} {selectedAlumniDetail.alumni.nomor_ijazah ? `(${selectedAlumniDetail.alumni.nomor_ijazah})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Bagian: DATA SETELAH LULUS (Section 8 & 10) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Data Penelusuran Setelah Lulus
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 block">Pendidikan Lanjutan</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.pendidikan_lanjutan || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Kampus / Sekolah</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.kampus_sekolah || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Jurusan</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.jurusan || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Pekerjaan Saat Ini</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.pekerjaan || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Tempat Kerja / Lembaga</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.tempat_kerja || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Jabatan / Posisi</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.jabatan || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Kota Tempat Tinggal</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.kota_tinggal || selectedAlumniDetail.alumni.alamat || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Nomor HP / WhatsApp</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedAlumniDetail.alumni.nomor_hp || selectedAlumniDetail.student?.nomor_hp || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800">{selectedAlumniDetail.alumni.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Catatan Alumni */}
            {selectedAlumniDetail.alumni.catatan && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-0.5">Catatan Alumni</span>
                <p className="text-slate-700 leading-relaxed">{selectedAlumniDetail.alumni.catatan}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCardAlumni(selectedAlumniDetail)}
                className="px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cetak Kartu Alumni</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedAlumniDetail.student && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAlumniDetail(null);
                      onSelectStudent(selectedAlumniDetail.student!);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Lihat Biodata Asal</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAlumniDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL UPDATE / EDIT DATA ALUMNI (Section 10) */}
      {editingAlumni && (
        <Modal
          isOpen={!!editingAlumni}
          onClose={() => setEditingAlumni(null)}
          title="Perbarui Data Alumni"
          subtitle={`ID Alumni: ${editingAlumni.id_alumni}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Aktivitas
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  <option value="kuliah">Kuliah / Studi Lanjut</option>
                  <option value="bekerja">Bekerja</option>
                  <option value="wirausaha">Wirausaha / Mandiri</option>
                  <option value="aktif_organisasi">Aktif Ikatan Alumni</option>
                  <option value="belum_terlacak">Belum Terlacak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota Tempat Tinggal
                </label>
                <input
                  type="text"
                  value={editKotaTinggal}
                  onChange={(e) => setEditKotaTinggal(e.target.value)}
                  placeholder="Contoh: Malang / Surabaya / Pamekasan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendidikan Lanjutan
                </label>
                <input
                  type="text"
                  value={editPendidikan}
                  onChange={(e) => setEditPendidikan(e.target.value)}
                  placeholder="Contoh: S1 Pendidikan Agama Islam"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kampus / Sekolah
                </label>
                <input
                  type="text"
                  value={editKampus}
                  onChange={(e) => setEditKampus(e.target.value)}
                  placeholder="Contoh: UIN Maulana Malik Ibrahim Malang"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  value={editPekerjaan}
                  onChange={(e) => setEditPekerjaan(e.target.value)}
                  placeholder="Contoh: Guru / Dosen / Wiraswasta"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Kerja / Instansi
                </label>
                <input
                  type="text"
                  value={editTempatKerja}
                  onChange={(e) => setEditTempatKerja(e.target.value)}
                  placeholder="Contoh: Pondok Pesantren / PT / Sekolah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={editHp}
                  onChange={(e) => setEditHp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Alumni
              </label>
              <textarea
                rows={2}
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                placeholder="Aktivitas di ikatan alumni, prestasi setelah lulus..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAlumni(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL CETAK KARTU ALUMNI (Section 25) */}
      {cardAlumni && (
        <AlumniCardModal
          isOpen={!!cardAlumni}
          onClose={() => setCardAlumni(null)}
          alumni={cardAlumni.alumni}
          student={cardAlumni.student}
          settings={settings}
        />
      )}
    </div>
  );
};
