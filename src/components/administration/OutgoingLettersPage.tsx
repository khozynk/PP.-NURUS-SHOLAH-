import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  UserCheck,
  Tag,
  Sparkles,
  Building2,
  FileCheck2
} from 'lucide-react';
import { dbService } from '../../services/db';
import { OutgoingLetter } from '../../types/database';

export const OutgoingLettersPage: React.FC = () => {
  const [letters, setLetters] = useState<OutgoingLetter[]>(() => dbService.getOutgoingLetters());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<OutgoingLetter | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nomor_surat: '',
    tanggal_surat: new Date().toISOString().slice(0, 10),
    tujuan: '',
    perihal: '',
    kategori: 'Keterangan' as OutgoingLetter['kategori'],
    isi_ringkasan: '',
    penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    lampiran: '',
    file_name: '',
    status: 'Draft' as OutgoingLetter['status'],
    catatan: ''
  });

  const handleRefresh = () => {
    setLetters(dbService.getOutgoingLetters({
      search: searchTerm,
      status: statusFilter,
      kategori: kategoriFilter
    }));
  };

  const handleOpenAdd = () => {
    setEditingLetter(null);
    setFormData({
      nomor_surat: dbService.generateNextLetterNumber('KELUAR'),
      tanggal_surat: new Date().toISOString().slice(0, 10),
      tujuan: '',
      perihal: '',
      kategori: 'Keterangan',
      isi_ringkasan: '',
      penandatangan: dbService.getSettings().nama_pengasuh || 'KH. Muhammad Syamsul Arifin, S.Ag.',
      lampiran: '',
      file_name: '',
      status: 'Draft',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (letter: OutgoingLetter) => {
    setEditingLetter(letter);
    setFormData({
      nomor_surat: letter.nomor_surat,
      tanggal_surat: letter.tanggal_surat,
      tujuan: letter.tujuan,
      perihal: letter.perihal,
      kategori: letter.kategori,
      isi_ringkasan: letter.isi_ringkasan,
      penandatangan: letter.penandatangan,
      lampiran: letter.lampiran || '',
      file_name: letter.file_name || '',
      status: letter.status,
      catatan: letter.catatan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveOutgoingLetter({
      ...(editingLetter ? { id: editingLetter.id } : {}),
      ...formData,
      file_url: formData.file_name ? `https://example.com/docs/${formData.file_name}` : ''
    });
    setIsModalOpen(false);
    handleRefresh();
  };

  const handleDelete = (id: string, nomor: string) => {
    if (window.confirm(`Hapus registrasi surat keluar "${nomor}"?`)) {
      dbService.deleteOutgoingLetter(id);
      handleRefresh();
    }
  };

  const filtered = letters.filter(l => {
    const q = searchTerm.toLowerCase();
    const matchSearch = 
      l.nomor_surat.toLowerCase().includes(q) ||
      l.tujuan.toLowerCase().includes(q) ||
      l.perihal.toLowerCase().includes(q) ||
      l.isi_ringkasan.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchKategori = kategoriFilter === 'all' || l.kategori === kategoriFilter;
    return matchSearch && matchStatus && matchKategori;
  });

  const getStatusBadge = (status: OutgoingLetter['status']) => {
    switch (status) {
      case 'Draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Draft</span>;
      case 'Diperiksa':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Diperiksa</span>;
      case 'Disetujui':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><CheckCircle2 className="w-3 h-3" /> Disetujui</span>;
      case 'Ditandatangani':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><FileCheck2 className="w-3 h-3" /> TTD Arifin</span>;
      case 'Dikirim':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><Send className="w-3 h-3" /> Dikirim</span>;
      case 'Diarsipkan':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Diarsipkan</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-7 h-7 text-emerald-600" />
            <span>Agenda Surat Keluar</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Pengelolaan draf, persetujuan, penandatanganan, dan pengiriman surat resmi keluar pesantren
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Keluar</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor surat, tujuan instansi/penerima, perihal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Diperiksa">Diperiksa</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditandatangani">Ditandatangani</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Diarsipkan">Diarsipkan</option>
          </select>

          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            <option value="Keterangan">Keterangan</option>
            <option value="Undangan">Undangan</option>
            <option value="Permohonan">Permohonan</option>
            <option value="Tugas">Tugas</option>
            <option value="Rekomendasi">Rekomendasi</option>
            <option value="Pemberitahuan">Pemberitahuan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Penerima & Perihal</th>
                <th className="py-3 px-4">Penandatangan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada data surat keluar.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{l.nomor_surat}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Tgl Surat: {l.tanggal_surat}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{l.tujuan}</span>
                      </div>
                      <div className="text-slate-600 font-medium mt-1 truncate" title={l.perihal}>
                        {l.perihal}
                      </div>
                      <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                        {l.isi_ringkasan}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {l.penandatangan}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {l.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(l.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(l.id, l.nomor_surat)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingLetter ? 'Edit Data Surat Keluar' : 'Buat Draf Surat Keluar Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat *</label>
                  <input
                    type="text"
                    required
                    value={formData.nomor_surat}
                    onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Surat *</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Keterangan">Keterangan</option>
                    <option value="Undangan">Undangan</option>
                    <option value="Permohonan">Permohonan</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Rekomendasi">Rekomendasi</option>
                    <option value="Pemberitahuan">Pemberitahuan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_surat}
                    onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penerima / Tujuan *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kepala Puskesmas Akkor / Seluruh Wali Santri"
                    value={formData.tujuan}
                    onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perihal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ringkasan perihal surat..."
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Isi / Ringkasan Surat</label>
                <textarea
                  rows={3}
                  value={formData.isi_ringkasan}
                  onChange={(e) => setFormData({ ...formData, isi_ringkasan: e.target.value })}
                  placeholder="Inti dari isi surat yang disampaikan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penandatangan Resmi *</label>
                  <input
                    type="text"
                    required
                    value={formData.penandatangan}
                    onChange={(e) => setFormData({ ...formData, penandatangan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lampiran</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Berkas / 1 Lembar"
                    value={formData.lampiran}
                    onChange={(e) => setFormData({ ...formData, lampiran: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Progres</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Diperiksa">Diperiksa</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditandatangani">Ditandatangani</option>
                    <option value="Dikirim">Dikirim</option>
                    <option value="Diarsipkan">Diarsipkan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File Digital (Lampiran)</label>
                  <input
                    type="text"
                    placeholder="Nama file PDF / image..."
                    value={formData.file_name}
                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan pimpinan..."
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
                  Simpan Surat Keluar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
