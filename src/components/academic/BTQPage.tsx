import React, { useState } from 'react';
import { 
  BookCheck, 
  Plus, 
  Search, 
  Award, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { dbService } from '../../services/db';
import { BTQRecord } from '../../types/database';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

export const BTQPage: React.FC = () => {
  const { showToast } = useToast();
  const records = dbService.getBTQRecords();
  const teachers = dbService.getTeachers();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [form, setForm] = useState<Partial<BTQRecord>>({
    student_id: '',
    teacher_id: teachers[0]?.id || 'tchr-05',
    tanggal: new Date().toISOString().slice(0, 10),
    makharijul_huruf: 85,
    tajwid: 80,
    kelancaran: 85,
    fasahah: 82,
    membaca_alquran: 86,
    menulis_arab: 78,
    hafalan_dasar: 84,
    praktik: 85,
    catatan: ''
  });

  const filteredRecords = records.filter(r => {
    if (selectedLevelFilter !== 'all' && r.level_kemampuan !== selectedLevelFilter) return false;
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const st = students.find(s => s.id === r.student_id);
      return st?.nama_lengkap.toLowerCase().includes(q) || r.level_kemampuan.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setForm({
      student_id: students[0]?.id || '',
      teacher_id: teachers[0]?.id || 'tchr-05',
      tanggal: new Date().toISOString().slice(0, 10),
      makharijul_huruf: 85,
      tajwid: 80,
      kelancaran: 85,
      fasahah: 82,
      membaca_alquran: 86,
      menulis_arab: 78,
      hafalan_dasar: 84,
      praktik: 85,
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      showToast('Pilih Santri', 'Pilih santri penerima evaluasi BTQ.', 'warning');
      return;
    }

    try {
      dbService.saveBTQRecord(form);
      showToast('Penilaian BTQ Disimpan', 'Kompetensi BTQ santri berhasil diukur.', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Error saat menyimpan data BTQ.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
            <BookCheck className="w-4 h-4" />
            <span>AKADEMIK &bull; BACA TULIS AL-QUR'AN (BTQ)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Penilaian Kompetensi Baca Tulis Al-Qur'an
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Makharijul Huruf, Tajwid, Kelancaran, Fasahah, Membaca Al-Qur'an, Menulis Arab, Hafalan Dasar & Praktik.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-sky-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Input Evaluasi BTQ Santri</span>
        </button>
      </div>

      {/* Levels Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Lanjutan', 'Menengah', 'Dasar', 'Pemula'].map(lvl => {
          const count = records.filter(r => r.level_kemampuan === lvl).length;
          return (
            <div key={lvl} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Level {lvl}</div>
              <div className="text-2xl font-bold text-sky-800 mt-1">{count} Santri</div>
              <div className="text-[11px] text-slate-400 mt-1">Kompetensi Terdaftar</div>
            </div>
          );
        })}
      </div>

      {/* Main Records Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Filter Level:</span>
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="all">Semua Level</option>
              <option value="Lanjutan">Lanjutan</option>
              <option value="Menengah">Menengah</option>
              <option value="Dasar">Dasar</option>
              <option value="Pemula">Pemula</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Santri</th>
                <th className="px-3 py-3 text-center">Makhraj</th>
                <th className="px-3 py-3 text-center">Tajwid</th>
                <th className="px-3 py-3 text-center">Kelancaran</th>
                <th className="px-3 py-3 text-center">Fasahah</th>
                <th className="px-3 py-3 text-center">Membaca</th>
                <th className="px-3 py-3 text-center">Menulis Arab</th>
                <th className="px-3 py-3 text-center">Hafalan Dasar</th>
                <th className="px-3 py-3 text-center">Praktik</th>
                <th className="px-4 py-3 text-center bg-sky-50 text-sky-900 font-bold">Rata-Rata</th>
                <th className="px-4 py-3 text-center">Level Kemampuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400 italic">
                    Belum ada data evaluasi BTQ.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => {
                  const st = students.find(s => s.id === r.student_id);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {st?.nama_lengkap || 'Santri'}
                        <div className="text-[10px] text-slate-400 font-normal">NIS: {st?.nis}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold">{r.makharijul_huruf}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.tajwid}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.kelancaran}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.fasahah}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.membaca_alquran}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.menulis_arab}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.hafalan_dasar}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.praktik}</td>
                      <td className="px-4 py-3 text-center bg-sky-50 font-extrabold text-sm text-sky-800">
                        {r.nilai_akhir}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.level_kemampuan === 'Lanjutan' ? 'bg-emerald-100 text-emerald-800' :
                          r.level_kemampuan === 'Menengah' ? 'bg-sky-100 text-sky-800' :
                          r.level_kemampuan === 'Dasar' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.level_kemampuan}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Evaluasi Kompetensi BTQ"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Pilih Santri *</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Pilih Santri --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} (NIS: {s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Makhraj</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.makharijul_huruf}
                onChange={(e) => setForm({ ...form, makharijul_huruf: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Tajwid</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.tajwid}
                onChange={(e) => setForm({ ...form, tajwid: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Kelancaran</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.kelancaran}
                onChange={(e) => setForm({ ...form, kelancaran: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Fasahah</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.fasahah}
                onChange={(e) => setForm({ ...form, fasahah: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Membaca</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.membaca_alquran}
                onChange={(e) => setForm({ ...form, membaca_alquran: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Menulis Arab</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.menulis_arab}
                onChange={(e) => setForm({ ...form, menulis_arab: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Hafalan</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.hafalan_dasar}
                onChange={(e) => setForm({ ...form, hafalan_dasar: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 font-medium mb-1">Praktik</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.praktik}
                onChange={(e) => setForm({ ...form, praktik: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Catatan Ustadz BTQ</label>
            <input
              type="text"
              placeholder="Catatan perkembangan khat dan makhraj..."
              value={form.catatan || ''}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
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
              className="px-4 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 shadow-xs"
            >
              Simpan Evaluasi BTQ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
