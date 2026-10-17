import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Sparkles,
  Users
} from 'lucide-react';
import { dbService } from '../../services/db';
import { MurojaahRecord } from '../../types/database';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

export const MurojaahPage: React.FC = () => {
  const { showToast } = useToast();
  const records = dbService.getMurojaahRecords();
  const teachers = dbService.getTeachers();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedResultFilter, setSelectedResultFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [form, setForm] = useState<Partial<MurojaahRecord>>({
    student_id: '',
    teacher_id: teachers[0]?.id || 'tchr-03',
    tanggal: new Date().toISOString().slice(0, 10),
    juz: 1,
    surah: 'Al-Baqarah',
    ayat: '1-141',
    halaman: 21,
    jenis_murojaah: 'Murojaah Harian',
    hasil: 'Lancar',
    nilai: 85,
    catatan: ''
  });

  const filteredRecords = records.filter(r => {
    if (selectedResultFilter !== 'all' && r.hasil !== selectedResultFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const st = students.find(s => s.id === r.student_id);
      return st?.nama_lengkap.toLowerCase().includes(q) || r.surah.toLowerCase().includes(q);
    }
    return true;
  });

  // Analytics on Murojaah
  const lancarCount = records.filter(r => r.hasil === 'Lancar').length;
  const bermasalahCount = records.filter(r => r.hasil === 'Banyak Kesalahan' || r.hasil === 'Perlu Diulang').length;

  const handleOpenAdd = () => {
    setForm({
      student_id: students[0]?.id || '',
      teacher_id: teachers[0]?.id || 'tchr-03',
      tanggal: new Date().toISOString().slice(0, 10),
      juz: 1,
      surah: 'Al-Baqarah',
      ayat: '1-141',
      halaman: 21,
      jenis_murojaah: 'Murojaah Harian',
      hasil: 'Lancar',
      nilai: 85,
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id || !form.surah) {
      showToast('Pilih Santri', 'Lengkapi data santri dan surah murojaah.', 'warning');
      return;
    }

    try {
      dbService.addMurojaahRecord(form);
      showToast('Murojaah Dicatat', 'Rekod murojaah harian berhasil disimpan.', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Error saat mencatat murojaah.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>AKADEMIK &bull; MODUL MUROJAAH TERPISAH</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Pengulangan Murojaah Hafalan Santri
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Murojaah harian, mingguan, tasmi', serta deteksi juz yang lancar vs bermasalah.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Input Murojaah Sesi</span>
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Sesi Murojaah</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{records.length} Rekod</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Hasil Murojaah Lancar</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{lancarCount} Sesi</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Juz Perlu Murojaah Ulang</div>
            <div className="text-2xl font-bold text-rose-700 mt-1">{bermasalahCount} Sesi</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Filter Hasil:</span>
            <select
              value={selectedResultFilter}
              onChange={(e) => setSelectedResultFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">Semua Hasil</option>
              <option value="Lancar">Lancar</option>
              <option value="Cukup Lancar">Cukup Lancar</option>
              <option value="Banyak Kesalahan">Banyak Kesalahan</option>
              <option value="Perlu Diulang">Perlu Diulang</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri / surah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Santri</th>
                <th className="px-4 py-3">Ustadz Pemaksim</th>
                <th className="px-4 py-3 text-center">Juz</th>
                <th className="px-4 py-3">Surah & Ayat</th>
                <th className="px-4 py-3">Jenis Murojaah</th>
                <th className="px-4 py-3 text-center">Hasil Murojaah</th>
                <th className="px-4 py-3 text-center">Nilai</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                    Belum ada data murojaah.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const st = students.find(s => s.id === r.student_id);
                  const tchr = teachers.find(t => t.id === r.teacher_id);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{r.tanggal}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {st?.nama_lengkap || 'Santri'}
                        <div className="text-[10px] text-slate-400 font-normal">NIS: {st?.nis}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {tchr?.nama_panggilan || tchr?.nama_lengkap || 'Ustadz'}
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-amber-800 bg-amber-50 rounded-lg">
                        Juz {r.juz}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.surah} ({r.ayat})
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {r.jenis_murojaah}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.hasil === 'Lancar' ? 'bg-emerald-100 text-emerald-800' :
                          r.hasil === 'Cukup Lancar' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.hasil}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-slate-800">
                        {r.nilai}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {r.catatan || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Sesi Murojaah Santri"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Pilih Santri *</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">-- Pilih Santri --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} (NIS: {s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tanggal Murojaah</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Juz Dimurojaah (1-30)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.juz}
                onChange={(e) => setForm({ ...form, juz: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Surah</label>
              <input
                type="text"
                value={form.surah}
                onChange={(e) => setForm({ ...form, surah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Ayat</label>
              <input
                type="text"
                placeholder="e.g. 1-141"
                value={form.ayat}
                onChange={(e) => setForm({ ...form, ayat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Jenis Murojaah</label>
              <select
                value={form.jenis_murojaah}
                onChange={(e) => setForm({ ...form, jenis_murojaah: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Murojaah Harian">Murojaah Harian</option>
                <option value="Murojaah Mingguan">Murojaah Mingguan</option>
                <option value="Murojaah Juz">Murojaah Juz</option>
                <option value="Tasmi'">Tasmi'</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Hasil Evaluation *</label>
              <select
                value={form.hasil}
                onChange={(e) => setForm({ ...form, hasil: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Lancar">Lancar</option>
                <option value="Cukup Lancar">Cukup Lancar</option>
                <option value="Banyak Kesalahan">Banyak Kesalahan</option>
                <option value="Perlu Diulang">Perlu Diulang</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Nilai (0-100)</label>
              <input
                type="number"
                value={form.nilai}
                onChange={(e) => setForm({ ...form, nilai: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 shadow-xs"
            >
              Simpan Murojaah
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
