import React, { useState } from 'react';
import { 
  Hash, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw,
  Sliders,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';
import { dbService } from '../../services/db';
import { LetterNumberConfig } from '../../types/database';

export const LetterNumberConfigPage: React.FC = () => {
  const [config, setConfig] = useState<LetterNumberConfig>(() => dbService.getLetterNumberConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    format_template: config.format_template || '{NOMOR}/{KODE}/{BULAN_ROMAWI}/{TAHUN}',
    kode_pondok: config.kode_pondok || 'PPNS',
    counter_start: config.counter_start || 1,
    current_counter: config.current_counter || 15,
    pad_length: config.pad_length || 3,
    reset_period: config.reset_period || 'tahun'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = dbService.saveLetterNumberConfig(formData);
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const sampleNumber = (() => {
    const num = String(formData.current_counter + 1).padStart(formData.pad_length, '0');
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const now = new Date();
    const mRoman = romanMonths[now.getMonth()];
    const yr = String(now.getFullYear());

    let res = formData.format_template;
    res = res.replace('{NOMOR}', num);
    res = res.replace('{KODE}', formData.kode_pondok);
    res = res.replace('{BULAN_ROMAWI}', mRoman);
    res = res.replace('{TAHUN}', yr);
    res = res.replace('{JENIS}', 'SK');
    return res;
  })();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Hash className="w-7 h-7 text-emerald-600" />
          <span>Pengaturan Penomoran Surat Otomatis</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Konfigurasi format penomoran surat resmi pesantren dengan validasi anti-duplikasi nomor ganda
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Konfigurasi penomoran surat berhasil diperbarui!</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        {/* Sample Preview Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
              Pratinjau Nomor Surat Berikutnya
            </span>
            <div className="text-2xl font-mono font-extrabold text-emerald-300 mt-1">
              {sampleNumber}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Nomor ini akan digunakan secara otomatis saat Anda menerbitkan surat berikutnya.
            </p>
          </div>
          <div className="shrink-0 bg-emerald-800/40 p-3 rounded-xl border border-emerald-700/50 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Counter Saat Ini</span>
            <span className="text-xl font-bold text-white font-mono">{formData.current_counter}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Singkat Pondok *</label>
              <input
                type="text"
                required
                value={formData.kode_pondok}
                onChange={(e) => setFormData({ ...formData, kode_pondok: e.target.value })}
                placeholder="PPNS"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Contoh: PPNS (PP Nurus Sholah)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Format Template Penomoran *</label>
              <input
                type="text"
                required
                value={formData.format_template}
                onChange={(e) => setFormData({ ...formData, format_template: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Variabel: <code className="text-emerald-700 font-bold">{`{NOMOR}`}</code>, <code className="text-emerald-700 font-bold">{`{KODE}`}</code>, <code className="text-emerald-700 font-bold">{`{BULAN_ROMAWI}`}</code>, <code className="text-emerald-700 font-bold">{`{TAHUN}`}</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Panjang Digit Digit Nomor (Pad Length) *</label>
              <select
                value={formData.pad_length}
                onChange={(e) => setFormData({ ...formData, pad_length: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value={2}>2 Digit (e.g. 01, 02)</option>
                <option value={3}>3 Digit (e.g. 001, 002)</option>
                <option value={4}>4 Digit (e.g. 0001, 0002)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reset Counter Otomatis</label>
              <select
                value={formData.reset_period}
                onChange={(e) => setFormData({ ...formData, reset_period: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="tahun">Setiap Pergantian Tahun Baru</option>
                <option value="bulan">Setiap Pergantian Bulan Baru</option>
                <option value="tidak">Tidak Pernah Reset (Konstan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Counter Nomor Awal (Start Counter)</label>
              <input
                type="number"
                value={formData.counter_start}
                onChange={(e) => setFormData({ ...formData, counter_start: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Atur Counter Saat Ini (Current Counter)</label>
              <input
                type="number"
                value={formData.current_counter}
                onChange={(e) => setFormData({ ...formData, current_counter: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem mencegah pembuatan dua surat dengan nomor yang sama secara otomatis.</span>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Format Penomoran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
