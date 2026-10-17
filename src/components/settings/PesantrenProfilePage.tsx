import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Save, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  User, 
  Palette, 
  FileText, 
  Camera, 
  Upload, 
  Trash2, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { useToast } from '../common/Toast';
import { PesantrenSettings } from '../../types/database';

const DEFAULT_LOGO_FALLBACK = '/src/assets/images/pesantren_logo_emblem_1791353751288.jpg';

interface PesantrenProfilePageProps {
  onDataChange?: () => void;
}

export const PesantrenProfilePage: React.FC<PesantrenProfilePageProps> = ({ onDataChange }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = authService.getCurrentUser();
  const currentSettings = dbService.getSettings();

  const [form, setForm] = useState<PesantrenSettings>({ ...currentSettings });
  const [showLogoUrl, setShowLogoUrl] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canEditSettings = authService.hasPermission('settings.edit');

  const handleChange = (field: keyof PesantrenSettings, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran File Terlalu Besar', 'Maksimal ukuran logo adalah 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange('logo', reader.result);
        showToast('Logo Dipilih', 'Pratinjau logo pesantren berhasil dimuat.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultLogo = () => {
    handleChange('logo', DEFAULT_LOGO_FALLBACK);
    showToast('Logo Direset', 'Logo pesantren dikembalikan ke emblem resmi awal.', 'info');
  };

  const handleGenerateStandardKop = () => {
    const nama = form.nama_pesantren.toUpperCase();
    const dusunDesa = [form.dusun ? `Dusun ${form.dusun}` : '', form.desa ? `Desa ${form.desa}` : ''].filter(Boolean).join(', ');
    const kecKab = [form.kecamatan ? `Kec. ${form.kecamatan}` : '', form.kabupaten ? `Kab. ${form.kabupaten}` : ''].filter(Boolean).join(', ');
    const wilayah = [dusunDesa, kecKab, form.provinsi, form.kode_pos].filter(Boolean).join(' ');

    const newKop = `${nama}\n${form.dusun || 'BATULABANG'} ${form.desa || 'AKKOR'} ${form.kecamatan ? form.kecamatan.toUpperCase() : 'PALENGAAN'} ${form.kabupaten ? form.kabupaten.toUpperCase() : 'PAMEKASAN'}\nSekretariat: ${form.alamat || 'Jl. Pesantren Batulabang'}, ${wilayah}\nTelepon: ${form.telepon || '-'} | Email: ${form.email || '-'} | Website: ${form.website || '-'}`;
    
    handleChange('kop_surat', newKop);
    showToast('Kop Surat Dibuat', 'Format kop surat resmi otomatis disusun dari data alamat.', 'info');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEditSettings) {
      showToast('Akses Dibatasi', 'Anda tidak memiliki hak akses untuk mengubah profil pesantren (settings.edit).', 'error');
      return;
    }

    if (!form.nama_pesantren.trim()) {
      showToast('Validasi Gagal', 'Nama lengkap pesantren wajib diisi.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      dbService.updateSettings(form, currentUser || undefined);
      showToast('Profil Pesantren Disimpan', 'Identitas, logo, alamat, dan kop surat berhasil diperbarui di seluruh aplikasi.', 'success');
      if (onDataChange) {
        onDataChange();
      }
    } catch (err: any) {
      showToast('Gagal Menyimpan', err.message || 'Gagal menyimpan pengaturan profil pesantren.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Profil & Identitas Pesantren
            </h1>
            {!canEditSettings && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Hanya Baca</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola nama lembaga, logo resmi, nama pengasuh, alamat wilayah, kontak, dan kop surat resmi
          </p>
        </div>

        {canEditSettings && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* CARD 1: Logo & Identitas Lembaga */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>Logo Resmi & Identitas Lembaga</span>
          </div>

          {/* Logo Editor Panel */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200 flex flex-col md:flex-row items-center md:items-start gap-5">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-sm overflow-hidden border-2 border-emerald-300 ring-4 ring-emerald-50 flex items-center justify-center p-1.5">
                {form.logo ? (
                  <img 
                    src={form.logo} 
                    alt="Logo Pesantren" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-emerald-700" />
                )}
              </div>

              {canEditSettings && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-800 text-white shadow hover:bg-emerald-900 transition-colors"
                  title="Ganti Logo Pesantren"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-base">
                  {form.nama_pesantren || 'Pondok Pesantren Nurus Sholah'}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  {form.nama_singkat || 'PP Nurus Sholah'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Logo ini akan otomatis digunakan pada Header aplikasi, Sidebar navigasi, halaman Login, lembar Laporan, dan berkas kop surat resmi.
              </p>

              {canEditSettings && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 flex-wrap">
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
                    className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload Logo dari HP/Laptop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLogoUrl(!showLogoUrl)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Input URL
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefaultLogo}
                    className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1"
                    title="Kembalikan logo default"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Default</span>
                  </button>
                </div>
              )}

              {showLogoUrl && canEditSettings && (
                <div className="mt-2.5 max-w-md">
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => handleChange('logo', e.target.value)}
                    placeholder="https://example.com/logo-pesantren.png"
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Lembaga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap Pesantren <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!canEditSettings}
                value={form.nama_pesantren}
                onChange={(e) => handleChange('nama_pesantren', e.target.value)}
                placeholder="Contoh: Pondok Pesantren Nurus Sholah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Singkat / Brand Populer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!canEditSettings}
                value={form.nama_singkat}
                onChange={(e) => handleChange('nama_singkat', e.target.value)}
                placeholder="Contoh: PP Nurus Sholah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Kepengasuhan & Pimpinan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
            <User className="w-4 h-4 text-emerald-700" />
            <span>Kepengasuhan & Pimpinan Pesantren</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pengasuh Pondok Pesantren
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.nama_pengasuh || ''}
                onChange={(e) => handleChange('nama_pengasuh', e.target.value)}
                placeholder="Contoh: KH. Muhammad Syamsul Arifin, S.Ag."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dicantumkan pada pengesahan laporan resmi, sertifikat, dan syahadah santri.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pimpinan / Direktur Operasional
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.nama_pimpinan || ''}
                onChange={(e) => handleChange('nama_pimpinan', e.target.value)}
                placeholder="Contoh: KH. Muhammad Syamsul Arifin, S.Ag."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kepala Bagian Pendidikan & Madrasah
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.kepala_pendidikan || ''}
                onChange={(e) => handleChange('kepala_pendidikan' as any, e.target.value)}
                placeholder="Contoh: Ust. Ahmad Baihaqi, M.Pd."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP / Identitas Kepala Pendidikan
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.nip_kepala_pendidikan || ''}
                onChange={(e) => handleChange('nip_kepala_pendidikan' as any, e.target.value)}
                placeholder="Contoh: NIP. 19850312 201101 1 004"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kepala Bagian Administrasi & Tata Usaha (Sekretaris)
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.kepala_tu || ''}
                onChange={(e) => handleChange('kepala_tu' as any, e.target.value)}
                placeholder="Contoh: Ust. Moh. Kholilur Rahman, S.Kom."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jabatan / NIP Kepala TU
              </label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.nip_kepala_tu || ''}
                onChange={(e) => handleChange('nip_kepala_tu' as any, e.target.value)}
                placeholder="Contoh: Sekretaris Jenderal Pesantren"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* CARD 2B: Master Data Jenis Rapat & Dokumen Santri */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Master Data Jenis Rapat & Dokumen Santri (Dapat Dikelola Admin)</span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Daftar Jenis Rapat Resmi Pesantren
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[44px]">
                {(form.meeting_types || [
                  'Rapat Bulanan',
                  'Rapat Pengurus',
                  'Rapat Pengasuh',
                  'Rapat Guru/Ustadz',
                  'Rapat Evaluasi',
                  'Rapat Akademik',
                  'Rapat Santri',
                  'Rapat Keuangan',
                  'Rapat Kegiatan',
                  'Rapat Khusus',
                  'Lainnya'
                ]).map((t, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <span>{t}</span>
                    {canEditSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          const list = form.meeting_types || [
                            'Rapat Bulanan', 'Rapat Pengurus', 'Rapat Pengasuh', 'Rapat Guru/Ustadz',
                            'Rapat Evaluasi', 'Rapat Akademik', 'Rapat Santri', 'Rapat Keuangan', 'Rapat Kegiatan', 'Rapat Khusus', 'Lainnya'
                          ];
                          setForm(prev => ({ ...prev, meeting_types: list.filter((_, i) => i !== idx) }));
                        }}
                        className="text-emerald-700 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Admin dapat menambah atau mengurangi jenis rapat yang muncul pada modul Agenda Rapat Bulanan.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Daftar Jenis Dokumen Persyaratan Santri
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 min-h-[44px]">
                {(form.document_types || [
                  'Kartu Keluarga (KK)',
                  'Akta Kelahiran',
                  'Ijazah Terakhir',
                  'KTP Orang Tua / Wali',
                  'Pas Foto 3x4',
                  'Surat Pernyataan Santri',
                  'Surat Keterangan Sehat',
                  'Kartu NISN / KIP',
                  'Dokumen Lainnya'
                ]).map((d, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
                    <span>{d}</span>
                    {canEditSettings && (
                      <button
                        type="button"
                        onClick={() => {
                          const list = form.document_types || [
                            'Kartu Keluarga (KK)', 'Akta Kelahiran', 'Ijazah Terakhir', 'KTP Orang Tua / Wali',
                            'Pas Foto 3x4', 'Surat Pernyataan Santri', 'Surat Keterangan Sehat', 'Kartu NISN / KIP', 'Dokumen Lainnya'
                          ];
                          setForm(prev => ({ ...prev, document_types: list.filter((_, i) => i !== idx) }));
                        }}
                        className="text-blue-700 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Alamat & Wilayah */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Alamat Wilayah & Peta Lokasi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Jalan</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                placeholder="Contoh: Jl. Pesantren Batulabang"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dusun</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.dusun}
                onChange={(e) => handleChange('dusun', e.target.value)}
                placeholder="Batulabang"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Desa</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.desa}
                onChange={(e) => handleChange('desa', e.target.value)}
                placeholder="Akkor"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.kecamatan}
                onChange={(e) => handleChange('kecamatan', e.target.value)}
                placeholder="Palengaan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kabupaten</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.kabupaten}
                onChange={(e) => handleChange('kabupaten', e.target.value)}
                placeholder="Pamekasan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.provinsi}
                onChange={(e) => handleChange('provinsi', e.target.value)}
                placeholder="Jawa Timur"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.kode_pos}
                onChange={(e) => handleChange('kode_pos', e.target.value)}
                placeholder="69362"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">Tautan Google Maps</label>
                {form.google_maps && (
                  <a 
                    href={form.google_maps} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Buka Titik Peta</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                disabled={!canEditSettings}
                value={form.google_maps}
                onChange={(e) => handleChange('google_maps', e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Kontak & Komunikasi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-800">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Kontak & Portal Digital Pesantren</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telepon / WhatsApp</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.telepon}
                onChange={(e) => handleChange('telepon', e.target.value)}
                placeholder="+62 823-xxxx-xxxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none font-mono text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                disabled={!canEditSettings}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@nurusholah.id"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website Resmi</label>
              <input
                type="text"
                disabled={!canEditSettings}
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://nurusholah.id"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* CARD 5: Format Kop Surat Resmi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Kop Surat & Administrasi Cetak</span>
            </div>

            {canEditSettings && (
              <button
                type="button"
                onClick={handleGenerateStandardKop}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Susun Kop Otomatis dari Alamat</span>
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teks Kop Surat Resmi (Digunakan untuk cetak surat, rapor & surat mutasi)
              </label>
              <textarea
                rows={4}
                disabled={!canEditSettings}
                value={form.kop_surat}
                onChange={(e) => handleChange('kop_surat', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 outline-none text-slate-800 disabled:bg-slate-50"
              />
            </div>

            {/* Live Preview Kop Surat Resmi */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
              <div className="text-[10px] uppercase font-bold text-slate-400 text-center mb-3 tracking-wider">
                Pratinjau Kop Surat Resmi
              </div>

              <div className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 max-w-2xl mx-auto flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center p-1 border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  {form.logo ? (
                    <img 
                      src={form.logo} 
                      alt="Logo" 
                      className="w-full h-full object-contain" 
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-emerald-700" />
                  )}
                </div>

                <div className="flex-1 text-center border-l border-slate-100 pl-3">
                  <pre className="font-serif text-xs text-slate-900 whitespace-pre-line leading-snug font-bold">
                    {form.kop_surat || 'Kop Surat Belum Diatur'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        {canEditSettings && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
