import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Clock, 
  UserCheck, 
  School, 
  Building2, 
  CheckCircle2, 
  BookOpen 
} from 'lucide-react';
import { dbService } from '../../services/db';
import { Schedule } from '../../types/database';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

export const ScheduleManagementPage: React.FC = () => {
  const { showToast } = useToast();
  const schedules = dbService.getSchedules();
  const subjects = dbService.getSubjects();
  const rombels = dbService.getRombels();
  const teachers = dbService.getTeachers();
  const programs = dbService.getPrograms();
  const levels = dbService.getLevels();
  const activePeriod = dbService.getActiveAcademicPeriod();
  const activeYear = dbService.getActiveAcademicYear();

  const [viewMode, setViewMode] = useState<'harian' | 'mingguan' | 'rombel' | 'ustadz'>('mingguan');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedRombelId, setSelectedRombelId] = useState<string>('all');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [searchTerm, setSearchText] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Schedule>>({
    hari: 'Senin',
    jam_mulai: '07:00',
    jam_selesai: '08:30',
    subject_id: '',
    program_id: 'prog-kitabiyah',
    level_id: '',
    rombel_id: '',
    teacher_id: '',
    ruangan: 'Kelas Utama',
    status: 'aktif'
  });

  const days: Schedule['hari'][] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const filteredSchedules = schedules.filter(s => {
    if (viewMode === 'harian' && s.hari !== selectedDay) return false;
    if (selectedRombelId !== 'all' && s.rombel_id !== selectedRombelId) return false;
    if (selectedTeacherId !== 'all' && s.teacher_id !== selectedTeacherId) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const sbj = subjects.find(sub => sub.id === s.subject_id)?.nama.toLowerCase() || '';
      const tchr = teachers.find(t => t.id === s.teacher_id)?.nama_lengkap.toLowerCase() || '';
      const rmb = rombels.find(r => r.id === s.rombel_id)?.name.toLowerCase() || '';
      return sbj.includes(q) || tchr.includes(q) || rmb.includes(q);
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      hari: selectedDay as any,
      jam_mulai: '07:00',
      jam_selesai: '08:30',
      subject_id: subjects[0]?.id || '',
      program_id: programs[0]?.id || 'prog-kitabiyah',
      level_id: levels[0]?.id || '',
      rombel_id: rombels[0]?.id || '',
      teacher_id: teachers[0]?.id || '',
      ruangan: 'Kelas Utama',
      status: 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: Schedule) => {
    setEditingSchedule(sch);
    setFormData({ ...sch });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.rombel_id || !formData.teacher_id) {
      showToast('Data Belum Lengkap', 'Pilih Mata Pelajaran, Rombel, dan Ustadz.', 'warning');
      return;
    }

    try {
      dbService.saveSchedule(formData);
      showToast('Jadwal Disimpan', 'Jadwal pembelajaran berhasil diperbarui.', 'success');
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan jadwal.', 'error');
    }
  };

  const handleDelete = (sch: Schedule) => {
    const sbjName = subjects.find(s => s.id === sch.subject_id)?.nama || 'Jadwal';
    if (window.confirm(`Hapus jadwal ${sbjName} (${sch.hari} ${sch.jam_mulai}-${sch.jam_selesai})?`)) {
      dbService.deleteSchedule(sch.id);
      showToast('Jadwal Dihapus', 'Jadwal berhasil dihapus.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>AKADEMIK &bull; JADWAL PEMBELAJARAN</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Jadwal Pembelajaran & Mengajar
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Periode: <strong className="text-slate-700">{activePeriod?.name || 'Semester 1'}</strong> ({activeYear?.nama_tahun_ajaran || '2026/2027'})
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Sesi</span>
        </button>
      </div>

      {/* Mode Switches & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('mingguan')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'mingguan' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setViewMode('harian')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'harian' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Harian
            </button>
            <button
              onClick={() => setViewMode('rombel')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'rombel' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Per Rombel
            </button>
            <button
              onClick={() => setViewMode('ustadz')}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'ustadz' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Per Ustadz
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari materi, ustadz, rombel..."
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Filters depending on ViewMode */}
        {viewMode === 'harian' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-600 mr-2">Pilih Hari:</span>
            {days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-xl font-semibold border transition-all ${selectedDay === d ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter Rombel:</span>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Rombel</option>
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter Ustadz:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Ustadz Pengajar</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      {viewMode === 'mingguan' ? (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map(day => {
            const daySchedules = filteredSchedules.filter(s => s.hari === day);
            return (
              <div key={day} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between font-bold text-sm">
                  <span>{day}</span>
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full font-normal">
                    {daySchedules.length} Sesi
                  </span>
                </div>

                <div className="p-3 space-y-3 min-h-[140px]">
                  {daySchedules.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      Tidak ada jadwal di hari {day}
                    </div>
                  ) : (
                    daySchedules.map(sch => {
                      const sbj = subjects.find(s => s.id === sch.subject_id);
                      const tchr = teachers.find(t => t.id === sch.teacher_id);
                      const rmb = rombels.find(r => r.id === sch.rombel_id);

                      return (
                        <div
                          key={sch.id}
                          className="bg-slate-50 hover:bg-emerald-50/50 p-3 rounded-xl border border-slate-200/80 transition-colors group relative"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {sch.jam_mulai} - {sch.jam_selesai}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditModal(sch)}
                                className="p-1 hover:bg-emerald-200/60 rounded text-emerald-800"
                                title="Edit Sesi"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(sch)}
                                className="p-1 hover:bg-rose-200/60 rounded text-rose-700"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="font-bold text-slate-800 text-sm">{sbj?.nama || 'Materi'}</div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <School className="w-3 h-3 text-slate-400" />
                              {rmb?.name || 'Rombel'}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              {tchr?.nama_panggilan || tchr?.nama_lengkap || 'Ustadz'}
                            </span>
                          </div>

                          {sch.ruangan && (
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {sch.ruangan}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Table View for Harian, Rombel, Ustadz */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800 text-sm">
            <span>Daftar Sesi Jadwal ({filteredSchedules.length} Sesi)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Hari & Jam</th>
                  <th className="px-4 py-3">Mata Pelajaran / Materi</th>
                  <th className="px-4 py-3">Rombel & Tingkat</th>
                  <th className="px-4 py-3">Ustadz Pengampu</th>
                  <th className="px-4 py-3">Ruangan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                      Tidak ada jadwal yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map(sch => {
                    const sbj = subjects.find(s => s.id === sch.subject_id);
                    const tchr = teachers.find(t => t.id === sch.teacher_id);
                    const rmb = rombels.find(r => r.id === sch.rombel_id);

                    return (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold mr-2">
                            {sch.hari}
                          </span>
                          {sch.jam_mulai} - {sch.jam_selesai}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {sbj?.nama || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{rmb?.name || '-'}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {tchr?.nama_lengkap || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {sch.ruangan || '-'}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(sch)}
                            className="px-2.5 py-1 text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sch)}
                            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Sesi Jadwal' : 'Tambah Sesi Jadwal Pembelajaran'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Hari *</label>
              <select
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Jam Mulai *</label>
              <input
                type="text"
                placeholder="07:00"
                value={formData.jam_mulai}
                onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Jam Selesai *</label>
              <input
                type="text"
                placeholder="08:30"
                value={formData.jam_selesai}
                onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Mata Pelajaran / Materi *</label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.nama} ({s.jenis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Rombel Target *</label>
              <select
                value={formData.rombel_id}
                onChange={(e) => setFormData({ ...formData, rombel_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Rombel --</option>
                {rombels.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Ustadz Pengampu *</label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">-- Pilih Ustadz Pengajar --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama_lengkap}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Ruangan / Tempat</label>
            <input
              type="text"
              placeholder="e.g. Ruang Kelas Mubtadi A / Musholla"
              value={formData.ruangan || ''}
              onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-xs"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
