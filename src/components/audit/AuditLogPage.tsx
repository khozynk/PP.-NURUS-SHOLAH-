import React, { useState, useMemo } from 'react';
import { History, Search, Download, ShieldCheck, Filter } from 'lucide-react';
import { dbService } from '../../services/db';
import { EmptyState } from '../common/EmptyState';

export const AuditLogPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const logs = dbService.getAuditLogs();

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (activityFilter !== 'all' && log.aktivitas !== activityFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          log.user_name.toLowerCase().includes(q) ||
          log.data_terkait.toLowerCase().includes(q) ||
          log.modul.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, activityFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Waktu', 'Pengguna', 'Role', 'Aktivitas', 'Modul', 'Data Terkait', 'Perangkat'];
    const rows = filtered.map(l => [
      `"${l.waktu}"`,
      `"${l.user_name}"`,
      `"${l.user_role}"`,
      `"${l.aktivitas}"`,
      `"${l.modul}"`,
      `"${l.data_terkait}"`,
      `"${l.ip_device}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Audit Log & Rekam Jejak Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan riil seluruh sesi login, logout, perubahan santri, mutasi status, dan pengaturan
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Ekspor Log (CSV)</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama user, deskripsi, atau modul..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 outline-none"
          />
        </div>

        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          aria-label="Filter jenis aktivitas audit log"
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
        >
          <option value="all">Semua Aktivitas</option>
          <option value="Login">Login</option>
          <option value="Logout">Logout</option>
          <option value="Tambah data">Tambah Data</option>
          <option value="Edit data">Edit Data</option>
          <option value="Hapus/arsip data">Hapus / Arsip</option>
          <option value="Perubahan status">Perubahan Status</option>
          <option value="Perubahan pengaturan">Perubahan Pengaturan</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tidak Ada Rekaman Log"
          description="Belum ada aktivitas yang sesuai dengan kriteria filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Pengguna & Peran</th>
                  <th className="py-3.5 px-4">Aktivitas</th>
                  <th className="py-3.5 px-4">Modul</th>
                  <th className="py-3.5 px-4">Data Terkait</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {log.waktu}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{log.user_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{log.user_role}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        log.aktivitas === 'Login' ? 'bg-sky-50 text-sky-800' :
                        log.aktivitas === 'Logout' ? 'bg-slate-100 text-slate-700' :
                        log.aktivitas === 'Tambah data' ? 'bg-emerald-50 text-emerald-800' :
                        log.aktivitas === 'Perubahan status' ? 'bg-amber-50 text-amber-800' :
                        log.aktivitas === 'Hapus/arsip data' ? 'bg-rose-50 text-rose-800' :
                        'bg-purple-50 text-purple-800'
                      }`}>
                        {log.aktivitas}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {log.modul}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {log.data_terkait}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
