import React, { useState } from 'react';
import { User } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { KeyRound, ShieldAlert } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 5) {
      showToast('Validasi Gagal', 'Kata sandi baru minimal 5 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Validasi Gagal', 'Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await dbService.resetUserPassword(user.id, newPassword, currentUser || undefined);
      showToast('Password Direset', `Kata sandi untuk pengguna ${user.nama_lengkap} (@${user.username}) berhasil diubah.`, 'success');
      onSuccess();
      onClose();
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Gagal Reset Password', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Kata Sandi Pengguna"
      subtitle={`${user.nama_lengkap} (@${user.username})`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>
            Anda sedang mengatur ulang kata sandi untuk akun <strong>{user.nama_lengkap}</strong>. Tindakan ini akan dicatat dalam audit log.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 5 karakter"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi kata sandi baru"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Simpan Password Baru'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
