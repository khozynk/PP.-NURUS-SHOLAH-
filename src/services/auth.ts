import { User, UserRole } from '../types/database';
import { dbService, INITIAL_USERS } from './db';
import { verifyPassword } from './crypto';

const SESSION_STORAGE_KEY = 'PP_NURUS_SHOLAH_SESSION_V1';

export interface AuthSession {
  user: User;
  token: string;
  rememberMe: boolean;
  loginAt: string;
}

class AuthService {
  private currentSession: AuthSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session: AuthSession = JSON.parse(raw);
        if (session && session.user) {
          // Sync user with latest DB user data so name edits immediately reflect!
          const dbUsers = dbService.getUsers();
          const freshUser = dbUsers.find(u => u.id === session.user.id);
          if (freshUser) {
            this.currentSession = {
              ...session,
              user: freshUser
            };
          } else {
            this.currentSession = session;
          }
        }
      }
    } catch (e) {
      console.warn('Gagal memulihkan sesi pengguna:', e);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentUser(): User | null {
    if (!this.currentSession) return null;
    // Always return freshest user data from database by ID
    const fresh = dbService.getUserById(this.currentSession.user.id);
    if (fresh) {
      this.currentSession.user = fresh;
      return fresh;
    }
    return this.currentSession.user;
  }

  public updateCurrentSessionUser(user: User): void {
    if (this.currentSession) {
      this.currentSession.user = user;
      const storage = this.currentSession.rememberMe ? localStorage : sessionStorage;
      storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    }
  }

  public refreshCurrentUser(): User | null {
    return this.getCurrentUser();
  }

  public isAuthenticated(): boolean {
    return !!this.currentSession;
  }

  public async login(
    identifier: string, // email or username
    password: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; message: string; user?: User }> {
    // Realistic short async response for UI smoothness
    await new Promise(resolve => setTimeout(resolve, 450));

    const cleanId = identifier.trim().toLowerCase();
    const dbUsers = dbService.getUsers();

    const user = dbUsers.find(u => 
      u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        message: 'Email atau username tidak ditemukan di sistem.'
      };
    }

    if (user.status !== 'aktif') {
      return {
        success: false,
        message: 'Akun Anda berstatus nonaktif. Silakan hubungi Super Admin untuk mengaktifkan kembali.'
      };
    }

    // Verify secure password hash (or backward compatible seeded hash)
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Kata sandi tidak sesuai. Silakan periksa kembali.'
      };
    }

    const session: AuthSession = {
      user,
      token: 'sess_' + Math.random().toString(36).substring(2) + Date.now(),
      rememberMe,
      loginAt: new Date().toISOString()
    };

    this.currentSession = session;
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    // Record login in audit log
    dbService.addAuditLog({
      user_id: user.id,
      user_name: user.nama_lengkap,
      user_role: this.getRoleLabel(user.role),
      aktivitas: 'Login',
      modul: 'Autentikasi',
      data_terkait: `Pengguna ${user.nama_lengkap} (@${user.username}) berhasil login sebagai ${this.getRoleLabel(user.role)}`,
      ip_device: '127.0.0.1 (Web Browser)',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    });

    return {
      success: true,
      message: `Selamat datang kembali, ${user.nama_lengkap}!`,
      user
    };
  }

  public logout(): void {
    if (this.currentSession) {
      const user = this.currentSession.user;
      dbService.addAuditLog({
        user_id: user.id,
        user_name: user.nama_lengkap,
        user_role: this.getRoleLabel(user.role),
        aktivitas: 'Logout',
        modul: 'Autentikasi',
        data_terkait: `Pengguna ${user.nama_lengkap} (@${user.username}) keluar dari sistem`,
        ip_device: '127.0.0.1 (Web Browser)',
        waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
      });
    }

    this.currentSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'pengasuh': return 'Pengasuh';
      case 'ustadz_guru': return 'Ustadz / Guru';
      case 'wali_kelas': return 'Wali Kelas';
      case 'pengurus': return 'Pengurus';
      default: return role;
    }
  }

  public hasPermission(permissionKey: string): boolean {
    if (!this.currentSession) return false;
    const user = this.getCurrentUser();
    return dbService.canUserPerform(user, permissionKey);
  }

  public getDemoAccounts(): User[] {
    return dbService.getUsers();
  }
}

export const authService = new AuthService();

