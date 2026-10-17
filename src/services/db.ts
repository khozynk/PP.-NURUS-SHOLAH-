import { 
  DatabaseSchema, 
  Student, 
  Alumni, 
  StudentHistory, 
  StudentGraduation,
  StudentTransfer,
  StudentWithdrawal,
  StudentDocument,
  SchoolClass, 
  Teacher, 
  PesantrenSettings, 
  AuditLog, 
  User, 
  RoleDefinition, 
  Permission,
  StudentStatus,
  UserRole,
  EducationProgram,
  EducationTrack,
  EducationLevel,
  AcademicYear,
  Rombel,
  StudentEducationHistory,
  HomeroomHistory,
  DormBuilding,
  DormRoom,
  StudentRoomHistory,
  Subject,
  TeacherSubjectAssignment,
  AcademicPeriod,
  Schedule,
  GradeComponent,
  StudentGrade,
  TahfidzRecord,
  TahfidzTarget,
  TahfidzAuditLog,
  MurojaahRecord,
  BTQRecord,
  AttendanceRecord,
  StudentReport,
  IncomingLetter,
  OutgoingLetter,
  StudentLetter,
  LetterTemplate,
  LetterNumberConfig,
  DocumentArchive,
  FinancialCategory,
  FinancialTransaction,
  ExpenseRequest,
  ExpenseApproval,
  PondokBudget,
  PondokActivity,
  ActivityParticipant,
  ActivityBudget,
  ActivityLPJ,
  PondokMeeting,
  MeetingParticipant,
  MeetingAgenda,
  MeetingMinute,
  MeetingDecision,
  MeetingFollowup,
  MeetingResult,
  MeetingReport,
  MeetingMonthlyEvaluation,
  MeetingMonthlyPlan,
  MeetingTemplate,
  MeetingAttachment,
  OperationalNotification
} from '../types/database';

import { hashPassword, verifyPassword } from './crypto';

const DB_STORAGE_KEY = 'PP_NURUS_SHOLAH_DATA_V1';

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function calculateAge(birthDateStr: string): { years: number; months: number; text: string } {
  if (!birthDateStr) return { years: 0, months: 0, text: '-' };
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return { years: 0, months: 0, text: '-' };
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return { years: 0, months: 0, text: '0 Tahun' };
  const text = months > 0 ? `${years} Tahun ${months} Bulan` : `${years} Tahun`;
  return { years, months, text };
}

export function calculateStudyDuration(
  tahunMasuk?: number | string,
  tanggalMasuk?: string,
  tahunLulus?: number | string,
  tanggalLulus?: string
): { years: number; months: number; text: string } {
  // If full dates are available, calculate accurately
  if (tanggalMasuk && tanggalLulus) {
    const start = new Date(tanggalMasuk);
    const end = new Date(tanggalLulus);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      if (end.getDate() < start.getDate()) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years === 0 && months === 0) return { years: 0, months: 0, text: 'Kurang dari 1 Bulan' };
      const text = months > 0 
        ? (years > 0 ? `${years} Tahun ${months} Bulan` : `${months} Bulan`) 
        : `${years} Tahun`;
      return { years, months, text };
    }
  }

  // Fallback to year difference
  const yIn = Number(tahunMasuk);
  const yOut = Number(tahunLulus);
  if (!isNaN(yIn) && !isNaN(yOut) && yOut >= yIn) {
    const diff = yOut - yIn;
    return { years: diff, months: 0, text: diff === 0 ? '1 Tahun' : `${diff} Tahun` };
  }

  return { years: 0, months: 0, text: '-' };
}

const DEFAULT_SETTINGS: PesantrenSettings = {
  id: 'pesantren_profile',
  nama_pesantren: 'Pondok Pesantren Nurus Sholah',
  nama_singkat: 'PP Nurus Sholah',
  logo: '/src/assets/images/pesantren_logo_emblem_1791353751288.jpg',
  alamat: 'Jl. Pesantren Batulabang, Desa Akkor',
  dusun: 'Batulabang',
  desa: 'Akkor',
  kecamatan: 'Palengaan',
  kabupaten: 'Pamekasan',
  provinsi: 'Jawa Timur',
  kode_pos: '69362',
  telepon: '+62 823-3456-7890',
  email: 'info@nurusholah.id',
  website: 'https://nurusholah.id',
  google_maps: 'https://maps.google.com/?q=PP+Nurus+Sholah+Batulabang+Akkor',
  nama_pimpinan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
  nama_pengasuh: 'KH. Muhammad Syamsul Arifin, S.Ag.',
  kepala_pendidikan: 'Ust. Ahmad Baihaqi, M.Pd.',
  nip_kepala_pendidikan: 'NIP. 19850312 201101 1 004',
  kepala_tu: 'Ust. Moh. Kholilur Rahman, S.Kom.',
  nip_kepala_tu: 'Sekretaris Jenderal Pesantren',
  warna_utama: '#047857', // Emerald
  warna_sekunder: '#D97706', // Amber gold
  tema: 'emerald',
  kop_surat: 'PONDOK PESANTREN NURUS SHOLAH\nBATULABANG AKKOR PALENGAAN PAMEKASAN\nSekretariat: Jl. Pesantren Batulabang, Desa Akkor, Kec. Palengaan, Kab. Pamekasan 69362',
  format_nis: 'NS-[TAHUN]-[URUT4]',
  format_id_alumni: 'ALM-[TAHUN]-[URUT4]',
  program_options: [
    'Tahfidz Murni',
    'Tahfidz + Umum',
    'Pesantren Modern',
    'Reguler Salaf & Kitab',
    'Madrasah Diniyah Takmiliyah'
  ],
  asrama_options: [
    'Asrama Al-Ghazali (Putra)',
    'Asrama Ibnu Sina (Putra)',
    'Asrama Khadijah (Putri)',
    'Asrama Aisyah (Putri)',
    'Non-Asrama / Santri Kalong'
  ],
  meeting_types: [
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
  ],
  document_types: [
    'Kartu Keluarga (KK)',
    'Akta Kelahiran',
    'Ijazah Terakhir',
    'KTP Orang Tua / Wali',
    'Pas Foto 3x4',
    'Surat Pernyataan Santri',
    'Surat Keterangan Sehat',
    'Kartu NISN / KIP',
    'Dokumen Lainnya'
  ],
  slogan_berjalan: '✨ Selamat Datang di Sistem Informasi PP Nurus Sholah Batulabang Akkor · Menempa Generasi Santri Berakhlaqul Karimah, Unggul dalam Tahfidz Al-Qur\'an dan Kitab Kuning · Menuntut Ilmu adalah Ibadah, Mengamalkannya adalah Berkah',
  slogan_aktif: true,
  slogan_kecepatan: 'sedang',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEFAULT_PROGRAMS: EducationProgram[] = [
  {
    id: 'prog-tahfidz',
    code: 'TAHFIDZ',
    name: "Tahfidz Al-Qur'an",
    description: "Program unggulan tahfidz Al-Qur'an 30 Juz bersanad, tartil, dan mutqin",
    type: 'Tahfidz',
    duration: 'Target 30 Juz',
    status: 'aktif',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prog-kitabiyah',
    code: 'KITABIYAH',
    name: 'Kitabiyah',
    description: 'Program pengkajian kitab kuning salafiyah sistem berjenjang Safinatun Najah dan Iktisyaf',
    type: 'Kitabiyah',
    duration: '3 Tahun Jenjang Berkelanjutan',
    status: 'aktif',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prog-btq',
    code: 'BTQ',
    name: "Baca Tulis Al-Qur'an",
    description: "Program intensif pembinaan makharijul huruf, kaidah tajwid, dan kelancaran membaca Al-Qur'an",
    type: 'BTQ',
    duration: '1 Tahun',
    status: 'aktif',
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_TRACKS: EducationTrack[] = [
  {
    id: 'track-safinah',
    program_id: 'prog-kitabiyah',
    code: 'SAFINAH',
    name: 'Safinatun Najah',
    description: 'Kurikulum kajian fiqih dan aqidah berpusat pada pemahaman Matan Safinatun Najah',
    status: 'aktif',
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'track-iktisyaf',
    program_id: 'prog-kitabiyah',
    code: 'IKTISYAF',
    name: 'Iktisyaf',
    description: 'Kurikulum metodologi cepat membaca dan memahami gramatika bahasa Arab (Nahwu Shorof)',
    status: 'aktif',
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_LEVELS: EducationLevel[] = [
  // Safinatun Najah: Mubtadi', Mutawassith, Mutaqoddim
  {
    id: 'lvl-mubtadi',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    code: 'MUBTADI',
    name: "Mubtadi'",
    description: "Tingkat pemula pengenalan kaidah dasar fiqih ibadah dan lafadz kitab",
    level_order: 1,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lvl-mutawassith',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    code: 'MUTAWASSITH',
    name: 'Mutawassith',
    description: 'Tingkat menengah penguasaan rukun sholat, zakat, puasa, dan syarat sah',
    level_order: 2,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lvl-mutaqoddim',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    code: 'MUTAQODDIM',
    name: 'Mutaqoddim',
    description: 'Tingkat lanjutan pendalaman dalil fiqih dan perbandingan madzhab dasar',
    level_order: 3,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Iktisyaf: Juz 1, Juz 2, Al-Kasyaf
  {
    id: 'lvl-juz1',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    code: 'JUZ_1',
    name: 'Juz 1',
    description: "Dasar pembedaan isim, fiil, huruf dan i'rab rafa', nashab, jer, jazm",
    level_order: 1,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lvl-juz2',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    code: 'JUZ_2',
    name: 'Juz 2',
    description: "Penyusunan tarkib, na'at man'ut, mudhaf ilaih, dan struktur kalimat",
    level_order: 2,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lvl-alkasyaf',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    code: 'AL_KASYAF',
    name: 'Al-Kasyaf',
    description: 'Tingkat puncak penguasaan membaca kitab kuning gundul tanpa harakat',
    level_order: 3,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Tahfidz
  {
    id: 'lvl-tahfidz-utama',
    program_id: 'prog-tahfidz',
    track_id: null,
    code: 'TAHFIDZ',
    name: "Tahfidz Al-Qur'an",
    description: "Halaqah intensif setoran ziyadah dan murojaah harian 30 Juz",
    level_order: 1,
    duration: 'Target 30 Juz',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // BTQ
  {
    id: 'lvl-btq-dasar',
    program_id: 'prog-btq',
    track_id: null,
    code: 'BTQ',
    name: 'BTQ',
    description: "Standarisasi bacaan Al-Qur'an tartil dan pengenalan tajwid aplikatif",
    level_order: 1,
    duration: '1 Tahun',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: 'ay-2026-2027',
    nama_tahun_ajaran: '2026/2027',
    tanggal_mulai: '2026-07-15',
    tanggal_selesai: '2027-06-20',
    status: 'aktif',
    keterangan: 'Tahun Ajaran Berjalan 2026/2027 PP Nurus Sholah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ay-2025-2026',
    nama_tahun_ajaran: '2025/2026',
    tanggal_mulai: '2025-07-15',
    tanggal_selesai: '2026-06-20',
    status: 'nonaktif',
    keterangan: 'Tahun Ajaran Sebelumnya (Arsip Riwayat)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'tchr-01',
    nip: '198501102010011002',
    nama_lengkap: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
    nama_panggilan: 'Ust. Baihaqi',
    gelar: 'Lc., M.Hum.',
    foto: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Pamekasan',
    tanggal_lahir: '1985-01-10',
    alamat: 'Dusun Timur, Desa Akkor, Palengaan, Pamekasan',
    nomor_hp: '081234567891',
    email: 'baihaqi@nurusholah.id',
    pendidikan_terakhir: 'S2 Humaniora Islam - UIN Sunan Kalijaga',
    keahlian: 'Nahwu, Shorof & Balaghah',
    jabatan: 'Kepala Bagian Pendidikan & Wali Kelas',
    bidang_studi: 'Nahwu & Shorof',
    status: 'aktif',
    tahun_mulai: 2010,
    catatan: 'Dewan asatidz pengampu kurikulum Iktisyaf dan kajian Safinah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tchr-02',
    nip: '198804152012011005',
    nama_lengkap: 'Ust. M. Cholilur Rahman, S.Pd.I.',
    nama_panggilan: 'Ust. Cholil',
    gelar: 'S.Pd.I.',
    foto: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Sampang',
    tanggal_lahir: '1988-04-15',
    alamat: 'Jl. Raya Camplong No. 18, Sampang',
    nomor_hp: '081234567892',
    email: 'cholil@nurusholah.id',
    pendidikan_terakhir: 'S1 Pendidikan Agama Islam - STAIN Pamekasan',
    keahlian: "Fiqih Syafi'i & Fathul Qorib",
    jabatan: 'Wali Kelas Mutawassith & Pembimbing Kitabiyah',
    bidang_studi: 'Fiqih & Fathul Qorib',
    status: 'aktif',
    tahun_mulai: 2012,
    catatan: 'Pengajar kajian Safinatun Najah dan Fathul Qorib Mujib',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tchr-03',
    nip: '199207202015022003',
    nama_lengkap: 'Ustz. Siti Fatimah, S.Ag., M.Ag.',
    nama_panggilan: 'Ustz. Fatimah',
    gelar: 'S.Ag., M.Ag.',
    foto: '',
    jenis_kelamin: 'P',
    tempat_lahir: 'Pamekasan',
    tanggal_lahir: '1992-07-20',
    alamat: 'Dusun Batulabang, Desa Akkor, Palengaan',
    nomor_hp: '081234567893',
    email: 'fatimah@nurusholah.id',
    pendidikan_terakhir: "S2 Ilmu Al-Qur'an & Tafsir - UIN Sunan Ampel",
    keahlian: "Tahfidz Al-Qur'an 30 Juz Bersanad, Qiroah Sab'ah",
    jabatan: 'Koordinator Tahfidz Putri & Pembimbing Asrama',
    bidang_studi: "Tahfidz Al-Qur'an",
    status: 'aktif',
    tahun_mulai: 2015,
    catatan: 'Hafidzah 30 Juz mutqin sanad riwayat Imam Ashim dari Hafsh',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tchr-04',
    nip: '199003122018011004',
    nama_lengkap: 'Ust. Abdullah Sajjad, S.Pd.',
    nama_panggilan: 'Ust. Sajjad',
    gelar: 'S.Pd.',
    foto: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Sumenep',
    tanggal_lahir: '1990-03-12',
    alamat: 'Kompleks Pesantren Nurus Sholah, Akkor',
    nomor_hp: '081234567894',
    email: 'sajjad@nurusholah.id',
    pendidikan_terakhir: 'S1 Pendidikan Bahasa Arab',
    keahlian: "Tahfidz Al-Qur'an & Tajwid Praktis",
    jabatan: 'Pembina Tahfidz Putra & Wali Kelas Mutaqoddim',
    bidang_studi: "Tahfidz Al-Qur'an",
    status: 'aktif',
    tahun_mulai: 2018,
    catatan: 'Pembina asrama putra Al-Ghazali dan halaqah tahfidz',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tchr-05',
    nip: '199408252020021008',
    nama_lengkap: 'Ust. Mahrus Ali, S.Sos.I.',
    nama_panggilan: 'Ust. Mahrus',
    gelar: 'S.Sos.I.',
    foto: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Pamekasan',
    tanggal_lahir: '1994-08-25',
    alamat: 'Dusun Barat, Desa Banyupelle, Palengaan',
    nomor_hp: '081234567895',
    email: 'mahrus@nurusholah.id',
    pendidikan_terakhir: 'S1 Komunikasi dan Penyiaran Islam',
    keahlian: 'BTQ, Tilawah & Makharijul Huruf',
    jabatan: 'Koordinator BTQ & Pengajar Iktisyaf Juz 1',
    bidang_studi: "Baca Tulis Al-Qur'an",
    status: 'aktif',
    tahun_mulai: 2020,
    catatan: "Pengajar tartil Al-Qur'an dan dasar-dasar kitab Iktisyaf",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_CLASSES: SchoolClass[] = [
  {
    id: 'cls-mubtadi',
    nama_kelas: "Safinatun Najah - Mubtadi'",
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    level_id: 'lvl-mubtadi',
    academic_year_id: 'ay-2026-2027',
    tingkat: "Mubtadi'",
    wali_kelas_id: 'tchr-01',
    wali_kelas_nama: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
    tahun_ajaran: '2026/2027',
    kapasitas: 60,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-mutawassith',
    nama_kelas: 'Safinatun Najah - Mutawassith',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    level_id: 'lvl-mutawassith',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Mutawassith',
    wali_kelas_id: 'tchr-02',
    wali_kelas_nama: 'Ust. M. Cholilur Rahman, S.Pd.I.',
    tahun_ajaran: '2026/2027',
    kapasitas: 35,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-mutaqoddim',
    nama_kelas: 'Safinatun Najah - Mutaqoddim',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    level_id: 'lvl-mutaqoddim',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Mutaqoddim',
    wali_kelas_id: 'tchr-04',
    wali_kelas_nama: 'Ust. Abdullah Sajjad, S.Pd.',
    tahun_ajaran: '2026/2027',
    kapasitas: 35,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-juz1',
    nama_kelas: 'Iktisyaf - Juz 1',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    level_id: 'lvl-juz1',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Juz 1',
    wali_kelas_id: 'tchr-05',
    wali_kelas_nama: 'Ust. Mahrus Ali, S.Sos.I.',
    tahun_ajaran: '2026/2027',
    kapasitas: 60,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-juz2',
    nama_kelas: 'Iktisyaf - Juz 2',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    level_id: 'lvl-juz2',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Juz 2',
    wali_kelas_id: 'tchr-01',
    wali_kelas_nama: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
    tahun_ajaran: '2026/2027',
    kapasitas: 35,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-alkasyaf',
    nama_kelas: 'Iktisyaf - Al-Kasyaf',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    level_id: 'lvl-alkasyaf',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Al-Kasyaf',
    wali_kelas_id: 'tchr-02',
    wali_kelas_nama: 'Ust. M. Cholilur Rahman, S.Pd.I.',
    tahun_ajaran: '2026/2027',
    kapasitas: 30,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-tahfidz',
    nama_kelas: "Tahfidz Al-Qur'an",
    program_id: 'prog-tahfidz',
    track_id: null,
    level_id: 'lvl-tahfidz-utama',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'Tahfidz',
    wali_kelas_id: 'tchr-03',
    wali_kelas_nama: 'Ustz. Siti Fatimah, S.Ag., M.Ag.',
    tahun_ajaran: '2026/2027',
    kapasitas: 40,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cls-btq',
    nama_kelas: 'Kelas BTQ',
    program_id: 'prog-btq',
    track_id: null,
    level_id: 'lvl-btq-dasar',
    academic_year_id: 'ay-2026-2027',
    tingkat: 'BTQ',
    wali_kelas_id: 'tchr-05',
    wali_kelas_nama: 'Ust. Mahrus Ali, S.Sos.I.',
    tahun_ajaran: '2026/2027',
    kapasitas: 35,
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_ROMBELS: Rombel[] = [
  // Mubtadi' Rombel A & B
  {
    id: 'rombel-mubtadi-a',
    class_id: 'cls-mubtadi',
    academic_year_id: 'ay-2026-2027',
    name: "Rombel A (Mubtadi' Putra)",
    code: 'MUB-A',
    capacity: 30,
    homeroom_teacher_id: 'tchr-01',
    mentor_id: 'tchr-04',
    status: 'aktif',
    notes: 'Rombongan belajar putra pemula Safinatun Najah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rombel-mubtadi-b',
    class_id: 'cls-mubtadi',
    academic_year_id: 'ay-2026-2027',
    name: "Rombel B (Mubtadi' Putri)",
    code: 'MUB-B',
    capacity: 30,
    homeroom_teacher_id: 'tchr-03',
    mentor_id: 'tchr-03',
    status: 'aktif',
    notes: 'Rombongan belajar putri pemula Safinatun Najah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Mutawassith Rombel A
  {
    id: 'rombel-mutawassith-a',
    class_id: 'cls-mutawassith',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel A (Mutawassith)',
    code: 'MUT-A',
    capacity: 35,
    homeroom_teacher_id: 'tchr-02',
    mentor_id: 'tchr-01',
    status: 'aktif',
    notes: 'Rombongan belajar tingkat madya Safinatun Najah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Mutaqoddim Rombel A
  {
    id: 'rombel-mutaqoddim-a',
    class_id: 'cls-mutaqoddim',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel A (Mutaqoddim)',
    code: 'MTQ-A',
    capacity: 35,
    homeroom_teacher_id: 'tchr-04',
    mentor_id: 'tchr-02',
    status: 'aktif',
    notes: 'Rombongan belajar tingkat mahir Safinatun Najah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Iktisyaf Juz 1 Rombel A & B
  {
    id: 'rombel-juz1-a',
    class_id: 'cls-juz1',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel A (Juz 1 Putra)',
    code: 'JUZ1-A',
    capacity: 30,
    homeroom_teacher_id: 'tchr-05',
    mentor_id: 'tchr-01',
    status: 'aktif',
    notes: 'Rombel dasar gramatika Iktisyaf putra',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rombel-juz1-b',
    class_id: 'cls-juz1',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel B (Juz 1 Putri)',
    code: 'JUZ1-B',
    capacity: 30,
    homeroom_teacher_id: 'tchr-03',
    mentor_id: 'tchr-03',
    status: 'aktif',
    notes: 'Rombel dasar gramatika Iktisyaf putri',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Iktisyaf Juz 2
  {
    id: 'rombel-juz2-a',
    class_id: 'cls-juz2',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel A (Juz 2)',
    code: 'JUZ2-A',
    capacity: 35,
    homeroom_teacher_id: 'tchr-01',
    mentor_id: 'tchr-05',
    status: 'aktif',
    notes: 'Rombel lanjutan gramatika Iktisyaf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Iktisyaf Al-Kasyaf
  {
    id: 'rombel-alkasyaf-a',
    class_id: 'cls-alkasyaf',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel A (Al-Kasyaf)',
    code: 'KAS-A',
    capacity: 30,
    homeroom_teacher_id: 'tchr-02',
    mentor_id: 'tchr-04',
    status: 'aktif',
    notes: 'Rombel baca kitab mandiri Al-Kasyaf',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Tahfidz Halaqah 1 & 2
  {
    id: 'rombel-tahfidz-a',
    class_id: 'cls-tahfidz',
    academic_year_id: 'ay-2026-2027',
    name: 'Halaqah 1 (Tahfidz Putra)',
    code: 'THF-A',
    capacity: 20,
    homeroom_teacher_id: 'tchr-04',
    mentor_id: 'tchr-01',
    status: 'aktif',
    notes: 'Kelompok halaqah setoran tahfidz putra',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rombel-tahfidz-b',
    class_id: 'cls-tahfidz',
    academic_year_id: 'ay-2026-2027',
    name: 'Halaqah 2 (Tahfidz Putri)',
    code: 'THF-B',
    capacity: 20,
    homeroom_teacher_id: 'tchr-03',
    mentor_id: 'tchr-03',
    status: 'aktif',
    notes: 'Kelompok halaqah setoran tahfidz putri',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // BTQ
  {
    id: 'rombel-btq-a',
    class_id: 'cls-btq',
    academic_year_id: 'ay-2026-2027',
    name: 'Rombel BTQ Dasar',
    code: 'BTQ-A',
    capacity: 35,
    homeroom_teacher_id: 'tchr-05',
    mentor_id: 'tchr-02',
    status: 'aktif',
    notes: "Kelompok bimbingan baca tulis Al-Qur'an",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_DORM_BUILDINGS: DormBuilding[] = [
  {
    id: 'bld-01',
    nama: 'Gedung Al-Ghazali (Putra 1)',
    kode: 'G-01',
    gender: 'putra',
    jumlah_lantai: 2,
    keterangan: 'Kompleks asrama santri putra barat, 2 lantai',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bld-02',
    nama: 'Gedung Ibnu Sina (Putra 2)',
    kode: 'G-02',
    gender: 'putra',
    jumlah_lantai: 2,
    keterangan: 'Kompleks asrama santri putra timur, 2 lantai',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bld-03',
    nama: 'Gedung Siti Khadijah (Putri 1)',
    kode: 'G-03',
    gender: 'putri',
    jumlah_lantai: 2,
    keterangan: 'Kompleks asrama santri putri, 2 lantai terpisah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_DORM_ROOMS: DormRoom[] = [
  {
    id: 'room-01',
    building_id: 'bld-01',
    nama_kamar: 'Kamar 01 - Abu Bakar',
    kode_kamar: 'K-01',
    lantai: 1,
    kapasitas: 15,
    gender: 'putra',
    mentor_id: 'tchr-01',
    status: 'tersedia',
    notes: 'Lantai 1 sayap barat Gedung Al-Ghazali',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'room-02',
    building_id: 'bld-01',
    nama_kamar: 'Kamar 02 - Umar bin Khattab',
    kode_kamar: 'K-02',
    lantai: 1,
    kapasitas: 15,
    gender: 'putra',
    mentor_id: 'tchr-04',
    status: 'tersedia',
    notes: 'Lantai 1 sayap tengah Gedung Al-Ghazali',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'room-03',
    building_id: 'bld-01',
    nama_kamar: 'Kamar 03 - Utsman bin Affan',
    kode_kamar: 'K-03',
    lantai: 2,
    kapasitas: 12,
    gender: 'putra',
    mentor_id: 'tchr-02',
    status: 'tersedia',
    notes: 'Lantai 2 sayap barat Gedung Al-Ghazali',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'room-04',
    building_id: 'bld-01',
    nama_kamar: 'Kamar 04 - Ali bin Abi Thalib',
    kode_kamar: 'K-04',
    lantai: 2,
    kapasitas: 12,
    gender: 'putra',
    mentor_id: 'tchr-05',
    status: 'tersedia',
    notes: 'Lantai 2 sayap timur Gedung Al-Ghazali',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'room-05',
    building_id: 'bld-03',
    nama_kamar: 'Kamar Khadijah 01',
    kode_kamar: 'KHD-01',
    lantai: 1,
    kapasitas: 16,
    gender: 'putri',
    mentor_id: 'tchr-03',
    status: 'tersedia',
    notes: 'Lantai 1 asrama putri utama',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'room-06',
    building_id: 'bld-03',
    nama_kamar: 'Kamar Aisyah 02',
    kode_kamar: 'ASY-02',
    lantai: 1,
    kapasitas: 16,
    gender: 'putri',
    mentor_id: 'tchr-03',
    status: 'tersedia',
    notes: 'Lantai 1 asrama putri sayap timur',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sbj-01',
    nama: 'Kitab Safinatun Najah',
    kode: 'SFN',
    program_id: 'prog-kitabiyah',
    track_id: 'track-safinah',
    level_id: 'lvl-mubtadi',
    jenis: 'Kitab',
    deskripsi: 'Fikih dasar ibadah mahdhah, rukun iman, dan rukun islam',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-02',
    nama: 'Iktisyaf Nahwu Juz 1',
    kode: 'IKT-1',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    level_id: 'lvl-juz1',
    jenis: 'Kitab',
    deskripsi: "Penguasaan kalimah isim, fiil, huruf dan harakat tanda i'rab",
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-03',
    nama: 'Iktisyaf Nahwu Juz 2',
    kode: 'IKT-2',
    program_id: 'prog-kitabiyah',
    track_id: 'track-iktisyaf',
    level_id: 'lvl-juz2',
    jenis: 'Kitab',
    deskripsi: "Tarkib kalimat, na'at, athaf, dan kedudukan kalimat majemuk",
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-04',
    nama: 'Tahsin & Makharijul Huruf',
    kode: 'BTQ-01',
    program_id: 'prog-btq',
    level_id: 'lvl-btq-dasar',
    jenis: 'BTQ',
    deskripsi: 'Artikulasi tempat keluarnya huruf hijaiyah dan sifatul huruf',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-05',
    nama: 'Tajwid Praktis & Kaidah Waqaf',
    kode: 'BTQ-02',
    program_id: 'prog-btq',
    level_id: 'lvl-btq-dasar',
    jenis: 'BTQ',
    deskripsi: 'Kaidah hukum nun sukun, mim sukun, idgham, dan mad praktis',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-06',
    nama: 'Ziyadah Setoran Hafalan',
    kode: 'THF-01',
    program_id: 'prog-tahfidz',
    level_id: 'lvl-tahfidz-utama',
    jenis: 'Tahfidz',
    deskripsi: 'Setoran hafalan baru per pertemuan minimal 1 halaman tartil',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-07',
    nama: 'Murojaah Kubro & Shughro',
    kode: 'THF-02',
    program_id: 'prog-tahfidz',
    level_id: 'lvl-tahfidz-utama',
    jenis: 'Murojaah',
    deskripsi: 'Pengulangan juz lama bersama ustadz pembimbing halaqah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sbj-08',
    nama: 'Akhlak Lil Banin & Banat',
    kode: 'AKH-01',
    program_id: 'prog-kitabiyah',
    jenis: 'Akhlak',
    deskripsi: 'Pendidikan adab santri kepada kiai, guru, orang tua dan sesama',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_TEACHER_SUBJECTS: TeacherSubjectAssignment[] = [
  { id: 'ts-01', teacher_id: 'tchr-01', subject_id: 'sbj-01', rombel_id: 'rombel-mubtadi-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-02', teacher_id: 'tchr-02', subject_id: 'sbj-01', rombel_id: 'rombel-mutawassith-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-03', teacher_id: 'tchr-05', subject_id: 'sbj-02', rombel_id: 'rombel-juz1-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-04', teacher_id: 'tchr-01', subject_id: 'sbj-03', rombel_id: 'rombel-juz2-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-05', teacher_id: 'tchr-03', subject_id: 'sbj-06', rombel_id: 'rombel-tahfidz-b', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-06', teacher_id: 'tchr-04', subject_id: 'sbj-06', rombel_id: 'rombel-tahfidz-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() },
  { id: 'ts-07', teacher_id: 'tchr-05', subject_id: 'sbj-04', rombel_id: 'rombel-btq-a', academic_year_id: 'ay-2026-2027', created_at: new Date().toISOString() }
];

export const DEFAULT_ACADEMIC_PERIODS: AcademicPeriod[] = [
  {
    id: 'period-2026-1',
    academic_year_id: 'ay-2026-2027',
    name: 'Semester 1 (Ganjil) 2026/2027',
    semester: 'Semester 1',
    start_date: '2026-07-15',
    end_date: '2026-12-20',
    status: 'aktif',
    notes: 'Semester Ganjil Tahun Ajaran 2026/2027 Aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'period-2026-2',
    academic_year_id: 'ay-2026-2027',
    name: 'Semester 2 (Genap) 2026/2027',
    semester: 'Semester 2',
    start_date: '2027-01-10',
    end_date: '2027-06-20',
    status: 'nonaktif',
    notes: 'Semester Genap Mendatang',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_GRADE_COMPONENTS: GradeComponent[] = [
  { id: 'cmp-harian', code: 'HRN', name: 'Harian / Keaktifan', weight: 20, category: 'umum', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-tugas', code: 'TGS', name: 'Tugas & Sorogan', weight: 20, category: 'umum', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-praktik', code: 'PRK', name: 'Praktik / Bacaan', weight: 20, category: 'umum', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-ujian', code: 'UJN', name: 'Ujian Akhir Semester', weight: 40, category: 'umum', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'cmp-ktb-pemahaman', code: 'KTB-PHM', name: 'Pemahaman Materi', weight: 20, category: 'kitabiyah', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-ktb-hafalan', code: 'KTB-HFL', name: 'Hafalan Matan', weight: 20, category: 'kitabiyah', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-ktb-bacaan', code: 'KTB-BCA', name: 'Bacaan Kitab', weight: 20, category: 'kitabiyah', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-ktb-adab', code: 'KTB-ADB', name: 'Adab & Keaktifan', weight: 10, category: 'kitabiyah', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cmp-ktb-ujian', code: 'KTB-UJN', name: 'Ujian Kitabiyah', weight: 30, category: 'kitabiyah', status: 'aktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'sch-01',
    hari: 'Senin',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    subject_id: 'sbj-06',
    program_id: 'prog-tahfidz',
    level_id: 'lvl-tahfidz-utama',
    rombel_id: 'rombel-tahfidz-a',
    teacher_id: 'tchr-04',
    ruangan: 'Halaqah Utama Asrama Putra',
    academic_year_id: 'ay-2026-2027',
    period_id: 'period-2026-1',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sch-02',
    hari: 'Senin',
    jam_mulai: '08:30',
    jam_selesai: '10:00',
    subject_id: 'sbj-01',
    program_id: 'prog-kitabiyah',
    level_id: 'lvl-mubtadi',
    rombel_id: 'rombel-mubtadi-a',
    teacher_id: 'tchr-01',
    ruangan: 'Ruang Kelas Mubtadi A',
    academic_year_id: 'ay-2026-2027',
    period_id: 'period-2026-1',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sch-03',
    hari: 'Selasa',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    subject_id: 'sbj-02',
    program_id: 'prog-kitabiyah',
    level_id: 'lvl-juz1',
    rombel_id: 'rombel-juz1-a',
    teacher_id: 'tchr-05',
    ruangan: 'Ruang Kelas Iktisyaf 1',
    academic_year_id: 'ay-2026-2027',
    period_id: 'period-2026-1',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sch-04',
    hari: 'Rabu',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    subject_id: 'sbj-04',
    program_id: 'prog-btq',
    level_id: 'lvl-btq-dasar',
    rombel_id: 'rombel-btq-a',
    teacher_id: 'tchr-05',
    ruangan: 'Musholla As-Salam',
    academic_year_id: 'ay-2026-2027',
    period_id: 'period-2026-1',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_TAHFIDZ_RECORDS: TahfidzRecord[] = [
  {
    id: 'thf-01',
    student_id: 'santri-001',
    teacher_id: 'tchr-04',
    tanggal: '2026-09-10',
    period_id: 'period-2026-1',
    juz: 3,
    surah: 'Al-Baqarah',
    ayat_mulai: 253,
    ayat_selesai: 286,
    halaman_mulai: 42,
    halaman_selesai: 49,
    jenis_setoran: 'Hafalan Baru',
    nilai: 92,
    kualitas: 'Sangat Baik',
    catatan: 'Makhraj huruf lancar, mad dan ghunnah mutqin.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'thf-02',
    student_id: 'santri-001',
    teacher_id: 'tchr-04',
    tanggal: '2026-09-08',
    period_id: 'period-2026-1',
    juz: 2,
    surah: 'Al-Baqarah',
    ayat_mulai: 142,
    ayat_selesai: 252,
    halaman_mulai: 22,
    halaman_selesai: 41,
    jenis_setoran: 'Murojaah',
    nilai: 88,
    kualitas: 'Baik',
    catatan: 'Lancar, perhatikan waqaf di ayat mutasyabihat.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'thf-03',
    student_id: 'santri-002',
    teacher_id: 'tchr-03',
    tanggal: '2026-09-09',
    period_id: 'period-2026-1',
    juz: 5,
    surah: 'An-Nisa',
    ayat_mulai: 24,
    ayat_selesai: 147,
    halaman_mulai: 82,
    halaman_selesai: 101,
    jenis_setoran: 'Tasmi\'',
    nilai: 95,
    kualitas: 'Sangat Baik',
    catatan: 'Tasmi 1 Juz sekali duduk tanpa salah.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_TAHFIDZ_TARGETS: TahfidzTarget[] = [
  {
    id: 'tgt-01',
    student_id: 'santri-001',
    target_juz: 5,
    target_surah: 'An-Nisa',
    target_ayat: '1-176',
    target_halaman: 106,
    period_id: 'period-2026-1',
    tanggal_mulai: '2026-07-15',
    target_selesai: '2026-12-20',
    status: 'Berjalan',
    notes: 'Target Semester 1: Penguatan Juz 1 s/d 5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tgt-02',
    student_id: 'santri-002',
    target_juz: 10,
    target_surah: 'At-Taubah',
    target_ayat: '1-129',
    target_halaman: 207,
    period_id: 'period-2026-1',
    tanggal_mulai: '2026-07-15',
    target_selesai: '2026-12-20',
    status: 'Berjalan',
    notes: 'Target Khusus Program Murni Tahfidz',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MUROJAAH_RECORDS: MurojaahRecord[] = [
  {
    id: 'mrj-01',
    student_id: 'santri-001',
    teacher_id: 'tchr-04',
    tanggal: '2026-09-09',
    period_id: 'period-2026-1',
    juz: 1,
    surah: 'Al-Baqarah',
    ayat: '1-141',
    halaman: 21,
    jenis_murojaah: 'Murojaah Harian',
    hasil: 'Lancar',
    nilai: 90,
    catatan: 'Murojaah harian juz 1 lancar jaya.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mrj-02',
    student_id: 'santri-001',
    teacher_id: 'tchr-04',
    tanggal: '2026-09-07',
    period_id: 'period-2026-1',
    juz: 2,
    surah: 'Al-Baqarah',
    ayat: '142-252',
    halaman: 20,
    jenis_murojaah: 'Murojaah Mingguan',
    hasil: 'Cukup Lancar',
    nilai: 80,
    catatan: 'Perlu pengulangan di halaman 35-38.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_BTQ_RECORDS: BTQRecord[] = [
  {
    id: 'btq-rec-01',
    student_id: 'santri-003',
    teacher_id: 'tchr-05',
    period_id: 'period-2026-1',
    tanggal: '2026-09-05',
    makharijul_huruf: 85,
    tajwid: 80,
    kelancaran: 88,
    fasahah: 82,
    membaca_alquran: 86,
    menulis_arab: 78,
    hafalan_dasar: 84,
    praktik: 85,
    nilai_akhir: 84,
    level_kemampuan: 'Menengah',
    catatan: 'Kemampuan membaca tartil sangat berkembang, perbanyak latihan menulis Arab.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-01',
    student_id: 'santri-001',
    tanggal: '2026-09-09',
    period_id: 'period-2026-1',
    rombel_id: 'rombel-mubtadi-a',
    subject_id: 'sbj-01',
    teacher_id: 'tchr-01',
    status: 'Hadir',
    keterangan: 'Tepat waktu',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'att-02',
    student_id: 'santri-002',
    tanggal: '2026-09-09',
    period_id: 'period-2026-1',
    rombel_id: 'rombel-tahfidz-b',
    subject_id: 'sbj-06',
    teacher_id: 'tchr-03',
    status: 'Hadir',
    keterangan: 'Hadir halaqah',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'att-03',
    student_id: 'santri-003',
    tanggal: '2026-09-09',
    period_id: 'period-2026-1',
    rombel_id: 'rombel-btq-a',
    subject_id: 'sbj-04',
    teacher_id: 'tchr-05',
    status: 'Sakit',
    keterangan: 'Surat dokter dari poskestren',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_STUDENT_GRADES: StudentGrade[] = [
  {
    id: 'grd-01',
    student_id: 'santri-001',
    academic_year_id: 'ay-2026-2027',
    period_id: 'period-2026-1',
    program_id: 'prog-kitabiyah',
    level_id: 'lvl-mubtadi',
    rombel_id: 'rombel-mubtadi-a',
    subject_id: 'sbj-01',
    teacher_id: 'tchr-01',
    component_grades: {
      'cmp-harian': 88,
      'cmp-tugas': 85,
      'cmp-praktik': 90,
      'cmp-ujian': 86
    },
    final_grade: 87,
    predikat: 'Sangat Baik (A)',
    catatan: 'Penguasaan matan Safinatun Najah sangat baik.',
    updated_by: 'Ust. H. Ahmad Baihaqi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// --- STAGE 6 DEFAULT CONSTANTS ---

export const DEFAULT_LETTER_NUMBER_CONFIG: LetterNumberConfig = {
  id: 'cfg-letter-01',
  format_template: '{NOMOR}/{KODE}/{BULAN_ROMAWI}/{TAHUN}',
  kode_pondok: 'PPNS',
  counter_start: 1,
  current_counter: 15,
  pad_length: 3,
  reset_period: 'tahun',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEFAULT_LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'tpl-01',
    kode: 'SK-SANTRI',
    nama: 'Surat Keterangan Santri',
    jenis: 'Keterangan Santri',
    judul_surat: 'SURAT KETERANGAN SANTRI',
    body_template: `Yang bertanda tangan di bawah ini, Pengasuh Pondok Pesantren Nurus Sholah Batulabang Akkor dengan ini menerangkan bahwa:

Nama Lengkap : {{nama_santri}}
NIS / NISN   : {{nis}} / {{nisn}}
Tempat/Tgl Lahir : {{tempat_lahir}}, {{tanggal_lahir}}
Alamat       : {{alamat}}
Nama Orang Tua: {{nama_orang_tua}}

Adalah benar-benar terdaftar sebagai santri Pondok Pesantren Nurus Sholah pada Program {{program}}, Tingkat {{tingkat}}, Kelas {{kelas}}, Rombel {{rombel}} Tahun Ajaran {{tahun_ajaran}}.

Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.`,
    default_penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    default_jabatan: 'Pengasuh Pondok Pesantren Nurus Sholah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-02',
    kode: 'SK-AKTIF',
    nama: 'Surat Keterangan Aktif Santri',
    jenis: 'Keterangan Aktif',
    judul_surat: 'SURAT KETERANGAN AKTIF SEBAGAI SANTRI',
    body_template: `Pengasuh Pondok Pesantren Nurus Sholah Batulabang Akkor menerangkan dengan sesungguhnya bahwa:

Nama         : {{nama_santri}}
NIS          : {{nis}}
Program      : {{program}}
Tingkat / Kelas : {{tingkat}} / {{kelas}} ({{rombel}})
Tahun Ajaran : {{tahun_ajaran}}

Yang bersangkutan sampai saat ini AKTIF mengikuti seluruh kegiatan pendidikan, pengajian, dan keasramaan di Pondok Pesantren Nurus Sholah Batulabang Akkor serta berkelakuan baik dan mematuhi seluruh tata tertib pesantren.

Surat keterangan aktif ini diberikan untuk keperluan administrasi dan pencairan beasiswa/bantuan.`,
    default_penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    default_jabatan: 'Pengasuh Pondok Pesantren Nurus Sholah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-03',
    kode: 'SRT-IZIN',
    nama: 'Surat Izin Pulang / Kegiatan',
    jenis: 'Surat Izin',
    judul_surat: 'SURAT IZIN SANTRI',
    body_template: `Diberikan izin kepada santri di bawah ini:

Nama Santri : {{nama_santri}} (NIS: {{nis}})
Kelas/Rombel: {{kelas}} / {{rombel}}
Program     : {{program}}

Diberikan izin untuk: {{alasan}}
Tujuan      : {{tujuan}}
Berlaku Mulai: {{mulai}} s.d. {{selesai}}
Penjemput   : {{penjemput}}
Penanggung Jawab: {{penanggung_jawab}}

Catatan: Santri wajib kembali ke pondok tepat waktu sesuai jadwal izin dan melapor ke Keamanan Pondok.`,
    default_penandatangan: 'Ust. H. Ahmad Baihaqi, S.Pd.I.',
    default_jabatan: 'Kepala Pengurus Keamanan & Ketertiban',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-04',
    kode: 'SRT-PENGANTAR',
    nama: 'Surat Pengantar Resmi',
    jenis: 'Surat Pengantar',
    judul_surat: 'SURAT PENGANTAR',
    body_template: `Bersama surat ini, Pengurus Pondok Pesantren Nurus Sholah Batulabang Akkor mengantarkan/merekomendasikan santri:

Nama : {{nama_santri}} (NIS: {{nis}})
Program: {{program}}

Untuk keperluan pengurusan dokumen/pemeriksaan kesehatan/kegiatan di instansi tujuan. Mohon pihak terkait memberikan bantuan dan fasilitas seperlunya.`,
    default_penandatangan: 'Ust. Abdullah Sajjad, S.Pd.',
    default_jabatan: 'Sekretaris Pondok Pesantren',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-05',
    kode: 'SP-WALI',
    nama: 'Surat Panggilan Wali Santri',
    jenis: 'Surat Panggilan',
    judul_surat: 'SURAT PANGGILAN WALI SANTRI',
    body_template: `Kepada Yth.
Bapak/Ibu/Wali dari Santri: {{nama_santri}} (NIS: {{nis}})

Assalamu'alaikum Wr. Wb.
Mengharap kehadiran Bapak/Ibu/Wali Santri pada:
Hari/Tanggal : {{tanggal_pertemuan}}
Waktu        : {{waktu_pertemuan}} WIB
Tempat       : Kantor Pengasuh PP Nurus Sholah
Acara        : {{alasan_panggilan}}

Demikian undangan panggilan ini kami sampaikan, atas perhatian dan kehadirannya disampaikan terima kasih.`,
    default_penandatangan: 'Ust. H. Ahmad Baihaqi, S.Pd.I.',
    default_jabatan: 'Ketua Dewan Pengurus Pesantren',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-06',
    kode: 'SRT-PERNYATAAN',
    nama: 'Surat Pernyataan Santri',
    jenis: 'Surat Pernyataan',
    judul_surat: 'SURAT PERNYATAAN SANTRI',
    body_template: `Saya yang bertanda tangan di bawah ini:
Nama Santri : {{nama_santri}} (NIS: {{nis}})
Program     : {{program}}

Menyatakan dengan sesungguhnya dan penuh kesadaran bahwa saya berjanji akan mematuhi seluruh tata tertib Pondok Pesantren Nurus Sholah Batulabang Akkor, tidak mengulangi pelanggaran, serta bersedia menerima sanksi apabila melanggar.`,
    default_penandatangan: '{{nama_santri}}',
    default_jabatan: 'Santri Yang Menyatakan',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-07',
    kode: 'SRT-TUGAS',
    nama: 'Surat Tugas Pengabdian',
    jenis: 'Surat Tugas',
    judul_surat: 'SURAT TUGAS RESMI',
    body_template: `Pengasuh Pondok Pesantren Nurus Sholah menugaskan kepada santri/ustadz:

Nama : {{nama_santri}}
NIS/NIY : {{nis}}
Program : {{program}}

Untuk melaksanakan Tugas Pengabdian / Khidmah / Munaqasyah pada lokasi: {{lokasi_tugas}} terhitung sejak {{mulai}} sampai {{selesai}}.`,
    default_penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    default_jabatan: 'Pengasuh Pondok Pesantren Nurus Sholah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-08',
    kode: 'SRT-REKOMENDASI',
    nama: 'Surat Rekomendasi Santri',
    jenis: 'Surat Rekomendasi',
    judul_surat: 'SURAT REKOMENDASI',
    body_template: `Pengasuh Pondok Pesantren Nurus Sholah memberikan rekomendasi kepada:

Nama : {{nama_santri}} (NIS: {{nis}})
Program: {{program}}

Bahwa santri tersebut memiliki kecakapan akademik, hafalan, dan akhlakul karimah yang baik sehingga sangat layak untuk direkomendasikan dalam mengikuti {{kegiatan_rekomendasi}}.`,
    default_penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    default_jabatan: 'Pengasuh Pondok Pesantren Nurus Sholah',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_INCOMING_LETTERS: IncomingLetter[] = [
  {
    id: 'inc-01',
    nomor_surat: 'B-412/Kw.13.2/PP.00.7/08/2026',
    tanggal_surat: '2026-08-15',
    tanggal_diterima: '2026-08-18',
    asal_surat: 'Kantor Kementerian Agama Kab. Pamekasan',
    tujuan: 'Pengasuh PP Nurus Sholah Batulabang Akkor',
    perihal: 'Undangan Sosialisasi Verifikasi EMIS & Akreditasi MDT',
    kategori: 'Kemenag',
    ringkasan: 'Permohonan keikutsertaan kepala madrasah dan operator dalam sosialisasi pemutakhiran data EMIS semester ganjil.',
    file_url: 'https://example.com/letters/inc-01.pdf',
    file_name: 'Surat_Kemenag_EMIS_2026.pdf',
    status: 'Selesai',
    petugas: 'Ust. Abdullah Sajjad',
    catatan: 'Disetujui Pengasuh, Sekretaris telah menghadiri acara.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'inc-02',
    nomor_surat: '045/RABITHAH-PMK/IX/2026',
    tanggal_surat: '2026-09-02',
    tanggal_diterima: '2026-09-04',
    asal_surat: 'RMI NU (Rabithah Ma\'ahid Islamiyah) Pamekasan',
    tujuan: 'Dewan Asatidz PP Nurus Sholah',
    perihal: 'Undangan Musabaqah Qira\'atil Kutub (MQK) Tingkat Kabupaten',
    kategori: 'Undangan',
    ringkasan: 'Pendaftaran delegasi santri untuk lomba kitab Safinatun Najah, Fathul Qorib, dan Imrithi.',
    file_url: 'https://example.com/letters/inc-02.pdf',
    file_name: 'Undangan_MQK_RMI_2026.pdf',
    status: 'Diproses',
    petugas: 'Ust. H. Ahmad Baihaqi',
    catatan: 'Sedang diseleksi santri utusan dari Rombel Mutawassith & Mutaqoddim.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_OUTGOING_LETTERS: OutgoingLetter[] = [
  {
    id: 'out-01',
    nomor_surat: '001/PPNS/08/VIII/2026',
    tanggal_surat: '2026-08-20',
    tujuan: 'Kepala Puskesmas Akkor Batulabang',
    perihal: 'Permohonan Pemeriksaan Kesehatan & Poskestren',
    kategori: 'Permohonan',
    isi_ringkasan: 'Permohonan bantuan tenaga medis untuk pemeriksaan berkala santri baru semester ganjil.',
    penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    lampiran: 'Daftar Nama Santri Baru (128 Santri)',
    file_url: 'https://example.com/letters/out-01.pdf',
    file_name: 'Surat_Puskesmas_Poskestren.pdf',
    status: 'Dikirim',
    catatan: 'Surat sudah diterima pihak Puskesmas tanggal 21 Agustus.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'out-02',
    nomor_surat: '002/PPNS/09/IX/2026',
    tanggal_surat: '2026-09-01',
    tujuan: 'Seluruh Wali Santri PP Nurus Sholah',
    perihal: 'Pemberitahuan Imtihan & Jadwal Libur Pertengahan Semester',
    kategori: 'Pemberitahuan',
    isi_ringkasan: 'Informasi pelaksanaan imtihan kitabiyah & tahfidz serta aturan kepulangan santri.',
    penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    lampiran: 'Jadwal Imtihan & Ketentuan Penjemputan',
    file_url: 'https://example.com/letters/out-02.pdf',
    file_name: 'Surat_Pemberitahuan_Imtihan.pdf',
    status: 'Ditandatangani',
    catatan: 'Siap dibagikan via grup broadcast wali santri dan cetak fisik.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_STUDENT_LETTERS: StudentLetter[] = [
  {
    id: 'stl-01',
    student_id: 'santri-001',
    template_id: 'tpl-01',
    jenis_surat: 'Surat Keterangan Santri',
    nomor_surat: '003/PPNS-SK/IX/2026',
    tanggal_surat: '2026-09-05',
    judul: 'SURAT KETERANGAN SANTRI',
    perihal: 'Keterangan Santri Aktif Mengaji & Sekolah',
    penandatangan: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    penandatangan_jabatan: 'Pengasuh Pondok Pesantren Nurus Sholah',
    custom_fields: {},
    status: 'Diterbitkan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'stl-02',
    student_id: 'santri-001',
    template_id: 'tpl-03',
    jenis_surat: 'Surat Izin',
    nomor_surat: '004/PPNS-IZN/IX/2026',
    tanggal_surat: '2026-09-08',
    judul: 'SURAT IZIN SANTRI',
    perihal: 'Izin Pulang Pernikahan Keluarga',
    penandatangan: 'Ust. H. Ahmad Baihaqi, S.Pd.I.',
    penandatangan_jabatan: 'Kepala Pengurus Keamanan',
    custom_fields: {
      alasan: 'Acara pernikahan kakak kandung',
      tujuan: 'Kec. Kadur, Kabupaten Pamekasan',
      mulai: '2026-09-08',
      selesai: '2026-09-10',
      penjemput: 'H. Moh. Mansur (Ayah Kandung)',
      penanggung_jawab: 'Ust. H. Ahmad Baihaqi'
    },
    status: 'Diterbitkan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_STUDENT_DOCUMENTS: StudentDocument[] = [
  {
    id: 'doc-01',
    student_id: 'santri-001',
    nama: 'Kartu Keluarga (KK)',
    nama_dokumen: 'Kartu Keluarga (KK)',
    tipe: 'KK',
    jenis_dokumen: 'KK',
    nomor_dokumen: '3528012304050001',
    file_url: 'https://example.com/docs/kk-001.pdf',
    file_name: 'Scan_KK_Ahmad_Fauzi.pdf',
    tanggal_upload: '2026-07-20',
    tanggal_terbit: '2020-05-12',
    status: 'Lengkap',
    catatan: 'Dokumen terverifikasi valid.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'doc-02',
    student_id: 'santri-001',
    nama: 'Akta Kelahiran',
    nama_dokumen: 'Akta Kelahiran',
    tipe: 'Akta Kelahiran',
    jenis_dokumen: 'Akta Kelahiran',
    nomor_dokumen: '3528-LT-12052010-0012',
    file_url: 'https://example.com/docs/akta-001.pdf',
    file_name: 'Akta_Ahmad_Fauzi.pdf',
    tanggal_upload: '2026-07-20',
    tanggal_terbit: '2010-06-01',
    status: 'Lengkap',
    catatan: 'Dokumen asli tersimpan di arsip.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'doc-03',
    student_id: 'santri-001',
    nama: 'Ijazah SD/MI',
    nama_dokumen: 'Ijazah SD/MI',
    tipe: 'Ijazah',
    jenis_dokumen: 'Ijazah',
    nomor_dokumen: 'DN-05/D-MI/06/1234567',
    file_url: 'https://example.com/docs/ijazah-001.pdf',
    file_name: 'Ijazah_MI_Fauzi.pdf',
    tanggal_upload: '2026-07-20',
    status: 'Lengkap',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'doc-04',
    student_id: 'santri-002',
    nama: 'Kartu Keluarga (KK)',
    nama_dokumen: 'Kartu Keluarga (KK)',
    tipe: 'KK',
    jenis_dokumen: 'KK',
    nomor_dokumen: '3528021508090004',
    file_url: 'https://example.com/docs/kk-002.pdf',
    file_name: 'KK_Siti_Nur_Aisyah.pdf',
    tanggal_upload: '2026-07-22',
    status: 'Lengkap',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'doc-05',
    student_id: 'santri-003',
    nama: 'Akta Kelahiran',
    nama_dokumen: 'Akta Kelahiran',
    tipe: 'Akta Kelahiran',
    jenis_dokumen: 'Akta Kelahiran',
    file_url: '',
    tanggal_upload: '2026-07-25',
    status: 'Belum Lengkap',
    catatan: 'Wali santri berjanji menyusulkan berkas fisik saat sambangan bulan depan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_DOCUMENT_ARCHIVES: DocumentArchive[] = [
  {
    id: 'arc-01',
    judul: 'Izin Operasional Pesantren Kemenag RI',
    nomor_dokumen: '510035280012',
    kategori: 'Izin Operasional',
    tanggal_dokumen: '2021-01-10',
    pengarsip: 'Ust. Abdullah Sajjad',
    file_url: 'https://example.com/archives/izop-kemenag.pdf',
    file_name: 'Izin_Operasional_Nurus_Sholah.pdf',
    tags: ['Kemenag', 'IJOP', 'Pondok'],
    status: 'Penting',
    deskripsi: 'SK Izin Operasional Lembaga Pondok Pesantren Nurus Sholah Akkor dari Kemenag Kabupaten Pamekasan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'arc-02',
    judul: 'Sertifikat Tanah Wakaf Pesantren (Lokasi Batulabang)',
    nomor_dokumen: 'WKF-3528-2015-089',
    kategori: 'Sertifikat Wakaf',
    tanggal_dokumen: '2015-05-20',
    pengarsip: 'Sekretariat Yayasan',
    file_url: 'https://example.com/archives/wakaf-tanah.pdf',
    file_name: 'Sertifikat_Wakaf_Batulabang.pdf',
    tags: ['Wakaf', 'Tanah', 'BPN'],
    status: 'Penting',
    deskripsi: 'Akta ikrar wakaf dan sertifikat tanah BPN seluas 1.5 Hektar lokasi kompleks asrama utama.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// --- STAGE 7 DEFAULT CONSTANTS ---

export const DEFAULT_FINANCIAL_CATEGORIES: FinancialCategory[] = [
  // PEMASUKAN
  { id: 'fcat-inc-spp', nama: 'SPP / Syahriah Bulanan', jenis: 'PEMASUKAN', urutan: 1, status: 'aktif', deskripsi: 'Iuran syahriah bulanan santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-kitab', nama: 'Uang Kitab & Seragam', jenis: 'PEMASUKAN', urutan: 2, status: 'aktif', deskripsi: 'Pembelian paket kitabiyah & seragam', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-pendaftaran', nama: 'Pendaftaran / PSB', jenis: 'PEMASUKAN', urutan: 3, status: 'aktif', deskripsi: 'Biaya pendaftaran santri baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-keterampilan', nama: 'Keterampilan & Ekstra', jenis: 'PEMASUKAN', urutan: 4, status: 'aktif', deskripsi: 'Iuran kegiatan ektrakurikuler & khidmah', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-donasi', nama: 'Donasi & Infaq', jenis: 'PEMASUKAN', urutan: 5, status: 'aktif', deskripsi: 'Infaq umum donatur & simpul alumni', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-wakaf', nama: 'Wakaf Tunai Pesantren', jenis: 'PEMASUKAN', urutan: 6, status: 'aktif', deskripsi: 'Wakaf pembangunan & sarpras', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-bantuan', nama: 'Bantuan / BOSP / Kemenag', jenis: 'PEMASUKAN', urutan: 7, status: 'aktif', deskripsi: 'Subsidi & bantuan pemerintah / Kemenag', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-kegiatan', nama: 'Pemasukan Kegiatan / Imtihan', jenis: 'PEMASUKAN', urutan: 8, status: 'aktif', deskripsi: 'Dana kegiatan haflah & imtihan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-inc-lainnya', nama: 'Pemasukan Lainnya', jenis: 'PEMASUKAN', urutan: 9, status: 'aktif', deskripsi: 'Pemasukan tak terduga / wirausaha', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // PENGELUARAN
  { id: 'fcat-exp-pendidikan', nama: 'Pendidikan & Kitabiyah', jenis: 'PENGELUARAN', urutan: 1, status: 'aktif', deskripsi: 'Operasional KBM madrasah & kitab', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-makan', nama: 'Konsumsi & Dapur Santri', jenis: 'PENGELUARAN', urutan: 2, status: 'aktif', deskripsi: 'Bahan makanan & konsumsi harian', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-listrik', nama: 'Listrik & PLN', jenis: 'PENGELUARAN', urutan: 3, status: 'aktif', deskripsi: 'Token & tagihan listrik kompleks asrama', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-air', nama: 'Air & Kebersihan', jenis: 'PENGELUARAN', urutan: 4, status: 'aktif', deskripsi: 'Pompa air, PDAM, & alat kebersihan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-asrama', nama: 'Operasional Asrama', jenis: 'PENGELUARAN', urutan: 5, status: 'aktif', deskripsi: 'Perlengkapan & perlengkapan kamar santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-atk', nama: 'ATK & Kesekretariatan', jenis: 'PENGELUARAN', urutan: 6, status: 'aktif', deskripsi: 'Kertas, tinta, & cetak surat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-kegiatan', nama: 'Kegiatan Pondok & PHBI', jenis: 'PENGELUARAN', urutan: 7, status: 'aktif', deskripsi: 'Pelaksanaan Haflah, MQK, & acara', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-transportasi', nama: 'Transportasi & Bensin', jenis: 'PENGELUARAN', urutan: 8, status: 'aktif', deskripsi: 'Perjalanan dinas & operasional armada', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-honor', nama: 'Honor Asatidz & Bisyarah', jenis: 'PENGELUARAN', urutan: 9, status: 'aktif', deskripsi: 'Bisyarah dewan guru & pengurus', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-pemeliharaan', nama: 'Pemeliharaan & Perbaikan', jenis: 'PENGELUARAN', urutan: 10, status: 'aktif', deskripsi: 'Perbaikan fasilitas & renovasi ringan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-pembangunan', nama: 'Pembangunan Fisik', jenis: 'PENGELUARAN', urutan: 11, status: 'aktif', deskripsi: 'Proyek pembangunan gedung baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-kesehatan', nama: 'Kesehatan & Poskestren', jenis: 'PENGELUARAN', urutan: 12, status: 'aktif', deskripsi: 'Obat-obatan & periksa santri sakit', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-administrasi', nama: 'Administrasi & Perizinan', jenis: 'PENGELUARAN', urutan: 13, status: 'aktif', deskripsi: 'Biaya hukum, perizinan, & rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fcat-exp-lainnya', nama: 'Pengeluaran Lainnya', jenis: 'PENGELUARAN', urutan: 14, status: 'aktif', deskripsi: 'Pengeluaran tak terduga', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const DEFAULT_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  // PEMASUKAN
  {
    id: 'ft-inc-01',
    nomor_transaksi: 'IN-2026-00001',
    tanggal: '2026-09-01',
    jenis: 'PEMASUKAN',
    kategori_id: 'fcat-inc-spp',
    nominal: 45000000,
    sumber_destinasi: 'Rekening Kas Utama Pondok',
    deskripsi: 'Penerimaan Syahriah & SPP Bulanan Santri Gelombang September 2026',
    metode_pembayaran: 'Transfer Bank',
    bukti_url: 'https://example.com/proofs/in-01.jpg',
    file_name: 'Rekap_Kas_SPP_Sept_2026.pdf',
    petugas: 'Ustz. Siti Fatimah (Bendahara)',
    status: 'Valid',
    catatan: 'Telah terverifikasi sesuai laporan kasir pembayaran.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ft-inc-02',
    nomor_transaksi: 'IN-2026-00002',
    tanggal: '2026-09-05',
    jenis: 'PEMASUKAN',
    kategori_id: 'fcat-inc-spp',
    nominal: 350000,
    sumber_destinasi: 'Orang Tua Santri (H. Moh. Mansur)',
    deskripsi: 'Pembayaran Syahriah September - Santri Ahmad Fauzi (NIS: 2026001)',
    metode_pembayaran: 'Tunai',
    petugas: 'Ustz. Siti Fatimah',
    status: 'Valid',
    student_id: 'santri-001',
    catatan: 'Pembayaran Lunas Syahriah.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ft-inc-03',
    nomor_transaksi: 'IN-2026-00003',
    tanggal: '2026-09-10',
    jenis: 'PEMASUKAN',
    kategori_id: 'fcat-inc-donasi',
    nominal: 15000000,
    sumber_destinasi: 'Donatur H. Sukirman (Alumni)',
    deskripsi: 'Infaq & Donasi Pembangunan Musholla & Sarpras Asrama',
    metode_pembayaran: 'Transfer Bank',
    petugas: 'Ust. Abdullah Sajjad',
    status: 'Valid',
    catatan: 'Masuk kas dana pembangunan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },

  // PENGELUARAN
  {
    id: 'ft-exp-01',
    nomor_transaksi: 'OUT-2026-00001',
    tanggal: '2026-09-02',
    jenis: 'PENGELUARAN',
    kategori_id: 'fcat-exp-listrik',
    nominal: 4200000,
    sumber_destinasi: 'PT PLN (Persero) Rayon Pamekasan',
    deskripsi: 'Pembayaran Token & Tagihan Listrik Kompleks Asrama Putra & Putri',
    metode_pembayaran: 'Transfer Bank',
    petugas: 'Ustz. Siti Fatimah',
    status: 'Valid',
    catatan: 'Bukti struk PLN tersimpan di berkas.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ft-exp-02',
    nomor_transaksi: 'OUT-2026-00002',
    tanggal: '2026-09-08',
    jenis: 'PENGELUARAN',
    kategori_id: 'fcat-exp-honor',
    nominal: 18500000,
    sumber_destinasi: 'Dewan Asatidz & Pengurus Pesantren',
    deskripsi: 'Pencairan Bisyarah & Honor Mengajar Dewan Asatidz Bulan Agustus 2026',
    metode_pembayaran: 'Transfer Bank',
    petugas: 'Ustz. Siti Fatimah',
    status: 'Valid',
    catatan: 'Pencairan amplop bisyarah 24 Ustadz.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ft-exp-03',
    nomor_transaksi: 'OUT-2026-00003',
    tanggal: '2026-09-15',
    jenis: 'PENGELUARAN',
    kategori_id: 'fcat-exp-kegiatan',
    nominal: 7500000,
    sumber_destinasi: 'Panitia Haflah Akhirussanah',
    deskripsi: 'Realisasi Anggaran Konsumsi & Panggung Haflah Akhirussanah 2026',
    metode_pembayaran: 'Tunai',
    petugas: 'Ust. H. Ahmad Baihaqi',
    status: 'Valid',
    activity_id: 'act-01',
    budget_id: 'bdg-01',
    catatan: 'Sesuai dengan pengajuan REQ-2026-00001.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_EXPENSE_REQUESTS: ExpenseRequest[] = [
  {
    id: 'req-01',
    nomor_pengajuan: 'REQ-2026-00001',
    pengaju: 'Ust. H. Ahmad Baihaqi (Ketua Panitia Haflah)',
    tanggal: '2026-09-12',
    kategori_id: 'fcat-exp-kegiatan',
    activity_id: 'act-01',
    tujuan: 'Sewa Sound System & Lighting Haflah Akhirussanah',
    nominal: 3500000,
    alasan: 'Mendukung pelaksanaan imtihan & wisuda munaqasyah santri.',
    prioritas: 'Tinggi',
    status: 'SELESAI',
    pemeriksa: 'Ust. Abdullah Sajjad',
    penyetuju: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    tanggal_persetujuan: '2026-09-14',
    catatan: 'Disetujui Pengasuh, dana telah dicairkan oleh Bendahara.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'req-02',
    nomor_pengajuan: 'REQ-2026-00002',
    pengaju: 'Ust. Moh. Cholis (Bagian Sarpras)',
    tanggal: '2026-09-20',
    kategori_id: 'fcat-exp-pemeliharaan',
    tujuan: 'Pembelian Mesin Pompa Air Baru Asrama Putra',
    nominal: 2200000,
    alasan: 'Pompa air utama rusak menyebabkan krisis air di Kamar A-B.',
    prioritas: 'Mendesak',
    status: 'DIPERIKSA',
    pemeriksa: 'Ustz. Siti Fatimah',
    catatan: 'Sedang diperiksa rincian garansi dan nota toko.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_PONDOK_BUDGETS: PondokBudget[] = [
  {
    id: 'bdg-01',
    nama_anggaran: 'Anggaran Kegiatan Haflah Akhirussanah & Imtihan 2026',
    tahun: '2026',
    periode: 'Semester 1',
    kategori_id: 'fcat-exp-kegiatan',
    activity_id: 'act-01',
    nominal_anggaran: 10000000,
    nominal_realisasi: 7500000,
    penanggung_jawab: 'Ust. H. Ahmad Baihaqi',
    status: 'aktif',
    catatan: 'Sisa anggaran Rp 2.500.000.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'bdg-02',
    nama_anggaran: 'Anggaran Operasional Bensin & Transportasi Pengurus',
    tahun: '2026',
    kategori_id: 'fcat-exp-transportasi',
    nominal_anggaran: 5000000,
    nominal_realisasi: 4800000,
    penanggung_jawab: 'Sekretariat Pesantren',
    status: 'aktif',
    catatan: 'Peringatan: Realisasi mencapai 96% dari batas anggaran.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_PONDOK_ACTIVITIES: PondokActivity[] = [
  {
    id: 'act-01',
    nama_kegiatan: 'Haflah Akhirussanah & Imtihan Munaqasyah Kitab',
    kode: 'ACT-HAFLAH-2026',
    kategori: 'Haflah / Imtihan',
    tanggal_mulai: '2026-10-15',
    tanggal_selesai: '2026-10-17',
    lokasi: 'Halaman Utama Pesantren Nurus Sholah',
    penanggung_jawab: 'Ust. H. Ahmad Baihaqi',
    peserta_count: 350,
    total_anggaran: 10000000,
    total_realisasi: 7500000,
    status: 'Disetujui',
    deskripsi: 'Wisuda kelulusan santri tahfidz 30 juz dan imtihan munaqasyah kitab Safinatun Najah & Iktisyaf.',
    dokumentasi_urls: ['https://example.com/images/haflah1.jpg'],
    catatan: 'Persiapan panggung dan dekorasi H-3.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'act-02',
    nama_kegiatan: 'Pengajian Umum & Peringatan Maulid Nabi SAW',
    kode: 'ACT-MAULID-2026',
    kategori: 'Keagamaan',
    tanggal_mulai: '2026-09-28',
    tanggal_selesai: '2026-09-28',
    lokasi: 'Musholla As-Salam PP Nurus Sholah',
    penanggung_jawab: 'Ust. Abdullah Sajjad',
    peserta_count: 500,
    total_anggaran: 6000000,
    total_realisasi: 5800000,
    status: 'Selesai',
    deskripsi: 'Peringatan Maulid Nabi Muhammad SAW menghadirkan Penceramah Kiai Luar Kota dan Shalawat Dibai.',
    catatan: 'Acara berjalan khidmat dan tertib.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_ACTIVITY_LPJS: ActivityLPJ[] = [
  {
    id: 'lpj-01',
    activity_id: 'act-01',
    identitas: 'Laporan Pertanggungjawaban Haflah Akhirussanah Tahun 2026',
    latar_belakang: 'Sebagai bentuk akuntabilitas publik dan evaluasi pelaksanaan imunisasi keilmuan imtihan santri.',
    dasar_kegiatan: 'Program Kerja Tahunan Dewan Pengasuh & Rapat Pengurus Tanggal 15 Agustus 2026.',
    tujuan: 'Melaporkan hasil kelulusan munaqasyah dan transparansi penggunaan kas anggaran kegiatan.',
    waktu_pelaksanaan: '15 - 17 Oktober 2026',
    tempat: 'Kompleks PP Nurus Sholah Batulabang Akkor',
    susunan_panitia: 'Ketua: Ust. H. Ahmad Baihaqi, Sekretaris: Ust. Abdullah Sajjad, Bendahara: Ustz. Siti Fatimah',
    hasil_kegiatan: 'Diikuti 128 santri munaqasyah kitab dan 12 santri khatam 30 Juz Al-Qur\'an dengan predikat Sangat Memuaskan.',
    kendala: 'Keterbatasan area parkir untuk wali santri dari luar kabupaten.',
    evaluasi: 'Perlu perluasan lahan parkir dan koordinasi keamananan desa setempat untuk tahun depan.',
    kesimpulan: 'Seluruh Rangkaian Haflah Akhirussanah sukses dilaksanakan tepat waktu.',
    penutup: 'Demikian LPJ ini dibuat untuk dipergunakan sebagaimana mestinya.',
    total_anggaran: 10000000,
    total_realisasi: 7500000,
    selisih: 2500000,
    penandatangan_ketua: 'Ust. H. Ahmad Baihaqi',
    penandatangan_bendahara: 'Ustz. Siti Fatimah',
    penandatangan_pengasuh: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    status: 'DISETUJUI',
    catatan_revisi: 'Revisi disetujui Pengasuh tanpa catatan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_PONDOK_MEETINGS: PondokMeeting[] = [
  {
    id: 'mtg-01',
    nomor_rapat: 'RPT/NS/10/2026/001',
    judul_rapat: 'Rapat Evaluasi Pembelajaran, Kedisiplinan & Tahfidz Bulan Oktober 2026',
    bulan: 'Oktober',
    tahun: 2026,
    tanggal: '2026-10-10',
    hari: 'Sabtu',
    waktu_mulai: '19:30',
    waktu_selesai: '21:30',
    tempat: 'Aula Utama Pengasuh PP Nurus Sholah Batulabang Akkor',
    pimpinan_rapat: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    sekretaris_rapat: 'Ust. Abdullah Sajjad',
    jenis_rapat: 'Rapat Bulanan',
    agenda_utama: 'Evaluasi Pembelajaran Kitabiyah, Target Tahfidz, Keuangan, dan Persiapan Imtihan',
    tujuan: 'Menilai capaian target santri bulanan dan menyusun rekomendasi tindak lanjut kepengurusan.',
    peserta_ringkasan: 'Seluruh Dewan Guru, Wali Kelas, Pembimbing Tahfidz & Pengurus Asrama (25 Orang)',
    catatan: 'Hadir tepat waktu setelah shalat Isya berjamaah.',
    status: 'SELESAI',
    locked_notulen: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mtg-02',
    nomor_rapat: 'RPT/NS/10/2026/002',
    judul_rapat: 'Rapat Persiapan Haflah Akhirussanah & Imtihan Munaqasyah 2026',
    bulan: 'Oktober',
    tahun: 2026,
    tanggal: '2026-10-14',
    hari: 'Rabu',
    waktu_mulai: '20:00',
    waktu_selesai: '22:00',
    tempat: 'Ruang Rapat Sekretariat PPNS',
    pimpinan_rapat: 'Ust. H. Ahmad Baihaqi, Lc.',
    sekretaris_rapat: 'Ahmad Muzakki, S.Kom.',
    jenis_rapat: 'Rapat Kegiatan',
    agenda_utama: 'Pembentukan Susunan Panitia, Anggaran Kas, dan Jadwal Gelombang Munaqasyah',
    tujuan: 'Memastikan seluruh kesiapan sarana prasarana dan anggaran Haflah.',
    peserta_ringkasan: 'Panitia Pelaksana & Perwakilan Bendahara (12 Orang)',
    catatan: 'Membawa draft RAB kegiatan.',
    status: 'TERJADWAL',
    locked_notulen: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mtg-03',
    nomor_rapat: 'RPT/NS/11/2026/001',
    judul_rapat: 'Rapat Coordination Pengurus Asrama & Keamanan Santri',
    bulan: 'November',
    tahun: 2026,
    tanggal: '2026-11-02',
    hari: 'Senin',
    waktu_mulai: '19:30',
    waktu_selesai: '21:00',
    tempat: 'Gedung Asrama Putra R-02',
    pimpinan_rapat: 'Ust. Mahrus Ali, S.Sos.I.',
    sekretaris_rapat: 'Ust. Moh. Cholis',
    jenis_rapat: 'Rapat Pengurus',
    agenda_utama: 'Evaluasi Jam Malam, Kebersihan Kamar Mandi, dan Perizinan Pulang Santri',
    tujuan: 'Meningkatkan ketertiban harian dan keselamatan santri.',
    status: 'TERJADWAL',
    locked_notulen: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_DECISIONS: MeetingDecision[] = [
  {
    id: 'dec-01',
    meeting_id: 'mtg-01',
    nomor_keputusan: 'KEP/NS/10/2026/001',
    isi_keputusan: 'Pemberlakuan Jam Wajib Belajar Malam (20:00 - 21:30) dengan Pengawasan Wali Kelas dan Pembimbing Asrama.',
    kategori: 'Kedisiplinan',
    penanggung_jawab: 'Ust. H. Ahmad Baihaqi (Keamanan)',
    deadline: '2026-10-20',
    prioritas: 'Sangat Penting',
    status: 'Selesai',
    catatan: 'Aturan telah disosialisasikan di setiap asrama.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dec-02',
    meeting_id: 'mtg-01',
    nomor_keputusan: 'KEP/NS/10/2026/002',
    isi_keputusan: 'Penyelenggaraan Munaqasyah Kitab Safinatun Najah Gelombang I dan Tashih Tahfidz Juz 30 pada tanggal 25-27 Oktober 2026.',
    kategori: 'Pendidikan',
    penanggung_jawab: 'Ust. Abdullah Sajjad (Madrasah)',
    deadline: '2026-10-25',
    prioritas: 'Tinggi',
    status: 'Berjalan',
    catatan: 'Tim penguji telah dibentuk dan jadwal telah diterbitkan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'dec-03',
    meeting_id: 'mtg-01',
    nomor_keputusan: 'KEP/NS/10/2026/003',
    isi_keputusan: 'Pengadaan Penambahan Pompa Air & Perbaikan Instalasi Sanitasi Kompleks Putri.',
    kategori: 'Sarana Prasarana',
    penanggung_jawab: 'Ust. Moh. Cholis (Bag. Sarpras)',
    deadline: '2026-10-18',
    prioritas: 'Sangat Penting',
    status: 'Berjalan',
    catatan: 'Surat Pengajuan Dana ke Bendahara Keuangan telah diterbitkan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_FOLLOWUPS: MeetingFollowup[] = [
  {
    id: 'flw-01',
    meeting_id: 'mtg-01',
    decision_id: 'dec-01',
    judul: 'Pelaksanaan Absensi Ronda Jam Wajib Belajar Malam',
    sumber_rapat: 'Rapat Evaluasi Pembelajaran & Kedisiplinan (10 Okt 2026)',
    keputusan: 'Pemberlakuan Jam Wajib Belajar Malam (20:00 - 21:30)',
    pic: 'Ust. H. Ahmad Baihaqi',
    unit_bagian: 'Sie Keamanan & Pengurus Asrama',
    tanggal_mulai: '2026-10-11',
    deadline: '2026-10-20',
    prioritas: 'Sangat Penting',
    status: 'Selesai',
    progress_percent: 100,
    hasil: 'Buku rekap absensi belajar malam aktif di seluruh 6 blok asrama.',
    completed_at: '2026-10-18',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'flw-02',
    meeting_id: 'mtg-01',
    decision_id: 'dec-02',
    judul: 'Cetak Lembar Soal & Berkas Munaqasyah Kitab Safinatun Najah',
    sumber_rapat: 'Rapat Evaluasi Pembelajaran & Kedisiplinan (10 Okt 2026)',
    keputusan: 'Penyelenggaraan Munaqasyah Kitab Safinatun Najah Gelombang I',
    pic: 'Ust. Abdullah Sajjad',
    unit_bagian: 'Kurikulum & Pengajaran',
    tanggal_mulai: '2026-10-12',
    deadline: '2026-10-24',
    prioritas: 'Tinggi',
    status: 'Berjalan',
    progress_percent: 75,
    hasil: 'Naskah soal & penguji siap, menunggu proses cetak lembar penilain.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'flw-03',
    meeting_id: 'mtg-01',
    decision_id: 'dec-03',
    judul: 'Pencairan Dana & Pemasangan Pompa Air Baru Asrama Putri',
    sumber_rapat: 'Rapat Evaluasi Pembelajaran & Kedisiplinan (10 Okt 2026)',
    keputusan: 'Pengadaan Penambahan Pompa Air & Perbaikan Instalasi Sanitasi Kompleks Putri',
    pic: 'Ust. Moh. Cholis',
    unit_bagian: 'Sarana & Prasarana',
    tanggal_mulai: '2026-10-12',
    deadline: '2026-10-18',
    prioritas: 'Sangat Penting',
    status: 'Berjalan',
    progress_percent: 50,
    hasil: 'Pompa air telah dibeli, proses penggantian pipa berlangsung.',
    kendala: 'Ketersediaan teknisi listrik lokal.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_RESULTS: MeetingResult[] = [
  {
    id: 'res-01',
    meeting_id: 'mtg-01',
    ringkasan: 'Rapat berjalan lancar dihadiri 25 peserta. Pembahasan memfokuskan evaluasi ketuntasan kitab dan peningkatan sanitasi asrama.',
    hasil_pembahasan: 'Tingkat kehadiran santri pada jamaah shalat 94%. Ketuntasan kitab Safinatun Najah mencapai 88%. Perlu percepatan program Tashih Tahfidz Juz 30.',
    keputusan: '1. Jam belajar malam dikendalikan penuh.\n2. Munaqasyah Gelombang I dilaksanakan 25 Oktober.\n3. Pengadaan pompa air putri segera dicairkan.',
    rekomendasi: 'Diharapkan para wali kelas berkoordinasi secara intensif dengan wali santri terkait rekap absen bulanan.',
    catatan: 'Seluruh peserta rapat menyetujui poin keputusan secara mufakat.',
    dibuat_oleh: 'Ust. Abdullah Sajjad',
    tanggal: '2026-10-10',
    status: 'DISETUJUI',
    approved_by: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    approved_at: '2026-10-11',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_REPORTS: MeetingReport[] = [
  {
    id: 'rep-01',
    meeting_id: 'mtg-01',
    nomor_laporan: 'LAP/NS/10/2026/001',
    judul_laporan: 'Laporan Hasil Rapat Evaluasi Pembelajaran, Kedisiplinan & Tahfidz Bulan Oktober 2026',
    tanggal_laporan: '2026-10-11',
    tujuan_rapat: 'Evaluasi capaian kurikulum, penegakan kedisiplinan asrama, dan kesiapan imtihan.',
    peserta_ringkasan: '25 Peserta (Pengasuh, Ketua Pengurus, Dewan Guru, Wali Kelas, Pembimbing)',
    agenda_ringkasan: '1. Evaluasi Pembelajaran Kitabiyah\n2. Evaluasi Target Tahfidz & BTQ\n3. Kedisiplinan Asrama & Keuangan\n4. Rencana Imtihan',
    pembahasan_ringkasan: 'Rapat mengevaluasi ketuntasan materi Safinatun Najah & Iktisyaf. Program Tahfidz mencapai 92% target juz. Sarpras asrama putri membutuhkan perbaikan instalasi air.',
    hasil_rapat: 'Disepakati pelaksanaan Munaqasyah Kitab Gelombang I pada 25-27 Oktober 2026 dan pengatatan jam belajar malam.',
    keputusan_ringkasan: 'KEP/NS/10/2026/001 (Jam Belajar Malam), KEP/NS/10/2026/002 (Munaqasyah Kitab), KEP/NS/10/2026/003 (Pompa Air Putri)',
    tindak_lanjut_ringkasan: '3 Poin Tindak Lanjut dialokasikan ke Sie Keamanan, Kurikulum, dan Sarpras.',
    penanggung_jawab_ringkasan: 'Ust. H. Ahmad Baihaqi, Ust. Abdullah Sajjad, Ust. Moh. Cholis',
    batas_waktu_ringkasan: '18 Oktober - 25 Oktober 2026',
    kesimpulan: 'Secara keseluruhan program berjalan baik dengan beberapa perbaikan sarpras dan pengetatan jadwal rutin.',
    pimpinan_nama: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    pimpinan_jabatan: 'Pengasuh Utama PP Nurus Sholah',
    sekretaris_nama: 'Ust. Abdullah Sajjad',
    sekretaris_jabatan: 'Sekretaris Rapat',
    pengasuh_nama: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    pengasuh_jabatan: 'Pengasuh Pesantren',
    status: 'DISETUJUI',
    approved_by: 'KH. Muhammad Syamsul Arifin, S.Ag.',
    approved_at: '2026-10-11',
    locked: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_EVALUATIONS: MeetingMonthlyEvaluation[] = [
  {
    id: 'eval-01',
    bulan: 'Oktober',
    tahun: 2026,
    kategori: 'Pendidikan',
    pencapaian: '88% santri lulus evaluasi bab Thaharah & Shalat dalam Kitab Safinatun Najah.',
    masalah: 'Sebagian santri baru kurang lancar membaca tulisan pegon Jawa/Madura.',
    kendala: 'Keterbatasan jam ekstra sorogan pegon.',
    solusi: 'Penambahan jam klinik BTQ & Pegon 2 kali seminggu setelah Ashar.',
    rekomendasi: 'Diwajibkan bagi santri tingkat Mubtadi yang memiliki nilai di bawah 70.',
    target_bulan_berikutnya: '95% Ketuntasan bacaan pegon dan kelancaran Hafalan Aqidatul Awam.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'eval-02',
    bulan: 'Oktober',
    tahun: 2026,
    kategori: 'Tahfidz',
    pencapaian: '12 santri menyelesaikan setoran Juz 30 tepat waktu.',
    masalah: 'Kelancaran murojaah juz 1-5 bagi santri tingkat Mutawassith.',
    kendala: 'Murojaah mandiri tanpa penyimakan teman sehalaqah.',
    solusi: 'Pemberlakuan sistem pasangan simakan (Ziyadah & Murojaah Berpasangan).',
    rekomendasi: 'Sertifikat apresiasi bulanan untuk santri teraktif.',
    target_bulan_berikutnya: 'Seluruh santri tahfidz menyelesaikan ujian munaqasyah juz berjalan.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_PLANS: MeetingMonthlyPlan[] = [
  {
    id: 'plan-01',
    bulan: 'November',
    tahun: 2026,
    rencana: 'Pelaksanaan Ujian Tengah Semester (UTS) Kitabiyah & Tahfidz',
    pic: 'Ust. Abdullah Sajjad',
    target_tanggal: '2026-11-15',
    prioritas: 'Sangat Penting',
    indikator_keberhasilan: '100% santri mengikuti ujian dan terbitnya Rapor Tengah Semester.',
    status: 'Rencana',
    created_at: new Date().toISOString()
  },
  {
    id: 'plan-02',
    bulan: 'November',
    tahun: 2026,
    rencana: 'Pelatihan Manajemen Kesekretariatan & Pembukuan Kas untuk Pengurus Santri',
    pic: 'Ahmad Muzakki, S.Kom.',
    target_tanggal: '2026-11-20',
    prioritas: 'Sedang',
    indikator_keberhasilan: 'Tersusunnya laporan keuangan asrama secara rapi dan digital.',
    status: 'Rencana',
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_MEETING_TEMPLATES: MeetingTemplate[] = [
  {
    id: 'tpl-mtg-01',
    nama_template: 'Template Rapat Pengurus Bulanan',
    jenis_rapat: 'Rapat Bulanan',
    agendas: [
      { judul: 'Evaluasi Pembelajaran Kitabiyah & Kurikulum', kategori: 'Pendidikan', prioritas: 'Tinggi' },
      { judul: 'Evaluasi Capaian Tahfidz & BTQ Santri', kategori: 'Tahfidz', prioritas: 'Tinggi' },
      { judul: 'Evaluasi Kedisiplinan & Ketertiban Asrama', kategori: 'Kedisiplinan', prioritas: 'Sangat Penting' },
      { judul: 'Laporan Realisasi Kas & Keuangan Pesantren', kategori: 'Keuangan', prioritas: 'Tinggi' },
      { judul: 'Rencana Kegiatan & Event Bulan Berikutnya', kategori: 'Kegiatan', prioritas: 'Sedang' }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: 'tpl-mtg-02',
    nama_template: 'Template Rapat Evaluasi Kurikulum & Dewan Guru',
    jenis_rapat: 'Rapat Akademik',
    agendas: [
      { judul: 'Review Absensi Kehadiran Dewan Asatidz', kategori: 'SDM', prioritas: 'Tinggi' },
      { judul: 'Evaluasi Progress Syarah & Silabus Kitab', kategori: 'Pendidikan', prioritas: 'Tinggi' },
      { judul: 'Persiapan Bahan & Naskah Soal Imtihan', kategori: 'Pendidikan', prioritas: 'Sangat Penting' }
    ],
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_OPERATIONAL_NOTIFICATIONS: OperationalNotification[] = [
  {
    id: 'notif-01',
    title: 'Pengajuan Pengeluaran Baru',
    message: 'Pengajuan pengeluaran REQ-2026-00002 (Pembelian Pompa Air Rp 2.200.000) menunggu persetujuan.',
    type: 'request',
    view_id: 'fin_persetujuan',
    target_permission: 'expense.approve',
    is_read: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'notif-02',
    title: 'Tindak Lanjut Rapat Mendekati Deadline',
    message: 'Keputusan Rapat KEP-01 (Pengadaan Kitab) memiliki deadline tanggal 10 Oktober 2026.',
    type: 'deadline',
    view_id: 'meet_tindak_lanjut',
    target_permission: 'meeting.view',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

export const SYSTEM_PERMISSIONS: Permission[] = [
  // DATA SANTRI
  { id: 'students.view', nama: 'Lihat Data Santri', modul: 'DATA SANTRI', deskripsi: 'Melihat direktori dan biodata santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'students.create', nama: 'Tambah Santri', modul: 'DATA SANTRI', deskripsi: 'Mendaftarkan santri baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'students.edit', nama: 'Edit Santri', modul: 'DATA SANTRI', deskripsi: 'Mengubah biodata dan mutasi santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'students.archive', nama: 'Arsipkan / Hapus Santri', modul: 'DATA SANTRI', deskripsi: 'Mengarsipkan atau mengelola arsip santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'students.export', nama: 'Export Data Santri', modul: 'DATA SANTRI', deskripsi: 'Mengunduh direktori santri ke format CSV/Excel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'students.print', nama: 'Cetak Data & Kartu Santri', modul: 'DATA SANTRI', deskripsi: 'Mencetak berkas biodata, rekap, dan kartu santri dengan QR Code', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // STAGE 7: KEUANGAN, OPERASIONAL, KEGIATAN & RAPAT
  { id: 'finance.view', nama: 'Lihat Dashboard Keuangan', modul: 'KEUANGAN', deskripsi: 'Melihat saldo, grafik kas, dan rekap mutasi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.create', nama: 'Input Transaksi Keuangan', modul: 'KEUANGAN', deskripsi: 'Mencatatkan transaksi tunai & bank', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.update', nama: 'Ubah Transaksi Keuangan', modul: 'KEUANGAN', deskripsi: 'Koreksi & pembatalan transaksi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.delete', nama: 'Hapus / Reversal Transaksi', modul: 'KEUANGAN', deskripsi: 'Reversal transaksi salah catat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.approve', nama: 'Persetujuan Keuangan', modul: 'KEUANGAN', deskripsi: 'Approval pengajuan pencairan dana', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.export', nama: 'Export Laporan Keuangan', modul: 'KEUANGAN', deskripsi: 'Export laporan kasir ke Excel/CSV', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'finance.print', nama: 'Cetak Laporan Keuangan PDF', modul: 'KEUANGAN', deskripsi: 'Mencetak lembar laporan resmi kasir', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'income.view', nama: 'Lihat Pemasukan', modul: 'KEUANGAN', deskripsi: 'Melihat registrasi kas masuk & SPP santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'income.create', nama: 'Input Pemasukan', modul: 'KEUANGAN', deskripsi: 'Mencatat kas masuk & pembayaran santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'income.update', nama: 'Edit Pemasukan', modul: 'KEUANGAN', deskripsi: 'Mengubah rekaman transaksi masuk', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'income.archive', nama: 'Arsipkan Pemasukan', modul: 'KEUANGAN', deskripsi: 'Mengarsipkan catatan kas masuk', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'expense.view', nama: 'Lihat Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Melihat rincian belanja & beban operasional', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'expense.create', nama: 'Input Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Mencatat pengeluaran kas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'expense.update', nama: 'Edit Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Mengubah rekaman beban belanja', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'expense.archive', nama: 'Arsipkan Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Mengarsipkan transaksi pengeluaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'expense.request', nama: 'Pengajuan Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Membuat draft draf pengajuan pencairan dana', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'expense.approve', nama: 'Setujui Pengajuan Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Memeriksa & menyetujui pengajuan dana', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'expense.reject', nama: 'Tolak Pengajuan Pengeluaran', modul: 'KEUANGAN', deskripsi: 'Menolak pengajuan pencairan dengan alasan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'budget.view', nama: 'Lihat Anggaran', modul: 'KEUANGAN', deskripsi: 'Melihat alokasi & monitoring anggaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'budget.create', nama: 'Buat Anggaran Baru', modul: 'KEUANGAN', deskripsi: 'Mengalokasikan plafon anggaran operasional', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'budget.update', nama: 'Ubah Anggaran', modul: 'KEUANGAN', deskripsi: 'Penyesuaian plafon anggaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'budget.archive', nama: 'Arsipkan Anggaran', modul: 'KEUANGAN', deskripsi: 'Menutup periode anggaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'activity.view', nama: 'Lihat Kegiatan Pondok', modul: 'KEGIATAN', deskripsi: 'Melihat kalender & agenda kegiatan pesantren', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'activity.create', nama: 'Buat Kegiatan Baru', modul: 'KEGIATAN', deskripsi: 'Mendaftarkan program acara baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'activity.update', nama: 'Ubah Data Kegiatan', modul: 'KEGIATAN', deskripsi: 'Mengubah jadwal & tempat acara', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'activity.delete', nama: 'Hapus Kegiatan', modul: 'KEGIATAN', deskripsi: 'Membatalkan agenda acara', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'activity.approve', nama: 'Persetujuan Kegiatan', modul: 'KEGIATAN', deskripsi: 'Menyetujui usulan acara', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'activity.export', nama: 'Export Data Kegiatan', modul: 'KEGIATAN', deskripsi: 'Ekspor rekapitulasi kegiatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'lpj.view', nama: 'Lihat LPJ Kegiatan', modul: 'KEGIATAN', deskripsi: 'Melihat berkas LPJ acara', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.create', nama: 'Buat Draft LPJ', modul: 'KEGIATAN', deskripsi: 'Menyusun naskah Laporan Pertanggungjawaban', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.update', nama: 'Edit Naskah LPJ', modul: 'KEGIATAN', deskripsi: 'Mengubah rincian evaluasi & narasi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.submit', nama: 'Ajukan LPJ', modul: 'KEGIATAN', deskripsi: 'Mengirim LPJ ke pimpinan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.review', nama: 'Periksa / Revisi LPJ', modul: 'KEGIATAN', deskripsi: 'Memberikan masukan revisi LPJ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.approve', nama: 'Setujui LPJ Resmi', modul: 'KEGIATAN', deskripsi: 'Persetujuan final LPJ oleh Pengasuh', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.archive', nama: 'Arsipkan LPJ', modul: 'KEGIATAN', deskripsi: 'Penyimpanan arsip permanen LPJ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'meeting.view', nama: 'Lihat Agenda Rapat', modul: 'RAPAT', deskripsi: 'Melihat daftar rapat & musyawarah', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.create', nama: 'Buat Rapat Baru', modul: 'RAPAT', deskripsi: 'Menjadwalkan musyawarah pengurus', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.update', nama: 'Ubah Jadwal Rapat', modul: 'RAPAT', deskripsi: 'Memperbarui tempat & waktu rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.delete', nama: 'Hapus Rapat', modul: 'RAPAT', deskripsi: 'Membatalkan jadwal rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.archive', nama: 'Arsipkan Rapat', modul: 'RAPAT', deskripsi: 'Mengarsipkan berkas rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.participant.manage', nama: 'Kelola Peserta Rapat', modul: 'RAPAT', deskripsi: 'Presensi kehadiran anggota musyawarah', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.agenda.manage', nama: 'Kelola Agenda Rapat', modul: 'RAPAT', deskripsi: 'Menyusun poin agenda rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.minutes.manage', nama: 'Kelola Notulen Rapat', modul: 'RAPAT', deskripsi: 'Menulis & mengunci notulensi resmi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.decision.create', nama: 'Buat Keputusan Rapat', modul: 'RAPAT', deskripsi: 'Pencatatan poin keputusan resmi rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.decision.update', nama: 'Ubah Keputusan Rapat', modul: 'RAPAT', deskripsi: 'Memperbarui keputusan rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.followup.manage', nama: 'Kelola Tindak Lanjut', modul: 'RAPAT', deskripsi: 'Memantau & memperbarui progress tindak lanjut rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.report.create', nama: 'Buat Laporan Hasil Rapat', modul: 'RAPAT', deskripsi: 'Menyusun laporan hasil & laporan bulanan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.report.update', nama: 'Ubah Laporan Hasil Rapat', modul: 'RAPAT', deskripsi: 'Mengubah draf laporan rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.report.approve', nama: 'Setujui Laporan Rapat', modul: 'RAPAT', deskripsi: 'Persetujuan resmi & penguncian laporan rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.report.export', nama: 'Export / Cetak PDF Rapat', modul: 'RAPAT', deskripsi: 'Mencetak berkas hasil, agenda, & notulen rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.template.manage', nama: 'Kelola Template Rapat', modul: 'RAPAT', deskripsi: 'Menyusun template agenda rapat berulang', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.calendar.view', nama: 'Lihat Kalender Rapat', modul: 'RAPAT', deskripsi: 'Melihat kalender & jadwal musyawarah', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meeting.notification.manage', nama: 'Kelola Notifikasi Rapat', modul: 'RAPAT', deskripsi: 'Mengirim peringatan deadline tindak lanjut', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'operational_report.view', nama: 'Lihat Laporan Operasional', modul: 'LAPORAN', deskripsi: 'Melihat gabungan laporan keuangan & kegiatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'operational_report.export', nama: 'Export Laporan Operasional', modul: 'LAPORAN', deskripsi: 'Ekspor berkas rekapitulasi operasional', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'operational_report.print', nama: 'Cetak Laporan Operasional', modul: 'LAPORAN', deskripsi: 'Cetak dokumen laporan komprehensif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // HAK AKSES MUTASI STATUS TAHAP 3
  { id: 'student.status.change', nama: 'Ubah Status Santri', modul: 'DATA SANTRI', deskripsi: 'Memperbarui status umum santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.graduate', nama: 'Proses Kelulusan', modul: 'DATA SANTRI', deskripsi: 'Memproses santri lulus dan otomatis menjadi alumni', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.transfer', nama: 'Proses Pindah', modul: 'DATA SANTRI', deskripsi: 'Memproses mutasi keluar/pindah santri ke lembaga lain', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.withdraw', nama: 'Proses Keluar', modul: 'DATA SANTRI', deskripsi: 'Memproses santri mengundurkan diri / keluar', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.reactivate', nama: 'Aktifkan Kembali Santri', modul: 'DATA SANTRI', deskripsi: 'Mengaktifkan kembali santri tidak aktif / nonaktif', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.status.rollback', nama: 'Batalkan Status (Rollback)', modul: 'DATA SANTRI', deskripsi: 'Membatalkan perubahan status kelulusan / mutasi (Super Admin)', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // DATA ALUMNI
  { id: 'alumni.view', nama: 'Lihat Data Alumni', modul: 'DATA ALUMNI', deskripsi: 'Melihat direktori alumni pesantren', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.create', nama: 'Tambah Alumni', modul: 'DATA ALUMNI', deskripsi: 'Mendaftarkan rekod alumni baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.edit', nama: 'Edit Data Alumni', modul: 'DATA ALUMNI', deskripsi: 'Memperbarui karir dan pendidikan lanjutan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.update', nama: 'Update Karir Alumni', modul: 'DATA ALUMNI', deskripsi: 'Memperbarui informasi studi dan pekerjaan alumni', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.archive', nama: 'Arsipkan Alumni', modul: 'DATA ALUMNI', deskripsi: 'Mengarsipkan data alumni', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.export', nama: 'Export Data Alumni', modul: 'DATA ALUMNI', deskripsi: 'Mengunduh laporan alumni ke format CSV/Excel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'alumni.print', nama: 'Cetak Profil & Kartu Alumni', modul: 'DATA ALUMNI', deskripsi: 'Mencetak kartu tanda anggota alumni dan rekap alumni', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // PEMBELAJARAN
  { id: 'learning.view', nama: 'Lihat Pembelajaran', modul: 'PEMBELAJARAN', deskripsi: 'Melihat kurikulum kitab dan jadwal ustadz', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'learning.create', nama: 'Tambah Pembelajaran', modul: 'PEMBELAJARAN', deskripsi: 'Menambahkan kurikulum / mata pelajaran baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'learning.edit', nama: 'Edit Pembelajaran', modul: 'PEMBELAJARAN', deskripsi: 'Mengubah jadwal & silabus kitab', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'learning.export', nama: 'Export Pembelajaran', modul: 'PEMBELAJARAN', deskripsi: 'Ekspor jadwal dan kurikulum', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // ABSENSI
  { id: 'attendance.view', nama: 'Lihat Absensi', modul: 'ABSENSI', deskripsi: 'Melihat presensi jamaah & sorogan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'attendance.create', nama: 'Input Absensi', modul: 'ABSENSI', deskripsi: 'Mengisi presensi harian santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'attendance.edit', nama: 'Edit Absensi', modul: 'ABSENSI', deskripsi: 'Memperbaiki catatan kehadiran santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'attendance.export', nama: 'Export Absensi', modul: 'ABSENSI', deskripsi: 'Ekspor rekap kehadiran bulanan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // RAPOR
  { id: 'reports_grade.view', nama: 'Lihat Rapor', modul: 'RAPOR', deskripsi: 'Melihat buku rapor santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'reports_grade.create', nama: 'Buat Rapor', modul: 'RAPOR', deskripsi: 'Membuat rekapitulasi nilai rapor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'reports_grade.edit', nama: 'Edit Nilai Rapor', modul: 'RAPOR', deskripsi: 'Mengubah input nilai santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'reports_grade.print', nama: 'Cetak Rapor', modul: 'RAPOR', deskripsi: 'Mencetak lembar rapor resmi', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'reports_grade.export', nama: 'Export Rapor PDF', modul: 'RAPOR', deskripsi: 'Export berkas rapor digital', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // RAPAT
  { id: 'meetings.view', nama: 'Lihat Rapat', modul: 'RAPAT', deskripsi: 'Melihat agenda musyawarah & rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meetings.create', nama: 'Tambah Rapat', modul: 'RAPAT', deskripsi: 'Membuat agenda musyawarah baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meetings.edit', nama: 'Edit Notulensi Rapat', modul: 'RAPAT', deskripsi: 'Mengubah hasil rapat pengurus', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meetings.delete', nama: 'Hapus Rapat', modul: 'RAPAT', deskripsi: 'Menghapus arsip rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'meetings.print', nama: 'Cetak Notulensi', modul: 'RAPAT', deskripsi: 'Mencetak lembar keputusan rapat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // LPJ
  { id: 'lpj.view', nama: 'Lihat LPJ', modul: 'LPJ', deskripsi: 'Melihat laporan pertanggungjawaban kegiatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.create', nama: 'Buat LPJ', modul: 'LPJ', deskripsi: 'Membuat draft laporan kegiatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.edit', nama: 'Edit LPJ', modul: 'LPJ', deskripsi: 'Memperbaiki rincian anggaran LPJ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.delete', nama: 'Hapus LPJ', modul: 'LPJ', deskripsi: 'Menghapus arsip LPJ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.print', nama: 'Cetak LPJ', modul: 'LPJ', deskripsi: 'Mencetak berkas laporan kegiatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'lpj.export', nama: 'Export LPJ', modul: 'LPJ', deskripsi: 'Ekspor data keuangan LPJ', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // DOKUMEN
  { id: 'documents.view', nama: 'Lihat Dokumen', modul: 'DOKUMEN', deskripsi: 'Melihat arsip dokumen pesantren', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'documents.upload', nama: 'Upload Dokumen', modul: 'DOKUMEN', deskripsi: 'Mengunggah file berkas baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'documents.edit', nama: 'Edit Dokumen', modul: 'DOKUMEN', deskripsi: 'Mengubah meta informasi dokumen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'documents.delete', nama: 'Hapus Dokumen', modul: 'DOKUMEN', deskripsi: 'Menghapus berkas dokumen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'documents.download', nama: 'Download Dokumen', modul: 'DOKUMEN', deskripsi: 'Mengunduh file arsip', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // PENGGUNA
  { id: 'users.view', nama: 'Lihat Pengguna', modul: 'PENGGUNA', deskripsi: 'Melihat daftar akun pengguna sistem', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'users.create', nama: 'Tambah Pengguna', modul: 'PENGGUNA', deskripsi: 'Mendaftarkan akun pengguna baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'users.edit', nama: 'Edit Pengguna', modul: 'PENGGUNA', deskripsi: 'Mengubah data akun pengguna lain', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'users.deactivate', nama: 'Nonaktifkan Pengguna', modul: 'PENGGUNA', deskripsi: 'Menonaktifkan status akses akun', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'users.manage_permissions', nama: 'Kelola Hak Akses', modul: 'PENGGUNA', deskripsi: 'Mengatur matriks permission per role', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // PENGATURAN
  { id: 'settings.view', nama: 'Lihat Pengaturan', modul: 'PENGATURAN', deskripsi: 'Melihat profil & identitas lembaga', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'settings.edit', nama: 'Edit Pengaturan', modul: 'PENGATURAN', deskripsi: 'Mengubah profil, pimpinan & kop surat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // STAGE 4: PENDIDIKAN & KURIKULUM
  { id: 'education.view', nama: 'Lihat Pendidikan', modul: 'PENDIDIKAN', deskripsi: 'Melihat struktur program, kurikulum, dan data pendidikan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'education.create', nama: 'Tambah Data Pendidikan', modul: 'PENDIDIKAN', deskripsi: 'Membuat program, tingkat, atau tahun ajaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'education.update', nama: 'Ubah Data Pendidikan', modul: 'PENDIDIKAN', deskripsi: 'Mengubah struktur kurikulum dan kelas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'education.archive', nama: 'Arsipkan Data Pendidikan', modul: 'PENDIDIKAN', deskripsi: 'Menonaktifkan kurikulum dan tahun ajaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'education.export', nama: 'Ekspor Data Pendidikan', modul: 'PENDIDIKAN', deskripsi: 'Ekspor rekap kurikulum & kelas ke CSV/Excel/PDF', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'program.view', nama: 'Lihat Program', modul: 'PENDIDIKAN', deskripsi: 'Melihat program dan cabang pendidikan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'program.create', nama: 'Tambah Program', modul: 'PENDIDIKAN', deskripsi: 'Membuat program & cabang baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'program.update', nama: 'Edit Program', modul: 'PENDIDIKAN', deskripsi: 'Mengubah program dan tingkatan', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'program.delete', nama: 'Hapus Program', modul: 'PENDIDIKAN', deskripsi: 'Menghapus/menonaktifkan program', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'class.view', nama: 'Lihat Kelas', modul: 'PENDIDIKAN', deskripsi: 'Melihat daftar kelas dan rombel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'class.create', nama: 'Tambah Kelas', modul: 'PENDIDIKAN', deskripsi: 'Membuat kelas baru terhubung kurikulum', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'class.update', nama: 'Edit Kelas', modul: 'PENDIDIKAN', deskripsi: 'Mengubah kelas dan kapasitas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'class.delete', nama: 'Hapus Kelas', modul: 'PENDIDIKAN', deskripsi: 'Menghapus/menonaktifkan kelas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'rombel.view', nama: 'Lihat Rombel', modul: 'PENDIDIKAN', deskripsi: 'Melihat rombongan belajar santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'rombel.create', nama: 'Tambah Rombel', modul: 'PENDIDIKAN', deskripsi: 'Membuat rombel kelas baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'rombel.update', nama: 'Edit Rombel', modul: 'PENDIDIKAN', deskripsi: 'Mengubah nama, kapasitas rombel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'rombel.delete', nama: 'Hapus Rombel', modul: 'PENDIDIKAN', deskripsi: 'Menghapus rombongan belajar', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'student.class.assign', nama: 'Penempatan Kelas Santri', modul: 'PENDIDIKAN', deskripsi: 'Menempatkan santri ke kelas dan rombel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.class.transfer', nama: 'Pindah Rombel/Tingkat', modul: 'PENDIDIKAN', deskripsi: 'Memindahkan santri ke rombel lain', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.class.promote', nama: 'Kenaikan Kelas Massal', modul: 'PENDIDIKAN', deskripsi: 'Memproses kenaikan kelas & kelulusan tingkat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'teacher.view', nama: 'Lihat Data Ustadz', modul: 'PENDIDIKAN', deskripsi: 'Melihat profil dewan asatidz dan pengajar', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'teacher.create', nama: 'Tambah Ustadz', modul: 'PENDIDIKAN', deskripsi: 'Mendaftarkan guru/ustadz baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'teacher.update', nama: 'Edit Ustadz', modul: 'PENDIDIKAN', deskripsi: 'Mengubah profil dan keahlian ustadz', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'teacher.archive', nama: 'Arsipkan Ustadz', modul: 'PENDIDIKAN', deskripsi: 'Menonaktifkan data pengajar', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'teacher.assign', nama: 'Penugasan Materi Ustadz', modul: 'PENDIDIKAN', deskripsi: 'Menugaskan ustadz ke mata pelajaran', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'homeroom.assign', nama: 'Penetapan Wali Kelas', modul: 'PENDIDIKAN', deskripsi: 'Menetapkan ustadz sebagai wali kelas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mentor.assign', nama: 'Penetapan Pembimbing', modul: 'PENDIDIKAN', deskripsi: 'Menetapkan ustadz sebagai pembimbing halaqah/asrama', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  // STAGE 4: ASRAMA & KAMAR
  { id: 'dorm.view', nama: 'Lihat Asrama', modul: 'ASRAMA', deskripsi: 'Melihat gedung dan lantai asrama santri', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dorm.create', nama: 'Tambah Gedung Asrama', modul: 'ASRAMA', deskripsi: 'Menambahkan gedung asrama baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dorm.update', nama: 'Edit Gedung Asrama', modul: 'ASRAMA', deskripsi: 'Mengubah informasi gedung', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dorm.delete', nama: 'Hapus Gedung Asrama', modul: 'ASRAMA', deskripsi: 'Menghapus data gedung', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'room.view', nama: 'Lihat Kamar', modul: 'ASRAMA', deskripsi: 'Melihat daftar kamar asrama dan kapasitas', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'room.create', nama: 'Tambah Kamar', modul: 'ASRAMA', deskripsi: 'Menambahkan kamar asrama baru', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'room.update', nama: 'Edit Kamar', modul: 'ASRAMA', deskripsi: 'Mengubah kapasitas dan penanggung jawab kamar', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'room.delete', nama: 'Hapus Kamar', modul: 'ASRAMA', deskripsi: 'Menghapus data kamar asrama', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'student.room.assign', nama: 'Penempatan Kamar Santri', modul: 'ASRAMA', deskripsi: 'Menempatkan santri ke kamar asrama', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'student.room.transfer', nama: 'Pindah Kamar Santri', modul: 'ASRAMA', deskripsi: 'Memindahkan kamar santri dan mencatat riwayat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    nama: 'Super Admin',
    keterangan: 'Akses penuh ke seluruh modul, manajemen pengguna, database, dan matriks hak akses',
    permissions: ['*'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'admin',
    nama: 'Admin',
    keterangan: 'Pengelolaan data santri, alumni, rombel kelas, kurikulum, ustadz, asrama, dan laporan',
    permissions: [
      'students.view', 'students.create', 'students.edit', 'students.archive', 'students.export', 'students.print',
      'student.status.change', 'student.graduate', 'student.transfer', 'student.withdraw', 'student.reactivate',
      'alumni.view', 'alumni.create', 'alumni.edit', 'alumni.update', 'alumni.archive', 'alumni.export', 'alumni.print',
      'education.view', 'education.create', 'education.update', 'education.archive', 'education.export',
      'program.view', 'program.create', 'program.update', 'program.delete',
      'class.view', 'class.create', 'class.update', 'class.delete',
      'rombel.view', 'rombel.create', 'rombel.update', 'rombel.delete',
      'student.class.assign', 'student.class.transfer', 'student.class.promote',
      'teacher.view', 'teacher.create', 'teacher.update', 'teacher.archive', 'teacher.assign', 'homeroom.assign', 'mentor.assign',
      'dorm.view', 'dorm.create', 'dorm.update', 'dorm.delete',
      'room.view', 'room.create', 'room.update', 'room.delete',
      'student.room.assign', 'student.room.transfer',
      'learning.view', 'attendance.view', 'reports_grade.view',
      'meetings.view', 'meetings.create', 'meetings.edit', 'meetings.print',
      'lpj.view', 'lpj.create', 'lpj.edit', 'lpj.print', 'lpj.export',
      'documents.view', 'documents.upload', 'documents.download',
      'users.view', 'users.create', 'users.edit',
      'settings.view'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pengasuh',
    nama: 'Pengasuh',
    keterangan: 'Monitoring menyeluruh seluruh data santri, evaluasi laporan, kurikulum, dan riwayat pesantren',
    permissions: [
      'students.view', 'students.export', 'students.print',
      'alumni.view', 'alumni.export', 'alumni.print',
      'education.view', 'education.export', 'program.view', 'class.view', 'rombel.view', 'teacher.view',
      'dorm.view', 'room.view',
      'learning.view', 'attendance.view',
      'reports_grade.view', 'reports_grade.print',
      'meetings.view', 'meetings.print',
      'lpj.view', 'lpj.print',
      'documents.view', 'documents.download',
      'users.view', 'settings.view'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ustadz_guru',
    nama: 'Ustadz / Guru',
    keterangan: 'Akses pembelajaran kitab, pencatatan absensi sorogan, dan input nilai santri',
    permissions: [
      'students.view',
      'education.view', 'class.view', 'rombel.view', 'teacher.view',
      'learning.view', 'learning.create', 'learning.edit',
      'attendance.view', 'attendance.create', 'attendance.edit',
      'reports_grade.view', 'reports_grade.create', 'reports_grade.edit'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'wali_kelas',
    nama: 'Wali Kelas',
    keterangan: 'Pengelolaan data santri di kelas binaan, mutasi rombel, absensi berkala, dan penyusunan rapor',
    permissions: [
      'students.view', 'students.edit',
      'education.view', 'class.view', 'rombel.view', 'student.class.assign', 'student.class.transfer', 'teacher.view',
      'dorm.view', 'room.view',
      'learning.view',
      'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.export',
      'reports_grade.view', 'reports_grade.create', 'reports_grade.edit', 'reports_grade.print',
      'meetings.view'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pengurus',
    nama: 'Pengurus',
    keterangan: 'Pengelolaan ketertiban asrama, kamar santri, agenda rapat kepengurusan, dan absensi jamaah',
    permissions: [
      'students.view',
      'dorm.view', 'dorm.create', 'dorm.update',
      'room.view', 'room.create', 'room.update',
      'student.room.assign', 'student.room.transfer',
      'attendance.view', 'attendance.create', 'attendance.edit',
      'meetings.view', 'meetings.create', 'meetings.print',
      'documents.view', 'documents.upload', 'documents.download'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin-01',
    username: 'superadmin',
    email: 'superadmin@nurusholah.id',
    password_hash: 'admin123',
    nama_lengkap: 'Ust. H. Abdurrahman, M.Pd.',
    nama_panggilan: 'Abdurrahman',
    role: 'super_admin',
    jabatan: 'Super Admin Sistem',
    nomor_hp: '081234567001',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-admin-01',
    username: 'admin',
    email: 'admin@nurusholah.id',
    password_hash: 'admin123',
    nama_lengkap: 'Ahmad Muzakki, S.Kom.',
    nama_panggilan: 'Muzakki',
    role: 'admin',
    jabatan: 'Kepala Tata Usaha Pesantren',
    nomor_hp: '081234567002',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-pengasuh-01',
    username: 'pengasuh',
    email: 'pengasuh@nurusholah.id',
    password_hash: 'pengasuh123',
    nama_lengkap: 'KH. Moh. Sholahuddin Al-Ayyubi',
    nama_panggilan: 'Kiai Sholah',
    role: 'pengasuh',
    jabatan: 'Pengasuh Pondok Pesantren',
    nomor_hp: '081234567003',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-ustadz-01',
    username: 'ustadz',
    email: 'ustadz@nurusholah.id',
    password_hash: 'ustadz123',
    nama_lengkap: 'Ust. Nurul Huda, Lc.',
    nama_panggilan: 'Ustadz Huda',
    role: 'ustadz_guru',
    jabatan: 'Dewan Asatidz / Pengajar Kitab',
    nomor_hp: '081234567004',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-walikelas-01',
    username: 'walikelas',
    email: 'walikelas@nurusholah.id',
    password_hash: 'wali123',
    nama_lengkap: 'Ustz. Maryam Jamilah, S.Pd.I.',
    nama_panggilan: 'Ustz. Maryam',
    role: 'wali_kelas',
    jabatan: 'Wali Kelas 1 Tsanawiyah',
    nomor_hp: '081234567005',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user-pengurus-01',
    username: 'pengurus',
    email: 'pengurus@nurusholah.id',
    password_hash: 'pengurus123',
    nama_lengkap: 'M. Faisal Anshori',
    nama_panggilan: 'Faisal',
    role: 'pengurus',
    jabatan: 'Ketua Keamanan & Ketertiban',
    nomor_hp: '081234567006',
    status: 'aktif',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

class DatabaseService {
  private memoryCache: DatabaseSchema | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): DatabaseSchema {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (parsed && parsed.version === 1) {
          // Auto-migrate schema: ensure permissions & roles are up-to-date with granular permissions
          parsed.permissions = SYSTEM_PERMISSIONS;

          // Merge role definitions to guarantee all granular permissions
          parsed.roles = DEFAULT_ROLES.map(defRole => {
            const existing = parsed.roles.find(r => r.id === defRole.id);
            if (!existing) return defRole;
            // If existing role has old permission format, sync with defRole permissions
            const hasOldFormat = existing.permissions.some(p => p.includes(':'));
            if (hasOldFormat) {
              return { ...existing, permissions: defRole.permissions };
            }
            return existing;
          });

          // Ensure users have new fields: nama_panggilan, jabatan, nomor_hp
          parsed.users = parsed.users.map(u => {
            const initU = INITIAL_USERS.find(iu => iu.id === u.id || iu.username === u.username);
            return {
              ...u,
              nama_panggilan: u.nama_panggilan || initU?.nama_panggilan || u.nama_lengkap.split(' ')[0],
              jabatan: u.jabatan || initU?.jabatan || (u.role === 'super_admin' ? 'Super Admin Sistem' : 'Staf Pesantren'),
              nomor_hp: u.nomor_hp || initU?.nomor_hp || '-'
            };
          });

          const shouldPopulateDefaults = !parsed.is_empty_state;

          // STAGE 4: Auto-migrate education and dormitory data
          if (shouldPopulateDefaults && (!parsed.education_programs || parsed.education_programs.length === 0)) {
            parsed.education_programs = DEFAULT_PROGRAMS;
          } else {
            parsed.education_programs = parsed.education_programs || [];
          }
          if (shouldPopulateDefaults && (!parsed.education_tracks || parsed.education_tracks.length === 0)) {
            parsed.education_tracks = DEFAULT_TRACKS;
          } else {
            parsed.education_tracks = parsed.education_tracks || [];
          }
          if (shouldPopulateDefaults && (!parsed.education_levels || parsed.education_levels.length === 0)) {
            parsed.education_levels = DEFAULT_LEVELS;
          } else {
            parsed.education_levels = parsed.education_levels || [];
          }
          if (shouldPopulateDefaults && (!parsed.academic_years || parsed.academic_years.length === 0)) {
            parsed.academic_years = DEFAULT_ACADEMIC_YEARS;
          } else {
            parsed.academic_years = parsed.academic_years || [];
          }
          if (shouldPopulateDefaults && (!parsed.classes || parsed.classes.length === 0)) {
            parsed.classes = DEFAULT_CLASSES;
          } else {
            parsed.classes = parsed.classes || [];
          }
          if (shouldPopulateDefaults && (!parsed.rombels || parsed.rombels.length === 0)) {
            parsed.rombels = DEFAULT_ROMBELS;
          } else {
            parsed.rombels = parsed.rombels || [];
          }
          if (shouldPopulateDefaults && (!parsed.teachers || parsed.teachers.length === 0)) {
            parsed.teachers = DEFAULT_TEACHERS;
          } else {
            parsed.teachers = parsed.teachers || [];
          }
          if (shouldPopulateDefaults && (!parsed.dorm_buildings || parsed.dorm_buildings.length === 0)) {
            parsed.dorm_buildings = DEFAULT_DORM_BUILDINGS;
          } else {
            parsed.dorm_buildings = parsed.dorm_buildings || [];
          }
          if (shouldPopulateDefaults && (!parsed.dorm_rooms || parsed.dorm_rooms.length === 0)) {
            parsed.dorm_rooms = DEFAULT_DORM_ROOMS;
          } else {
            parsed.dorm_rooms = parsed.dorm_rooms || [];
          }
          if (shouldPopulateDefaults && (!parsed.subjects || parsed.subjects.length === 0)) {
            parsed.subjects = DEFAULT_SUBJECTS;
          } else {
            parsed.subjects = parsed.subjects || [];
          }
          if (shouldPopulateDefaults && (!parsed.teacher_subjects || parsed.teacher_subjects.length === 0)) {
            parsed.teacher_subjects = DEFAULT_TEACHER_SUBJECTS;
          } else {
            parsed.teacher_subjects = parsed.teacher_subjects || [];
          }
          if (!parsed.student_education_history) {
            parsed.student_education_history = [];
          }
          if (!parsed.student_room_history) {
            parsed.student_room_history = [];
          }
          if (!parsed.homeroom_history) {
            parsed.homeroom_history = [];
          }

          // STAGE 5: Auto-migrate academic periods, components, schedules, tahfidz, grades
          if (shouldPopulateDefaults && (!parsed.academic_periods || parsed.academic_periods.length === 0)) {
            parsed.academic_periods = DEFAULT_ACADEMIC_PERIODS;
          } else {
            parsed.academic_periods = parsed.academic_periods || [];
          }
          if (shouldPopulateDefaults && (!parsed.grade_components || parsed.grade_components.length === 0)) {
            parsed.grade_components = DEFAULT_GRADE_COMPONENTS;
          } else {
            parsed.grade_components = parsed.grade_components || [];
          }
          if (shouldPopulateDefaults && (!parsed.schedules || parsed.schedules.length === 0)) {
            parsed.schedules = DEFAULT_SCHEDULES;
          } else {
            parsed.schedules = parsed.schedules || [];
          }
          if (shouldPopulateDefaults && (!parsed.tahfidz_records || parsed.tahfidz_records.length === 0)) {
            parsed.tahfidz_records = DEFAULT_TAHFIDZ_RECORDS;
          } else {
            parsed.tahfidz_records = parsed.tahfidz_records || [];
          }
          if (shouldPopulateDefaults && (!parsed.tahfidz_targets || parsed.tahfidz_targets.length === 0)) {
            parsed.tahfidz_targets = DEFAULT_TAHFIDZ_TARGETS;
          } else {
            parsed.tahfidz_targets = parsed.tahfidz_targets || [];
          }
          if (shouldPopulateDefaults && (!parsed.murojaah_records || parsed.murojaah_records.length === 0)) {
            parsed.murojaah_records = DEFAULT_MUROJAAH_RECORDS;
          } else {
            parsed.murojaah_records = parsed.murojaah_records || [];
          }
          if (shouldPopulateDefaults && (!parsed.btq_records || parsed.btq_records.length === 0)) {
            parsed.btq_records = DEFAULT_BTQ_RECORDS;
          } else {
            parsed.btq_records = parsed.btq_records || [];
          }
          if (shouldPopulateDefaults && (!parsed.attendance_records || parsed.attendance_records.length === 0)) {
            parsed.attendance_records = DEFAULT_ATTENDANCE_RECORDS;
          } else {
            parsed.attendance_records = parsed.attendance_records || [];
          }
          if (shouldPopulateDefaults && (!parsed.student_grades || parsed.student_grades.length === 0)) {
            parsed.student_grades = DEFAULT_STUDENT_GRADES;
          } else {
            parsed.student_grades = parsed.student_grades || [];
          }
          if (!parsed.tahfidz_audit_logs) {
            parsed.tahfidz_audit_logs = [];
          }
          if (!parsed.student_reports) {
            parsed.student_reports = [];
          }

          // STAGE 6: Auto-migrate administration & documents
          if (shouldPopulateDefaults && (!parsed.incoming_letters || parsed.incoming_letters.length === 0)) {
            parsed.incoming_letters = DEFAULT_INCOMING_LETTERS;
          } else {
            parsed.incoming_letters = parsed.incoming_letters || [];
          }
          if (shouldPopulateDefaults && (!parsed.outgoing_letters || parsed.outgoing_letters.length === 0)) {
            parsed.outgoing_letters = DEFAULT_OUTGOING_LETTERS;
          } else {
            parsed.outgoing_letters = parsed.outgoing_letters || [];
          }
          if (shouldPopulateDefaults && (!parsed.student_letters || parsed.student_letters.length === 0)) {
            parsed.student_letters = DEFAULT_STUDENT_LETTERS;
          } else {
            parsed.student_letters = parsed.student_letters || [];
          }
          if (shouldPopulateDefaults && (!parsed.letter_templates || parsed.letter_templates.length === 0)) {
            parsed.letter_templates = DEFAULT_LETTER_TEMPLATES;
          } else {
            parsed.letter_templates = parsed.letter_templates || [];
          }
          if (!parsed.letter_number_configs) {
            parsed.letter_number_configs = [DEFAULT_LETTER_NUMBER_CONFIG];
          }
          if (shouldPopulateDefaults && (!parsed.student_documents || parsed.student_documents.length === 0)) {
            parsed.student_documents = DEFAULT_STUDENT_DOCUMENTS;
          } else {
            parsed.student_documents = parsed.student_documents || [];
          }
          if (shouldPopulateDefaults && (!parsed.document_archives || parsed.document_archives.length === 0)) {
            parsed.document_archives = DEFAULT_DOCUMENT_ARCHIVES;
          } else {
            parsed.document_archives = parsed.document_archives || [];
          }

          // STAGE 7: Auto-migrate Meetings, Decisions, Followups, Results, Reports, Evaluations
          if (shouldPopulateDefaults && (!parsed.pondok_meetings || parsed.pondok_meetings.length === 0)) {
            parsed.pondok_meetings = DEFAULT_PONDOK_MEETINGS;
          } else {
            parsed.pondok_meetings = parsed.pondok_meetings || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_decisions || parsed.meeting_decisions.length === 0)) {
            parsed.meeting_decisions = DEFAULT_MEETING_DECISIONS;
          } else {
            parsed.meeting_decisions = parsed.meeting_decisions || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_followups || parsed.meeting_followups.length === 0)) {
            parsed.meeting_followups = DEFAULT_MEETING_FOLLOWUPS;
          } else {
            parsed.meeting_followups = parsed.meeting_followups || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_results || parsed.meeting_results.length === 0)) {
            parsed.meeting_results = DEFAULT_MEETING_RESULTS;
          } else {
            parsed.meeting_results = parsed.meeting_results || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_reports || parsed.meeting_reports.length === 0)) {
            parsed.meeting_reports = DEFAULT_MEETING_REPORTS;
          } else {
            parsed.meeting_reports = parsed.meeting_reports || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_monthly_evaluations || parsed.meeting_monthly_evaluations.length === 0)) {
            parsed.meeting_monthly_evaluations = DEFAULT_MEETING_EVALUATIONS;
          } else {
            parsed.meeting_monthly_evaluations = parsed.meeting_monthly_evaluations || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_monthly_plans || parsed.meeting_monthly_plans.length === 0)) {
            parsed.meeting_monthly_plans = DEFAULT_MEETING_PLANS;
          } else {
            parsed.meeting_monthly_plans = parsed.meeting_monthly_plans || [];
          }
          if (shouldPopulateDefaults && (!parsed.meeting_templates || parsed.meeting_templates.length === 0)) {
            parsed.meeting_templates = DEFAULT_MEETING_TEMPLATES;
          } else {
            parsed.meeting_templates = parsed.meeting_templates || [];
          }
          if (!parsed.meeting_attachments) {
            parsed.meeting_attachments = [];
          }

          // Backfill students to ensure valid relation IDs
          if (parsed.students && parsed.students.length > 0) {
            parsed.students = parsed.students.map((s, idx) => {
              let pId = s.program_id;
              let tId = s.track_id;
              let lId = s.level_id;
              let cId = s.kelas_id;
              let rId = s.rombel_id;
              let rName = s.rombel;
              let bId = s.dorm_building_id;
              let roomId = s.room_id;
              let asramaName = s.asrama;
              let kamarName = s.nomor_kamar;
              let pembimbingName = s.pembimbing;
              let mentorId = s.mentor_id;

              if (!pId) {
                if (s.program && s.program.toLowerCase().includes('tahfidz')) {
                  pId = 'prog-tahfidz';
                  lId = 'lvl-tahfidz-utama';
                  cId = cId || 'cls-tahfidz';
                  rId = rId || (s.jenis_kelamin === 'P' ? 'rombel-tahfidz-b' : 'rombel-tahfidz-a');
                  rName = rName || (s.jenis_kelamin === 'P' ? 'Halaqah 2 (Tahfidz Putri)' : 'Halaqah 1 (Tahfidz Putra)');
                  pembimbingName = pembimbingName || (s.jenis_kelamin === 'P' ? 'Ustz. Siti Fatimah, S.Ag., M.Ag.' : 'Ust. Abdullah Sajjad, S.Pd.');
                  mentorId = mentorId || (s.jenis_kelamin === 'P' ? 'tchr-03' : 'tchr-04');
                } else if (s.program && s.program.toLowerCase().includes('btq')) {
                  pId = 'prog-btq';
                  lId = 'lvl-btq-dasar';
                  cId = cId || 'cls-btq';
                  rId = rId || 'rombel-btq-a';
                  rName = rName || 'Rombel BTQ Dasar';
                  pembimbingName = pembimbingName || 'Ust. Mahrus Ali, S.Sos.I.';
                  mentorId = mentorId || 'tchr-05';
                } else {
                  pId = 'prog-kitabiyah';
                  tId = tId || 'track-safinah';
                  lId = lId || (idx % 2 === 0 ? 'lvl-mubtadi' : 'lvl-mutawassith');
                  cId = cId || (idx % 2 === 0 ? 'cls-mubtadi' : 'cls-mutawassith');
                  rId = rId || (idx % 2 === 0 ? 'rombel-mubtadi-a' : 'rombel-mutawassith-a');
                  rName = rName || (idx % 2 === 0 ? "Rombel A (Mubtadi' Putra)" : 'Rombel A (Mutawassith)');
                  pembimbingName = pembimbingName || 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.';
                  mentorId = mentorId || 'tchr-01';
                }
              }

              if (!roomId) {
                if (s.jenis_kelamin === 'P') {
                  bId = 'bld-03';
                  roomId = 'room-05';
                  asramaName = 'Gedung Siti Khadijah (Putri 1)';
                  kamarName = 'Kamar Khadijah 01';
                } else {
                  bId = 'bld-01';
                  roomId = idx % 2 === 0 ? 'room-01' : 'room-02';
                  asramaName = 'Gedung Al-Ghazali (Putra 1)';
                  kamarName = idx % 2 === 0 ? 'Kamar 01 - Abu Bakar' : 'Kamar 02 - Umar bin Khattab';
                }
              }

              return {
                ...s,
                program_id: pId,
                track_id: tId,
                level_id: lId,
                kelas_id: cId,
                rombel_id: rId,
                rombel: rName,
                dorm_building_id: bId,
                room_id: roomId,
                asrama: asramaName,
                nomor_kamar: kamarName,
                pembimbing: pembimbingName,
                mentor_id: mentorId
              };
            });
          }

          this.saveToStorage(parsed);
          this.memoryCache = parsed;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data dari localStorage, menggunakan initial schema:', e);
    }

    const initialDb: DatabaseSchema = {
      version: 1,
      users: INITIAL_USERS,
      roles: DEFAULT_ROLES,
      permissions: SYSTEM_PERMISSIONS,
      students: [],
      student_history: [],
      alumni: [],
      classes: DEFAULT_CLASSES,
      teachers: DEFAULT_TEACHERS,
      settings: DEFAULT_SETTINGS,
      education_programs: DEFAULT_PROGRAMS,
      education_tracks: DEFAULT_TRACKS,
      education_levels: DEFAULT_LEVELS,
      academic_years: DEFAULT_ACADEMIC_YEARS,
      rombels: DEFAULT_ROMBELS,
      dorm_buildings: DEFAULT_DORM_BUILDINGS,
      dorm_rooms: DEFAULT_DORM_ROOMS,
      subjects: DEFAULT_SUBJECTS,
      teacher_subjects: DEFAULT_TEACHER_SUBJECTS,
      student_education_history: [],
      student_room_history: [],
      homeroom_history: [],
      audit_logs: [
        {
          id: generateUUID(),
          user_id: 'user-superadmin-01',
          user_name: 'Ust. H. Abdurrahman, M.Pd.',
          user_role: 'Super Admin',
          aktivitas: 'Perubahan pengaturan',
          modul: 'Sistem',
          data_terkait: 'Inisialisasi basis data fondasi sistem pesantren (Kurikulum Stage 4 & Asrama)',
          ip_device: '127.0.0.1 (Local Browser)',
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          created_at: new Date().toISOString()
        }
      ]
    };

    this.saveToStorage(initialDb);
    this.memoryCache = initialDb;
    return initialDb;
  }

  private saveToStorage(db: DatabaseSchema): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
      this.memoryCache = db;
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('database-change', { detail: { isEmpty: !!db.is_empty_state } }));
        }
      } catch (_) {}
    } catch (e) {
      console.error('Gagal menyimpan database ke localStorage:', e);
    }
  }

  public getRawData(): DatabaseSchema {
    if (!this.memoryCache) {
      return this.initDatabase();
    }
    return this.memoryCache;
  }

  public loadFromCloud(incoming: Partial<DatabaseSchema>): void {
    if (!incoming) return;
    const current = this.getRawData();
    const merged: DatabaseSchema = {
      ...current,
      ...incoming,
      settings: incoming.settings ? { ...current.settings, ...incoming.settings } : current.settings,
    };
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(merged));
      this.memoryCache = merged;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('database-change', { detail: { fromCloud: true, isEmpty: !!merged.is_empty_state } }));
      }
    } catch (e) {
      console.error('Error saving merged cloud data:', e);
    }
  }

  // --- Reset & Demo Loader ---
  public resetDatabaseToEmpty(scope: 'students_only' | 'all_operational' = 'all_operational'): void {
    const current = this.getRawData();
    const isTotal = scope === 'all_operational';

    const emptyDb: DatabaseSchema = {
      ...current,
      is_empty_state: true,
      // Always empty student & student records
      students: [],
      student_history: [],
      alumni: [],
      student_graduations: [],
      student_transfers: [],
      student_withdrawals: [],
      classes: [],
      rombels: [],
      student_education_history: [],
      homeroom_history: [],
      student_room_history: [],
      student_grades: [],
      tahfidz_records: [],
      tahfidz_targets: [],
      tahfidz_audit_logs: [],
      murojaah_records: [],
      btq_records: [],
      attendance_records: [],
      student_reports: [],
      student_letters: [],
      student_documents: [],

      // If all operational, also empty teachers, schedules, administration, finance, and meetings
      ...(isTotal
        ? {
            teachers: [],
            teacher_subjects: [],
            schedules: [],
            grade_components: [],
            education_programs: [],
            education_tracks: [],
            education_levels: [],
            dorm_buildings: [],
            dorm_rooms: [],
            subjects: [],
            incoming_letters: [],
            outgoing_letters: [],
            document_archives: [],
            financial_transactions: [],
            expense_requests: [],
            expense_approvals: [],
            pondok_activities: [],
            activity_participants: [],
            activity_budgets: [],
            activity_lpjs: [],
            pondok_meetings: [],
            meeting_participants: [],
            meeting_agendas: [],
            meeting_minutes: [],
            meeting_decisions: [],
            meeting_followups: [],
            meeting_results: [],
            meeting_reports: [],
            meeting_monthly_evaluations: [],
            meeting_monthly_plans: [],
            meeting_attachments: [],
            operational_notifications: []
          }
        : {
            teachers: current.teachers || []
          }),

      audit_logs: [
        {
          id: generateUUID(),
          user_id: 'user-admin-01',
          user_name: 'Admin Sistem',
          user_role: 'Admin',
          aktivitas: 'Perubahan pengaturan',
          modul: 'Database',
          data_terkait: isTotal
            ? 'Reset basis data operasional ke kondisi awal 0 data (Santri, Rombel, Surat, Keuangan & Rapat)'
            : 'Reset basis data santri dan kelas ke kondisi awal kosong (0 data)',
          ip_device: '127.0.0.1 (Local Browser)',
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          created_at: new Date().toISOString()
        },
        ...(current.audit_logs || []).slice(0, 10)
      ]
    };
    this.saveToStorage(emptyDb);
  }

  public resetToInitialSeed(): void {
    try {
      localStorage.removeItem(DB_STORAGE_KEY);
      this.memoryCache = null;
      this.initDatabase();
    } catch (e) {
      console.error('Gagal me-reset database ke initial seed:', e);
    }
  }

  public loadDemoData(): void {
    const current = this.getRawData();
    const now = new Date().toISOString();

    const demoTeachers: Teacher[] = [
      {
        id: 'tchr-01',
        nip: '198501102010011002',
        nama_lengkap: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
        gelar: 'Lc., M.Hum.',
        jenis_kelamin: 'L',
        nomor_hp: '081234567891',
        email: 'baihaqi@nurusholah.id',
        jabatan: 'Kepala Bagian Pendidikan',
        bidang_studi: 'Nahwu & Shorof',
        status: 'aktif',
        created_at: now,
        updated_at: now
      },
      {
        id: 'tchr-02',
        nip: '198804152012011005',
        nama_lengkap: 'Ust. M. Cholilur Rahman, S.Pd.I.',
        gelar: 'S.Pd.I.',
        jenis_kelamin: 'L',
        nomor_hp: '081234567892',
        email: 'cholil@nurusholah.id',
        jabatan: 'Wali Kelas 3 Tsanawiyah',
        bidang_studi: 'Fiqih & Fathul Qorib',
        status: 'aktif',
        created_at: now,
        updated_at: now
      },
      {
        id: 'tchr-03',
        nip: '199207202015022003',
        nama_lengkap: 'Ustz. Siti Fatimah, S.Ag., M.Ag.',
        gelar: 'S.Ag., M.Ag.',
        jenis_kelamin: 'P',
        nomor_hp: '081234567893',
        email: 'fatimah@nurusholah.id',
        jabatan: 'Pembina Tahfidz Putri',
        bidang_studi: 'Tahfidz Al-Qur\'an',
        status: 'aktif',
        created_at: now,
        updated_at: now
      }
    ];

    const demoClasses: SchoolClass[] = [
      {
        id: 'cls-01',
        nama_kelas: '1 Tsanawiyah Putra',
        tingkat: 'Tsanawiyah',
        wali_kelas_id: 'tchr-01',
        wali_kelas_nama: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
        tahun_ajaran: '2026/2027',
        kapasitas: 35,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cls-02',
        nama_kelas: '2 Tsanawiyah Putra',
        tingkat: 'Tsanawiyah',
        wali_kelas_id: 'tchr-02',
        wali_kelas_nama: 'Ust. M. Cholilur Rahman, S.Pd.I.',
        tahun_ajaran: '2026/2027',
        kapasitas: 32,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cls-03',
        nama_kelas: '1 Aliyah Unggulan',
        tingkat: 'Aliyah',
        wali_kelas_id: 'tchr-01',
        wali_kelas_nama: 'Ust. H. Ahmad Baihaqi, Lc., M.Hum.',
        tahun_ajaran: '2026/2027',
        kapasitas: 30,
        created_at: now,
        updated_at: now
      },
      {
        id: 'cls-04',
        nama_kelas: 'Tahfidz Al-Qur\'an Khusus',
        tingkat: 'Tahfidz',
        wali_kelas_id: 'tchr-03',
        wali_kelas_nama: 'Ustz. Siti Fatimah, S.Ag., M.Ag.',
        tahun_ajaran: '2026/2027',
        kapasitas: 25,
        created_at: now,
        updated_at: now
      }
    ];

    const demoStudents: Student[] = [
      {
        id: 'std-demo-01',
        nis: '2026001',
        nisn: '0089123451',
        nik: '3528051203080001',
        nama_lengkap: 'Muhammad Fadhil Ramadhan [DATA DEMO]',
        nama_panggilan: 'Fadhil',
        jenis_kelamin: 'L',
        tempat_lahir: 'Pamekasan',
        tanggal_lahir: '2009-09-15',
        nomor_kk: '3528051010080001',
        alamat: 'Dusun Timur, RT 02 / RW 01',
        dusun: 'Timur',
        desa: 'Akkor',
        kecamatan: 'Palengaan',
        kabupaten: 'Pamekasan',
        provinsi: 'Jawa Timur',
        kode_pos: '69362',
        nomor_hp: '085233112233',
        tahun_masuk: 2026,
        tanggal_masuk: '2026-07-10',
        asal_sekolah: 'MI Nurus Sholah Akkor',
        program: 'Tahfidz Al-Qur\'an',
        kelas_id: 'cls-04',
        status: 'aktif',
        foto: '',
        catatan: '[DATA DEMO] Santri berprestasi hafalan 5 juz, santun dan disiplin',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-02',
        nis: '2025014',
        nisn: '0078234562',
        nik: '3528051405070002',
        nama_lengkap: 'Ahmad Zaini Muttaqin [DATA DEMO]',
        nama_panggilan: 'Zaini',
        jenis_kelamin: 'L',
        tempat_lahir: 'Sampang',
        tanggal_lahir: '2008-04-20',
        nomor_kk: '3528051010080002',
        alamat: 'Jl. Raya Camplong No. 12',
        dusun: 'Barat',
        desa: 'Banjar',
        kecamatan: 'Camplong',
        kabupaten: 'Sampang',
        provinsi: 'Jawa Timur',
        kode_pos: '69281',
        nomor_hp: '085233445566',
        tahun_masuk: 2025,
        tanggal_masuk: '2025-07-12',
        asal_sekolah: 'SMP Negeri 1 Camplong',
        program: 'Reguler Salaf & Kitab',
        kelas_id: 'cls-02',
        status: 'aktif',
        foto: '',
        catatan: '[DATA DEMO] Aktif kajian Alfiyah Ibnu Malik',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-03',
        nis: '2026045',
        nisn: '0091234567',
        nik: '3528052208090003',
        nama_lengkap: 'Mohammad Faris Al-Faruq [DATA DEMO]',
        nama_panggilan: 'Faris',
        jenis_kelamin: 'L',
        tempat_lahir: 'Sumenep',
        tanggal_lahir: '2010-01-05',
        nomor_kk: '3528051010080003',
        alamat: 'Jl. Raya Gapura KM 5',
        dusun: 'Krajan',
        desa: 'Gapura',
        kecamatan: 'Gapura',
        kabupaten: 'Sumenep',
        provinsi: 'Jawa Timur',
        kode_pos: '69472',
        nomor_hp: '087811223344',
        tahun_masuk: 2026,
        tanggal_masuk: '2026-07-15',
        asal_sekolah: 'SD Negeri 1 Gapura',
        program: 'Reguler Salaf & Kitab',
        kelas_id: 'cls-01',
        status: 'aktif',
        foto: '',
        catatan: '[DATA DEMO] Santri baru tahun ajaran 2026/2027',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-04',
        nis: '2022005',
        nisn: '0054321980',
        nik: '3528051801050004',
        nama_lengkap: 'Hasan Basri [DATA DEMO]',
        nama_panggilan: 'Hasan',
        jenis_kelamin: 'L',
        tempat_lahir: 'Pamekasan',
        tanggal_lahir: '2005-06-12',
        nomor_kk: '3528051010080004',
        alamat: 'Dusun Batulabang',
        dusun: 'Batulabang',
        desa: 'Akkor',
        kecamatan: 'Palengaan',
        kabupaten: 'Pamekasan',
        provinsi: 'Jawa Timur',
        kode_pos: '69362',
        nomor_hp: '081399887766',
        tahun_masuk: 2022,
        tanggal_masuk: '2022-07-08',
        asal_sekolah: 'MTs Nurus Sholah',
        program: 'Kombinasi Formal/Madrasah',
        kelas_id: null,
        status: 'alumni',
        foto: '',
        catatan: '[DATA DEMO] Lulusan angkatan 2025, saat ini kuliah di UIN Maulana Malik Ibrahim Malang',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-05',
        nis: '2021012',
        nisn: '0049876543',
        nik: '3528051902040005',
        nama_lengkap: 'M. Syamsul Arifin [DATA DEMO]',
        nama_panggilan: 'Syamsul',
        jenis_kelamin: 'L',
        tempat_lahir: 'Bangkalan',
        tanggal_lahir: '2004-11-28',
        nomor_kk: '3528051010080005',
        alamat: 'Jl. Pemuda No. 45',
        dusun: 'Krajan',
        desa: 'Kamal',
        kecamatan: 'Kamal',
        kabupaten: 'Bangkalan',
        provinsi: 'Jawa Timur',
        kode_pos: '69162',
        nomor_hp: '085733221100',
        tahun_masuk: 2021,
        tanggal_masuk: '2021-07-05',
        asal_sekolah: 'SMP Kamal Bangkalan',
        program: 'Reguler Salaf & Kitab',
        kelas_id: null,
        status: 'lulus',
        foto: '',
        catatan: '[DATA DEMO] Telah dinyatakan lulus munaqasyah kitab kuning',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-06',
        nis: '2024033',
        nisn: '0076543210',
        nik: '3528051509070006',
        nama_lengkap: 'Bahrul Ulum [DATA DEMO]',
        nama_panggilan: 'Bahrul',
        jenis_kelamin: 'L',
        tempat_lahir: 'Surabaya',
        tanggal_lahir: '2007-08-14',
        nomor_kk: '3528051010080006',
        alamat: 'Jl. Rungkut Asri Timur No. 8',
        dusun: 'Rungkut',
        desa: 'Rungkut Kidul',
        kecamatan: 'Rungkut',
        kabupaten: 'Kota Surabaya',
        provinsi: 'Jawa Timur',
        kode_pos: '60293',
        nomor_hp: '082155443322',
        tahun_masuk: 2024,
        tanggal_masuk: '2024-07-11',
        asal_sekolah: 'MTs Al-Ihsan Surabaya',
        program: 'Reguler Salaf & Kitab',
        kelas_id: null,
        status: 'pindah',
        foto: '',
        catatan: '[DATA DEMO] Pindah ke PP Sidogiri Pasuruan mengikuti domisili orang tua',
        is_demo: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 'std-demo-07',
        nis: '2024089',
        nisn: '0077889901',
        nik: '3528052512070007',
        nama_lengkap: 'Dany Ramdani [DATA DEMO]',
        nama_panggilan: 'Dany',
        jenis_kelamin: 'L',
        tempat_lahir: 'Pamekasan',
        tanggal_lahir: '2007-12-03',
        nomor_kk: '3528051010080007',
        alamat: 'Dusun Tengah, Desa Banyupelle',
        dusun: 'Tengah',
        desa: 'Banyupelle',
        kecamatan: 'Palengaan',
        kabupaten: 'Pamekasan',
        provinsi: 'Jawa Timur',
        kode_pos: '69362',
        nomor_hp: '081977665544',
        tahun_masuk: 2024,
        tanggal_masuk: '2024-07-11',
        asal_sekolah: 'SMP Plus Palengaan',
        program: 'Reguler Salaf & Kitab',
        kelas_id: null,
        status: 'keluar',
        foto: '',
        catatan: '[DATA DEMO] Keluar atas permohonan wali santri karena faktor kesehatan',
        is_demo: true,
        created_at: now,
        updated_at: now
      }
    ];

    const demoAlumni: Alumni[] = [
      {
        id: 'alm-demo-01',
        student_id: 'std-demo-04',
        id_alumni: 'ALM-2025-001',
        tahun_masuk: 2022,
        tahun_lulus: 2025,
        tanggal_lulus: '2025-05-20',
        program: 'Kombinasi Formal/Madrasah',
        alamat: 'Dusun Batulabang, Desa Akkor, Palengaan, Pamekasan',
        nomor_hp: '081399887766',
        email: 'hasan.basri@alumni.nurusholah.id',
        pendidikan_lanjutan: 'UIN Maulana Malik Ibrahim Malang (Pendidikan Agama Islam)',
        pekerjaan: 'Mahasiswa / Guru TPQ',
        tempat_kerja: 'TPQ Nurul Hikmah Malang',
        status: 'kuliah',
        catatan: '[DATA DEMO] Menjabat Ketua Ikatan Alumni Santri Nurus Sholah Koordinator Malang',
        is_demo: true,
        created_at: now,
        updated_at: now
      }
    ];

    const demoHistories: StudentHistory[] = [
      {
        id: generateUUID(),
        student_id: 'std-demo-01',
        tanggal: '2026-07-10',
        jenis_perubahan: 'Registrasi Awal',
        status_lama: null,
        status_baru: 'aktif',
        kelas_lama: null,
        kelas_baru: 'Tahfidz Al-Qur\'an Khusus',
        keterangan: 'Pendaftaran santri baru tahun ajaran 2026/2027 dan penempatan kelas Tahfidz',
        user_id: 'user-admin-01',
        created_at: now
      },
      {
        id: generateUUID(),
        student_id: 'std-demo-04',
        tanggal: '2025-05-20',
        jenis_perubahan: 'Lulus',
        status_lama: 'aktif',
        status_baru: 'alumni',
        kelas_lama: '3 Aliyah Unggulan',
        kelas_baru: null,
        keterangan: 'Dinyatakan lulus dengan predikat Mumtaz dan terdaftar dalam basis data Ikatan Alumni',
        user_id: 'user-admin-01',
        created_at: now
      },
      {
        id: generateUUID(),
        student_id: 'std-demo-06',
        tanggal: '2025-11-15',
        jenis_perubahan: 'Pindah',
        status_lama: 'aktif',
        status_baru: 'pindah',
        kelas_lama: '2 Tsanawiyah Putra',
        kelas_baru: null,
        keterangan: 'Pindah ke PP Sidogiri Pasuruan dengan surat rekomendasi resmi',
        user_id: 'user-admin-01',
        created_at: now
      },
      {
        id: generateUUID(),
        student_id: 'std-demo-07',
        tanggal: '2025-10-02',
        jenis_perubahan: 'Keluar',
        status_lama: 'aktif',
        status_baru: 'keluar',
        kelas_lama: '1 Tsanawiyah Putra',
        kelas_baru: null,
        keterangan: 'Pengunduran diri atas permohonan keluarga karena pengobatan medis',
        user_id: 'user-admin-01',
        created_at: now
      }
    ];

    const demoAudit: AuditLog = {
      id: generateUUID(),
      user_id: 'user-admin-01',
      user_name: 'Ahmad Muzakki, S.Kom.',
      user_role: 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Database',
      data_terkait: 'Memuat DATA DEMO testing (7 santri, 1 alumni, 4 kelas, 3 guru/ustadz)',
      ip_device: '127.0.0.1 (Local Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...current,
      is_empty_state: false,
      students: demoStudents,
      classes: demoClasses,
      teachers: demoTeachers,
      alumni: demoAlumni,
      student_history: demoHistories,
      audit_logs: [demoAudit, ...current.audit_logs]
    };

    this.saveToStorage(updatedDb);
  }

  // --- Statistics Helpers ---
  public getDashboardStats() {
    const db = this.getRawData();
    const students = db.students || [];
    const alumniList = db.alumni || [];
    const teachersList = db.teachers || [];
    const classesList = db.classes || [];

    // Active students exclude archived
    const activeStudents = students.filter(s => s.status === 'aktif' && !s.is_archived);
    const totalAktif = activeStudents.length;
    const santriPutra = activeStudents.filter(s => s.jenis_kelamin === 'L').length;
    const santriPutri = activeStudents.filter(s => s.jenis_kelamin === 'P').length;

    // Count from alumni table or santri with status alumni
    const totalAlumni = alumniList.length;
    const totalGuru = teachersList.length;
    const totalKelas = classesList.length;
    const totalArsip = students.filter(s => s.is_archived).length;

    const currentYear = new Date().getFullYear();
    const santriBaru = students.filter(s => {
      const year = Number(s.tahun_masuk);
      return (year >= currentYear || s.status === 'calon_santri') && !s.is_archived;
    }).length;

    const santriLulus = students.filter(s => s.status === 'lulus').length;
    const santriPindah = students.filter(s => s.status === 'pindah').length;
    const santriKeluar = students.filter(s => s.status === 'keluar').length;
    const santriTidakAktif = students.filter(s => s.status === 'tidak_aktif').length;
    const santriCalon = students.filter(s => s.status === 'calon_santri').length;

    return {
      totalAktif,
      santriPutra,
      santriPutri,
      totalAlumni,
      totalGuru,
      totalKelas,
      totalArsip,
      santriBaru,
      santriLulus,
      santriPindah,
      santriKeluar,
      santriTidakAktif,
      santriCalon,
      isDatabaseEmpty: students.length === 0 && alumniList.length === 0 && teachersList.length === 0
    };
  }

  // --- Students CRUD & Utilities ---
  public getStudents(includeArchived: boolean = true): Student[] {
    const students = this.getRawData().students;
    if (includeArchived) return students;
    return students.filter(s => !s.is_archived);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getRawData().students.find(s => s.id === id);
  }

  public generateNextNis(targetYear?: number | string): string {
    const db = this.getRawData();
    const year = targetYear ? String(targetYear) : String(new Date().getFullYear());
    const students = db.students || [];

    // Format pattern: "NS-[YEAR]-XXXX"
    const prefix = `NS-${year}-`;
    let maxNum = 0;

    students.forEach(s => {
      if (s.nis) {
        if (s.nis.startsWith(prefix)) {
          const numPart = parseInt(s.nis.substring(prefix.length), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        } else if (s.nis.startsWith(year)) {
          const numPart = parseInt(s.nis.substring(year.length), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      }
    });

    const nextSeq = String(maxNum + 1).padStart(4, '0');
    return `${prefix}${nextSeq}`;
  }

  public generateNextAlumniId(targetYear?: number | string): string {
    const db = this.getRawData();
    const year = targetYear ? String(targetYear) : String(new Date().getFullYear());
    const alumniList = db.alumni || [];
    const prefix = `ALM-${year}-`;
    let maxNum = 0;

    alumniList.forEach(a => {
      if (a.id_alumni) {
        if (a.id_alumni.startsWith(prefix)) {
          const numPart = parseInt(a.id_alumni.substring(prefix.length), 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        } else if (a.id_alumni.startsWith('ALM-')) {
          const parts = a.id_alumni.split('-');
          if (parts.length >= 3) {
            const numPart = parseInt(parts[2], 10);
            if (!isNaN(numPart) && numPart > maxNum) {
              maxNum = numPart;
            }
          }
        }
      }
    });

    const nextSeq = String(maxNum + 1).padStart(4, '0');
    return `${prefix}${nextSeq}`;
  }

  public checkStudentDuplicate(
    data: Partial<Student>, 
    excludeId?: string
  ): { isDuplicate: boolean; reason?: string } {
    const db = this.getRawData();
    const students = (db.students || []).filter(s => s.id !== excludeId);

    // 1. Check NIS
    if (data.nis && data.nis.trim()) {
      const match = students.find(s => s.nis && s.nis.trim().toLowerCase() === data.nis!.trim().toLowerCase());
      if (match) {
        return {
          isDuplicate: true,
          reason: `Nomor Induk Santri (NIS) "${data.nis}" sudah digunakan oleh ${match.nama_lengkap}.`
        };
      }
    }

    // 2. Check NIK (jika diisi)
    if (data.nik && data.nik.trim().length >= 10) {
      const match = students.find(s => s.nik && s.nik.trim() === data.nik!.trim());
      if (match) {
        return {
          isDuplicate: true,
          reason: `Data dengan NIK "${data.nik}" sudah terdaftar atas nama ${match.nama_lengkap} (NIS: ${match.nis}).`
        };
      }
    }

    // 3. Check NISN (jika diisi)
    if (data.nisn && data.nisn.trim().length >= 8) {
      const match = students.find(s => s.nisn && s.nisn.trim() === data.nisn!.trim());
      if (match) {
        return {
          isDuplicate: true,
          reason: `Data dengan NISN "${data.nisn}" sudah terdaftar atas nama ${match.nama_lengkap} (NIS: ${match.nis}).`
        };
      }
    }

    // 4. Check Nama Lengkap + Tanggal Lahir yang sama persis
    if (data.nama_lengkap && data.tanggal_lahir) {
      const cleanName = data.nama_lengkap.trim().toLowerCase();
      const match = students.find(s => 
        s.nama_lengkap && 
        s.nama_lengkap.trim().toLowerCase() === cleanName && 
        s.tanggal_lahir === data.tanggal_lahir
      );
      if (match) {
        return {
          isDuplicate: true,
          reason: `Santri dengan nama "${data.nama_lengkap}" dan tanggal lahir "${data.tanggal_lahir}" sudah terdaftar (NIS: ${match.nis}). Data ini kemungkinan merupakan santri yang sudah ada.`
        };
      }
    }

    return { isDuplicate: false };
  }

  public createStudent(
    studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>, 
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'students.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah data santri (students.create).');
    }

    // Check duplicate
    const dupCheck = this.checkStudentDuplicate(studentData);
    if (dupCheck.isDuplicate) {
      throw new Error(`Peringatan Duplikasi: ${dupCheck.reason}`);
    }

    const db = this.getRawData();
    const now = new Date().toISOString();

    // Auto-generate NIS if not provided
    const finalNis = (studentData.nis && studentData.nis.trim()) 
      ? studentData.nis.trim() 
      : this.generateNextNis(studentData.tahun_masuk || 2026);

    const newStudent: Student = {
      ...studentData,
      id: generateUUID(),
      nis: finalNis,
      is_archived: false,
      created_at: now,
      updated_at: now
    };

    // Auto-create initial history record
    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: newStudent.id,
      tanggal: newStudent.tanggal_masuk || now.slice(0, 10),
      jenis_perubahan: 'Registrasi Awal',
      status_lama: null,
      status_baru: newStudent.status,
      kelas_lama: null,
      kelas_baru: newStudent.kelas_id ? this.getClassName(newStudent.kelas_id) : 'Belum Ditentukan',
      keterangan: `Pendaftaran data santri baru ${newStudent.nama_lengkap} (NIS: ${newStudent.nis})`,
      user_id: currentUser?.id || 'system',
      created_at: now
    };

    // Auto-log audit
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Data Santri',
      data_terkait: `Tambah santri baru: ${newStudent.nama_lengkap} (NIS: ${newStudent.nis})`,
      data_sesudah: `Nama: ${newStudent.nama_lengkap}, NIS: ${newStudent.nis}, Status: ${newStudent.status}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: [newStudent, ...db.students],
      student_history: [historyEntry, ...db.student_history],
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return newStudent;
  }

  public updateStudent(
    id: string, 
    updates: Partial<Student>, 
    currentUser?: User
  ): Student | null {
    if (currentUser && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah data santri (students.edit).');
    }

    const dupCheck = this.checkStudentDuplicate(updates, id);
    if (dupCheck.isDuplicate) {
      throw new Error(`Peringatan Duplikasi: ${dupCheck.reason}`);
    }

    const db = this.getRawData();
    const index = db.students.findIndex(s => s.id === id);
    if (index === -1) return null;

    const oldStudent = db.students[index];
    const now = new Date().toISOString();

    const updatedStudent: Student = {
      ...oldStudent,
      ...updates,
      updated_at: now
    };

    const newHistory: StudentHistory[] = [...db.student_history];

    // Detect status or class changes to record in history
    if (updates.status && updates.status !== oldStudent.status) {
      newHistory.unshift({
        id: generateUUID(),
        student_id: id,
        tanggal: new Date().toISOString().slice(0, 10),
        jenis_perubahan: 'Perubahan Status',
        status_lama: oldStudent.status,
        status_baru: updates.status,
        kelas_lama: oldStudent.kelas_id ? this.getClassName(oldStudent.kelas_id) : null,
        kelas_baru: updatedStudent.kelas_id ? this.getClassName(updatedStudent.kelas_id) : null,
        keterangan: `Perubahan status santri dari ${oldStudent.status} menjadi ${updates.status}`,
        user_id: currentUser?.id || 'system',
        created_at: now
      });
    }

    if (updates.kelas_id && updates.kelas_id !== oldStudent.kelas_id) {
      newHistory.unshift({
        id: generateUUID(),
        student_id: id,
        tanggal: new Date().toISOString().slice(0, 10),
        jenis_perubahan: 'Pindah Kelas',
        status_lama: oldStudent.status,
        status_baru: updatedStudent.status,
        kelas_lama: oldStudent.kelas_id ? this.getClassName(oldStudent.kelas_id) : null,
        kelas_baru: this.getClassName(updates.kelas_id),
        keterangan: `Perpindahan kelas santri ke ${this.getClassName(updates.kelas_id)}`,
        user_id: currentUser?.id || 'system',
        created_at: now
      });
    }

    if (updates.asrama && updates.asrama !== oldStudent.asrama) {
      newHistory.unshift({
        id: generateUUID(),
        student_id: id,
        tanggal: new Date().toISOString().slice(0, 10),
        jenis_perubahan: 'Perubahan Asrama',
        status_lama: oldStudent.status,
        status_baru: updatedStudent.status,
        kelas_lama: null,
        kelas_baru: null,
        keterangan: `Perpindahan asrama dari "${oldStudent.asrama || 'Belum diatur'}" ke "${updates.asrama}"`,
        user_id: currentUser?.id || 'system',
        created_at: now
      });
    }

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Data Santri',
      data_terkait: `Perbarui data santri: ${updatedStudent.nama_lengkap} (NIS: ${updatedStudent.nis})`,
      data_sebelum: `Status: ${oldStudent.status}, Kelas: ${oldStudent.kelas_id || '-'}`,
      data_sesudah: `Status: ${updatedStudent.status}, Kelas: ${updatedStudent.kelas_id || '-'}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const newStudents = [...db.students];
    newStudents[index] = updatedStudent;

    const updatedDb: DatabaseSchema = {
      ...db,
      students: newStudents,
      student_history: newHistory,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return updatedStudent;
  }

  public archiveStudent(
    studentId: string, 
    alasan: string = 'Diarsipkan oleh administrator', 
    currentUser?: User
  ): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'students.archive')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengarsipkan santri (students.archive).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) return false;

    const now = new Date().toISOString();
    const oldStatus = student.status;
    student.is_archived = true;
    student.status = 'tidak_aktif';
    student.tanggal_arsip = now.slice(0, 10);
    student.alasan_arsip = alasan;
    student.updated_at = now;

    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: studentId,
      tanggal: now.slice(0, 10),
      jenis_perubahan: 'Pengarsipan',
      status_lama: oldStatus,
      status_baru: 'tidak_aktif',
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: `Santri diarsipkan. Alasan: ${alasan}`,
      user_id: currentUser?.id || 'system',
      created_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Data Santri',
      data_terkait: `Mengarsipkan data santri: ${student.nama_lengkap} (NIS: ${student.nis}). Alasan: ${alasan}`,
      data_sebelum: `Status: ${oldStatus}, Archived: false`,
      data_sesudah: `Status: tidak_aktif, Archived: true`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.map(s => s.id === studentId ? student : s),
      student_history: [historyEntry, ...db.student_history],
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public restoreStudent(studentId: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'students.archive')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memulihkan arsip santri (students.archive).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) return false;

    const now = new Date().toISOString();
    student.is_archived = false;
    student.status = 'aktif';
    student.alasan_arsip = undefined;
    student.updated_at = now;

    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: studentId,
      tanggal: now.slice(0, 10),
      jenis_perubahan: 'Pemulihan',
      status_lama: 'tidak_aktif',
      status_baru: 'aktif',
      kelas_lama: null,
      kelas_baru: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      keterangan: `Memulihkan santri dari arsip kembali ke status aktif`,
      user_id: currentUser?.id || 'system',
      created_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Data Santri',
      data_terkait: `Memulihkan santri dari arsip: ${student.nama_lengkap} (NIS: ${student.nis})`,
      data_sebelum: `Status: tidak_aktif, Archived: true`,
      data_sesudah: `Status: aktif, Archived: false`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.map(s => s.id === studentId ? student : s),
      student_history: [historyEntry, ...db.student_history],
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public addStudentDocument(
    studentId: string, 
    doc: Omit<StudentDocument, 'id' | 'tanggal_upload'>, 
    currentUser?: User
  ): StudentDocument {
    if (currentUser && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengunggah dokumen santri (students.edit).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Santri tidak ditemukan.');

    const now = new Date().toISOString();
    const newDoc: StudentDocument = {
      ...doc,
      id: generateUUID(),
      file_url: doc.file_url || '',
      tanggal_upload: now.slice(0, 10)
    };

    const updatedDocs = [newDoc, ...(student.dokumen || [])];
    student.dokumen = updatedDocs;
    student.updated_at = now;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Data Santri',
      data_terkait: `Upload berkas "${doc.nama}" (${doc.tipe}) untuk santri ${student.nama_lengkap}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.map(s => s.id === studentId ? student : s),
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return newDoc;
  }

  public removeStudentDocument(
    studentId: string, 
    docId: string, 
    currentUser?: User
  ): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus dokumen santri (students.edit).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student || !student.dokumen) return false;

    const docToRemove = student.dokumen.find(d => d.id === docId);
    const updatedDocs = student.dokumen.filter(d => d.id !== docId);
    const now = new Date().toISOString();
    student.dokumen = updatedDocs;
    student.updated_at = now;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Data Santri',
      data_terkait: `Hapus berkas "${docToRemove?.nama || docId}" milik santri ${student.nama_lengkap}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.map(s => s.id === studentId ? student : s),
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public importStudents(
    newStudentsData: Array<Partial<Student>>, 
    currentUser?: User
  ): { successCount: number; errors: string[] } {
    if (currentUser && !this.canUserPerform(currentUser, 'students.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengimpor data santri (students.create).');
    }

    const errors: string[] = [];
    let successCount = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < newStudentsData.length; i++) {
      const item = newStudentsData[i];
      const rowNum = i + 1;

      if (!item.nama_lengkap || !item.nama_lengkap.trim()) {
        errors.push(`Baris ${rowNum}: Nama lengkap wajib diisi.`);
        continue;
      }

      const dupCheck = this.checkStudentDuplicate(item);
      if (dupCheck.isDuplicate) {
        errors.push(`Baris ${rowNum} (${item.nama_lengkap}): ${dupCheck.reason}`);
        continue;
      }

      const nis = item.nis && item.nis.trim() ? item.nis.trim() : this.generateNextNis(item.tahun_masuk || 2026);

      const student: Student = {
        id: generateUUID(),
        foto: item.foto || '',
        nis,
        nisn: item.nisn || '',
        nik: item.nik || '',
        nomor_kk: item.nomor_kk || '',
        nama_lengkap: item.nama_lengkap.trim(),
        nama_panggilan: item.nama_panggilan || item.nama_lengkap.trim().split(' ')[0],
        jenis_kelamin: item.jenis_kelamin === 'P' ? 'P' : 'L',
        tempat_lahir: item.tempat_lahir || 'Pamekasan',
        tanggal_lahir: item.tanggal_lahir || '2010-01-01',
        anak_ke: item.anak_ke || 1,
        jumlah_saudara: item.jumlah_saudara || 1,
        status_anak: item.status_anak || 'Kandung',
        alamat: item.alamat || 'Dusun Batulabang',
        dusun: item.dusun || 'Batulabang',
        rt: item.rt || '01',
        rw: item.rw || '01',
        desa: item.desa || 'Akkor',
        kecamatan: item.kecamatan || 'Palengaan',
        kabupaten: item.kabupaten || 'Pamekasan',
        provinsi: item.provinsi || 'Jawa Timur',
        kode_pos: item.kode_pos || '69362',
        nomor_hp: item.nomor_hp || '',
        nama_ayah: item.nama_ayah || '',
        pekerjaan_ayah: item.pekerjaan_ayah || '',
        nomor_hp_ayah: item.nomor_hp_ayah || '',
        nama_ibu: item.nama_ibu || '',
        pekerjaan_ibu: item.pekerjaan_ibu || '',
        nomor_hp_ibu: item.nomor_hp_ibu || '',
        tahun_masuk: item.tahun_masuk || 2026,
        tanggal_masuk: item.tanggal_masuk || now.slice(0, 10),
        asal_sekolah: item.asal_sekolah || '',
        program: item.program || 'Reguler Salaf & Kitab',
        kelas_id: item.kelas_id || null,
        rombel: item.rombel || '',
        asrama: item.asrama || '',
        status: (item.status as StudentStatus) || 'aktif',
        catatan: item.catatan || 'Diimpor dari berkas Excel/CSV',
        is_archived: false,
        created_at: now,
        updated_at: now
      };

      const historyEntry: StudentHistory = {
        id: generateUUID(),
        student_id: student.id,
        tanggal: student.tanggal_masuk,
        jenis_perubahan: 'Registrasi Awal',
        status_lama: null,
        status_baru: student.status,
        kelas_lama: null,
        kelas_baru: student.kelas_id ? this.getClassName(student.kelas_id) : 'Belum Ditentukan',
        keterangan: `Pendaftaran melalui import berkas (${student.nama_lengkap} - NIS: ${student.nis})`,
        user_id: currentUser?.id || 'system',
        created_at: now
      };

      const db = this.getRawData();
      db.students.unshift(student);
      db.student_history.unshift(historyEntry);
      this.saveToStorage(db);
      successCount++;
    }

    if (successCount > 0) {
      const db = this.getRawData();
      const auditEntry: AuditLog = {
        id: generateUUID(),
        user_id: currentUser?.id || 'system',
        user_name: currentUser?.nama_lengkap || 'Administrator',
        user_role: currentUser?.role || 'Admin',
        aktivitas: 'Import data',
        modul: 'Data Santri',
        data_terkait: `Berhasil mengimpor ${successCount} data santri ke sistem`,
        ip_device: '127.0.0.1 (Web Browser)',
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        created_at: now
      };
      db.audit_logs.unshift(auditEntry);
      this.saveToStorage(db);
    }

    return { successCount, errors };
  }

  public changeStudentStatus(
    studentId: string, 
    newStatus: StudentStatus, 
    keterangan: string, 
    currentUser?: User
  ): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'student.status.change') && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah status santri (student.status.change).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) return false;

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    student.status = newStatus;
    student.updated_at = now;

    let jenisPerubahan: StudentHistory['jenis_perubahan'] = 'Perubahan Status';
    if (newStatus === 'lulus') jenisPerubahan = 'Lulus';
    else if (newStatus === 'alumni') jenisPerubahan = 'Alumni';
    else if (newStatus === 'pindah') jenisPerubahan = 'Pindah';
    else if (newStatus === 'keluar') jenisPerubahan = 'Keluar';
    else if (newStatus === 'tidak_aktif') jenisPerubahan = 'Tidak Aktif';
    else if (newStatus === 'aktif' && oldStatus === 'tidak_aktif') jenisPerubahan = 'Pemulihan';

    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: studentId,
      tanggal: today,
      jenis_perubahan: jenisPerubahan,
      status_lama: oldStatus,
      status_baru: newStatus,
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: keterangan || `Perubahan status santri dari ${oldStatus} menjadi ${newStatus}`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };

    // If changing to alumni or lulus, check if alumni record exists; if not, create connected alumni record
    let newAlumni = [...db.alumni];
    if (newStatus === 'alumni' || newStatus === 'lulus') {
      const existingAlumni = db.alumni.find(a => a.student_id === studentId);
      if (!existingAlumni) {
        const graduationYear = new Date().getFullYear();
        const duration = calculateStudyDuration(student.tahun_masuk, student.tanggal_masuk, graduationYear, today);
        const alumniRecord: Alumni = {
          id: generateUUID(),
          student_id: studentId,
          id_alumni: this.generateNextAlumniId(graduationYear),
          tahun_masuk: student.tahun_masuk,
          tanggal_masuk: student.tanggal_masuk,
          tahun_lulus: graduationYear,
          tanggal_lulus: today,
          program: student.program,
          kelas_terakhir: student.kelas_id ? this.getClassName(student.kelas_id) : '-',
          lama_belajar: duration.text,
          alamat: student.alamat,
          kota_tinggal: student.kabupaten || '',
          nomor_hp: student.nomor_hp,
          email: '',
          pendidikan_lanjutan: '',
          pekerjaan: '',
          tempat_kerja: '',
          status: 'belum_terlacak',
          catatan: `Alumni terhubung dari santri ${student.nama_lengkap} (Status: ${newStatus})`,
          is_demo: student.is_demo,
          created_at: now,
          updated_at: now
        };
        newAlumni = [alumniRecord, ...newAlumni];
      }
    }

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `Ubah status santri ${student.nama_lengkap} (NIS: ${student.nis}): ${oldStatus} -> ${newStatus}. Alasan: ${keterangan}`,
      data_sebelum: `Status lama: ${oldStatus}`,
      data_sesudah: `Status baru: ${newStatus}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.map(s => s.id === studentId ? { ...s, status: newStatus, updated_at: now } : s),
      student_history: [historyEntry, ...db.student_history],
      alumni: newAlumni,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- TAHAP 3: PROSES KELULUSAN (Section 4 & 5) ---
  public processGraduation(
    studentId: string,
    params: {
      tanggal_lulus: string;
      tahun_lulus: number | string;
      nomor_ijazah?: string;
      predikat?: string;
      program_diselesaikan: string;
      catatan_kelulusan?: string;
    },
    currentUser?: User
  ): { student: Student; alumni: Alumni } {
    if (currentUser && !this.canUserPerform(currentUser, 'student.graduate')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memproses kelulusan santri (student.graduate).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const tglLulus = params.tanggal_lulus || now.slice(0, 10);
    const thnLulus = params.tahun_lulus || new Date(tglLulus).getFullYear() || new Date().getFullYear();

    // 1. Status santri berubah menjadi ALUMNI
    student.status = 'alumni';
    student.updated_at = now;

    // 2. Hitung lama belajar otomatis
    const duration = calculateStudyDuration(
      student.tahun_masuk,
      student.tanggal_masuk,
      thnLulus,
      tglLulus
    );

    // 3. Rekord tabel alumni (Hubungkan alumni.student_id -> students.id)
    const existingAlumniIndex = (db.alumni || []).findIndex(a => a.student_id === studentId);
    const alumniIdGenerated = this.generateNextAlumniId(thnLulus);

    let finalAlumni: Alumni;
    if (existingAlumniIndex >= 0) {
      finalAlumni = {
        ...db.alumni[existingAlumniIndex],
        tahun_masuk: student.tahun_masuk,
        tanggal_masuk: student.tanggal_masuk,
        tahun_lulus: thnLulus,
        tanggal_lulus: tglLulus,
        program: params.program_diselesaikan || student.program,
        kelas_terakhir: student.kelas_id ? this.getClassName(student.kelas_id) : '-',
        nomor_ijazah: params.nomor_ijazah || '',
        predikat: params.predikat || 'Lulus',
        lama_belajar: duration.text,
        catatan: params.catatan_kelulusan || db.alumni[existingAlumniIndex].catatan || '',
        updated_at: now
      };
      db.alumni[existingAlumniIndex] = finalAlumni;
    } else {
      finalAlumni = {
        id: generateUUID(),
        student_id: student.id,
        id_alumni: alumniIdGenerated,
        tahun_masuk: student.tahun_masuk,
        tanggal_masuk: student.tanggal_masuk,
        tahun_lulus: thnLulus,
        tanggal_lulus: tglLulus,
        program: params.program_diselesaikan || student.program,
        kelas_terakhir: student.kelas_id ? this.getClassName(student.kelas_id) : '-',
        nomor_ijazah: params.nomor_ijazah || '',
        predikat: params.predikat || 'Lulus',
        lama_belajar: duration.text,
        alamat: student.alamat,
        kota_tinggal: student.kabupaten || '',
        nomor_hp: student.nomor_hp,
        email: '',
        pendidikan_lanjutan: '',
        pekerjaan: '',
        tempat_kerja: '',
        status: 'belum_terlacak',
        catatan: params.catatan_kelulusan || `Lulus program ${params.program_diselesaikan || student.program}`,
        is_demo: student.is_demo,
        created_at: now,
        updated_at: now
      };
      db.alumni = [finalAlumni, ...(db.alumni || [])];
    }

    // 4. Record student_graduations
    const gradRecord: StudentGraduation = {
      id: generateUUID(),
      student_id: student.id,
      tanggal_lulus: tglLulus,
      tahun_lulus: thnLulus,
      nomor_ijazah: params.nomor_ijazah || '',
      predikat: params.predikat || 'Lulus',
      program_diselesaikan: params.program_diselesaikan || student.program,
      catatan: params.catatan_kelulusan || '',
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_graduations = [gradRecord, ...(db.student_graduations || [])];

    // 5. Simpan riwayat perubahan (student_history)
    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: tglLulus,
      jenis_perubahan: 'Lulus',
      status_lama: oldStatus,
      status_baru: 'alumni',
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: `Kelulusan santri diproses. Predikat: ${params.predikat || 'Lulus'}. No. Ijazah: ${params.nomor_ijazah || '-'}. Terdaftar sebagai Alumni (${finalAlumni.id_alumni}). Lama belajar: ${duration.text}.`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    // 6. Simpan audit log
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `${currentUser?.nama_lengkap || 'Admin'} memproses ${student.nama_lengkap} (NIS: ${student.nis}) menjadi Alumni (${finalAlumni.id_alumni})`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: alumni, ID Alumni: ${finalAlumni.id_alumni}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return { student, alumni: finalAlumni };
  }

  // --- TAHAP 3: PROSES PINDAH (Section 12 & 13) ---
  public processTransfer(
    studentId: string,
    params: {
      tanggal_pindah: string;
      tahun_pindah: number | string;
      tujuan_pindah: string;
      nama_lembaga_tujuan: string;
      alamat_tujuan: string;
      alasan_pindah: string;
      keterangan?: string;
      nomor_surat?: string;
      dokumen_url?: string;
    },
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.transfer')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memproses santri pindah (student.transfer).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const tglPindah = params.tanggal_pindah || now.slice(0, 10);
    const thnPindah = params.tahun_pindah || new Date(tglPindah).getFullYear();

    student.status = 'pindah';
    student.updated_at = now;

    // Record student_transfers
    const transferRecord: StudentTransfer = {
      id: generateUUID(),
      student_id: student.id,
      tanggal_pindah: tglPindah,
      tahun_pindah: thnPindah,
      tujuan_pindah: params.tujuan_pindah,
      nama_lembaga_tujuan: params.nama_lembaga_tujuan,
      alamat_tujuan: params.alamat_tujuan,
      alasan_pindah: params.alasan_pindah,
      keterangan: params.keterangan || '',
      nomor_surat: params.nomor_surat || '',
      dokumen_url: params.dokumen_url || '',
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_transfers = [transferRecord, ...(db.student_transfers || [])];

    // Record student_history
    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: tglPindah,
      jenis_perubahan: 'Pindah',
      status_lama: oldStatus,
      status_baru: 'pindah',
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: `Santri pindah ke "${params.nama_lembaga_tujuan}" (${params.tujuan_pindah}). Alasan: ${params.alasan_pindah}. No Surat: ${params.nomor_surat || '-'}`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    // Audit log
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `Memproses santri pindah: ${student.nama_lengkap} (NIS: ${student.nis}) ke ${params.nama_lembaga_tujuan}`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: pindah, Tujuan: ${params.nama_lembaga_tujuan}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return student;
  }

  // --- TAHAP 3: PROSES KELUAR (Section 14) ---
  public processWithdrawal(
    studentId: string,
    params: {
      tanggal_keluar: string;
      tahun_keluar: number | string;
      alasan_keluar: string;
      keterangan?: string;
      nomor_surat?: string;
      dokumen_url?: string;
      catatan_admin?: string;
    },
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.withdraw')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memproses santri keluar (student.withdraw).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const tglKeluar = params.tanggal_keluar || now.slice(0, 10);
    const thnKeluar = params.tahun_keluar || new Date(tglKeluar).getFullYear();

    student.status = 'keluar';
    student.updated_at = now;

    // Record student_withdrawals
    const withdrawalRecord: StudentWithdrawal = {
      id: generateUUID(),
      student_id: student.id,
      tanggal_keluar: tglKeluar,
      tahun_keluar: thnKeluar,
      alasan_keluar: params.alasan_keluar,
      keterangan: params.keterangan || '',
      nomor_surat: params.nomor_surat || '',
      dokumen_url: params.dokumen_url || '',
      catatan_admin: params.catatan_admin || '',
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_withdrawals = [withdrawalRecord, ...(db.student_withdrawals || [])];

    // Record student_history
    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: tglKeluar,
      jenis_perubahan: 'Keluar',
      status_lama: oldStatus,
      status_baru: 'keluar',
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: `Santri keluar / pengunduran diri. Alasan: ${params.alasan_keluar}. Keterangan: ${params.keterangan || '-'}. No Surat: ${params.nomor_surat || '-'}`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    // Audit log
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `Memproses santri keluar: ${student.nama_lengkap} (NIS: ${student.nis}). Alasan: ${params.alasan_keluar}`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: keluar`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return student;
  }

  // --- TAHAP 3: PROSES TIDAK AKTIF & AKTIFKAN KEMBALI (Section 15) ---
  public processInactive(
    studentId: string,
    params: {
      tanggal_mulai: string;
      alasan: string;
      keterangan?: string;
    },
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.status.change') && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah status santri.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const tglMulai = params.tanggal_mulai || now.slice(0, 10);

    student.status = 'tidak_aktif';
    student.updated_at = now;

    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: tglMulai,
      jenis_perubahan: 'Tidak Aktif',
      status_lama: oldStatus,
      status_baru: 'tidak_aktif',
      kelas_lama: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      kelas_baru: null,
      keterangan: `Santri dinonaktifkan sementara. Alasan: ${params.alasan}. Keterangan: ${params.keterangan || '-'}`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `Mengubah status ${student.nama_lengkap} (NIS: ${student.nis}) menjadi Tidak Aktif. Alasan: ${params.alasan}`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: tidak_aktif`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return student;
  }

  public reactivateStudent(
    studentId: string,
    keterangan: string = 'Santri diaktifkan kembali oleh administrator',
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.reactivate') && !this.canUserPerform(currentUser, 'students.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengaktifkan kembali santri (student.reactivate).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    student.status = 'aktif';
    student.is_archived = false;
    student.updated_at = now;

    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: today,
      jenis_perubahan: 'Pemulihan',
      status_lama: oldStatus,
      status_baru: 'aktif',
      kelas_lama: null,
      kelas_baru: student.kelas_id ? this.getClassName(student.kelas_id) : 'Belum Ditentukan',
      keterangan: keterangan || `Santri diaktifkan kembali dari status ${oldStatus} menjadi Aktif`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `${currentUser?.nama_lengkap || 'Admin'} mengaktifkan kembali ${student.nama_lengkap} (NIS: ${student.nis}) ke status Aktif`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: aktif`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return student;
  }

  // --- TAHAP 3: PEMBATALAN STATUS / ROLLBACK (Section 16) ---
  public rollbackStudentStatus(
    studentId: string,
    targetStatus: StudentStatus,
    alasanPembatalan: string,
    currentUser?: User
  ): Student {
    // Only Super Admin or role with student.status.rollback
    if (currentUser && !this.canUserPerform(currentUser, 'student.status.rollback') && currentUser.role !== 'super_admin') {
      throw new Error('Akses Ditolak: Hanya Super Admin atau pengguna dengan izin student.status.rollback yang dapat membatalkan status santri.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldStatus = student.status;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    student.status = targetStatus;
    student.updated_at = now;

    // Catat histori baru pembatalan tanpa menghapus histori lama
    const historyEntry: StudentHistory = {
      id: generateUUID(),
      student_id: student.id,
      tanggal: today,
      jenis_perubahan: 'Pembatalan Status',
      status_lama: oldStatus,
      status_baru: targetStatus,
      kelas_lama: null,
      kelas_baru: student.kelas_id ? this.getClassName(student.kelas_id) : null,
      keterangan: `Pembatalan perubahan status dari "${oldStatus}" dikembalikan menjadi "${targetStatus}". Alasan: ${alasanPembatalan}`,
      user_id: currentUser?.id || 'system',
      user_nama: currentUser?.nama_lengkap || 'Super Admin',
      created_at: now
    };
    db.student_history = [historyEntry, ...(db.student_history || [])];

    // Audit log
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Super Admin',
      user_role: currentUser?.role || 'Super Admin',
      aktivitas: 'Perubahan status',
      modul: 'Data Santri',
      data_terkait: `${currentUser?.nama_lengkap || 'Super Admin'} mengembalikan status ${student.nama_lengkap} dari ${oldStatus} menjadi ${targetStatus}. Alasan: ${alasanPembatalan}`,
      data_sebelum: `Status: ${oldStatus}`,
      data_sesudah: `Status: ${targetStatus}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };
    db.audit_logs = [auditEntry, ...(db.audit_logs || [])];

    this.saveToStorage(db);
    return student;
  }

  // Getter for transfers, withdrawals, graduations
  public getStudentTransfers(): StudentTransfer[] {
    return this.getRawData().student_transfers || [];
  }

  public getStudentWithdrawals(): StudentWithdrawal[] {
    return this.getRawData().student_withdrawals || [];
  }

  public getStudentGraduations(): StudentGraduation[] {
    return this.getRawData().student_graduations || [];
  }

  public deleteStudent(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'students.archive')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengarsipkan/menghapus santri (students.archive).');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === id);
    if (!student) return false;

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Data Santri',
      data_terkait: `Hapus santri: ${student.nama_lengkap} (NIS: ${student.nis})`,
      data_sebelum: `Nama: ${student.nama_lengkap}, NIS: ${student.nis}, Status: ${student.status}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      students: db.students.filter(s => s.id !== id),
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- Alumni CRUD ---
  public getAlumni(): Alumni[] {
    return this.getRawData().alumni;
  }

  public getAlumniWithStudent(alumniId: string): { alumni: Alumni; student?: Student } | null {
    const db = this.getRawData();
    const alumni = db.alumni.find(a => a.id === alumniId);
    if (!alumni) return null;
    const student = db.students.find(s => s.id === alumni.student_id);
    return { alumni, student };
  }

  public updateAlumni(id: string, updates: Partial<Alumni>, currentUser?: User): Alumni | null {
    const db = this.getRawData();
    const index = db.alumni.findIndex(a => a.id === id);
    if (index === -1) return null;

    const oldAlumni = db.alumni[index];
    const now = new Date().toISOString();
    const updatedAlumni: Alumni = {
      ...oldAlumni,
      ...updates,
      updated_at: now
    };

    const student = db.students.find(s => s.id === updatedAlumni.student_id);

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Alumni',
      data_terkait: `Perbarui data alumni ${updatedAlumni.id_alumni} (${student?.nama_lengkap || 'Santri Terkait'})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const newAlumniList = [...db.alumni];
    newAlumniList[index] = updatedAlumni;

    const updatedDb: DatabaseSchema = {
      ...db,
      alumni: newAlumniList,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return updatedAlumni;
  }

  // --- Student History ---
  public getStudentHistories(studentId?: string): StudentHistory[] {
    const all = this.getRawData().student_history;
    if (studentId) {
      return all.filter(h => h.student_id === studentId);
    }
    return all;
  }

  // --- Classes & Teachers ---
  public getClasses(): SchoolClass[] {
    return this.getRawData().classes;
  }

  public getTeachers(): Teacher[] {
    return this.getRawData().teachers;
  }

  public getClassName(classId: string | null): string {
    if (!classId) return '-';
    const cls = this.getClasses().find(c => c.id === classId);
    return cls ? cls.nama_kelas : '-';
  }

  // --- Settings ---
  public getSettings(): PesantrenSettings {
    const s = this.getRawData().settings;
    if (!s.slogan_berjalan) {
      s.slogan_berjalan = DEFAULT_SETTINGS.slogan_berjalan;
      s.slogan_aktif = s.slogan_aktif ?? true;
      s.slogan_kecepatan = s.slogan_kecepatan || 'sedang';
    }
    return s;
  }

  public updateSettings(newSettings: Partial<PesantrenSettings>, currentUser?: User): PesantrenSettings {
    const db = this.getRawData();
    const now = new Date().toISOString();
    const updated: PesantrenSettings = {
      ...db.settings,
      ...newSettings,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan pengaturan',
      modul: 'Profil Pesantren',
      data_terkait: `Pembaruan profil pesantren: ${updated.nama_pesantren}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      settings: updated,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.getRawData().audit_logs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const db = this.getRawData();
    const now = new Date().toISOString();
    const newLog: AuditLog = {
      ...log,
      id: generateUUID(),
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      audit_logs: [newLog, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return newLog;
  }

  // --- Centralized Permission Check ---
  public canUserPerform(user: User | null, permissionKey: string): boolean {
    if (!user) return false;
    if (user.status !== 'aktif') return false;
    if (user.role === 'super_admin') return true;

    const roles = this.getRoles();
    const roleDef = roles.find(r => r.id === user.role);
    if (!roleDef) return false;

    if (roleDef.permissions.includes('*') || roleDef.permissions.includes('all')) return true;
    if (roleDef.permissions.includes(permissionKey)) return true;

    // Wildcard prefix check: e.g. permissionKey is 'students.create', role has 'students.*'
    const parts = permissionKey.split('.');
    if (parts.length === 2 && roleDef.permissions.includes(`${parts[0]}.*`)) {
      return true;
    }

    return false;
  }

  // --- Users & Roles ---
  public getUsers(): User[] {
    return this.getRawData().users;
  }

  public getUserById(id: string): User | undefined {
    return this.getRawData().users.find(u => u.id === id);
  }

  public getRoles(): RoleDefinition[] {
    return this.getRawData().roles;
  }

  public getPermissions(): Permission[] {
    return this.getRawData().permissions;
  }

  public async createUser(
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, 
    currentUser?: User
  ): Promise<User> {
    if (currentUser && !this.canUserPerform(currentUser, 'users.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambahkan pengguna baru (users.create).');
    }

    const db = this.getRawData();
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check unique username & email
    const duplicate = db.users.find(u => 
      u.username.toLowerCase() === cleanUsername || 
      u.email.toLowerCase() === cleanEmail
    );
    if (duplicate) {
      throw new Error(`Username @${userData.username} atau email ${userData.email} sudah digunakan.`);
    }

    const now = new Date().toISOString();
    // Securely hash password
    const hashedPassword = await hashPassword(userData.password_hash);

    const newUser: User = {
      ...userData,
      id: generateUUID(),
      username: cleanUsername,
      email: cleanEmail,
      password_hash: hashedPassword,
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Super Admin',
      user_role: currentUser?.role || 'Super Admin',
      aktivitas: 'Tambah data',
      modul: 'Manajemen Pengguna',
      data_terkait: `${currentUser?.nama_lengkap || 'Super Admin'} menambahkan pengguna baru: ${newUser.nama_lengkap} (@${newUser.username}) dengan role ${newUser.role}`,
      data_sesudah: `Nama: ${newUser.nama_lengkap}, Role: ${newUser.role}, Jabatan: ${newUser.jabatan || '-'}, Status: ${newUser.status}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      users: [...db.users, newUser],
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return newUser;
  }

  public async updateUser(
    id: string, 
    updates: Partial<User>, 
    currentUser?: User
  ): Promise<User | null> {
    const db = this.getRawData();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const oldUser = db.users[index];
    const isSelf = currentUser?.id === id;

    // Permission checks
    if (!isSelf && currentUser && !this.canUserPerform(currentUser, 'users.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengedit pengguna lain (users.edit).');
    }

    // Role or status change check: only user with manage_permissions or super_admin can change role/status
    if ((updates.role && updates.role !== oldUser.role) || (updates.status && updates.status !== oldUser.status)) {
      if (currentUser && !this.canUserPerform(currentUser, 'users.manage_permissions')) {
        throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah role atau status akun (users.manage_permissions).');
      }
    }

    // Prevent changing the status of oneself to nonaktif
    if (isSelf && updates.status === 'nonaktif') {
      throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.');
    }

    // Check username uniqueness if changed
    if (updates.username && updates.username.toLowerCase() !== oldUser.username.toLowerCase()) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const duplicate = db.users.find(u => u.id !== id && u.username.toLowerCase() === cleanUsername);
      if (duplicate) {
        throw new Error(`Username @${updates.username} sudah digunakan oleh pengguna lain.`);
      }
      updates.username = cleanUsername;
    }

    // Check email uniqueness if changed
    if (updates.email && updates.email.toLowerCase() !== oldUser.email.toLowerCase()) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const duplicate = db.users.find(u => u.id !== id && u.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        throw new Error(`Email ${updates.email} sudah digunakan oleh pengguna lain.`);
      }
      updates.email = cleanEmail;
    }

    const now = new Date().toISOString();
    let newPasswordHash = oldUser.password_hash;
    if (updates.password_hash && updates.password_hash !== oldUser.password_hash) {
      newPasswordHash = await hashPassword(updates.password_hash);
    }

    const updatedUser: User = {
      ...oldUser,
      ...updates,
      password_hash: newPasswordHash,
      updated_at: now
    };

    // Build human-readable audit description
    const changes: string[] = [];
    if (updates.nama_lengkap && updates.nama_lengkap !== oldUser.nama_lengkap) {
      changes.push(`nama pengguna dari "${oldUser.nama_lengkap}" menjadi "${updates.nama_lengkap}"`);
    }
    if (updates.username && updates.username !== oldUser.username) {
      changes.push(`username dari "@${oldUser.username}" menjadi "@${updates.username}"`);
    }
    if (updates.role && updates.role !== oldUser.role) {
      changes.push(`role ${oldUser.nama_lengkap} dari "${oldUser.role}" menjadi "${updates.role}"`);
    }
    if (updates.status && updates.status !== oldUser.status) {
      changes.push(`status akun ${oldUser.nama_lengkap} dari "${oldUser.status}" menjadi "${updates.status}"`);
    }
    if (updates.jabatan && updates.jabatan !== oldUser.jabatan) {
      changes.push(`jabatan dari "${oldUser.jabatan || '-'}" menjadi "${updates.jabatan}"`);
    }
    if (updates.password_hash && updates.password_hash !== oldUser.password_hash) {
      changes.push(`kata sandi`);
    }

    const auditDesc = changes.length > 0 
      ? `${currentUser?.nama_lengkap || 'Admin'} mengubah ${changes.join(', ')}.`
      : `${currentUser?.nama_lengkap || 'Admin'} memperbarui data profil pengguna ${updatedUser.nama_lengkap}.`;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Manajemen Pengguna',
      data_terkait: auditDesc,
      data_sebelum: `Nama: ${oldUser.nama_lengkap}, Role: ${oldUser.role}, Jabatan: ${oldUser.jabatan || '-'}, Status: ${oldUser.status}`,
      data_sesudah: `Nama: ${updatedUser.nama_lengkap}, Role: ${updatedUser.role}, Jabatan: ${updatedUser.jabatan || '-'}, Status: ${updatedUser.status}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const newUsers = [...db.users];
    newUsers[index] = updatedUser;

    const updatedDb: DatabaseSchema = {
      ...db,
      users: newUsers,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return updatedUser;
  }

  public async toggleUserStatus(id: string, currentUser?: User): Promise<User | null> {
    if (currentUser && !this.canUserPerform(currentUser, 'users.deactivate')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengaktifkan/menonaktifkan pengguna (users.deactivate).');
    }

    const db = this.getRawData();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;

    if (currentUser?.id === id) {
      throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.');
    }

    const newStatus = user.status === 'aktif' ? 'nonaktif' : 'aktif';
    return this.updateUser(id, { status: newStatus }, currentUser);
  }

  public async resetUserPassword(id: string, newPassword: string, currentUser?: User): Promise<boolean> {
    if (currentUser && !this.canUserPerform(currentUser, 'users.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mereset kata sandi pengguna (users.edit).');
    }

    await this.updateUser(id, { password_hash: newPassword }, currentUser);
    return true;
  }

  public async deleteUser(id: string, currentUser?: User): Promise<boolean> {
    if (currentUser && currentUser.role !== 'super_admin') {
      throw new Error('Akses Ditolak: Hanya Super Admin yang berhak menghapus atau mengarsipkan akun pengguna.');
    }

    const db = this.getRawData();
    const user = db.users.find(u => u.id === id);
    if (!user) return false;

    if (currentUser?.id === id) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
    }

    const superAdmins = db.users.filter(u => u.role === 'super_admin' && u.status === 'aktif');
    if (user.role === 'super_admin' && superAdmins.length <= 1) {
      throw new Error('Tidak dapat menghapus satu-satunya Super Admin aktif di dalam sistem.');
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Super Admin',
      user_role: currentUser?.role || 'Super Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Manajemen Pengguna',
      data_terkait: `${currentUser?.nama_lengkap || 'Super Admin'} menghapus/mengarsipkan akun ${user.nama_lengkap} (@${user.username})`,
      data_sebelum: `Nama: ${user.nama_lengkap}, Role: ${user.role}, Status: ${user.status}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      users: db.users.filter(u => u.id !== id),
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public updateRolePermissions(roleId: UserRole, permissions: string[], currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'users.manage_permissions')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengelola hak akses role (users.manage_permissions).');
    }

    const db = this.getRawData();
    const index = db.roles.findIndex(r => r.id === roleId);
    if (index === -1) return false;

    const oldRole = db.roles[index];
    const now = new Date().toISOString();
    const updatedRole: RoleDefinition = {
      ...oldRole,
      permissions,
      updated_at: now
    };

    const newRoles = [...db.roles];
    newRoles[index] = updatedRole;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Super Admin',
      user_role: currentUser?.role || 'Super Admin',
      aktivitas: 'Perubahan pengaturan',
      modul: 'Hak Akses',
      data_terkait: `${currentUser?.nama_lengkap || 'Super Admin'} memperbarui daftar hak akses untuk role ${oldRole.nama} (${permissions.length} izin)`,
      data_sebelum: `Hak akses sebelumnya: ${oldRole.permissions.join(', ')}`,
      data_sesudah: `Hak akses baru: ${permissions.join(', ')}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      roles: newRoles,
      audit_logs: [auditEntry, ...db.audit_logs]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // ==========================================
  // STAGE 4: SISTEM STRUKTUR PENDIDIKAN & KURIKULUM
  // ==========================================

  // --- 1. Program Pendidikan (education_programs) ---
  public getPrograms(): EducationProgram[] {
    const list = this.getRawData().education_programs || [];
    return [...list].sort((a, b) => a.sort_order - b.sort_order);
  }

  public getProgramById(id: string): EducationProgram | undefined {
    return this.getPrograms().find(p => p.id === id);
  }

  public createProgram(
    data: Omit<EducationProgram, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): EducationProgram {
    if (currentUser && !this.canUserPerform(currentUser, 'program.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah program pendidikan.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newProg: EducationProgram = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah program pendidikan baru: ${newProg.name} (${newProg.code})`,
      data_sesudah: `Nama: ${newProg.name}, Tipe: ${newProg.type}, Durasi: ${newProg.duration}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_programs: [...(db.education_programs || []), newProg],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newProg;
  }

  public updateProgram(
    id: string,
    updates: Partial<EducationProgram>,
    currentUser?: User
  ): EducationProgram | null {
    if (currentUser && !this.canUserPerform(currentUser, 'program.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah program pendidikan.');
    }

    const db = this.getRawData();
    const list = db.education_programs || [];
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return null;

    const oldProg = list[index];
    const now = new Date().toISOString();
    const updated: EducationProgram = {
      ...oldProg,
      ...updates,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui program pendidikan: ${updated.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const updatedDb: DatabaseSchema = {
      ...db,
      education_programs: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteProgram(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'program.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus program pendidikan.');
    }

    const db = this.getRawData();
    const prog = (db.education_programs || []).find(p => p.id === id);
    if (!prog) return false;

    // Check if students are using this program
    const studentCount = (db.students || []).filter(s => s.program_id === id).length;
    if (studentCount > 0) {
      throw new Error(`Tidak dapat menghapus program "${prog.name}" karena masih ada ${studentCount} santri terdaftar di program ini. Silakan nonaktifkan statusnya atau pindahkan santri.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus program pendidikan: ${prog.name} (${prog.code})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_programs: (db.education_programs || []).filter(p => p.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 2. Tracks / Cabang Kitab (education_tracks) ---
  public getTracks(programId?: string): EducationTrack[] {
    const list = this.getRawData().education_tracks || [];
    const filtered = programId ? list.filter(t => t.program_id === programId) : list;
    return [...filtered].sort((a, b) => a.sort_order - b.sort_order);
  }

  public getTrackById(id: string): EducationTrack | undefined {
    return (this.getRawData().education_tracks || []).find(t => t.id === id);
  }

  public createTrack(
    data: Omit<EducationTrack, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): EducationTrack {
    if (currentUser && !this.canUserPerform(currentUser, 'program.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah cabang kurikulum.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newTrack: EducationTrack = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah cabang kurikulum: ${newTrack.name} (${newTrack.code})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_tracks: [...(db.education_tracks || []), newTrack],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newTrack;
  }

  public updateTrack(
    id: string,
    updates: Partial<EducationTrack>,
    currentUser?: User
  ): EducationTrack | null {
    if (currentUser && !this.canUserPerform(currentUser, 'program.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah cabang kurikulum.');
    }

    const db = this.getRawData();
    const list = db.education_tracks || [];
    const index = list.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTrack = list[index];
    const now = new Date().toISOString();
    const updated: EducationTrack = {
      ...oldTrack,
      ...updates,
      updated_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui cabang kurikulum: ${updated.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_tracks: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteTrack(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'program.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus cabang kurikulum.');
    }

    const db = this.getRawData();
    const track = (db.education_tracks || []).find(t => t.id === id);
    if (!track) return false;

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus cabang kurikulum: ${track.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_tracks: (db.education_tracks || []).filter(t => t.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 3. Levels / Tingkat (education_levels) ---
  public getLevels(programId?: string, trackId?: string | null): EducationLevel[] {
    const list = this.getRawData().education_levels || [];
    let filtered = list;
    if (programId) {
      filtered = filtered.filter(l => l.program_id === programId);
    }
    if (trackId !== undefined) {
      filtered = filtered.filter(l => l.track_id === trackId);
    }
    return [...filtered].sort((a, b) => a.level_order - b.level_order);
  }

  public getLevelById(id: string): EducationLevel | undefined {
    return (this.getRawData().education_levels || []).find(l => l.id === id);
  }

  public createLevel(
    data: Omit<EducationLevel, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): EducationLevel {
    if (currentUser && !this.canUserPerform(currentUser, 'program.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah tingkat kelas.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newLevel: EducationLevel = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah tingkat kelas: ${newLevel.name} (${newLevel.code}) urutan ke-${newLevel.level_order}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_levels: [...(db.education_levels || []), newLevel],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newLevel;
  }

  public updateLevel(
    id: string,
    updates: Partial<EducationLevel>,
    currentUser?: User
  ): EducationLevel | null {
    if (currentUser && !this.canUserPerform(currentUser, 'program.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah tingkatan kelas.');
    }

    const db = this.getRawData();
    const list = db.education_levels || [];
    const index = list.findIndex(l => l.id === id);
    if (index === -1) return null;

    const oldLevel = list[index];
    const now = new Date().toISOString();
    const updated: EducationLevel = {
      ...oldLevel,
      ...updates,
      updated_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui tingkat kelas: ${updated.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_levels: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteLevel(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'program.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus tingkatan kelas.');
    }

    const db = this.getRawData();
    const lvl = (db.education_levels || []).find(l => l.id === id);
    if (!lvl) return false;

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus tingkatan kelas: ${lvl.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      education_levels: (db.education_levels || []).filter(l => l.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 4. Tahun Ajaran (academic_years) ---
  public getAcademicYears(): AcademicYear[] {
    const list = this.getRawData().academic_years || [];
    return [...list].sort((a, b) => b.nama_tahun_ajaran.localeCompare(a.nama_tahun_ajaran));
  }

  public getActiveAcademicYear(): AcademicYear | undefined {
    const years = this.getAcademicYears();
    return years.find(y => y.status === 'aktif') || years[0];
  }

  public createAcademicYear(
    data: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): AcademicYear {
    if (currentUser && !this.canUserPerform(currentUser, 'education.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah tahun ajaran.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();

    // If marked active, switch any current active to nonaktif
    let years = db.academic_years || [];
    if (data.status === 'aktif') {
      years = years.map(y => ({ ...y, status: 'nonaktif' as const }));
    }

    const newYear: AcademicYear = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah tahun ajaran baru: ${newYear.nama_tahun_ajaran} (${newYear.status})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      academic_years: [...years, newYear],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newYear;
  }

  public updateAcademicYear(
    id: string,
    updates: Partial<AcademicYear>,
    currentUser?: User
  ): AcademicYear | null {
    if (currentUser && !this.canUserPerform(currentUser, 'education.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah tahun ajaran.');
    }

    const db = this.getRawData();
    let years = db.academic_years || [];
    const index = years.findIndex(y => y.id === id);
    if (index === -1) return null;

    if (updates.status === 'aktif') {
      years = years.map(y => ({ ...y, status: 'nonaktif' as const }));
    }

    const oldYear = years[index];
    const now = new Date().toISOString();
    const updated: AcademicYear = {
      ...oldYear,
      ...updates,
      updated_at: now
    };

    years[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui tahun ajaran: ${updated.nama_tahun_ajaran} (${updated.status})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      academic_years: years,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public setActiveAcademicYear(id: string, currentUser?: User): AcademicYear | null {
    return this.updateAcademicYear(id, { status: 'aktif' }, currentUser);
  }

  public deleteAcademicYear(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'education.archive')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus tahun ajaran.');
    }

    const db = this.getRawData();
    const year = (db.academic_years || []).find(y => y.id === id);
    if (!year) return false;

    if (year.status === 'aktif') {
      throw new Error('Tidak dapat menghapus tahun ajaran yang sedang aktif. Silakan aktifkan tahun ajaran lain terlebih dahulu.');
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus tahun ajaran: ${year.nama_tahun_ajaran}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      academic_years: (db.academic_years || []).filter(y => y.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 5. Kelas (classes) ---
  public getClassById(id: string): SchoolClass | undefined {
    return this.getClasses().find(c => c.id === id);
  }

  public createClass(
    data: Omit<SchoolClass, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): SchoolClass {
    if (currentUser && !this.canUserPerform(currentUser, 'class.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah data kelas.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newClass: SchoolClass = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah kelas baru: ${newClass.nama_kelas} (Tingkat: ${newClass.tingkat}, Kapasitas: ${newClass.kapasitas})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      classes: [...db.classes, newClass],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newClass;
  }

  public updateClass(
    id: string,
    updates: Partial<SchoolClass>,
    currentUser?: User
  ): SchoolClass | null {
    if (currentUser && !this.canUserPerform(currentUser, 'class.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah data kelas.');
    }

    const db = this.getRawData();
    const index = db.classes.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldClass = db.classes[index];
    const now = new Date().toISOString();
    const updated: SchoolClass = {
      ...oldClass,
      ...updates,
      updated_at: now
    };

    const newClasses = [...db.classes];
    newClasses[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui kelas: ${updated.nama_kelas}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      classes: newClasses,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteClass(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'class.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus kelas.');
    }

    const db = this.getRawData();
    const cls = db.classes.find(c => c.id === id);
    if (!cls) return false;

    // Check if rombels or students exist
    const rombelCount = (db.rombels || []).filter(r => r.class_id === id).length;
    const studentCount = (db.students || []).filter(s => s.kelas_id === id).length;
    if (rombelCount > 0 || studentCount > 0) {
      throw new Error(`Tidak dapat menghapus kelas "${cls.nama_kelas}" karena memiliki ${rombelCount} rombel dan ${studentCount} santri aktif.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus kelas: ${cls.nama_kelas}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      classes: db.classes.filter(c => c.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 6. Rombel (rombels) ---
  public getRombels(classId?: string, academicYearId?: string): Rombel[] {
    const list = this.getRawData().rombels || [];
    let filtered = list;
    if (classId) {
      filtered = filtered.filter(r => r.class_id === classId);
    }
    if (academicYearId) {
      filtered = filtered.filter(r => r.academic_year_id === academicYearId);
    }
    return filtered;
  }

  public getRombelById(id: string): Rombel | undefined {
    return (this.getRawData().rombels || []).find(r => r.id === id);
  }

  public createRombel(
    data: Omit<Rombel, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): Rombel {
    if (currentUser && !this.canUserPerform(currentUser, 'rombel.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk membuat rombel.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newRombel: Rombel = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    // If homeroom teacher assigned, log to homeroom_history
    let homeroomEntries = db.homeroom_history || [];
    if (newRombel.homeroom_teacher_id) {
      const hh: HomeroomHistory = {
        id: generateUUID(),
        teacher_id: newRombel.homeroom_teacher_id,
        rombel_id: newRombel.id,
        academic_year_id: newRombel.academic_year_id,
        start_date: now.slice(0, 10),
        status: 'aktif',
        created_at: now
      };
      homeroomEntries = [hh, ...homeroomEntries];
    }

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah rombel baru: ${newRombel.name} (Kode: ${newRombel.code}, Kapasitas: ${newRombel.capacity})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      rombels: [...(db.rombels || []), newRombel],
      homeroom_history: homeroomEntries,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newRombel;
  }

  public updateRombel(
    id: string,
    updates: Partial<Rombel>,
    currentUser?: User
  ): Rombel | null {
    if (currentUser && !this.canUserPerform(currentUser, 'rombel.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah rombel.');
    }

    const db = this.getRawData();
    const list = db.rombels || [];
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;

    const oldRombel = list[index];
    const now = new Date().toISOString();
    const updated: Rombel = {
      ...oldRombel,
      ...updates,
      updated_at: now
    };

    let homeroomEntries = db.homeroom_history || [];
    // If homeroom teacher changed, add new homeroom_history record without overwriting old
    if (updates.homeroom_teacher_id && updates.homeroom_teacher_id !== oldRombel.homeroom_teacher_id) {
      // Mark old active homeroom as selesai
      homeroomEntries = homeroomEntries.map(h => {
        if (h.rombel_id === id && h.status === 'aktif') {
          return { ...h, end_date: now.slice(0, 10), status: 'selesai' as const };
        }
        return h;
      });
      // Add new
      homeroomEntries = [
        {
          id: generateUUID(),
          teacher_id: updates.homeroom_teacher_id,
          rombel_id: id,
          academic_year_id: updated.academic_year_id,
          start_date: now.slice(0, 10),
          status: 'aktif',
          created_at: now
        },
        ...homeroomEntries
      ];
    }

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui rombel: ${updated.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      rombels: newList,
      homeroom_history: homeroomEntries,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteRombel(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'rombel.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus rombel.');
    }

    const db = this.getRawData();
    const rombel = (db.rombels || []).find(r => r.id === id);
    if (!rombel) return false;

    const studentCount = (db.students || []).filter(s => s.rombel_id === id).length;
    if (studentCount > 0) {
      throw new Error(`Tidak dapat menghapus rombel "${rombel.name}" karena masih ada ${studentCount} santri aktif di dalamnya.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus rombel: ${rombel.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      rombels: (db.rombels || []).filter(r => r.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public assignStudentToRombel(
    studentId: string,
    rombelId: string,
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.class.assign')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menempatkan santri ke rombel.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const rombel = (db.rombels || []).find(r => r.id === rombelId);
    if (!rombel) throw new Error('Data rombel tidak ditemukan.');

    // Check capacity
    const currentCount = db.students.filter(s => s.rombel_id === rombelId && s.status === 'aktif').length;
    if (currentCount >= rombel.capacity && currentUser?.role !== 'super_admin') {
      throw new Error(`Rombel "${rombel.name}" sudah PENUH (${currentCount} / ${rombel.capacity} santri).`);
    }

    const cls = db.classes.find(c => c.id === rombel.class_id);
    const now = new Date().toISOString();

    student.rombel_id = rombel.id;
    student.rombel = rombel.name;
    if (cls) {
      student.kelas_id = cls.id;
      if (cls.program_id) student.program_id = cls.program_id;
      if (cls.track_id) student.track_id = cls.track_id;
      if (cls.level_id) student.level_id = cls.level_id;
    }
    student.updated_at = now;

    // Record to student_education_history
    const eduEntry: StudentEducationHistory = {
      id: generateUUID(),
      student_id: student.id,
      academic_year_id: rombel.academic_year_id,
      program_id: student.program_id || cls?.program_id || 'prog-kitabiyah',
      track_id: student.track_id || cls?.track_id || null,
      level_id: student.level_id || cls?.level_id || null,
      class_id: cls?.id || rombel.class_id,
      rombel_id: rombel.id,
      homeroom_teacher_id: rombel.homeroom_teacher_id || null,
      mentor_id: rombel.mentor_id || null,
      start_date: now.slice(0, 10),
      status: 'aktif',
      notes: `Penempatan ke rombel ${rombel.name}`,
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Tempatkan santri ${student.nama_lengkap} ke rombel ${rombel.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      student_education_history: [eduEntry, ...(db.student_education_history || [])],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return student;
  }

  public removeStudentFromRombel(studentId: string, currentUser?: User): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.class.transfer')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengeluarkan santri dari rombel.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const oldRombelName = student.rombel || '-';
    const now = new Date().toISOString();

    student.rombel_id = null;
    student.rombel = undefined;
    student.updated_at = now;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Keluarkan santri ${student.nama_lengkap} dari rombel ${oldRombelName}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return student;
  }

  public moveStudentRombel(
    studentId: string,
    targetRombelId: string,
    alasan: string = 'Pindah rombel belajar',
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.class.transfer')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memindahkan santri antar rombel.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const targetRombel = (db.rombels || []).find(r => r.id === targetRombelId);
    if (!targetRombel) throw new Error('Data rombel tujuan tidak ditemukan.');

    const oldRombelName = student.rombel || 'Tanpa Rombel';
    const now = new Date().toISOString();

    // Check target capacity
    const curOccupants = db.students.filter(s => s.rombel_id === targetRombelId && s.status === 'aktif').length;
    if (curOccupants >= targetRombel.capacity && currentUser?.role !== 'super_admin') {
      throw new Error(`Rombel tujuan "${targetRombel.name}" sudah PENUH (${curOccupants}/${targetRombel.capacity} santri).`);
    }

    const cls = db.classes.find(c => c.id === targetRombel.class_id);

    student.rombel_id = targetRombel.id;
    student.rombel = targetRombel.name;
    if (cls) {
      student.kelas_id = cls.id;
      if (cls.program_id) student.program_id = cls.program_id;
      if (cls.track_id) student.track_id = cls.track_id;
      if (cls.level_id) student.level_id = cls.level_id;
    }
    student.updated_at = now;

    // Record education history
    const eduEntry: StudentEducationHistory = {
      id: generateUUID(),
      student_id: student.id,
      academic_year_id: targetRombel.academic_year_id,
      program_id: student.program_id || 'prog-kitabiyah',
      track_id: student.track_id || null,
      level_id: student.level_id || null,
      class_id: cls?.id || targetRombel.class_id,
      rombel_id: targetRombel.id,
      homeroom_teacher_id: targetRombel.homeroom_teacher_id || null,
      mentor_id: targetRombel.mentor_id || null,
      start_date: now.slice(0, 10),
      status: 'aktif',
      notes: `Pindah dari ${oldRombelName} ke ${targetRombel.name}. Alasan: ${alasan}`,
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Pindahkan ${student.nama_lengkap} dari ${oldRombelName} ke ${targetRombel.name}. Alasan: ${alasan}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      student_education_history: [eduEntry, ...(db.student_education_history || [])],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return student;
  }

  // --- 7. Ustadz / Guru (teachers) ---
  public getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find(t => t.id === id);
  }

  public createTeacher(
    data: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): Teacher {
    if (currentUser && !this.canUserPerform(currentUser, 'teacher.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah data ustadz/guru.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newTeacher: Teacher = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah ustadz baru: ${newTeacher.nama_lengkap} (NIP: ${newTeacher.nip}, Jabatan: ${newTeacher.jabatan})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      teachers: [...db.teachers, newTeacher],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newTeacher;
  }

  public updateTeacher(
    id: string,
    updates: Partial<Teacher>,
    currentUser?: User
  ): Teacher | null {
    if (currentUser && !this.canUserPerform(currentUser, 'teacher.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah data ustadz.');
    }

    const db = this.getRawData();
    const index = db.teachers.findIndex(t => t.id === id);
    if (index === -1) return null;

    const oldTeacher = db.teachers[index];
    const now = new Date().toISOString();
    const updated: Teacher = {
      ...oldTeacher,
      ...updates,
      updated_at: now
    };

    const newTeachers = [...db.teachers];
    newTeachers[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui data ustadz: ${updated.nama_lengkap}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      teachers: newTeachers,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteTeacher(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'teacher.archive')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengarsipkan ustadz.');
    }

    const db = this.getRawData();
    const teacher = db.teachers.find(t => t.id === id);
    if (!teacher) return false;

    // Check if homeroom or active mentor
    const rombelCount = (db.rombels || []).filter(r => r.homeroom_teacher_id === id || r.mentor_id === id).length;
    if (rombelCount > 0) {
      throw new Error(`Tidak dapat menghapus "${teacher.nama_lengkap}" karena tercatat sebagai wali kelas/pembimbing pada ${rombelCount} rombel.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus/arsip ustadz: ${teacher.nama_lengkap}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      teachers: db.teachers.filter(t => t.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 8. Homeroom (Wali Kelas) & Mentors ---
  public getHomeroomHistories(rombelId?: string, teacherId?: string): HomeroomHistory[] {
    const list = this.getRawData().homeroom_history || [];
    let filtered = list;
    if (rombelId) filtered = filtered.filter(h => h.rombel_id === rombelId);
    if (teacherId) filtered = filtered.filter(h => h.teacher_id === teacherId);
    return filtered;
  }

  public assignHomeroomTeacher(
    rombelId: string,
    teacherId: string,
    academicYearId: string,
    currentUser?: User
  ): HomeroomHistory {
    if (currentUser && !this.canUserPerform(currentUser, 'homeroom.assign')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menetapkan wali kelas.');
    }

    const db = this.getRawData();
    const rombel = (db.rombels || []).find(r => r.id === rombelId);
    if (!rombel) throw new Error('Data rombel tidak ditemukan.');

    const teacher = db.teachers.find(t => t.id === teacherId);
    if (!teacher) throw new Error('Data ustadz tidak ditemukan.');

    const now = new Date().toISOString();

    // Mark previous active homerooms of this rombel as selesai
    let hhList = (db.homeroom_history || []).map(h => {
      if (h.rombel_id === rombelId && h.status === 'aktif') {
        return { ...h, end_date: now.slice(0, 10), status: 'selesai' as const };
      }
      return h;
    });

    const newHH: HomeroomHistory = {
      id: generateUUID(),
      teacher_id: teacherId,
      rombel_id: rombelId,
      academic_year_id: academicYearId,
      start_date: now.slice(0, 10),
      status: 'aktif',
      created_at: now
    };
    hhList = [newHH, ...hhList];

    // Update rombel homeroom_teacher_id
    const rIndex = (db.rombels || []).findIndex(r => r.id === rombelId);
    if (db.rombels && rIndex !== -1) {
      db.rombels[rIndex].homeroom_teacher_id = teacherId;
      db.rombels[rIndex].updated_at = now;
    }

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Pendidikan',
      data_terkait: `Tetapkan ${teacher.nama_lengkap} sebagai Wali Kelas untuk rombel ${rombel.name}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      homeroom_history: hhList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newHH;
  }

  // --- 9. Asrama & Kamar (dorm_buildings & dorm_rooms) ---
  public getDormBuildings(): DormBuilding[] {
    return this.getRawData().dorm_buildings || [];
  }

  public getDormBuildingById(id: string): DormBuilding | undefined {
    return (this.getRawData().dorm_buildings || []).find(b => b.id === id);
  }

  public createDormBuilding(
    data: Omit<DormBuilding, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): DormBuilding {
    if (currentUser && !this.canUserPerform(currentUser, 'dorm.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah gedung asrama.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newBld: DormBuilding = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Asrama',
      data_terkait: `Tambah gedung asrama baru: ${newBld.nama} (${newBld.kode})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_buildings: [...(db.dorm_buildings || []), newBld],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newBld;
  }

  public updateDormBuilding(
    id: string,
    updates: Partial<DormBuilding>,
    currentUser?: User
  ): DormBuilding | null {
    if (currentUser && !this.canUserPerform(currentUser, 'dorm.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah gedung asrama.');
    }

    const db = this.getRawData();
    const list = db.dorm_buildings || [];
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return null;

    const oldBld = list[index];
    const now = new Date().toISOString();
    const updated: DormBuilding = {
      ...oldBld,
      ...updates,
      updated_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Asrama',
      data_terkait: `Perbarui gedung asrama: ${updated.nama}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_buildings: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteDormBuilding(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'dorm.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus gedung asrama.');
    }

    const db = this.getRawData();
    const bld = (db.dorm_buildings || []).find(b => b.id === id);
    if (!bld) return false;

    const roomCount = (db.dorm_rooms || []).filter(r => r.building_id === id).length;
    if (roomCount > 0) {
      throw new Error(`Tidak dapat menghapus gedung "${bld.nama}" karena masih memiliki ${roomCount} kamar aktif.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Asrama',
      data_terkait: `Hapus gedung asrama: ${bld.nama}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_buildings: (db.dorm_buildings || []).filter(b => b.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public getDormRooms(buildingId?: string): DormRoom[] {
    const list = this.getRawData().dorm_rooms || [];
    return buildingId ? list.filter(r => r.building_id === buildingId) : list;
  }

  public getDormRoomById(id: string): DormRoom | undefined {
    return (this.getRawData().dorm_rooms || []).find(r => r.id === id);
  }

  public createDormRoom(
    data: Omit<DormRoom, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): DormRoom {
    if (currentUser && !this.canUserPerform(currentUser, 'room.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah kamar asrama.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newRoom: DormRoom = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Asrama',
      data_terkait: `Tambah kamar baru: ${newRoom.nama_kamar} (Kapasitas: ${newRoom.kapasitas} santri)`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_rooms: [...(db.dorm_rooms || []), newRoom],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newRoom;
  }

  public updateDormRoom(
    id: string,
    updates: Partial<DormRoom>,
    currentUser?: User
  ): DormRoom | null {
    if (currentUser && !this.canUserPerform(currentUser, 'room.update')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah kamar asrama.');
    }

    const db = this.getRawData();
    const list = db.dorm_rooms || [];
    const index = list.findIndex(r => r.id === id);
    if (index === -1) return null;

    const oldRoom = list[index];
    const now = new Date().toISOString();
    const updated: DormRoom = {
      ...oldRoom,
      ...updates,
      updated_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Asrama',
      data_terkait: `Perbarui kamar: ${updated.nama_kamar}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_rooms: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteDormRoom(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'room.delete')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus kamar asrama.');
    }

    const db = this.getRawData();
    const room = (db.dorm_rooms || []).find(r => r.id === id);
    if (!room) return false;

    const occupants = (db.students || []).filter(s => s.room_id === id && s.status === 'aktif').length;
    if (occupants > 0) {
      throw new Error(`Tidak dapat menghapus kamar "${room.nama_kamar}" karena masih dihuni oleh ${occupants} santri.`);
    }

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Asrama',
      data_terkait: `Hapus kamar: ${room.nama_kamar}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      dorm_rooms: (db.dorm_rooms || []).filter(r => r.id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public assignStudentToRoom(
    studentId: string,
    roomId: string,
    allowOvercapacity: boolean = false,
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.room.assign')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menempatkan santri ke kamar.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const room = (db.dorm_rooms || []).find(r => r.id === roomId);
    if (!room) throw new Error('Data kamar tidak ditemukan.');

    const occupants = db.students.filter(s => s.room_id === roomId && s.status === 'aktif');
    const roomCapacity = room.capacity || room.kapasitas || 12;
    if (occupants.length >= roomCapacity) {
      if (!allowOvercapacity && currentUser?.role !== 'super_admin') {
        throw new Error(`KAMAR PENUH: Kamar "${room.nama_kamar}" telah mencapai kapasitas maksimal (${occupants.length} / ${roomCapacity} santri). Hanya Super Admin yang berhak mengizinkan penempatan melebihi kapasitas.`);
      }
    }

    const building = (db.dorm_buildings || []).find(b => b.id === room.building_id);
    const now = new Date().toISOString();

    student.room_id = room.id;
    student.nomor_kamar = room.nama_kamar;
    student.dorm_building_id = room.building_id;
    student.asrama = building?.nama || student.asrama;
    student.updated_at = now;

    // Record room history
    const roomHistory: StudentRoomHistory = {
      id: generateUUID(),
      student_id: student.id,
      room_id: room.id,
      previous_room_id: null,
      start_date: now.slice(0, 10),
      alasan: 'Penempatan kamar santri',
      petugas: currentUser?.nama_lengkap || 'Administrator',
      created_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Asrama',
      data_terkait: `Tempatkan santri ${student.nama_lengkap} ke ${room.nama_kamar} (${building?.nama || 'Gedung Asrama'})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      student_room_history: [roomHistory, ...(db.student_room_history || [])],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return student;
  }

  public transferStudentRoom(
    params: {
      studentId: string;
      newRoomId: string;
      transferDate: string;
      reason: string;
      notes?: string;
      allowOvercapacity?: boolean;
    },
    currentUser?: User
  ): Student {
    if (currentUser && !this.canUserPerform(currentUser, 'student.room.transfer')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memindahkan kamar santri.');
    }

    const db = this.getRawData();
    const student = db.students.find(s => s.id === params.studentId);
    if (!student) throw new Error('Data santri tidak ditemukan.');

    const newRoom = (db.dorm_rooms || []).find(r => r.id === params.newRoomId);
    if (!newRoom) throw new Error('Data kamar tujuan tidak ditemukan.');

    const occupants = db.students.filter(s => s.room_id === params.newRoomId && s.status === 'aktif');
    const newRoomCapacity = newRoom.capacity || newRoom.kapasitas || 12;
    if (occupants.length >= newRoomCapacity) {
      if (!params.allowOvercapacity && currentUser?.role !== 'super_admin') {
        throw new Error(`KAMAR PENUH: Kamar tujuan "${newRoom.nama_kamar}" telah penuh (${occupants.length} / ${newRoomCapacity} santri).`);
      }
    }

    const oldRoomId = student.room_id;
    const oldRoom = oldRoomId ? (db.dorm_rooms || []).find(r => r.id === oldRoomId) : null;
    const oldRoomName = oldRoom?.nama_kamar || student.nomor_kamar || 'Kamar Sebelumnya';
    const building = (db.dorm_buildings || []).find(b => b.id === newRoom.building_id);
    const now = new Date().toISOString();

    // Close previous room history end_date if active
    let rhList = (db.student_room_history || []).map(rh => {
      if (rh.student_id === student.id && !rh.end_date) {
        return { ...rh, end_date: params.transferDate || now.slice(0, 10) };
      }
      return rh;
    });

    // Create new room history record
    const newRH: StudentRoomHistory = {
      id: generateUUID(),
      student_id: student.id,
      room_id: newRoom.id,
      previous_room_id: oldRoomId || null,
      start_date: params.transferDate || now.slice(0, 10),
      alasan: params.reason,
      petugas: currentUser?.nama_lengkap || 'Administrator',
      catatan: params.notes,
      created_at: now
    };
    rhList = [newRH, ...rhList];

    student.room_id = newRoom.id;
    student.nomor_kamar = newRoom.nama_kamar;
    student.dorm_building_id = newRoom.building_id;
    student.asrama = building?.nama || student.asrama;
    student.updated_at = now;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Asrama',
      data_terkait: `Pindahkan santri ${student.nama_lengkap} dari ${oldRoomName} ke ${newRoom.nama_kamar}. Alasan: ${params.reason}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      student_room_history: rhList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return student;
  }

  public getRoomOccupants(roomId: string): Student[] {
    return this.getStudents().filter(s => s.room_id === roomId && s.status === 'aktif' && !s.is_archived);
  }

  public getStudentRoomHistory(studentId?: string): StudentRoomHistory[] {
    const list = this.getRawData().student_room_history || [];
    return studentId ? list.filter(r => r.student_id === studentId) : list;
  }

  // --- 10. Mata Pelajaran / Materi (subjects) ---
  public getSubjects(programId?: string): Subject[] {
    const list = this.getRawData().subjects || [];
    return programId ? list.filter(s => s.program_id === programId) : list;
  }

  public getSubjectById(id: string): Subject | undefined {
    return (this.getRawData().subjects || []).find(s => s.id === id);
  }

  public createSubject(
    data: Omit<Subject, 'id' | 'created_at' | 'updated_at'>,
    currentUser?: User
  ): Subject {
    if (currentUser && !this.canUserPerform(currentUser, 'learning.create')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menambah mata pelajaran.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newSubject: Subject = {
      ...data,
      id: generateUUID(),
      created_at: now,
      updated_at: now
    };

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Tambah data',
      modul: 'Pendidikan',
      data_terkait: `Tambah mata pelajaran baru: ${newSubject.nama} (${newSubject.kode}, Jenis: ${newSubject.jenis})`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      subjects: [...(db.subjects || []), newSubject],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newSubject;
  }

  public updateSubject(
    id: string,
    updates: Partial<Subject>,
    currentUser?: User
  ): Subject | null {
    if (currentUser && !this.canUserPerform(currentUser, 'learning.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk mengubah mata pelajaran.');
    }

    const db = this.getRawData();
    const list = db.subjects || [];
    const index = list.findIndex(s => s.id === id);
    if (index === -1) return null;

    const oldSubj = list[index];
    const now = new Date().toISOString();
    const updated: Subject = {
      ...oldSubj,
      ...updates,
      updated_at: now
    };

    const newList = [...list];
    newList[index] = updated;

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Perbarui materi: ${updated.nama}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      subjects: newList,
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return updated;
  }

  public deleteSubject(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'learning.edit')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus materi.');
    }

    const db = this.getRawData();
    const subj = (db.subjects || []).find(s => s.id === id);
    if (!subj) return false;

    const now = new Date().toISOString();
    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Hapus/arsip data',
      modul: 'Pendidikan',
      data_terkait: `Hapus materi pelajaran: ${subj.nama}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      subjects: (db.subjects || []).filter(s => s.id !== id),
      teacher_subjects: (db.teacher_subjects || []).filter(ts => ts.subject_id !== id),
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  public getTeacherSubjects(teacherId?: string, subjectId?: string): TeacherSubjectAssignment[] {
    const list = this.getRawData().teacher_subjects || [];
    let filtered = list;
    if (teacherId) filtered = filtered.filter(ts => ts.teacher_id === teacherId);
    if (subjectId) filtered = filtered.filter(ts => ts.subject_id === subjectId);
    return filtered;
  }

  public assignTeacherSubject(
    assignment: Omit<TeacherSubjectAssignment, 'id' | 'created_at'>,
    currentUser?: User
  ): TeacherSubjectAssignment {
    if (currentUser && !this.canUserPerform(currentUser, 'teacher.assign')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menugaskan pengajar ke materi.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const newAssignment: TeacherSubjectAssignment = {
      ...assignment,
      id: generateUUID(),
      created_at: now
    };

    const teacher = db.teachers.find(t => t.id === assignment.teacher_id);
    const subject = (db.subjects || []).find(s => s.id === assignment.subject_id);

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: currentUser?.id || 'system',
      user_name: currentUser?.nama_lengkap || 'Administrator',
      user_role: currentUser?.role || 'Admin',
      aktivitas: 'Edit data',
      modul: 'Pendidikan',
      data_terkait: `Tugaskan ${teacher?.nama_lengkap || 'Ustadz'} mengajar ${subject?.nama || 'Materi'}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      teacher_subjects: [...(db.teacher_subjects || []), newAssignment],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return newAssignment;
  }

  public removeTeacherSubject(id: string, currentUser?: User): boolean {
    if (currentUser && !this.canUserPerform(currentUser, 'teacher.assign')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk menghapus penugasan pengajar.');
    }

    const db = this.getRawData();
    const updatedDb: DatabaseSchema = {
      ...db,
      teacher_subjects: (db.teacher_subjects || []).filter(ts => ts.id !== id)
    };

    this.saveToStorage(updatedDb);
    return true;
  }

  // --- 11. Riwayat Pendidikan & Kenaikan Kelas (student_education_history & promotion) ---
  public getStudentEducationHistory(studentId?: string): StudentEducationHistory[] {
    const list = this.getRawData().student_education_history || [];
    return studentId ? list.filter(h => h.student_id === studentId) : list;
  }

  public processClassPromotion(params: {
    sourceAcademicYearId: string;
    targetAcademicYearId: string;
    promotions: Array<{
      studentId: string;
      action: 'naik' | 'tetap' | 'pindah_program' | 'pindah_tingkat' | 'lulus' | 'keluar' | 'pindah_pondok';
      targetProgramId?: string;
      targetTrackId?: string | null;
      targetLevelId?: string | null;
      targetClassId?: string;
      targetRombelId?: string | null;
      notes?: string;
    }>;
    currentUser?: User;
  }): { successCount: number; message: string } {
    if (params.currentUser && !this.canUserPerform(params.currentUser, 'student.class.promote')) {
      throw new Error('Akses Ditolak: Anda tidak memiliki izin untuk memproses kenaikan kelas massal.');
    }

    const db = this.getRawData();
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    let successCount = 0;
    const historyAdditions: StudentEducationHistory[] = [];
    const studentStatusHistoryAdditions: StudentHistory[] = [];

    const srcYear = (db.academic_years || []).find(y => y.id === params.sourceAcademicYearId)?.nama_tahun_ajaran || 'Tahun Asal';
    const tgtYear = (db.academic_years || []).find(y => y.id === params.targetAcademicYearId)?.nama_tahun_ajaran || 'Tahun Tujuan';

    for (const item of params.promotions) {
      const student = db.students.find(s => s.id === item.studentId);
      if (!student) continue;

      const oldRombelName = student.rombel || '-';
      const oldStatus = student.status;

      // Close previous education history end_date
      if (db.student_education_history) {
        db.student_education_history = db.student_education_history.map(h => {
          if (h.student_id === student.id && h.academic_year_id === params.sourceAcademicYearId && !h.end_date) {
            return { ...h, end_date: today, status: item.action === 'lulus' ? 'lulus' : (item.action === 'keluar' ? 'keluar' : 'selesai') };
          }
          return h;
        });
      }

      if (item.action === 'lulus') {
        student.status = 'lulus';
        student.rombel_id = null;
        student.rombel = undefined;
        student.updated_at = now;

        studentStatusHistoryAdditions.push({
          id: generateUUID(),
          student_id: student.id,
          tanggal: today,
          jenis_perubahan: 'Lulus',
          status_lama: oldStatus,
          status_baru: 'lulus',
          kelas_lama: oldRombelName,
          kelas_baru: null,
          keterangan: `Kelulusan saat proses kenaikan kelas TA ${srcYear} ke ${tgtYear}. ${item.notes || ''}`,
          user_id: params.currentUser?.id || 'system',
          created_at: now
        });
      } else if (item.action === 'keluar' || item.action === 'pindah_pondok') {
        student.status = item.action === 'keluar' ? 'keluar' : 'pindah';
        student.rombel_id = null;
        student.rombel = undefined;
        student.updated_at = now;

        studentStatusHistoryAdditions.push({
          id: generateUUID(),
          student_id: student.id,
          tanggal: today,
          jenis_perubahan: item.action === 'keluar' ? 'Keluar' : 'Pindah',
          status_lama: oldStatus,
          status_baru: student.status,
          kelas_lama: oldRombelName,
          kelas_baru: null,
          keterangan: `Mutasi keluar saat proses kenaikan kelas TA ${srcYear} ke ${tgtYear}. ${item.notes || ''}`,
          user_id: params.currentUser?.id || 'system',
          created_at: now
        });
      } else {
        // Naik, Tetap, Pindah Program, Pindah Tingkat
        if (item.targetProgramId) student.program_id = item.targetProgramId;
        if (item.targetTrackId !== undefined) student.track_id = item.targetTrackId;
        if (item.targetLevelId !== undefined) student.level_id = item.targetLevelId;
        if (item.targetClassId) student.kelas_id = item.targetClassId;
        if (item.targetRombelId !== undefined) {
          student.rombel_id = item.targetRombelId;
          const tgtRombel = (db.rombels || []).find(r => r.id === item.targetRombelId);
          student.rombel = tgtRombel?.name;
        }
        student.status = 'aktif';
        student.updated_at = now;

        const eduHistory: StudentEducationHistory = {
          id: generateUUID(),
          student_id: student.id,
          academic_year_id: params.targetAcademicYearId,
          program_id: student.program_id || 'prog-kitabiyah',
          track_id: student.track_id || null,
          level_id: student.level_id || null,
          class_id: student.kelas_id || 'cls-mubtadi',
          rombel_id: student.rombel_id || null,
          start_date: today,
          status: item.action === 'naik' ? 'naik' : (item.action === 'tetap' ? 'tetap' : 'pindah_tingkat'),
          notes: `Proses kenaikan kelas dari TA ${srcYear} ke ${tgtYear}. Status: ${item.action}. ${item.notes || ''}`,
          created_at: now,
          updated_at: now
        };
        historyAdditions.push(eduHistory);

        studentStatusHistoryAdditions.push({
          id: generateUUID(),
          student_id: student.id,
          tanggal: today,
          jenis_perubahan: 'Kenaikan Kelas',
          status_lama: oldStatus,
          status_baru: 'aktif',
          kelas_lama: oldRombelName,
          kelas_baru: student.rombel || 'Rombel Baru',
          keterangan: `Kenaikan kelas dari TA ${srcYear} ke ${tgtYear}. Status: ${item.action}`,
          user_id: params.currentUser?.id || 'system',
          created_at: now
        });
      }

      successCount++;
    }

    const auditEntry: AuditLog = {
      id: generateUUID(),
      user_id: params.currentUser?.id || 'system',
      user_name: params.currentUser?.nama_lengkap || 'Administrator',
      user_role: params.currentUser?.role || 'Admin',
      aktivitas: 'Perubahan status',
      modul: 'Pendidikan',
      data_terkait: `Proses Kenaikan Kelas Massal dari TA ${srcYear} ke ${tgtYear} untuk ${successCount} santri`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: now
    };

    const updatedDb: DatabaseSchema = {
      ...db,
      student_education_history: [...historyAdditions, ...(db.student_education_history || [])],
      student_history: [...studentStatusHistoryAdditions, ...(db.student_history || [])],
      audit_logs: [auditEntry, ...(db.audit_logs || [])]
    };

    this.saveToStorage(updatedDb);
    return {
      successCount,
      message: `Berhasil memproses kenaikan dan mutasi kelas untuk ${successCount} santri.`
    };
  }

  // --- 12. Dashboard Pendidikan (Real Database Stats) ---
  public getEducationStats() {
    const db = this.getRawData();
    const students = (db.students || []).filter(s => !s.is_archived);
    const activeStudents = students.filter(s => s.status === 'aktif');
    const programs = db.education_programs || [];
    const classes = db.classes || [];
    const rombels = db.rombels || [];
    const teachers = db.teachers || [];
    const buildings = db.dorm_buildings || [];
    const rooms = db.dorm_rooms || [];

    // Occupancy
    const fullRooms = rooms.filter(r => {
      const occ = activeStudents.filter(s => s.room_id === r.id).length;
      const roomCap = r.capacity || r.kapasitas || 0;
      return occ >= roomCap;
    });

    // Unassigned students
    const santriWithoutClass = activeStudents.filter(s => !s.kelas_id);
    const santriWithoutRombel = activeStudents.filter(s => !s.rombel_id);
    const santriWithoutRoom = activeStudents.filter(s => !s.room_id);

    // Distribution by program
    const programDistribution = programs.map(p => {
      const count = activeStudents.filter(s => s.program_id === p.id).length;
      return {
        programId: p.id,
        programName: p.name,
        code: p.code,
        count
      };
    });

    // Distribution by level
    const levels = db.education_levels || [];
    const levelDistribution = levels.map(lvl => {
      const count = activeStudents.filter(s => s.level_id === lvl.id).length;
      const prog = programs.find(p => p.id === lvl.program_id);
      return {
        levelId: lvl.id,
        levelName: lvl.name,
        programName: prog?.name || 'Program',
        count
      };
    });

    // Distribution by rombel
    const rombelDistribution = rombels.map(r => {
      const count = activeStudents.filter(s => s.rombel_id === r.id).length;
      return {
        rombelId: r.id,
        rombelName: r.name,
        capacity: r.capacity,
        count
      };
    });

    // Dorm building occupancy
    const dormOccupancy = buildings.map(b => {
      const buildingRooms = rooms.filter(r => r.building_id === b.id);
      const totalCapacity = buildingRooms.reduce((acc, r) => acc + (r.capacity || r.kapasitas || 0), 0);
      const occupied = activeStudents.filter(s => s.dorm_building_id === b.id).length;
      return {
        buildingId: b.id,
        buildingName: b.nama,
        gender: b.gender,
        roomsCount: buildingRooms.length,
        capacity: totalCapacity,
        occupied
      };
    });

    return {
      totalSantriAktif: activeStudents.length,
      totalPrograms: programs.length,
      totalClasses: classes.length,
      totalRombels: rombels.length,
      totalTeachers: teachers.length,
      totalDormBuildings: buildings.length,
      totalDormRooms: rooms.length,
      fullRoomsCount: fullRooms.length,
      santriWithoutClassCount: santriWithoutClass.length,
      santriWithoutRombelCount: santriWithoutRombel.length,
      santriWithoutRoomCount: santriWithoutRoom.length,
      programDistribution,
      levelDistribution,
      rombelDistribution,
      dormOccupancy
    };
  }

  // ==========================================
  // --- STAGE 5: AKADEMIK & PEMBELAJARAN ---
  // ==========================================

  // --- 1. Academic Periods ---
  public getAcademicPeriods(): AcademicPeriod[] {
    const db = this.getRawData();
    return db.academic_periods && db.academic_periods.length > 0 ? db.academic_periods : DEFAULT_ACADEMIC_PERIODS;
  }

  public getActiveAcademicPeriod(): AcademicPeriod | null {
    const periods = this.getAcademicPeriods();
    return periods.find(p => p.status === 'aktif') || periods[0] || null;
  }

  public saveAcademicPeriod(period: Partial<AcademicPeriod>): AcademicPeriod {
    const db = this.getRawData();
    const periods = db.academic_periods || [...DEFAULT_ACADEMIC_PERIODS];
    const now = new Date().toISOString();
    let saved: AcademicPeriod;

    if (period.id) {
      const idx = periods.findIndex(p => p.id === period.id);
      if (idx !== -1) {
        periods[idx] = { ...periods[idx], ...period, updated_at: now } as AcademicPeriod;
        saved = periods[idx];
      } else {
        saved = period as AcademicPeriod;
      }
    } else {
      saved = {
        id: generateUUID(),
        academic_year_id: period.academic_year_id || this.getActiveAcademicYear()?.id || 'ay-2026-2027',
        name: period.name || 'Semester 1',
        semester: period.semester || 'Semester 1',
        start_date: period.start_date || new Date().toISOString().slice(0, 10),
        end_date: period.end_date || new Date().toISOString().slice(0, 10),
        status: period.status || 'nonaktif',
        notes: period.notes || '',
        created_at: now,
        updated_at: now
      };
      periods.push(saved);
    }

    if (saved.status === 'aktif') {
      periods.forEach(p => {
        if (p.id !== saved.id) p.status = 'nonaktif';
      });
    }

    this.saveToStorage({ ...db, academic_periods: periods });
    return saved;
  }

  public deleteAcademicPeriod(id: string): void {
    const db = this.getRawData();
    const periods = (db.academic_periods || []).filter(p => p.id !== id);
    this.saveToStorage({ ...db, academic_periods: periods });
  }

  // --- 2. Schedules ---
  public getSchedules(): Schedule[] {
    const db = this.getRawData();
    return db.schedules && db.schedules.length > 0 ? db.schedules : DEFAULT_SCHEDULES;
  }

  public saveSchedule(sched: Partial<Schedule>): Schedule {
    const db = this.getRawData();
    const schedules = db.schedules || [...DEFAULT_SCHEDULES];
    const now = new Date().toISOString();
    let saved: Schedule;

    if (sched.id) {
      const idx = schedules.findIndex(s => s.id === sched.id);
      if (idx !== -1) {
        schedules[idx] = { ...schedules[idx], ...sched, updated_at: now } as Schedule;
        saved = schedules[idx];
      } else {
        saved = sched as Schedule;
      }
    } else {
      saved = {
        id: generateUUID(),
        hari: sched.hari || 'Senin',
        tanggal: sched.tanggal || '',
        jam_mulai: sched.jam_mulai || '07:00',
        jam_selesai: sched.jam_selesai || '08:00',
        subject_id: sched.subject_id || '',
        program_id: sched.program_id || 'prog-kitabiyah',
        level_id: sched.level_id || null,
        class_id: sched.class_id || null,
        rombel_id: sched.rombel_id || '',
        teacher_id: sched.teacher_id || '',
        ruangan: sched.ruangan || 'Kelas Utama',
        academic_year_id: sched.academic_year_id || this.getActiveAcademicYear()?.id || 'ay-2026-2027',
        period_id: sched.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
        status: sched.status || 'aktif',
        created_at: now,
        updated_at: now
      };
      schedules.push(saved);
    }

    this.saveToStorage({ ...db, schedules });
    return saved;
  }

  public deleteSchedule(id: string): void {
    const db = this.getRawData();
    const schedules = (db.schedules || []).filter(s => s.id !== id);
    this.saveToStorage({ ...db, schedules });
  }

  // --- 3. Grade Components ---
  public getGradeComponents(): GradeComponent[] {
    const db = this.getRawData();
    return db.grade_components && db.grade_components.length > 0 ? db.grade_components : DEFAULT_GRADE_COMPONENTS;
  }

  public saveGradeComponent(cmp: Partial<GradeComponent>): GradeComponent {
    const db = this.getRawData();
    const components = db.grade_components || [...DEFAULT_GRADE_COMPONENTS];
    const now = new Date().toISOString();
    let saved: GradeComponent;

    if (cmp.id) {
      const idx = components.findIndex(c => c.id === cmp.id);
      if (idx !== -1) {
        components[idx] = { ...components[idx], ...cmp, updated_at: now } as GradeComponent;
        saved = components[idx];
      } else {
        saved = cmp as GradeComponent;
      }
    } else {
      saved = {
        id: generateUUID(),
        code: cmp.code || 'CMP-' + Math.floor(Math.random() * 1000),
        name: cmp.name || 'Komponen Baru',
        weight: cmp.weight || 10,
        program_id: cmp.program_id || null,
        category: cmp.category || 'umum',
        status: cmp.status || 'aktif',
        created_at: now,
        updated_at: now
      };
      components.push(saved);
    }

    this.saveToStorage({ ...db, grade_components: components });
    return saved;
  }

  public deleteGradeComponent(id: string): void {
    const db = this.getRawData();
    const components = (db.grade_components || []).filter(c => c.id !== id);
    this.saveToStorage({ ...db, grade_components: components });
  }

  // --- 4. Student Grades ---
  public getStudentGrades(): StudentGrade[] {
    const db = this.getRawData();
    return db.student_grades && db.student_grades.length > 0 ? db.student_grades : DEFAULT_STUDENT_GRADES;
  }

  public saveStudentGrade(grade: Partial<StudentGrade>): StudentGrade {
    const db = this.getRawData();
    const grades = db.student_grades || [...DEFAULT_STUDENT_GRADES];
    const now = new Date().toISOString();
    let saved: StudentGrade;

    const existingIdx = grades.findIndex(g => 
      (grade.id && g.id === grade.id) ||
      (g.student_id === grade.student_id && g.subject_id === grade.subject_id && g.period_id === grade.period_id)
    );

    if (existingIdx !== -1) {
      grades[existingIdx] = {
        ...grades[existingIdx],
        ...grade,
        updated_at: now
      } as StudentGrade;
      saved = grades[existingIdx];
    } else {
      saved = {
        id: generateUUID(),
        student_id: grade.student_id || '',
        academic_year_id: grade.academic_year_id || this.getActiveAcademicYear()?.id || 'ay-2026-2027',
        period_id: grade.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
        program_id: grade.program_id || 'prog-kitabiyah',
        level_id: grade.level_id || null,
        rombel_id: grade.rombel_id || '',
        subject_id: grade.subject_id || '',
        teacher_id: grade.teacher_id || '',
        component_grades: grade.component_grades || {},
        final_grade: grade.final_grade || 0,
        predikat: grade.predikat || 'Cukup',
        catatan: grade.catatan || '',
        updated_by: grade.updated_by || 'Admin',
        created_at: now,
        updated_at: now
      };
      grades.push(saved);
    }

    this.saveToStorage({ ...db, student_grades: grades });
    return saved;
  }

  public bulkSaveStudentGrades(gradeList: Partial<StudentGrade>[]): void {
    gradeList.forEach(g => this.saveStudentGrade(g));
  }

  // --- 5. Tahfidz ---
  public getTahfidzRecords(studentId?: string): TahfidzRecord[] {
    const db = this.getRawData();
    const records = db.tahfidz_records && db.tahfidz_records.length > 0 ? db.tahfidz_records : DEFAULT_TAHFIDZ_RECORDS;
    if (studentId) return records.filter(r => r.student_id === studentId);
    return records;
  }

  public addTahfidzRecord(rec: Partial<TahfidzRecord>, currentUser?: User): TahfidzRecord {
    const db = this.getRawData();
    const records = db.tahfidz_records || [...DEFAULT_TAHFIDZ_RECORDS];
    const now = new Date().toISOString();

    const newRecord: TahfidzRecord = {
      id: generateUUID(),
      student_id: rec.student_id || '',
      teacher_id: rec.teacher_id || currentUser?.id || 'tchr-03',
      tanggal: rec.tanggal || new Date().toISOString().slice(0, 10),
      period_id: rec.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
      juz: rec.juz || 1,
      surah: rec.surah || 'Al-Baqarah',
      ayat_mulai: rec.ayat_mulai || 1,
      ayat_selesai: rec.ayat_selesai || 10,
      halaman_mulai: rec.halaman_mulai || 1,
      halaman_selesai: rec.halaman_selesai || 2,
      jenis_setoran: rec.jenis_setoran || 'Hafalan Baru',
      nilai: rec.nilai || 85,
      kualitas: rec.kualitas || 'Baik',
      catatan: rec.catatan || '',
      created_at: now,
      updated_at: now
    };

    records.unshift(newRecord);
    this.saveToStorage({ ...db, tahfidz_records: records });
    return newRecord;
  }

  public updateTahfidzRecord(
    id: string,
    newValues: Partial<TahfidzRecord>,
    user: User,
    reason: string
  ): TahfidzRecord | null {
    const db = this.getRawData();
    const records = db.tahfidz_records || [...DEFAULT_TAHFIDZ_RECORDS];
    const auditLogs = db.tahfidz_audit_logs || [];
    const idx = records.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const oldRec = records[idx];
    const now = new Date().toISOString();

    const auditEntry: TahfidzAuditLog = {
      id: generateUUID(),
      record_id: id,
      student_id: oldRec.student_id,
      nilai_lama: oldRec.nilai,
      nilai_baru: newValues.nilai ?? oldRec.nilai,
      kualitas_lama: oldRec.kualitas,
      kualitas_baru: newValues.kualitas ?? oldRec.kualitas,
      user_id: user.id,
      user_nama: user.nama_lengkap,
      alasan: reason || 'Koreksi setoran tahfidz',
      created_at: now
    };

    records[idx] = {
      ...oldRec,
      ...newValues,
      updated_at: now
    };

    auditLogs.unshift(auditEntry);
    this.saveToStorage({ ...db, tahfidz_records: records, tahfidz_audit_logs: auditLogs });
    return records[idx];
  }

  public getTahfidzAuditLogs(): TahfidzAuditLog[] {
    const db = this.getRawData();
    return db.tahfidz_audit_logs || [];
  }

  public getTahfidzTargets(studentId?: string): TahfidzTarget[] {
    const db = this.getRawData();
    const targets = db.tahfidz_targets && db.tahfidz_targets.length > 0 ? db.tahfidz_targets : DEFAULT_TAHFIDZ_TARGETS;
    if (studentId) return targets.filter(t => t.student_id === studentId);
    return targets;
  }

  public saveTahfidzTarget(target: Partial<TahfidzTarget>): TahfidzTarget {
    const db = this.getRawData();
    const targets = db.tahfidz_targets || [...DEFAULT_TAHFIDZ_TARGETS];
    const now = new Date().toISOString();
    let saved: TahfidzTarget;

    const existingIdx = targets.findIndex(t => 
      (target.id && t.id === target.id) || 
      (t.student_id === target.student_id && t.period_id === target.period_id)
    );

    if (existingIdx !== -1) {
      targets[existingIdx] = { ...targets[existingIdx], ...target, updated_at: now } as TahfidzTarget;
      saved = targets[existingIdx];
    } else {
      saved = {
        id: generateUUID(),
        student_id: target.student_id || '',
        target_juz: target.target_juz || 5,
        target_surah: target.target_surah || 'An-Nisa',
        target_ayat: target.target_ayat || '1-176',
        target_halaman: target.target_halaman || 100,
        period_id: target.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
        tanggal_mulai: target.tanggal_mulai || new Date().toISOString().slice(0, 10),
        target_selesai: target.target_selesai || '2026-12-20',
        status: target.status || 'Berjalan',
        notes: target.notes || '',
        created_at: now,
        updated_at: now
      };
      targets.push(saved);
    }

    this.saveToStorage({ ...db, tahfidz_targets: targets });
    return saved;
  }

  // --- 6. Murojaah ---
  public getMurojaahRecords(studentId?: string): MurojaahRecord[] {
    const db = this.getRawData();
    const records = db.murojaah_records && db.murojaah_records.length > 0 ? db.murojaah_records : DEFAULT_MUROJAAH_RECORDS;
    if (studentId) return records.filter(r => r.student_id === studentId);
    return records;
  }

  public addMurojaahRecord(rec: Partial<MurojaahRecord>): MurojaahRecord {
    const db = this.getRawData();
    const records = db.murojaah_records || [...DEFAULT_MUROJAAH_RECORDS];
    const now = new Date().toISOString();

    const newRecord: MurojaahRecord = {
      id: generateUUID(),
      student_id: rec.student_id || '',
      teacher_id: rec.teacher_id || 'tchr-03',
      tanggal: rec.tanggal || new Date().toISOString().slice(0, 10),
      period_id: rec.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
      juz: rec.juz || 1,
      surah: rec.surah || 'Al-Baqarah',
      ayat: rec.ayat || '1-100',
      halaman: rec.halaman || 10,
      jenis_murojaah: rec.jenis_murojaah || 'Murojaah Harian',
      hasil: rec.hasil || 'Lancar',
      nilai: rec.nilai || 85,
      catatan: rec.catatan || '',
      created_at: now,
      updated_at: now
    };

    records.unshift(newRecord);
    this.saveToStorage({ ...db, murojaah_records: records });
    return newRecord;
  }

  // --- 7. BTQ ---
  public getBTQRecords(studentId?: string): BTQRecord[] {
    const db = this.getRawData();
    const records = db.btq_records && db.btq_records.length > 0 ? db.btq_records : DEFAULT_BTQ_RECORDS;
    if (studentId) return records.filter(r => r.student_id === studentId);
    return records;
  }

  public saveBTQRecord(rec: Partial<BTQRecord>): BTQRecord {
    const db = this.getRawData();
    const records = db.btq_records || [...DEFAULT_BTQ_RECORDS];
    const now = new Date().toISOString();

    const scores = [
      rec.makharijul_huruf || 80,
      rec.tajwid || 80,
      rec.kelancaran || 80,
      rec.fasahah || 80,
      rec.membaca_alquran || 80,
      rec.menulis_arab || 80,
      rec.hafalan_dasar || 80,
      rec.praktik || 80
    ];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    let level: 'Pemula' | 'Dasar' | 'Menengah' | 'Lanjutan' = 'Menengah';
    if (avg >= 85) level = 'Lanjutan';
    else if (avg >= 75) level = 'Menengah';
    else if (avg >= 65) level = 'Dasar';
    else level = 'Pemula';

    const saved: BTQRecord = {
      id: rec.id || generateUUID(),
      student_id: rec.student_id || '',
      teacher_id: rec.teacher_id || 'tchr-05',
      period_id: rec.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
      tanggal: rec.tanggal || new Date().toISOString().slice(0, 10),
      makharijul_huruf: rec.makharijul_huruf || 80,
      tajwid: rec.tajwid || 80,
      kelancaran: rec.kelancaran || 80,
      fasahah: rec.fasahah || 80,
      membaca_alquran: rec.membaca_alquran || 80,
      menulis_arab: rec.menulis_arab || 80,
      hafalan_dasar: rec.hafalan_dasar || 80,
      praktik: rec.praktik || 80,
      nilai_akhir: avg,
      level_kemampuan: rec.level_kemampuan || level,
      catatan: rec.catatan || '',
      created_at: now,
      updated_at: now
    };

    const existingIdx = records.findIndex(r => r.id === saved.id || (r.student_id === saved.student_id && r.period_id === saved.period_id));
    if (existingIdx !== -1) {
      records[existingIdx] = saved;
    } else {
      records.unshift(saved);
    }

    this.saveToStorage({ ...db, btq_records: records });
    return saved;
  }

  // --- 8. Absensi ---
  public getAttendanceRecords(filter?: { studentId?: string; rombelId?: string; date?: string; periodId?: string }): AttendanceRecord[] {
    const db = this.getRawData();
    let list = db.attendance_records && db.attendance_records.length > 0 ? db.attendance_records : DEFAULT_ATTENDANCE_RECORDS;

    if (filter?.studentId) list = list.filter(r => r.student_id === filter.studentId);
    if (filter?.rombelId) list = list.filter(r => r.rombel_id === filter.rombelId);
    if (filter?.date) list = list.filter(r => r.tanggal === filter.date);
    if (filter?.periodId) list = list.filter(r => r.period_id === filter.periodId);

    return list;
  }

  public saveAttendanceBatch(batch: Partial<AttendanceRecord>[]): void {
    const db = this.getRawData();
    const records = db.attendance_records || [...DEFAULT_ATTENDANCE_RECORDS];
    const now = new Date().toISOString();

    batch.forEach(item => {
      const existingIdx = records.findIndex(r => 
        r.student_id === item.student_id && 
        r.tanggal === item.tanggal && 
        r.rombel_id === item.rombel_id
      );

      const recordObj: AttendanceRecord = {
        id: item.id || (existingIdx !== -1 ? records[existingIdx].id : generateUUID()),
        student_id: item.student_id || '',
        tanggal: item.tanggal || new Date().toISOString().slice(0, 10),
        period_id: item.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
        rombel_id: item.rombel_id || '',
        subject_id: item.subject_id || null,
        teacher_id: item.teacher_id || null,
        status: item.status || 'Hadir',
        keterangan: item.keterangan || '',
        created_at: now,
        updated_at: now
      };

      if (existingIdx !== -1) {
        records[existingIdx] = recordObj;
      } else {
        records.push(recordObj);
      }
    });

    this.saveToStorage({ ...db, attendance_records: records });
  }

  public getStudentAttendanceSummary(studentId: string) {
    const list = this.getAttendanceRecords({ studentId });
    const hadir = list.filter(r => r.status === 'Hadir').length;
    const izin = list.filter(r => r.status === 'Izin').length;
    const sakit = list.filter(r => r.status === 'Sakit').length;
    const alpa = list.filter(r => r.status === 'Alpa').length;
    const dispensasi = list.filter(r => r.status === 'Dispensasi' || r.status === 'Tugas Pondok').length;
    const total = list.length;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { total, hadir, izin, sakit, alpa, dispensasi, percentage, records: list };
  }

  // --- 9. Rapor Santri ---
  public getStudentReport(studentId: string, periodId?: string): StudentReport | null {
    const db = this.getRawData();
    const reports = db.student_reports || [];
    const pId = periodId || this.getActiveAcademicPeriod()?.id || 'period-2026-1';
    return reports.find(r => r.student_id === studentId && r.period_id === pId) || null;
  }

  public saveStudentReport(rep: Partial<StudentReport>): StudentReport {
    const db = this.getRawData();
    const reports = db.student_reports || [];
    const now = new Date().toISOString();
    let saved: StudentReport;

    const existingIdx = reports.findIndex(r => r.student_id === rep.student_id && r.period_id === rep.period_id);

    if (existingIdx !== -1) {
      reports[existingIdx] = { ...reports[existingIdx], ...rep, updated_at: now } as StudentReport;
      saved = reports[existingIdx];
    } else {
      saved = {
        id: generateUUID(),
        student_id: rep.student_id || '',
        academic_year_id: rep.academic_year_id || this.getActiveAcademicYear()?.id || 'ay-2026-2027',
        period_id: rep.period_id || this.getActiveAcademicPeriod()?.id || 'period-2026-1',
        rombel_id: rep.rombel_id || '',
        tanggal_cetak: rep.tanggal_cetak || new Date().toISOString().slice(0, 10),
        akhlak_catatan: rep.akhlak_catatan || 'Sangat santun dan taat pada aturan pondok.',
        kedisiplinan_catatan: rep.kedisiplinan_catatan || 'Kedisiplinan jamaah dan kegiatan sangat baik.',
        wali_kelas_catatan: rep.wali_kelas_catatan || 'Pertahankan ketekunan mengaji dan tingkatkan ziyadah hafalan.',
        pengasuh_catatan: rep.pengasuh_catatan || 'Moga menjadi ilmu yang bermanfaat dan barokah dunia akhirat.',
        status: rep.status || 'final',
        created_at: now,
        updated_at: now
      };
      reports.push(saved);
    }

    this.saveToStorage({ ...db, student_reports: reports });
    return saved;
  }

  // --- 10. Dashboard Stats Tahfidz & Academic ---
  public getTahfidzStats() {
    const records = this.getTahfidzRecords();
    const murojaahs = this.getMurojaahRecords();
    const targets = this.getTahfidzTargets();
    const students = this.getStudents().filter(s => s.status === 'aktif');
    const tahfidzStudents = students.filter(s => 
      s.program?.toLowerCase().includes('tahfidz') || s.program_id === 'prog-tahfidz'
    );

    const todayStr = new Date().toISOString().slice(0, 10);
    const setoranToday = records.filter(r => r.tanggal === todayStr).length;
    const murojaahToday = murojaahs.filter(m => m.tanggal === todayStr).length;

    // Average score
    const totalScore = records.reduce((acc, r) => acc + (r.nilai || 0), 0);
    const avgScore = records.length > 0 ? Math.round(totalScore / records.length) : 0;

    // Count targets
    const targetAchieved = targets.filter(t => t.status === 'Tercapai').length;
    const targetDelayed = targets.filter(t => t.status === 'Terlambat' || t.status === 'Tidak Tercapai').length;

    return {
      totalTahfidzStudents: tahfidzStudents.length,
      setoranToday,
      murojaahToday,
      avgScore,
      targetAchieved,
      targetDelayed,
      totalRecords: records.length,
      totalMurojaahs: murojaahs.length
    };
  }

  // ==========================================
  // --- STAGE 6: ADMINISTRASI, SURAT & DOKUMEN ---
  // ==========================================

  // --- 1. Surat Masuk ---
  public getIncomingLetters(filter?: { status?: string; kategori?: string; search?: string }): IncomingLetter[] {
    const db = this.getRawData();
    let list = db.incoming_letters || [...DEFAULT_INCOMING_LETTERS];

    if (filter?.status && filter.status !== 'all') {
      list = list.filter(l => l.status === filter.status);
    }
    if (filter?.kategori && filter.kategori !== 'all') {
      list = list.filter(l => l.kategori === filter.kategori);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(l => 
        l.nomor_surat.toLowerCase().includes(q) ||
        l.asal_surat.toLowerCase().includes(q) ||
        l.perihal.toLowerCase().includes(q) ||
        l.ringkasan.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.tanggal_surat).getTime() - new Date(a.tanggal_surat).getTime());
  }

  public saveIncomingLetter(letter: Partial<IncomingLetter>): IncomingLetter {
    const db = this.getRawData();
    const list = db.incoming_letters || [...DEFAULT_INCOMING_LETTERS];
    const now = new Date().toISOString();
    let saved: IncomingLetter;

    if (letter.id) {
      const idx = list.findIndex(l => l.id === letter.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...letter, updated_at: now } as IncomingLetter;
        saved = list[idx];
      } else {
        saved = { ...letter, id: letter.id, created_at: now, updated_at: now } as IncomingLetter;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        nomor_surat: letter.nomor_surat || this.generateNextLetterNumber('MASUK'),
        tanggal_surat: letter.tanggal_surat || new Date().toISOString().slice(0, 10),
        tanggal_diterima: letter.tanggal_diterima || new Date().toISOString().slice(0, 10),
        asal_surat: letter.asal_surat || '',
        tujuan: letter.tujuan || 'Pengasuh PP Nurus Sholah',
        perihal: letter.perihal || '',
        kategori: letter.kategori || 'Dinas',
        ringkasan: letter.ringkasan || '',
        file_url: letter.file_url || '',
        file_name: letter.file_name || '',
        status: letter.status || 'Baru',
        petugas: letter.petugas || 'Sekretariat Pesantren',
        catatan: letter.catatan || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, incoming_letters: list });
    return saved;
  }

  public deleteIncomingLetter(id: string): void {
    const db = this.getRawData();
    const list = (db.incoming_letters || [...DEFAULT_INCOMING_LETTERS]).filter(l => l.id !== id);
    this.saveToStorage({ ...db, incoming_letters: list });
  }

  // --- 2. Surat Keluar ---
  public getOutgoingLetters(filter?: { status?: string; kategori?: string; search?: string }): OutgoingLetter[] {
    const db = this.getRawData();
    let list = db.outgoing_letters || [...DEFAULT_OUTGOING_LETTERS];

    if (filter?.status && filter.status !== 'all') {
      list = list.filter(l => l.status === filter.status);
    }
    if (filter?.kategori && filter.kategori !== 'all') {
      list = list.filter(l => l.kategori === filter.kategori);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(l => 
        l.nomor_surat.toLowerCase().includes(q) ||
        l.tujuan.toLowerCase().includes(q) ||
        l.perihal.toLowerCase().includes(q) ||
        l.isi_ringkasan.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.tanggal_surat).getTime() - new Date(a.tanggal_surat).getTime());
  }

  public saveOutgoingLetter(letter: Partial<OutgoingLetter>): OutgoingLetter {
    const db = this.getRawData();
    const list = db.outgoing_letters || [...DEFAULT_OUTGOING_LETTERS];
    const now = new Date().toISOString();
    let saved: OutgoingLetter;

    if (letter.id) {
      const idx = list.findIndex(l => l.id === letter.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...letter, updated_at: now } as OutgoingLetter;
        saved = list[idx];
      } else {
        saved = { ...letter, id: letter.id, created_at: now, updated_at: now } as OutgoingLetter;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        nomor_surat: letter.nomor_surat || this.generateNextLetterNumber('KELUAR'),
        tanggal_surat: letter.tanggal_surat || new Date().toISOString().slice(0, 10),
        tujuan: letter.tujuan || '',
        perihal: letter.perihal || '',
        kategori: letter.kategori || 'Keterangan',
        isi_ringkasan: letter.isi_ringkasan || '',
        penandatangan: letter.penandatangan || 'KH. Muhammad Syamsul Arifin, S.Ag.',
        lampiran: letter.lampiran || '',
        file_url: letter.file_url || '',
        file_name: letter.file_name || '',
        status: letter.status || 'Draft',
        catatan: letter.catatan || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, outgoing_letters: list });
    return saved;
  }

  public deleteOutgoingLetter(id: string): void {
    const db = this.getRawData();
    const list = (db.outgoing_letters || [...DEFAULT_OUTGOING_LETTERS]).filter(l => l.id !== id);
    this.saveToStorage({ ...db, outgoing_letters: list });
  }

  // --- 3. Template Surat ---
  public getLetterTemplates(): LetterTemplate[] {
    const db = this.getRawData();
    return db.letter_templates || [...DEFAULT_LETTER_TEMPLATES];
  }

  public getLetterTemplateById(id: string): LetterTemplate | null {
    const list = this.getLetterTemplates();
    return list.find(t => t.id === id || t.kode === id) || null;
  }

  public saveLetterTemplate(tpl: Partial<LetterTemplate>): LetterTemplate {
    const db = this.getRawData();
    const list = db.letter_templates || [...DEFAULT_LETTER_TEMPLATES];
    const now = new Date().toISOString();
    let saved: LetterTemplate;

    if (tpl.id) {
      const idx = list.findIndex(t => t.id === tpl.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...tpl, updated_at: now } as LetterTemplate;
        saved = list[idx];
      } else {
        saved = { ...tpl, id: tpl.id, created_at: now, updated_at: now } as LetterTemplate;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        kode: tpl.kode || `TPL-${Date.now().toString().slice(-4)}`,
        nama: tpl.nama || 'Template Surat Baru',
        jenis: tpl.jenis || 'Lainnya',
        judul_surat: tpl.judul_surat || 'SURAT PESANTREN',
        body_template: tpl.body_template || '',
        default_penandatangan: tpl.default_penandatangan || 'KH. Muhammad Syamsul Arifin, S.Ag.',
        default_jabatan: tpl.default_jabatan || 'Pengasuh Pondok Pesantren',
        status: tpl.status || 'aktif',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, letter_templates: list });
    return saved;
  }

  // --- 4. Surat Santri (Generator & Records) ---
  public getStudentLetters(filter?: { studentId?: string; jenis?: string; status?: string; search?: string }): StudentLetter[] {
    const db = this.getRawData();
    let list = db.student_letters || [...DEFAULT_STUDENT_LETTERS];

    if (filter?.studentId) {
      list = list.filter(l => l.student_id === filter.studentId);
    }
    if (filter?.jenis && filter.jenis !== 'all') {
      list = list.filter(l => l.jenis_surat === filter.jenis);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(l => l.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const students = this.getStudents();
      list = list.filter(l => {
        const s = students.find(st => st.id === l.student_id);
        const sName = s ? s.nama_lengkap.toLowerCase() : '';
        const sNis = s ? s.nis.toLowerCase() : '';
        return (
          l.nomor_surat.toLowerCase().includes(q) ||
          l.perihal.toLowerCase().includes(q) ||
          l.judul.toLowerCase().includes(q) ||
          sName.includes(q) ||
          sNis.includes(q)
        );
      });
    }

    return list.sort((a, b) => new Date(b.tanggal_surat).getTime() - new Date(a.tanggal_surat).getTime());
  }

  public saveStudentLetter(letter: Partial<StudentLetter>): StudentLetter {
    const db = this.getRawData();
    const list = db.student_letters || [...DEFAULT_STUDENT_LETTERS];
    const now = new Date().toISOString();
    let saved: StudentLetter;

    if (letter.id) {
      const idx = list.findIndex(l => l.id === letter.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...letter, updated_at: now } as StudentLetter;
        saved = list[idx];
      } else {
        saved = { ...letter, id: letter.id, created_at: now, updated_at: now } as StudentLetter;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        student_id: letter.student_id || '',
        template_id: letter.template_id || '',
        jenis_surat: letter.jenis_surat || 'Surat Keterangan Santri',
        nomor_surat: letter.nomor_surat || this.generateNextLetterNumber(letter.jenis_surat || 'SK'),
        tanggal_surat: letter.tanggal_surat || new Date().toISOString().slice(0, 10),
        judul: letter.judul || 'SURAT KETERANGAN SANTRI',
        perihal: letter.perihal || 'Permohonan Surat Keterangan Santri',
        penandatangan: letter.penandatangan || 'KH. Muhammad Syamsul Arifin, S.Ag.',
        penandatangan_jabatan: letter.penandatangan_jabatan || 'Pengasuh Pondok Pesantren Nurus Sholah',
        custom_fields: letter.custom_fields || {},
        status: letter.status || 'Diterbitkan',
        file_url: letter.file_url || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, student_letters: list });
    return saved;
  }

  public deleteStudentLetter(id: string): void {
    const db = this.getRawData();
    const list = (db.student_letters || [...DEFAULT_STUDENT_LETTERS]).filter(l => l.id !== id);
    this.saveToStorage({ ...db, student_letters: list });
  }

  // --- 5. Automatic Letter Numbering ---
  public getLetterNumberConfig(): LetterNumberConfig {
    const db = this.getRawData();
    const configs = db.letter_number_configs || [DEFAULT_LETTER_NUMBER_CONFIG];
    return configs[0] || DEFAULT_LETTER_NUMBER_CONFIG;
  }

  public saveLetterNumberConfig(cfg: Partial<LetterNumberConfig>): LetterNumberConfig {
    const db = this.getRawData();
    const current = this.getLetterNumberConfig();
    const updated = { ...current, ...cfg, updated_at: new Date().toISOString() };
    this.saveToStorage({ ...db, letter_number_configs: [updated] });
    return updated;
  }

  public generateNextLetterNumber(kodeJenis: string = 'PPNS'): string {
    const db = this.getRawData();
    const cfg = this.getLetterNumberConfig();
    const nextCounter = cfg.current_counter + 1;

    // Pad counter e.g. 001, 002
    const numStr = String(nextCounter).padStart(cfg.pad_length, '0');
    
    // Roman month
    const now = new Date();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const monthRoman = romanMonths[now.getMonth()];
    const yearStr = String(now.getFullYear());

    // Update config counter
    cfg.current_counter = nextCounter;
    this.saveLetterNumberConfig(cfg);

    // Replace template format e.g. {NOMOR}/{KODE}/{BULAN_ROMAWI}/{TAHUN}
    let res = cfg.format_template || '{NOMOR}/{KODE}/{BULAN_ROMAWI}/{TAHUN}';
    res = res.replace('{NOMOR}', numStr);
    res = res.replace('{KODE}', cfg.kode_pondok || 'PPNS');
    res = res.replace('{BULAN_ROMAWI}', monthRoman);
    res = res.replace('{TAHUN}', yearStr);
    res = res.replace('{JENIS}', kodeJenis.toUpperCase());

    return res;
  }

  // --- 6. Dokumen Santri ---
  public getStudentDocuments(filter?: { studentId?: string; jenis?: string; status?: string; search?: string }): StudentDocument[] {
    const db = this.getRawData();
    let list = db.student_documents || [...DEFAULT_STUDENT_DOCUMENTS];

    if (filter?.studentId) {
      list = list.filter(d => d.student_id === filter.studentId);
    }
    if (filter?.jenis && filter.jenis !== 'all') {
      list = list.filter(d => d.jenis_dokumen === filter.jenis);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(d => d.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const students = this.getStudents();
      list = list.filter(d => {
        const s = students.find(st => st.id === d.student_id);
        const sName = s ? s.nama_lengkap.toLowerCase() : '';
        const sNis = s ? s.nis.toLowerCase() : '';
        return (
          (d.nama_dokumen || d.nama || '').toLowerCase().includes(q) ||
          (d.nomor_dokumen || '').toLowerCase().includes(q) ||
          sName.includes(q) ||
          sNis.includes(q)
        );
      });
    }

    return list;
  }

  public getStudentDocumentSummary(studentId: string) {
    const list = this.getStudentDocuments({ studentId });
    const lengkapCount = list.filter(d => d.status === 'Lengkap').length;
    const missingTypes = ['KK', 'Akta Kelahiran', 'Ijazah', 'KTP/NIK', 'Pasfoto'].filter(
      t => !list.some(d => d.jenis_dokumen === t && d.status === 'Lengkap')
    );

    const isLengkap = missingTypes.length === 0;

    return {
      total: list.length,
      lengkapCount,
      missingTypes,
      isLengkap,
      documents: list
    };
  }

  public saveStudentDocument(doc: Partial<StudentDocument>): StudentDocument {
    const db = this.getRawData();
    const list = db.student_documents || [...DEFAULT_STUDENT_DOCUMENTS];
    const now = new Date().toISOString();
    let saved: StudentDocument;

    if (doc.id) {
      const idx = list.findIndex(d => d.id === doc.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...doc, updated_at: now } as StudentDocument;
        saved = list[idx];
      } else {
        saved = { ...doc, id: doc.id, created_at: now, updated_at: now } as StudentDocument;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        student_id: doc.student_id || '',
        nama: doc.nama || doc.nama_dokumen || 'Dokumen Santri',
        nama_dokumen: doc.nama_dokumen || doc.nama || 'Dokumen Santri',
        tipe: doc.tipe || doc.jenis_dokumen || 'KK',
        jenis_dokumen: doc.jenis_dokumen || doc.tipe || 'KK',
        nomor_dokumen: doc.nomor_dokumen || '',
        file_url: doc.file_url || '',
        file_name: doc.file_name || '',
        tanggal_upload: doc.tanggal_upload || new Date().toISOString().slice(0, 10),
        tanggal_terbit: doc.tanggal_terbit || '',
        tanggal_kedaluwarsa: doc.tanggal_kedaluwarsa || '',
        status: doc.status || 'Lengkap',
        catatan: doc.catatan || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, student_documents: list });
    return saved;
  }

  public deleteStudentDocument(id: string): void {
    const db = this.getRawData();
    const list = (db.student_documents || [...DEFAULT_STUDENT_DOCUMENTS]).filter(d => d.id !== id);
    this.saveToStorage({ ...db, student_documents: list });
  }

  // --- 7. Arsip Dokumen Pondok ---
  public getDocumentArchives(filter?: { kategori?: string; status?: string; search?: string }): DocumentArchive[] {
    const db = this.getRawData();
    let list = db.document_archives || [...DEFAULT_DOCUMENT_ARCHIVES];

    if (filter?.kategori && filter.kategori !== 'all') {
      list = list.filter(a => a.kategori === filter.kategori);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(a => a.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(a => 
        a.judul.toLowerCase().includes(q) ||
        (a.nomor_dokumen || '').toLowerCase().includes(q) ||
        (a.deskripsi || '').toLowerCase().includes(q) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(b.tanggal_dokumen).getTime() - new Date(a.tanggal_dokumen).getTime());
  }

  public saveDocumentArchive(arc: Partial<DocumentArchive>): DocumentArchive {
    const db = this.getRawData();
    const list = db.document_archives || [...DEFAULT_DOCUMENT_ARCHIVES];
    const now = new Date().toISOString();
    let saved: DocumentArchive;

    if (arc.id) {
      const idx = list.findIndex(a => a.id === arc.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...arc, updated_at: now } as DocumentArchive;
        saved = list[idx];
      } else {
        saved = { ...arc, id: arc.id, created_at: now, updated_at: now } as DocumentArchive;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        judul: arc.judul || '',
        nomor_dokumen: arc.nomor_dokumen || '',
        kategori: arc.kategori || 'Legalitas Pondok',
        tanggal_dokumen: arc.tanggal_dokumen || new Date().toISOString().slice(0, 10),
        pengarsip: arc.pengarsip || 'Sekretariat Pesantren',
        file_url: arc.file_url || '',
        file_name: arc.file_name || '',
        tags: arc.tags || ['Arsip'],
        status: arc.status || 'Aktif',
        deskripsi: arc.deskripsi || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, document_archives: list });
    return saved;
  }

  public deleteDocumentArchive(id: string): void {
    const db = this.getRawData();
    const list = (db.document_archives || [...DEFAULT_DOCUMENT_ARCHIVES]).filter(a => a.id !== id);
    this.saveToStorage({ ...db, document_archives: list });
  }

  // --- 8. Administration Dashboard Stats ---
  public getAdministrationStats() {
    const incoming = this.getIncomingLetters();
    const outgoing = this.getOutgoingLetters();
    const studentLetters = this.getStudentLetters();
    const studentDocs = this.getStudentDocuments();
    const archives = this.getDocumentArchives();
    const activeStudents = this.getStudents().filter(s => s.status === 'aktif');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const incomingThisMonth = incoming.filter(l => {
      const d = new Date(l.tanggal_diterima || l.tanggal_surat);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const outgoingThisMonth = outgoing.filter(l => {
      const d = new Date(l.tanggal_surat);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lettersUnfinished = incoming.filter(l => l.status === 'Baru' || l.status === 'Diproses').length;
    const lettersNeedSign = outgoing.filter(l => l.status === 'Draft' || l.status === 'Diperiksa' || l.status === 'Disetujui').length;

    // Student document completion
    let completeStudents = 0;
    let incompleteStudents = 0;
    activeStudents.forEach(st => {
      const summary = this.getStudentDocumentSummary(st.id);
      if (summary.isLengkap) {
        completeStudents++;
      } else {
        incompleteStudents++;
      }
    });

    const expiringDocs = studentDocs.filter(d => {
      if (!d.tanggal_kedaluwarsa) return false;
      const exp = new Date(d.tanggal_kedaluwarsa).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      return exp - now.getTime() < thirtyDays;
    }).length;

    return {
      incomingThisMonth,
      outgoingThisMonth,
      totalStudentLetters: studentLetters.length,
      lettersUnfinished,
      lettersNeedSign,
      completeStudents,
      incompleteStudents,
      expiringDocs,
      totalArchives: archives.length,
      incomingCount: incoming.length,
      outgoingCount: outgoing.length
    };
  }

  // --- 9. Audit & Notification Helper Methods ---
  private logAudit(aksi: string, modul: string, deskripsi: string) {
    const db = this.getRawData();
    const logs = db.audit_logs || [];
    let act: AuditLog['aktivitas'] = 'Edit data';
    if (aksi.includes('CREATE') || aksi.includes('TAMBAH')) act = 'Tambah data';
    else if (aksi.includes('DELETE') || aksi.includes('HAPUS')) act = 'Hapus/arsip data';
    else if (aksi.includes('APPROVE') || aksi.includes('STATUS')) act = 'Perubahan status';

    logs.unshift({
      id: generateUUID(),
      user_id: 'system',
      user_name: 'Sistem Pesantren',
      user_role: 'Pengurus',
      aktivitas: act,
      modul,
      data_terkait: `[${aksi}] ${deskripsi}`,
      ip_device: '127.0.0.1 (Local System)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      created_at: new Date().toISOString()
    });
    this.saveToStorage({ ...db, audit_logs: logs });
  }

  private addNotification(notif: { title: string; message: string; type: 'info' | 'warning' | 'request' | 'deadline'; view_id?: string }) {
    const db = this.getRawData();
    const notifs = db.operational_notifications || [];
    notifs.unshift({
      id: generateUUID(),
      title: notif.title,
      message: notif.message,
      type: notif.type,
      view_id: notif.view_id,
      is_read: false,
      created_at: new Date().toISOString()
    });
    this.saveToStorage({ ...db, operational_notifications: notifs });
  }

  public savePondokActivity(activity: Partial<PondokActivity>): PondokActivity {
    const db = this.getRawData();
    const list = db.pondok_activities || [...DEFAULT_PONDOK_ACTIVITIES];
    const now = new Date().toISOString();
    let saved: PondokActivity;

    if (activity.id) {
      const idx = list.findIndex(a => a.id === activity.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...activity, updated_at: now };
        saved = list[idx];
      } else {
        saved = { ...activity, id: activity.id, created_at: now, updated_at: now } as PondokActivity;
        list.push(saved);
      }
    } else {
      saved = {
        id: generateUUID(),
        nama_kegiatan: activity.nama_kegiatan || 'Kegiatan Pesantren',
        kode: activity.kode || `ACT-${Date.now().toString().slice(-4)}`,
        kategori: activity.kategori || 'Pendidikan',
        tanggal_mulai: activity.tanggal_mulai || new Date().toISOString().split('T')[0],
        tanggal_selesai: activity.tanggal_selesai || new Date().toISOString().split('T')[0],
        lokasi: activity.lokasi || 'PP Nurus Sholah',
        penanggung_jawab: activity.penanggung_jawab || 'Panitia',
        peserta_count: activity.peserta_count || 0,
        total_anggaran: activity.total_anggaran || 0,
        total_realisasi: activity.total_realisasi || 0,
        status: activity.status || 'Disetujui',
        deskripsi: activity.deskripsi || '',
        catatan: activity.catatan || '',
        created_at: now,
        updated_at: now
      };
      list.unshift(saved);
    }

    this.saveToStorage({ ...db, pondok_activities: list });
    return saved;
  }

  public saveExpenseRequest(req: Partial<ExpenseRequest> & Record<string, any>): ExpenseRequest {
    const db = this.getRawData();
    const list = db.expense_requests || [];
    const now = new Date().toISOString();
    let saved: ExpenseRequest;

    if (req.id) {
      const idx = list.findIndex(r => r.id === req.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...req, updated_at: now } as ExpenseRequest;
        saved = list[idx];
      } else {
        saved = { ...req, id: req.id, created_at: now, updated_at: now } as ExpenseRequest;
        list.push(saved);
      }
    } else {
      const rawStatus = (req.status as string) || 'DIAJUKAN';
      const validStatus: ExpenseRequest['status'] = (rawStatus === 'MENUNGGU' ? 'DIAJUKAN' : rawStatus) as ExpenseRequest['status'];
      saved = {
        id: generateUUID(),
        nomor_pengajuan: `REQ-${new Date().getFullYear()}-${String(list.length + 1).padStart(5, '0')}`,
        tanggal: req.tanggal || new Date().toISOString().split('T')[0],
        kategori_id: req.kategori_id || 'fcat-exp-administrasi',
        nominal: req.nominal || 0,
        tujuan: req.tujuan || req.keperluan || 'Operasional Pondok',
        alasan: req.alasan || req.keperluan || 'Kebutuhan kegiatan & administrasi',
        pengaju: req.pengaju || req.pemohon_nama || 'Pengurus',
        prioritas: req.prioritas || 'Sedang',
        status: validStatus,
        catatan: req.catatan || '',
        created_at: now,
        updated_at: now
      };
      list.unshift(saved);
    }

    this.saveToStorage({ ...db, expense_requests: list });
    return saved;
  }

  // --- Financial Categories Management (Admin Editable) ---
  public getFinancialCategories(): FinancialCategory[] {
    const db = this.getRawData();
    return db.financial_categories || [...DEFAULT_FINANCIAL_CATEGORIES];
  }

  public saveFinancialCategory(cat: Partial<FinancialCategory>): FinancialCategory {
    const db = this.getRawData();
    const list = db.financial_categories || [...DEFAULT_FINANCIAL_CATEGORIES];
    const now = new Date().toISOString();
    let saved: FinancialCategory;

    if (cat.id) {
      const idx = list.findIndex(c => c.id === cat.id);
      if (idx !== -1) {
        saved = { ...list[idx], ...cat, updated_at: now };
        list[idx] = saved;
      } else {
        saved = { ...cat, id: cat.id, created_at: now, updated_at: now } as FinancialCategory;
        list.push(saved);
      }
    } else {
      saved = {
        id: `fcat-${Date.now()}`,
        nama: cat.nama || 'Kategori Baru',
        jenis: cat.jenis || 'PEMASUKAN',
        urutan: cat.urutan || (list.length + 1),
        status: cat.status || 'aktif',
        deskripsi: cat.deskripsi || '',
        created_at: now,
        updated_at: now
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, financial_categories: list });
    return saved;
  }

  public deleteFinancialCategory(id: string): void {
    const db = this.getRawData();
    const list = (db.financial_categories || [...DEFAULT_FINANCIAL_CATEGORIES]).filter(c => c.id !== id);
    this.saveToStorage({ ...db, financial_categories: list });
  }

  // --- 10. Rapat Bulanan, Decision, Followup, Result & Report Services ---
  public getPondokMeetings(): PondokMeeting[] {
    const db = this.getRawData();
    return db.pondok_meetings || [...DEFAULT_PONDOK_MEETINGS];
  }

  public getPondokMeetingById(id: string): PondokMeeting | undefined {
    return this.getPondokMeetings().find(m => m.id === id);
  }

  public getNextMeetingNumber(): string {
    const meetings = this.getPondokMeetings();
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const nextIdx = (meetings.length + 1).toString().padStart(3, '0');
    return `RPT/NS/${month}/${year}/${nextIdx}`;
  }

  public getNextDecisionNumber(): string {
    const decisions = this.getMeetingDecisions();
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const nextIdx = (decisions.length + 1).toString().padStart(3, '0');
    return `KEP/NS/${month}/${year}/${nextIdx}`;
  }

  public getNextReportNumber(): string {
    const reports = this.getMeetingReports();
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const nextIdx = (reports.length + 1).toString().padStart(3, '0');
    return `LAP/NS/${month}/${year}/${nextIdx}`;
  }

  public savePondokMeeting(meetingData: Partial<PondokMeeting>): PondokMeeting {
    const db = this.getRawData();
    const list = db.pondok_meetings || [...DEFAULT_PONDOK_MEETINGS];
    const nowStr = new Date().toISOString();

    let savedItem: PondokMeeting;
    const existingIndex = list.findIndex(m => m.id === meetingData.id);

    if (existingIndex >= 0) {
      savedItem = {
        ...list[existingIndex],
        ...meetingData,
        updated_at: nowStr
      };
      list[existingIndex] = savedItem;
      this.logAudit('MEETING_UPDATE', 'Ubah Rapat', `Mengubah data rapat: ${savedItem.judul_rapat}`);
    } else {
      const d = meetingData.tanggal ? new Date(meetingData.tanggal) : new Date();
      const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

      savedItem = {
        id: meetingData.id || `mtg-${Date.now()}`,
        nomor_rapat: meetingData.nomor_rapat || this.getNextMeetingNumber(),
        judul_rapat: meetingData.judul_rapat || 'Rapat Tanpa Judul',
        bulan: meetingData.bulan || monthNames[d.getMonth()],
        tahun: meetingData.tahun || d.getFullYear(),
        tanggal: meetingData.tanggal || new Date().toISOString().split('T')[0],
        hari: meetingData.hari || dayNames[d.getDay()],
        waktu_mulai: meetingData.waktu_mulai || '19:30',
        waktu_selesai: meetingData.waktu_selesai || '21:00',
        tempat: meetingData.tempat || 'Aula Pesantren',
        jenis_rapat: meetingData.jenis_rapat || 'Rapat Bulanan',
        pimpinan_rapat: meetingData.pimpinan_rapat || 'Pimpinan Pesantren',
        pimpinan_user_id: meetingData.pimpinan_user_id,
        sekretaris_rapat: meetingData.sekretaris_rapat || 'Sekretaris Rapat',
        sekretaris_user_id: meetingData.sekretaris_user_id,
        agenda_utama: meetingData.agenda_utama || '',
        tujuan: meetingData.tujuan || '',
        peserta_ringkasan: meetingData.peserta_ringkasan || '',
        catatan: meetingData.catatan || '',
        status: meetingData.status || 'TERJADWAL',
        postponed_reason: meetingData.postponed_reason,
        postponed_new_date: meetingData.postponed_new_date,
        postponed_new_time: meetingData.postponed_new_time,
        postponed_notes: meetingData.postponed_notes,
        is_archived: meetingData.is_archived || false,
        locked_notulen: meetingData.locked_notulen || false,
        is_recurring: meetingData.is_recurring || false,
        recurrence_pattern: meetingData.recurrence_pattern,
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(savedItem);
      this.logAudit('MEETING_CREATE', 'Buat Rapat', `Membuat jadwal rapat baru: ${savedItem.judul_rapat}`);
    }

    this.saveToStorage({ ...db, pondok_meetings: list });
    return savedItem;
  }

  public deletePondokMeeting(id: string): void {
    const db = this.getRawData();
    const meeting = this.getPondokMeetingById(id);
    const list = (db.pondok_meetings || [...DEFAULT_PONDOK_MEETINGS]).filter(m => m.id !== id);
    this.saveToStorage({ ...db, pondok_meetings: list });
    if (meeting) {
      this.logAudit('MEETING_DELETE', 'Hapus Rapat', `Menghapus jadwal rapat: ${meeting.judul_rapat}`);
    }
  }

  // Participants
  public getMeetingParticipants(meetingId?: string): MeetingParticipant[] {
    const db = this.getRawData();
    const list = db.meeting_participants || [];
    if (meetingId) {
      return list.filter(p => p.meeting_id === meetingId);
    }
    return list;
  }

  public saveMeetingParticipant(participant: Partial<MeetingParticipant>): MeetingParticipant {
    const db = this.getRawData();
    const list = db.meeting_participants || [];
    const nowStr = new Date().toISOString();

    let saved: MeetingParticipant;
    const existingIdx = list.findIndex(p => p.id === participant.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...participant };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: participant.id || `part-${Date.now()}`,
        meeting_id: participant.meeting_id || '',
        user_id: participant.user_id,
        teacher_id: participant.teacher_id,
        student_id: participant.student_id,
        nama: participant.nama || 'Peserta',
        jabatan: participant.jabatan || 'Anggota Rapat',
        kehadiran: participant.kehadiran || 'Hadir',
        catatan: participant.catatan || '',
        created_at: nowStr
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, meeting_participants: list });
    return saved;
  }

  public deleteMeetingParticipant(id: string): void {
    const db = this.getRawData();
    const list = (db.meeting_participants || []).filter(p => p.id !== id);
    this.saveToStorage({ ...db, meeting_participants: list });
  }

  // Agendas
  public getMeetingAgendas(meetingId?: string): MeetingAgenda[] {
    const db = this.getRawData();
    const list = db.meeting_agendas || [];
    if (meetingId) {
      return list.filter(a => a.meeting_id === meetingId).sort((a, b) => a.urutan - b.urutan);
    }
    return list;
  }

  public saveMeetingAgenda(agenda: Partial<MeetingAgenda>): MeetingAgenda {
    const db = this.getRawData();
    const list = db.meeting_agendas || [];
    const nowStr = new Date().toISOString();

    let saved: MeetingAgenda;
    const existingIdx = list.findIndex(a => a.id === agenda.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...agenda };
      list[existingIdx] = saved;
    } else {
      const meetingAgendas = list.filter(a => a.meeting_id === agenda.meeting_id);
      saved = {
        id: agenda.id || `agd-${Date.now()}`,
        meeting_id: agenda.meeting_id || '',
        urutan: agenda.urutan || (meetingAgendas.length + 1),
        judul: agenda.judul || 'Agenda Rapat',
        kategori: agenda.kategori || 'Umum',
        masalah_latar_belakang: agenda.masalah_latar_belakang || '',
        bahan_pembahasan: agenda.bahan_pembahasan || '',
        prioritas: agenda.prioritas || 'Sedang',
        pengusul: agenda.pengusul || '',
        pic: agenda.pic || '',
        pic_user_id: agenda.pic_user_id,
        status: agenda.status || 'Draf',
        masalah: agenda.masalah || '',
        pembahasan: agenda.pembahasan || '',
        masukan: agenda.masukan || '',
        kesimpulan: agenda.kesimpulan || '',
        keputusan: agenda.keputusan || '',
        hasil_pembahasan: agenda.hasil_pembahasan || '',
        penanggung_jawab: agenda.penanggung_jawab || '',
        deadline: agenda.deadline || '',
        created_at: nowStr
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, meeting_agendas: list });
    return saved;
  }

  public deleteMeetingAgenda(id: string): void {
    const db = this.getRawData();
    const list = (db.meeting_agendas || []).filter(a => a.id !== id);
    this.saveToStorage({ ...db, meeting_agendas: list });
  }

  // Minutes
  public getMeetingMinutes(meetingId?: string): MeetingMinute[] {
    const db = this.getRawData();
    const list = db.meeting_minutes || [];
    if (meetingId) {
      return list.filter(m => m.meeting_id === meetingId);
    }
    return list;
  }

  public saveMeetingMinute(minute: Partial<MeetingMinute>): MeetingMinute {
    const db = this.getRawData();
    const list = db.meeting_minutes || [];
    const nowStr = new Date().toISOString();

    let saved: MeetingMinute;
    const existingIdx = list.findIndex(m => m.id === minute.id || m.meeting_id === minute.meeting_id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...minute, updated_at: nowStr };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: minute.id || `min-${Date.now()}`,
        meeting_id: minute.meeting_id || '',
        pembukaan: minute.pembukaan || '',
        pembahasan_lengkap: minute.pembahasan_lengkap || '',
        penutup: minute.penutup || '',
        file_notulen_url: minute.file_notulen_url,
        locked: minute.locked || false,
        created_at: nowStr,
        updated_at: nowStr
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, meeting_minutes: list });
    this.logAudit('MEETING_MINUTES_UPDATE', 'Notulen Rapat', `Menyimpan notulen rapat ID: ${saved.meeting_id}`);
    return saved;
  }

  // Decisions
  public getMeetingDecisions(meetingId?: string): MeetingDecision[] {
    const db = this.getRawData();
    const list = db.meeting_decisions || [...DEFAULT_MEETING_DECISIONS];
    if (meetingId) {
      return list.filter(d => d.meeting_id === meetingId);
    }
    return list;
  }

  public saveMeetingDecision(decision: Partial<MeetingDecision>): MeetingDecision {
    const db = this.getRawData();
    const list = db.meeting_decisions || [...DEFAULT_MEETING_DECISIONS];
    const nowStr = new Date().toISOString();

    let saved: MeetingDecision;
    const existingIdx = list.findIndex(d => d.id === decision.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...decision, updated_at: nowStr };
      list[existingIdx] = saved;
      this.logAudit('MEETING_DECISION_UPDATE', 'Ubah Keputusan', `Memperbarui keputusan: ${saved.nomor_keputusan}`);
    } else {
      saved = {
        id: decision.id || `dec-${Date.now()}`,
        meeting_id: decision.meeting_id || '',
        nomor_keputusan: decision.nomor_keputusan || this.getNextDecisionNumber(),
        isi_keputusan: decision.isi_keputusan || 'Keputusan Rapat',
        kategori: decision.kategori || 'Umum',
        penanggung_jawab: decision.penanggung_jawab || 'PIC Rapat',
        pic_user_id: decision.pic_user_id,
        deadline: decision.deadline || new Date().toISOString().split('T')[0],
        prioritas: decision.prioritas || 'Sedang',
        status: decision.status || 'Belum Dilaksanakan',
        catatan: decision.catatan || '',
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(saved);
      this.logAudit('MEETING_DECISION_CREATE', 'Buat Keputusan', `Membuat keputusan rapat baru: ${saved.nomor_keputusan}`);

      // Auto-create notification if PIC is assigned
      if (saved.penanggung_jawab) {
        this.addNotification({
          title: 'Tindak Lanjut / Tugas Rapat Baru',
          message: `Anda ditetapkan sebagai PIC untuk Keputusan Rapat ${saved.nomor_keputusan}: "${saved.isi_keputusan.substring(0, 60)}..."`,
          type: 'info',
          view_id: 'meet_tindak_lanjut'
        });
      }
    }

    this.saveToStorage({ ...db, meeting_decisions: list });
    return saved;
  }

  public deleteMeetingDecision(id: string): void {
    const db = this.getRawData();
    const list = (db.meeting_decisions || [...DEFAULT_MEETING_DECISIONS]).filter(d => d.id !== id);
    this.saveToStorage({ ...db, meeting_decisions: list });
  }

  // Followups
  public getMeetingFollowups(meetingId?: string): MeetingFollowup[] {
    const db = this.getRawData();
    const list = db.meeting_followups || [...DEFAULT_MEETING_FOLLOWUPS];
    if (meetingId) {
      return list.filter(f => f.meeting_id === meetingId);
    }
    return list;
  }

  public saveMeetingFollowup(followup: Partial<MeetingFollowup>): MeetingFollowup {
    const db = this.getRawData();
    const list = db.meeting_followups || [...DEFAULT_MEETING_FOLLOWUPS];
    const nowStr = new Date().toISOString();

    let saved: MeetingFollowup;
    const existingIdx = list.findIndex(f => f.id === followup.id);

    if (existingIdx >= 0) {
      const prevProgress = list[existingIdx].progress_percent;
      let newStatus = followup.status || list[existingIdx].status;
      let completedAt = list[existingIdx].completed_at;

      if (followup.progress_percent !== undefined) {
        if (followup.progress_percent === 100) {
          newStatus = 'Selesai';
          completedAt = nowStr;
        } else if (followup.progress_percent > 0 && newStatus === 'Belum Dimulai') {
          newStatus = 'Berjalan';
        }
      }

      saved = {
        ...list[existingIdx],
        ...followup,
        status: newStatus,
        completed_at: completedAt,
        updated_at: nowStr
      };
      list[existingIdx] = saved;
      this.logAudit('MEETING_FOLLOWUP_UPDATE', 'Update Progress Tindak Lanjut', `Progress tindak lanjut ${saved.judul}: ${prevProgress}% -> ${saved.progress_percent}% (${saved.status})`);
    } else {
      const progress = followup.progress_percent || 0;
      const initialStatus = progress === 100 ? 'Selesai' : (progress > 0 ? 'Berjalan' : (followup.status || 'Belum Dimulai'));

      saved = {
        id: followup.id || `flw-${Date.now()}`,
        meeting_id: followup.meeting_id || '',
        decision_id: followup.decision_id,
        judul: followup.judul || 'Tindak Lanjut Rapat',
        sumber_rapat: followup.sumber_rapat || 'Rapat Bulanan',
        keputusan: followup.keputusan || '',
        pic: followup.pic || 'PIC Tugas',
        pic_user_id: followup.pic_user_id,
        unit_bagian: followup.unit_bagian || 'Pengurus',
        tanggal_mulai: followup.tanggal_mulai || new Date().toISOString().split('T')[0],
        deadline: followup.deadline || new Date().toISOString().split('T')[0],
        prioritas: followup.prioritas || 'Sedang',
        status: initialStatus,
        progress_percent: progress,
        hasil: followup.hasil || '',
        kendala: followup.kendala || '',
        catatan: followup.catatan || '',
        completed_at: progress === 100 ? nowStr : undefined,
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(saved);
      this.logAudit('MEETING_FOLLOWUP_CREATE', 'Buat Tindak Lanjut', `Membuat tindak lanjut baru: ${saved.judul}`);
    }

    this.saveToStorage({ ...db, meeting_followups: list });
    return saved;
  }

  public deleteMeetingFollowup(id: string): void {
    const db = this.getRawData();
    const list = (db.meeting_followups || [...DEFAULT_MEETING_FOLLOWUPS]).filter(f => f.id !== id);
    this.saveToStorage({ ...db, meeting_followups: list });
  }

  // Results
  public getMeetingResults(): MeetingResult[] {
    const db = this.getRawData();
    return db.meeting_results || [...DEFAULT_MEETING_RESULTS];
  }

  public getMeetingResultByMeetingId(meetingId: string): MeetingResult | undefined {
    return this.getMeetingResults().find(r => r.meeting_id === meetingId);
  }

  public saveMeetingResult(result: Partial<MeetingResult>): MeetingResult {
    const db = this.getRawData();
    const list = db.meeting_results || [...DEFAULT_MEETING_RESULTS];
    const nowStr = new Date().toISOString();

    let saved: MeetingResult;
    const existingIdx = list.findIndex(r => r.id === result.id || r.meeting_id === result.meeting_id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...result, updated_at: nowStr };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: result.id || `res-${Date.now()}`,
        meeting_id: result.meeting_id || '',
        ringkasan: result.ringkasan || '',
        hasil_pembahasan: result.hasil_pembahasan || '',
        keputusan: result.keputusan || '',
        rekomendasi: result.rekomendasi || '',
        catatan: result.catatan || '',
        dibuat_oleh: result.dibuat_oleh || 'Sekretaris Rapat',
        tanggal: result.tanggal || new Date().toISOString().split('T')[0],
        status: result.status || 'DRAFT',
        catatan_revisi: result.catatan_revisi,
        approved_by: result.approved_by,
        approved_at: result.approved_at,
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(saved);
    }

    this.saveToStorage({ ...db, meeting_results: list });
    this.logAudit('MEETING_RESULT_SAVE', 'Hasil Rapat', `Menyimpan hasil rapat ID: ${saved.meeting_id} status (${saved.status})`);
    return saved;
  }

  // Reports
  public getMeetingReports(): MeetingReport[] {
    const db = this.getRawData();
    return db.meeting_reports || [...DEFAULT_MEETING_REPORTS];
  }

  public getMeetingReportByMeetingId(meetingId: string): MeetingReport | undefined {
    return this.getMeetingReports().find(r => r.meeting_id === meetingId);
  }

  public saveMeetingReport(report: Partial<MeetingReport>): MeetingReport {
    const db = this.getRawData();
    const list = db.meeting_reports || [...DEFAULT_MEETING_REPORTS];
    const nowStr = new Date().toISOString();

    let saved: MeetingReport;
    const existingIdx = list.findIndex(r => r.id === report.id || r.meeting_id === report.meeting_id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...report, updated_at: nowStr };
      list[existingIdx] = saved;
      this.logAudit('MEETING_REPORT_UPDATE', 'Ubah Laporan Rapat', `Memperbarui draf laporan rapat: ${saved.nomor_laporan}`);
    } else {
      saved = {
        id: report.id || `rep-${Date.now()}`,
        meeting_id: report.meeting_id || '',
        nomor_laporan: report.nomor_laporan || this.getNextReportNumber(),
        judul_laporan: report.judul_laporan || 'Laporan Hasil Rapat',
        tanggal_laporan: report.tanggal_laporan || new Date().toISOString().split('T')[0],
        tujuan_rapat: report.tujuan_rapat || '',
        peserta_ringkasan: report.peserta_ringkasan || '',
        agenda_ringkasan: report.agenda_ringkasan || '',
        pembahasan_ringkasan: report.pembahasan_ringkasan || '',
        hasil_rapat: report.hasil_rapat || '',
        keputusan_ringkasan: report.keputusan_ringkasan || '',
        tindak_lanjut_ringkasan: report.tindak_lanjut_ringkasan || '',
        penanggung_jawab_ringkasan: report.penanggung_jawab_ringkasan || '',
        batas_waktu_ringkasan: report.batas_waktu_ringkasan || '',
        kesimpulan: report.kesimpulan || '',
        dokumentasi_notes: report.dokumentasi_notes,
        pimpinan_nama: report.pimpinan_nama || 'KH. Muhammad Syamsul Arifin, S.Ag.',
        pimpinan_jabatan: report.pimpinan_jabatan || 'Pengasuh Pesantren',
        sekretaris_nama: report.sekretaris_nama || 'Ust. Abdullah Sajjad',
        sekretaris_jabatan: report.sekretaris_jabatan || 'Sekretaris Rapat',
        pengasuh_nama: report.pengasuh_nama || 'KH. Muhammad Syamsul Arifin, S.Ag.',
        pengasuh_jabatan: report.pengasuh_jabatan || 'Pengasuh Utama',
        status: report.status || 'DRAFT',
        catatan_revisi: report.catatan_revisi,
        locked: report.locked || false,
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(saved);
      this.logAudit('MEETING_REPORT_CREATE', 'Buat Laporan Rapat', `Membuat draf laporan hasil rapat: ${saved.nomor_laporan}`);
    }

    this.saveToStorage({ ...db, meeting_reports: list });
    return saved;
  }

  public approveMeetingReport(reportId: string, approverName: string): MeetingReport {
    const report = this.getMeetingReports().find(r => r.id === reportId);
    if (!report) throw new Error('Laporan rapat tidak ditemukan');

    const updated = this.saveMeetingReport({
      ...report,
      id: reportId,
      status: 'DISETUJUI',
      approved_by: approverName,
      approved_at: new Date().toISOString(),
      locked: true
    });

    this.logAudit('MEETING_REPORT_APPROVE', 'Setujui Laporan Rapat', `Laporan ${report.nomor_laporan} disetujui & dikunci oleh ${approverName}`);
    return updated;
  }

  // Monthly Evaluation & Plans
  public getMeetingMonthlyEvaluations(): MeetingMonthlyEvaluation[] {
    const db = this.getRawData();
    return db.meeting_monthly_evaluations || [...DEFAULT_MEETING_EVALUATIONS];
  }

  public saveMeetingMonthlyEvaluation(evalData: Partial<MeetingMonthlyEvaluation>): MeetingMonthlyEvaluation {
    const db = this.getRawData();
    const list = db.meeting_monthly_evaluations || [...DEFAULT_MEETING_EVALUATIONS];
    const nowStr = new Date().toISOString();

    let saved: MeetingMonthlyEvaluation;
    const existingIdx = list.findIndex(e => e.id === evalData.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...evalData, updated_at: nowStr };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: evalData.id || `eval-${Date.now()}`,
        bulan: evalData.bulan || 'Oktober',
        tahun: evalData.tahun || new Date().getFullYear(),
        kategori: evalData.kategori || 'Pendidikan',
        pencapaian: evalData.pencapaian || '',
        masalah: evalData.masalah || '',
        kendala: evalData.kendala || '',
        solusi: evalData.solusi || '',
        rekomendasi: evalData.rekomendasi || '',
        target_bulan_berikutnya: evalData.target_bulan_berikutnya || '',
        created_at: nowStr,
        updated_at: nowStr
      };
      list.unshift(saved);
    }

    this.saveToStorage({ ...db, meeting_monthly_evaluations: list });
    return saved;
  }

  public getMeetingMonthlyPlans(): MeetingMonthlyPlan[] {
    const db = this.getRawData();
    return db.meeting_monthly_plans || [...DEFAULT_MEETING_PLANS];
  }

  public saveMeetingMonthlyPlan(planData: Partial<MeetingMonthlyPlan>): MeetingMonthlyPlan {
    const db = this.getRawData();
    const list = db.meeting_monthly_plans || [...DEFAULT_MEETING_PLANS];
    const nowStr = new Date().toISOString();

    let saved: MeetingMonthlyPlan;
    const existingIdx = list.findIndex(p => p.id === planData.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...planData };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: planData.id || `plan-${Date.now()}`,
        bulan: planData.bulan || 'November',
        tahun: planData.tahun || new Date().getFullYear(),
        rencana: planData.rencana || '',
        pic: planData.pic || 'PIC',
        target_tanggal: planData.target_tanggal || new Date().toISOString().split('T')[0],
        prioritas: planData.prioritas || 'Sedang',
        indikator_keberhasilan: planData.indikator_keberhasilan || '',
        status: planData.status || 'Rencana',
        created_at: nowStr
      };
      list.unshift(saved);
    }

    this.saveToStorage({ ...db, meeting_monthly_plans: list });
    return saved;
  }

  // Templates
  public getMeetingTemplates(): MeetingTemplate[] {
    const db = this.getRawData();
    return db.meeting_templates || [...DEFAULT_MEETING_TEMPLATES];
  }

  public saveMeetingTemplate(tpl: Partial<MeetingTemplate>): MeetingTemplate {
    const db = this.getRawData();
    const list = db.meeting_templates || [...DEFAULT_MEETING_TEMPLATES];
    const nowStr = new Date().toISOString();

    let saved: MeetingTemplate;
    const existingIdx = list.findIndex(t => t.id === tpl.id);

    if (existingIdx >= 0) {
      saved = { ...list[existingIdx], ...tpl };
      list[existingIdx] = saved;
    } else {
      saved = {
        id: tpl.id || `tpl-mtg-${Date.now()}`,
        nama_template: tpl.nama_template || 'Template Rapat Baru',
        jenis_rapat: tpl.jenis_rapat || 'Rapat Bulanan',
        agendas: tpl.agendas || [],
        created_at: nowStr
      };
      list.push(saved);
    }

    this.saveToStorage({ ...db, meeting_templates: list });
    return saved;
  }

  public deleteMeetingTemplate(id: string): void {
    const db = this.getRawData();
    const list = (db.meeting_templates || [...DEFAULT_MEETING_TEMPLATES]).filter(t => t.id !== id);
    this.saveToStorage({ ...db, meeting_templates: list });
  }

  // --- Integrations: Rapat -> Kegiatan / Keuangan / Surat ---
  public createActivityFromDecision(decisionId: string, activityDetails: Partial<PondokActivity>): PondokActivity {
    const decision = this.getMeetingDecisions().find(d => d.id === decisionId);
    const meeting = decision ? this.getPondokMeetingById(decision.meeting_id) : undefined;

    const newActivity = this.savePondokActivity({
      nama_kegiatan: activityDetails.nama_kegiatan || (decision ? `Tindak Lanjut: ${decision.isi_keputusan}` : 'Kegiatan dari Rapat'),
      kode: `ACT-DEC-${Date.now().toString().slice(-4)}`,
      kategori: activityDetails.kategori || 'Pendidikan',
      tanggal_mulai: activityDetails.tanggal_mulai || decision?.deadline || new Date().toISOString().split('T')[0],
      tanggal_selesai: activityDetails.tanggal_selesai || decision?.deadline || new Date().toISOString().split('T')[0],
      lokasi: activityDetails.lokasi || meeting?.tempat || 'PP Nurus Sholah',
      penanggung_jawab: activityDetails.penanggung_jawab || decision?.penanggung_jawab || 'PIC Rapat',
      total_anggaran: activityDetails.total_anggaran || 0,
      status: 'Disetujui',
      deskripsi: `Dibuat otomatis dari Keputusan Rapat ${decision?.nomor_keputusan || ''}: "${decision?.isi_keputusan || ''}"`,
      catatan: `Sumber Rapat: ${meeting?.judul_rapat || ''} (${meeting?.tanggal || ''})`
    });

    this.logAudit('MEETING_INTEGRATION_ACTIVITY', 'Integrasi Kegiatan', `Membuat kegiatan [${newActivity.nama_kegiatan}] dari Keputusan Rapat ID: ${decisionId}`);
    return newActivity;
  }

  public createExpenseRequestFromDecision(decisionId: string, amount: number, reason: string, picName: string): ExpenseRequest {
    const decision = this.getMeetingDecisions().find(d => d.id === decisionId);
    const meeting = decision ? this.getPondokMeetingById(decision.meeting_id) : undefined;

    const newRequest = this.saveExpenseRequest({
      nominal: amount,
      tujuan: reason || (decision ? `Pengajuan dana keputusan: ${decision.isi_keputusan}` : 'Operasional Rapat'),
      alasan: reason || (decision ? `Pengajuan dana keputusan: ${decision.isi_keputusan}` : 'Operasional Rapat'),
      kategori_id: 'fcat-exp-administrasi',
      pengaju: picName || decision?.penanggung_jawab || 'Sekretariat Rapat',
      prioritas: 'Sedang',
      status: 'DIAJUKAN',
      catatan: `Sumber Rapat: ${meeting?.nomor_rapat || ''} - ${meeting?.judul_rapat || ''}. Keputusan: ${decision?.nomor_keputusan || ''}`
    });

    this.logAudit('MEETING_INTEGRATION_FINANCE', 'Integrasi Keuangan', `Membuat pengajuan pengeluaran [${newRequest.nomor_pengajuan}] Rp ${amount.toLocaleString('id-ID')} dari Keputusan Rapat`);
    return newRequest;
  }

  public createLetterFromMeetingResult(meetingId: string, recipient: string, subject: string): OutgoingLetter {
    const meeting = this.getPondokMeetingById(meetingId);
    const result = this.getMeetingResultByMeetingId(meetingId);

    const letter = this.saveOutgoingLetter({
      nomor_surat: `0${Math.floor(Math.random() * 899 + 100)}/PPNS/MEET/${new Date().getFullYear()}`,
      tanggal_surat: new Date().toISOString().split('T')[0],
      tujuan: recipient || 'Seluruh Wali Santri & Dewan Guru',
      perihal: subject || `Surat Pemberitahuan Hasil ${meeting?.judul_rapat || 'Rapat Pesantren'}`,
      kategori: 'Pemberitahuan',
      isi_ringkasan: result?.ringkasan || `Menindaklanjuti ${meeting?.judul_rapat || 'Rapat Bulanan'}, disampaikan keputusan resmi pesantren.`,
      penandatangan: meeting?.pimpinan_rapat || 'KH. Muhammad Syamsul Arifin, S.Ag.',
      status: 'Disetujui',
      catatan: `Dibuat dari Hasil Rapat ${meeting?.nomor_rapat || ''}`
    });

    this.logAudit('MEETING_INTEGRATION_LETTER', 'Integrasi Surat', `Membuat Surat Keluar [${letter.nomor_surat}] dari Hasil Rapat`);
    return letter;
  }

  // --- Meeting Dashboard Statistics ---
  public getMeetingDashboardStats() {
    const meetings = this.getPondokMeetings();
    const decisions = this.getMeetingDecisions();
    const followups = this.getMeetingFollowups();
    const reports = this.getMeetingReports();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalMeetings = meetings.length;
    const meetingsThisMonth = meetings.filter(m => {
      const d = new Date(m.tanggal);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const upcomingAgendas = meetings.filter(m => m.status === 'TERJADWAL' || m.status === 'Mendatang' || m.status === 'BERLANGSUNG').length;
    const totalDecisions = decisions.length;

    const followupNotStarted = followups.filter(f => f.status === 'Belum Dimulai' || f.progress_percent === 0).length;
    const followupInProgress = followups.filter(f => f.status === 'Berjalan' && f.progress_percent > 0 && f.progress_percent < 100).length;
    const followupCompleted = followups.filter(f => f.status === 'Selesai' || f.progress_percent === 100).length;
    const followupOverdue = followups.filter(f => {
      if (f.status === 'Selesai' || f.progress_percent === 100) return false;
      const dl = new Date(f.deadline).getTime();
      return dl < now.getTime();
    }).length;

    // Finished meetings that lack a completed report
    const finishedMeetings = meetings.filter(m => m.status === 'SELESAI');
    const reportsPending = finishedMeetings.filter(m => {
      const rep = reports.find(r => r.meeting_id === m.id);
      return !rep || rep.status !== 'DISETUJUI';
    }).length;

    return {
      totalMeetings,
      meetingsThisMonth,
      upcomingAgendas,
      totalDecisions,
      followupNotStarted,
      followupInProgress,
      followupCompleted,
      followupOverdue,
      reportsPending,
      totalFollowups: followups.length,
      totalReports: reports.length
    };
  }
}

export const dbService = new DatabaseService();
