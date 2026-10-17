import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  Users, 
  FileText, 
  CheckSquare, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  Download, 
  Lock, 
  History, 
  Sparkles, 
  Share2, 
  ArrowLeft, 
  X, 
  Check, 
  DollarSign, 
  Send,
  Sliders,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../services/db';
import { 
  PondokMeeting, 
  MeetingParticipant, 
  MeetingAgenda, 
  MeetingMinute, 
  MeetingDecision, 
  MeetingFollowup, 
  MeetingResult, 
  MeetingReport 
} from '../../types/database';

interface MeetingDetailPageProps {
  meetingId: string;
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingDetailPage: React.FC<MeetingDetailPageProps> = ({ meetingId, onNavigate }) => {
  const [meeting, setMeeting] = useState<PondokMeeting | undefined>(() => dbService.getPondokMeetingById(meetingId));
  const participants = dbService.getMeetingParticipants(meetingId);
  const agendas = dbService.getMeetingAgendas(meetingId);
  const minutesList = dbService.getMeetingMinutes(meetingId);
  const decisions = dbService.getMeetingDecisions(meetingId);
  const followups = dbService.getMeetingFollowups(meetingId);
  const result = dbService.getMeetingResultByMeetingId(meetingId);
  const report = dbService.getMeetingReportByMeetingId(meetingId);
  const teachers = dbService.getTeachers();
  const users = dbService.getUsers();
  const students = dbService.getStudents();
  const auditLogs = dbService.getAuditLogs().filter(l => (l.data_terkait || '').includes(meetingId) || (l.data_terkait || '').includes(meeting?.judul_rapat || 'xxx'));

  const minute = minutesList.length > 0 ? minutesList[0] : undefined;

  const [activeTab, setActiveTab] = useState<
    'informasi' | 'peserta' | 'agenda' | 'pembahasan' | 'keputusan' | 'tindak_lanjut' | 'dokumentasi' | 'laporan' | 'riwayat'
  >('informasi');

  // Admin Edit Meeting State
  const [showEditMeetingModal, setShowEditMeetingModal] = useState(false);
  const [editMeetingForm, setEditMeetingForm] = useState<Partial<PondokMeeting>>({});

  // Print Mode State
  const [printDocType, setPrintDocType] = useState<string | null>(null);

  // Form States for Participants
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newPartData, setNewPartData] = useState({
    nama: '',
    jabatan: 'Anggota Rapat',
    kehadiran: 'Hadir' as const,
    user_id: '',
    teacher_id: '',
    catatan: ''
  });

  // Form States for Agenda Item
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [newAgendaData, setNewAgendaData] = useState({
    judul: '',
    kategori: 'Pendidikan',
    masalah_latar_belakang: '',
    bahan_pembahasan: '',
    prioritas: 'Sedang' as const,
    pic: ''
  });

  // Editor State for Pembahasan & Notulen
  const [minuteText, setMinuteText] = useState({
    pembukaan: minute?.pembukaan || 'Rapat dibuka dengan membaca Ummul Qur\'an Al-Fatihah dipimpin oleh Pimpinan Rapat.',
    pembahasan_lengkap: minute?.pembahasan_lengkap || '1. Pembahasan Evaluasi Pembelajaran Kitabiyah berjalan lancar.\n2. Pembahasan Kedisiplinan & Ketertiban Santri.',
    penutup: minute?.penutup || 'Rapat ditutup dengan do\'a kaffaratul majlis pada pukul 21:30 WIB.'
  });

  // Form State for Decision
  const [showAddDecision, setShowAddDecision] = useState(false);
  const [newDecisionData, setNewDecisionData] = useState({
    isi_keputusan: '',
    kategori: 'Kedisiplinan',
    penanggung_jawab: '',
    deadline: new Date().toISOString().split('T')[0],
    prioritas: 'Sangat Penting' as const
  });

  // Form State for Followup
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [newFollowupData, setNewFollowupData] = useState({
    judul: '',
    keputusan: '',
    pic: '',
    unit_bagian: 'Pengurus Asrama',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    deadline: new Date().toISOString().split('T')[0],
    prioritas: 'Sangat Penting' as const,
    progress_percent: 0
  });

