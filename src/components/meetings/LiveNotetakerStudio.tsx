import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Printer,
  Save,
  FileCheck2,
  Sparkles,
  CheckSquare,
  UserCheck,
  Edit3,
  ArrowLeft,
  X,
  Building2,
  UserX,
  Play,
  Check,
  Send,
  Sliders,
  ChevronRight,
  MessageSquare,
  Award
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { useToast } from '../common/Toast';
import {
  PondokMeeting,
  MeetingParticipant,
  MeetingAgenda,
  MeetingMinute,
  MeetingDecision,
  MeetingFollowup,
  MeetingResult
} from '../../types/database';

interface LiveNotetakerStudioProps {
  meeting?: PondokMeeting;
  meetingId?: string;
  onClose?: () => void;
  onNavigate?: (view: string, param?: any) => void;
  onRefreshData?: () => void;
}

export const LiveNotetakerStudio: React.FC<LiveNotetakerStudioProps> = ({
  meeting: initialMeeting,
  meetingId,
  onClose,
  onNavigate,
  onRefreshData
}) => {
  const { showToast } = useToast();
  const settings = dbService.getSettings();
  const currentUser = authService.getCurrentUser();

  const allMeetings = useMemo(() => dbService.getPondokMeetings(), []);

  // Determine initial active meeting
  const resolvedMeeting = useMemo(() => {
    if (initialMeeting) return initialMeeting;
    if (meetingId) {
      const found = dbService.getPondokMeetingById(meetingId);
      if (found) return found;
    }
    // Fallback to latest scheduled or running meeting, or first meeting
    const ongoing = allMeetings.find(m => m.status === 'BERLANGSUNG');
    if (ongoing) return ongoing;
    const scheduled = allMeetings.find(m => m.status === 'TERJADWAL');
    if (scheduled) return scheduled;
    return allMeetings[0] || {
      id: 'mtg-default',
      nomor_rapat: 'RPT/2026/02/001',
      judul_rapat: 'Rapat Evaluasi & Musyawarah Pesantren',
      jenis_rapat: 'Rapat Bulanan',
      tanggal: new Date().toISOString().split('T')[0],
      hari: 'Kamis',
      waktu_mulai: '19:30',
      waktu_selesai: '21:30',
      tempat: 'Aula Utama PP Nurus Sholah',
      pimpinan_rapat: 'KH. Muhammad Syamsul Arifin, S.Ag.',
      sekretaris_rapat: 'Ust. Abdullah Sajjad',
      agenda_utama: 'Musyawarah Evaluasi Bulanan & Ketertiban',
      status: 'TERJADWAL'
    };
  }, [initialMeeting, meetingId, allMeetings]);

  const [meeting, setMeeting] = useState<PondokMeeting>(resolvedMeeting);
  const [participants, setParticipants] = useState<MeetingParticipant[]>(() =>
    dbService.getMeetingParticipants(meeting.id)
  );
  const [agendas, setAgendas] = useState<MeetingAgenda[]>(() =>
    dbService.getMeetingAgendas(meeting.id)
  );
  const [decisions, setDecisions] = useState<MeetingDecision[]>(() =>
    dbService.getMeetingDecisions(meeting.id)
  );
  const [followups, setFollowups] = useState<MeetingFollowup[]>(() =>
    dbService.getMeetingFollowups(meeting.id)
  );

  const existingMinutes = useMemo(() => dbService.getMeetingMinutes(meeting.id), [meeting.id]);
  const minute = existingMinutes.length > 0 ? existingMinutes[0] : undefined;

  // Function to switch meeting
  const handleSelectMeeting = (newMeetingId: string) => {
    const target = allMeetings.find(m => m.id === newMeetingId);
    if (!target) return;
    setMeeting(target);
    setParticipants(dbService.getMeetingParticipants(target.id));
    setAgendas(dbService.getMeetingAgendas(target.id));
    setDecisions(dbService.getMeetingDecisions(target.id));
    setFollowups(dbService.getMeetingFollowups(target.id));
    const targetMinutes = dbService.getMeetingMinutes(target.id);
    const tm = targetMinutes[0];
    setIsLocked(target.locked_notulen || tm?.locked || false);
    setSekretarisName(target.sekretaris_rapat || currentUser?.nama_lengkap || 'Sekretaris Rapat');
    setMinuteFields({
      pembukaan:
        tm?.pembukaan ||
        `Rapat dibuka secara resmi oleh Pimpinan Rapat (${target.pimpinan_rapat || 'Pimpinan Pesantren'}) pada pukul ${target.waktu_mulai || '19:30'} WIB dengan membaca Ummul Qur'an Surat Al-Fatihah. Dilanjutkan dengan pembacaan agenda dan arahan umum musyawarah.`,
      pembahasan_lengkap:
        tm?.pembahasan_lengkap ||
        `1. Pembahasan Agenda Utama: ${target.agenda_utama || 'Musyawarah Evaluasi Berkala'}\n2. Masukan dan pembahasan dari para peserta musyawarah.\n3. Dinamika diskusi dan penyusunan kesepakatan mufakat.`,
      penutup:
        tm?.penutup ||
        `Setelah seluruh agenda dibahas dan keputusan disepakati bersama, musyawarah ditutup dengan do'a kaffaratul majlis yang dipimpin oleh ${target.pimpinan_rapat || 'Pimpinan Pesantren'}. Rapat berakhir dengan tertib dan lancar.`
    });
    showToast('Beralih Rapat', `Sekarang mencatat notulen untuk: ${target.judul_rapat}`, 'info');
  };

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Notulen Form State
  const [isLocked, setIsLocked] = useState<boolean>(meeting.locked_notulen || minute?.locked || false);
  const [sekretarisName, setSekretarisName] = useState<string>(
    meeting.sekretaris_rapat || currentUser?.nama_lengkap || 'Sekretaris Rapat'
  );

  const [minuteFields, setMinuteFields] = useState({
    pembukaan:
      minute?.pembukaan ||
      `Rapat dibuka secara resmi oleh Pimpinan Rapat (${meeting.pimpinan_rapat || 'Pimpinan Pesantren'}) pada pukul ${meeting.waktu_mulai || '19:30'} WIB dengan membaca Ummul Qur'an Surat Al-Fatihah. Dilanjutkan dengan pembacaan agenda dan arahan umum musyawarah.`,
    pembahasan_lengkap:
      minute?.pembahasan_lengkap ||
      `1. Pembahasan Agenda Utama: ${meeting.agenda_utama || 'Musyawarah Evaluasi Berkala'}\n2. Masukan dan pembahasan dari para peserta musyawarah.\n3. Dinamika diskusi dan penyusunan kesepakatan mufakat.`,
    penutup:
      minute?.penutup ||
      `Setelah seluruh agenda dibahas dan keputusan disepakati bersama, musyawarah ditutup dengan do'a kaffaratul majlis yang dipimpin oleh ${meeting.pimpinan_rapat || 'Pimpinan Pesantren'}. Rapat berakhir dengan tertib dan lancar.`
  });

  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan di basis data');

  // Live Speech / Discussion Point Logging
  interface SpeechPoint {
    id: string;
    waktu: string;
    pembicara: string;
    topik: string;
    isi: string;
  }
  const [speechLogs, setSpeechLogs] = useState<SpeechPoint[]>([
    {
      id: 'sp-1',
      waktu: '19:35',
      pembicara: meeting.pimpinan_rapat || 'Pimpinan Pesantren',
      topik: 'Pengantar Musyawarah',
      isi: 'Membuka musyawarah dan menekankan pentingnya kedisiplinan serta evaluasi menyeluruh program pondok.'
    }
  ]);
  const [newSpeech, setNewSpeech] = useState({
    pembicara: participants[0]?.nama || meeting.pimpinan_rapat || 'Ust. Ahmad Baihaqi',
    topik: agendas[0]?.judul || 'Agenda Rapat',
    isi: ''
  });

  // Quick Decision State
  const [newDecision, setNewDecision] = useState({
    isi_keputusan: '',
    kategori: 'Umum',
    penanggung_jawab: participants[0]?.nama || 'Sekretariat Rapat',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prioritas: 'Sangat Penting' as const
  });

  // Quick Followup State
  const [newFollowup, setNewFollowup] = useState({
    judul: '',
    pic: participants[0]?.nama || 'Pengurus Pesantren',
    unit_bagian: 'Biro Operasional',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prioritas: 'Sangat Penting' as const
  });

  // Modal Print State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Quick Attendance Calculations
  const attendanceStats = useMemo(() => {
    const total = participants.length;
    const hadir = participants.filter(p => p.kehadiran === 'Hadir').length;
    const izin = participants.filter(p => p.kehadiran === 'Izin').length;
    const sakit = participants.filter(p => p.kehadiran === 'Sakit').length;
    const alpa = participants.filter(p => p.kehadiran === 'Alpa').length;
    const percent = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, izin, sakit, alpa, percent };
  }, [participants]);

  // Handler: Change Meeting Status (BERLANGSUNG / SELESAI)
  const handleUpdateMeetingStatus = (newStatus: PondokMeeting['status']) => {
    const updated = dbService.savePondokMeeting({
      ...meeting,
      status: newStatus,
      sekretaris_rapat: sekretarisName
    });
    setMeeting(updated);
    showToast('Status Rapat Diperbarui', `Status musyawarah sekarang: ${newStatus}`, 'success');
    if (onRefreshData) onRefreshData();
  };

  // Handler: Save Notulen Minute
  const handleSaveNotulen = (lock = false) => {
    const saved = dbService.saveMeetingMinute({
      id: minute?.id,
      meeting_id: meeting.id,
      pembukaan: minuteFields.pembukaan,
      pembahasan_lengkap: minuteFields.pembahasan_lengkap,
      penutup: minuteFields.penutup,
      locked: lock || isLocked
    });

    // Also update sekretaris name on meeting
    dbService.savePondokMeeting({
      id: meeting.id,
      sekretaris_rapat: sekretarisName,
      locked_notulen: lock || isLocked
    });

    if (lock) {
      setIsLocked(true);
      showToast('Notulen Dikunci', 'Notulen resmi telah disimpan dan dikunci untuk menjaga integritas data.', 'success');
    } else {
      showToast('Notulen Disimpan', 'Seluruh catatan jalannya rapat tersimpan di database.', 'success');
    }

    setLastSavedTime(`Tersimpan pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`);
    if (onRefreshData) onRefreshData();
  };

  // Handler: Add Speech Point
  const handleAddSpeechPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSpeech.isi.trim()) {
      showToast('Isi Kosong', 'Ketikkan poin masukan / pembahasan terlebih dahulu.', 'warning');
      return;
    }

    const newPoint: SpeechPoint = {
      id: `sp-${Date.now()}`,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      pembicara: newSpeech.pembicara,
      topik: newSpeech.topik,
      isi: newSpeech.isi.trim()
    };

    setSpeechLogs(prev => [newPoint, ...prev]);

    // Append into pembahasan_lengkap automatically
    const appendText = `\n[${newPoint.waktu} WIB] ${newPoint.pembicara} (${newPoint.topik}): "${newPoint.isi}"`;
    setMinuteFields(prev => ({
      ...prev,
      pembahasan_lengkap: prev.pembahasan_lengkap + appendText
    }));

    setNewSpeech(prev => ({ ...prev, isi: '' }));
    showToast('Poin Bicara Dicatat', `Masukan dari ${newPoint.pembicara} berhasil direkam ke notulen.`, 'info');
  };

  // Handler: Quick Decision Add
  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.isi_keputusan.trim()) {
      showToast('Isi Kosong', 'Tuliskan butir keputusan rapat terlebih dahulu.', 'warning');
      return;
    }

    const saved = dbService.saveMeetingDecision({
      meeting_id: meeting.id,
      isi_keputusan: newDecision.isi_keputusan.trim(),
      kategori: newDecision.kategori,
      penanggung_jawab: newDecision.penanggung_jawab,
      deadline: newDecision.deadline,
      prioritas: newDecision.prioritas,
      status: 'Belum Dilaksanakan'
    });

    setDecisions(prev => [saved, ...prev]);

    // Append into discussion notes
    const decText = `\n\n📌 KEPUTUSAN RESMI (${saved.nomor_keputusan}):\n- Isi: ${saved.isi_keputusan}\n- PIC: ${saved.penanggung_jawab} | Target: ${saved.deadline}`;
    setMinuteFields(prev => ({
      ...prev,
      pembahasan_lengkap: prev.pembahasan_lengkap + decText
    }));

    setNewDecision({
      isi_keputusan: '',
      kategori: 'Umum',
      penanggung_jawab: participants[0]?.nama || 'Sekretariat Rapat',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prioritas: 'Sangat Penting'
    });

    showToast('Keputusan Disahkan', `Keputusan ${saved.nomor_keputusan} berhasil disimpan.`, 'success');
    if (onRefreshData) onRefreshData();
  };

  // Handler: Quick Followup Add
  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowup.judul.trim()) return;

    const saved = dbService.saveMeetingFollowup({
      meeting_id: meeting.id,
      judul: newFollowup.judul.trim(),
      sumber_rapat: meeting.judul_rapat,
      keputusan: decisions[0]?.isi_keputusan || 'Tindak Lanjut Rapat',
      pic: newFollowup.pic,
      unit_bagian: newFollowup.unit_bagian,
      deadline: newFollowup.deadline,
      prioritas: newFollowup.prioritas,
      status: 'Belum Dimulai',
      progress_percent: 0
    });

    setFollowups(prev => [saved, ...prev]);
    setNewFollowup({
      judul: '',
      pic: participants[0]?.nama || 'Pengurus Pesantren',
      unit_bagian: 'Biro Operasional',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prioritas: 'Sangat Penting'
    });

    showToast('Tindak Lanjut Dicatat', `Tugas [${saved.judul}] ditugaskan ke ${saved.pic}.`, 'success');
    if (onRefreshData) onRefreshData();
  };

  // Handler: Update Participant Attendance
  const handleToggleAttendance = (participantId: string, status: MeetingParticipant['kehadiran']) => {
    const p = participants.find(part => part.id === participantId);
    if (!p) return;

    const updated = dbService.saveMeetingParticipant({
      ...p,
      kehadiran: status
    });

    setParticipants(prev => prev.map(item => (item.id === participantId ? updated : item)));
  };

  const handleMarkAllPresent = () => {
    const updated = participants.map(p => {
      return dbService.saveMeetingParticipant({ ...p, kehadiran: 'Hadir' });
    });
    setParticipants(updated);
    showToast('Presensi Diperbarui', 'Seluruh peserta rapat ditandai Hadir.', 'info');
  };

  // Auto-generate Summary
  const handleAutoGenerateSummary = () => {
    let summaryText = `RINGKASAN HASIL MUSYAWARAH: ${meeting.judul_rapat.toUpperCase()}\n`;
    summaryText += `Nomor: ${meeting.nomor_rapat} | Tanggal: ${meeting.tanggal} (${meeting.hari})\n`;
    summaryText += `Waktu: ${meeting.waktu_mulai} - ${meeting.waktu_selesai} WIB | Tempat: ${meeting.tempat}\n\n`;
    summaryText += `I. PESERTA & TINGKAT KEHADIRAN:\n`;
    summaryText += `Total Undangan: ${attendanceStats.total} Orang | Hadir: ${attendanceStats.hadir} (${attendanceStats.percent}%)\n\n`;
    summaryText += `II. KEPUTUSAN RESMI YANG DISEPAKATI (${decisions.length} Butir):\n`;
    decisions.forEach((d, idx) => {
      summaryText += `${idx + 1}. [${d.nomor_keputusan}] ${d.isi_keputusan} (PIC: ${d.penanggung_jawab}, Deadline: ${d.deadline})\n`;
    });
    summaryText += `\nIII. TINDAK LANJUT PELAKSANAAN:\n`;
    followups.forEach((f, idx) => {
      summaryText += `${idx + 1}. ${f.judul} - Penanggung Jawab: ${f.pic} (${f.unit_bagian})\n`;
    });

    setMinuteFields(prev => ({
      ...prev,
      pembahasan_lengkap: prev.pembahasan_lengkap + '\n\n' + summaryText
    }));

    showToast('Ringkasan Disusun', 'Ringkasan resmi otomatis digabungkan ke naskah notulensi.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROL BAR: LIVE NOTETAKER STUDIO */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4">
        {/* Meeting Switcher & Quick Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {(onClose || onNavigate) && (
              <button
                onClick={() => {
                  if (onClose) onClose();
                  else if (onNavigate) onNavigate('meet_agenda_list');
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/15">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Pilih Musyawarah:
              </span>
              <select
                value={meeting.id}
                onChange={(e) => handleSelectMeeting(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-2.5 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-[280px] sm:max-w-md truncate"
              >
                {allMeetings.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.nomor_rapat || m.status}] {m.judul_rapat} ({m.tanggal})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              Studio Pencatatan Hasil Langsung (Live Notulensi)
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {meeting.nomor_rapat}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  meeting.status === 'BERLANGSUNG'
                    ? 'bg-amber-500 text-white animate-pulse'
                    : meeting.status === 'SELESAI'
                    ? 'bg-blue-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}>
                  ● {meeting.status}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  🕒 {currentTime} WIB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {meeting.judul_rapat}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{meeting.hari}, {meeting.tanggal}</span> &bull; 
                <span>{meeting.waktu_mulai} - {meeting.waktu_selesai} WIB</span> &bull; 
                <span>{meeting.tempat}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2">
            {meeting.status !== 'BERLANGSUNG' && meeting.status !== 'SELESAI' && (
              <button
                onClick={() => handleUpdateMeetingStatus('BERLANGSUNG')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Mulai Rapat
              </button>
            )}

            {meeting.status === 'BERLANGSUNG' && (
              <button
                onClick={() => handleUpdateMeetingStatus('SELESAI')}
                className="px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Selesaikan Rapat
              </button>
            )}

            <button
              onClick={() => handleSaveNotulen(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Catatan
            </button>

            <button
              onClick={() => handleSaveNotulen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> {isLocked ? 'Notulen Terkunci' : 'Kunci Notulen'}
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Berita Acara
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl transition"
                title="Tutup Mode Studio"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Secretary & Auto-save Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs pt-3 border-t border-white/10 gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Notulis / Sekretaris:</span>
            <input
              type="text"
              value={sekretarisName}
              onChange={(e) => setSekretarisName(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-white font-semibold text-xs focus:ring-1 focus:ring-emerald-400 outline-none w-56"
              placeholder="Nama Notulis..."
            />
            <span className="text-slate-400">&bull; Pimpinan: <strong className="text-white">{meeting.pimpinan_rapat}</strong></span>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lastSavedTime}</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE DISCUSSION & ATTENDANCE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: PRESENSI CEPAT PESERTA */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Presensi Kehadiran Pesantren ({attendanceStats.hadir}/{attendanceStats.total} Hadir &bull; {attendanceStats.percent}%)
                </h3>
                <p className="text-[11px] text-slate-500">Klik status kehadiran untuk memperbarui daftar hadir secara instan</p>
              </div>

              <button
                onClick={handleMarkAllPresent}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] rounded-lg transition"
              >
                Semua Hadir
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
              {participants.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50 text-xs hover:border-slate-200 transition"
                >
                  <div className="truncate mr-2">
                    <div className="font-bold text-slate-800 truncate">{p.nama}</div>
                    <div className="text-[10px] text-slate-500 truncate">{p.jabatan}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => handleToggleAttendance(p.id, st)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                          p.kehadiran === st
                            ? st === 'Hadir'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : st === 'Izin'
                              ? 'bg-blue-600 text-white'
                              : st === 'Sakit'
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: LIVE DISCUSSION LOG & RECORD SPEECH */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Catat Masukan & Poin Bicara Peserta Real-Time
                </h3>
                <p className="text-[11px] text-slate-500">Rekam pendapat, sanggahan, atau usulan peserta rapat saat sedang berbicara</p>
              </div>

              <button
                type="button"
                onClick={handleAutoGenerateSummary}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rangkum Otomatis</span>
              </button>
            </div>

            {/* Quick Speech Input Form */}
            <form onSubmit={handleAddSpeechPoint} className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pembicara / Nama Peserta:</label>
                  <input
                    type="text"
                    list="participants-list"
                    value={newSpeech.pembicara}
                    onChange={(e) => setNewSpeech({ ...newSpeech, pembicara: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Pilih atau ketik nama pembicara..."
                  />
                  <datalist id="participants-list">
                    {participants.map(p => (
                      <option key={p.id} value={p.nama} />
                    ))}
                    <option value={meeting.pimpinan_rapat} />
                    <option value={meeting.sekretaris_rapat} />
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Agenda / Topik Pembahasan:</label>
                  <select
                    value={newSpeech.topik}
                    onChange={(e) => setNewSpeech({ ...newSpeech, topik: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {agendas.map(a => (
                      <option key={a.id} value={a.judul}>{a.judul}</option>
                    ))}
                    <option value="Umum & Pembukaan">Umum & Pembukaan</option>
                    <option value="Tanya Jawab / Usulan">Tanya Jawab / Usulan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Isi Masukan / Pendapat / Sanggahan:</label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={newSpeech.isi}
                    onChange={(e) => setNewSpeech({ ...newSpeech, isi: e.target.value })}
                    placeholder="Contoh: Mengusulkan agar jadwal sorogan kitab ditambah 30 menit setiap bakda shalat ashar..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Catat</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Timeline of Recorded Speeches */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Alur Diskusi & Poin Masukan Tercatat ({speechLogs.length})
              </div>
              {speechLogs.map(sp => (
                <div key={sp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                        {sp.waktu} WIB
                      </span>
                      <strong className="text-slate-900">{sp.pembicara}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {sp.topik}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic">"{sp.isi}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: COMPREHENSIVE MINUTES TEXTAREA */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Naskah Notulensi Rapat Lengkap (Tersimpan ke Sistem)</span>
              <span className="text-[10px] text-slate-400 font-normal">Sinkronisasi otomatis ke Berita Acara</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pembukaan Musyawarah:</label>
                <textarea
                  rows={2}
                  value={minuteFields.pembukaan}
                  onChange={(e) => setMinuteFields({ ...minuteFields, pembukaan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pembahasan & Jalannya Rapat:</label>
                <textarea
                  rows={6}
                  value={minuteFields.pembahasan_lengkap}
                  onChange={(e) => setMinuteFields({ ...minuteFields, pembahasan_lengkap: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Penutup Musyawarah & Do'a:</label>
                <textarea
                  rows={2}
                  value={minuteFields.penutup}
                  onChange={(e) => setMinuteFields({ ...minuteFields, penutup: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: KEPUTUSAN & TINDAK LANJUT LANGSUNG (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SECTION 4: INSTANT DECISION RECORDER */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-purple-600" />
                  Rekam Keputusan Rapat Langsung
                </h3>
                <p className="text-[11px] text-slate-500">Kunci butir keputusan resmi saat pimpinan menyepakati</p>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200">
                {decisions.length} Keputusan
              </span>
            </div>

            {/* Quick Add Decision Form */}
            <form onSubmit={handleAddDecision} className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-purple-950 mb-1">Isi Butir Keputusan Resmi *</label>
                <textarea
                  rows={2}
                  required
                  value={newDecision.isi_keputusan}
                  onChange={(e) => setNewDecision({ ...newDecision, isi_keputusan: e.target.value })}
                  placeholder="Contoh: Menetapkan pengetatan jam keluar asrama santri maksimal pukul 17.30 WIB..."
                  className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-purple-950 mb-0.5">Penanggung Jawab (PIC):</label>
                  <input
                    type="text"
                    value={newDecision.penanggung_jawab}
                    onChange={(e) => setNewDecision({ ...newDecision, penanggung_jawab: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-purple-950 mb-0.5">Batas Waktu (Deadline):</label>
                  <input
                    type="date"
                    value={newDecision.deadline}
                    onChange={(e) => setNewDecision({ ...newDecision, deadline: e.target.value })}
                    className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-1 text-slate-800 font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>+ Sahkan Keputusan Ini</span>
              </button>
            </form>

            {/* List of Recorded Decisions */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {decisions.map((d, idx) => (
                <div key={d.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 hover:border-purple-300 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-800 text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      #{idx + 1} &bull; {d.nomor_keputusan}
                    </span>
                    <span className="text-[10px] text-slate-500">Target: {d.deadline}</span>
                  </div>
                  <div className="font-bold text-slate-800">{d.isi_keputusan}</div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>PIC: <strong>{d.penanggung_jawab}</strong></span>
                    <span className="text-emerald-700 font-bold">{d.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: INSTANT FOLLOWUP & ACTION ITEMS */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  Tugas & Tindak Lanjut Rapat
                </h3>
                <p className="text-[11px] text-slate-500">Pekerjaan konkret yang harus segera dieksekusi</p>
              </div>
              <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
                {followups.length} Tugas
              </span>
            </div>

            {/* Quick Add Followup Form */}
            <form onSubmit={handleAddFollowup} className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/80 space-y-2 text-xs">
              <div>
                <label className="block font-bold text-teal-950 mb-1">Rincian Tugas / Tindak Lanjut *</label>
                <input
                  type="text"
                  required
                  value={newFollowup.judul}
                  onChange={(e) => setNewFollowup({ ...newFollowup, judul: e.target.value })}
                  placeholder="Contoh: Mengadakan apel kedisiplinan dan sidak kamar santri..."
                  className="w-full bg-white border border-teal-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-teal-950 mb-0.5">PIC Pelaksana:</label>
                  <input
                    type="text"
                    value={newFollowup.pic}
                    onChange={(e) => setNewFollowup({ ...newFollowup, pic: e.target.value })}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1 text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-teal-950 mb-0.5">Deadline:</label>
                  <input
                    type="date"
                    value={newFollowup.deadline}
                    onChange={(e) => setNewFollowup({ ...newFollowup, deadline: e.target.value })}
                    className="w-full bg-white border border-teal-200 rounded-xl px-2.5 py-1 text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tugaskan Tindak Lanjut Ini</span>
              </button>
            </form>

            {/* List of Followups */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {followups.map(f => (
                <div key={f.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">{f.judul}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>PIC: {f.pic} ({f.unit_bagian})</span>
                    <span className="font-semibold text-teal-700">{f.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRINT OFFICIAL MINUTES / BERITA ACARA MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">
                Pratinjau Berita Acara & Notulensi Resmi Rapat
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE NOTULEN PAPER */}
            <div className="space-y-6 text-slate-800 text-xs">
              {/* KOP RESMI */}
              <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1">
                <h2 className="text-xl font-black uppercase text-emerald-950">
                  {settings.nama_pesantren || 'PONDOK PESANTREN NURUS SHOLAH'}
                </h2>
                <h3 className="text-xs font-bold text-slate-700 uppercase">
                  BERITA ACARA & NOTULENSI RESMI MUSYAWARAH
                </h3>
                <p className="text-[11px] text-slate-600">
                  Batulabang Akkor, Kec. {settings.kecamatan || 'Palengaan'}, Kab. {settings.kabupaten || 'Pamekasan'} &bull; Telp: {settings.telepon || '(0324) 321890'}
                </p>
              </div>

              {/* IDENTITAS RAPAT */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium">
                <div><span>Nama Rapat:</span> <strong>{meeting.judul_rapat}</strong></div>
                <div><span>Nomor Berita Acara:</span> <strong className="font-mono">{meeting.nomor_rapat}</strong></div>
                <div><span>Hari / Tanggal:</span> <strong>{meeting.hari}, {meeting.tanggal}</strong></div>
                <div><span>Waktu:</span> <strong>{meeting.waktu_mulai} - {meeting.waktu_selesai} WIB</strong></div>
                <div><span>Tempat:</span> <strong>{meeting.tempat}</strong></div>
                <div><span>Jenis Rapat:</span> <strong>{meeting.jenis_rapat}</strong></div>
                <div><span>Pimpinan Rapat:</span> <strong>{meeting.pimpinan_rapat}</strong></div>
                <div><span>Notulis / Sekretaris:</span> <strong>{sekretarisName}</strong></div>
              </div>

              {/* JALANNYA MUSYAWARAH */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 text-slate-900">
                  I. Pembukaan & Pengantar Musyawarah
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{minuteFields.pembukaan}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 text-slate-900">
                  II. Pembahasan & Dinamika Musyawarah
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                  {minuteFields.pembahasan_lengkap}
                </p>
              </div>

              {/* DAFTAR KEPUTUSAN */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 text-slate-900">
                  III. Keputusan Resmi yang Ditetapkan ({decisions.length} Butir)
                </h4>
                <div className="space-y-1.5">
                  {decisions.map((d, idx) => (
                    <div key={d.id} className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                      <strong>{idx + 1}. [{d.nomor_keputusan}]</strong> {d.isi_keputusan}
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Penanggung Jawab: {d.penanggung_jawab} &bull; Batas Waktu: {d.deadline}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PENUTUP */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-1 text-slate-900">
                  IV. Penutup Musyawarah
                </h4>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{minuteFields.penutup}</p>
              </div>

              {/* TANDA TANGAN */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs">
                <div className="space-y-14">
                  <div>
                    <p className="text-slate-500">Mengesahkan,</p>
                    <p className="font-bold text-slate-800">Pimpinan Musyawarah</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 underline">{meeting.pimpinan_rapat}</p>
                    <p className="text-[11px] text-slate-500">Pimpinan Sidang</p>
                  </div>
                </div>

                <div className="space-y-14">
                  <div>
                    <p className="text-slate-500">
                      Batulabang, {meeting.tanggal}
                    </p>
                    <p className="font-bold text-slate-800">Notulis / Sekretaris Rapat</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 underline">{sekretarisName}</p>
                    <p className="text-[11px] text-slate-500">Sekretariat Musyawarah</p>
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
