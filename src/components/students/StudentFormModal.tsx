import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { User, MapPin, BookOpen, FileText } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSuccess: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSuccess
}) => {
  const { showToast } = useToast();
  const classes = dbService.getClasses();
  const programs = dbService.getPrograms();
  const tracks = dbService.getTracks();
  const levels = dbService.getLevels();
  const rombels = dbService.getRombels();
  const dormBuildings = dbService.getDormBuildings();
  const dormRooms = dbService.getDormRooms();
  const currentUser = authService.getCurrentUser();

  const isEditing = !!studentToEdit;

  // Form states
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [nik, setNik] = useState('');
  const [nomorKk, setNomorKk] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [dusun, setDusun] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kabupaten, setKabupaten] = useState('Pamekasan');
  const [provinsi, setProvinsi] = useState('Jawa Timur');
  const [kodePos, setKodePos] = useState('69362');
  const [tahunMasuk, setTahunMasuk] = useState<number | string>(new Date().getFullYear());
  const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().slice(0, 10));
  const [asalSekolah, setAsalSekolah] = useState('');
  
  // Relational stage 4 fields
  const [programId, setProgramId] = useState<string>('');
  const [program, setProgram] = useState('');
  const [trackId, setTrackId] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [kelasId, setKelasId] = useState<string>('');
  const [rombelId, setRombelId] = useState<string>('');
  const [dormBuildingId, setDormBuildingId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  
  const [status, setStatus] = useState<StudentStatus>('aktif');
  const [catatan, setCatatan] = useState('');

  // Reset or populate fields when opened
  useEffect(() => {
    if (studentToEdit) {
      setNis(studentToEdit.nis);
      setNisn(studentToEdit.nisn || '');
      setNik(studentToEdit.nik || '');
      setNomorKk(studentToEdit.nomor_kk || '');
      setNamaLengkap(studentToEdit.nama_lengkap);
      setNamaPanggilan(studentToEdit.nama_panggilan || '');
      setJenisKelamin(studentToEdit.jenis_kelamin);
      setTempatLahir(studentToEdit.tempat_lahir || '');
      setTanggalLahir(studentToEdit.tanggal_lahir || '');
      setNomorHp(studentToEdit.nomor_hp || '');
      setAlamat(studentToEdit.alamat || '');
      setDusun(studentToEdit.dusun || '');
      setDesa(studentToEdit.desa || '');
      setKecamatan(studentToEdit.kecamatan || '');
      setKabupaten(studentToEdit.kabupaten || 'Pamekasan');
      setProvinsi(studentToEdit.provinsi || 'Jawa Timur');
      setKodePos(studentToEdit.kode_pos || '69362');
      setTahunMasuk(studentToEdit.tahun_masuk);
      setTanggalMasuk(studentToEdit.tanggal_masuk || new Date().toISOString().slice(0, 10));
      setAsalSekolah(studentToEdit.asal_sekolah || '');
      
      const pId = studentToEdit.program_id || programs.find(p => p.name === studentToEdit.program)?.id || programs[0]?.id || '';
      setProgramId(pId);
      setProgram(studentToEdit.program || programs.find(p => p.id === pId)?.name || 'Kitabiyah');
      setTrackId(studentToEdit.track_id || '');
      setLevelId(studentToEdit.level_id || '');
      setKelasId(studentToEdit.kelas_id || '');
      setRombelId(studentToEdit.rombel_id || '');
      setDormBuildingId(studentToEdit.dorm_building_id || '');
      setRoomId(studentToEdit.room_id || '');

      setStatus(studentToEdit.status);
      setCatatan(studentToEdit.catatan || '');
    } else {
      // Auto-generate next candidate NIS
      const nextNum = Math.floor(100 + Math.random() * 899);
      setNis(`${new Date().getFullYear()}${nextNum}`);
      setNisn('');
      setNik('');
      setNomorKk('');
      setNamaLengkap('');
      setNamaPanggilan('');
      setJenisKelamin('L');
      setTempatLahir('');
      setTanggalLahir('2010-01-01');
      setNomorHp('');
      setAlamat('');
      setDusun('');
      setDesa('Akkor');
      setKecamatan('Palengaan');
      setKabupaten('Pamekasan');
      setProvinsi('Jawa Timur');
      setKodePos('69362');
      setTahunMasuk(new Date().getFullYear());
      setTanggalMasuk(new Date().toISOString().slice(0, 10));
      setAsalSekolah('');
      
      const defaultProg = programs[0] || { id: 'prog-kitabiyah', name: 'Kitabiyah' };
      setProgramId(defaultProg.id);
      setProgram(defaultProg.name);
      setTrackId('');
      setLevelId('');
      setKelasId(classes[0]?.id || '');
      setRombelId(rombels[0]?.id || '');
      setDormBuildingId(dormBuildings[0]?.id || '');
      setRoomId('');
      setStatus('aktif');
      setCatatan('');
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim()) {
      showToast('Validasi Gagal', 'Nama lengkap santri wajib diisi.', 'error');
      return;
    }

    if (!nis.trim()) {
      showToast('Validasi Gagal', 'Nomor Induk Santri (NIS) wajib diisi.', 'error');
      return;
    }

    try {
      const selectedBld = dormBuildings.find(b => b.id === dormBuildingId);
      const selectedRm = dormRooms.find(r => r.id === roomId);

      if (isEditing && studentToEdit) {
        dbService.updateStudent(studentToEdit.id, {
          nis,
          nisn,
          nik,
          nomor_kk: nomorKk,
          nama_lengkap: namaLengkap,
          nama_panggilan: namaPanggilan,
          jenis_kelamin: jenisKelamin,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir,
          nomor_hp: nomorHp,
          alamat,
          dusun,
          desa,
          kecamatan,
          kabupaten,
          provinsi,
          kode_pos: kodePos,
          tahun_masuk: tahunMasuk,
          tanggal_masuk: tanggalMasuk,
          asal_sekolah: asalSekolah,
          program,
          program_id: programId || null,
          track_id: trackId || null,
          level_id: levelId || null,
          kelas_id: kelasId || null,
          rombel_id: rombelId || null,
          dorm_building_id: dormBuildingId || null,
          room_id: roomId || null,
          asrama: selectedBld?.nama || studentToEdit.asrama,
          nomor_kamar: selectedRm?.nama_kamar || studentToEdit.nomor_kamar,
          status,
          catatan
        }, currentUser || undefined);

        showToast('Berhasil Diperbarui', `Data santri ${namaLengkap} berhasil disimpan.`, 'success');
      } else {
        dbService.createStudent({
          nis,
          nisn,
          nik,
          nomor_kk: nomorKk,
          nama_lengkap: namaLengkap,
          nama_panggilan: namaPanggilan,
          jenis_kelamin: jenisKelamin,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir,
          nomor_hp: nomorHp,
          alamat,
          dusun,
          desa,
          kecamatan,
          kabupaten,
          provinsi,
          kode_pos: kodePos,
          tahun_masuk: tahunMasuk,
          tanggal_masuk: tanggalMasuk,
          asal_sekolah: asalSekolah,
          program,
          program_id: programId || null,
          track_id: trackId || null,
          level_id: levelId || null,
          kelas_id: kelasId || null,
          rombel_id: rombelId || null,
          dorm_building_id: dormBuildingId || null,
          room_id: roomId || null,
          asrama: selectedBld?.nama || 'Asrama Nurus Sholah',
          nomor_kamar: selectedRm?.nama_kamar || '',
          status,
          foto: '',
          catatan
        }, currentUser || undefined);

        showToast('Santri Ditambahkan', `Santri baru ${namaLengkap} berhasil didaftarkan.`, 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Menyimpan', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Data Santri' : 'Form Pendaftaran Santri Baru'}
      subtitle="PP Nurus Sholah Batulabang Akkor Palengaan Pamekasan"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BAGIAN 1: IDENTITAS PRIBADI */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <User className="w-4 h-4 text-emerald-700" />
            <span>1. Identitas Pokok Santri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Santri <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Contoh: Muhammad Fadhil Ramadhan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={namaPanggilan}
                onChange={(e) => setNamaPanggilan(e.target.value)}
                placeholder="Contoh: Fadhil"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                <option value="L">Laki-laki (Putra)</option>
                <option value="P">Perempuan (Putri)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIS (Nomor Induk Santri) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="Contoh: 2026001"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (Nasional)
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="10 Digit NISN"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK (KTP Santri)
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="16 Digit NIK"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Kartu Keluarga (KK)
              </label>
              <input
                type="text"
                value={nomorKk}
                onChange={(e) => setNomorKk(e.target.value)}
                placeholder="16 Digit No. KK"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                placeholder="Kota/Kabupaten Lahir"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor HP / WhatsApp Wali Santri
              </label>
              <input
                type="text"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 2: ALAMAT & WILAYAH */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>2. Domisili & Asal Santri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat / Jalan / RT RW
              </label>
              <input
                type="text"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Contoh: Dusun Timur RT 02 RW 01"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dusun</label>
              <input
                type="text"
                value={dusun}
                onChange={(e) => setDusun(e.target.value)}
                placeholder="Contoh: Batulabang"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                placeholder="Contoh: Akkor"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                placeholder="Contoh: Palengaan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={kabupaten}
                onChange={(e) => setKabupaten(e.target.value)}
                placeholder="Contoh: Pamekasan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={kodePos}
                onChange={(e) => setKodePos(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 3: PENDIDIKAN & PROGRAM */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>3. Pendidikan, Program & Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asal Sekolah Sebelumnya
              </label>
              <input
                type="text"
                value={asalSekolah}
                onChange={(e) => setAsalSekolah(e.target.value)}
                placeholder="Contoh: MI Nurus Sholah Akkor / SMPN 1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Pesantren <span className="text-rose-500">*</span>
              </label>
              <select
                value={programId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setProgramId(pId);
                  const p = programs.find(pr => pr.id === pId);
                  setProgram(p?.name || '');
                  setTrackId('');
                  setLevelId('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang / Track Kitab (Opsional)
              </label>
              <select
                value={trackId}
                onChange={(e) => {
                  setTrackId(e.target.value);
                  setLevelId('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                <option value="">-- Tanpa Cabang Khusus --</option>
                {tracks.filter(t => !programId || t.program_id === programId).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat / Level (Opsional)
              </label>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                <option value="">-- Pilih Tingkatan --</option>
                {levels.filter(l => (!trackId || l.track_id === trackId) && (!programId || l.program_id === programId)).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Induk & Rombel Belajar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={kelasId}
                  onChange={(e) => setKelasId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  <option value="">-- Kelas Induk --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kelas} ({c.tingkat})</option>
                  ))}
                </select>

                <select
                  value={rombelId}
                  onChange={(e) => setRombelId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  <option value="">-- Rombel Belajar --</option>
                  {rombels.filter(r => !kelasId || r.class_id === kelasId).map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penempatan Asrama & Kamar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={dormBuildingId}
                  onChange={(e) => {
                    setDormBuildingId(e.target.value);
                    setRoomId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  <option value="">-- Gedung Asrama --</option>
                  {dormBuildings.map(b => (
                    <option key={b.id} value={b.id}>{b.nama}</option>
                  ))}
                </select>

                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
                >
                  <option value="">-- Kamar Santri --</option>
                  {dormRooms.filter(r => !dormBuildingId || r.building_id === dormBuildingId).map(r => (
                    <option key={r.id} value={r.id}>{r.nama_kamar} (Lantai {r.lantai})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Santri <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white"
              >
                <option value="aktif">Santri Aktif</option>
                <option value="calon_santri">Calon Santri</option>
                <option value="lulus">Lulus</option>
                <option value="alumni">Alumni</option>
                <option value="pindah">Pindah</option>
                <option value="keluar">Keluar</option>
                <option value="tidak_aktif">Tidak Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Masuk
              </label>
              <input
                type="number"
                value={tahunMasuk}
                onChange={(e) => setTahunMasuk(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Masuk Resmi
              </label>
              <input
                type="date"
                value={tanggalMasuk}
                onChange={(e) => setTanggalMasuk(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Khusus Santri
              </label>
              <textarea
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Catatan prestasi, kesehatan, atau keterangan lainnya..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            {isEditing ? 'Simpan Perubahan' : 'Daftarkan Santri'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
