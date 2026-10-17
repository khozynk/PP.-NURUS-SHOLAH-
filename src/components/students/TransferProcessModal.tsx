import React, { useState, useEffect } from 'react';
import { Student } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { DoorOpen, Building, MapPin, FileText, AlertCircle } from 'lucide-react';

interface TransferProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const TransferProcessModal: React.FC<TransferProcessModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [tanggalPindah, setTanggalPindah] = useState(new Date().toISOString().slice(0, 10));
  const [tahunPindah, setTahunPindah] = useState(new Date().getFullYear());
  const [tujuanPindah, setTujuanPindah] = useState<'Pesantren Lain' | 'Sekolah Formal Lain' | 'Pulang ke Kampung Halaman' | 'Lainnya'>('Pesantren Lain');
  const [namaLembagaTujuan, setNamaLembagaTujuan] = useState('');
  const [alamatTujuan, setAlamatTujuan] = useState('');
  const [alasanPindah, setAlasanPindah] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      const nowYear = new Date().getFullYear();
      setTanggalPindah(new Date().toISOString().slice(0, 10));
      setTahunPindah(nowYear);
      setTujuanPindah('Pesantren Lain');
      setNamaLembagaTujuan('');
      setAlamatTujuan('');
      setAlasanPindah('Mengikuti domisili keluarga / orang tua');
      setNomorSurat(`SP-PND/${nowYear}/${student.nis.slice(-4)}`);
      setKeterangan('');
    }
  }, [student, isOpen]);

  if (!student) return null;

  const canTransfer = authService.hasPermission('student.transfer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canTransfer) {
      showToast('Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses santri pindah (student.transfer).', 'error');
      return;
    }

    if (!namaLembagaTujuan.trim() || !alasanPindah.trim()) {
      showToast('Data Belum Lengkap', 'Nama lembaga tujuan dan alasan pindah wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      dbService.processTransfer(
        student.id,
        {
          tanggal_pindah: tanggalPindah,
          tahun_pindah: tahunPindah,
          tujuan_pindah: tujuanPindah,
          nama_lembaga_tujuan: namaLembagaTujuan,
          alamat_tujuan: alamatTujuan,
          alasan_pindah: alasanPindah,
          keterangan,
          nomor_surat: nomorSurat
        },
        currentUser || undefined
      );

      showToast(
        'Proses Pindah Berhasil',
        `Santri ${student.nama_lengkap} berhasil diproses sebagai pindahan. Data tersimpan di arsip Data Santri Pindah.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Memproses Pindah', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Mutasi Santri Pindah"
      subtitle={`${student.nama_lengkap} · NIS: ${student.nis}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-start gap-2.5">
          <DoorOpen className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            Santri akan berpindah status menjadi <strong>PINDAH</strong>. Data tidak akan dihapus dan otomatis masuk ke menu <strong>Santri Pindah</strong> dengan seluruh histori tetap terjaga.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Pindah <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={tanggalPindah}
              onChange={(e) => {
                setTanggalPindah(e.target.value);
                if (e.target.value) setTahunPindah(new Date(e.target.value).getFullYear());
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Pindah <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={tahunPindah}
              onChange={(e) => setTahunPindah(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategori Tujuan Pindah <span className="text-rose-500">*</span>
          </label>
          <select
            value={tujuanPindah}
            onChange={(e) => setTujuanPindah(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
          >
            <option value="Pesantren Lain">Pondok Pesantren Lain</option>
            <option value="Sekolah Formal Lain">Madrasah / Sekolah Formal Lain</option>
            <option value="Pulang ke Kampung Halaman">Pulang ke Kampung Halaman</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nama Lembaga / Sekolah Tujuan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: PP Sidogiri Pasuruan / MTs Negeri 1 Surabaya"
            value={namaLembagaTujuan}
            onChange={(e) => setNamaLembagaTujuan(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat / Kota Lembaga Tujuan
          </label>
          <input
            type="text"
            placeholder="Contoh: Kraton, Pasuruan, Jawa Timur"
            value={alamatTujuan}
            onChange={(e) => setAlamatTujuan(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Pindah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Mengikuti perpindahan tugas orang tua"
              value={alasanPindah}
              onChange={(e) => setAlasanPindah(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Surat Keterangan Pindah
            </label>
            <input
              type="text"
              placeholder="Contoh: 045/PP.NS/SKP/VII/2026"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan Tambahan
          </label>
          <textarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Catatan dokumen pendukung, persetujuan wali, dsb..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

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
            disabled={isSubmitting || !canTransfer}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <DoorOpen className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Proses Pindah'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
