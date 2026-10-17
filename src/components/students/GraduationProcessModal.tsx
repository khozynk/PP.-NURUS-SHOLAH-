import React, { useState, useEffect } from 'react';
import { Student } from '../../types/database';
import { dbService, calculateStudyDuration } from '../../services/db';
import { authService } from '../../services/auth';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { GraduationCap, Award, Calendar, CheckSquare, Sparkles, BookOpen, Clock } from 'lucide-react';

interface GraduationProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export const GraduationProcessModal: React.FC<GraduationProcessModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [tanggalLulus, setTanggalLulus] = useState(new Date().toISOString().slice(0, 10));
  const [tahunLulus, setTahunLulus] = useState(new Date().getFullYear());
  const [nomorIjazah, setNomorIjazah] = useState('');
  const [predikat, setPredikat] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Maqbul' | 'Lulus'>('Mumtaz');
  const [programDiselesaikan, setProgramDiselesaikan] = useState('');
  const [catatanKelulusan, setCatatanKelulusan] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (student) {
      const nowYear = new Date().getFullYear();
      setTanggalLulus(new Date().toISOString().slice(0, 10));
      setTahunLulus(nowYear);
      setProgramDiselesaikan(student.program || 'Reguler Salaf & Kitab');
      setNomorIjazah(`IJZ-${nowYear}-${student.nis.slice(-4)}`);
      setPredikat('Mumtaz');
      setCatatanKelulusan(`Telah menyelesaikan seluruh rangkaian ujian dan kurikulum di PP Nurus Sholah.`);
      setIsConfirmed(false);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const canGraduate = authService.hasPermission('student.graduate');
  const duration = calculateStudyDuration(
    student.tahun_masuk,
    student.tanggal_masuk,
    tahunLulus,
    tanggalLulus
  );
  const className = dbService.getClassName(student.kelas_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canGraduate) {
      showToast('Akses Ditolak', 'Anda tidak memiliki hak akses untuk memproses kelulusan santri (student.graduate).', 'error');
      return;
    }

    if (!isConfirmed) {
      showToast('Konfirmasi Diperlukan', 'Harap centang kotak konfirmasi validitas data kelulusan.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = dbService.processGraduation(
        student.id,
        {
          tanggal_lulus: tanggalLulus,
          tahun_lulus: tahunLulus,
          nomor_ijazah: nomorIjazah.trim() || undefined,
          predikat,
          program_diselesaikan: programDiselesaikan,
          catatan_kelulusan: catatanKelulusan
        },
        currentUser || undefined
      );

      showToast(
        'Proses Kelulusan Berhasil',
        `Santri ${student.nama_lengkap} resmi dinyatakan lulus! Data santri telah masuk ke Data Alumni dengan ID: ${result.alumni.id_alumni}.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Gagal Memproses Kelulusan', err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Kelulusan Santri"
      subtitle="Verifikasi dan penetapan status kelulusan santri menjadi Alumni"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ringkasan Identitas Santri yang Akan Diluluskan */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-emerald-900 text-sm">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
            <span>Apakah Anda yakin ingin memproses santri ini sebagai lulusan?</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-700 mt-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
              <strong className="text-slate-900">{student.nama_lengkap}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">NIS</span>
              <span className="font-mono font-semibold">{student.nis}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Kelas Terakhir</span>
              <span>{className}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Program</span>
              <span>{student.program}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tahun Masuk</span>
              <span>{student.tahun_masuk} {student.tanggal_masuk ? `(${student.tanggal_masuk})` : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Estimasi Masa Belajar</span>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {duration.text}
              </span>
            </div>
          </div>
        </div>

        {/* Input Kelulusan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Lulus <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={tanggalLulus}
              onChange={(e) => {
                setTanggalLulus(e.target.value);
                if (e.target.value) {
                  setTahunLulus(new Date(e.target.value).getFullYear());
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Lulus <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={2000}
              max={2099}
              value={tahunLulus}
              onChange={(e) => setTahunLulus(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Ijazah / Syahadah (Jika Ada)
            </label>
            <input
              type="text"
              placeholder="Contoh: IJZ-2026-0045"
              value={nomorIjazah}
              onChange={(e) => setNomorIjazah(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Predikat Kelulusan
            </label>
            <select
              value={predikat}
              onChange={(e) => setPredikat(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-white font-medium"
            >
              <option value="Mumtaz">Mumtaz (Istimewa / Cumlaude)</option>
              <option value="Jayyid Jiddan">Jayyid Jiddan (Amat Baik)</option>
              <option value="Jayyid">Jayyid (Baik)</option>
              <option value="Maqbul">Maqbul (Cukup)</option>
              <option value="Lulus">Lulus Standar</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Program yang Diselesaikan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={programDiselesaikan}
            onChange={(e) => setProgramDiselesaikan(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Catatan Kelulusan
          </label>
          <textarea
            rows={2}
            value={catatanKelulusan}
            onChange={(e) => setCatatanKelulusan(e.target.value)}
            placeholder="Catatan prestasi, hafalan akhir, atau pesan dewan pengasuh..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
          />
        </div>

        {/* Checkbox Wajib */}
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-800 font-medium">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600"
            />
            <span>Saya yakin data kelulusan sudah benar dan telah disetujui pihak pesantren.</span>
          </label>
          <p className="text-[11px] text-slate-500 mt-1 pl-6.5">
            Status santri akan otomatis menjadi <strong>ALUMNI</strong>, record alumni dengan ID unik otomatis dibuat, dan data biodata terhubung secara permanen tanpa duplikasi.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={!isConfirmed || isSubmitting || !canGraduate}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isSubmitting ? 'Memproses...' : 'Proses Kelulusan'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
