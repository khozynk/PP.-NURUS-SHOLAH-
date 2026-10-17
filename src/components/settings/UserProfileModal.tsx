import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  Upload, 
  Image, 
  CheckCircle2 
} from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { RoleBadge } from '../common/Badge';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = authService.getCurrentUser();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [foto, setFoto] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNamaLengkap(currentUser.nama_lengkap);
      setNamaPanggilan(currentUser.nama_panggilan || '');
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setNomorHp(currentUser.nomor_hp || '');
      setJabatan(currentUser.jabatan || '');
      setFoto(currentUser.foto || '');
      setShowUrlInput(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
    }
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran Foto Terlalu Besar', 'Maksimal ukuran foto adalah 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFoto(reader.result);
        showToast('Foto Dipilih', 'Foto profil berhasil dimuat.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFoto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaLengkap.trim()) {
      showToast('Validasi Gagal', 'Nama lengkap wajib diisi.', 'error');
      return;
    }
    if (!username.trim()) {
      showToast('Validasi Gagal', 'Username wajib diisi.', 'error');
      return;
    }
    if (newPassword) {
      if (newPassword.length < 5) {
        showToast('Validasi Gagal', 'Kata sandi baru minimal 5 karakter.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('Validasi Gagal', 'Konfirmasi kata sandi baru tidak cocok.', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updates: any = {
        nama_lengkap: namaLengkap.trim(),
        nama_panggilan: namaPanggilan.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        nomor_hp: nomorHp.trim(),
        jabatan: jabatan.trim(),
        foto: foto.trim()
      };

      if (newPassword) {
        updates.password_hash = newPassword;
      }

      const updated = await dbService.updateUser(currentUser.id, updates, currentUser);
      if (updated) {
        authService.updateCurrentSessionUser(updated);
        showToast(
          'Profil Berhasil Diperbarui',
          `Nama pengguna otomatis diperbarui menjadi "${updated.nama_lengkap}" di seluruh header, dashboard, dan dokumen.`,
          'success'
        );
        onProfileUpdated();
        onClose();
      }
    } catch (err: any) {
      showToast('Gagal Memperbarui Profil', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Saya"
      subtitle="Kelola identitas akun, foto profil, dan kata sandi Anda"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {/* User avatar header & upload banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-2xl shadow-sm overflow-hidden border-2 border-white ring-2 ring-emerald-600/20">
              {foto ? (
                <img 
                  src={foto} 
                  alt={namaLengkap} 
                  className="w-full h-full object-cover"
                  onError={() => setFoto('')}
                />
              ) : (
                namaLengkap.charAt(0) || 'U'
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-emerald-800 text-white shadow hover:bg-emerald-900 transition-colors"
              title="Ganti Foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base truncate">{namaLengkap || 'Nama Pengguna'}</h3>
              <RoleBadge role={currentUser.role} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">@{username} · {email || '-'}</p>
            <p className="text-[11px] text-emerald-800 font-medium mt-1 truncate">
              {jabatan || 'Staf Pondok Pesantren Nurus Sholah'}
            </p>

            {/* Photo Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-3 h-3 text-emerald-700" />
                <span>Pilih Foto dari HP/Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-medium"
              >
                URL
              </button>

              {foto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-medium flex items-center gap-1"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              )}
            </div>

            {showUrlInput && (
              <div className="mt-2">
                <input
                  type="url"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://example.com/foto.jpg"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              placeholder="Contoh: Ust. H. Ahmad Baihaqi, Lc."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Nama baru akan langsung diperbarui di Header, Dashboard, dan seluruh laporan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Panggilan
            </label>
            <input
              type="text"
              value={namaPanggilan}
              onChange={(e) => setNamaPanggilan(e.target.value)}
              placeholder="Contoh: Baihaqi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username Login <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username login"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@nurusholah.id"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor HP / WhatsApp
            </label>
            <input
              type="text"
              value={nomorHp}
              onChange={(e) => setNomorHp(e.target.value)}
              placeholder="0812xxxxxxxx"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan di Pesantren
            </label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Kepala Tata Usaha, Pembina Asrama Putra..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Change password section */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ganti Kata Sandi (Opsional)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi Baru
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diubah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Kata sandi dienkripsi dengan SHA-256 dan salt kriptografis sebelum disimpan.
          </p>
        </div>

        {/* Submit */}
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
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
