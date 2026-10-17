import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { AcademicYear } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const AcademicYearPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => dbService.getAcademicYears());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [form, setForm] = useState({
    nama_tahun_ajaran: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
    keterangan: ''
  });

  const reloadData = () => {
    setAcademicYears(dbService.getAcademicYears());
  };

  const handleOpenAdd = () => {
    setEditingYear(null);
    setForm({
      nama_tahun_ajaran: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      status: 'nonaktif',
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ay: AcademicYear) => {
    setEditingYear(ay);
    setForm({
      nama_tahun_ajaran: ay.nama_tahun_ajaran,
      tanggal_mulai: ay.tanggal_mulai,
      tanggal_selesai: ay.tanggal_selesai,
      status: ay.status,
      keterangan: ay.keterangan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingYear) {
        dbService.updateAcademicYear(editingYear.id, form, currentUser);
        showToast('Berhasil', `Tahun ajaran "${form.nama_tahun_ajaran}" diperbarui.`, 'success');
      } else {
        dbService.createAcademicYear(form, currentUser);
        showToast('Berhasil', `Tahun ajaran "${form.nama_tahun_ajaran}" ditambahkan.`, 'success');
      }
      setIsModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleSetActive = (id: string, name: string) => {
    if (confirm(`Jadikan tahun ajaran "${name}" sebagai tahun ajaran AKTIF? Tahun ajaran sebelumnya akan diubah menjadi nonaktif.`)) {
      try {
        dbService.setActiveAcademicYear(id, currentUser);
        showToast('Berhasil', `Tahun ajaran ${name} sekarang menjadi tahun ajaran aktif.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Gagal mengubah status aktif.', 'error');
      }
    }
  };

  const handleDelete = (ay: AcademicYear) => {
    if (confirm(`Yakin ingin menghapus tahun ajaran "${ay.nama_tahun_ajaran}"?`)) {
      try {
        dbService.deleteAcademicYear(ay.id, currentUser);
        showToast('Berhasil', `Tahun ajaran ${ay.nama_tahun_ajaran} berhasil dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>Tahun Ajaran Akademik</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengaturan periode kalender pendidikan pondok pesantren. Hanya boleh ada 1 tahun ajaran aktif.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tahun Ajaran</span>
        </button>
      </div>

      {/* Grid of Academic Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {academicYears.map((ay) => {
          const isActive = ay.status === 'aktif';
          const rombelCount = dbService.getRombels(undefined, ay.id).length;

          return (
            <div
              key={ay.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isActive 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold font-mono text-slate-900 tracking-tight">
                    {ay.nama_tahun_ajaran}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Aktif Berjalan</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Arsip / Nonaktif</span>
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Periode Mulai:</span>
                    <span className="font-mono font-medium text-slate-800">{ay.tanggal_mulai || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Periode Selesai:</span>
                    <span className="font-mono font-medium text-slate-800">{ay.tanggal_selesai || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Rombel Terdaftar:</span>
                    <span className="font-mono font-bold text-slate-800">{rombelCount} Rombel</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 min-h-[36px]">
                  {ay.keterangan || 'Tidak ada catatan tambahan.'}
                </p>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {!isActive ? (
                  <button
                    onClick={() => handleSetActive(ay.id, ay.nama_tahun_ajaran)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Jadikan Aktif</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Digunakan Sistem</span>
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(ay)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Edit Tahun Ajaran"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => handleDelete(ay)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title="Hapus Tahun Ajaran"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingYear ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
        subtitle="PP Nurus Sholah Batulabang Akkor"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Tahun Ajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nama_tahun_ajaran}
              onChange={e => setForm({ ...form, nama_tahun_ajaran: e.target.value })}
              placeholder="Contoh: 2026/2027"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.tanggal_mulai}
                onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.tanggal_selesai}
                onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Keaktifan
            </label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="aktif">Aktif (Akan menonaktifkan tahun ajaran lainnya)</option>
              <option value="nonaktif">Nonaktif / Arsip</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={form.keterangan}
              onChange={e => setForm({ ...form, keterangan: e.target.value })}
              placeholder="Catatan tahun ajaran..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
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
              Simpan Tahun Ajaran
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
