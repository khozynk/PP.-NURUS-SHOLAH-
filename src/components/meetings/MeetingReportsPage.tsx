import React, { useState } from 'react';
import { 
  FileBarChart, 
  Calendar, 
  Printer, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Clock, 
  Building2, 
  Users, 
  Save, 
  ArrowRight,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { dbService } from '../../services/db';
import { MeetingMonthlyEvaluation, MeetingMonthlyPlan } from '../../types/database';

interface MeetingReportsPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingReportsPage: React.FC<MeetingReportsPageProps> = ({ onNavigate }) => {
  const meetings = dbService.getPondokMeetings();
  const decisions = dbService.getMeetingDecisions();
  const followups = dbService.getMeetingFollowups();
  const reports = dbService.getMeetingReports();
  const evaluations = dbService.getMeetingMonthlyEvaluations();
  const plans = dbService.getMeetingMonthlyPlans();

  const [selectedMonth, setSelectedMonth] = useState('Oktober');
  const [selectedYear, setSelectedYear] = useState(2026);

  // Form State for Monthly Evaluation & Plan
  const [showAddEvalModal, setShowAddEvalModal] = useState(false);
  const [newEvalData, setNewEvalData] = useState<Partial<MeetingMonthlyEvaluation>>({
    bulan: selectedMonth,
    tahun: selectedYear,
    kategori: 'Pendidikan',
    pencapaian: '',
    masalah: '',
    kendala: '',
    solusi: '',
    rekomendasi: '',
    target_bulan_berikutnya: ''
  });

  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [newPlanData, setNewPlanData] = useState<Partial<MeetingMonthlyPlan>>({
    bulan: 'November',
    tahun: selectedYear,
    rencana: '',
    pic: 'Ust. Abdullah Sajjad',
    target_tanggal: '2026-11-15',
    prioritas: 'Sangat Penting',
    indikator_keberhasilan: '',
    status: 'Rencana'
  });

  // Calculate Actual Metrics for Selected Month
  const monthMeetings = meetings.filter(m => m.bulan === selectedMonth && (m.tahun === selectedYear || new Date(m.tanggal).getFullYear() === selectedYear));
  const totalMeetingsCount = monthMeetings.length;
  const meetingsDone = monthMeetings.filter(m => m.status === 'SELESAI').length;
  const meetingsPostponed = monthMeetings.filter(m => m.status === 'DITUNDA').length;
  const meetingsCancelled = monthMeetings.filter(m => m.status === 'DIBATALKAN').length;

  const meetingIdsInMonth = monthMeetings.map(m => m.id);
  const monthDecisions = decisions.filter(d => meetingIdsInMonth.includes(d.meeting_id));
  const monthDecisionsCompleted = monthDecisions.filter(d => d.status === 'Selesai').length;
  const monthDecisionsInProgress = monthDecisions.filter(d => d.status === 'Berjalan').length;
  const monthDecisionsOverdue = monthDecisions.filter(d => d.status === 'Terlambat').length;

  const monthFollowups = followups.filter(f => meetingIdsInMonth.includes(f.meeting_id));
  const followupsCompleted = monthFollowups.filter(f => f.progress_percent === 100 || f.status === 'Selesai').length;
  const followupsUnfinished = monthFollowups.filter(f => f.progress_percent < 100 && f.status !== 'Selesai').length;

  // Unresolved problems
  const unresolvedIssues = monthFollowups.filter(f => f.progress_percent < 100 || f.status === 'Terlambat');

  const handleSaveEval = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveMeetingMonthlyEvaluation({
      ...newEvalData,
      bulan: selectedMonth,
      tahun: selectedYear
    });
    setShowAddEvalModal(false);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPlan = dbService.saveMeetingMonthlyPlan({
      ...newPlanData,
      tahun: selectedYear
    });

    // Auto convert into next month's agenda if requested
    if (confirm('Apakah Anda ingin otomatis mengkonversi rencana ini menjadi agenda rapat bulan berikutnya?')) {
      dbService.savePondokMeeting({
        judul_rapat: `Rapat Evaluasi & Pelaksanaan: ${savedPlan.rencana}`,
        jenis_rapat: 'Rapat Evaluasi',
        tanggal: savedPlan.target_tanggal,
        waktu_mulai: '19:30',
        waktu_selesai: '21:00',
        tempat: 'Aula Utama PP Nurus Sholah',
        pimpinan_rapat: 'Pimpinan Pesantren',
        sekretaris_rapat: 'Sekretaris Rapat',
        agenda_utama: `Pembahasan Rencana: ${savedPlan.rencana}\nIndikator: ${savedPlan.indikator_keberhasilan}`,
        tujuan: `Merealisasikan target ${savedPlan.rencana}`,
        status: 'TERJADWAL'
      });
      alert('Rencana berhasil dikonversi menjadi Agenda Rapat Bulan Berikutnya!');
    }

    setShowAddPlanModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <FileBarChart className="w-4 h-4 text-emerald-600" /> Laporan & Rekapitulasi Rapat Bulanan
          </div>
          <h1 className="text-xl font-bold text-slate-900">Laporan Rapat Bulanan Pesantren</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kompilasi otomatis rapat terlaksana, keputusan, evaluasi bulanan & target periode berikutnya</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan PDF
          </button>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Rapat</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalMeetingsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-800 block">Rapat Terlaksana</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{meetingsDone}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm">
          <span className="text-[11px] font-semibold text-purple-800 block">Rapat Ditunda</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{meetingsPostponed}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-800 block">Total Keputusan</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{monthDecisions.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/30 shadow-sm">
          <span className="text-[11px] font-semibold text-teal-800 block">Tindak Lanjut Tuntas</span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">{followupsCompleted}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-800 block">Belum Selesai</span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{followupsUnfinished}</div>
        </div>
      </div>

      {/* SECTION 1: RAPAT YANG DILAKSANAKAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
          <Calendar className="w-4 h-4 text-emerald-600" /> 1. Rapat yang Dilaksanakan Periode {selectedMonth} {selectedYear}
        </h2>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 border-b">Tanggal</th>
                <th className="p-3 border-b">Nama Rapat</th>
                <th className="p-3 border-b">Pimpinan</th>
                <th className="p-3 border-b">Agenda Utama</th>
                <th className="p-3 border-b">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthMeetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">Tidak ada rapat terdaftar di bulan ini.</td>
                </tr>
              ) : (
                monthMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{m.tanggal}</td>
                    <td className="p-3 font-bold text-slate-900">{m.judul_rapat}</td>
                    <td className="p-3 text-slate-700">{m.pimpinan_rapat}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{m.agenda_utama || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: KEPUTUSAN & TINDAK LANJUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckSquare className="w-4 h-4 text-purple-600" /> 2. Keputusan Rapat
          </h2>

          <div className="space-y-2 text-xs">
            {monthDecisions.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Belum ada keputusan di bulan ini.</p>
            ) : (
              monthDecisions.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-900">{d.nomor_keputusan}</span>
                    <span className="font-bold text-slate-700">PIC: {d.penanggung_jawab}</span>
                  </div>
                  <div className="font-semibold text-slate-800">{d.isi_keputusan}</div>
                  <div className="text-[11px] text-slate-500">Deadline: {d.deadline} • Status: {d.status}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> 3. Masalah & Kendala Belum Selesai
          </h2>

          <div className="space-y-2 text-xs">
            {unresolvedIssues.length === 0 ? (
              <p className="text-emerald-700 font-semibold text-center py-4">Alhamdulillah! Tidak ada masalah atau tugas yang menunggak.</p>
            ) : (
              unresolvedIssues.map(i => (
                <div key={i.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{i.judul}</span>
                    <span className="font-mono font-bold text-rose-700">{i.progress_percent}%</span>
                  </div>
                  <div className="text-[11px]">{i.kendala || 'Masih dalam proses pengerjaan unit.'}</div>
                  <div className="text-[11px] font-semibold">PIC: {i.pic} ({i.unit_bagian}) • Deadline: {i.deadline}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: EVALUASI BULANAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> 4. Catatan Evaluasi Bulanan
          </h2>
          <button
            onClick={() => setShowAddEvalModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow"
          >
            + Tambah Evaluasi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {evaluations.length === 0 ? (
            <p className="text-slate-400 col-span-2 text-center py-4">Belum ada catatan evaluasi bulanan.</p>
          ) : (
            evaluations.map(ev => (
              <div key={ev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 uppercase">{ev.kategori}</span>
                  <span className="text-[11px] text-slate-500">{ev.bulan} {ev.tahun}</span>
                </div>
                <div><strong className="text-slate-700">Pencapaian:</strong> {ev.pencapaian}</div>
                <div><strong className="text-slate-700">Kendala:</strong> {ev.kendala}</div>
                <div><strong className="text-slate-700">Solusi & Rekomendasi:</strong> {ev.solusi}</div>
                <div className="text-emerald-800 font-semibold pt-1 border-t border-slate-200">
                  Target Bulan Berikutnya: {ev.target_bulan_berikutnya}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECTION 4: TARGET & RENCANA BULAN BERIKUTNYA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> 5. Rencana & Tugas Bulan Berikutnya
          </h2>
          <button
            onClick={() => setShowAddPlanModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow"
          >
            + Tambah Rencana Bulan Depan
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {plans.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Belum ada target bulan berikutnya.</p>
          ) : (
            plans.map(p => (
              <div key={p.id} className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-blue-950 text-sm">{p.rencana}</div>
                  <div className="text-slate-600">PIC: <strong>{p.pic}</strong> • Target: {p.target_tanggal}</div>
                  <div className="text-slate-500 text-[11px]">Indikator Keberhasilan: {p.indikator_keberhasilan}</div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-full w-fit">
                  {p.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: Tambah Evaluasi */}
      {showAddEvalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800">Catat Evaluasi Bulanan</h3>
            <form onSubmit={handleSaveEval} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Kategori Evaluasi</label>
                <select
                  value={newEvalData.kategori || 'Pendidikan'}
                  onChange={(e) => setNewEvalData({ ...newEvalData, kategori: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                >
                  {['Pendidikan', 'Tahfidz', 'BTQ', 'Kedisiplinan', 'Asrama', 'Keuangan', 'Kegiatan', 'Administrasi', 'SDM', 'Sarana Prasarana'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Pencapaian Positif</label>
                <textarea
                  rows={2}
                  value={newEvalData.pencapaian || ''}
                  onChange={(e) => setNewEvalData({ ...newEvalData, pencapaian: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Masalah / Kendala</label>
                <textarea
                  rows={2}
                  value={newEvalData.kendala || ''}
                  onChange={(e) => setNewEvalData({ ...newEvalData, kendala: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Solusi & Rekomendasi</label>
                <textarea
                  rows={2}
                  value={newEvalData.solusi || ''}
                  onChange={(e) => setNewEvalData({ ...newEvalData, solusi: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Target Bulan Berikutnya</label>
                <input
                  type="text"
                  value={newEvalData.target_bulan_berikutnya || ''}
                  onChange={(e) => setNewEvalData({ ...newEvalData, target_bulan_berikutnya: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddEvalModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold">Simpan Evaluasi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Rencana */}
      {showAddPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 border border-slate-200 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800">Tambah Target Bulan Berikutnya</h3>
            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Rencana Program / Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pelaksanaan Ujian Tengah Semester (UTS)"
                  value={newPlanData.rencana || ''}
                  onChange={(e) => setNewPlanData({ ...newPlanData, rencana: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={newPlanData.pic || ''}
                    onChange={(e) => setNewPlanData({ ...newPlanData, pic: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Target Tanggal</label>
                  <input
                    type="date"
                    value={newPlanData.target_tanggal || ''}
                    onChange={(e) => setNewPlanData({ ...newPlanData, target_tanggal: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Indikator Keberhasilan</label>
                <input
                  type="text"
                  placeholder="Contoh: 100% Santri Mengikuti Ujian"
                  value={newPlanData.indikator_keberhasilan || ''}
                  onChange={(e) => setNewPlanData({ ...newPlanData, indikator_keberhasilan: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPlanModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold">Simpan & Konversi Agenda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
