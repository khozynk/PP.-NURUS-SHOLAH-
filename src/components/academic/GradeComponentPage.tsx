import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Calculator, 
  Info,
  Sparkles 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { GradeComponent } from '../../types/database';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

export const GradeComponentPage: React.FC = () => {
  const { showToast } = useToast();
  const components = dbService.getGradeComponents();
  const programs = dbService.getPrograms();

  const [activeCategory, setActiveCategory] = useState<'all' | 'umum' | 'kitabiyah' | 'perilaku'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCmp, setEditingCmp] = useState<GradeComponent | null>(null);

  const [formData, setFormData] = useState<Partial<GradeComponent>>({
    code: '',
    name: '',
    weight: 20,
    category: 'umum',
    program_id: null,
    status: 'aktif'
  });

  const filteredComponents = components.filter(c => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  // Calculate total weight for active general/umum components
  const activeUmumComponents = components.filter(c => c.status === 'aktif' && c.category === 'umum');
  const totalUmumWeight = activeUmumComponents.reduce((acc, c) => acc + (c.weight || 0), 0);

  const activeKitabiyahComponents = components.filter(c => c.status === 'aktif' && c.category === 'kitabiyah');
  const totalKitabiyahWeight = activeKitabiyahComponents.reduce((acc, c) => acc + (c.weight || 0), 0);

  const handleOpenAdd = () => {
    setEditingCmp(null);
    setFormData({
      code: 'CMP-' + Math.floor(100 + Math.random() * 900),
      name: '',
      weight: 20,
      category: 'umum',
      program_id: null,
      status: 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cmp: GradeComponent) => {
    setEditingCmp(cmp);
    setFormData({ ...cmp });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.weight) {
      showToast('Data Belum Lengkap', 'Isi nama komponen dan bobot persentase.', 'warning');
      return;
    }

    try {
      dbService.saveGradeComponent(formData);
      showToast('Komponen Disimpan', 'Konfigurasi rumus dan bobot disimpan ke database.', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan komponen.', 'error');
    }
  };

  const handleDelete = (cmp: GradeComponent) => {
    if (window.confirm(`Hapus komponen penilaian "${cmp.name}"?`)) {
      dbService.deleteGradeComponent(cmp.id);
      showToast('Komponen Dihapus', 'Komponen berhasil dihapus dari database.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>AKADEMIK &bull; KONFIGURASI BOBOT & RUMUS PENILAIAN</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Komponen & Formula Penilaian Fleksibel
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 max-w-2xl">
            Sistem penilaian tidak di-hardcode. Seluruh bobot dan rumus disimpan dalam konfigurasi database dan dapat diatur oleh Admin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Komponen Baru</span>
        </button>
      </div>

      {/* Formula Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Calculator className="w-4 h-4" />
              <span>RUMUS AKADEMIK UMUM (DB DYNAMIC)</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${totalUmumWeight === 100 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
              Total Bobot: {totalUmumWeight}%
            </span>
          </div>

          <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            Nilai Akhir = {activeUmumComponents.map(c => `(${c.weight}% × ${c.code})`).join(' + ')}
          </div>

          <p className="text-[11px] text-slate-400">
            {totalUmumWeight === 100 ? (
              <span className="text-emerald-400 font-medium">✓ Formula seimbang sempurna 100%.</span>
            ) : (
              <span className="text-amber-300 font-medium">⚠️ Catatan: Total bobot saat ini {totalUmumWeight}%. Disarankan total 100%.</span>
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-teal-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
              <Sparkles className="w-4 h-4" />
              <span>RUMUS PENILAIAN KITABIYAH</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${totalKitabiyahWeight === 100 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-teal-500/20 text-teal-200 border border-teal-500/30'}`}>
              Total Bobot: {totalKitabiyahWeight}%
            </span>
          </div>

          <div className="text-xs text-slate-200 font-mono bg-black/40 p-3 rounded-xl border border-teal-700/50">
            Nilai Kitab = {activeKitabiyahComponents.map(c => `(${c.weight}% × ${c.code})`).join(' + ')}
          </div>

          <p className="text-[11px] text-teal-200">
            Khusus Safinatun Najah & Iktisyaf. Mengukur Pemahaman, Hafalan Matan, Bacaan, Adab, & Ujian.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl transition-all ${activeCategory === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            Semua Komponen ({components.length})
          </button>
          <button
            onClick={() => setActiveCategory('umum')}
            className={`px-3.5 py-2 rounded-xl transition-all ${activeCategory === 'umum' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            Materi Umum ({components.filter(c => c.category === 'umum').length})
          </button>
          <button
            onClick={() => setActiveCategory('kitabiyah')}
            className={`px-3.5 py-2 rounded-xl transition-all ${activeCategory === 'kitabiyah' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            Kitabiyah ({components.filter(c => c.category === 'kitabiyah').length})
          </button>
          <button
            onClick={() => setActiveCategory('perilaku')}
            className={`px-3.5 py-2 rounded-xl transition-all ${activeCategory === 'perilaku' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            Perilaku & Akhlak ({components.filter(c => c.category === 'perilaku').length})
          </button>
        </div>

        {/* Table of Components */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Nama Komponen Penilaian</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-center">Bobot Persentase (%)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                    Belum ada komponen penilaian di kategori ini.
                  </td>
                </tr>
              ) : (
                filteredComponents.map(cmp => (
                  <tr key={cmp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {cmp.code}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 text-sm">
                      {cmp.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {cmp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                        {cmp.weight}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cmp.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {cmp.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(cmp)}
                        className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cmp)}
                        className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Component Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCmp ? 'Edit Komponen Penilaian' : 'Tambah Komponen Penilaian Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kode Singkat *</label>
              <input
                type="text"
                placeholder="e.g. HRN, UJN, HFL"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Bobot Persentase (%) *</label>
              <input
                type="number"
                min={1}
                max={100}
                placeholder="20"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Nama Komponen Penilaian *</label>
            <input
              type="text"
              placeholder="e.g. Ujian Tengah Semester / Hafalan Matan"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Kategori Modul</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="umum">Materi Umum</option>
                <option value="kitabiyah">Kitabiyah (Safinah & Iktisyaf)</option>
                <option value="perilaku">Perilaku & Akhlak</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="aktif">Aktif Digunakan</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
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
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-xs"
            >
              Simpan Komponen
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
