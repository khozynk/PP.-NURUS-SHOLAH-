import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Clock, 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Repeat, 
  Sliders, 
  FileCheck2,
  X,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../services/db';
import { PondokMeeting, MeetingTemplate } from '../../types/database';

interface MeetingAgendaPageProps {
  onNavigate: (view: string, param?: any) => void;
  initialTypeFilter?: string;
}

export const MeetingAgendaPage: React.FC<MeetingAgendaPageProps> = ({ onNavigate, initialTypeFilter }) => {
  const meetings = dbService.getPondokMeetings();
  const teachers = dbService.getTeachers();
  const users = dbService.getUsers();
  const templates = dbService.getMeetingTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setFilterType] = useState(initialTypeFilter || 'ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Partial<PondokMeeting> | null>(null);

  // Custom Meeting Types State
  const [meetingTypes, setMeetingTypes] = useState<string[]>(() => {
    const s = dbService.getSettings();
    return s.meeting_types && s.meeting_types.length > 0 ? s.meeting_types : [
      'Rapat Bulanan',
      'Rapat Pengurus',
      'Rapat Pengasuh',
      'Rapat Guru/Ustadz',
      'Rapat Evaluasi',
      'Rapat Akademik',
      'Rapat Santri',
      'Rapat Keuangan',
      'Rapat Kegiatan',
      'Rapat Khusus',
      'Lainnya'
    ];
  });
  const [newTypeInput, setNewTypeInput] = useState('');
  const [showAddType, setShowAddType] = useState(false);

  // Selected Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Form Fields
  const [formData, setFormData] = useState<Partial<PondokMeeting>>({
    judul_rapat: '',
    jenis_rapat: 'Rapat Bulanan',
    tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '19:30',
    waktu_selesai: '21:30',
    tempat: 'Aula Utama PP Nurus Sholah',
    pimpinan_rapat: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    sekretaris_rapat: 'Ust. Abdullah Sajjad',
    agenda_utama: '',
    tujuan: '',
    peserta_ringkasan: 'Seluruh Dewan Guru & Pengurus Asrama',
    catatan: '',
    status: 'TERJADWAL',
    is_recurring: false,
    recurrence_pattern: 'Minggu Pertama Setiap Bulan'
  });

  // Postponed Modal State
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [postponeMeeting, setPostponeMeeting] = useState<PondokMeeting | null>(null);
  const [postponeData, setPostponeData] = useState({
    reason: '',
    newDate: new Date().toISOString().split('T')[0],
    newTime: '19:30',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingMeeting(null);
    setFormData({
      judul_rapat: '',
      jenis_rapat: 'Rapat Bulanan',
      tanggal: new Date().toISOString().split('T')[0],
      waktu_mulai: '19:30',
      waktu_selesai: '21:30',
      tempat: 'Aula Utama PP Nurus Sholah',
      pimpinan_rapat: 'KH. Muhammad Syamsul Arifin, S.Ag.',
      sekretaris_rapat: 'Ust. Abdullah Sajjad',
      agenda_utama: '',
      tujuan: '',
      peserta_ringkasan: 'Seluruh Dewan Guru & Pengurus Asrama',
      catatan: '',
      status: 'TERJADWAL',
      is_recurring: false
    });
    setSelectedTemplateId('');
    setShowModal(true);
  };

  const handleOpenEdit = (m: PondokMeeting) => {
    setEditingMeeting(m);
    setFormData({ ...m });
    setSelectedTemplateId('');
    setShowModal(true);
  };

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      const agendaStr = tpl.agendas.map((a, i) => `${i + 1}. ${a.judul} [Kategori: ${a.kategori}]`).join('\n');
      setFormData(prev => ({
        ...prev,
        jenis_rapat: tpl.jenis_rapat || prev.jenis_rapat,
        judul_rapat: prev.judul_rapat || tpl.nama_template,
        agenda_utama: agendaStr
      }));
    }
  };

  const handleAddCustomType = () => {
    const trimmed = newTypeInput.trim();
    if (!trimmed) return;
    let nextList = meetingTypes;
    if (!meetingTypes.includes(trimmed)) {
      nextList = [...meetingTypes, trimmed];
      setMeetingTypes(nextList);
      const curr = dbService.getSettings();
      dbService.updateSettings({ ...curr, meeting_types: nextList });
    }
    setFormData(prev => ({ ...prev, jenis_rapat: trimmed }));
    setNewTypeInput('');
    setShowAddType(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul_rapat || !formData.tanggal) return;

    if (formData.status === 'DITUNDA' && !editingMeeting) {
      alert('Gunakan aksi "Tunda Rapat" untuk memasukkan alasan penundaan dan tanggal baru.');
      return;
    }

    dbService.savePondokMeeting({
      ...formData,
      id: editingMeeting?.id
    });

    setShowModal(false);
  };

  const handleDelete = (m: PondokMeeting) => {
    if (confirm(`Apakah Anda yakin ingin menghapus agenda rapat: "${m.judul_rapat}"?`)) {
      dbService.deletePondokMeeting(m.id);
    }
  };

  const handleOpenPostpone = (m: PondokMeeting) => {
    setPostponeMeeting(m);
    setPostponeData({
      reason: m.postponed_reason || '',
      newDate: m.postponed_new_date || new Date().toISOString().split('T')[0],
      newTime: m.postponed_new_time || m.waktu_mulai,
      notes: m.postponed_notes || ''
    });
    setShowPostponeModal(true);
  };

  const handleSavePostpone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponeMeeting || !postponeData.reason) return;

    dbService.savePondokMeeting({
      ...postponeMeeting,
      status: 'DITUNDA',
      postponed_reason: postponeData.reason,
      postponed_new_date: postponeData.newDate,
      postponed_new_time: postponeData.newTime,
      postponed_notes: postponeData.notes,
      tanggal: postponeData.newDate,
      waktu_mulai: postponeData.newTime
    });

    setShowPostponeModal(false);
  };

  // Generate Recurring Agenda for Next Month
  const handleGenerateRecurringAgendas = () => {
    const recurring = meetings.filter(m => m.is_recurring);
    if (recurring.length === 0) {
      alert('Belum ada agenda rapat yang ditandai sebagai "Rapat Berulang". Anda dapat mengaktifkan opsi "Rapat Berulang" saat membuat agenda.');
      return;
    }

    let generatedCount = 0;
    recurring.forEach(m => {
      const nextMonthDate = new Date();
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonthStr = nextMonthDate.toISOString().split('T')[0];

      dbService.savePondokMeeting({
        judul_rapat: `${m.judul_rapat} (Periode Bulanan)`,
        jenis_rapat: m.jenis_rapat,
        tanggal: nextMonthStr,
        waktu_mulai: m.waktu_mulai,
        waktu_selesai: m.waktu_selesai,
        tempat: m.tempat,
        pimpinan_rapat: m.pimpinan_rapat,
        sekretaris_rapat: m.sekretaris_rapat,
        agenda_utama: m.agenda_utama,
        tujuan: m.tujuan,
        peserta_ringkasan: m.peserta_ringkasan,
        status: 'TERJADWAL',
        is_recurring: true
      });
      generatedCount++;
    });

    alert(`Berhasil membuat ${generatedCount} agenda rapat berulang otomatis untuk periode bulan berikutnya!`);
  };

  const filteredMeetings = meetings.filter(m => {
    const matchSearch = m.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.nomor_rapat && m.nomor_rapat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        m.pimpinan_rapat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.agenda_utama && m.agenda_utama.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchType = typeFilter === 'ALL' || m.jenis_rapat === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-emerald-600" /> Agenda Rapat Bulanan
          </div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal & Agenda Musyawarah</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola seluruh agenda musyawarah bulanan, rapat pengurus, dan pengasuh pesantren</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('meet_live_notulen')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Buka Studio Notulen untuk mencatat jalannya rapat secara langsung"
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>Studio Notulen (Live)</span>
          </button>

          <button
            onClick={handleGenerateRecurringAgendas}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5 text-purple-600" /> Generate Agenda Bulanan
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> + Buat Agenda Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci rapat, nomor, agenda, pimpinan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">DRAFT</option>
            <option value="TERJADWAL">TERJADWAL</option>
            <option value="BERLANGSUNG">BERLANGSUNG</option>
            <option value="SELESAI">SELESAI</option>
            <option value="DITUNDA">DITUNDA</option>
            <option value="DIBATALKAN">DIBATALKAN</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="ALL">Semua Jenis Rapat</option>
            {meetingTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meeting Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">Tidak ada agenda rapat yang sesuai filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Silakan ganti filter status/jenis rapat atau tambahkan agenda rapat baru.
            </p>
          </div>
        ) : (
          filteredMeetings.map((mtg) => (
            <div
              key={mtg.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {mtg.nomor_rapat || 'RPT/NS'}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {mtg.jenis_rapat}
                  </span>
                  {mtg.is_recurring && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <Repeat className="w-3 h-3"/> Berulang
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {mtg.status === 'SELESAI' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> SELESAI</span>}
                  {mtg.status === 'TERJADWAL' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> TERJADWAL</span>}
                  {mtg.status === 'BERLANGSUNG' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse"><Clock className="w-3.5 h-3.5"/> BERLANGSUNG</span>}
                  {mtg.status === 'DITUNDA' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> DITUNDA</span>}
                  {mtg.status === 'DIBATALKAN' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> DIBATALKAN</span>}
                  {mtg.status === 'DRAFT' && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">DRAFT</span>}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer" onClick={() => onNavigate('meet_detail', { meetingId: mtg.id })}>
                  {mtg.judul_rapat}
                </h3>
                {mtg.tujuan && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    <span className="font-semibold text-slate-700">Tujuan:</span> {mtg.tujuan}
                  </p>
                )}
              </div>

              {/* Postponed Warning Info Box */}
              {mtg.status === 'DITUNDA' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-purple-600" /> Keterangan Penundaan Rapat:
                  </div>
                  <div className="text-purple-800"><span className="font-semibold">Alasan:</span> {mtg.postponed_reason || 'Tidak ada alasan'}</div>
                  {mtg.postponed_new_date && (
                    <div className="text-purple-800 font-semibold">
                      Jadwal Baru: {mtg.postponed_new_date} Pukul {mtg.postponed_new_time} WIB
                    </div>
                  )}
                  {mtg.postponed_notes && <div className="text-purple-700 text-[11px]">Catatan: {mtg.postponed_notes}</div>}
                </div>
              )}

              {/* Metadata Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Waktu & Hari</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {mtg.hari}, {mtg.tanggal} ({mtg.waktu_mulai})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Tempat / Ruangan</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {mtg.tempat}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Pimpinan Rapat</span>
                  <span className="font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    {mtg.pimpinan_rapat}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Sekretaris</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {mtg.sekretaris_rapat}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('meet_live_notulen', { meetingId: mtg.id })}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    title="Buka Studio Notulen untuk mencatat hasil musyawarah"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Catat Notulen</span>
                  </button>

                  <button
                    onClick={() => onNavigate('meet_detail', { meetingId: mtg.id })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(mtg)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                    title="Edit Agenda"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(mtg)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all cursor-pointer"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {mtg.status !== 'DITUNDA' && (
                  <button
                    onClick={() => handleOpenPostpone(mtg)}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Tunda Rapat
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: Tambah/Edit Agenda Rapat */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-300" />
                  {editingMeeting ? 'Edit Agenda Rapat' : 'Buat Agenda Rapat Baru'}
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">Isi rincian informasi dan jadwal musyawarah pesantren</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Template Selection */}
              {!editingMeeting && templates.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Gunakan Template Rapat (Opsional)
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="">-- Pilih Template Agenda --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.nama_template} ({t.jenis_rapat})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title & Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Judul Rapat / Musyawarah <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Evaluasi Pembelajaran & Kedisiplinan Bulan Oktober"
                  value={formData.judul_rapat || ''}
                  onChange={(e) => setFormData({ ...formData, judul_rapat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Jenis Rapat</label>
                    <button
                      type="button"
                      onClick={() => setShowAddType(!showAddType)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      + Custom Jenis
                    </button>
                  </div>
                  {showAddType ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nama Jenis Baru"
                        value={newTypeInput}
                        onChange={(e) => setNewTypeInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomType}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                      >
                        Simpan
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.jenis_rapat || 'Rapat Bulanan'}
                      onChange={(e) => setFormData({ ...formData, jenis_rapat: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {meetingTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Status Agenda</label>
                  <select
                    value={formData.status || 'TERJADWAL'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="TERJADWAL">TERJADWAL</option>
                    <option value="BERLANGSUNG">BERLANGSUNG</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="DIBATALKAN">DIBATALKAN</option>
                  </select>
                </div>
              </div>

              {/* Date, Time, Place */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Rapat <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Waktu Mulai</label>
                  <input
                    type="time"
                    value={formData.waktu_mulai || '19:30'}
                    onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Waktu Selesai</label>
                  <input
                    type="time"
                    value={formData.waktu_selesai || '21:30'}
                    onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tempat / Lokasi</label>
                <input
                  type="text"
                  placeholder="Aula Utama PP Nurus Sholah Batulabang Akkor"
                  value={formData.tempat || ''}
                  onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Leaders & Secretary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Pimpinan Rapat</label>
                  <input
                    type="text"
                    placeholder="KH. Muhammad Syamsul Arifin, S.Ag."
                    value={formData.pimpinan_rapat || ''}
                    onChange={(e) => setFormData({ ...formData, pimpinan_rapat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Sekretaris / Notulis</label>
                  <input
                    type="text"
                    placeholder="Ust. Abdullah Sajjad"
                    value={formData.sekretaris_rapat || ''}
                    onChange={(e) => setFormData({ ...formData, sekretaris_rapat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Main Agenda & Objective */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Agenda Utama Pembahasan</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan poin-poin agenda pembahasan..."
                  value={formData.agenda_utama || ''}
                  onChange={(e) => setFormData({ ...formData, agenda_utama: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tujuan Rapat</label>
                <input
                  type="text"
                  placeholder="Tujuan utama diselenggarakannya musyawarah ini..."
                  value={formData.tujuan || ''}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Ringkasan Undangan Peserta</label>
                <input
                  type="text"
                  placeholder="Seluruh Dewan Guru, Wali Kelas & Pengurus Asrama"
                  value={formData.peserta_ringkasan || ''}
                  onChange={(e) => setFormData({ ...formData, peserta_ringkasan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Recurring Switch */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-purple-600" /> Rapat Berulang (Recurring Meeting)
                  </div>
                  <div className="text-[11px] text-purple-700">Tandai agenda ini untuk dapat di-generate otomatis setiap bulan</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_recurring || false}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all"
                >
                  {editingMeeting ? 'Simpan Perubahan' : 'Terbitkan Agenda Rapat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tunda Rapat */}
      {showPostponeModal && postponeMeeting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-purple-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" /> Tunda Rapat: {postponeMeeting.judul_rapat}
              </h3>
              <button onClick={() => setShowPostponeModal(false)} className="text-white hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePostpone} className="p-5 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Alasan Penundaan Rapat <span className="text-rose-500">*</span></label>
                <textarea
                  rows={2}
                  required
                  placeholder="Masukkan alasan penundaan musyawarah..."
                  value={postponeData.reason}
                  onChange={(e) => setPostponeData({ ...postponeData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tanggal Baru</label>
                  <input
                    type="date"
                    required
                    value={postponeData.newDate}
                    onChange={(e) => setPostponeData({ ...postponeData, newDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Waktu Mulai Baru</label>
                  <input
                    type="time"
                    required
                    value={postponeData.newTime}
                    onChange={(e) => setPostponeData({ ...postponeData, newTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan penundaan untuk seluruh peserta..."
                  value={postponeData.notes}
                  onChange={(e) => setPostponeData({ ...postponeData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPostponeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow"
                >
                  Simpan Status Ditunda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
