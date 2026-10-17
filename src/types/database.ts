export type StudentStatus = 
  | 'calon_santri'
  | 'aktif'
  | 'lulus'
  | 'alumni'
  | 'pindah'
  | 'keluar'
  | 'tidak_aktif';

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'pengasuh'
  | 'ustadz_guru'
  | 'wali_kelas'
  | 'pengurus';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  role: UserRole;
  jabatan?: string;
  keterangan?: string;
  nomor_hp?: string;
  foto?: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface RoleDefinition {
  id: UserRole;
  nama: string;
  keterangan: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  nama: string;
  modul: 
    | 'DATA SANTRI' 
    | 'DATA ALUMNI' 
    | 'PENDIDIKAN'
    | 'ASRAMA'
    | 'PEMBELAJARAN' 
    | 'ABSENSI' 
    | 'RAPOR' 
    | 'RAPAT' 
    | 'LPJ' 
    | 'DOKUMEN' 
    | 'SURAT'
    | 'ADMINISTRASI'
    | 'KEUANGAN'
    | 'KEGIATAN'
    | 'LAPORAN'
    | 'PENGGUNA' 
    | 'PENGATURAN';
  deskripsi: string;
  created_at: string;
  updated_at: string;
}

export interface SchoolClass {
  id: string;
  nama_kelas: string;
  program_id?: string;
  track_id?: string | null;
  level_id?: string | null;
  academic_year_id?: string;
  tingkat: string; // 'Tsanawiyah' | 'Aliyah' | 'Tahfidz' | 'Diniyah' | 'Mubtadi' dll
  wali_kelas_id: string | null;
  wali_kelas_nama?: string;
  tahun_ajaran: string;
  kapasitas: number;
  status?: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  nip: string; // NIP atau NIK
  nama_lengkap: string;
  nama_panggilan?: string;
  gelar?: string;
  foto?: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  nomor_hp: string;
  email: string;
  pendidikan_terakhir?: string;
  keahlian?: string; // Keahlian mengajar (Nahwu, Fiqih, Tahfidz, dll)
  jabatan: string; // Ustadz Pengajar, Wali Kelas, Pembimbing
  bidang_studi?: string;
  status: 'aktif' | 'tidak_aktif' | 'nonaktif';
  tahun_mulai?: number | string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export type StudentChildStatus = 'Kandung' | 'Tiri' | 'Angkat' | 'Lainnya';

export interface StudentDocument {
  id: string;
  student_id?: string;
  nama: string;
  nama_dokumen?: string;
  tipe: 'Foto' | 'KK' | 'Akta Kelahiran' | 'KTP Orang Tua' | 'Ijazah' | 'KTP/NIK' | 'Pasfoto' | 'Surat Kesehatan' | 'Surat Mutasi' | 'Sertifikat' | 'SKHUN' | 'Lainnya' | string;
  jenis_dokumen?: 'KK' | 'KTP/NIK' | 'Akta Kelahiran' | 'Ijazah' | 'SKHUN' | 'Pasfoto' | 'Surat Kesehatan' | 'Surat Mutasi' | 'Sertifikat' | 'Lainnya' | string;
  nomor_dokumen?: string;
  file_url: string;
  file_name?: string;
  tanggal_upload?: string;
  tanggal_terbit?: string;
  tanggal_kedaluwarsa?: string;
  ukuran?: string;
  keterangan?: string;
  catatan?: string;
  status?: 'Lengkap' | 'Belum Lengkap' | 'Perlu Perpanjangan' | 'Expired' | string;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;

  // A. IDENTITAS SANTRI
  foto: string;
  nis: string;
  nisn: string;
  nik: string;
  nomor_kk: string;
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  anak_ke?: number | string;
  jumlah_saudara?: number | string;
  status_anak?: StudentChildStatus;

  // B. ALAMAT SANTRI
  alamat: string;
  dusun: string;
  rt?: string;
  rw?: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  nomor_hp: string;

  // C. DATA AYAH
  nama_ayah?: string;
  nik_ayah?: string;
  tempat_lahir_ayah?: string;
  tanggal_lahir_ayah?: string;
  pendidikan_ayah?: string;
  pekerjaan_ayah?: string;
  penghasilan_ayah?: string;
  nomor_hp_ayah?: string;
  alamat_ayah?: string;

