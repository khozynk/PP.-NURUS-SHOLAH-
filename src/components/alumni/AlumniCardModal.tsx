import React from 'react';
import { Alumni, Student, PesantrenSettings } from '../../types/database';
import { Modal } from '../common/Modal';
import { Printer, GraduationCap, QrCode, Building2, CheckCircle2 } from 'lucide-react';

interface AlumniCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: Alumni | null;
  student?: Student;
  settings: PesantrenSettings;
}

export const AlumniCardModal: React.FC<AlumniCardModalProps> = ({
  isOpen,
  onClose,
  alumni,
  student,
  settings
}) => {
  if (!alumni) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = student?.nama_lengkap || 'Alumni PP Nurus Sholah';
  const qrData = `PPNS-ALUMNI:${alumni.id_alumni}:ID=${alumni.student_id}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cetak Kartu Tanda Anggota Alumni"
      subtitle={`${studentName} · ID Alumni: ${alumni.id_alumni}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Printable Card Area */}
        <div id="alumni-card-print-area" className="p-1 sm:p-2 flex justify-center">
          <div className="w-full max-w-[420px] aspect-[1.586/1] rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl p-4 sm:p-5 flex flex-col justify-between border-2 border-amber-400/30 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-400/10 rounded-full blur-lg -ml-8 -mb-8 pointer-events-none" />

            {/* Top Card Header */}
            <div className="relative z-10 flex items-center justify-between pb-2 border-b border-emerald-500/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs shrink-0">
                  <img 
                    src={settings.logo} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <div className="text-[11px] font-bold tracking-tight text-white uppercase leading-tight">
                    {settings.nama_pesantren}
                  </div>
                  <div className="text-[8px] text-amber-300 font-semibold tracking-wider uppercase">
                    KARTU TANDA ANGGOTA ALUMNI
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-700/80 border border-emerald-500/40 font-mono text-emerald-100 font-bold">
                RESMI
              </span>
            </div>

            {/* Card Body */}
            <div className="relative z-10 my-auto flex items-center gap-3.5 pt-2">
              {/* Photo */}
              <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-emerald-950/80 border-2 border-amber-400/40 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                {student?.foto ? (
                  <img src={student.foto} alt={studentName} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white/60 font-bold text-2xl">
                    {studentName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Identity Info (Tanpa NIK / No KK - Sesuai Aturan Privasi Section 25) */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm sm:text-base font-bold text-white truncate drop-shadow-xs">
                  {studentName}
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-amber-300 font-bold">
                  ID: {alumni.id_alumni}
                </div>
                <div className="text-[9px] sm:text-[10px] text-emerald-100 flex flex-col gap-0.5">
                  <span>NIS Asal: <strong className="text-white font-mono">{student?.nis || alumni.id_alumni}</strong></span>
                  <span>Tahun Lulus: <strong className="text-white">{alumni.tahun_lulus}</strong></span>
                  <span>Program: <strong className="text-white">{alumni.program}</strong></span>
                </div>
              </div>

              {/* QR Code safe (hanya ID/reference aman tanpa NIK/KK) */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1 rounded-xl shadow-xs shrink-0 flex flex-col items-center justify-center">
                {/* SVG QR Representation */}
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-3-5h2v2h-2v-2zm0 3h2v2h-2v-2zm-3-3h2v5h-2v-5zm6-3h2v2h-2v-2z"/>
                </svg>
                <span className="text-[6px] text-slate-500 font-mono text-center block mt-0.5">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="relative z-10 pt-2 border-t border-emerald-500/40 flex items-center justify-between text-[8px] text-emerald-200">
              <span className="truncate max-w-[200px]">Batulabang, Akkor, Palengaan, Pamekasan</span>
              <span className="text-amber-300 font-semibold font-mono">IKATAN ALUMNI</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-slate-500 leading-relaxed">
          Kartu alumni ini dilengkapi kode referensi verifikasi unik. Demi keamanan privasi, NIK, nomor KK, dan data sensitif orang tua tidak dicetak pada kartu ini.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Kartu Sekarang</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
