import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Sparkles, 
  LogIn, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { UserRole } from '../../types/database';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('superadmin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const settings = dbService.getSettings();
  const demoAccounts = authService.getDemoAccounts();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Mohon masukkan email atau username Anda.');
      return;
    }
    if (!password) {
      setErrorMessage('Mohon masukkan kata sandi.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.login(identifier, password, rememberMe);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          onLoginSuccess();
        }, 350);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage('Terjadi gangguan saat memproses login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const DEMO_PASSWORDS: Record<UserRole, string> = {
    super_admin: 'admin123',
    admin: 'admin123',
    pengasuh: 'pengasuh123',
    ustadz_guru: 'ustadz123',
    wali_kelas: 'wali123',
    pengurus: 'pengurus123'
  };

  const handleSelectDemoAccount = (roleId: UserRole) => {
    const acc = demoAccounts.find(a => a.role === roleId);
    if (acc) {
      setIdentifier(acc.username);
      // If password_hash is not hashed, use it; otherwise use the demo password
      const pass = acc.password_hash.startsWith('sha256:') 
        ? DEMO_PASSWORDS[roleId] 
        : acc.password_hash;
      setPassword(pass);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden relative z-10 border border-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_10px_20px_rgba(0,0,0,0.15),inset_0_1.5px_0_#fff]">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white p-6 sm:p-8 text-center relative border-b border-emerald-900 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-white/10 p-1 mb-3 shadow-[0_6px_14px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] border border-white/20 transform hover:scale-105 transition-transform">
            <img 
              src={settings.logo} 
              alt="Logo PP Nurus Sholah" 
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Sistem Data Santri
          </h1>
          <p className="text-emerald-200 text-xs sm:text-sm mt-1">
            PP Nurus Sholah Batulabang Akkor
          </p>
          <div className="mt-3 badge-3d bg-emerald-900/80 border border-emerald-400/30 text-emerald-200 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Fondasi v1.0 · Autentikasi RBAC</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Status feedback */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm animate-in fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email atau Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="superadmin atau email"
                  autoComplete="username"
                  className="input-3d w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-3d w-full pl-10 pr-11 py-2.5 text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-slate-300"
                />
                <span>Ingat saya (Remember Me)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-3d btn-3d-emerald w-full py-3 px-4 text-sm gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher - Section A: 6 Roles */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pilih Cepat Akun Demo (6 Role)</span>
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200">1-Klik</span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              Klik salah satu peran di bawah untuk menguji sistem permission dan interface:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { role: 'super_admin' as UserRole, label: 'Super Admin', pass: 'admin123' },
                { role: 'admin' as UserRole, label: 'Admin', pass: 'admin123' },
                { role: 'pengasuh' as UserRole, label: 'Pengasuh', pass: 'pengasuh123' },
                { role: 'ustadz_guru' as UserRole, label: 'Ustadz/Guru', pass: 'ustadz123' },
                { role: 'wali_kelas' as UserRole, label: 'Wali Kelas', pass: 'wali123' },
                { role: 'pengurus' as UserRole, label: 'Pengurus', pass: 'pengurus123' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectDemoAccount(item.role)}
                  className={`text-left p-2 rounded-xl border text-[11px] transition-all flex flex-col justify-between ${
                    identifier === item.role.replace('_', '') || identifier === item.role
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-[0_2px_0_0_#059669,0_3px_6px_rgba(5,150,105,0.15)] -translate-y-0.5'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 shadow-[0_1.5px_0_0_#cbd5e1] hover:-translate-y-0.5'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <span className="text-[9px] text-slate-600 font-mono mt-0.5">{item.pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 text-center text-[11px] text-slate-500">
          PP Nurus Sholah Batulabang · Akkor, Palengaan, Pamekasan
        </div>
      </div>

      {/* Safety note */}
      <p className="text-slate-400 text-xs mt-6 text-center max-w-sm">
        Sistem Manajemen Data Santri terenkripsi dan terlindungi otorisasi bertingkat.
      </p>
    </div>
  );
};
