import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Eye, 
  Edit3, 
  KeyRound, 
  Power, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  Sparkles,
  Sliders,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { User, UserRole, RoleDefinition } from '../../types/database';
import { RoleBadge } from '../common/Badge';
import { useToast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { UserFormModal } from './UserFormModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { UserDetailModal } from './UserDetailModal';
import { RolePermissionEditModal } from './RolePermissionEditModal';

interface UsersManagementPageProps {
  onDataChange: () => void;
}

export const UsersManagementPage: React.FC<UsersManagementPageProps> = ({ onDataChange }) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [roleToEditPermissions, setRoleToEditPermissions] = useState<RoleDefinition | null>(null);

  const canViewUsers = authService.hasPermission('users.view');
  const canCreateUser = authService.hasPermission('users.create');
  const canEditUser = authService.hasPermission('users.edit');
  const canDeactivate = authService.hasPermission('users.deactivate');
  const canManagePermissions = authService.hasPermission('users.manage_permissions');

  const users = dbService.getUsers();
  const roles = dbService.getRoles();

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          u.nama_lengkap.toLowerCase().includes(q) ||
          (u.nama_panggilan && u.nama_panggilan.toLowerCase().includes(q)) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.jabatan && u.jabatan.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleToggleStatus = async (user: User) => {
    try {
      const updated = await dbService.toggleUserStatus(user.id, currentUser || undefined);
      if (updated) {
        showToast(
          'Status Diperbarui',
          `Akun ${updated.nama_lengkap} sekarang berstatus "${updated.status.toUpperCase()}".`,
          'info'
        );
        onDataChange();
      }
    } catch (err: any) {
      showToast('Gagal Mengubah Status', err.message || 'Terjadi gangguan.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const ok = await dbService.deleteUser(userToDelete.id, currentUser || undefined);
      if (ok) {
        showToast('Akun Dihapus', `Akun ${userToDelete.nama_lengkap} (@${userToDelete.username}) berhasil dihapus dari sistem.`, 'info');
        setUserToDelete(null);
        onDataChange();
      }
    } catch (err: any) {
      showToast('Gagal Menghapus Akun', err.message || 'Terjadi gangguan.', 'error');
    }
  };

  if (!canViewUsers) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Peran Anda saat ini (<strong className="text-slate-700 capitalize">{authService.getRoleLabel(currentUser?.role || 'admin')}</strong>) 
          tidak memiliki izin untuk melihat modul Manajemen Pengguna (<code>users.view</code>).
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Silakan hubungi Super Admin untuk penyesuaian hak akses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengguna & Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data akun pengguna, nama admin dinamis, hak akses role, dan status aktif
          </p>
        </div>

        {canCreateUser && (
          <button
            onClick={() => {
              setUserToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pengguna</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriks Hak Akses (6 Role)</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama pengguna, username, email, atau jabatan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter role pengguna"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">Semua Role</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="pengasuh">Pengasuh</option>
                <option value="ustadz_guru">Ustadz/Guru</option>
                <option value="wali_kelas">Wali Kelas</option>
                <option value="pengurus">Pengurus</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status pengguna"
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* TABLE USERS: Section 6 Requirements */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Foto</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Username</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Jabatan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada pengguna yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Foto */}
                        <td className="py-3.5 px-4">
                          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-2xs border border-emerald-600/30">
                            {user.foto ? (
                              <img 
                                src={user.foto} 
                                alt={user.nama_lengkap} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            ) : (
                              user.nama_lengkap.charAt(0) || 'U'
                            )}
                          </div>
                        </td>

                        {/* 2. Nama */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{user.nama_lengkap}</span>
                            {user.id === currentUser?.id && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {user.nama_panggilan && (
                              <span>Panggilan: {user.nama_panggilan} · </span>
                            )}
                            <span>{user.email}</span>
                          </div>
                        </td>

                        {/* 3. Username */}
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-medium">
                          @{user.username}
                        </td>

                        {/* 4. Role */}
                        <td className="py-3.5 px-4">
                          <RoleBadge role={user.role} size="sm" />
                        </td>

                        {/* 5. Jabatan */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {user.jabatan || '-'}
                        </td>

                        {/* 6. Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                            user.status === 'aktif' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {user.status === 'aktif' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span className="capitalize">{user.status}</span>
                          </span>
                        </td>

                        {/* 7. Aksi: Lihat, Edit, Atur Hak Akses, Reset Password, Aktifkan/Nonaktifkan, Arsipkan */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Aksi 1: Lihat */}
                            <button
                              onClick={() => setSelectedUserDetail(user)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                              title="Lihat Detail Profil"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Aksi 2: Edit */}
                            {canEditUser && (
                              <button
                                onClick={() => {
                                  setUserToEdit(user);
                                  setIsFormModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                                title="Edit Data Pengguna"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Aksi 3: Atur Hak Akses */}
                            {canManagePermissions && (
                              <button
                                onClick={() => {
                                  const rDef = roles.find(r => r.id === user.role);
                                  if (rDef) setRoleToEditPermissions(rDef);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-slate-100 transition-colors"
                                title={`Atur Hak Akses Role (${user.role})`}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                            )}

                            {/* Aksi 4: Reset Password */}
                            {canEditUser && (
                              <button
                                onClick={() => setUserToResetPassword(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-700 hover:bg-slate-100 transition-colors"
                                title="Reset Kata Sandi"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                            )}

                            {/* Aksi 5: Aktifkan / Nonaktifkan */}
                            {canDeactivate && (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={user.id === currentUser?.id}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  user.status === 'aktif'
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                title={user.status === 'aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}

                            {/* Aksi 6: Arsipkan / Hapus */}
                            {currentUser?.role === 'super_admin' && (
                              <button
                                onClick={() => setUserToDelete(user)}
                                disabled={user.id === currentUser?.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Hapus / Arsipkan Pengguna"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: MATRIKS HAK AKSES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <div 
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <RoleBadge role={r.id} />
                  {canManagePermissions && (
                    <button
                      onClick={() => setRoleToEditPermissions(r)}
                      className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Ubah Izin</span>
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{r.nama}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{r.keterangan}</p>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                  <div className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Cakupan Hak Akses:</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {r.permissions.includes('*') ? 'Semua Modul (Full)' : `${r.permissions.length} Izin Aktif`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-3">
                    {r.permissions.includes('*') ? 'Akses tanpa batas ke seluruh data dan fungsi' : r.permissions.join(', ')}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Pengguna Terdaftar:</span>
                <span className="font-mono font-bold text-slate-700">
                  {users.filter(u => u.role === r.id).length} Akun
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Form Tambah / Edit Pengguna */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
        onSuccess={onDataChange}
      />

      {/* 2. Reset Password Modal */}
      <ResetPasswordModal
        isOpen={!!userToResetPassword}
        onClose={() => setUserToResetPassword(null)}
        user={userToResetPassword}
        onSuccess={onDataChange}
      />

      {/* 3. Detail Pengguna Modal */}
      <UserDetailModal
        isOpen={!!selectedUserDetail}
        onClose={() => setSelectedUserDetail(null)}
        user={selectedUserDetail}
        onEdit={(u) => {
          setSelectedUserDetail(null);
          setUserToEdit(u);
          setIsFormModalOpen(true);
        }}
        onResetPassword={(u) => {
          setSelectedUserDetail(null);
          setUserToResetPassword(u);
        }}
      />

      {/* 4. Role Permission Edit Modal */}
      <RolePermissionEditModal
        isOpen={!!roleToEditPermissions}
        onClose={() => setRoleToEditPermissions(null)}
        role={roleToEditPermissions}
        onSuccess={onDataChange}
      />

      {/* 5. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        title="Hapus / Arsipkan Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun pengguna "${userToDelete?.nama_lengkap}" (@${userToDelete?.username})? Tindakan ini akan dicatat dalam audit log.`}
        confirmText="Ya, Hapus Akun"
        cancelText="Batal"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
