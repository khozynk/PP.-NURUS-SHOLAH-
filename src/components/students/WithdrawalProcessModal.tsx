import React, { useState, useEffect } from 'react';
import { Student } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { UserMinus, AlertTriangle } from 'lucide-react';

interface WithdrawalProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const WithdrawalProcessModal: React.FC<WithdrawalProcessModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().slice(0, 10));
  const [tahunKeluar, setTahunKeluar] = useState(new Date().getFullYear());
  const [alasanKeluar, setAlasanKeluar] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      const nowYear = new Date().getFullYear();
      setTanggalKeluar(new Date().toISOString().slice(0, 10));
      setTahunKeluar(nowYear);
      setAlasanKeluar('Pengunduran diri atas permohonan orang tua / wali santri');
      setNomorSurat(`SK-KLR/${nowYear}/${student.nis.slice(-4)}`);
      setKeterangan('');
      setCatatanAdmin('');
    }
  }, [student, isOpen]);

  if (!student) return null;

  const canWithdraw = authService.hasPermission('student.withdraw');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canWithdraw) {
      showToast('Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses santri keluar (student.withdraw).', 'error');
      return;
    }

    if (!alasanKeluar.trim()) {
      showToast('Alasan Wajib', 'Alasan keluar santri wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      dbService.processWithdrawal(
        student.id,
        {
          tanggal_keluar: tanggalKeluar,
          tahun_keluar: tahunKeluar,
          alasan_keluar: alasanKeluar,
          keterangan,
          nomor_surat: nomorSurat,
          catatan_admin: catatanAdmin
        },
        currentUser || undefined
      );

      showToast(
        'Proses Keluar Berhasil',
        `Santri ${student.nama_lengkap} telah diproses keluar. Data tersimpan di arsip Santri Keluar.`,
        'info'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Memproses', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Santri Keluar / Berhenti"
      subtitle={`${student.nama_lengkap} · NIS: ${student.nis}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            Status santri akan diubah menjadi <strong>KELUAR</strong>. Data tidak dihapus permanen melainkan masuk ke <strong>Arsip Santri Keluar</strong> dan histori tetap utuh.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Keluar <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={tanggalKeluar}
              onChange={(e) => {
                setTanggalKeluar(e.target.value);
                if (e.target.value) setTahunKeluar(new Date(e.target.value).getFullYear());
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Keluar <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={tahunKeluar}
              onChange={(e) => setTahunKeluar(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alasan Keluar <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Mengundurkan diri, faktor kesehatan, bekerja..."
            value={alasanKeluar}
            onChange={(e) => setAlasanKeluar(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Nomor Surat / Dokumen Pendukung
          </label>
          <input
            type="text"
            placeholder="Contoh: 012/PP.NS/SKK/2026"
            value={nomorSurat}
            onChange={(e) => setNomorSurat(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan Surat / Dokumen
          </label>
          <textarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Keterangan permohonan wali santri..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Internal Admin / Pengasuh
          </label>
          <textarea
            rows={2}
            value={catatanAdmin}
            onChange={(e) => setCatatanAdmin(e.target.value)}
            placeholder="Catatan tertutup untuk evaluasi pesantren..."
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
            disabled={isSubmitting || !canWithdraw}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <UserMinus className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Proses Keluar'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
