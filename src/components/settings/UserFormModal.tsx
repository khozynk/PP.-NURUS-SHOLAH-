import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../../types/database';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { 
  UserPlus, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles 
} from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSuccess
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = authService.getCurrentUser();
  const isEditing = !!userToEdit;

  const [namaLengkap, setNamaLengkap] = useState('');
  const [namaPanggilan, setNamaPanggilan] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('admin');
  const [jabatan, setJabatan] = useState('');
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setNamaLengkap(userToEdit.nama_lengkap);
      setNamaPanggilan(userToEdit.nama_panggilan || '');
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setNomorHp(userToEdit.nomor_hp || '');
      setPassword('');
      setShowPassword(false);
      setRole(userToEdit.role);
      setJabatan(userToEdit.jabatan || '');
      setStatus(userToEdit.status);
      setKeterangan(userToEdit.keterangan || '');
      setFoto(userToEdit.foto || '');
      setShowUrlInput(false);
    } else {
      setNamaLengkap('');
      setNamaPanggilan('');
      setUsername('');
      setEmail('');
      setNomorHp('');
      setPassword('pesantren123');
      setShowPassword(false);
      setRole('ustadz_guru');
      setJabatan('');
      setStatus('aktif');
      setKeterangan('');
      setFoto('');
      setShowUrlInput(false);
    }
  }, [userToEdit, isOpen]);

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
      showToast('Validasi Gagal', 'Username login wajib diisi.', 'error');
      return;
    }
    if (!isEditing && !password) {
      showToast('Validasi Gagal', 'Kata sandi wajib diisi untuk pengguna baru.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && userToEdit) {
        const updates: Partial<User> = {
          nama_lengkap: namaLengkap.trim(),
          nama_panggilan: namaPanggilan.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase() || `${username.trim().toLowerCase()}@nurusholah.id`,
          nomor_hp: nomorHp.trim(),
          role,
          jabatan: jabatan.trim(),
          status,
          keterangan: keterangan.trim(),
          foto: foto.trim()
        };

        if (password.trim()) {
          updates.password_hash = password.trim();
        }

        const updated = await dbService.updateUser(userToEdit.id, updates, currentUser || undefined);
        if (updated) {
          // If updated self, sync session
          if (currentUser?.id === userToEdit.id) {
            authService.updateCurrentSessionUser(updated);
          }
          showToast(
            'Pengguna Diperbarui', 
            `Data pengguna "${updated.nama_lengkap}" berhasil diperbarui.`, 
            'success'
          );
        }
      } else {
        await dbService.createUser({
          nama_lengkap: namaLengkap.trim(),
          nama_panggilan: namaPanggilan.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase() || `${username.trim().toLowerCase()}@nurusholah.id`,
          nomor_hp: nomorHp.trim(),
          password_hash: password.trim(),
          role,
          jabatan: jabatan.trim(),
          status,
          keterangan: keterangan.trim(),
          foto: foto.trim()
        }, currentUser || undefined);

        showToast(
          'Pengguna Baru Terdaftar', 
          `Pengguna "${namaLengkap}" (@${username.trim().toLowerCase()}) berhasil ditambahkan dan dapat langsung login.`, 
          'success'
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Menyimpan', err.message || 'Terjadi gangguan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
      subtitle="PP Nurus Sholah Batulabang Akkor Palengaan"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {/* Photo Upload & Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-4">
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
              title="Unggah Foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <span className="text-xs font-bold text-slate-800 block">Foto Profil Pengguna</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pilih foto profil dari galeri HP, upload file gambar, atau masukkan tautan URL foto.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
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
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-3 h-3 text-emerald-700" />
                <span>Pilih Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-[11px] font-medium"
              >
                Tautan URL
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Inputs Grid */}
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
              placeholder="baihaqi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Pengguna
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="baihaqi@nurusholah.id"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role / Tingkatan Akses <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            >
              <option value="super_admin">SUPER ADMIN (Akses Penuh)</option>
              <option value="admin">ADMIN (Tata Usaha & Data)</option>
              <option value="pengasuh">PENGASUH (Monitoring Laporan)</option>
              <option value="ustadz_guru">USTADZ/GURU (Pengajar)</option>
              <option value="wali_kelas">WALI KELAS (Bimbingan Kelas)</option>
              <option value="pengurus">PENGURUS (Ketertiban Asrama)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Akun <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            >
              <option value="aktif">Aktif (Dapat Login)</option>
              <option value="nonaktif">Nonaktif (Akses Diblokir)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jabatan Resmi di Pesantren
            </label>
            <input
              type="text"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Contoh: Kepala Asrama Putra, Pengajar Kitab Fiqih..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {isEditing ? 'Kata Sandi Baru (Kosongkan bila tidak diubah)' : 'Kata Sandi Awal *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? '••••••••' : 'Minimal 5 karakter'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Kata sandi dienkripsi dengan SHA-256 + salt sebelum disimpan ke database.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan penugasan, nomor SK, atau catatan khusus..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800"
            />
          </div>
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
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Daftarkan Pengguna')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
