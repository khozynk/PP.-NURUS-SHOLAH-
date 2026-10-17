import React, { useState } from 'react';
import { 
  FolderArchive, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileText, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { dbService } from '../../services/db';
import { DocumentArchive } from '../../types/database';

export const DocumentArchivesPage: React.FC = () => {
  const [archives, setArchives] = useState<DocumentArchive[]>(() => dbService.getDocumentArchives());
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<DocumentArchive | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    nomor_dokumen: '',
    kategori: 'Legalitas Pondok' as DocumentArchive['kategori'],
    tanggal_dokumen: new Date().toISOString().slice(0, 10),
    pengarsip: 'Sekretariat Pesantren',
    file_name: '',
    tags: 'Kemenag, Pondok',
    status: 'Aktif' as DocumentArchive['status'],
    deskripsi: ''
  });

  const handleRefresh = () => {
    setArchives(dbService.getDocumentArchives({
      search: searchTerm,
      kategori: kategoriFilter,
      status: statusFilter
    }));
  };

  const handleOpenAdd = () => {
    setEditingArchive(null);
    setFormData({
      judul: '',
      nomor_dokumen: '',
      kategori: 'Legalitas Pondok',
      tanggal_dokumen: new Date().toISOString().slice(0, 10),
      pengarsip: 'Sekretariat Pesantren',
      file_name: '',
      tags: 'Pondok, Legalitas',
      status: 'Aktif',
      deskripsi: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (arc: DocumentArchive) => {
    setEditingArchive(arc);
    setFormData({
      judul: arc.judul,
      nomor_dokumen: arc.nomor_dokumen || '',
      kategori: arc.kategori,
      tanggal_dokumen: arc.tanggal_dokumen,
      pengarsip: arc.pengarsip,
      file_name: arc.file_name || '',
      tags: (arc.tags || []).join(', '),
      status: arc.status,
      deskripsi: arc.deskripsi || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    dbService.saveDocumentArchive({
      ...(editingArchive ? { id: editingArchive.id } : {}),
      ...formData,
      tags: tagArray,
      file_url: formData.file_name ? `https://example.com/archives/${formData.file_name}` : ''
    });
    setIsModalOpen(false);
    handleRefresh();
  };

  const handleDelete = (id: string, judul: string) => {
    if (window.confirm(`Hapus arsip digital "${judul}"?`)) {
      dbService.deleteDocumentArchive(id);
      handleRefresh();
    }
  };

  const filtered = archives.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      a.judul.toLowerCase().includes(q) ||
      (a.nomor_dokumen || '').toLowerCase().includes(q) ||
      (a.deskripsi || '').toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q));

    const matchKategori = kategoriFilter === 'all' || a.kategori === kategoriFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchKategori && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderArchive className="w-7 h-7 text-emerald-600" />
            <span>Pusat Arsip Dokumen Pesantren</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Penyimpanan digital sertifikat tanah wakaf, perizinan Kemenag RI, SK pengasuh, dan arsip legal
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Arsip Digital</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari judul arsip, nomor dokumen, tag perizinan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex gap-2.5">
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            <option value="Legalitas Pondok">Legalitas Pondok</option>
            <option value="Izin Operasional">Izin Operasional</option>
            <option value="Sertifikat Wakaf">Sertifikat Wakaf</option>
            <option value="Surat Masuk">Surat Masuk</option>
            <option value="Surat Keluar">Surat Keluar</option>
            <option value="Dokumen Santri">Dokumen Santri</option>
            <option value="LPJ & Rapat">LPJ & Rapat</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Penting">Penting</option>
            <option value="Diarsipkan">Diarsipkan</option>
          </select>
        </div>
      </div>

      {/* Grid Archive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 font-medium border border-slate-200">
            Belum ada arsip dokumen yang tersimpan.
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    a.status === 'Penting' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {a.kategori}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {a.tanggal_dokumen}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{a.judul}</h3>
                {a.nomor_dokumen && (
                  <p className="text-xs font-mono font-medium text-emerald-700 mt-1">
                    No: {a.nomor_dokumen}
                  </p>
                )}

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {a.deskripsi || 'Tidak ada deskripsi singkat.'}
                </p>

                {a.tags && a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {a.tags.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[140px]">Oleh: {a.pengarsip}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.judul)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingArchive ? 'Edit Arsip Digital' : 'Tambah Arsip Dokumen Pesantren'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen Arsip *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sertifikat Tanah Wakaf Batulabang / SK IJOP Kemenag"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Legalitas Pondok">Legalitas Pondok</option>
                    <option value="Izin Operasional">Izin Operasional</option>
                    <option value="Sertifikat Wakaf">Sertifikat Wakaf</option>
                    <option value="Surat Masuk">Surat Masuk</option>
                    <option value="Surat Keluar">Surat Keluar</option>
                    <option value="Dokumen Santri">Dokumen Santri</option>
                    <option value="LPJ & Rapat">LPJ & Rapat</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor SK / Dokumen</label>
                  <input
                    type="text"
                    value={formData.nomor_dokumen}
                    onChange={(e) => setFormData({ ...formData, nomor_dokumen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Dokumen *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_dokumen}
                    onChange={(e) => setFormData({ ...formData, tanggal_dokumen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Petugas Pengarsip *</label>
                  <input
                    type="text"
                    required
                    value={formData.pengarsip}
                    onChange={(e) => setFormData({ ...formData, pengarsip: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Kemenag, IJOP, Wakaf"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama File Digital Scan</label>
                <input
                  type="text"
                  placeholder="Sertifikat_Wakaf_2026.pdf"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uraian / Deskripsi Berkas</label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Penjelasan singkat mengenai berkas legalitas ini..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Simpan Arsip Digital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
