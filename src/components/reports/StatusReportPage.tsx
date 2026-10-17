import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Printer, 
  Download, 
  Filter, 
  FileText, 
  GraduationCap, 
  DoorOpen, 
  UserMinus, 
  UserX, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Student, StudentStatus } from '../../types/database';
import { StatusBadge } from '../common/Badge';
import { useToast } from '../common/Toast';

export const StatusReportPage: React.FC = () => {
  const { showToast } = useToast();
  const students = dbService.getStudents();
  const alumniList = dbService.getAlumni();
  const settings = dbService.getSettings();
  const currentUser = authService.getCurrentUser();

  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const availableYears = useMemo(() => {
    const set = new Set(students.map(s => String(s.tahun_masuk)).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [students]);

  const availablePrograms = useMemo(() => {
    const set = new Set(students.map(s => s.program).filter(Boolean));
    return Array.from(set);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (programFilter !== 'all' && s.program !== programFilter) return false;
      if (genderFilter !== 'all' && s.jenis_kelamin !== genderFilter) return false;
      if (yearFilter !== 'all' && String(s.tahun_masuk) !== yearFilter) return false;
      return true;
    });
  }, [students, statusFilter, programFilter, genderFilter, yearFilter]);

  // Status counts
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      aktif: 0,
      lulus: 0,
      alumni: 0,
      pindah: 0,
      keluar: 0,
      tidak_aktif: 0,
      calon_santri: 0
    };
    students.forEach(s => {
      map[s.status] = (map[s.status] || 0) + 1;
    });
    return map;
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = ['NIS', 'Nama Lengkap', 'Jenis Kelamin', 'Status', 'Tahun Masuk', 'Program', 'Kelas', 'Kabupaten / Asal'];
    const rows = filteredStudents.map(s => [
      `"${s.nis}"`,
      `"${s.nama_lengkap}"`,
      `"${s.jenis_kelamin}"`,
      `"${s.status}"`,
      `"${s.tahun_masuk}"`,
      `"${s.program}"`,
      `"${dbService.getClassName(s.kelas_id)}"`,
      `"${s.kabupaten || s.alamat || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_status_santri_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ekspor Berhasil', `Berhasil mengekspor ${filteredStudents.length} baris data laporan status santri.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Status Santri & Mutasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Laporan lengkap status santri aktif, lulus, alumni, pindah, keluar, dan tidak aktif
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredStudents.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Pesantren Letterhead (Section 26 & Section 24) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center border-t-4 border-t-emerald-700">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src={settings.logo} alt="" className="w-10 h-10 object-contain" />
          <h2 className="text-lg font-bold text-slate-900 uppercase">
            {settings.nama_pesantren}
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl mx-auto">
          {settings.kop_surat}
        </p>
        <div className="my-3 border-b border-slate-200" />
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
          LAPORAN PERJALANAN STATUS SANTRI · TAHUN {new Date().getFullYear()}
        </h3>
      </div>

      {/* 6 Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter(statusFilter === 'aktif' ? 'all' : 'aktif')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'aktif' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Santri Aktif</span>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">{counts.aktif || 0}</div>
          <span className="text-[10px] text-slate-400">Sedang mukim</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'alumni' ? 'all' : 'alumni')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'alumni' ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-500' : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <span className="text-[10px] font-bold text-purple-800 uppercase block">Alumni</span>
          <div className="text-2xl font-bold font-mono text-purple-900 mt-1">{counts.alumni || 0}</div>
          <span className="text-[10px] text-slate-400">Database ikatan</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'lulus' ? 'all' : 'lulus')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'lulus' ? 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <span className="text-[10px] font-bold text-indigo-800 uppercase block">Santri Lulus</span>
          <div className="text-2xl font-bold font-mono text-indigo-900 mt-1">{counts.lulus || 0}</div>
          <span className="text-[10px] text-slate-400">Telah munaqasyah</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'pindah' ? 'all' : 'pindah')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'pindah' ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-500' : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <span className="text-[10px] font-bold text-orange-800 uppercase block">Santri Pindah</span>
          <div className="text-2xl font-bold font-mono text-orange-900 mt-1">{counts.pindah || 0}</div>
          <span className="text-[10px] text-slate-400">Mutasi lembaga</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'keluar' ? 'all' : 'keluar')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'keluar' ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-500' : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <span className="text-[10px] font-bold text-rose-800 uppercase block">Santri Keluar</span>
          <div className="text-2xl font-bold font-mono text-rose-900 mt-1">{counts.keluar || 0}</div>
          <span className="text-[10px] text-slate-400">Berhenti / undur diri</span>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'tidak_aktif' ? 'all' : 'tidak_aktif')}
          className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
            statusFilter === 'tidak_aktif' ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-500' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-700 uppercase block">Tidak Aktif</span>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-1">{counts.tidak_aktif || 0}</div>
          <span className="text-[10px] text-slate-400">Sementara cuti</span>
        </div>
      </div>

      {/* Filter Selector Row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold">Filter Laporan:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Status</option>
          <option value="aktif">Santri Aktif</option>
          <option value="alumni">Alumni</option>
          <option value="lulus">Lulus</option>
          <option value="pindah">Pindah</option>
          <option value="keluar">Keluar</option>
          <option value="tidak_aktif">Tidak Aktif</option>
          <option value="calon_santri">Calon Santri</option>
        </select>

        <select
          value={programFilter}
          onChange={(e) => setProgramFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Program</option>
          {availablePrograms.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Angkatan Masuk</option>
          {availableYears.map(yr => (
            <option key={yr} value={yr}>Masuk {yr}</option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Gender (L/P)</option>
          <option value="L">Laki-laki (Putra)</option>
          <option value="P">Perempuan (Putri)</option>
        </select>

        <span className="ml-auto text-xs text-slate-400 font-medium">
          Ditemukan <strong>{filteredStudents.length}</strong> santri
        </span>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">JK</th>
                <th className="py-3.5 px-4">Tahun Masuk</th>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data santri yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">{s.nis}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.nama_lengkap}</td>
                    <td className="py-3 px-4 font-medium">{s.jenis_kelamin}</td>
                    <td className="py-3 px-4 font-mono">{s.tahun_masuk}</td>
                    <td className="py-3 px-4 text-slate-600">{s.program}</td>
                    <td className="py-3 px-4 text-slate-600">{dbService.getClassName(s.kelas_id)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Sign-off Block (Section 24) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs print:border-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Keterangan Pengesahan Dokumen
            </div>
            <p className="text-slate-700">
              Laporan data status santri dan kelulusan diterbitkan resmi oleh Bagian Administrasi & Sekretariat PP Nurus Sholah Batulabang Akkor.
            </p>
            <div className="mt-2 text-[11px] text-slate-500">
              Dicetak pada: <strong className="text-slate-800">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 min-w-[220px]">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Petugas Validasi:</div>
            <div className="font-bold text-slate-900 text-sm">{currentUser?.nama_lengkap || 'Administrator'}</div>
            <div className="text-slate-500 text-xs">{currentUser?.jabatan || authService.getRoleLabel(currentUser?.role || 'admin')}</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-1">Username: @{currentUser?.username || 'admin'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
