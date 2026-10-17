import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Layers, 
  School, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Briefcase, 
  FileText,
  Clock,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Teacher, SchoolClass, Rombel, Subject, TeacherSubjectAssignment } from '../../types/database';
import { dbService } from '../../services/db';
import { Modal } from '../common/Modal';

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (teacher: Teacher) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacher,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!teacher) return null;

  const [activeTab, setActiveTab] = useState<
    'biodata' | 'mapel' | 'kelas' | 'rombel' | 'jadwal' | 'riwayat' | 'catatan'
  >('biodata');

  // Related data
  const rombels = dbService.getRombels();
  const classes = dbService.getClasses();
  const subjects = dbService.getSubjects();
  const teacherSubjects = dbService.getTeacherSubjects(teacher.id);
  const dormRooms = dbService.getDormRooms().filter(r => r.mentor_id === teacher.id);
  const dormBuildings = dbService.getDormBuildings();

  // As Homeroom teacher
  const homeroomRombels = rombels.filter(r => r.homeroom_teacher_id === teacher.id);
  
  // As Mentor
  const mentoredRombels = rombels.filter(r => r.mentor_id === teacher.id);

  // Associated classes
  const assignedClassIds = new Set([
    ...classes.filter(c => c.wali_kelas_id === teacher.id).map(c => c.id),
    ...homeroomRombels.map(r => r.class_id)
  ]);
  const assignedClasses = classes.filter(c => assignedClassIds.has(c.id));

  // Taught subjects
  const assignedSubjects = teacherSubjects.map(ts => {
    const s = subjects.find(sub => sub.id === ts.subject_id);
    const r = rombels.find(rom => rom.id === ts.rombel_id);
    return {
      assignmentId: ts.id,
      subject: s,
      rombel: r
    };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Dewan Asatidz / Pengajar"
      subtitle={`ID: ${teacher.id} &bull; ${teacher.jabatan}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-100/80">
          <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 overflow-hidden">
            {teacher.foto ? (
              <img src={teacher.foto} alt={teacher.nama_lengkap} className="w-full h-full object-cover" />
            ) : (
              <span>{teacher.nama_lengkap.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {teacher.nama_lengkap}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                teacher.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {teacher.status === 'aktif' ? 'Ustadz Aktif' : 'Nonaktif'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              NIP / NIK: {teacher.nip || '-'} &bull; {teacher.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 pt-1">
              <span className="font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                {teacher.jabatan}
              </span>
              <span>Keahlian: <strong>{teacher.keahlian || teacher.bidang_studi || '-'}</strong></span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px text-xs font-semibold">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'biodata' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Biodata
          </button>
          <button
            onClick={() => setActiveTab('mapel')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'mapel' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Mata Pelajaran/Kitab ({assignedSubjects.length})
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'kelas' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Kelas ({assignedClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('rombel')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rombel' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Rombel ({homeroomRombels.length + mentoredRombels.length})
          </button>
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'jadwal' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            5. Jadwal
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'riwayat' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            6. Riwayat Mengajar
          </button>
          <button
            onClick={() => setActiveTab('catatan')}
            className={`pb-2 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'catatan' ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            7. Catatan
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-xs">
          {/* TAB 1: BIODATA */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Identitas Pribadi</span>
                </h3>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Nama Panggilan</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.nama_panggilan || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Gelar</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.gelar || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Tempat Lahir</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.tempat_lahir || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Tanggal Lahir</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.tanggal_lahir || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Pendidikan</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.pendidikan_terakhir || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Mulai Mengajar</span>
                  <span className="col-span-2 font-medium text-slate-800">{teacher.tahun_mulai ? `Tahun ${teacher.tahun_mulai}` : '-'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kontak & Domisili</span>
                </h3>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Nomor WhatsApp</span>
                  <span className="col-span-2 font-mono font-medium text-slate-800">{teacher.nomor_hp || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Email</span>
                  <span className="col-span-2 font-mono font-medium text-slate-800">{teacher.email || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-400">Alamat Tempat Tinggal</span>
                  <span className="col-span-2 font-medium text-slate-800 leading-relaxed">{teacher.alamat || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATERI KITAB */}
          {activeTab === 'mapel' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span>Daftar mata pelajaran atau kitab yang diampu:</span>
                <span className="font-mono">{assignedSubjects.length} Materi</span>
              </div>

              {assignedSubjects.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Belum ada mata pelajaran/kitab yang ditugaskan ke ustadz ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedSubjects.map(({ assignmentId, subject, rombel }) => (
                    <div
                      key={assignmentId}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {subject?.kode || 'MAPEL'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Jenis: {subject?.jenis || 'Kitab'}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {subject?.nama || 'Mata Pelajaran'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Rombel: <strong className="text-slate-700">{rombel?.name || 'Seluruh Rombel'}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KELAS */}
          {activeTab === 'kelas' && (
            <div className="space-y-3">
              <div className="text-slate-500">
                Kelas yang terkait dengan pengajaran dan penugasan ustadz:
              </div>

              {assignedClasses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Belum terhubung dengan tingkatan kelas utama.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {assignedClasses.map(c => (
                    <div key={c.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Tingkat: {c.tingkat}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">TA {c.tahun_ajaran}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.nama_kelas}</h4>
                      <p className="text-[11px] text-slate-500">
                        Peran: {c.wali_kelas_id === teacher.id ? 'Wali Kelas' : 'Pengajar / Pengasuh'} &bull; Kapasitas {c.kapasitas} santri
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ROMBEL */}
          {activeTab === 'rombel' && (
            <div className="space-y-3">
              <div className="text-slate-500">
                Rombongan belajar binaan (Wali Kelas & Pembimbing):
              </div>

              {homeroomRombels.length === 0 && mentoredRombels.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Ustadz saat ini tidak tercatat di rombel manapun.
                </div>
              ) : (
                <div className="space-y-2">
                  {homeroomRombels.map(r => {
                    const enrolled = dbService.getStudents().filter(s => s.rombel_id === r.id && s.status === 'aktif');
                    const cls = classes.find(c => c.id === r.class_id);

                    return (
                      <div
                        key={r.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                              {r.code}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{r.name}</h4>
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Wali Kelas
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Kelas Induk: {cls?.nama_kelas} &bull; Kapasitas: {r.capacity} santri
                          </p>
                        </div>

                        <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {enrolled.length} Santri Binaan
                        </span>
                      </div>
                    );
                  })}

                  {mentoredRombels.filter(mr => !homeroomRombels.some(hr => hr.id === mr.id)).map(r => {
                    const enrolled = dbService.getStudents().filter(s => s.rombel_id === r.id && s.status === 'aktif');
                    const cls = classes.find(c => c.id === r.class_id);

                    return (
                      <div
                        key={r.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                              {r.code}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{r.name}</h4>
                            <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                              Pembimbing Halaqah
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Kelas Induk: {cls?.nama_kelas} &bull; Kapasitas: {r.capacity} santri
                          </p>
                        </div>

                        <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          {enrolled.length} Santri
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: JADWAL */}
          {activeTab === 'jadwal' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-700 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Jadwal Pengajian & Halaqah Rutin</span>
                </div>
                <p className="text-[11px] text-emerald-800/80">
                  Waktu taklim terstruktur sesuai agenda harian PP Nurus Sholah Batulabang Akkor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { waktu: 'Ba\'da Subuh (05:30 - 06:45)', kegiatan: 'Setoran Ziyadah & Tahfidz / Sorogan Al-Qur\'an', tempat: 'Masjid Utama & Aula Tahfidz' },
                  { waktu: 'Pagi (08:00 - 11:30)', kegiatan: 'KBM Diniyah & Pengajian Kitab Kuning (Safinah/Iktisyaf)', tempat: 'Gedung Madrasah Nurus Sholah' },
                  { waktu: 'Ba\'da Ashar (16:00 - 17:15)', kegiatan: 'Kajian Nahwu Sharaf & Baca Tulis Al-Qur\'an (BTQ)', tempat: 'Ruang Kelas Rombel' },
                  { waktu: 'Ba\'da Maghrib (18:30 - 19:30)', kegiatan: 'Murojaah Kubro & Pembinaan Kamar Asrama', tempat: 'Asrama Santri' }
                ].map((jdw, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {jdw.waktu}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">{jdw.kegiatan}</h5>
                    <p className="text-[11px] text-slate-400">Lokasi: {jdw.tempat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RIWAYAT MENGAJAR */}
          {activeTab === 'riwayat' && (
            <div className="space-y-3">
              <div className="text-slate-500">
                Riwayat dedikasi dan masa pengabdian mengajar di PP Nurus Sholah:
              </div>

              <div className="relative pl-4 border-l-2 border-emerald-600/40 space-y-4">
                <div className="space-y-1 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -left-[21px] top-1"></div>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Tahun Ajaran 2026/2027 (Aktif)
                  </span>
                  <h5 className="font-bold text-slate-800 text-xs">Pengampu Kitab, Wali Kelas & Dewan Asatidz</h5>
                  <p className="text-[11px] text-slate-500">
                    Mengampu {assignedSubjects.length} materi pengajian dan membina {homeroomRombels.length} rombel aktif.
                  </p>
                </div>

                <div className="space-y-1 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[21px] top-1"></div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Tahun Ajaran 2025/2026
                  </span>
                  <h5 className="font-bold text-slate-800 text-xs">Pengajar Kitabiyah Mubtadi' & Sorogan</h5>
                  <p className="text-[11px] text-slate-500">
                    Pengajar aktif kurikulum pondok pesantren salafiyah.
                  </p>
                </div>

                <div className="space-y-1 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[21px] top-1"></div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Tahun {teacher.tahun_mulai || '2020'}
                  </span>
                  <h5 className="font-bold text-slate-800 text-xs">Mulai Berkhidmah di PP Nurus Sholah</h5>
                  <p className="text-[11px] text-slate-500">
                    Amanah mengajar bidang keahlian {teacher.keahlian || teacher.bidang_studi || 'Kepesantrenan'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CATATAN */}
          {activeTab === 'catatan' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800">Catatan Khusus Ustadz / Guru</h4>
              <p className="text-slate-600 leading-relaxed">
                {teacher.catatan || 'Tidak ada catatan khusus yang dicatat dalam sistem.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-slate-400 text-[11px] font-mono">
            Dibuat: {new Date(teacher.created_at).toLocaleDateString('id-ID')}
          </span>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(teacher);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs cursor-pointer"
              >
                Ubah Biodata
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
