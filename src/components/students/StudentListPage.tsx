import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Download, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  MapPin,
  Phone
} from 'lucide-react';
import { Student, StudentStatus } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { StatusBadge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';

interface StudentListPageProps {
  initialStatusFilter?: StudentStatus | 'all';
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onChangeStatus: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  onOpenAddModal: () => void;
  title?: string;
  subtitle?: string;
}

export const StudentListPage: React.FC<StudentListPageProps> = ({
  initialStatusFilter = 'all',
  onSelectStudent,
  onEditStudent,
  onChangeStatus,
  onDeleteStudent,
  onOpenAddModal,
  title = 'Data Santri',
  subtitle = 'Kelola direktori seluruh santri Pondok Pesantren Nurus Sholah'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>(initialStatusFilter);
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const canCreate = authService.hasPermission('students.create');
  const canEdit = authService.hasPermission('students.edit');
  const canArchive = authService.hasPermission('students.archive');
  const canExport = authService.hasPermission('students.export');

  const students = dbService.getStudents();
  const classes = dbService.getClasses();

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }

      // Program filter
      if (programFilter !== 'all' && s.program !== programFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = s.nama_lengkap.toLowerCase().includes(query);
        const matchNis = s.nis.toLowerCase().includes(query);
        const matchNisn = s.nisn?.toLowerCase().includes(query);
        const matchDesa = s.desa?.toLowerCase().includes(query);
        const matchKab = s.kabupaten?.toLowerCase().includes(query);
        const matchAsal = s.asal_sekolah?.toLowerCase().includes(query);

        return matchName || matchNis || matchNisn || matchDesa || matchKab || matchAsal;
      }

      return true;
    });
  }, [students, statusFilter, programFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = ['NIS', 'Nama Lengkap', 'Jenis Kelamin', 'Program', 'Kelas', 'Desa', 'Kabupaten', 'Tahun Masuk', 'Status'];
    const rows = filteredStudents.map(s => [
      `"${s.nis}"`,
      `"${s.nama_lengkap}"`,
      `"${s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}"`,
      `"${s.program}"`,
      `"${dbService.getClassName(s.kelas_id)}"`,
      `"${s.desa || ''}"`,
      `"${s.kabupaten || ''}"`,
      `"${s.tahun_masuk}"`,
      `"${s.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_santri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const programs = Array.from(new Set(students.map(s => s.program).filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {canExport && (
            <button
              onClick={handleExportCSV}
              disabled={filteredStudents.length === 0}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Ekspor CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          )}

          {canCreate && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Santri</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, NIS, NISN, asal sekolah, atau daerah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent text-slate-800"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter status santri"
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Santri Aktif</option>
              <option value="calon_santri">Calon Santri</option>
              <option value="lulus">Lulus</option>
              <option value="alumni">Alumni</option>
              <option value="pindah">Pindah</option>
              <option value="keluar">Keluar</option>
              <option value="tidak_aktif">Tidak Aktif</option>
            </select>

            {/* Program Filter */}
            {programs.length > 0 && (
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                aria-label="Filter program studi santri"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="all">Semua Program</option>
                {programs.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Status Count Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500 pt-1">
          <span>Menampilkan: <strong className="text-slate-800">{filteredStudents.length}</strong> santri</span>
          {initialStatusFilter !== 'all' && (
            <span className="text-emerald-700 font-medium">· Filter bawaan: {initialStatusFilter}</span>
          )}
        </div>
      </div>

      {/* Main List: Mobile Cards (< md) & Desktop Table (>= md) */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Santri"
          description={
            searchTerm || statusFilter !== 'all'
              ? 'Tidak ditemukan data santri yang cocok dengan kriteria pencarian atau filter yang dipilih.'
              : 'Database santri masih kosong. Tambahkan santri baru atau muat data demo untuk pengujian.'
          }
          actionText="+ Tambah Santri Baru"
          onAction={onOpenAddModal}
        />
      ) : (
        <>
          {/* MOBILE CARDS (Tampilan HP: Card List Responsive Sesuai Permintaan Tahap 2) */}
          <div className="md:hidden space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs active:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-emerald-200">
                      {student.foto ? (
                        <img src={student.foto} alt={student.nama_lengkap} className="w-full h-full object-cover" />
                      ) : (
                        student.nama_lengkap.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate text-sm flex items-center gap-1.5">
                        <span>{student.nama_lengkap}</span>
                        {student.is_demo && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold shrink-0">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        NIS: {student.nis} {student.nisn ? `· NISN: ${student.nisn}` : ''}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={student.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-slate-400 block">Program & Kelas:</span>
                    <span className="font-semibold text-slate-700">{student.program}</span>
                    <div className="text-slate-500">Kelas: {dbService.getClassName(student.kelas_id)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Kelamin & Asal:</span>
                    <span className="font-semibold text-slate-700">{student.jenis_kelamin === 'L' ? 'Putra (L)' : 'Putri (P)'}</span>
                    <div className="text-slate-500 truncate">{student.desa || student.kabupaten || '-'}</div>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div 
                  className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelectStudent(student)}
                    className="px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profil</span>
                  </button>

                  {canEdit && (
                    <>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onChangeStatus(student)}
                        className="px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Mutasi / Status"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Status</span>
                      </button>
                    </>
                  )}

                  {canArchive && (
                    <button
                      onClick={() => onDeleteStudent(student)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus / Arsip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE (Tampilan Komputer / Tablet) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Santri</th>
                    <th className="py-3.5 px-4">NIS / NISN</th>
                    <th className="py-3.5 px-4">Program & Kelas</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Daerah Asal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      {/* Santri Name & JK */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-emerald-200">
                            {student.foto ? (
                              <img src={student.foto} alt={student.nama_lengkap} className="w-full h-full object-cover" />
                            ) : (
                              student.nama_lengkap.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                              {student.nama_lengkap}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{student.jenis_kelamin === 'L' ? 'Putra (L)' : 'Putri (P)'}</span>
                              {student.is_demo && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold">
                                  DEMO
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NIS / NISN */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-semibold text-slate-800">{student.nis}</div>
                        <div className="text-[11px] text-slate-400">{student.nisn || '-'}</div>
                      </td>

                      {/* Program & Kelas */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{student.program}</div>
                        <div className="text-[11px] text-slate-500">
                          Kelas: {dbService.getClassName(student.kelas_id)}
                        </div>
                      </td>

                      {/* Daerah Asal */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-slate-600">
                        <div>{student.desa ? `${student.desa}, ${student.kecamatan}` : student.alamat}</div>
                        <div className="text-[11px] text-slate-400">{student.kabupaten}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={student.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td 
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                            title="Lihat Detail & Riwayat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => onEditStudent(student)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                                title="Ubah Data"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onChangeStatus(student)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                                title="Mutasi Status (Lulus, Pindah, Keluar)"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {canArchive && (
                            <button
                              onClick={() => onDeleteStudent(student)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors"
                              title="Hapus / Arsip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
