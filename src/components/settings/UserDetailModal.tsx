import React from 'react';
import { User as UserIcon, ShieldCheck, Mail, Phone, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '../../types/database';
import { dbService } from '../../services/db';
import { Modal } from '../common/Modal';
import { RoleBadge } from '../common/Badge';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onResetPassword
}) => {
  if (!user) return null;

  const roles = dbService.getRoles();
  const roleDef = roles.find(r => r.id === user.role);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Pengguna Sistem"
      subtitle={`${user.nama_lengkap} (@${user.username})`}
      maxWidth="md"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xl shadow-xs overflow-hidden shrink-0">
            {user.foto ? (
              <img src={user.foto} alt={user.nama_lengkap} className="w-full h-full object-cover" />
            ) : (
              user.nama_lengkap.charAt(0)
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{user.nama_lengkap}</h3>
            <div className="text-xs text-slate-500 font-mono">@{user.username}</div>
            <div className="mt-1 flex items-center gap-2">
              <RoleBadge role={user.role} size="sm" />
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                user.status === 'aktif' ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {user.status === 'aktif' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span className="capitalize">{user.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] text-slate-400 block">Nama Panggilan</span>
            <span className="font-semibold text-slate-800">{user.nama_panggilan || '-'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Jabatan di Pesantren</span>
            <span className="font-semibold text-slate-800">{user.jabatan || '-'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Email Resmi</span>
            <span className="font-semibold text-slate-800">{user.email}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">No. HP / WhatsApp</span>
            <span className="font-semibold text-slate-800 font-mono">{user.nomor_hp || '-'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Tanggal Terdaftar</span>
            <span className="text-slate-700">{new Date(user.created_at).toLocaleDateString('id-ID')}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">Terakhir Diperbarui</span>
            <span className="text-slate-700">{new Date(user.updated_at).toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        {/* Role & Permissions Brief */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-slate-800">Kapasitas Peran: {roleDef?.nama}</span>
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">
              {roleDef?.permissions.includes('*') ? 'Akses Penuh (All)' : `${roleDef?.permissions.length} Hak Akses`}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {roleDef?.keterangan}
          </p>
        </div>

        {user.keterangan && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Keterangan:</span>
            <p className="text-slate-700">{user.keterangan}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              Edit Data
            </button>
            <button
              onClick={() => {
                onClose();
                onResetPassword(user);
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold"
            >
              Reset Password
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
