import React, { useState, useEffect } from 'react';
import { RoleDefinition, Permission, UserRole } from '../../types/database';
import { dbService, SYSTEM_PERMISSIONS } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { ShieldCheck, CheckSquare, Square, Save } from 'lucide-react';

interface RolePermissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDefinition | null;
  onSuccess: () => void;
}

export const RolePermissionEditModal: React.FC<RolePermissionEditModalProps> = ({
  isOpen,
  onClose,
  role,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const permissions = SYSTEM_PERMISSIONS;

  useEffect(() => {
    if (role) {
      if (role.permissions.includes('*') || role.permissions.includes('all')) {
        // All permissions selected
        setSelectedPermissions(permissions.map(p => p.id));
      } else {
        setSelectedPermissions([...role.permissions]);
      }
    }
  }, [role, isOpen]);

  if (!role) return null;

  // Group permissions by modul
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach(p => {
    if (!groupedPermissions[p.modul]) {
      groupedPermissions[p.modul] = [];
    }
    groupedPermissions[p.modul].push(p);
  });

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(permissions.map(p => p.id));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If super_admin and selected all, keep ['*']
      let finalPermissions = selectedPermissions;
      if (role.id === 'super_admin' && selectedPermissions.length === permissions.length) {
        finalPermissions = ['*'];
      }

      dbService.updateRolePermissions(role.id, finalPermissions, currentUser || undefined);
      showToast('Hak Akses Diperbarui', `Daftar izin untuk peran ${role.nama} berhasil diperbarui (${finalPermissions.length} izin).`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Memperbarui', err.message || 'Terjadi gangguan.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Atur Hak Akses: ${role.nama}`}
      subtitle={role.keterangan}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
        {/* Quick select/clear */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="text-xs text-slate-500">
            Terpilih: <strong className="text-emerald-700">{selectedPermissions.length}</strong> dari {permissions.length} izin
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Bersihkan
            </button>
          </div>
        </div>

        {/* Permissions Accordion / Grid by Module */}
        <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
          {Object.entries(groupedPermissions).map(([modul, perms]) => (
            <div key={modul} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2 pb-1 border-b border-slate-200 flex items-center justify-between">
                <span>{modul}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {perms.filter(p => selectedPermissions.includes(p.id)).length} / {perms.length} aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perms.map(perm => {
                  const isChecked = selectedPermissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                        isChecked 
                          ? 'bg-white border-emerald-300 text-slate-900 shadow-2xs' 
                          : 'bg-slate-100/60 border-transparent text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 mt-0.5"
                      />
                      <div className="leading-tight">
                        <div className="font-semibold text-xs">{perm.nama}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{perm.deskripsi}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
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
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Matriks Hak Akses</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
