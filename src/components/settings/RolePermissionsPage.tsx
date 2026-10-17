import React from 'react';
import { ShieldCheck, Check, Lock, Info } from 'lucide-react';
import { dbService } from '../../services/db';
import { RoleBadge } from '../common/Badge';

export const RolePermissionsPage: React.FC = () => {
  const roles = dbService.getRoles();
  const permissions = dbService.getPermissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Hak Akses & Otorisasi Sistem (Role & Permissions)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Fondasi sistem otorisasi Role-Based Access Control (RBAC) siap diperluas pada tahap pengembangan berikutnya
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Sistem telah mengonfigurasi <strong>6 peran pengguna resmi</strong>: Super Admin, Admin, Pengasuh, Ustadz/Guru, Wali Kelas, dan Pengurus. Seluruh pembatasan akses modul terhubung ke token sesi aktif.
        </p>
      </div>

      {/* Grid of 6 Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div 
            key={role.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <RoleBadge role={role.id} />
                <span className="font-mono text-[10px] text-slate-400">ID: {role.id}</span>
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-1">{role.nama}</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {role.keterangan}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Hak Akses Terdaftar:
                </span>
                {role.permissions.includes('all') ? (
                  <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold bg-purple-50 p-2 rounded-lg">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Akses Penuh Seluruh Modul (Unrestricted)</span>
                  </div>
                ) : (
                  role.permissions.map((pKey) => {
                    const perm = permissions.find(p => p.id === pKey);
                    return (
                      <div key={pKey} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{perm ? perm.nama : pKey}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Status Otorisasi: Aktif & Terlindungi</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
