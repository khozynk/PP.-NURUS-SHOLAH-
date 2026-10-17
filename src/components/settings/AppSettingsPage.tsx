import React, { useState, useEffect } from 'react';
import { Database, Sparkles, Trash2, Download, ShieldCheck, AlertTriangle, X, Check, RefreshCw, Cloud, Server, ArrowDownCircle, ArrowUpCircle, Laptop, Smartphone } from 'lucide-react';
import { dbService } from '../../services/db';
import { testFirebaseConnection } from '../../services/firebase';
import { cloudSyncService, SyncState } from '../../services/cloudSync';
import { useToast } from '../common/Toast';

interface AppSettingsPageProps {
  onDataChange: () => void;
}

export const AppSettingsPage: React.FC<AppSettingsPageProps> = ({ onDataChange }) => {
  const { showToast } = useToast();
  const [version, setVersion] = useState(0);
  const rawDb = dbService.getRawData();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetScope, setResetScope] = useState<'all_operational' | 'students_only'>('all_operational');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const [isPullingCloud, setIsPullingCloud] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(cloudSyncService.getStatus());

  useEffect(() => {
    const unsub = cloudSyncService.subscribeStatus(setSyncState);
    return () => unsub();
  }, []);

  const hasDemo = rawDb.students.some(s => s.is_demo);

  const handleManualSyncToCloud = async () => {
    setIsPushingCloud(true);
    try {
      const ok = await cloudSyncService.syncNow();
      if (ok) {
        showToast('Sinkronisasi Sukses', 'Seluruh data pesantren berhasil diunggah ke Firebase Cloud Firestore dan dapat diakses perangkat lain.', 'success');
      } else {
        showToast('Sinkronisasi Gagal', cloudSyncService.getStatus().errorMessage || 'Gagal mengunggah data ke cloud.', 'error');
      }
    } finally {
      setIsPushingCloud(false);
    }
  };

  const handleManualPullFromCloud = async () => {
    setIsPullingCloud(true);
    try {
      const ok = await cloudSyncService.pullFromCloudOrSeed();
      if (ok) {
        setVersion(v => v + 1);
        onDataChange();
        showToast('Data Cloud Ditarik', 'Data terbaru dari perangkat lain berhasil dimuat ke perangkat ini.', 'success');
      } else {
        showToast('Tarik Data Gagal', cloudSyncService.getStatus().errorMessage || 'Gagal menarik data cloud.', 'error');
      }
    } finally {
      setIsPullingCloud(false);
    }
  };

  const handleTestCloud = async () => {
    setIsTestingCloud(true);
    try {
      await testFirebaseConnection();
      showToast('Firebase Cloud Terhubung', 'Basis data Firebase Firestore (Region: asia-southeast1) aktif dan terverifikasi.', 'success');
    } catch (err: any) {
      showToast('Uji Koneksi Firebase', err?.message || 'Gagal memeriksa koneksi cloud.', 'error');
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleLoadDemo = () => {
    dbService.loadDemoData();
    showToast('Data Demo Dimuat', 'Dataset pengujian bertanda [DATA DEMO] berhasil dimuat.', 'info');
    setVersion(v => v + 1);
    onDataChange();
  };

  const handleExecuteReset = () => {
    setIsProcessing(true);
    try {
      dbService.resetDatabaseToEmpty(resetScope);
      setIsResetModalOpen(false);
      showToast(
        'Database Berhasil Dikosongkan',
        resetScope === 'all_operational'
          ? 'Seluruh data santri, rombel, nilai, surat, keuangan, dan rapat telah direset ke 0 data.'
          : 'Data santri, alumni, dan kelas telah direset ke 0 data.',
        'success'
      );
      setVersion(v => v + 1);
      onDataChange();
    } catch (err: any) {
      showToast('Gagal Mengosongkan Database', err?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreInitialSeed = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      dbService.resetToInitialSeed();
      showToast('Dataset Awal Dipulihkan', 'Basis data dikembalikan ke struktur standar sistem.', 'info');
      setVersion(v => v + 1);
      onDataChange();
      setIsResetModalOpen(false);
    } catch (err: any) {
      showToast('Gagal Memulihkan Dataset', err?.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rawDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_db_nurusholah_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Berhasil', 'File JSON database berhasil diunduh ke komputer Anda.', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Aplikasi & Manajemen Data
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kontrol persistensi database lokal, dataset demo untuk testing, dan pencadangan JSON
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Testing & Demo Dataset */}
        <div className="card-3d p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dataset Demo untuk Testing</span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Sesuai panduan arsitektur sistem, aplikasi tidak menampilkan data palsu secara diam-diam. Untuk keperluan demonstrasi evaluasi, Anda dapat memuat data contoh yang seluruhnya bertanda jelas <strong className="text-amber-800">[DATA DEMO]</strong> atau mengosongkan basis data ke kondisi 0 data untuk menguji empty state sistem.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 my-4 text-xs space-y-1.5 font-mono text-slate-600 shadow-inner">
              <div className="flex justify-between">
                <span>Total Santri Saat Ini:</span>
                <strong className="text-slate-900">{rawDb.students.length} Santri</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Alumni:</span>
                <strong className="text-slate-900">{rawDb.alumni.length} Orang</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Agenda Rapat:</span>
                <strong className="text-slate-900">{rawDb.pondok_meetings?.length || 0} Rapat</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Transaksi Keuangan:</span>
                <strong className="text-slate-900">{rawDb.financial_transactions?.length || 0} Transaksi</strong>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span>Status Dataset:</span>
                <span className={`font-bold ${hasDemo ? 'text-amber-600' : rawDb.students.length === 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {hasDemo ? 'Aktif [DATA DEMO]' : rawDb.students.length === 0 ? 'KOSONG (0 Data)' : 'Data Operasional'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleLoadDemo}
              className="btn-3d btn-3d-emerald w-full py-2.5 px-4 text-xs sm:text-sm font-semibold gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Muat Dataset Demo Testing</span>
            </button>

            <button
              onClick={() => setIsResetModalOpen(true)}
              className="btn-3d w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 border-b-[3.5px] border-b-rose-400 font-semibold text-xs sm:text-sm gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Database (Uji Kondisi 0)</span>
            </button>
          </div>
        </div>

        {/* Card: Backup & Persistence */}
        <div className="card-3d p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Penyimpanan & Pencadangan Basis Data</span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Basis data tersimpan secara permanen pada storage browser dan tidak hilang saat Anda melakukan refresh halaman. Anda juga dapat mengunduh seluruh skema dan relasi dalam format JSON.
            </p>

            <div className="my-4 p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Integritas Relasional Terjamin:</strong><br />
                Primary key tabel menggunakan UUID, terhubung foreign key antara <em>students</em>, <em>alumni</em>, <em>classes</em>, <em>rombels</em>, <em>keuangan</em>, dan <em>musyawarah rapat</em>.
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleBackup}
              className="btn-3d btn-3d-white w-full py-2.5 px-4 text-xs sm:text-sm font-semibold gap-2"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Unduh Cadangan Basis Data (JSON)</span>
            </button>
          </div>
        </div>

        {/* Card: Firebase Cloud Firestore & Real-Time Multi-Device Sync */}
        <div className="card-3d p-5 sm:p-6 flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-sm font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-sky-600" />
                <span>Sinkronisasi Real-Time Multi-Perangkat (Google Cloud Firestore)</span>
              </div>
              <span className={`badge-3d ${
                syncState.status === 'syncing'
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : syncState.status === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {syncState.status === 'syncing' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : syncState.status === 'error' ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Koneksi Terhambat</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Real-Time Aktif</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Semua perubahan data yang dilakukan oleh Admin (santri, status, pembayaran, nilai tahfidz, absensi, surat, rapat, dan pengaturan) secara otomatis disinkronkan ke <strong>Google Cloud Firestore</strong> sehingga langsung tampil dan selalu sinkron di perangkat HP, tablet, maupun komputer lain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Cloud Region</span>
                <strong className="text-slate-800">asia-southeast1</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Database ID</span>
                <strong className="text-slate-800 font-mono text-[10px] truncate block" title="ai-studio-sistemmanajemend-ee572f9b-3cb7-4470-a64e-3875a5c11b21">
                  ai-studio-sistemmanajemend...
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Terakhir Disinkron</span>
                <strong className="text-emerald-700">
                  {syncState.lastSyncedAt
                    ? new Date(syncState.lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
                    : 'Baru saja'}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Dukungan Perangkat</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <Laptop className="w-3.5 h-3.5 text-sky-600" />
                  <span>HP, Tablet & Laptop</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 flex items-start gap-2.5">
              <Server className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Sinkronisasi Otomatis Berjalan di Latar Belakang:</strong> Saat Anda menambah, mengedit, atau menghapus data, sistem langsung menyimpan data lokal dan memancarkan pembaruan ke cloud. Perangkat lain yang sedang membuka sistem akan langsung mendeteksi dan memperbarui layarnya tanpa perlu refresh halaman.
              </div>
            </div>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleManualSyncToCloud}
              disabled={isPushingCloud || syncState.status === 'syncing'}
              className="btn-3d btn-3d-emerald py-2.5 px-3 text-xs font-semibold gap-2 disabled:opacity-75"
            >
              <ArrowUpCircle className={`w-4 h-4 text-white ${isPushingCloud ? 'animate-spin' : ''}`} />
              <span>{isPushingCloud ? 'Mengunggah ke Cloud...' : 'Sinkronkan ke Cloud Sekarang'}</span>
            </button>

            <button
              onClick={handleManualPullFromCloud}
              disabled={isPullingCloud || syncState.status === 'syncing'}
              className="btn-3d btn-3d-white py-2.5 px-3 text-xs font-semibold gap-2 disabled:opacity-75"
            >
              <ArrowDownCircle className={`w-4 h-4 text-slate-700 ${isPullingCloud ? 'animate-spin' : ''}`} />
              <span>{isPullingCloud ? 'Menarik Data Cloud...' : 'Tarik Data dari Cloud'}</span>
            </button>

            <button
              onClick={handleTestCloud}
              disabled={isTestingCloud}
              className="btn-3d btn-3d-white py-2.5 px-3 text-xs font-semibold gap-2 disabled:opacity-75"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 ${isTestingCloud ? 'animate-spin' : ''}`} />
              <span>{isTestingCloud ? 'Menguji Koneksi...' : 'Verifikasi Koneksi Firebase'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI KOSONGKAN DATABASE (BEBAS DARI BLOKIR WINDOW.CONFIRM) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="modal-3d max-w-lg w-full p-6 space-y-5 border border-rose-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-200">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Konfirmasi Kosongkan Database
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uji kondisi awal 0 data (empty state) pada sistem
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed shadow-2xs">
              <strong>Peringatan Penting:</strong> Tindakan ini akan mengosongkan data operasional ke angka 0. Akun Administrator Anda dan profil pesantren tetap aman sehingga Anda tetap dapat login dan mengelola sistem.
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Cakupan Pembersihan:
              </label>

              <div
                onClick={() => setResetScope('all_operational')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  resetScope === 'all_operational'
                    ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${resetScope === 'all_operational' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'}`}>
                      {resetScope === 'all_operational' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-bold text-slate-900">Kosongkan Seluruh Data Operasional (Rekomendasi)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Total 0 Data</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-6.5">
                  Mengosongkan santri, alumni, rombel, nilai, arsip surat, transaksi keuangan, dan rapat musyawarah ke kondisi 0.
                </p>
              </div>

              <div
                onClick={() => setResetScope('students_only')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  resetScope === 'students_only'
                    ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${resetScope === 'students_only' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'}`}>
                      {resetScope === 'students_only' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-sm font-bold text-slate-900">Hanya Kosongkan Data Santri & Kelas</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Santri Saja</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 ml-6.5">
                  Hanya mengosongkan daftar santri aktif, santri lulus/alumni, dan kelas tanpa mengubah data surat atau modul rapat.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="btn-3d btn-3d-white w-full sm:w-auto flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold"
              >
                Batalkan
              </button>

              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isProcessing}
                className="btn-3d w-full sm:w-auto flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 border-b-[3.5px] border-b-rose-900 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isProcessing ? 'Mengosongkan...' : 'Ya, Kosongkan Sekarang'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleRestoreInitialSeed}
                className="text-xs text-slate-400 hover:text-emerald-700 inline-flex items-center gap-1.5 transition-colors underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atau pulihkan ke dataset bawaan sistem (Initial Seed)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