  // D. DATA IBU
  nama_ibu?: string;
  nik_ibu?: string;
  tempat_lahir_ibu?: string;
  tanggal_lahir_ibu?: string;
  pendidikan_ibu?: string;
  pekerjaan_ibu?: string;
  penghasilan_ibu?: string;
  nomor_hp_ibu?: string;
  alamat_ibu?: string;

  // E. DATA WALI
  punya_wali?: boolean;
  nama_wali?: string;
  hubungan_wali?: string;
  nik_wali?: string;
  pekerjaan_wali?: string;
  nomor_hp_wali?: string;
  alamat_wali?: string;

  // F. DATA KEPESANTRENAN
  tahun_masuk: number | string;
  tanggal_masuk: string;
  asal_sekolah: string;
  asal_pesantren?: string;
  asal_daerah?: string;
  program: string;
  program_id?: string | null;
  track_id?: string | null;
  level_id?: string | null;
  kelas_id: string | null;
  rombel?: string;
  rombel_id?: string | null;
  asrama?: string;
  dorm_building_id?: string | null;
  nomor_kamar?: string;
  room_id?: string | null;
  pembimbing?: string;
  mentor_id?: string | null;
  status: StudentStatus;
  catatan: string;

  // G. KONTAK DARURAT
  kontak_darurat_nama?: string;
  kontak_darurat_hubungan?: string;
  kontak_darurat_hp?: string;
  kontak_darurat_alamat?: string;
  kontak_darurat_keterangan?: string;

  // H. DOKUMEN SANTRI
  dokumen?: StudentDocument[];

