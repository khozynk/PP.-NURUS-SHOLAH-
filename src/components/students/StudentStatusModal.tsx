import React, { useState, useEffect } from 'react';
import { Student, StudentStatus } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { StatusBadge } from '../common/Badge';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';

interface StudentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const StudentStatusModal: React.FC<StudentStatusModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [newStatus, setNewStatus] = useState<StudentStatus>('lulus');
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (student) {
      // Default to next logical status
      if (student.status === 'calon_santri') setNewStatus('aktif');
      else if (student.status === 'aktif') setNewStatus('lulus');
      else if (student.status === 'lulus') setNewStatus('alumni');
      else setNewStatus('aktif');

      setKeterangan('');
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!keterangan.trim()) {
      showToast('Keterangan Wajib', 'Mohon isi alasan atau keterangan mutasi status.', 'error');
      return;
    }

    try {
      const ok = dbService.changeStudentStatus(
        student.id,
        newStatus,
        keterangan,
        currentUser || undefined
      );

      if (ok) {
        showToast(
          'Status Diperbarui',
          `Status ${student.nama_lengkap} diubah menjadi ${newStatus}. Riwayat mutasi berhasil dicatat.`,
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showToast('Gagal', 'Tidak dapat memperbarui status santri.', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Terjadi gangguan.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mutasi & Perubahan Status Santri"
      subtitle={`${student.nama_lengkap} · NIS: ${student.nis}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            Setiap perubahan status akan <strong className="text-slate-800">otomatis tercatat di riwayat mutasi santri (student_history)</strong> dan audit log sistem. Jika diubah menjadi <em>Alumni</em> atau <em>Lulus</em>, rekod alumni akan otomatis dihubungkan.
          </div>
        </div>

        {/* Current status display */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs">
          <span className="text-slate-500">Status Saat Ini:</span>
          <StatusBadge status={student.status} size="sm" />
        </div>

        {/* New Status selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih Status Baru <span className="text-rose-500">*</span>
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
          >
            <option value="aktif">Santri Aktif (Masih bermukim)</option>
            <option value="lulus">Lulus (Telah menyelesaikan pendidikan)</option>
            <option value="alumni">Alumni (Resmi terdaftar di ikatan alumni)</option>
            <option value="pindah">Pindah (Mutasi ke pesantren / sekolah lain)</option>
            <option value="keluar">Keluar (Pengunduran diri / berhenti)</option>
            <option value="calon_santri">Calon Santri (Pendaftar baru)</option>
            <option value="tidak_aktif">Tidak Aktif</option>
          </select>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Alasan / Keterangan Mutasi <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Dinyatakan lulus ujian akhir munaqasyah, atau pindah domisili orang tua..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        {/* Actions */}
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
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Simpan Mutasi Status</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
