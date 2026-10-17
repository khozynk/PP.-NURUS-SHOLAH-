import React, { useState } from 'react';
import { 
  FileCheck2, 
  Printer, 
  Download, 
  Search, 
  Award, 
  BookOpen, 
  BookmarkCheck, 
  CalendarCheck2, 
  Building2, 
  Sparkles,
  UserCheck 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Student, StudentGrade, StudentReport } from '../../types/database';
import { useToast } from '../common/Toast';

export const StudentReportCardPage: React.FC = () => {
  const { showToast } = useToast();
  const settings = dbService.getSettings();
  const activeYear = dbService.getActiveAcademicYear();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const students = dbService.getStudents().filter(s => s.status === 'aktif');
  const rombels = dbService.getRombels();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const student = students.find(s => s.id === selectedStudentId);
  const rombelObj = rombels.find(r => r.id === student?.rombel_id);
  const classObj = dbService.getClasses().find(c => c.id === student?.kelas_id);
  const homeroomTeacher = dbService.getTeachers().find(t => t.id === (rombelObj?.homeroom_teacher_id || classObj?.wali_kelas_id));

  // Academic data for student report
  const studentGrades = dbService.getStudentGrades().filter(g => g.student_id === selectedStudentId);
  const tahfidzRecords = dbService.getTahfidzRecords(selectedStudentId);
  const murojaahRecords = dbService.getMurojaahRecords(selectedStudentId);
  const btqRecords = dbService.getBTQRecords(selectedStudentId);
  const attendanceSummary = dbService.getStudentAttendanceSummary(selectedStudentId);
  const existingReport = student ? dbService.getStudentReport(student.id) : null;

  // Notes state
  const [akhlakNote, setAkhlakNote] = useState<string>(existingReport?.akhlak_catatan || 'Sangat santun, tawadhu, dan taat pada aturan pondok.');
  const [waliNote, setWaliNote] = useState<string>(existingReport?.wali_kelas_catatan || 'Pertahankan ketekunan mutala\'ah kitab dan tingkatkan ziyadah hafalan Al-Qur\'an.');
  const [pengasuhNote, setPengasuhNote] = useState<string>(existingReport?.pengasuh_catatan || 'Moga menjadi ilmu yang bermanfaat dan barokah bagi ummat.');

  const handleSaveReportNotes = () => {
    if (!student) return;
    dbService.saveStudentReport({
      student_id: student.id,
      rombel_id: student.rombel_id || '',
      akhlak_catatan: akhlakNote,
      wali_kelas_catatan: waliNote,
      pengasuh_catatan: pengasuhNote
    });
    showToast('Catatan Rapor Disimpan', 'Catatan wali kelas dan pengasuh telah diperbarui.', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>AKADEMIK &bull; RAPOR RESMI SANTRI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cetak & Pratinjau Rapor Hasil Belajar
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Laporan Hasil Pembelajaran, Kitabiyah, Tahfidz Al-Qur'an, Murojaah, BTQ, dan Presensi Kehadiran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveReportNotes}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Simpan Catatan Rapor
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapor Santri</span>
          </button>
        </div>
      </div>

      {/* Student Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-slate-600">Pilih Santri Rapor:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-[260px]"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.nama_lengkap} (NIS: {s.nis})</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Rombel: <strong className="text-slate-800">{rombelObj?.name || 'Rombel'}</strong> &bull; Wali Kelas: <strong className="text-slate-800">{homeroomTeacher?.nama_lengkap || 'Ust. Ahmad Baihaqi'}</strong>
        </div>
      </div>

      {/* PRINTABLE REPORT CARD CONTAINER */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-8 text-slate-800 print:border-none print:shadow-none print:p-0 print:m-0">
        {/* KOP PONDOK PESANTREN */}
        <div className="border-b-4 border-double border-slate-800 pb-4 text-center space-y-1 relative">
          <div className="flex items-center justify-center gap-4">
            {settings.logo && (
              <img
                src={settings.logo}
                alt="Logo Pesantren"
                className="w-20 h-20 object-contain rounded-full shadow-xs"
              />
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-emerald-950">
                {settings.nama_pesantren || 'PONDOK PESANTREN NURUS SHOLAH'}
              </h2>
              <h3 className="text-sm font-bold tracking-widest text-slate-700 uppercase">
                BATULABANG AKKOR PALENGAAN PAMEKASAN
              </h3>
              <p className="text-[11px] text-slate-600 mt-1 max-w-xl">
                {settings.alamat}, Desa {settings.desa}, Kec. {settings.kecamatan}, Kab. {settings.kabupaten} {settings.kode_pos}
                <br />
                Telepon: {settings.telepon} &bull; Email: {settings.email}
              </p>
            </div>
          </div>
        </div>

        {/* TITLE & IDENTITAS SANTRI */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black uppercase tracking-wider underline text-slate-900">
            LAPORAN HASIL PEMBELAJARAN SANTRI (RAPOR)
          </h3>
          <div className="text-xs font-semibold text-slate-600">
            Tahun Ajaran {activeYear?.nama_tahun_ajaran || '2026/2027'} &bull; {activePeriod?.name || 'Semester 1 (Ganjil)'}
          </div>
        </div>

        {/* STUDENT IDENTITIES GRID */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 font-medium">
          <div className="space-y-1.5">
            <div className="flex"><span className="w-28 text-slate-500">Nama Santri</span>: <strong className="ml-1 text-slate-900">{student.nama_lengkap}</strong></div>
            <div className="flex"><span className="w-28 text-slate-500">NIS / NISN</span>: <span className="ml-1 font-mono font-bold text-slate-800">{student.nis} / {student.nisn || '-'}</span></div>
            <div className="flex"><span className="w-28 text-slate-500">Tempat, Tgl Lahir</span>: <span className="ml-1">{student.tempat_lahir}, {student.tanggal_lahir}</span></div>
          </div>

          <div className="space-y-1.5">
            <div className="flex"><span className="w-28 text-slate-500">Program Utama</span>: <strong className="ml-1 text-emerald-800">{student.program}</strong></div>
            <div className="flex"><span className="w-28 text-slate-500">Tingkat & Kelas</span>: <span className="ml-1 font-semibold">{classObj?.nama_kelas || 'Kelas Utama'}</span></div>
            <div className="flex"><span className="w-28 text-slate-500">Rombel Belajar</span>: <span className="ml-1 font-bold text-slate-800">{rombelObj?.name || 'Rombel A'}</span></div>
          </div>
        </div>

        {/* BAGIAN A: NILAI AKADEMIK & KITABIYAH */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2 border-b border-slate-200 pb-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>BAGIAN A: NILAI PENDIDIKAN MATERI & KITAB</span>
          </h4>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2.5 text-center border-r border-slate-300 w-10">No</th>
                <th className="p-2.5 border-r border-slate-300">Mata Pelajaran / Kitab Kuning</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-24">Nilai Akhir</th>
                <th className="p-2.5 text-center border-r border-slate-300 w-32">Predikat</th>
                <th className="p-2.5">Catatan Ustadz Pengampu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {studentGrades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                    Belum ada rekod nilai terinput untuk periode ini.
                  </td>
                </tr>
              ) : (
                studentGrades.map((g, idx) => {
                  const sbj = dbService.getSubjects().find(s => s.id === g.subject_id);
                  return (
                    <tr key={g.id}>
                      <td className="p-2 text-center border-r border-slate-300 font-medium">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-800">
                        {sbj?.nama || 'Materi Pembelajaran'}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 font-extrabold text-sm text-emerald-800">
                        {g.final_grade}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300 font-semibold text-slate-700">
                        {g.predikat}
                      </td>
                      <td className="p-2 italic text-slate-600 text-[11px]">
                        {g.catatan || 'Sangat memuaskan'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* BAGIAN B: TAHFIDZ, MUROJAAH & BTQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 border border-slate-200 p-4 rounded-2xl bg-slate-50/50">
            <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>CAPAIAN TAHFIDZ & MUROJAAH</span>
            </h5>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between"><span>Total Setoran Hafalan:</span><strong className="text-slate-900">{tahfidzRecords.length} Setoran</strong></div>
              <div className="flex justify-between"><span>Setoran Terakhir:</span><strong className="text-emerald-800">{tahfidzRecords[0]?.surah || 'Al-Baqarah'} (Juz {tahfidzRecords[0]?.juz || 1})</strong></div>
              <div className="flex justify-between"><span>Kualitas Hafalan:</span><span className="font-bold text-emerald-700">{tahfidzRecords[0]?.kualitas || 'Sangat Baik'}</span></div>
              <div className="flex justify-between"><span>Frekuensi Murojaah:</span><strong>{murojaahRecords.length} Sesi</strong></div>
            </div>
          </div>

          <div className="space-y-2 border border-slate-200 p-4 rounded-2xl bg-slate-50/50">
            <h5 className="font-bold text-xs text-sky-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Award className="w-4 h-4 text-sky-600" />
              <span>KOMPETENSI BACA TULIS AL-QUR'AN (BTQ)</span>
            </h5>
            <div className="text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between"><span>Nilai Akhir BTQ:</span><strong className="text-sky-800 text-sm font-black">{btqRecords[0]?.nilai_akhir || 85} / 100</strong></div>
              <div className="flex justify-between"><span>Level Kemampuan:</span><strong className="text-slate-900">{btqRecords[0]?.level_kemampuan || 'Lanjutan'}</strong></div>
              <div className="flex justify-between"><span>Makhraj & Tajwid:</span><span>{btqRecords[0]?.makharijul_huruf || 85} / {btqRecords[0]?.tajwid || 80}</span></div>
              <div className="flex justify-between"><span>Menulis Arab (Khat):</span><span>{btqRecords[0]?.menulis_arab || 78}</span></div>
            </div>
          </div>
        </div>

        {/* BAGIAN C: REKAP ABSENSI KEHADIRAN */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-1">
            <CalendarCheck2 className="w-4 h-4 text-indigo-600" />
            <span>BAGIAN C: REKAPITULASI PRESENSI KEHADIRAN</span>
          </h4>

          <div className="grid grid-cols-5 gap-3 text-center text-xs">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-900">
              Hadir: {attendanceSummary.hadir} Hari
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 font-bold text-blue-900">
              Izin: {attendanceSummary.izin} Hari
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 font-bold text-amber-900">
              Sakit: {attendanceSummary.sakit} Hari
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 font-bold text-rose-900">
              Alpa: {attendanceSummary.alpa} Hari
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 font-bold text-purple-900">
              Dispensasi: {attendanceSummary.dispensasi} Hari
            </div>
          </div>
        </div>

        {/* BAGIAN D: CATATAN AKHLAK & WALI KELAS */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-800">Catatan Akhlak & Kedisiplinan:</span>
            <input
              type="text"
              value={akhlakNote}
              onChange={(e) => setAkhlakNote(e.target.value)}
              className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 font-medium print:border-none print:p-0 print:bg-transparent"
            />
          </div>

          <div>
            <span className="font-bold text-slate-800">Catatan Wali Kelas / Pembimbing:</span>
            <textarea
              rows={2}
              value={waliNote}
              onChange={(e) => setWaliNote(e.target.value)}
              className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 font-medium print:border-none print:p-0 print:bg-transparent"
            />
          </div>
        </div>

        {/* SIGNATURES BLOCK */}
        <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div>Orang Tua / Wali Santri</div>
            <div className="h-20" />
            <div className="font-bold underline text-slate-900">( .................................... )</div>
          </div>

          <div>
            <div>Wali Kelas / Pengampu</div>
            <div className="h-20" />
            <div className="font-bold underline text-slate-900">{homeroomTeacher?.nama_lengkap || 'Ust. H. Ahmad Baihaqi, Lc.'}</div>
          </div>

          <div>
            <div>Pamekasan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="font-semibold text-slate-600">Pengasuh PP Nurus Sholah</div>
            <div className="h-16" />
            <div className="font-bold underline text-slate-900">{settings.nama_pengasuh || 'KH. Moh. Sholahuddin Al-Ayyubi'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