  // Form State for Integrations Modals
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [selectedDecisionForIntegration, setSelectedDecisionForIntegration] = useState<MeetingDecision | null>(null);

  const [integrationActivity, setIntegrationActivity] = useState({ nama: '', pic: '', anggaran: 0 });
  const [integrationExpense, setIntegrationExpense] = useState({ nominal: 1000000, keperluan: '', pic: '' });
  const [integrationLetter, setIntegrationLetter] = useState({ penerima: 'Seluruh Wali Santri & Dewan Guru', perihal: '' });

  if (!meeting) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Rapat Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Data agenda rapat tidak tersimpan atau telah dihapus dari sistem.</p>
        <button onClick={() => onNavigate('meet_dashboard')} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
          Kembali ke Dashboard Rapat
        </button>
      </div>
    );
  }

  // Handle Save Participant
  const handleSaveParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveMeetingParticipant({
      meeting_id: meetingId,
      ...newPartData
    });
    setShowAddParticipant(false);
    setNewPartData({ nama: '', jabatan: 'Anggota Rapat', kehadiran: 'Hadir', user_id: '', teacher_id: '', catatan: '' });
  };

  // Handle Save Agenda
  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveMeetingAgenda({
      meeting_id: meetingId,
      ...newAgendaData
    });
    setShowAddAgenda(false);
    setNewAgendaData({ judul: '', kategori: 'Pendidikan', masalah_latar_belakang: '', bahan_pembahasan: '', prioritas: 'Sedang', pic: '' });
  };

  // Handle Save Minute
  const handleSaveMinute = () => {
    dbService.saveMeetingMinute({
      id: minute?.id,
      meeting_id: meetingId,
      ...minuteText,
      locked: true
    });
    alert('Notulen rapat berhasil disimpan & dikunci.');
  };

  // Handle Save Decision
  const handleSaveDecision = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveMeetingDecision({
      meeting_id: meetingId,
      ...newDecisionData
    });
    setShowAddDecision(false);
    setNewDecisionData({ isi_keputusan: '', kategori: 'Kedisiplinan', penanggung_jawab: '', deadline: new Date().toISOString().split('T')[0], prioritas: 'Sangat Penting' });
  };

  // Handle Save Followup
  const handleSaveFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveMeetingFollowup({
      meeting_id: meetingId,
      sumber_rapat: meeting.judul_rapat,
      ...newFollowupData
    });
    setShowAddFollowup(false);
  };

  // Handle Integration: Create Activity
  const handleExecCreateActivity = () => {
    if (!selectedDecisionForIntegration) return;
    dbService.createActivityFromDecision(selectedDecisionForIntegration.id, {
      nama_kegiatan: integrationActivity.nama || selectedDecisionForIntegration.isi_keputusan,
      penanggung_jawab: integrationActivity.pic || selectedDecisionForIntegration.penanggung_jawab,
      total_anggaran: Number(integrationActivity.anggaran) || 0
    });
    alert('Berhasil membuat Kegiatan Pondok baru dari Keputusan Rapat!');
    setShowActivityModal(false);
  };

  // Handle Integration: Expense Request
  const handleExecCreateExpense = () => {
    if (!selectedDecisionForIntegration) return;
    dbService.createExpenseRequestFromDecision(
      selectedDecisionForIntegration.id,
      Number(integrationExpense.nominal),
      integrationExpense.keperluan || selectedDecisionForIntegration.isi_keputusan,
      integrationExpense.pic || selectedDecisionForIntegration.penanggung_jawab
    );
    alert('Berhasil membuat Pengajuan Pengeluaran Dana dari Keputusan Rapat!');
    setShowExpenseModal(false);
  };

  // Handle Integration: Letter
  const handleExecCreateLetter = () => {
    dbService.createLetterFromMeetingResult(
      meetingId,
      integrationLetter.penerima,
      integrationLetter.perihal || `Surat Keputusan ${meeting.nomor_rapat}`
    );
    alert('Berhasil menerbitkan Surat Keluar resmi dari Hasil Rapat!');
    setShowLetterModal(false);
  };

  // Handle Admin Edit Meeting
  const handleOpenEditMeeting = () => {
    if (!meeting) return;
    setEditMeetingForm({ ...meeting });
    setShowEditMeetingModal(true);
  };

  const handleSaveMeetingEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;
    const updated = dbService.savePondokMeeting({
      ...meeting,
      ...editMeetingForm
    });
    setMeeting(updated);
    setShowEditMeetingModal(false);
  };

  const handleQuickStatusChange = (newStatus: PondokMeeting['status']) => {
    if (!meeting) return;
    const updated = dbService.savePondokMeeting({
      ...meeting,
      status: newStatus
    });
    setMeeting(updated);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('meet_dashboard')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
              <span>{meeting.nomor_rapat || 'RPT/NS'}</span>
              <span>•</span>
              <span className="text-emerald-700 font-sans font-semibold">{meeting.jenis_rapat}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{meeting.judul_rapat}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Studio Notulen Live Button */}
          <button
            onClick={() => onNavigate('meet_live_notulen', { meetingId: meeting.id })}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Buka Studio Notulen untuk mencatat jalannya rapat secara langsung"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>Studio Notulen (Catat Langsung)</span>
          </button>

          {/* Admin Edit Meeting Button */}
          <button
            onClick={handleOpenEditMeeting}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Edit data dan jadwal musyawarah"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Rapat</span>
          </button>

          <button
            onClick={() => setPrintDocType('RAPOR_LENGKAP')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak / Export PDF
          </button>

          <button
            onClick={() => {
              setSelectedDecisionForIntegration(decisions[0] || null);
              setShowLetterModal(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Buat Surat Resmi
          </button>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Scrollable Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'informasi', label: 'Informasi', icon: Calendar },
            { id: 'peserta', label: `Peserta (${participants.length})`, icon: Users },
            { id: 'agenda', label: `Agenda (${agendas.length})`, icon: Sliders },
            { id: 'pembahasan', label: 'Pembahasan & Notulen', icon: FileText },
            { id: 'keputusan', label: `Keputusan (${decisions.length})`, icon: FileCheck2 },
            { id: 'tindak_lanjut', label: `Tindak Lanjut (${followups.length})`, icon: CheckSquare },
            { id: 'dokumentasi', label: 'Dokumentasi', icon: FolderOpen },
            { id: 'laporan', label: 'Laporan Hasil', icon: Sparkles },
            { id: 'riwayat', label: 'Riwayat Audit', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  active
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: INFORMASI */}
        {activeTab === 'informasi' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Identitas Musyawarah
                  </h3>
                  <button
                    onClick={handleOpenEditMeeting}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Rapat
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Nomor Rapat Resmi:</span>
                    <span className="font-mono font-bold text-slate-800">{meeting.nomor_rapat || '-'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Jenis Rapat:</span>
                    <span className="font-semibold text-emerald-800">{meeting.jenis_rapat}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Hari & Tanggal:</span>
                    <span className="font-semibold text-slate-800">{meeting.hari}, {meeting.tanggal}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Waktu Pelaksanaan:</span>
                    <span className="font-semibold text-slate-800">{meeting.waktu_mulai} - {meeting.waktu_selesai} WIB</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Tempat / Ruangan:</span>
                    <span className="font-semibold text-slate-800">{meeting.tempat}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-slate-500">Status Agenda:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={meeting.status}
                        onChange={(e) => handleQuickStatusChange(e.target.value as any)}
                        className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="TERJADWAL">TERJADWAL</option>
                        <option value="BERLANGSUNG">BERLANGSUNG</option>
                        <option value="SELESAI">SELESAI</option>
                        <option value="DITUNDA">DITUNDA</option>
                        <option value="DIBATALKAN">DIBATALKAN</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Pimpinan & Undangan Peserta
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Pimpinan Rapat</div>
                    <div className="text-sm font-bold text-emerald-900">{meeting.pimpinan_rapat}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Sekretaris / Notulis</div>
                    <div className="text-sm font-bold text-slate-800">{meeting.sekretaris_rapat}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Target Peserta</div>
                    <div className="text-xs font-semibold text-slate-700">{meeting.peserta_ringkasan || 'Seluruh Pengurus'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda Utama & Purpose */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Agenda Utama & Tujuan Rapat
              </div>
              <p className="text-slate-700 whitespace-pre-line">{meeting.agenda_utama || 'Tidak ada uraian agenda utama.'}</p>
            </div>
          </div>
        )}

        {/* TAB 2: PESERTA */}
        {activeTab === 'peserta' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Presensi Kehadiran Peserta
              </h3>
              <button
                onClick={() => setShowAddParticipant(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Peserta
              </button>
            </div>

            {/* Participants Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3 border-b">No</th>
                    <th className="p-3 border-b">Nama Peserta</th>
                    <th className="p-3 border-b">Jabatan / Role</th>
                    <th className="p-3 border-b">Status Kehadiran</th>
                    <th className="p-3 border-b">Catatan</th>
                    <th className="p-3 border-b text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Belum ada peserta terdaftar dalam rapat ini. Klik "+ Tambah Peserta".
                      </td>
                    </tr>
                  ) : (
                    participants.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-500">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-800">{p.nama}</td>
                        <td className="p-3 text-slate-600">{p.jabatan}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.kehadiran === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            p.kehadiran === 'Izin' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            p.kehadiran === 'Sakit' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {p.kehadiran}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{p.catatan || '-'}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => dbService.deleteMeetingParticipant(p.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AGENDA */}
        {activeTab === 'agenda' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" /> Poin Agenda Pembahasan
              </h3>
              <button
                onClick={() => setShowAddAgenda(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Poin Agenda
              </button>
            </div>

            <div className="space-y-3">
              {agendas.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada poin agenda. Klik "+ Tambah Poin Agenda".
                </div>
              ) : (
                agendas.map((agd) => (
                  <div key={agd.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                          {agd.urutan}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">{agd.judul}</h4>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">
                          {agd.kategori}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        Prioritas: {agd.prioritas}
                      </span>
                    </div>
                    {agd.masalah_latar_belakang && (
                      <p className="text-xs text-slate-600"><span className="font-semibold">Latar Belakang:</span> {agd.masalah_latar_belakang}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PEMBAHASAN & NOTULEN */}
        {activeTab === 'pembahasan' && (
          <div className="p-6 space-y-5">
            {/* Live Studio Callout Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Ingin Mencatat Notulen Rapat Secara Live?</h4>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    Gunakan <strong>Studio Notulen (Live)</strong> untuk merekam masukan peserta, absensi interaktif, penetapan keputusan otomatis, dan cetak berita acara langsung.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('meet_live_notulen', { meetingId: meeting.id })}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Buka Studio Notulen
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Pencatatan Notulen & Pembahasan Rapat</h3>
                <p className="text-xs text-slate-500">Poin pembukaan, usulan pendapat peserta, pembahasan lengkap, dan penutup</p>
              </div>
              <button
                onClick={handleSaveMinute}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" /> Simpan & Kunci Notulen
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pembukaan Musyawarah</label>
                <textarea
                  rows={2}
                  value={minuteText.pembukaan}
                  onChange={(e) => setMinuteText({ ...minuteText, pembukaan: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Pembahasan Lengkap & Masukan Peserta</label>
                <textarea
                  rows={6}
                  value={minuteText.pembahasan_lengkap}
                  onChange={(e) => setMinuteText({ ...minuteText, pembahasan_lengkap: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Penutup Musyawarah</label>
                <textarea
                  rows={2}
                  value={minuteText.penutup}
                  onChange={(e) => setMinuteText({ ...minuteText, penutup: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: KEPUTUSAN */}
        {activeTab === 'keputusan' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" /> Keputusan Resmi Hasil Musyawarah
              </h3>
              <button
                onClick={() => setShowAddDecision(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Keputusan
              </button>
            </div>

            <div className="space-y-3">
              {decisions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada catatan keputusan resmi. Klik "+ Tambah Keputusan".
                </div>
              ) : (
                decisions.map((dec) => (
                  <div key={dec.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded border border-purple-200">
                          {dec.nomor_keputusan}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {dec.kategori}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">Deadline: {dec.deadline}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 whitespace-pre-line">{dec.isi_keputusan}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-600">PIC: {dec.penanggung_jawab}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Action Integration Buttons */}
                        <button
                          onClick={() => {
                            setSelectedDecisionForIntegration(dec);
                            setIntegrationActivity({ nama: dec.isi_keputusan, pic: dec.penanggung_jawab, anggaran: 5000000 });
                            setShowActivityModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Buat Kegiatan
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDecisionForIntegration(dec);
                            setIntegrationExpense({ nominal: 1000000, keperluan: dec.isi_keputusan, pic: dec.penanggung_jawab });
                            setShowExpenseModal(true);
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" /> Request Dana
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: TINDAK LANJUT */}
        {activeTab === 'tindak_lanjut' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" /> Monitoring Progress & Tindak Lanjut Rapat
              </h3>
              <button
                onClick={() => setShowAddFollowup(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Tugas
              </button>
            </div>

            <div className="space-y-3">
              {followups.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada tugas tindak lanjut.
                </div>
              ) : (
                followups.map((flw) => (
                  <div key={flw.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{flw.judul}</h4>
                      <span className="text-xs font-bold text-emerald-800">{flw.progress_percent}% Progress</span>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${flw.progress_percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                        { [0, 25, 50, 75, 100].map(pct => (
                          <button
                            key={pct}
                            onClick={() => dbService.saveMeetingFollowup({ id: flw.id, progress_percent: pct })}
                            className={`hover:text-emerald-700 ${flw.progress_percent === pct ? 'text-emerald-800 font-bold underline' : ''}`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>PIC: <strong>{flw.pic}</strong> ({flw.unit_bagian})</span>
                      <span>Deadline: <strong>{flw.deadline}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 8: LAPORAN HASIL */}
        {activeTab === 'laporan' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Laporan Hasil Rapat Resmi</h3>
                <p className="text-xs text-slate-500">Pratinjau naskah dokumen laporan dengan persetujuan Pengasuh</p>
              </div>

              <div className="flex items-center gap-2">
                {report?.status === 'DISETUJUI' ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> DISETUJUI & DIKUNCI
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      dbService.saveMeetingReport({
                        meeting_id: meetingId,
                        nomor_laporan: dbService.getNextReportNumber(),
                        judul_laporan: `Laporan Hasil ${meeting.judul_rapat}`,
                        tujuan_rapat: meeting.tujuan || meeting.agenda_utama || '',
                        pimpinan_nama: meeting.pimpinan_rapat,
                        sekretaris_nama: meeting.sekretaris_rapat,
                        pengasuh_nama: 'KH. Muhammad Syamsul Arifin, S.Ag.',
                        status: 'DISETUJUI',
                        locked: true
                      });
                      alert('Laporan rapat berhasil disetujui & dikunci!');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow"
                  >
                    Setujui & Kunci Laporan
                  </button>
                )}
              </div>
            </div>

            {/* Official Report Document Preview Box */}
            <div className="p-8 bg-white border border-slate-300 rounded-xl shadow-inner max-w-3xl mx-auto space-y-6 text-xs text-slate-800 font-serif">
              {/* Kop Pesantren */}
              <div className="text-center border-b-2 border-slate-900 pb-3 font-sans">
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-900">PONDOK PESANTREN NURUS SHOLAH</div>
                <div className="text-lg font-extrabold text-slate-900 uppercase">BATULABANG AKKOR PALENGAAN PAMEKASAN</div>
                <div className="text-[11px] text-slate-600">Akkor, Palengaan, Kabupaten Pamekasan, Jawa Timur 69362</div>
              </div>

              <div className="text-center font-sans space-y-1">
                <div className="text-sm font-bold uppercase tracking-wide underline">LAPORAN HASIL RAPAT</div>
                <div className="text-xs font-mono">Nomor: {report?.nomor_laporan || 'LAP/NS/10/2026/001'}</div>
              </div>

              <div className="space-y-3 leading-relaxed">
                <div><strong>Judul Musyawarah:</strong> {meeting.judul_rapat}</div>
                <div><strong>Hari / Tanggal:</strong> {meeting.hari}, {meeting.tanggal}</div>
                <div><strong>Waktu / Tempat:</strong> {meeting.waktu_mulai} - {meeting.waktu_selesai} WIB / {meeting.tempat}</div>
                <div><strong>Pimpinan Rapat:</strong> {meeting.pimpinan_rapat}</div>
                <div><strong>Sekretaris / Notulis:</strong> {meeting.sekretaris_rapat}</div>

                <div className="pt-2">
                  <div className="font-bold border-b border-slate-200 pb-1 mb-1">A. Tujuan Rapat</div>
                  <p>{meeting.tujuan || 'Evaluasi program dan menyusun rencana kegiatan.'}</p>
                </div>

                <div>
                  <div className="font-bold border-b border-slate-200 pb-1 mb-1">B. Hasil Keputusan Utama</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {decisions.map(d => (
                      <li key={d.id}><strong>[{d.nomor_keputusan}]</strong> {d.isi_keputusan} (PIC: {d.penanggung_jawab})</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 text-center font-sans pt-12 text-xs">
                <div>
                  <div>Sekretaris Rapat</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-400 inline-block px-4">{meeting.sekretaris_rapat}</div>
                </div>
                <div>
                  <div>Pimpinan Rapat</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-400 inline-block px-4">{meeting.pimpinan_rapat}</div>
                </div>
                <div>
                  <div>Mengetahui, Pengasuh</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-400 inline-block px-4">KH. M. Syamsul Arifin</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: RIWAYAT AUDIT */}
        {activeTab === 'riwayat' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" /> Catatan Audit Log Musyawarah
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">Belum ada riwayat catatan audit khusus.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{log.aktivitas} ({log.modul})</div>
                      <div className="text-slate-600">{log.data_terkait}</div>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL PRINT PREVIEW */}
      {printDocType && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <h3 className="text-base font-bold text-slate-800">Pratinjau Berkas Cetak Official (A4)</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
                  Cetak Sekarang
                </button>
                <button onClick={() => setPrintDocType(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl">
                  Tutup
                </button>
              </div>
            </div>

            {/* Print Official Content */}
            <div className="space-y-6 text-slate-900 font-serif">
              <div className="text-center border-b-4 border-double border-slate-900 pb-3 font-sans">
                <div className="text-sm font-bold uppercase tracking-widest text-emerald-900">PONDOK PESANTREN NURUS SHOLAH</div>
                <div className="text-xl font-extrabold text-slate-900">BATULABANG AKKOR PALENGAAN PAMEKASAN</div>
                <div className="text-xs text-slate-600">Alamat: Batulabang, Desa Akkor, Kec. Palengaan, Kab. Pamekasan 69362</div>
              </div>

              <div className="text-center font-sans space-y-1">
                <div className="text-base font-bold underline uppercase">BERKAS HASIL MUSYAWARAH RESMI</div>
                <div className="text-xs font-mono">Nomor: {meeting.nomor_rapat || 'RPT/NS/2026/001'}</div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div><strong>Rapat:</strong> {meeting.judul_rapat}</div>
                <div><strong>Hari/Tanggal:</strong> {meeting.hari}, {meeting.tanggal}</div>
                <div><strong>Pimpinan:</strong> {meeting.pimpinan_rapat}</div>
                <div><strong>Hasil Keputusan:</strong></div>
                <ol className="list-decimal pl-5 space-y-1">
                  {decisions.map(d => (
                    <li key={d.id}><strong>[{d.nomor_keputusan}]</strong> {d.isi_keputusan}</li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-3 text-center font-sans pt-16 text-xs">
                <div>
                  <div>Sekretaris</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-900 inline-block px-4">{meeting.sekretaris_rapat}</div>
                </div>
                <div>
                  <div>Pimpinan Rapat</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-900 inline-block px-4">{meeting.pimpinan_rapat}</div>
                </div>
                <div>
                  <div>Pengasuh Pesantren</div>
                  <div className="h-16"></div>
                  <div className="font-bold border-b border-slate-900 inline-block px-4">KH. M. Syamsul Arifin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTEGRASI: Buat Kegiatan */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" /> Buat Kegiatan Pondok dari Keputusan
            </h3>
            <p className="text-xs text-slate-500">Sistem otomatis mengisi data dari Keputusan Rapat.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Nama Kegiatan</label>
                <input
                  type="text"
                  value={integrationActivity.nama}
                  onChange={(e) => setIntegrationActivity({ ...integrationActivity, nama: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  value={integrationActivity.pic}
                  onChange={(e) => setIntegrationActivity({ ...integrationActivity, pic: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Total Anggaran (Rp)</label>
                <input
                  type="number"
                  value={integrationActivity.anggaran}
                  onChange={(e) => setIntegrationActivity({ ...integrationActivity, anggaran: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowActivityModal(false)} className="px-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-lg">Batal</button>
              <button onClick={handleExecCreateActivity} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg">Terbitkan Kegiatan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTEGRASI: Request Dana */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" /> Request Pengeluaran Dana dari Keputusan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Nominal Dana (Rp)</label>
                <input
                  type="number"
                  value={integrationExpense.nominal}
                  onChange={(e) => setIntegrationExpense({ ...integrationExpense, nominal: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Keperluan / Keterangan</label>
                <input
                  type="text"
                  value={integrationExpense.keperluan}
                  onChange={(e) => setIntegrationExpense({ ...integrationExpense, keperluan: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowExpenseModal(false)} className="px-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-lg">Batal</button>
              <button onClick={handleExecCreateExpense} className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg">Kirim Request Dana</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA RAPAT (ADMIN) */}
      {showEditMeetingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-300" />
                  Edit Informasi Musyawarah (Admin)
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">Perbarui rincian data, waktu pelaksanaan, dan penanggung jawab rapat</p>
              </div>
              <button
                onClick={() => setShowEditMeetingModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeetingEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Judul Rapat / Musyawarah <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editMeetingForm.judul_rapat || ''}
                  onChange={(e) => setEditMeetingForm({ ...editMeetingForm, judul_rapat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Jenis Musyawarah</label>
                  <input
                    type="text"
                    value={editMeetingForm.jenis_rapat || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, jenis_rapat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Status Agenda</label>
                  <select
                    value={editMeetingForm.status || 'TERJADWAL'}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="TERJADWAL">TERJADWAL</option>
                    <option value="BERLANGSUNG">BERLANGSUNG (SEDANG RAPAT)</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DITUNDA">DITUNDA</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    value={editMeetingForm.tanggal || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Waktu Mulai</label>
                  <input
                    type="text"
                    value={editMeetingForm.waktu_mulai || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, waktu_mulai: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Waktu Selesai</label>
                  <input
                    type="text"
                    value={editMeetingForm.waktu_selesai || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, waktu_selesai: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tempat / Ruangan</label>
                <input
                  type="text"
                  value={editMeetingForm.tempat || ''}
                  onChange={(e) => setEditMeetingForm({ ...editMeetingForm, tempat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Pimpinan Musyawarah</label>
                  <input
                    type="text"
                    value={editMeetingForm.pimpinan_rapat || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, pimpinan_rapat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sekretaris / Notulis</label>
                  <input
                    type="text"
                    value={editMeetingForm.sekretaris_rapat || ''}
                    onChange={(e) => setEditMeetingForm({ ...editMeetingForm, sekretaris_rapat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Agenda Utama</label>
                <textarea
                  rows={2}
                  value={editMeetingForm.agenda_utama || ''}
                  onChange={(e) => setEditMeetingForm({ ...editMeetingForm, agenda_utama: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Target Undangan Peserta</label>
                <input
                  type="text"
                  value={editMeetingForm.peserta_ringkasan || ''}
                  onChange={(e) => setEditMeetingForm({ ...editMeetingForm, peserta_ringkasan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditMeetingModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INTEGRASI: Buat Surat */}
      {showLetterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" /> Buat Surat Keluar dari Hasil Rapat
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Tujuan / Penerima Surat</label>
                <input
                  type="text"
                  value={integrationLetter.penerima}
                  onChange={(e) => setIntegrationLetter({ ...integrationLetter, penerima: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Perihal Surat</label>
                <input
                  type="text"
                  placeholder={`Surat Keputusan ${meeting.nomor_rapat}`}
                  value={integrationLetter.perihal}
                  onChange={(e) => setIntegrationLetter({ ...integrationLetter, perihal: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowLetterModal(false)} className="px-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-lg">Batal</button>
              <button onClick={handleExecCreateLetter} className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">Terbitkan Surat Official</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
