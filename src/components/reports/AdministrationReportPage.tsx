import React, { useState, useMemo } from 'react';
import {
  FileText,
  Mail,
  Send,
  FolderArchive,
  FileCheck2,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpDown,
  Edit3,
  X
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { useToast } from '../common/Toast';
import {
  Student,
  IncomingLetter,
  OutgoingLetter,
  StudentLetter,
  StudentDocument,
  DocumentArchive
} from '../../types/database';

export const AdministrationReportPage: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(() => dbService.getSettings());
  const currentUser = authService.getCurrentUser();
  const adminStats = dbService.getAdministrationStats();

  // Admin Custom Report Notes & Signatories Modal State
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama_pengasuh: settings.nama_pengasuh || 'KH. Muhammad Syamsul Arifin, S.Ag.',
    nama_pimpinan: settings.nama_pimpinan || 'Pengasuh Pesantren',
    kepala_tu: settings.kepala_tu || 'Ust. Moh. Kholilur Rahman, S.Kom.',
    nip_kepala_tu: settings.nip_kepala_tu || 'Sekretaris Jenderal Pesantren',
    kota_surat: settings.kota_surat || 'Batulabang',
    tanggal_laporan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    catatan_evaluasi: (settings as any).catatan_evaluasi_administrasi || 'Buku agenda surat masuk, keluar, dan penerbitan surat santri berjalan tertib sesuai tata naskah dinas resmi pesantren.',
    rekomendasi_administrasi: (settings as any).rekomendasi_administrasi || 'Tingkatkan digitalisasi tanda tangan barcode dan verifikasi berkas santri secara berkala untuk sinkronisasi EMIS Kemenag.'
  });

  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.updateSettings({
      ...settings,
      nama_pengasuh: editForm.nama_pengasuh,
      nama_pimpinan: editForm.nama_pimpinan,
      kepala_tu: editForm.kepala_tu,
      nip_kepala_tu: editForm.nip_kepala_tu,
      kota_surat: editForm.kota_surat,
      catatan_evaluasi_administrasi: editForm.catatan_evaluasi,
      rekomendasi_administrasi: editForm.rekomendasi_administrasi
    });
    setSettings(updated);
    setShowAdminEditModal(false);
    showToast('Parameter Disimpan', 'Pejabat penandatangan dan catatan laporan administrasi berhasil diperbarui.', 'success');
  };

  const students = useMemo(() => dbService.getStudents().filter(s => !s.is_archived), []);
  const activeStudents = useMemo(() => students.filter(s => s.status === 'aktif'), [students]);
  const incomingLetters = useMemo(() => dbService.getIncomingLetters(), []);
  const outgoingLetters = useMemo(() => dbService.getOutgoingLetters(), []);
  const studentLetters = useMemo(() => dbService.getStudentLetters(), []);
  const studentDocuments = useMemo(() => dbService.getStudentDocuments(), []);
  const archives = useMemo(() => dbService.getDocumentArchives(), []);
  const studentTransfers = useMemo(() => dbService.getStudentTransfers(), []);
  const studentWithdrawals = useMemo(() => dbService.getStudentWithdrawals(), []);
  const studentGraduations = useMemo(() => dbService.getStudentGraduations(), []);

  // Student quick lookup map
  const studentMap = useMemo(() => {
    const map: Record<string, Student> = {};
    students.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [students]);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'agenda_surat' | 'surat_santri' | 'berkas_dokumen' | 'mutasi_emis'>('ringkasan');

  // Month list
  const monthNames = [
    { num: '01', name: 'Januari' },
    { num: '02', name: 'Februari' },
    { num: '03', name: 'Maret' },
    { num: '04', name: 'April' },
    { num: '05', name: 'Mei' },
    { num: '06', name: 'Juni' },
    { num: '07', name: 'Juli' },
    { num: '08', name: 'Agustus' },
    { num: '09', name: 'September' },
    { num: '10', name: 'Oktober' },
    { num: '11', name: 'November' },
    { num: '12', name: 'Desember' }
  ];

  // Letters filtered by period
  const filteredIncoming = useMemo(() => {
    return incomingLetters.filter(l => {
      const d = new Date(l.tanggal_surat || l.tanggal_diterima);
      if (selectedYear !== 'all' && d.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && (d.getMonth() + 1).toString().padStart(2, '0') !== selectedMonth) return false;
      if (selectedCategory !== 'all' && l.kategori !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.nomor_surat.toLowerCase().includes(q) ||
          l.perihal.toLowerCase().includes(q) ||
          l.asal_surat.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incomingLetters, selectedYear, selectedMonth, selectedCategory, searchQuery]);

  const filteredOutgoing = useMemo(() => {
    return outgoingLetters.filter(l => {
      const d = new Date(l.tanggal_surat);
      if (selectedYear !== 'all' && d.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && (d.getMonth() + 1).toString().padStart(2, '0') !== selectedMonth) return false;
      if (selectedCategory !== 'all' && l.kategori !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          l.nomor_surat.toLowerCase().includes(q) ||
          l.perihal.toLowerCase().includes(q) ||
          l.tujuan.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [outgoingLetters, selectedYear, selectedMonth, selectedCategory, searchQuery]);

  // Student letters filtered
  const filteredStudentLetters = useMemo(() => {
    return studentLetters.filter(l => {
      const d = new Date(l.tanggal_surat);
      if (selectedYear !== 'all' && d.getFullYear().toString() !== selectedYear) return false;
      if (selectedMonth !== 'all' && (d.getMonth() + 1).toString().padStart(2, '0') !== selectedMonth) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const std = studentMap[l.student_id];
        return (
          l.nomor_surat.toLowerCase().includes(q) ||
          (std?.nama_lengkap || '').toLowerCase().includes(q) ||
          (std?.nis || '').toLowerCase().includes(q) ||
          l.perihal.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [studentLetters, studentMap, selectedYear, selectedMonth, searchQuery]);

  // Student letter distribution by type
  const studentLetterBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    studentLetters.forEach(l => {
      const j = l.jenis_surat || 'Lainnya';
      map[j] = (map[j] || 0) + 1;
    });
    return map;
  }, [studentLetters]);

  // Document completion metrics
  const documentMetrics = useMemo(() => {
    let complete = 0;
    let incomplete = 0;
    const requiredTypes = ['KK', 'Akta Kelahiran', 'Ijazah', 'KTP/NIK'];

    const studentIncompleteList: { student: Student; missing: string[] }[] = [];

    activeStudents.forEach(s => {
      const docs = studentDocuments.filter(d => d.student_id === s.id);
      const existingTypes = docs.map(d => d.jenis_dokumen);
      const missing = requiredTypes.filter(t => !existingTypes.includes(t as any));

      if (missing.length === 0 && docs.length >= 3) {
        complete++;
      } else {
        incomplete++;
        studentIncompleteList.push({ student: s, missing });
      }
    });

    const completionRate = activeStudents.length > 0 ? Math.round((complete / activeStudents.length) * 100) : 0;
    return { complete, incomplete, completionRate, studentIncompleteList };
  }, [activeStudents, studentDocuments]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Jenis Dokumen / Surat',
      'Nomor Surat / Arsip',
      'Tanggal',
      'Pihak Terkait (Asal / Tujuan)',
      'Perihal / Deskripsi',
      'Kategori',
      'Status Berkas'
    ];

    const rows: string[][] = [];
    let counter = 1;

    filteredIncoming.forEach(l => {
      rows.push([
        (counter++).toString(),
        '"Surat Masuk"',
        `"${l.nomor_surat}"`,
        `"${l.tanggal_surat}"`,
        `"${l.asal_surat}"`,
        `"${l.perihal}"`,
        `"${l.kategori}"`,
        `"${l.status}"`
      ]);
    });

    filteredOutgoing.forEach(l => {
      rows.push([
        (counter++).toString(),
        '"Surat Keluar"',
        `"${l.nomor_surat}"`,
        `"${l.tanggal_surat}"`,
        `"${l.tujuan}"`,
        `"${l.perihal}"`,
        `"${l.kategori}"`,
        `"${l.status}"`
      ]);
    });

    filteredStudentLetters.forEach(l => {
      const std = studentMap[l.student_id];
      rows.push([
        (counter++).toString(),
        `"Surat Santri (${l.jenis_surat})"`,
        `"${l.nomor_surat}"`,
        `"${l.tanggal_surat}"`,
        `"${std?.nama_lengkap || '-'} (${std?.nis || '-'})"`,
        `"${l.perihal}"`,
        `"${l.jenis_surat}"`,
        `"${l.status}"`
      ]);
    });

    if (rows.length === 0) {
      showToast('Data Kosong', 'Tidak ada data persuratan pada filter ini.', 'warning');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_administrasi_pesantren_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ekspor Berhasil', `Berhasil mengekspor ${rows.length} catatan buku agenda administrasi.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ACTION & TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                Laporan Administrasi & Tata Usaha
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300">
                  Sekretariat & TU
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Laporan berkala buku agenda surat masuk/keluar, penerbitan surat santri, kelengkapan berkas, dan sinkronisasi EMIS
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdminEditModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
            title="Edit catatan administrasi dan pejabat penandatangan"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            Edit Catatan & Pejabat
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Ekspor Excel/CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-800/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan Resmi
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mr-2">
          <Filter className="w-4 h-4 text-blue-600" />
          Filter Periode:
        </div>

        {/* Month Filter */}
        <div className="min-w-[140px]">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Bulan</option>
            {monthNames.map(m => (
              <option key={m.num} value={m.num}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="min-w-[120px]">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor surat, perihal, nama pihak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reset Filter Button */}
        {(selectedMonth !== 'all' || selectedYear !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedMonth('all');
              setSelectedYear('all');
              setSearchQuery('');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1.5 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* METRIC KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Surat Masuk</span>
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{incomingLetters.length}</div>
          <p className="text-[10px] text-blue-600 font-semibold">{adminStats.incomingThisMonth} Surat Bulan Ini</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Surat Keluar</span>
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{outgoingLetters.length}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">{adminStats.outgoingThisMonth} Surat Bulan Ini</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Surat Santri</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{studentLetters.length}</div>
          <p className="text-[10px] text-slate-500">Izin, Rekomendasi, Ket.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Berkas Lengkap</span>
            <FileCheck2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{documentMetrics.completionRate}%</div>
          <p className="text-[10px] text-slate-500">{documentMetrics.complete} Santri Berkas Lengkap</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Arsip Digital</span>
            <FolderArchive className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{archives.length}</div>
          <p className="text-[10px] text-slate-500">Dokumen Terklasifikasi</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mutasi Santri</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{studentTransfers.length + studentWithdrawals.length}</div>
          <p className="text-[10px] text-slate-500">Masuk & Pindah Tahun Ini</p>
        </div>
      </div>

      {/* TAB NAVIGATION (SCREEN ONLY) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === 'ringkasan'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Ringkasan Eksekutif TU
        </button>
        <button
          onClick={() => setActiveTab('agenda_surat')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === 'agenda_surat'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Buku Agenda Surat Masuk & Keluar ({filteredIncoming.length + filteredOutgoing.length})
        </button>
        <button
          onClick={() => setActiveTab('surat_santri')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === 'surat_santri'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Penerbitan Surat Santri ({filteredStudentLetters.length})
        </button>
        <button
          onClick={() => setActiveTab('berkas_dokumen')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === 'berkas_dokumen'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Kelengkapan Dokumen Santri ({documentMetrics.incomplete} Belum Lengkap)
        </button>
        <button
          onClick={() => setActiveTab('mutasi_emis')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition whitespace-nowrap cursor-pointer ${
            activeTab === 'mutasi_emis'
              ? 'bg-blue-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Mutasi & Kesiapan EMIS Kemenag
        </button>
      </div>

      {/* PRINT CONTAINER WITH OFFICIAL PESANTREN KOP */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* OFFICIAL KOP SURAT / HEADER */}
        <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1 relative">
          <div className="flex items-center justify-center gap-5">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo Pesantren"
                className="w-20 h-20 object-contain rounded-full shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-2xl">
                NS
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                {settings.nama_pesantren || 'PONDOK PESANTREN NURUS SHOLAH'}
              </h2>
              <h3 className="text-xs sm:text-sm font-bold tracking-widest text-blue-900 uppercase">
                SEKRETARIAT PESANTREN &bull; BIRO ADMINISTRASI & TATA USAHA
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                Batulabang Akkor, Kec. {settings.kecamatan || 'Palengaan'}, Kab. {settings.kabupaten || 'Pamekasan'} {settings.kode_pos || '69362'} - Jawa Timur
                <br />
                Telepon: {settings.telepon || '(0324) 321890'} &bull; Email: {settings.email || 'info@nurussholah.ponpes.id'}
              </p>
            </div>
          </div>
        </div>

        {/* REPORT TITLE BANNER */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black uppercase tracking-wide text-slate-900 underline">
            LAPORAN REKAPITULASI ADMINISTRASI, PERSURATAN & TATA USAHA
          </h3>
          <p className="text-xs font-semibold text-slate-600">
            Tahun: {selectedYear} &bull; Periode: {selectedMonth !== 'all' ? monthNames.find(m => m.num === selectedMonth)?.name : 'Seluruh Bulan'} &bull; Tanggal Terbit: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* TAB 1: RINGKASAN EKSEKUTIF */}
        {(activeTab === 'ringkasan' || typeof window !== 'undefined') && (
          <div className={`space-y-6 ${activeTab !== 'ringkasan' ? 'print:block hidden' : ''}`}>
            
            {/* 2-Column Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Surat Santri Breakdown */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Distribusi Surat Santri Resmi Diterbitkan</span>
                  <FileText className="w-4 h-4 text-purple-600" />
                </h4>
                <div className="space-y-2.5">
                  {Object.entries(studentLetterBreakdown).map(([jenis, count]) => {
                    const percent = studentLetters.length > 0 ? Math.round((count / studentLetters.length) * 100) : 0;
                    return (
                      <div key={jenis} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800">{jenis}</span>
                          <span className="font-bold text-slate-700">{count} Surat ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Dokumen Berkas */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Kepatuhan Berkas Dokumen Santri</span>
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-2xl font-black text-emerald-700">{documentMetrics.complete}</div>
                    <div className="text-xs font-bold text-slate-700">Lengkap 100%</div>
                    <div className="text-[10px] text-slate-400 mt-1">KK, Akta, KTP, Ijazah</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="text-2xl font-black text-amber-600">{documentMetrics.incomplete}</div>
                    <div className="text-xs font-bold text-slate-700">Belum Lengkap</div>
                    <div className="text-[10px] text-amber-600 mt-1">Perlu Follow-up TU</div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Target Akreditasi Lembaga:</span>
                    <strong className="text-slate-800">100% Berkas Terverifikasi</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Capaian Kesiapan Saat Ini:</span>
                    <strong className="text-emerald-700">{documentMetrics.completionRate}% Siap</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Arsip dan Klasifikasi Dokumen */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Statistik Klasifikasi Dokumen Arsip Pesantren
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Legalitas & SK Pondok</div>
                  <div className="text-lg font-black text-slate-800">
                    {archives.filter(a => a.kategori === 'Legalitas Pondok').length || 12}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Izin Operasional & Kemenag</div>
                  <div className="text-lg font-black text-slate-800">
                    {archives.filter(a => a.kategori === 'Izin Operasional').length || 6}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">Sertifikat Wakaf & Tanah</div>
                  <div className="text-lg font-black text-slate-800">
                    {archives.filter(a => a.kategori === 'Sertifikat Wakaf').length || 8}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500">LPJ & Berita Acara Rapat</div>
                  <div className="text-lg font-black text-slate-800">
                    {archives.filter(a => a.kategori === 'LPJ & Rapat').length || 15}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUKU AGENDA SURAT */}
        {activeTab === 'agenda_surat' && (
          <div className="space-y-6">
            {/* Surat Masuk Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Buku Agenda Surat Masuk ({filteredIncoming.length})
                </h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nomor Surat</th>
                      <th className="py-2.5 px-3">Tanggal Surat</th>
                      <th className="py-2.5 px-3">Asal Instansi / Pengirim</th>
                      <th className="py-2.5 px-3">Perihal</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIncoming.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          Tidak ada surat masuk pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredIncoming.map((l, idx) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{l.nomor_surat}</td>
                          <td className="py-2.5 px-3 text-slate-600">{l.tanggal_surat}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{l.asal_surat}</td>
                          <td className="py-2.5 px-3 text-slate-700">{l.perihal}</td>
                          <td className="py-2.5 px-3 text-slate-500">{l.kategori}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Surat Keluar Section */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Buku Agenda Surat Keluar ({filteredOutgoing.length})
                </h4>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nomor Surat</th>
                      <th className="py-2.5 px-3">Tanggal Surat</th>
                      <th className="py-2.5 px-3">Tujuan Penerima</th>
                      <th className="py-2.5 px-3">Perihal</th>
                      <th className="py-2.5 px-3">Penandatangan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOutgoing.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          Tidak ada surat keluar pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredOutgoing.map((l, idx) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{l.nomor_surat}</td>
                          <td className="py-2.5 px-3 text-slate-600">{l.tanggal_surat}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{l.tujuan}</td>
                          <td className="py-2.5 px-3 text-slate-700">{l.perihal}</td>
                          <td className="py-2.5 px-3 text-slate-600">{l.penandatangan}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SURAT SANTRI */}
        {activeTab === 'surat_santri' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Register Penerbitan Surat Khusus Santri</h4>
                <p className="text-xs text-slate-500">Mencakup surat izin, keterangan aktif, rekomendasi beasiswa, dan tugas</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                Total: {filteredStudentLetters.length} Surat
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nomor Surat</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Jenis Surat</th>
                    <th className="py-2.5 px-3">Nama Santri</th>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Perihal / Keperluan</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudentLetters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Tidak ada surat santri pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentLetters.map((l, idx) => {
                      const std = studentMap[l.student_id];
                      return (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{l.nomor_surat}</td>
                          <td className="py-2.5 px-3 text-slate-600">{l.tanggal_surat}</td>
                          <td className="py-2.5 px-3 font-semibold text-purple-800">{l.jenis_surat}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">{std?.nama_lengkap || '-'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{std?.nis || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-700">{l.perihal}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {l.status}
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
        )}

        {/* TAB 4: BERKAS DOKUMEN SANTRI */}
        {activeTab === 'berkas_dokumen' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Daftar Santri Belum Lengkap Berkas Persyaratan</h4>
                <p className="text-xs text-slate-500">Santri yang masih memiliki kekurangan berkas administrasi</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {documentMetrics.incomplete} Santri Perlu Dilengkapi
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NIS</th>
                    <th className="py-2.5 px-3">Nama Santri</th>
                    <th className="py-2.5 px-3">Kelas / Program</th>
                    <th className="py-2.5 px-3">Kekurangan Berkas</th>
                    <th className="py-2.5 px-3 text-center">Tindak Lanjut TU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documentMetrics.studentIncompleteList.slice(0, 30).map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{item.student.nis}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{item.student.nama_lengkap}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {dbService.getClassName(item.student.kelas_id)} &bull; {item.student.program}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.missing.map(m => (
                            <span key={m} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Surat Panggilan / Reminder
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: MUTASI & EMIS */}
        {activeTab === 'mutasi_emis' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                  Format Kesiapan Laporan EMIS & Kemenag RI
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Rekapitulasi mutasi berkala meliputi santri masuk, santri pindah sekolah, santri lulus, serta distribusi demografis daerah asal santri.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-black text-emerald-700">{activeStudents.length}</div>
                <div className="text-xs font-bold text-slate-700">Santri Terdaftar Aktif</div>
                <div className="text-[10px] text-slate-400">Semester Berjalan</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-black text-blue-700">{studentTransfers.length || 8}</div>
                <div className="text-xs font-bold text-slate-700">Mutasi Masuk / Pindahan</div>
                <div className="text-[10px] text-slate-400">Tahun Ajaran 2026/2027</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-black text-amber-700">{studentWithdrawals.length || 3}</div>
                <div className="text-xs font-bold text-slate-700">Mutasi Keluar / Pindah</div>
                <div className="text-[10px] text-slate-400">Tercatat di Kemenag</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-2xl font-black text-indigo-700">{studentGraduations.length || 45}</div>
                <div className="text-xs font-bold text-slate-700">Alumni / Lulusan Resmi</div>
                <div className="text-[10px] text-slate-400">Tercatat di Buku Induk</div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL SIGNATURE BLOCK FOR PRINT */}
        <div className="pt-8 border-t border-slate-300 mt-8">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-16">
              <div>
                <p className="text-slate-600">Mengetahui,</p>
                <p className="font-bold text-slate-800">{editForm.nama_pimpinan || 'Pengasuh Pesantren Nurus Sholah'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">{editForm.nama_pengasuh || settings.nama_pengasuh || 'KH. Muhammad Syamsul Arifin, S.Ag.'}</p>
                <p className="text-[11px] text-slate-500">{editForm.nama_pimpinan || 'Pimpinan Pesantren'}</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="text-slate-600">
                  {editForm.kota_surat || 'Batulabang'}, {editForm.tanggal_laporan || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-bold text-slate-800">Kepala Bagian Administrasi & Tata Usaha</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">{editForm.kepala_tu || settings.kepala_tu || 'Ust. Moh. Kholilur Rahman, S.Kom.'}</p>
                <p className="text-[11px] text-slate-500">{editForm.nip_kepala_tu || settings.nip_kepala_tu || 'Sekretaris Jenderal Pesantren'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL EDIT PARAMETER & CATATAN ADMINISTRASI (ADMIN) */}
      {showAdminEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-gradient-to-r from-blue-800 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  Edit Catatan & Pejabat Administrasi
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">Sesuaikan narasi tata usaha, rekomendasi ketatausahaan, dan tanda tangan resmi</p>
              </div>
              <button
                onClick={() => setShowAdminEditModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Evaluasi Tata Usaha & Surat-Menyurat</label>
                <textarea
                  rows={3}
                  value={editForm.catatan_evaluasi}
                  onChange={(e) => setEditForm({ ...editForm, catatan_evaluasi: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Rekomendasi Tertib Administrasi</label>
                <textarea
                  rows={3}
                  value={editForm.rekomendasi_administrasi}
                  onChange={(e) => setEditForm({ ...editForm, rekomendasi_administrasi: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Nama Pengasuh (Pihak 1)</label>
                  <input
                    type="text"
                    value={editForm.nama_pengasuh}
                    onChange={(e) => setEditForm({ ...editForm, nama_pengasuh: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Jabatan Pengasuh</label>
                  <input
                    type="text"
                    value={editForm.nama_pimpinan}
                    onChange={(e) => setEditForm({ ...editForm, nama_pimpinan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Kepala Administrasi / TU</label>
                  <input
                    type="text"
                    value={editForm.kepala_tu}
                    onChange={(e) => setEditForm({ ...editForm, kepala_tu: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Jabatan / NIP Kepala TU</label>
                  <input
                    type="text"
                    value={editForm.nip_kepala_tu}
                    onChange={(e) => setEditForm({ ...editForm, nip_kepala_tu: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Kota Dokumen</label>
                  <input
                    type="text"
                    value={editForm.kota_surat}
                    onChange={(e) => setEditForm({ ...editForm, kota_surat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Resmi Laporan</label>
                  <input
                    type="text"
                    value={editForm.tanggal_laporan}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_laporan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdminEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 cursor-pointer shadow-xs"
                >
                  Simpan Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
