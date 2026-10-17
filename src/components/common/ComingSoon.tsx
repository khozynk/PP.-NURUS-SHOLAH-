import React from 'react';
import { Sparkles, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  category: string;
  description: string;
  plannedFeatures?: string[];
  targetPhase?: string;
  onBackToDashboard?: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  category,
  description,
  plannedFeatures = [],
  targetPhase = 'Tahap 2 (Pengembangan Lanjutan)',
  onBackToDashboard
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MODUL {category.toUpperCase()}</span>
            <span>·</span>
            <span>{targetPhase}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {title}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            {description}
          </p>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Roadmap & Feature Plan */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-800">Rencana Kapabilitas Modul Ini</h2>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Fondasi arsitektur data dan hak akses untuk modul ini telah disiapkan di database. Rincian fitur yang dijadwalkan pada tahap berikutnya meliputi:
        </p>

        {plannedFeatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plannedFeatures.map((feat, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{feat}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-sm">
            Rancangan form dan pemrosesan data sedang dipersiapkan untuk fase implementasi berikutnya.
          </div>
        )}
      </div>
    </div>
  );
};