  // Arsip flags (Tahap 2: Soft archive, data tidak hilang)
  is_archived?: boolean;
  tanggal_arsip?: string;
  alasan_arsip?: string;

  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alumni {
  id: string;
  student_id: string;
  id_alumni: string;
  tahun_masuk: number | string;
  tanggal_masuk?: string;
  tahun_lulus: number | string;
  tanggal_lulus: string;
  program: string;
  kelas_terakhir?: string;
  nomor_ijazah?: string;
  predikat?: 'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Lulus' | string;
  lama_belajar?: string; // e.g. "3 Tahun" atau detail
  alamat: string;
  kota_tinggal?: string;
  nomor_hp: string;
  email: string;
  pendidikan_lanjutan: string;
  kampus_sekolah?: string;
  jurusan?: string;
  pekerjaan: string;
  tempat_kerja: string;
  jabatan?: string;
  status: 'aktif_organisasi' | 'kuliah' | 'bekerja' | 'wirausaha' | 'belum_terlacak';
  catatan: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentGraduation {
  id: string;
  student_id: string;
  tanggal_lulus: string;
  tahun_lulus: number | string;
  nomor_ijazah?: string;
  predikat?: string;
  program_diselesaikan: string;
  catatan?: string;
  user_id: string;
  user_nama?: string;
  created_at: string;
}

export interface StudentTransfer {
  id: string;
  student_id: string;
  tanggal_pindah: string;
  tahun_pindah: number | string;
  tujuan_pindah: string;
  nama_lembaga_tujuan: string;
  alamat_tujuan: string;
  alasan_pindah: string;
  keterangan?: string;
  nomor_surat?: string;
  dokumen_url?: string;
  user_id: string;
  user_nama?: string;
  created_at: string;
}

export interface StudentWithdrawal {
  id: string;
  student_id: string;
  tanggal_keluar: string;
  tahun_keluar: number | string;
  alasan_keluar: string;
  keterangan?: string;
  nomor_surat?: string;
  dokumen_url?: string;
  catatan_admin?: string;
  user_id: string;
  user_nama?: string;
  created_at: string;
}

export interface StudentHistory {
  id: string;
  student_id: string;
  tanggal: string;
  jenis_perubahan: 
    | 'Registrasi Awal' 
    | 'Perubahan Status' 
    | 'Kenaikan Kelas' 
    | 'Pindah Kelas' 
    | 'Perubahan Biodata'
    | 'Perubahan Asrama'
    | 'Pengarsipan'
    | 'Pemulihan'
    | 'Lulus' 
    | 'Alumni'
    | 'Pindah' 
    | 'Keluar'
    | 'Tidak Aktif'
    | 'Pembatalan Status';
  status_lama: StudentStatus | null;
  status_baru: StudentStatus | null;
  kelas_lama: string | null;
  kelas_baru: string | null;
  keterangan: string;
  user_id: string;
  user_nama?: string;
  created_at: string;
}

export interface PesantrenSettings {
  id: string;
  nama_pesantren: string;
  nama_singkat: string;
  logo: string;
  alamat: string;
  dusun: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  telepon: string;
  email: string;
  website: string;
  google_maps: string;
  nama_pimpinan: string;
  nama_pengasuh: string;
  warna_utama: string;
  warna_sekunder: string;
  tema: 'emerald' | 'navy' | 'slate';
  kop_surat: string;
  format_nis?: string;
  format_id_alumni?: string;
  program_options?: string[];
  asrama_options?: string[];
  kepala_pendidikan?: string;
  nip_kepala_pendidikan?: string;
  kepala_tu?: string;
  nip_kepala_tu?: string;
  meeting_types?: string[];
  document_types?: string[];
  kota_surat?: string;
  catatan_evaluasi_pendidikan?: string;
  rekomendasi_pendidikan?: string;
  catatan_evaluasi_administrasi?: string;
  rekomendasi_administrasi?: string;
  slogan_berjalan?: string;
  slogan_aktif?: boolean;
  slogan_kecepatan?: 'lambat' | 'sedang' | 'cepat';
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  aktivitas: 
    | 'Login'
    | 'Logout'
    | 'Tambah data'
    | 'Edit data'
    | 'Hapus/arsip data'
    | 'Perubahan status'
    | 'Perubahan pengaturan'
    | 'Import data'
    | 'Cetak data';
  modul: string;
  data_terkait: string;
  data_sebelum?: string;
  data_sesudah?: string;
  ip_device: string;
  waktu: string;
  created_at: string;
}

// --- STAGE 4: SISTEM STRUKTUR PENDIDIKAN & ASRAMA ---

export interface EducationProgram {
  id: string;
  code: string; // e.g. TAHFIDZ, KITABIYAH, BTQ
  name: string; // e.g. Tahfidz Al-Qur'an, Kitabiyah, Baca Tulis Al-Qur'an
  description: string;
  type: string; // Tahfidz, Kitabiyah, BTQ, Umum
  duration: string; // e.g. "3 Tahun", "Target 30 Juz"
  status: 'aktif' | 'nonaktif';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationTrack {
  id: string;
  program_id: string;
  code: string; // e.g. SAFINAH, IKTISYAF
  name: string; // e.g. Safinatun Najah, Iktisyaf
  description: string;
  status: 'aktif' | 'nonaktif';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationLevel {
  id: string;
  program_id: string;
  track_id?: string | null;
  code: string; // e.g. MUBTADI, MUTAWASSITH, MUTAQODDIM, JUZ_1, JUZ_2, AL_KASYAF, BTQ
  name: string; // e.g. Mubtadi', Mutawassith, Mutaqoddim, Juz 1, Juz 2, Al-Kasyaf, BTQ
  description: string;
  level_order: number;
  duration: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  nama_tahun_ajaran: string; // e.g. 2026/2027
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'aktif' | 'nonaktif'; // Hanya 1 aktif
  keterangan: string;
  created_at: string;
  updated_at: string;
}

export interface Rombel {
  id: string;
  class_id: string;
  academic_year_id: string;
  name: string; // e.g. "Rombel A", "Halaqah 1", "Mubtadi' A"
  code: string;
  capacity: number;
  homeroom_teacher_id?: string | null;
  mentor_id?: string | null;
  status: 'aktif' | 'nonaktif';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentEducationHistory {
  id: string;
  student_id: string;
  academic_year_id: string;
  program_id: string;
  track_id?: string | null;
  level_id?: string | null;
  class_id: string;
  rombel_id?: string | null;
  homeroom_teacher_id?: string | null;
  mentor_id?: string | null;
  start_date: string;
  end_date?: string | null;
  status: 'aktif' | 'naik' | 'tetap' | 'pindah_program' | 'pindah_tingkat' | 'lulus' | 'keluar' | 'selesai';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HomeroomHistory {
  id: string;
  teacher_id: string;
  rombel_id: string;
  academic_year_id: string;
  start_date: string;
  end_date?: string | null;
  status: 'aktif' | 'selesai';
  created_at: string;
}

export interface DormBuilding {
  id: string;
  nama: string; // e.g. "Gedung Al-Ghazali (Putra 1)"
  kode: string;
  gender: 'putra' | 'putri';
  jumlah_lantai: number;
  lantai_count?: number;
  keterangan: string;
  status: 'aktif' | 'renovasi' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface DormRoom {
  id: string;
  building_id: string;
  nama_kamar: string; // e.g. "Kamar 01 - Abu Bakar"
  kode_kamar: string;
  lantai: number;
  kapasitas: number;
  capacity?: number;
  gender: 'putra' | 'putri';
  mentor_id?: string | null; // Ustadz Pembimbing Kamar
  status: 'tersedia' | 'penuh' | 'pemeliharaan' | 'aktif' | 'maintenance' | 'nonaktif';
  notes?: string;
  keterangan?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentRoomHistory {
  id: string;
  student_id: string;
  room_id: string;
  previous_room_id?: string | null;
  start_date: string;
  end_date?: string | null;
  alasan?: string;
  petugas?: string;
  catatan?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  nama: string; // e.g. "Kitab Safinatun Najah"
  kode: string;
  program_id?: string;
  track_id?: string | null;
  level_id?: string | null;
  jenis: 'Al-Qur\'an' | 'Tahfidz' | 'Murojaah' | 'Kitab' | 'BTQ' | 'Umum' | 'Akhlak' | string;
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface TeacherSubjectAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  rombel_id?: string | null;
  class_id?: string | null;
  academic_year_id: string;
  role?: 'pengajar_utama' | 'asisten' | 'penguji' | string;
  created_at: string;
}

// --- STAGE 5: PEMBELAJARAN, NILAI, ABSENSI, TAHFIDZ, MUROJAAH, BTQ, KITABIYAH & RAPOR ---

export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string; // e.g. "Semester 1 (Ganjil)", "Semester 2 (Genap)"
  semester: 'Semester 1' | 'Semester 2' | string;
  start_date: string;
  end_date: string;
  status: 'aktif' | 'nonaktif';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  tanggal?: string;
  jam_mulai: string; // e.g. "07:00"
  jam_selesai: string; // e.g. "08:00"
  subject_id: string;
  program_id: string;
  level_id?: string | null;
  class_id?: string | null;
  rombel_id: string;
  teacher_id: string;
  ruangan?: string;
  academic_year_id: string;
  period_id: string;
  status: 'aktif' | 'libur' | 'dibatalkan';
  created_at: string;
  updated_at: string;
}

export interface GradeComponent {
  id: string;
  code: string;
  name: string; // e.g. "Harian", "Tugas", "Praktik", "Ujian", "Hafalan", "Kehadiran", "Akhlak"
  weight: number; // percentage (e.g. 20)
  program_id?: string | null;
  category: 'umum' | 'kitabiyah' | 'tahfidz' | 'btq' | 'perilaku';
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface StudentGrade {
  id: string;
  student_id: string;
  academic_year_id: string;
  period_id: string;
  program_id: string;
  level_id?: string | null;
  rombel_id: string;
  subject_id: string;
  teacher_id: string;
  component_grades: Record<string, number>; // component_id -> score (0-100)
  final_grade: number;
  predikat: string;
  catatan?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TahfidzRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  tanggal: string;
  period_id: string;
  juz: number;
  surah: string;
  ayat_mulai: number;
  ayat_selesai: number;
  halaman_mulai?: number;
  halaman_selesai?: number;
  jenis_setoran: 'Hafalan Baru' | 'Murojaah' | 'Tasmi\'' | 'Ujian Hafalan' | 'Lainnya';
  nilai: number;
  kualitas: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Murojaah' | string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface TahfidzTarget {
  id: string;
  student_id: string;
  target_juz: number;
  target_surah: string;
  target_ayat: string;
  target_halaman?: number;
  period_id: string;
  tanggal_mulai: string;
  target_selesai: string;
  status: 'Belum Mulai' | 'Berjalan' | 'Tercapai' | 'Terlambat' | 'Tidak Tercapai';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TahfidzAuditLog {
  id: string;
  record_id: string;
  student_id: string;
  nilai_lama: number;
  nilai_baru: number;
  kualitas_lama: string;
  kualitas_baru: string;
  user_id: string;
  user_nama: string;
  alasan: string;
  created_at: string;
}

export interface MurojaahRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  tanggal: string;
  period_id: string;
  juz: number;
  surah: string;
  ayat: string;
  halaman?: number;
  jenis_murojaah: 'Murojaah Harian' | 'Murojaah Mingguan' | 'Murojaah Juz' | 'Murojaah Surah' | 'Tasmi\'' | 'Ujian';
  hasil: 'Lancar' | 'Cukup Lancar' | 'Banyak Kesalahan' | 'Perlu Diulang';
  nilai: number;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface BTQRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  period_id: string;
  tanggal: string;
  makharijul_huruf: number;
  tajwid: number;
  kelancaran: number;
  fasahah: number;
  membaca_alquran: number;
  menulis_arab: number;
  hafalan_dasar: number;
  praktik: number;
  nilai_akhir: number;
  level_kemampuan: 'Pemula' | 'Dasar' | 'Menengah' | 'Lanjutan';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  tanggal: string;
  period_id: string;
  rombel_id: string;
  subject_id?: string | null;
  teacher_id?: string | null;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Dispensasi' | 'Tugas Pondok';
  keterangan?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentReport {
  id: string;
  student_id: string;
  academic_year_id: string;
  period_id: string;
  rombel_id: string;
  tanggal_cetak: string;
  akhlak_catatan?: string;
  kedisiplinan_catatan?: string;
  wali_kelas_catatan?: string;
  pengasuh_catatan?: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}

// --- STAGE 6: SURAT-MENYURAT, DOKUMEN SANTRI, ARSIP & TEMPLATE SURAT ---

export interface IncomingLetter {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  tujuan: string;
  perihal: string;
  kategori: 'Dinas' | 'Kemenag' | 'Undangan' | 'Pemberitahuan' | 'Permohonan' | 'Wali Santri' | 'Lainnya';
  ringkasan: string;
  file_url?: string;
  file_name?: string;
  status: 'Baru' | 'Diproses' | 'Diteruskan' | 'Selesai' | 'Diarsipkan';
  petugas: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface OutgoingLetter {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tujuan: string;
  perihal: string;
  kategori: 'Keterangan' | 'Undangan' | 'Permohonan' | 'Tugas' | 'Rekomendasi' | 'Pemberitahuan' | 'Lainnya';
  isi_ringkasan: string;
  penandatangan: string;
  lampiran?: string;
  file_url?: string;
  file_name?: string;
  status: 'Draft' | 'Diperiksa' | 'Disetujui' | 'Ditandatangani' | 'Dikirim' | 'Diarsipkan';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentLetter {
  id: string;
  student_id: string;
  template_id?: string;
  jenis_surat: 'Surat Keterangan Santri' | 'Surat Keterangan Aktif' | 'Surat Izin' | 'Surat Pengantar' | 'Surat Panggilan' | 'Surat Pernyataan' | 'Surat Tugas' | 'Surat Rekomendasi' | 'Surat Mutasi' | 'Lainnya';
  nomor_surat: string;
  tanggal_surat: string;
  judul: string;
  perihal: string;
  penandatangan: string;
  penandatangan_jabatan: string;
  custom_fields?: Record<string, any>;
  status: 'Draft' | 'Disetujui' | 'Ditandatangani' | 'Diterbitkan' | 'Diarsipkan';
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LetterTemplate {
  id: string;
  kode: string;
  nama: string;
  jenis: 'Keterangan Santri' | 'Keterangan Aktif' | 'Surat Izin' | 'Surat Pengantar' | 'Surat Panggilan' | 'Surat Pernyataan' | 'Surat Tugas' | 'Surat Rekomendasi' | 'Lainnya';
  judul_surat: string;
  body_template: string;
  default_penandatangan: string;
  default_jabatan: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface LetterNumberConfig {
  id: string;
  format_template: string; // e.g. "{NOMOR}/{KODE}/{BULAN_ROMAWI}/{TAHUN}"
  kode_pondok: string; // e.g. "PPNS"
  counter_start: number;
  current_counter: number;
  pad_length: number;
  reset_period: 'tahun' | 'bulan' | 'tidak';
  created_at: string;
  updated_at: string;
}

export interface DocumentArchive {
  id: string;
  judul: string;
  nomor_dokumen?: string;
  kategori: 'Legalitas Pondok' | 'Surat Masuk' | 'Surat Keluar' | 'Dokumen Santri' | 'Sertifikat Wakaf' | 'Izin Operasional' | 'LPJ & Rapat' | 'Lainnya';
  tanggal_dokumen: string;
  pengarsip: string;
  file_url?: string;
  file_name?: string;
  tags?: string[];
  status: 'Aktif' | 'Diarsipkan' | 'Penting';
  deskripsi?: string;
  created_at: string;
  updated_at: string;
}

// --- STAGE 7: KEUANGAN PONDOK, RAPAT, KEGIATAN, ANGGARAN, PENGELUARAN, PEMASUKAN DAN LPJ ---

export interface FinancialCategory {
  id: string;
  nama: string;
  jenis: 'PEMASUKAN' | 'PENGELUARAN';
  urutan: number;
  status: 'aktif' | 'nonaktif';
  deskripsi?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  nomor_transaksi: string;
  tanggal: string;
  jenis: 'PEMASUKAN' | 'PENGELUARAN';
  kategori_id: string;
  nominal: number;
  sumber_destinasi: string;
  deskripsi: string;
  metode_pembayaran: 'Tunai' | 'Transfer Bank' | 'E-Wallet' | 'Lainnya';
  bukti_url?: string;
  file_name?: string;
  petugas: string;
  status: 'Valid' | 'Draft' | 'Dibatalkan' | 'Koreksi';
  student_id?: string;
  academic_year_id?: string;
  period_id?: string;
  activity_id?: string;
  budget_id?: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRequest {
  id: string;
  nomor_pengajuan: string;
  pengaju: string;
  tanggal: string;
  kategori_id: string;
  activity_id?: string;
  tujuan: string;
  nominal: number;
  alasan: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Mendesak';
  lampiran_url?: string;
  file_name?: string;
  status: 'DRAFT' | 'DIAJUKAN' | 'DIPERIKSA' | 'DISETUJUI' | 'DIBAYARKAN' | 'SELESAI' | 'DITOLAK';
  alasan_penolakan?: string;
  pemeriksa?: string;
  penyetuju?: string;
  tanggal_persetujuan?: string;
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseApproval {
  id: string;
  request_id: string;
  user_id: string;
  user_nama: string;
  user_role: string;
  tanggal: string;
  status_sebelum: string;
  status_sesudah: string;
  alasan?: string;
  catatan?: string;
  created_at: string;
}

export interface PondokBudget {
  id: string;
  nama_anggaran: string;
  tahun: string;
  periode?: string;
  kategori_id?: string;
  activity_id?: string;
  nominal_anggaran: number;
  nominal_realisasi?: number;
  penanggung_jawab: string;
  status: 'aktif' | 'nonaktif' | 'selesai';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface PondokActivity {
  id: string;
  nama_kegiatan: string;
  kode: string;
  kategori: 'Keagamaan' | 'Pendidikan' | 'Haflah / Imtihan' | 'Pembangunan' | 'Olahraga & Seni' | 'Pengabdian' | 'Lainnya';
  tanggal_mulai: string;
  tanggal_selesai: string;
  lokasi: string;
  penanggung_jawab: string;
  peserta_count?: number;
  total_anggaran: number;
  total_realisasi?: number;
  status: 'Rencana' | 'Disetujui' | 'Berjalan' | 'Selesai' | 'Dibatalkan';
  deskripsi: string;
  dokumentasi_urls?: string[];
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityParticipant {
  id: string;
  activity_id: string;
  participant_type: 'santri' | 'ustadz' | 'pengurus' | 'wali' | 'lainnya';
  student_id?: string;
  teacher_id?: string;
  name?: string;
  role?: string;
  attendance_status?: 'Hadir' | 'Izin' | 'Sakit' | 'Tidak Hadir';
  created_at: string;
}

export interface ActivityBudget {
  id: string;
  activity_id: string;
  item_nama: string;
  kategori: string;
  nominal_anggaran: number;
  nominal_realisasi: number;
  catatan?: string;
  created_at: string;
}

export interface ActivityLPJ {
  id: string;
  activity_id: string;
  identitas: string;
  latar_belakang: string;
  dasar_kegiatan: string;
  tujuan: string;
  waktu_pelaksanaan: string;
  tempat: string;
  susunan_panitia: string;
  hasil_kegiatan: string;
  kendala: string;
  evaluasi: string;
  kesimpulan: string;
  penutup: string;
  total_anggaran: number;
  total_realisasi: number;
  selisih: number;
  penandatangan_ketua: string;
  penandatangan_bendahara: string;
  penandatangan_pengasuh: string;
  status: 'DRAFT' | 'DIAJUKAN' | 'DIPERIKSA' | 'DIREVISI' | 'DISETUJUI' | 'DIARSIPKAN';
  catatan_revisi?: string;
  file_lpj_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PondokMeeting {
  id: string;
  nomor_rapat?: string;
  judul_rapat: string;
  bulan?: string;
  tahun?: number;
  tanggal: string;
  hari?: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tempat: string;
  jenis_rapat: 'Rapat Bulanan' | 'Rapat Pengurus' | 'Rapat Pengasuh' | 'Rapat Guru/Ustadz' | 'Rapat Evaluasi' | 'Rapat Akademik' | 'Rapat Santri' | 'Rapat Keuangan' | 'Rapat Kegiatan' | 'Rapat Khusus' | string;
  pimpinan_rapat: string;
  pimpinan_user_id?: string;
  sekretaris_rapat: string;
  sekretaris_user_id?: string;
  agenda_utama?: string;
  tujuan?: string;
  peserta_ringkasan?: string;
  catatan?: string;
  status: 'DRAFT' | 'TERJADWAL' | 'BERLANGSUNG' | 'SELESAI' | 'DIBATALKAN' | 'DITUNDA' | 'Mendatang';
  postponed_reason?: string;
  postponed_new_date?: string;
  postponed_new_time?: string;
  postponed_notes?: string;
  is_archived?: boolean;
  locked_notulen?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id?: string;
  teacher_id?: string;
  student_id?: string;
  nama: string;
  jabatan: string;
  kehadiran: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Tidak Diundang' | 'Tidak Hadir';
  catatan?: string;
  created_at: string;
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  urutan: number;
  judul: string;
  kategori?: string;
  masalah_latar_belakang?: string;
  bahan_pembahasan?: string;
  prioritas?: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Penting';
  pengusul?: string;
  pic?: string;
  pic_user_id?: string;
  status?: 'Draf' | 'Dibahas' | 'Selesai' | 'Ditunda';
  masalah?: string;
  pembahasan?: string;
  masukan?: string;
  kesimpulan?: string;
  keputusan?: string;
  hasil_pembahasan?: string;
  penanggung_jawab?: string;
  deadline?: string;
  created_at: string;
}

export interface MeetingMinute {
  id: string;
  meeting_id: string;
  pembukaan: string;
  pembahasan_lengkap: string;
  penutup: string;
  file_notulen_url?: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeetingResult {
  id: string;
  meeting_id: string;
  ringkasan: string;
  hasil_pembahasan: string;
  keputusan: string;
  rekomendasi: string;
  catatan?: string;
  dibuat_oleh: string;
  tanggal: string;
  status: 'DRAFT' | 'DIPERIKSA' | 'DISETUJUI' | 'DIARSIPKAN';
  catatan_revisi?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingDecision {
  id: string;
  meeting_id: string;
  nomor_keputusan: string;
  isi_keputusan: string;
  kategori?: string;
  penanggung_jawab: string;
  pic_user_id?: string;
  deadline: string;
  prioritas?: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Penting';
  status: 'Belum Dilaksanakan' | 'Berjalan' | 'Selesai' | 'Terlambat' | 'Dibatalkan';
  catatan?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingFollowup {
  id: string;
  meeting_id: string;
  decision_id?: string;
  judul: string;
  sumber_rapat: string;
  keputusan: string;
  pic: string;
  pic_user_id?: string;
  unit_bagian: string;
  tanggal_mulai: string;
  deadline: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Penting';
  status: 'Belum Dimulai' | 'Berjalan' | 'Selesai' | 'Terlambat';
  progress_percent: number;
  hasil?: string;
  kendala?: string;
  catatan?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingReport {
  id: string;
  meeting_id: string;
  nomor_laporan: string;
  judul_laporan: string;
  tanggal_laporan: string;
  tujuan_rapat: string;
  peserta_ringkasan: string;
  agenda_ringkasan: string;
  pembahasan_ringkasan: string;
  hasil_rapat: string;
  keputusan_ringkasan: string;
  tindak_lanjut_ringkasan: string;
  penanggung_jawab_ringkasan: string;
  batas_waktu_ringkasan: string;
  kesimpulan: string;
  dokumentasi_notes?: string;
  pimpinan_nama: string;
  pimpinan_jabatan: string;
  sekretaris_nama: string;
  sekretaris_jabatan: string;
  pengasuh_nama: string;
  pengasuh_jabatan: string;
  status: 'DRAFT' | 'DIPERIKSA' | 'DIREVISI' | 'DISETUJUI' | 'DIARSIPKAN';
  catatan_revisi?: string;
  approved_by?: string;
  approved_at?: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeetingMonthlyEvaluation {
  id: string;
  bulan: string;
  tahun: number;
  kategori: string;
  pencapaian: string;
  masalah: string;
  kendala: string;
  solusi: string;
  rekomendasi: string;
  target_bulan_berikutnya: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingMonthlyPlan {
  id: string;
  bulan: string;
  tahun: number;
  rencana: string;
  pic: string;
  target_tanggal: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Penting';
  indikator_keberhasilan: string;
  status: 'Rencana' | 'Diproses' | 'Selesai';
  created_at: string;
}

export interface MeetingTemplate {
  id: string;
  nama_template: string;
  jenis_rapat: string;
  agendas: { judul: string; kategori: string; prioritas: 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Penting' }[];
  created_at: string;
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  judul_file: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'request' | 'deadline';
  view_id?: string;
  target_permission?: string;
  is_read: boolean;
  created_at: string;
}

export interface DatabaseSchema {
  version: number;
  is_empty_state?: boolean;
  users: User[];
  roles: RoleDefinition[];
  permissions: Permission[];
  students: Student[];
  student_history: StudentHistory[];
  alumni: Alumni[];
  student_graduations?: StudentGraduation[];
  student_transfers?: StudentTransfer[];
  student_withdrawals?: StudentWithdrawal[];
  classes: SchoolClass[];
  teachers: Teacher[];
  settings: PesantrenSettings;
  audit_logs: AuditLog[];
  // Stage 4 structures
  education_programs?: EducationProgram[];
  education_tracks?: EducationTrack[];
  education_levels?: EducationLevel[];
  academic_years?: AcademicYear[];
  rombels?: Rombel[];
  student_education_history?: StudentEducationHistory[];
  homeroom_history?: HomeroomHistory[];
  dorm_buildings?: DormBuilding[];
  dorm_rooms?: DormRoom[];
  student_room_history?: StudentRoomHistory[];
  subjects?: Subject[];
  teacher_subjects?: TeacherSubjectAssignment[];
  // Stage 5 structures
  academic_periods?: AcademicPeriod[];
  schedules?: Schedule[];
  grade_components?: GradeComponent[];
  student_grades?: StudentGrade[];
  tahfidz_records?: TahfidzRecord[];
  tahfidz_targets?: TahfidzTarget[];
  tahfidz_audit_logs?: TahfidzAuditLog[];
  murojaah_records?: MurojaahRecord[];
  btq_records?: BTQRecord[];
  attendance_records?: AttendanceRecord[];
  student_reports?: StudentReport[];
  // Stage 6 structures
  incoming_letters?: IncomingLetter[];
  outgoing_letters?: OutgoingLetter[];
  student_letters?: StudentLetter[];
  letter_templates?: LetterTemplate[];
  letter_number_configs?: LetterNumberConfig[];
  student_documents?: StudentDocument[];
  document_archives?: DocumentArchive[];
  // Stage 7 structures
  financial_categories?: FinancialCategory[];
  financial_transactions?: FinancialTransaction[];
  expense_requests?: ExpenseRequest[];
  expense_approvals?: ExpenseApproval[];
  pondok_budgets?: PondokBudget[];
  pondok_activities?: PondokActivity[];
  activity_participants?: ActivityParticipant[];
  activity_budgets?: ActivityBudget[];
  activity_lpjs?: ActivityLPJ[];
  pondok_meetings?: PondokMeeting[];
  meeting_participants?: MeetingParticipant[];
  meeting_agendas?: MeetingAgenda[];
  meeting_minutes?: MeetingMinute[];
  meeting_decisions?: MeetingDecision[];
  meeting_followups?: MeetingFollowup[];
  meeting_results?: MeetingResult[];
  meeting_reports?: MeetingReport[];
  meeting_monthly_evaluations?: MeetingMonthlyEvaluation[];
  meeting_monthly_plans?: MeetingMonthlyPlan[];
  meeting_templates?: MeetingTemplate[];
  meeting_attachments?: MeetingAttachment[];
  operational_notifications?: OperationalNotification[];
}
