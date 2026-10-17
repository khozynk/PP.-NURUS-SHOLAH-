import React, { useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Download,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { dbService } from '../../services/db';
import { StudentDocument, Student } from '../../types/database';

export const StudentDocumentsPage: React.FC = () => {
  const students = dbService.getStudents().filter(s => s.status === 'aktif');
  const [documents, setDocuments] = useState<StudentDocument[]>(() => dbService.getStudentDocuments());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudentFilter, setSelectedStudentId] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<StudentDocument | null>(null);

  const [formData, setFormData] = useState({
    student_id: students[0]?.id || '',
    nama_dokumen: 'Kartu Keluarga (KK)',
    jenis_dokumen: 'KK' as StudentDocument['jenis_dokumen'],
    nomor_dokumen: '',
    file_name: '',
    tanggal_terbit: '',
    tanggal_kedaluwarsa: '',
    status: 'Lengkap' as StudentDocument['status'],
    catatan: ''
  });

  const handleRefresh = () => {
    setDocuments(dbService.getStudentDocuments({
      search: searchTerm,
      jenis: jenisFilter,
      status: statusFilter,
      studentId: selectedStudentFilter === 'all' ? undefined : selectedStudentFilter
    }));
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      student_id: selectedStudentFilter !== 'all' ? selectedStudentFilter : (students[0]?.id || ''),
      nama_dokumen: 'Kartu Keluarga (KK)',
      jenis_dokumen: 'KK',
      nomor_dokumen: '',
      file_name: '',
      tanggal_terbit: '',
      tanggal_kedaluwarsa: '',
      status: 'Lengkap',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: StudentDocument) => {
    setEditingDoc(doc);
    setFormData({
      student_id: doc.student_id || '',
      nama_dokumen: doc.nama_dokumen || doc.nama || 'Dokumen Santri',
      jenis_dokumen: (doc.jenis_dokumen || doc.tipe || 'KK') as StudentDocument['jenis_dokumen'],
      nomor_dokumen: doc.nomor_dokumen || '',
      file_name: doc.file_name || '',
      tanggal_terbit: doc.tanggal_terbit || '',
      tanggal_kedaluwarsa: doc.tanggal_kedaluwarsa || '',
      status: (doc.status || 'Lengkap') as StudentDocument['status'],
      catatan: doc.catatan || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveStudentDocument({
      ...(editingDoc ? { id: editingDoc.id } : {}),
      ...formData,
      file_url: formData.file_name ? `https://example.com/docs/${formData.file_name}` : ''
    });
    setIsModalOpen(false);
    handleRefresh();
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus berkas dokumen "${nama}"?`)) {
      dbService.deleteStudentDocument(id);
      handleRefresh();
    }
  };

  const filtered = documents.filter(d => {
    const q = searchTerm.toLowerCase();
    const st = students.find(s => s.id === d.student_id);
    const sName = st ? st.nama_lengkap.toLowerCase() : '';
    const sNis = st ? st.nis.toLowerCase() : '';

    const matchSearch = 
      (d.nama_dokumen || d.nama || '').toLowerCase().includes(q) ||
      (d.nomor_dokumen || '').toLowerCase().includes(q) ||
      sName.includes(q) ||
      sNis.includes(q);

    const matchJenis = jenisFilter === 'all' || d.jenis_dokumen === jenisFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchStudent = selectedStudentFilter === 'all' || d.student_id === selectedStudentFilter;

    return matchSearch && matchJenis && matchStatus && matchStudent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-7 h-7 text-emerald-600" />
            <span>Manajemen Dokumen & Berkas Santri</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Pengarsipan digital KK, Akta Kelahiran, Ijazah, KTP, dan status kelengkapan berkas santri
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Berkas Santri</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama santri, NIS, nomor dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-[200px]"
          >
            <option value="all">Semua Santri</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nis})</option>
            ))}
          </select>

          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Jenis Berkas</option>
            <option value="KK">Kartu Keluarga (KK)</option>
            <option value="Akta Kelahiran">Akta Kelahiran</option>
            <option value="Ijazah">Ijazah</option>
            <option value="KTP/NIK">KTP / NIK</option>
            <option value="Pasfoto">Pasfoto</option>
            <option value="Surat Kesehatan">Surat Kesehatan</option>
            <option value="Surat Mutasi">Surat Mutasi</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="Lengkap">Lengkap</option>
            <option value="Belum Lengkap">Belum Lengkap</option>
            <option value="Perlu Perpanjangan">Perlu Perpanjangan</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Santri & NIS</th>
                <th className="py-3 px-4">Nama & Jenis Dokumen</th>
                <th className="py-3 px-4">Nomor Dokumen</th>
                <th className="py-3 px-4">File Scan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada data berkas dokumen santri.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const st = students.find(s => s.id === d.student_id);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{st ? st.nama_lengkap : 'Santri Terhapus'}</div>
                        <div className="text-[11px] text-slate-500 font-normal">NIS: {st?.nis || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{d.nama_dokumen}</div>
                        <div className="text-[10px] text-emerald-700 uppercase font-semibold mt-0.5">{d.jenis_dokumen}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {d.nomor_dokumen || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {d.file_name ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium hover:underline">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{d.file_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Diunggah</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          d.status === 'Lengkap' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status === 'Lengkap' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(d)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id, d.nama_dokumen || d.nama || 'Dokumen')}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingDoc ? 'Edit Dokumen Santri' : 'Upload Berkas Dokumen Santri'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Santri *</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nama_lengkap} - NIS: {s.nis}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Dokumen *</label>
                <select
                  value={formData.jenis_dokumen}
                  onChange={(e) => {
                    const j = e.target.value as any;
                    setFormData({ ...formData, jenis_dokumen: j, nama_dokumen: `Scan ${j}` });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="KK">Kartu Keluarga (KK)</option>
                  <option value="Akta Kelahiran">Akta Kelahiran</option>
                  <option value="Ijazah">Ijazah</option>
                  <option value="KTP/NIK">KTP / NIK</option>
                  <option value="Pasfoto">Pasfoto Santri</option>
                  <option value="Surat Kesehatan">Surat Kesehatan</option>
                  <option value="Surat Mutasi">Surat Mutasi</option>
                  {(dbService.getSettings().document_types || []).filter(d => !['KK', 'Akta Kelahiran', 'Ijazah', 'KTP/NIK', 'Pasfoto', 'Surat Kesehatan', 'Surat Mutasi', 'Lainnya'].includes(d)).map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Dokumen *</label>
                <input
                  type="text"
                  required
                  value={formData.nama_dokumen}
                  onChange={(e) => setFormData({ ...formData, nama_dokumen: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Registrasi / NIK Dokumen</label>
                <input
                  type="text"
                  value={formData.nomor_dokumen}
                  onChange={(e) => setFormData({ ...formData, nomor_dokumen: e.target.value })}
                  placeholder="e.g. 3528012304050001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tgl Terbit Dokumen</label>
                  <input
                    type="date"
                    value={formData.tanggal_terbit}
                    onChange={(e) => setFormData({ ...formData, tanggal_terbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tgl Kedaluwarsa (Jika Ada)</label>
                  <input
                    type="date"
                    value={formData.tanggal_kedaluwarsa}
                    onChange={(e) => setFormData({ ...formData, tanggal_kedaluwarsa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Verifikasi</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Lengkap">Lengkap</option>
                  <option value="Belum Lengkap">Belum Lengkap</option>
                  <option value="Perlu Perpanjangan">Perlu Perpanjangan</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama File (PDF / Image Scan)</label>
                <input
                  type="text"
                  placeholder="Scan_KK_Ahmad.pdf"
                  value={formData.file_name}
                  onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Berkas</label>
                <input
                  type="text"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Catatan pengurus..."
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
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
