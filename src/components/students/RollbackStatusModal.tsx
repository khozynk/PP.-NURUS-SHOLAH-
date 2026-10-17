import React, { useState } from 'react';
import { Student, StudentStatus } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RollbackStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const RollbackStatusModal: React.FC<RollbackStatusModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [targetStatus, setTargetStatus] = useState<StudentStatus>('aktif');
  const [alasanPembatalan, setAlasanPembatalan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!student) return null;

  const canRollback = authService.hasPermission('student.status.rollback') || currentUser?.role === 'super_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canRollback) {
      showToast('Akses Ditolak', 'Hanya Super Admin yang diizinkan membatalkan perubahan status santri.', 'error');
      return;
    }

    if (!alasanPembatalan.trim()) {
      showToast('Alasan Diperlukan', 'Harap isi alasan pembatalan status secara rinci.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      dbService.rollbackStudentStatus(
        student.id,
        targetStatus,
        alasanPembatalan,
        currentUser || undefined
      );

      showToast(
        'Pembatalan Berhasil',
        `Status ${student.nama_lengkap} berhasil dikembalikan menjadi ${targetStatus}. Histori dan audit log baru telah dicatat.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Membatalkan Status', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batalkan Perubahan Status (Rollback)"
      subtitle={`Koreksi status santri: ${student.nama_lengkap} (NIS: ${student.nis})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
          <div>
            Fitur khusus <strong>Super Admin</strong>. Jika terjadi salah klik atau kesalahan administrasi (misal santri keliru diluluskan atau dikeluarkan), status dapat dikembalikan. <strong>Histori lama tidak dihapus</strong> dan histori baru pembatalan akan dibuat.
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-100 text-xs flex justify-between items-center">
          <span className="text-slate-500">Status Saat Ini:</span>
          <span className="font-bold text-slate-800 uppercase px-2 py-0.5 bg-white rounded border border-slate-200">
            {student.status}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kembalikan Status Menjadi <span className="text-rose-500">*</span>
          </label>
          <select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-purple-700 focus:outline-none bg-white font-semibold"
          >
            <option value="aktif">Santri Aktif</option>
            <option value="calon_santri">Calon Santri</option>
            <option value="tidak_aktif">Tidak Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="alumni">Alumni</option>
            <option value="pindah">Pindah</option>
            <option value="keluar">Keluar</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alasan Pembatalan / Catatan Koreksi <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={alasanPembatalan}
            onChange={(e) => setAlasanPembatalan(e.target.value)}
            placeholder="Contoh: Kesalahan input admin saat pengumuman munaqasyah, santri belum menyelesaikan hafalan juz 30..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-purple-700 focus:outline-none"
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
            disabled={isSubmitting || !canRollback}
            className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Batalkan Status'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
