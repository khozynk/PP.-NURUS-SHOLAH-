import React from 'react';
import { StudentStatus, UserRole } from '../../types/database';

interface StatusBadgeProps {
  status: StudentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let label = status;
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'aktif':
      label = 'Santri Aktif';
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'calon_santri':
      label = 'Calon Santri';
      colorStyles = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'lulus':
      label = 'Lulus';
      colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'alumni':
      label = 'Alumni';
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'pindah':
      label = 'Pindah';
      colorStyles = 'bg-orange-50 text-orange-800 border-orange-200';
      break;
    case 'keluar':
      label = 'Keluar';
      colorStyles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'tidak_aktif':
      label = 'Tidak Aktif';
      colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    default:
      label = status;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${sizeClasses} ${colorStyles}`}>
      {label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; size?: 'sm' | 'md' }> = ({ role, size = 'md' }) => {
  let label: string = role;
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (role) {
    case 'super_admin':
      label = 'Super Admin';
      colorStyles = 'bg-purple-50 text-purple-800 border-purple-200';
      break;
    case 'admin':
      label = 'Admin';
      colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'pengasuh':
      label = 'Pengasuh';
      colorStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'ustadz_guru':
      label = 'Ustadz / Guru';
      colorStyles = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'wali_kelas':
      label = 'Wali Kelas';
      colorStyles = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'pengurus':
      label = 'Pengurus';
      colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${sizeClasses} ${colorStyles}`}>
      {label}
    </span>
  );
};
