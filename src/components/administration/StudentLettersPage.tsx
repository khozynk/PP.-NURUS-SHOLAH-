import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Edit3, 
  Trash2, 
  UserCheck, 
  FileCheck2, 
  Eye, 
  Download, 
  Sparkles,
  Calendar,
  CheckCircle2,
  Building2,
  X
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Student, StudentLetter, LetterTemplate } from '../../types/database';

interface StudentLettersPageProps {
  initialJenisFilter?: string;
  initialStudentId?: string;
}

export const StudentLettersPage: React.FC<StudentLettersPageProps> = ({
  initialJenisFilter,
  initialStudentId
}) => {
  const settings = dbService.getSettings();
  const students = dbService.getStudents().filter(s => s.status === 'aktif' || s.status === 'lulus');
  const templates = dbService.getLetterTemplates();
  const [letters, setLetters] = useState<StudentLetter[]>(() => dbService.getStudentLetters({
    jenis: initialJenisFilter,
    studentId: initialStudentId
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [jenisFilter, setJenisFilter] = useState(initialJenisFilter || 'all');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<StudentLetter | null>(null);

  // Generator Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || (students[0]?.id || ''));
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [nomorSurat, setNomorSurat] = useState<string>('');
  const [tanggalSurat, setTanggalSurat] = useState<string>(new Date().toISOString().slice(0, 10));
  const [penandatangan, setPenandatangan] = useState<string>(settings.nama_pengasuh || 'KH. Muhammad Syamsul Arifin, S.Ag.');
  const [penandatanganJabatan, setPenandatanganJabatan] = useState<string>('Pengasuh Pondok Pesantren Nurus Sholah');
  const [perihal, setPerihal] = useState<string>('');

  // Custom Fields for specific types e.g. Surat Izin
  const [customFields, setCustomFields] = useState({
    alasan: 'Keperluan Keluarga',
    tujuan: 'Kecamatan Akkor, Pamekasan',
    mulai: new Date().toISOString().slice(0, 10),
    selesai: new Date(Date.now() + 3*24*60*60*1000).toISOString().slice(0, 10),
    penjemput: '',
    penanggung_jawab: 'Ust. H. Ahmad Baihaqi',
    tanggal_pertemuan: new Date().toISOString().slice(0, 10),
    waktu_pertemuan: '09:00',
    alasan_panggilan: 'Konseling perkembangan santri',
    lokasi_tugas: 'Pamekasan',
    kegiatan_rekomendasi: 'Munaqasyah Qira\'atil Kutub'
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setLetters(dbService.getStudentLetters({
      search: searchTerm,
      jenis: jenisFilter,
      studentId: initialStudentId
    }));
  };

  const handleOpenGenerator = () => {
    const defaultTemplate = templates[0];
    const firstStudent = students.find(s => s.id === selectedStudentId) || students[0];
    setSelectedStudentId(firstStudent?.id || '');
    setSelectedTemplateId(defaultTemplate?.id || '');
    setNomorSurat(dbService.generateNextLetterNumber(defaultTemplate?.kode || 'SK'));
    setTanggalSurat(new Date().toISOString().slice(0, 10));
    setPenandatangan(defaultTemplate?.default_penandatangan || 'KH. Muhammad Syamsul Arifin, S.Ag.');
    setPenandatanganJabatan(defaultTemplate?.default_jabatan || 'Pengasuh Pondok Pesantren Nurus Sholah');
    setPerihal(`Surat ${defaultTemplate?.nama || 'Keterangan'}`);
    setIsGeneratorOpen(true);
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setNomorSurat(dbService.generateNextLetterNumber(tpl.kode || 'SK'));
      setPenandatangan(tpl.default_penandatangan || 'KH. Muhammad Syamsul Arifin, S.Ag.');
      setPenandatanganJabatan(tpl.default_jabatan || 'Pengasuh Pondok Pesantren');
      setPerihal(`Surat ${tpl.nama}`);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const renderFormattedLetterBody = (letter: StudentLetter, studentObj?: Student) => {
    const st = studentObj || students.find(s => s.id === letter.student_id);
    const tpl = templates.find(t => t.id === letter.template_id) || templates[0];
    let body = tpl ? tpl.body_template : '';

    if (!st) return 'Data santri tidak ditemukan.';

    const ay = dbService.getActiveAcademicYear()?.nama_tahun_ajaran || '2026/2027';

    // Replace placeholders
    body = body.replace(/\{\{nama_santri\}\}/g, st.nama_lengkap || '-');
    body = body.replace(/\{\{nis\}\}/g, st.nis || '-');
    body = body.replace(/\{\{nisn\}\}/g, st.nisn || '-');
    body = body.replace(/\{\{tempat_lahir\}\}/g, st.tempat_lahir || '-');
    body = body.replace(/\{\{tanggal_lahir\}\}/g, st.tanggal_lahir || '-');
    body = body.replace(/\{\{alamat\}\}/g, st.alamat || `${st.kecamatan || ''}, ${st.kabupaten || 'Pamekasan'}`);
    body = body.replace(/\{\{program\}\}/g, st.program || 'Reguler');
    body = body.replace(/\{\{tingkat\}\}/g, st.level_id || 'Mubtadi\'');
    body = body.replace(/\{\{kelas\}\}/g, dbService.getClassName(st.kelas_id) || '1');
    body = body.replace(/\{\{rombel\}\}/g, st.rombel || 'Kelas A');
    body = body.replace(/\{\{tahun_ajaran\}\}/g, ay);
    body = body.replace(/\{\{nama_orang_tua\}\}/g, st.nama_ayah || st.nama_ibu || st.nama_wali || '-');
    body = body.replace(/\{\{tanggal_surat\}\}/g, letter.tanggal_surat);
    body = body.replace(/\{\{nomor_surat\}\}/g, letter.nomor_surat);
    body = body.replace(/\{\{nama_pimpinan\}\}/g, letter.penandatangan);

    // Custom fields replacements
    const c = letter.custom_fields || {};
    body = body.replace(/\{\{alasan\}\}/g, c.alasan || 'Keperluan Keluarga');
    body = body.replace(/\{\{tujuan\}\}/g, c.tujuan || 'Rumah');
    body = body.replace(/\{\{mulai\}\}/g, c.mulai || letter.tanggal_surat);
    body = body.replace(/\{\{selesai\}\}/g, c.selesai || letter.tanggal_surat);
    body = body.replace(/\{\{penjemput\}\}/g, c.penjemput || st.nama_ayah || 'Wali Santri');
    body = body.replace(/\{\{penanggung_jawab\}\}/g, c.penanggung_jawab || 'Pengurus Keamanan');
    body = body.replace(/\{\{tanggal_pertemuan\}\}/g, c.tanggal_pertemuan || letter.tanggal_surat);
    body = body.replace(/\{\{waktu_pertemuan\}\}/g, c.waktu_pertemuan || '09:00');
    body = body.replace(/\{\{alasan_panggilan\}\}/g, c.alasan_panggilan || 'Konseling Santri');
    body = body.replace(/\{\{lokasi_tugas\}\}/g, c.lokasi_tugas || 'Lokasi Khidmah');
    body = body.replace(/\{\{kegiatan_rekomendasi\}\}/g, c.kegiatan_rekomendasi || 'Munaqasyah Qira\'atil Kutub');

    return body;
  };

  const handleSaveAndGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedTemplate) return;

    const saved = dbService.saveStudentLetter({
      student_id: selectedStudent.id,
      template_id: selectedTemplate.id,
      jenis_surat: (selectedTemplate.nama || 'Surat Keterangan Santri') as any,
      nomor_surat: nomorSurat,
      tanggal_surat: tanggalSurat,
      judul: selectedTemplate.judul_surat || 'SURAT KETERANGAN SANTRI',
      perihal: perihal || selectedTemplate.nama,
      penandatangan,
      penandatangan_jabatan: penandatanganJabatan,
      custom_fields: customFields,
      status: 'Diterbitkan'
    });

    setIsGeneratorOpen(false);
    setPreviewLetter(saved);
    handleRefresh();
  };

  const handleDelete = (id: string, nomor: string) => {
    if (window.confirm(`Hapus arsip surat santri "${nomor}"?`)) {
      dbService.deleteStudentLetter(id);
      handleRefresh();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filtered = letters.filter(l => {
    const q = searchTerm.toLowerCase();
    const st = students.find(s => s.id === l.student_id);
    const sName = st ? st.nama_lengkap.toLowerCase() : '';
    const sNis = st ? st.nis.toLowerCase() : '';

    const matchSearch = 
      l.nomor_surat.toLowerCase().includes(q) ||
      l.perihal.toLowerCase().includes(q) ||
      l.judul.toLowerCase().includes(q) ||
      sName.includes(q) ||
      sNis.includes(q);

    const matchJenis = jenisFilter === 'all' || l.jenis_surat === jenisFilter;
    return matchSearch && matchJenis;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" />
            <span>Penerbitan & Generator Surat Santri</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Buat Surat Keterangan Santri, Surat Aktif, Surat Izin, Pengantar, dan Panggilan secara otomatis terintegrasi dengan database
          </p>
        </div>
        <button
          onClick={handleOpenGenerator}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buat Surat Santri Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama santri, NIS, nomor surat, perihal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <select
          value={jenisFilter}
          onChange={(e) => setJenisFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        >
          <option value="all">Semua Jenis Surat</option>
          <option value="Surat Keterangan Santri">Surat Keterangan Santri</option>
          <option value="Surat Keterangan Aktif">Surat Keterangan Aktif</option>
          <option value="Surat Izin">Surat Izin</option>
          <option value="Surat Pengantar">Surat Pengantar</option>
          <option value="Surat Panggilan">Surat Panggilan</option>
          <option value="Surat Pernyataan">Surat Pernyataan</option>
          <option value="Surat Tugas">Surat Tugas</option>
          <option value="Surat Rekomendasi">Surat Rekomendasi</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Santri & NIS</th>
                <th className="py-3 px-4">Jenis Surat</th>
                <th className="py-3 px-4">Perihal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada arsip surat santri terbit.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const st = students.find(s => s.id === l.student_id);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{l.nomor_surat}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">{l.tanggal_surat}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{st ? st.nama_lengkap : 'Santri Terhapus'}</div>
                        <div className="text-[11px] text-slate-500">NIS: {st?.nis || '-'} | Program: {st?.program || '-'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {l.jenis_surat}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 max-w-xs truncate">
                        {l.perihal}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <CheckCircle2 className="w-3 h-3" /> {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewLetter(l)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
                            title="Preview / Cetak"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => handleDelete(l.id, l.nomor_surat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Buat Surat Santri Otomatis</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biodata santri diambil otomatis dari database tanpa perlu diketik ulang.
                </p>
              </div>
              <button 
                onClick={() => setIsGeneratorOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Pilih Jenis Template Surat *</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.nama} ({t.kode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Pilih Santri (Otomatis DB) *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama_lengkap} - NIS: {s.nis} ({s.program || 'Reguler'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Selected Auto Card */}
              {selectedStudent && (
                <div className="bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200/80 text-xs text-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Nama Santri</span>
                    <span className="font-bold text-slate-900">{selectedStudent.nama_lengkap}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">NIS / NISN</span>
                    <span className="font-semibold">{selectedStudent.nis} / {selectedStudent.nisn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Program / Rombel</span>
                    <span className="font-semibold">{selectedStudent.program} - {selectedStudent.rombel || 'Kelas A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Wali Santri</span>
                    <span className="font-semibold">{selectedStudent.nama_ayah || selectedStudent.nama_wali || '-'}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Auto *</label>
                  <input
                    type="text"
                    required
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat *</label>
                  <input
                    type="date"
                    required
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Inputs for Surat Izin or Custom */}
              {selectedTemplate?.jenis === 'Surat Izin' && (
                <div className="border border-amber-200 bg-amber-50/50 p-3.5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-amber-900">Rincian Perizinan Pulang / Kegiatan:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Alasan Izin</label>
                      <input
                        type="text"
                        value={customFields.alasan}
                        onChange={(e) => setCustomFields({ ...customFields, alasan: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tujuan Kepulangan</label>
                      <input
                        type="text"
                        value={customFields.tujuan}
                        onChange={(e) => setCustomFields({ ...customFields, tujuan: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tgl Mulai Izin</label>
                      <input
                        type="date"
                        value={customFields.mulai}
                        onChange={(e) => setCustomFields({ ...customFields, mulai: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Tgl Kembali Ke Pondok</label>
                      <input
                        type="date"
                        value={customFields.selesai}
                        onChange={(e) => setCustomFields({ ...customFields, selesai: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Penjemput / Pendamping</label>
                      <input
                        type="text"
                        placeholder="Nama Ayah / Wali"
                        value={customFields.penjemput}
                        onChange={(e) => setCustomFields({ ...customFields, penjemput: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Penanggung Jawab Keamanan</label>
                      <input
                        type="text"
                        value={customFields.penanggung_jawab}
                        onChange={(e) => setCustomFields({ ...customFields, penanggung_jawab: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penandatangan *</label>
                  <input
                    type="text"
                    required
                    value={penandatangan}
                    onChange={(e) => setPenandatangan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan Penandatangan *</label>
                  <input
                    type="text"
                    required
                    value={penandatanganJabatan}
                    onChange={(e) => setPenandatanganJabatan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Terbitkan & Preview Surat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview & Print Modal */}
      {previewLetter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>Pratinjau Surat Resmi Santri</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Container Kop Surat */}
            <div ref={printRef} className="bg-white p-8 border border-slate-200 shadow-xs rounded-xl space-y-6 text-slate-900 text-sm font-serif">
              {/* Kop Surat Header */}
              <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-emerald-800 rounded-lg flex items-center justify-center text-white font-bold text-2xl shrink-0">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      'NS'
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-bold tracking-wider uppercase font-sans text-slate-900">
                      PONDOK PESANTREN NURUS SHOLAH
                    </h2>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 font-sans">
                      BATULABANG AKKOR PAMEKASAN MADURA
                    </h3>
                    <p className="text-[10px] text-slate-600 font-sans mt-0.5">
                      {settings.alamat || 'Jl. Raya Batulabang Desa Akkor Kecamatan Palengaan Kabupaten Pamekasan Java Timur'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Telepon/WA: {settings.telepon || '0812-3456-7890'} | Email: sekretariat@nurusholah.or.id
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Number */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold uppercase underline tracking-wider font-sans">
                  {previewLetter.judul || 'SURAT KETERANGAN SANTRI'}
                </h3>
                <p className="text-xs font-sans font-bold text-slate-700">
                  Nomor: {previewLetter.nomor_surat}
                </p>
              </div>

              {/* Bismillah */}
              <div className="text-center py-1">
                <span className="text-lg font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
              </div>

              {/* Body Content */}
              <div className="whitespace-pre-wrap leading-relaxed text-slate-800 font-sans text-xs">
                {renderFormattedLetterBody(previewLetter)}
              </div>

              {/* Signature Area */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs font-sans">
                <div></div>
                <div className="text-center space-y-12">
                  <div>
                    <p className="text-slate-600">Batulabang Akkor, {previewLetter.tanggal_surat}</p>
                    <p className="font-bold mt-1 text-slate-900">{previewLetter.penandatangan_jabatan}</p>
                  </div>
                  <div>
                    <p className="font-bold underline text-slate-900">{previewLetter.penandatangan}</p>
                    <p className="text-[10px] text-slate-500">Pengasuh / Pengurus Pesantren</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
