import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Building2, 
  Users, 
  ArrowRight, 
  X, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { PondokMeeting } from '../../types/database';

interface MeetingCalendarPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const MeetingCalendarPage: React.FC<MeetingCalendarPageProps> = ({ onNavigate }) => {
  const meetings = dbService.getPondokMeetings();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026 default
  const [selectedDayMeetings, setSelectedDayMeetings] = useState<PondokMeeting[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calendar Days Calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust Monday start (0=Sun -> 6, 1=Mon -> 0, etc.)
  const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 1));
  };

  const handleDayClick = (dayNumber: number) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = dayNumber.toString().padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const dayMeetings = meetings.filter(m => m.tanggal === dateStr);
    setSelectedDateStr(dateStr);
    setSelectedDayMeetings(dayMeetings);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4 text-emerald-600" /> Kalender Rapat Interaktif
          </div>
          <h1 className="text-xl font-bold text-slate-900">Jadwal Kalender Rapat Bulanan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Klik tanggal untuk melihat ringkasan agenda musyawarah pesantren</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-bold text-sm text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all ml-1"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 space-y-3">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-600 uppercase border-b border-slate-100 pb-2">
          <div>Senin</div>
          <div>Selasa</div>
          <div>Rabu</div>
          <div>Kamis</div>
          <div>Jumat</div>
          <div>Sabtu</div>
          <div className="text-rose-600">Minggu</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty slots before first day */}
          {Array.from({ length: startingDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-slate-50/50 rounded-xl border border-dashed border-slate-100 opacity-30" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedMonth = (month + 1).toString().padStart(2, '0');
            const formattedDay = dayNum.toString().padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            const dayMeetings = meetings.filter(m => m.tanggal === dateStr);
            const isToday = dayNum === 10 && month === 9 && year === 2026;

            return (
              <div
                key={dayNum}
                onClick={() => handleDayClick(dayNum)}
                className={`h-24 sm:h-28 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30'
                    : dayMeetings.length > 0
                    ? 'bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-emerald-800 font-extrabold' : 'text-slate-800'}`}>
                    {dayNum}
                  </span>

                  {dayMeetings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  )}
                </div>

                {/* Event Indicators */}
                <div className="space-y-1 overflow-y-auto max-h-16 no-scrollbar">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-1 text-[10px] font-semibold bg-emerald-100 text-emerald-900 rounded border border-emerald-200 truncate"
                      title={m.judul_rapat}
                    >
                      {m.waktu_mulai} {m.judul_rapat}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SHEET / DRAWER FOR SELECTED DATE */}
      {selectedDayMeetings !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Agenda Rapat: {selectedDateStr}</h3>
                <p className="text-xs text-slate-500">Terdapat {selectedDayMeetings.length} agenda musyawarah</p>
              </div>
              <button onClick={() => setSelectedDayMeetings(null)} className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedDayMeetings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs">Tidak ada rapat terjadwal pada tanggal ini.</p>
                <button
                  onClick={() => {
                    setSelectedDayMeetings(null);
                    onNavigate('meet_monthly');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow"
                >
                  + Buat Agenda Rapat Tanggal Ini
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayMeetings.map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {m.nomor_rapat || 'RPT/NS'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{m.status}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{m.judul_rapat}</h4>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {m.waktu_mulai} - {m.waktu_selesai} WIB</div>
                      <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {m.tempat}</div>
                      <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-600" /> Pimpinan: {m.pimpinan_rapat}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedDayMeetings(null);
                          onNavigate('meet_detail', { meetingId: m.id });
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow transition-all flex items-center gap-1"
                      >
                        <span>Buka Detail Rapat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
