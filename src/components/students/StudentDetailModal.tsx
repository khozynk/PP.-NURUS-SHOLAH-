import React, { useState } from 'react';
import { 
  X, 
  User, 
  Users,
  MapPin, 
  BookOpen, 
  History, 
  GraduationCap, 
  Calendar, 
  Phone, 
  FileText, 
  Edit3, 
  RefreshCw, 
  Printer, 
  Sparkles, 
  School,
  DoorOpen,
  UserMinus,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bed
} from 'lucide-react';
import { Student, StudentHistory, Alumni } from '../../types/database';
import { dbService, calculateStudyDuration, calculateAge } from '../../services/db';
import { authService } from '../../services/auth';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onChangeStatus: (student: Student) => void;
  onGraduate?: (student: Student) => void;
  onTransfer?: (student: Student) => void;
  onWithdraw?: (student: Student) => void;
  onRollback?: (student: Student) => void;
  onReactivate?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onChangeStatus,
  onGraduate,
  onTransfer,
  onWithdraw,
  onRollback,
  onReactivate
}) => {
  const [activeTab, setActiveTab] = useState<'biodata' | 'orang_tua' | 'pendidikan' | 'tahfidz' | 'btq' | 'kehadiran' | 'dokumen' | 'history' | 'alumni' | 'kegiatan'>('biodata');

  if (!student) return null;

  const currentUser = authService.getCurrentUser();
  const canGraduate = authService.hasPermission('student.graduate');
  const canTransfer = authService.hasPermission('student.transfer');
  const canWithdraw = authService.hasPermission('student.withdraw');
  const canReactivate = authService.hasPermission('student.reactivate');
  const canRollback = authService.hasPermission('student.status.rollback') || currentUser?.role === 'super_admin';

  const histories = dbService.getStudentHistories(student.id);
  const alumniRecord = dbService.getAlumni().find(a => a.student_id === student.id);
  const className = dbService.getClassName(student.kelas_id);

  // Relational Stage 4 Academic & Dorm Data
  const programs = dbService.getPrograms();
  const tracks = dbService.getTracks();
  const levels = dbService.getLevels();
  const classes = dbService.getClasses();
  const rombels = dbService.getRombels();
  const teachers = dbService.getTeachers();
  const dormRooms = dbService.getDormRooms();
  const dormBuildings = dbService.getDormBuildings();
  const activeYear = dbService.getActiveAcademicYear();

  const programObj = programs.find(p => p.id === student.program_id) || programs.find(p => p.name === student.program);
  const trackObj = tracks.find(t => t.id === student.track_id);
  const levelObj = levels.find(l => l.id === student.level_id);
  const classObj = classes.find(c => c.id === student.kelas_id);
  const rombelObj = rombels.find(r => r.id === student.rombel_id);
  const homeroomObj = teachers.find(t => t.id === rombelObj?.homeroom_teacher_id || t.id === classObj?.wali_kelas_id);
  const mentorObj = teachers.find(t => t.id === rombelObj?.mentor_id);
  const roomObj = dormRooms.find(r => r.id === student.room_id);
  const buildingObj = dormBuildings.find(b => b.id === (roomObj?.building_id || student.dorm_building_id));

  const eduHistories = dbService.getStudentEducationHistory(student.id);
  const studentRoomHistories = dbService.getStudentRoomHistory(student.id);

  const duration = calculateStudyDuration(
    student.tahun_masuk,
    student.tanggal_masuk,
    new Date().getFullYear(),
    new Date().toISOString().slice(0, 10)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Profil Santri"
      subtitle={`${student.nama_lengkap} · NIS: ${student.nis}`}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* Top Summary Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xl shadow-xs shrink-0 overflow-hidden border border-emerald-700">
              {student.foto ? (
                <img src={student.foto} alt={student.nama_lengkap} className="w-full h-full object-cover" />
              ) : (
                student.nama_lengkap.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{student.nama_lengkap}</h2>
                {student.is_demo && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                    DATA DEMO
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                <span className="font-mono">NIS: {student.nis}</span>
                <span>·</span>
                <span>Program: {student.program}</span>
                <span>·</span>
                <span>Kelas: {className}</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">Masa Belajar: {duration.text}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={student.status} size="sm" />
                {alumniRecord && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                    ID Alumni: {alumniRecord.id_alumni}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              onClick={() => onEdit(student)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Data</span>
            </button>

            {/* Tombol Proses Kelulusan (Section 4) */}
            {(student.status === 'aktif' || student.status === 'lulus') && canGraduate && onGraduate && (
              <button
                onClick={() => onGraduate(student)}
                className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Proses kelulusan santri menjadi Alumni"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                <span>Proses Kelulusan</span>
              </button>
            )}

            {/* Tombol Proses Pindah (Section 12) */}
            {student.status === 'aktif' && canTransfer && onTransfer && (
              <button
                onClick={() => onTransfer(student)}
                className="px-3 py-1.5 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Proses mutasi santri pindah"
              >
                <DoorOpen className="w-3.5 h-3.5 text-orange-700" />
                <span>Proses Pindah</span>
              </button>
            )}

            {/* Tombol Proses Keluar (Section 14) */}
            {student.status === 'aktif' && canWithdraw && onWithdraw && (
              <button
                onClick={() => onWithdraw(student)}
                className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Proses santri mengundurkan diri / keluar"
              >
                <UserMinus className="w-3.5 h-3.5 text-rose-700" />
                <span>Proses Keluar</span>
              </button>
            )}

            {/* Tombol Aktifkan Kembali (Section 15) */}
            {(student.status === 'tidak_aktif' || student.status === 'pindah' || student.status === 'keluar') && canReactivate && onReactivate && (
              <button
                onClick={() => onReactivate(student)}
                className="px-3 py-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Aktifkan kembali santri"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                <span>Aktifkan Kembali</span>
              </button>
            )}

            {/* Tombol Batalkan Status / Rollback (Section 16: Super Admin) */}
            {canRollback && onRollback && (
              <button
                onClick={() => onRollback(student)}
                className="px-3 py-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Batalkan perubahan status kelulusan / mutasi (Super Admin)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-700" />
                <span>Batalkan Status</span>
              </button>
            )}

            <button
              onClick={() => onChangeStatus(student)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Mutasi Status Umum"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Status Lain</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Cetak Biodata Lengkap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'biodata'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Biodata</span>
          </button>

          <button
            onClick={() => setActiveTab('orang_tua')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orang_tua'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Orang Tua / Wali</span>
          </button>

          <button
            onClick={() => setActiveTab('pendidikan')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pendidikan'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Pendidikan & Asrama</span>
          </button>

          <button
            onClick={() => setActiveTab('tahfidz')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tahfidz'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Tahfidz</span>
          </button>

          <button
            onClick={() => setActiveTab('btq')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'btq'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <School className="w-4 h-4 text-sky-600" />
            <span>BTQ</span>
          </button>

          <button
            onClick={() => setActiveTab('kehadiran')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kehadiran'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Kehadiran</span>
          </button>

          <button
            onClick={() => setActiveTab('dokumen')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'dokumen'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dokumen</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat & Mutasi ({histories.length})</span>
          </button>

          {(student.status === 'alumni' || student.status === 'lulus' || alumniRecord) && (
            <button
              onClick={() => setActiveTab('alumni')}
              className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'alumni'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Data Alumni Terkait</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'kegiatan'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Prestasi & Catatan</span>
          </button>
        </div>

        {/* TAB 1: BIODATA */}
        {activeTab === 'biodata' && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Section: Identitas Santri */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span>Identitas Santri</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <div>
                  <div className="text-[11px] text-slate-400">Nama Lengkap</div>
                  <div className="font-semibold text-slate-800">{student.nama_lengkap}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Nama Panggilan</div>
                  <div className="font-semibold text-slate-800">{student.nama_panggilan || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Jenis Kelamin</div>
                  <div className="font-semibold text-slate-800">
                    {student.jenis_kelamin === 'L' ? 'Laki-laki (Santri Putra)' : 'Perempuan (Santri Putri)'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">NIS (No. Induk Santri)</div>
                  <div className="font-mono font-semibold text-slate-800">{student.nis}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">NISN (Nasional)</div>
                  <div className="font-mono font-semibold text-slate-800">{student.nisn || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">NIK (KTP)</div>
                  <div className="font-mono font-semibold text-slate-800">{student.nik || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Nomor Kartu Keluarga (KK)</div>
                  <div className="font-mono font-semibold text-slate-800">{student.nomor_kk || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Tempat, Tanggal Lahir</div>
                  <div className="font-semibold text-slate-800">
                    {student.tempat_lahir || '-'}, {student.tanggal_lahir || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Umur Otomatis</div>
                  <div className="font-semibold text-emerald-800">
                    {student.tanggal_lahir ? `${calculateAge(student.tanggal_lahir)} Tahun` : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Status Anak</div>
                  <div className="font-semibold text-slate-800">{student.status_anak || 'Kandung'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Anak Ke / Dari Bersaudara</div>
                  <div className="font-semibold text-slate-800">
                    Anak ke-{student.anak_ke || 1} dari {student.jumlah_saudara || 1} bersaudara
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Nomor HP Santri</div>
                  <div className="font-semibold text-slate-800">{student.nomor_hp || '-'}</div>
                </div>
              </div>
            </div>

            {/* Section: Alamat Santri */}
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>Alamat Tempat Tinggal & Domisili</span>
              </h3>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2">
                <div>
                  <div className="text-[11px] text-slate-400">Alamat Lengkap / Dusun</div>
                  <div className="font-semibold text-slate-800">{student.alamat}</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/50">
                  <div>
                    <div className="text-[11px] text-slate-400">Dusun / RT / RW</div>
                    <div className="font-medium text-slate-800">
                      {student.dusun || '-'} {student.rt ? `RT ${student.rt}` : ''} {student.rw ? `RW ${student.rw}` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Desa / Kelurahan</div>
                    <div className="font-medium text-slate-800">{student.desa || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Kecamatan</div>
                    <div className="font-medium text-slate-800">{student.kecamatan || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Kabupaten / Provinsi / Pos</div>
                    <div className="font-medium text-slate-800">{student.kabupaten}, {student.provinsi} ({student.kode_pos || '69362'})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORANG TUA / WALI & KONTAK DARURAT */}
        {activeTab === 'orang_tua' && (
          <div className="space-y-6 text-xs sm:text-sm">
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Data Orang Tua Santri</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Ayah */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">Data Ayah Kandung</span>
                  <div>
                    <div className="text-[11px] text-slate-400">Nama Ayah</div>
                    <div className="font-bold text-slate-900">{student.nama_ayah || 'Belum Diisi'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">NIK:</span>
                      <span className="font-mono text-slate-700 font-semibold">{student.nik_ayah || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tempat/Tgl Lahir:</span>
                      <span className="text-slate-700">{student.tempat_lahir_ayah || '-'}, {student.tanggal_lahir_ayah || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pendidikan:</span>
                      <span className="text-slate-700">{student.pendidikan_ayah || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pekerjaan:</span>
                      <span className="text-slate-700">{student.pekerjaan_ayah || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Penghasilan:</span>
                      <span className="text-slate-700">{student.penghasilan_ayah || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Nomor HP:</span>
                      <span className="font-mono text-emerald-800 font-semibold">{student.nomor_hp_ayah || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Alamat Ayah:</div>
                    <div className="text-slate-700">{student.alamat_ayah || student.alamat || '-'}</div>
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-teal-800 uppercase block mb-1">Data Ibu Kandung</span>
                  <div>
                    <div className="text-[11px] text-slate-400">Nama Ibu</div>
                    <div className="font-bold text-slate-900">{student.nama_ibu || 'Belum Diisi'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">NIK:</span>
                      <span className="font-mono text-slate-700 font-semibold">{student.nik_ibu || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tempat/Tgl Lahir:</span>
                      <span className="text-slate-700">{student.tempat_lahir_ibu || '-'}, {student.tanggal_lahir_ibu || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pendidikan:</span>
                      <span className="text-slate-700">{student.pendidikan_ibu || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pekerjaan:</span>
                      <span className="text-slate-700">{student.pekerjaan_ibu || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Penghasilan:</span>
                      <span className="text-slate-700">{student.penghasilan_ibu || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Nomor HP:</span>
                      <span className="font-mono text-teal-800 font-semibold">{student.nomor_hp_ibu || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Alamat Ibu:</div>
                    <div className="text-slate-700">{student.alamat_ibu || student.alamat || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wali & Kontak Darurat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Data Wali (Selain Orang Tua)</span>
                {student.punya_wali ? (
                  <div className="space-y-1.5 text-xs">
                    <div><strong>Nama:</strong> {student.nama_wali} ({student.hubungan_wali || 'Wali'})</div>
                    <div><strong>NIK:</strong> {student.nik_wali || '-'}</div>
                    <div><strong>Pekerjaan:</strong> {student.pekerjaan_wali || '-'}</div>
                    <div><strong>HP:</strong> {student.nomor_hp_wali || '-'}</div>
                    <div><strong>Alamat:</strong> {student.alamat_wali || '-'}</div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic mt-2">Santri diasuh langsung oleh orang tua kandung (tidak memiliki wali lain).</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900 uppercase block mb-1">Kontak Darurat</span>
                {student.kontak_darurat_nama ? (
                  <div className="space-y-1.5 text-xs">
                    <div><strong>Nama:</strong> {student.kontak_darurat_nama} ({student.kontak_darurat_hubungan || '-'})</div>
                    <div><strong>Nomor HP:</strong> <span className="font-mono font-bold text-amber-900">{student.kontak_darurat_hp || '-'}</span></div>
                    <div><strong>Alamat:</strong> {student.kontak_darurat_alamat || '-'}</div>
                    {student.kontak_darurat_keterangan && <div><strong>Keterangan:</strong> {student.kontak_darurat_keterangan}</div>}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic mt-2">Kontak darurat menggunakan nomor HP orang tua santri.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PENDIDIKAN & ASRAMA (Stage 4 Final Requirement 17 & 8) */}
        {activeTab === 'pendidikan' && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Relational Academic Placements (Requirement 17) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  <span>Informasi Pendidikan & Penempatan Terbaru (Database Relasional)</span>
                </h3>
                <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  TA {activeYear?.nama_tahun_ajaran || '2026/2027'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Program</span>
                  <span className="font-bold text-emerald-800 text-xs sm:text-sm block mt-0.5">
                    {programObj?.name || student.program || '-'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Cabang / Track</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block mt-0.5">
                    {trackObj?.name || 'Reguler / Inti'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Tingkat / Level</span>
                  <span className="font-bold text-teal-800 text-xs sm:text-sm block mt-0.5">
                    {levelObj?.name || classObj?.tingkat || '-'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Tahun Ajaran</span>
                  <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm block mt-0.5">
                    {activeYear?.nama_tahun_ajaran || '2026/2027'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Kelas Induk</span>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm block mt-0.5">
                    {classObj?.nama_kelas || className || '-'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">6. Rombel Belajar</span>
                  <span className="font-bold text-sky-800 text-xs sm:text-sm block mt-0.5">
                    {rombelObj?.name || (student.rombel ? `Rombel ${student.rombel}` : '-')}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">7. Wali Kelas</span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm block mt-0.5 truncate" title={homeroomObj?.nama_lengkap || '-'}>
                    {homeroomObj?.nama_lengkap || 'Ustadz Wali Kelas'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">8. Pembimbing</span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm block mt-0.5 truncate" title={mentorObj?.nama_lengkap || student.pembimbing || '-'}>
                    {mentorObj?.nama_lengkap || student.pembimbing || 'Ustadz Pembimbing'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">9. Asrama Gedung</span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm block mt-0.5 truncate">
                    {buildingObj?.nama || student.asrama || 'Gedung Asrama'}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">10. Kamar Santri</span>
                  <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm block mt-0.5">
                    {roomObj?.nama_kamar || (student.nomor_kamar ? `Kamar ${student.nomor_kamar}` : 'Belum Ditentukan')}
                  </span>
                </div>
              </div>
            </div>

            {/* Riwayat Kenaikan & Perpindahan Pendidikan (Requirement 8) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>RIWAYAT PENDIDIKAN (Riwayat Kenaikan & Penempatan Kelas)</span>
                </h4>
                <span className="text-slate-400 text-xs">
                  {eduHistories.length} Catatan Riwayat
                </span>
              </div>

              {eduHistories.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Santri baru terdaftar pada tahun ajaran berjalan ({activeYear?.nama_tahun_ajaran || '2026/2027'}). Belum ada perpindahan tingkat terdahulu.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Tahun Ajaran</th>
                        <th className="py-2.5 px-3">Program</th>
                        <th className="py-2.5 px-3">Kitab / Cabang</th>
                        <th className="py-2.5 px-3">Tingkat</th>
                        <th className="py-2.5 px-3">Rombel</th>
                        <th className="py-2.5 px-3">Wali Kelas</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {eduHistories.map(eh => {
                        const ay = dbService.getAcademicYears().find(y => y.id === eh.academic_year_id);
                        const pr = programs.find(p => p.id === eh.program_id);
                        const tr = tracks.find(t => t.id === eh.track_id);
                        const lv = levels.find(l => l.id === eh.level_id);
                        const rb = rombels.find(r => r.id === eh.rombel_id);
                        const hm = teachers.find(t => t.id === eh.homeroom_teacher_id || t.id === rb?.homeroom_teacher_id);

                        return (
                          <tr key={eh.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                              {ay?.nama_tahun_ajaran || '2026/2027'}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {pr?.name || 'Kitabiyah'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {tr?.name || '-'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-teal-800">
                              {lv?.name || '-'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700">
                              {rb?.name || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {hm?.nama_lengkap || '-'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {eh.status || 'aktif'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Riwayat Kamar Asrama (Requirement 16) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Bed className="w-4 h-4 text-teal-700" />
                <span>Riwayat Penempatan & Pindah Kamar Asrama</span>
              </h4>

              {studentRoomHistories.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  Santri belum memiliki riwayat mutasi kamar. Menempati kamar saat ini sejak awal pendaftaran.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Tanggal Pindah</th>
                        <th className="py-2 px-3">Kamar Baru</th>
                        <th className="py-2 px-3">Alasan Mutasi</th>
                        <th className="py-2 px-3">Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentRoomHistories.map(rh => {
                        const targetR = dormRooms.find(r => r.id === rh.room_id);
                        return (
                          <tr key={rh.id}>
                            <td className="py-2 px-3 font-mono text-slate-600">{rh.start_date}</td>
                            <td className="py-2 px-3 font-bold text-emerald-800">{targetR?.nama_kamar || 'Kamar'}</td>
                            <td className="py-2 px-3 text-slate-700">{rh.alasan}</td>
                            <td className="py-2 px-3 text-slate-500">{rh.petugas || 'Admin'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB TAHFIDZ (Stage 5 Requirement 11) */}
        {activeTab === 'tahfidz' && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-emerald-800 font-bold block text-sm">PROFIL TAHFIDZ SANTRI</span>
                <span className="text-emerald-700 text-xs">Hafalan Al-Qur'an 30 Juz Bersanad</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-white px-3 py-1 rounded-xl text-emerald-800 font-bold border border-emerald-300">
                  {dbService.getTahfidzRecords(student.id).length} Setoran
                </span>
                <span className="bg-emerald-700 text-white px-3 py-1 rounded-xl font-bold">
                  Target: Juz {dbService.getTahfidzTargets(student.id)[0]?.target_juz || 5}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Juz</th>
                    <th className="p-2.5">Surah & Ayat</th>
                    <th className="p-2.5">Jenis</th>
                    <th className="p-2.5 text-center">Nilai</th>
                    <th className="p-2.5">Kualitas</th>
                    <th className="p-2.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbService.getTahfidzRecords(student.id).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-400 italic">Belum ada riwayat setoran tahfidz untuk santri ini.</td>
                    </tr>
                  ) : (
                    dbService.getTahfidzRecords(student.id).map(r => (
                      <tr key={r.id}>
                        <td className="p-2.5 font-mono text-slate-500">{r.tanggal}</td>
                        <td className="p-2.5 font-bold text-emerald-800">Juz {r.juz}</td>
                        <td className="p-2.5 font-medium">{r.surah} ({r.ayat_mulai}-{r.ayat_selesai})</td>
                        <td className="p-2.5">{r.jenis_setoran}</td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{r.nilai}</td>
                        <td className="p-2.5 font-semibold text-emerald-700">{r.kualitas}</td>
                        <td className="p-2.5 text-slate-500">{r.catatan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB BTQ (Stage 5 Requirement 18) */}
        {activeTab === 'btq' && (
          <div className="space-y-4 text-xs">
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-sky-900 font-bold block text-sm">PROFIL BACA TULIS AL-QUR'AN (BTQ)</span>
                <span className="text-sky-700 text-xs">Evaluasi Makhraj, Tajwid, Fasahah, & Menulis Arab</span>
              </div>
              <span className="bg-sky-700 text-white px-3.5 py-1 rounded-xl font-bold">
                Level: {dbService.getBTQRecords(student.id)[0]?.level_kemampuan || 'Menengah'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Makharijul Huruf</span>
                <span className="text-base font-bold text-slate-800">{dbService.getBTQRecords(student.id)[0]?.makharijul_huruf || 85} / 100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tajwid & Waqaf</span>
                <span className="text-base font-bold text-slate-800">{dbService.getBTQRecords(student.id)[0]?.tajwid || 80} / 100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Kelancaran Tartil</span>
                <span className="text-base font-bold text-slate-800">{dbService.getBTQRecords(student.id)[0]?.kelancaran || 85} / 100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Menulis Arab (Khat)</span>
                <span className="text-base font-bold text-slate-800">{dbService.getBTQRecords(student.id)[0]?.menulis_arab || 78} / 100</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB KEHADIRAN (Stage 5 Requirement 21 & 22) */}
        {activeTab === 'kehadiran' && (
          <div className="space-y-4 text-xs">
            {(() => {
              const attSum = dbService.getStudentAttendanceSummary(student.id);
              return (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-indigo-900 font-bold block text-sm">REKAP PRESENSI KEHADIRAN</span>
                      <span className="text-indigo-700 text-xs">Persentase Kehadiran Total: {attSum.percentage}%</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold">Hadir: {attSum.hadir}</span>
                      <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-bold">Izin: {attSum.izin}</span>
                      <span className="bg-amber-600 text-white px-2.5 py-1 rounded-lg font-bold">Sakit: {attSum.sakit}</span>
                      <span className="bg-rose-600 text-white px-2.5 py-1 rounded-lg font-bold">Alpa: {attSum.alpa}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5 text-center">Status</th>
                          <th className="p-2.5">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attSum.records.length === 0 ? (
                          <tr><td colSpan={3} className="p-4 text-center text-slate-400 italic">Belum ada riwayat absensi.</td></tr>
                        ) : (
                          attSum.records.map(r => (
                            <tr key={r.id}>
                              <td className="p-2.5 font-mono text-slate-600">{r.tanggal}</td>
                              <td className="p-2.5 text-center font-bold">{r.status}</td>
                              <td className="p-2.5 text-slate-500">{r.keterangan || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: DOKUMEN & SURAT SANTRI (Stage 6 Requirement 6) */}
        {activeTab === 'dokumen' && (
          <div className="space-y-5 text-xs">
            {/* Real Student Letters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Surat Resmi Terbit Untuk Santri Ini</span>
                </h4>
                <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                  {dbService.getStudentLetters({ studentId: student.id }).length} Surat Terbit
                </span>
              </div>

              {dbService.getStudentLetters({ studentId: student.id }).length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 italic">
                  Belum ada surat resmi yang diterbitkan untuk santri ini.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Nomor Surat</th>
                        <th className="p-2.5">Jenis Surat</th>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Perihal</th>
                        <th className="p-2.5">Penandatangan</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {dbService.getStudentLetters({ studentId: student.id }).map(sl => (
                        <tr key={sl.id}>
                          <td className="p-2.5 font-bold font-mono text-slate-900">{sl.nomor_surat}</td>
                          <td className="p-2.5 font-semibold text-emerald-800">{sl.jenis_surat}</td>
                          <td className="p-2.5 text-slate-500">{sl.tanggal_surat}</td>
                          <td className="p-2.5 text-slate-700">{sl.perihal}</td>
                          <td className="p-2.5 font-medium text-slate-800">{sl.penandatangan}</td>
                          <td className="p-2.5 text-center">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {sl.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Real Student Documents (KK, Akta, Ijazah) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Berkas Dokumen Digital (KK, Akta, Ijazah, KTP)</span>
                </h4>
                <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                  dbService.getStudentDocumentSummary(student.id).isLengkap
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {dbService.getStudentDocumentSummary(student.id).isLengkap ? 'Berkas Lengkap' : 'Berkas Belum Lengkap'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dbService.getStudentDocuments({ studentId: student.id }).map((doc) => (
                  <div key={doc.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">{doc.nama_dokumen}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {doc.nomor_dokumen ? `No: ${doc.nomor_dokumen}` : doc.jenis_dokumen}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.status === 'Lengkap' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PRESTASI & CATATAN */}
        {activeTab === 'kegiatan' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Catatan Administrasi & Pembimbing</span>
              </h4>
              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                {student.catatan || 'Santri aktif PP Nurus Sholah, berkelakuan baik dan mengikuti ta\'lim serta jamaah.'}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-emerald-700 mx-auto" />
              <div className="font-bold text-emerald-900 text-sm">Modul Prestasi & Catatan Pelanggaran</div>
              <p className="text-slate-600 text-xs max-w-md mx-auto">
                Buku piagam kejuaraan lomba MQK/MTQ, tahfidz hafalan juziyah, dan kartu absensi sholat berjamaah akan terintegrasi langsung saat modul Kegiatan & Pendidikan diaktifkan.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: RIWAYAT & MUTASI (Section 11: Timeline Lengkap) */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <span>Seluruh perpindahan kelas, perubahan status, kelulusan, pindah, atau keluar tercatat permanen di riwayat ini.</span>
              <span className="font-bold text-emerald-800">{histories.length} Catatan</span>
            </div>

            {histories.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                Belum ada rekaman riwayat tambahan untuk santri ini.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {histories.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">{h.jenis_perubahan}</span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                          {h.tanggal}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed mb-2">{h.keterangan}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                        {h.status_lama && (
                          <span>
                            Status: <strong className="text-slate-700">{h.status_lama}</strong> &rarr; <strong className="text-emerald-700">{h.status_baru}</strong>
                          </span>
                        )}
                        <span className="ml-auto text-slate-400">Oleh: {h.user_nama || 'Administrator'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DATA ALUMNI TERKAIT */}
        {activeTab === 'alumni' && (
          <div className="space-y-4">
            {alumniRecord ? (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div>
                    <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                      Terdaftar Dalam Database Alumni
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{alumniRecord.id_alumni}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-bold capitalize">
                    {alumniRecord.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 text-[11px]">Tahun Lulus</div>
                    <div className="font-semibold text-slate-800">{alumniRecord.tahun_lulus}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Tanggal Lulus Resmi</div>
                    <div className="font-semibold text-slate-800">{alumniRecord.tanggal_lulus}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Lama Belajar</div>
                    <div className="font-semibold text-emerald-800">{alumniRecord.lama_belajar || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Pendidikan Lanjutan</div>
                    <div className="font-semibold text-slate-800">{alumniRecord.pendidikan_lanjutan || '-'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">Pekerjaan & Tempat Kerja</div>
                    <div className="font-semibold text-slate-800">
                      {alumniRecord.pekerjaan ? `${alumniRecord.pekerjaan} (${alumniRecord.tempat_kerja || '-'})` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[11px]">No. Telepon / WA</div>
                    <div className="font-semibold text-slate-800">{alumniRecord.nomor_hp || '-'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Belum Ada Rekod Alumni</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Gunakan tombol "Proses Kelulusan" di atas untuk meluluskan santri ini secara resmi menjadi Alumni.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
