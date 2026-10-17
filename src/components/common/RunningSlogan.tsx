import React, { useState } from 'react';
import { 
  Sparkles, 
  Edit3, 
  Megaphone, 
  Check, 
  X, 
  RotateCcw, 
  Sliders, 
  Eye, 
  EyeOff, 
  Volume2
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { useToast } from './Toast';
import { Modal } from './Modal';

interface RunningSloganProps {
  onDataChange?: () => void;
  className?: string;
}

const PRESET_SLOGANS = [
  {
    label: 'Motto Pesantren',
    text: '✨ Selamat Datang di Sistem Informasi PP Nurus Sholah Batulabang Akkor · Menempa Generasi Santri Berakhlaqul Karimah, Unggul dalam Tahfidz Al-Qur\'an dan Kitab Salaf · Berilmu Amaliah, Beramal Ilmiah'
  },
  {
    label: 'Tahfidz & Kitabiyah',
    text: '📖 Menghidupkan Tradisi Salafus Shalih Melalui Kajian Kitab Kuning & Menjaga Hafalan Al-Qur\'an 30 Juz Bersanad · Santri Mandiri, Berprestasi, dan Berkah'
  },
  {
    label: 'Penerimaan Santri Baru',
    text: '📢 Informasi PSB: Pendaftaran Santri Baru Tahun Ajaran Aktif Telah Dibuka · Silakan Hubungi Sekretariat Panitia di Kantor Pengurus PP Nurus Sholah Batulabang'
  },
  {
    label: 'Kata Mutiara Islami',
    text: '🌟 "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga" (HR. Muslim) · PP Nurus Sholah Batulabang Akkor'
  }
];

export const RunningSlogan: React.FC<RunningSloganProps> = ({
  onDataChange,
  className = ''
}) => {
  const { showToast } = useToast();
  const settings = dbService.getSettings();
  const currentUser = authService.getCurrentUser();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sloganText, setSloganText] = useState(settings.slogan_berjalan || '');
  const [isActive, setIsActive] = useState(settings.slogan_aktif ?? true);
  const [speed, setSpeed] = useState<'lambat' | 'sedang' | 'cepat'>(settings.slogan_kecepatan || 'sedang');
  const [isSaving, setIsSaving] = useState(false);

  // Duration in seconds depending on speed
  const durationMap = {
    cepat: '16s',
    sedang: '26s',
    lambat: '40s'
  };
  const duration = durationMap[settings.slogan_kecepatan || 'sedang'];

  const handleOpenModal = () => {
    setSloganText(settings.slogan_berjalan || '');
    setIsActive(settings.slogan_aktif ?? true);
    setSpeed(settings.slogan_kecepatan || 'sedang');
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sloganText.trim()) {
      showToast('Teks Slogan Kosong', 'Mohon isi teks slogan berjalan.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      dbService.updateSettings({
        slogan_berjalan: sloganText.trim(),
        slogan_aktif: isActive,
        slogan_kecepatan: speed
      }, currentUser || undefined);

      showToast('Slogan Berhasil Disimpan', 'Teks slogan berjalan pesantren telah diperbarui.', 'success');
      setIsEditModalOpen(false);
      if (onDataChange) onDataChange();
    } catch (err: any) {
      showToast('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan pengaturan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (text: string) => {
    setSloganText(text);
  };

  // If slogan is inactive, show a subtle pill that can be clicked to re-enable
  if (!settings.slogan_aktif) {
    return (
      <>
        <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-500 ${className}`}>
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span className="italic text-[11px]">Slogan berjalan dinonaktifkan</span>
          </div>
          <button
            onClick={handleOpenModal}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer hover:underline"
          >
            <Edit3 className="w-3 h-3" />
            <span>Aktifkan & Edit</span>
          </button>
        </div>

        {/* Modal */}
        {renderEditModal()}
      </>
    );
  }

  return (
    <>
      {/* 3D Running Slogan Ticker Ribbon */}
      <div 
        className={`group group-marquee relative flex items-center gap-2.5 sm:gap-3 px-2 sm:px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_6px_18px_-4px_rgba(15,23,42,0.06),inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-2px_0_rgba(226,232,240,0.6)] overflow-hidden w-full max-w-full min-w-0 ${className}`}
      >
        {/* Left 3D Emblem Badge */}
        <div className="flex items-center gap-1.5 shrink-0 z-20">
          <div className="badge-3d bg-gradient-to-r from-emerald-700 to-teal-800 text-white text-[11px] font-bold uppercase tracking-wide border border-emerald-600 shadow-[0_2px_4px_rgba(4,120,87,0.3)]">
            <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">SLOGAN</span>
          </div>
        </div>

        {/* Running Marquee Text Area */}
        <div 
          className="relative flex-1 min-w-0 max-w-full overflow-hidden select-none"
          title="Arahkan mouse untuk menjeda teks berjalan"
        >
          {/* Subtle gradient edges for fading effect */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />

          <div 
            className="animate-marquee flex items-center gap-12 text-xs sm:text-sm font-medium text-slate-800 tracking-wide whitespace-nowrap cursor-default py-0.5"
            style={{ '--marquee-duration': duration } as React.CSSProperties}
          >
            {/* Block 1 */}
            <span className="flex items-center gap-3">
              {settings.slogan_berjalan || 'Selamat Datang di Sistem Informasi PP Nurus Sholah Batulabang Akkor'}
            </span>
            <span className="text-emerald-500 font-bold">✦</span>

            {/* Block 2 (Duplicate for continuous loop) */}
            <span className="flex items-center gap-3">
              {settings.slogan_berjalan || 'Selamat Datang di Sistem Informasi PP Nurus Sholah Batulabang Akkor'}
            </span>
            <span className="text-emerald-500 font-bold">✦</span>
          </div>
        </div>

        {/* Right Quick Action: Edit Button */}
        <div className="shrink-0 z-20 flex items-center gap-1">
          <button
            onClick={handleOpenModal}
            className="btn-3d btn-3d-white p-1.5 sm:px-2.5 sm:py-1 text-xs gap-1 text-slate-700 hover:text-emerald-700 transition-all shadow-xs"
            title="Edit kata slogan berjalan"
            aria-label="Edit kata slogan berjalan"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-bold text-[11px]">Ubah Slogan</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {renderEditModal()}
    </>
  );

  function renderEditModal() {
    return (
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Slogan & Teks Berjalan"
        subtitle="Sesuaikan teks berjalan yang tampil di bagian atas aplikasi"
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Status Active Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl text-white ${isActive ? 'bg-emerald-600 shadow-xs' : 'bg-slate-400'}`}>
                {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Status Slogan Berjalan</div>
                <div className="text-[11px] text-slate-500">
                  {isActive ? 'Aktif dan ditampilkan kepada seluruh pengguna' : 'Disembunyikan sementara'}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Slogan Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Teks Slogan / Pengumuman Berjalan
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {sloganText.length} karakter
              </span>
            </div>
            <textarea
              value={sloganText}
              onChange={(e) => setSloganText(e.target.value)}
              rows={3}
              placeholder="Tuliskan slogan, visi pesantren, hadits, atau pengumuman penting di sini..."
              className="input-3d w-full p-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Gunakan Rekomendasi Contoh Cepat:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_SLOGANS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset.text)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 flex items-center justify-between">
                    <span>{preset.label}</span>
                    <span className="text-[10px] text-emerald-600 opacity-0 group-hover:opacity-100 font-semibold transition-opacity">Pilih</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kecepatan Teks Berjalan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lambat', label: 'Lambat (40s)', desc: 'Nyaman dibaca' },
                { id: 'sedang', label: 'Sedang (26s)', desc: 'Kecepatan normal' },
                { id: 'cepat', label: 'Cepat (16s)', desc: 'Dinamis' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSpeed(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    speed === opt.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-[0_2px_0_0_#059669]'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-2xl bg-slate-900 text-white overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              <span>Pratinjau Langsung (Live Preview 3D)</span>
              <span className="text-emerald-400">Kecepatan: {speed}</span>
            </div>
            <div className="relative overflow-hidden py-1">
              <div 
                className="animate-marquee flex items-center gap-10 text-xs text-emerald-200 whitespace-nowrap"
                style={{ '--marquee-duration': durationMap[speed] } as React.CSSProperties}
              >
                <span>{sloganText || 'Teks slogan Anda akan berjalan di sini...'}</span>
                <span className="text-amber-400">✦</span>
                <span>{sloganText || 'Teks slogan Anda akan berjalan di sini...'}</span>
                <span className="text-amber-400">✦</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-3d btn-3d-white px-4 py-2 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-3d btn-3d-emerald px-5 py-2 text-xs gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Slogan'}</span>
            </button>
          </div>
        </form>
      </Modal>
    );
  }
};
