import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Search, 
  Edit3, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  Info,
  Code
} from 'lucide-react';
import { dbService } from '../../services/db';
import { LetterTemplate } from '../../types/database';

export const LetterTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<LetterTemplate[]>(() => dbService.getLetterTemplates());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);

  const settings = dbService.getSettings();
  const defaultPenandatangan = settings.nama_pengasuh || 'KH. Muhammad Syamsul Arifin, S.Ag.';

  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    jenis: 'Keterangan Santri' as LetterTemplate['jenis'],
    judul_surat: '',
    body_template: '',
    default_penandatangan: defaultPenandatangan,
    default_jabatan: 'Pengasuh Pondok Pesantren',
    status: 'aktif' as LetterTemplate['status']
  });

  const handleRefresh = () => {
    setTemplates(dbService.getLetterTemplates());
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormData({
      kode: `SK-${Date.now().toString().slice(-4)}`,
      nama: '',
      jenis: 'Keterangan Santri',
      judul_surat: 'SURAT KETERANGAN PESANTREN',
      body_template: `Yang bertanda tangan di bawah ini Pengasuh Pondok Pesantren Nurus Sholah menerangkan bahwa:\n\nNama: {{nama_santri}}\nNIS: {{nis}}\nProgram: {{program}}\n\nAdalah benar-benar santri aktif PP Nurus Sholah.`,
      default_penandatangan: defaultPenandatangan,
      default_jabatan: 'Pengasuh Pondok Pesantren',
      status: 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tpl: LetterTemplate) => {
    setEditingTemplate(tpl);
    setFormData({
      kode: tpl.kode,
      nama: tpl.nama,
      jenis: tpl.jenis,
      judul_surat: tpl.judul_surat,
      body_template: tpl.body_template,
      default_penandatangan: tpl.default_penandatangan,
      default_jabatan: tpl.default_jabatan,
      status: tpl.status
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (tpl: LetterTemplate) => {
    dbService.saveLetterTemplate({
      kode: `${tpl.kode}-COPY`,
      nama: `${tpl.nama} (Salinan)`,
      jenis: tpl.jenis,
      judul_surat: tpl.judul_surat,
      body_template: tpl.body_template,
      default_penandatangan: tpl.default_penandatangan,
      default_jabatan: tpl.default_jabatan,
      status: 'aktif'
    });
    handleRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveLetterTemplate({
      ...(editingTemplate ? { id: editingTemplate.id } : {}),
      ...formData
    });
    setIsModalOpen(false);
    handleRefresh();
  };

  const availableVariables = [
    '{{nama_santri}}', '{{nis}}', '{{nisn}}', '{{tempat_lahir}}', '{{tanggal_lahir}}', 
    '{{alamat}}', '{{program}}', '{{tingkat}}', '{{kelas}}', '{{rombel}}', 
    '{{tahun_ajaran}}', '{{nama_orang_tua}}', '{{tanggal_surat}}', '{{nomor_surat}}', '{{nama_pimpinan}}'
  ];

  const filtered = templates.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      t.nama.toLowerCase().includes(q) ||
      t.kode.toLowerCase().includes(q) ||
      t.jenis.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-7 h-7 text-emerald-600" />
            <span>Master Template Surat</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Atur isi naskah dan placeholder variabel dinas untuk otomatisasi pembuatan surat santri
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Template Surat</span>
        </button>
      </div>

      {/* Info Variable Box */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Variabel Placeholder Yang Tersedia:</span>
          <p className="text-blue-800 leading-relaxed">
            Variabel berikut akan otomatis digantikan dengan data asli dari database santri saat surat dibuat:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {availableVariables.map((v, i) => (
              <span key={i} className="bg-white border border-blue-200 text-blue-800 font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  {t.kode}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {t.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{t.nama}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Jenis: {t.jenis}</p>
              
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-sans line-clamp-4 leading-relaxed whitespace-pre-wrap">
                {t.body_template}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate max-w-[150px]">TTD: {t.default_penandatangan}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(t)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Duplikat"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {editingTemplate ? 'Edit Template Surat' : 'Buat Template Surat Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Template *</label>
                  <input
                    type="text"
                    required
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Surat *</label>
                  <select
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Keterangan Santri">Keterangan Santri</option>
                    <option value="Keterangan Aktif">Keterangan Aktif</option>
                    <option value="Surat Izin">Surat Izin</option>
                    <option value="Surat Pengantar">Surat Pengantar</option>
                    <option value="Surat Panggilan">Surat Panggilan</option>
                    <option value="Surat Pernyataan">Surat Pernyataan</option>
                    <option value="Surat Tugas">Surat Tugas</option>
                    <option value="Surat Rekomendasi">Surat Rekomendasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Template *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surat Keterangan Santri Aktif Mengaji"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Resmi Pada Surat *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SURAT KETERANGAN SANTRI AKTIF"
                  value={formData.judul_surat}
                  onChange={(e) => setFormData({ ...formData, judul_surat: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Naskah Template (Gunakan Placeholder Variable) *</label>
                <textarea
                  rows={8}
                  required
                  value={formData.body_template}
                  onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penandatangan Default</label>
                  <input
                    type="text"
                    value={formData.default_penandatangan}
                    onChange={(e) => setFormData({ ...formData, default_penandatangan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Default</label>
                  <input
                    type="text"
                    value={formData.default_jabatan}
                    onChange={(e) => setFormData({ ...formData, default_jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
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
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
