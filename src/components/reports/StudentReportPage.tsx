import React from 'react';
import { BarChart3, Users, Printer, PieChart, MapPin, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';

export const StudentReportPage: React.FC = () => {
  const students = dbService.getStudents();
  const settings = dbService.getSettings();
  const currentUser = authService.getCurrentUser();

  const total = students.length;
  const putra = students.filter(s => s.jenis_kelamin === 'L').length;
  const putri = students.filter(s => s.jenis_kelamin === 'P').length;

  // Breakdown by program
  const byProgram: Record<string, number> = {};
  students.forEach(s => {
    byProgram[s.program] = (byProgram[s.program] || 0) + 1;
  });

  // Breakdown by status
  const byStatus: Record<string, number> = {};
  students.forEach(s => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  // Breakdown by kabupaten
  const byKab: Record<string, number> = {};
  students.forEach(s => {
    const kab = s.kabupaten || 'Tidak Diketahui';
    byKab[kab] = (byKab[kab] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Rekapitulasi Data Santri
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan data santri berdasarkan jenis kelamin, program pengajian, status dan sebaran daerah
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan Resmi</span>
        </button>
      </div>

      {/* Official Header for Print / Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs text-center border-t-4 border-t-emerald-700">
        <h2 className="text-lg font-bold text-slate-900 uppercase">
          {settings.nama_pesantren}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {settings.alamat}, Desa {settings.desa}, Kec. {settings.kecamatan}, Kab. {settings.kabupaten} {settings.kode_pos}
        </p>
        <div className="my-3 border-b border-slate-200" />
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
          REKAPITULASI DATA SANTRI PERIODE TAHUN {new Date().getFullYear()}
        </h3>
      </div>

      {/* Key Numbers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500">Total Santri Terdaftar</span>
          <div className="text-3xl font-bold font-mono text-slate-900 my-1">{total}</div>
          <span className="text-xs text-slate-400">Seluruh status di database</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500">Santri Putra (Laki-laki)</span>
          <div className="text-3xl font-bold font-mono text-emerald-700 my-1">{putra}</div>
          <span className="text-xs text-slate-400">{total > 0 ? ((putra / total) * 100).toFixed(1) : 0}% dari total</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500">Santri Putri (Perempuan)</span>
          <div className="text-3xl font-bold font-mono text-purple-700 my-1">{putri}</div>
          <span className="text-xs text-slate-400">{total > 0 ? ((putri / total) * 100).toFixed(1) : 0}% dari total</span>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Program */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>Distribusi Berdasarkan Program Studi</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(byProgram).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data program.</p>
            ) : (
              Object.entries(byProgram).map(([prog, count]) => (
                <div key={prog} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{prog}</span>
                    <span className="font-mono text-slate-900 font-bold">{count} Santri</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${(count / (total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* By Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>Distribusi Berdasarkan Status Santri</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(byStatus).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data status.</p>
            ) : (
              Object.entries(byStatus).map(([st, count]) => (
                <div key={st} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 capitalize">{st.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-900 font-bold">{count} Santri</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full" 
                      style={{ width: `${(count / (total || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* By Sebaran Daerah */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Sebaran Asal Santri Menurut Kabupaten / Kota</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(byKab).map(([kab, count]) => (
              <div key={kab} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="text-slate-500 truncate">{kab}</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-1">{count} Santri</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Sign-off & Audit Attribution Block */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mt-6 print:border-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Informasi Pengesahan & Penerbitan Dokumen
            </div>
            <p className="text-slate-700">
              Dokumen rekapitulasi data santri ini dicetak secara sah melalui Sistem Manajemen Data Santri PP Nurus Sholah.
            </p>
            <div className="mt-2 text-[11px] text-slate-500">
              Waktu Penerbitan: <span className="font-mono text-slate-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span> · Pukul {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 min-w-[200px]">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Petugas Penerbit:</div>
            <div className="font-bold text-slate-900 text-sm">{currentUser?.nama_lengkap || 'Administrator'}</div>
            <div className="text-slate-500 text-xs">{currentUser?.jabatan || authService.getRoleLabel(currentUser?.role || 'admin')}</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-1">ID Akun: @{currentUser?.username || 'admin'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
