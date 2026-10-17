import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  School, 
  GraduationCap, 
  Check, 
  X, 
  SlidersHorizontal,
  Layers,
  ArrowRight,
  GitFork,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { EducationProgram, EducationTrack, EducationLevel } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const ProgramHierarchyPage: React.FC = () => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;

  const [programs, setPrograms] = useState<EducationProgram[]>(() => dbService.getPrograms());
  const [tracks, setTracks] = useState<EducationTrack[]>(() => dbService.getTracks());
  const [levels, setLevels] = useState<EducationLevel[]>(() => dbService.getLevels());
  const [rombels, setRombels] = useState(() => dbService.getRombels());
  const [students, setStudents] = useState(() => dbService.getStudents());
  const [teachers, setTeachers] = useState(() => dbService.getTeachers());

  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({
    'prog-kitabiyah': true,
    'prog-tahfidz': true,
    'prog-btq': true
  });
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    'track-safinah': true,
    'track-iktisyaf': true
  });

  // Modal states
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<EducationProgram | null>(null);
  const [programForm, setProgramForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'Kitabiyah',
    duration: '3 Tahun',
    status: 'aktif' as 'aktif' | 'nonaktif',
    sort_order: 1
  });

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<EducationTrack | null>(null);
  const [trackForm, setTrackForm] = useState({
    program_id: '',
    code: '',
    name: '',
    description: '',
    status: 'aktif' as 'aktif' | 'nonaktif',
    sort_order: 1
  });

  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EducationLevel | null>(null);
  const [levelForm, setLevelForm] = useState({
    program_id: '',
    track_id: '',
    code: '',
    name: '',
    description: '',
    level_order: 1,
    duration: '1 Tahun',
    status: 'aktif' as 'aktif' | 'nonaktif'
  });

  const reloadData = () => {
    setPrograms(dbService.getPrograms());
    setTracks(dbService.getTracks());
    setLevels(dbService.getLevels());
    setRombels(dbService.getRombels());
    setStudents(dbService.getStudents());
    setTeachers(dbService.getTeachers());
  };

  const toggleProgram = (id: string) => {
    setExpandedPrograms(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTrack = (id: string) => {
    setExpandedTracks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- PROGRAM ACTIONS ---
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      code: '',
      name: '',
      description: '',
      type: 'Kitabiyah',
      duration: '3 Tahun',
      status: 'aktif',
      sort_order: programs.length + 1
    });
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: EducationProgram) => {
    setEditingProgram(prog);
    setProgramForm({
      code: prog.code,
      name: prog.name,
      description: prog.description,
      type: prog.type,
      duration: prog.duration,
      status: prog.status,
      sort_order: prog.sort_order
    });
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProgram) {
        dbService.updateProgram(editingProgram.id, programForm, currentUser);
        showToast('Berhasil', `Program "${programForm.name}" berhasil diperbarui.`, 'success');
      } else {
        dbService.createProgram(programForm, currentUser);
        showToast('Berhasil', `Program "${programForm.name}" berhasil ditambahkan.`, 'success');
      }
      setIsProgramModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDeleteProgram = (prog: EducationProgram) => {
    if (confirm(`Yakin ingin menghapus program "${prog.name}"?`)) {
      try {
        dbService.deleteProgram(prog.id, currentUser);
        showToast('Berhasil', `Program "${prog.name}" telah dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // --- TRACK ACTIONS ---
  const handleOpenAddTrack = (progId: string) => {
    setEditingTrack(null);
    const existing = tracks.filter(t => t.program_id === progId);
    setTrackForm({
      program_id: progId,
      code: '',
      name: '',
      description: '',
      status: 'aktif',
      sort_order: existing.length + 1
    });
    setIsTrackModalOpen(true);
  };

  const handleOpenEditTrack = (track: EducationTrack) => {
    setEditingTrack(track);
    setTrackForm({
      program_id: track.program_id,
      code: track.code,
      name: track.name,
      description: track.description,
      status: track.status,
      sort_order: track.sort_order
    });
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTrack) {
        dbService.updateTrack(editingTrack.id, trackForm, currentUser);
        showToast('Berhasil', `Cabang kurikulum "${trackForm.name}" diperbarui.`, 'success');
      } else {
        dbService.createTrack(trackForm, currentUser);
        showToast('Berhasil', `Cabang kurikulum "${trackForm.name}" ditambahkan.`, 'success');
      }
      setIsTrackModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDeleteTrack = (track: EducationTrack) => {
    if (confirm(`Hapus cabang/kelompok "${track.name}"?`)) {
      try {
        dbService.deleteTrack(track.id, currentUser);
        showToast('Berhasil', `Cabang kurikulum dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  // --- LEVEL ACTIONS ---
  const handleOpenAddLevel = (progId: string, trackId?: string) => {
    setEditingLevel(null);
    const existing = levels.filter(l => l.program_id === progId && l.track_id === (trackId || null));
    setLevelForm({
      program_id: progId,
      track_id: trackId || '',
      code: '',
      name: '',
      description: '',
      level_order: existing.length + 1,
      duration: '1 Tahun',
      status: 'aktif'
    });
    setIsLevelModalOpen(true);
  };

  const handleOpenEditLevel = (lvl: EducationLevel) => {
    setEditingLevel(lvl);
    setLevelForm({
      program_id: lvl.program_id,
      track_id: lvl.track_id || '',
      code: lvl.code,
      name: lvl.name,
      description: lvl.description,
      level_order: lvl.level_order,
      duration: lvl.duration,
      status: lvl.status
    });
    setIsLevelModalOpen(true);
  };

  const handleSaveLevel = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...levelForm,
        track_id: levelForm.track_id ? levelForm.track_id : null
      };

      if (editingLevel) {
        dbService.updateLevel(editingLevel.id, payload, currentUser);
        showToast('Berhasil', `Tingkat "${levelForm.name}" diperbarui.`, 'success');
      } else {
        dbService.createLevel(payload, currentUser);
        showToast('Berhasil', `Tingkat "${levelForm.name}" ditambahkan.`, 'success');
      }
      setIsLevelModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  const handleDeleteLevel = (lvl: EducationLevel) => {
    if (confirm(`Hapus tingkat "${lvl.name}"?`)) {
      try {
        dbService.deleteLevel(lvl.id, currentUser);
        showToast('Berhasil', `Tingkat "${lvl.name}" dihapus.`, 'success');
        reloadData();
      } catch (err: any) {
        showToast('Gagal', err.message || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>Struktur Program Pendidikan & Kurikulum</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Hierarki dinamis: Program Utama &rarr; Cabang/Kurikulum (Track) &rarr; Tingkat/Kelas (Level) &rarr; Rombel &rarr; Santri
          </p>
        </div>

        <button
          onClick={handleOpenAddProgram}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Program Baru</span>
        </button>
      </div>

      {/* Program Tree Container */}
      <div className="space-y-4">
        {programs.map((prog) => {
          const isProgExpanded = !!expandedPrograms[prog.id];
          const progTracks = tracks.filter(t => t.program_id === prog.id);
          const progDirectLevels = levels.filter(l => l.program_id === prog.id && !l.track_id);
          
          const progStudents = students.filter(s => s.program_id === prog.id && s.status === 'aktif');
          const progRombels = rombels.filter(r => {
            const cls = dbService.getClassById(r.class_id);
            return cls?.program_id === prog.id;
          });

          return (
            <div 
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
            >
              {/* Program Header Card */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-200/70">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleProgram(prog.id)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors mt-0.5 cursor-pointer"
                  >
                    {isProgExpanded ? (
                      <ChevronDown className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {prog.code}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {prog.name}
                      </h2>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        prog.status === 'aktif' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {prog.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ({prog.duration})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      {prog.description || 'Tidak ada deskripsi'}
                    </p>
                  </div>
                </div>

                {/* Right badges & action buttons */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 self-end md:self-center">
                  <div className="flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono font-bold">{progStudents.length}</span>
                      <span className="text-slate-400">Santri</span>
                    </div>
                    <div className="w-px h-3.5 bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <School className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-mono font-bold">{progRombels.length}</span>
                      <span className="text-slate-400">Rombel</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddTrack(prog.id)}
                      title="Tambah Cabang / Kurikulum"
                      className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cabang</span>
                    </button>
                    {!progTracks.length && (
                      <button
                        onClick={() => handleOpenAddLevel(prog.id)}
                        title="Tambah Tingkat Langsung"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tingkat</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditProgram(prog)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="Edit Program"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(prog)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Program"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Tracks and Levels Body */}
              {isProgExpanded && (
                <div className="p-4 sm:p-6 space-y-4 bg-white">
                  {/* Case 1: Program has Tracks (like Kitabiyah -> Safinah, Iktisyaf) */}
                  {progTracks.length > 0 && (
                    <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-emerald-100 ml-3 sm:ml-4">
                      {progTracks.map((track) => {
                        const isTrackExpanded = !!expandedTracks[track.id];
                        const trackLevels = levels.filter(l => l.track_id === track.id);
                        const trackStudents = students.filter(s => s.track_id === track.id && s.status === 'aktif');
                        const trackRombels = rombels.filter(r => {
                          const cls = dbService.getClassById(r.class_id);
                          return cls?.track_id === track.id;
                        });

                        return (
                          <div 
                            key={track.id}
                            className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => toggleTrack(track.id)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                                >
                                  {isTrackExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-teal-700" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                                      {track.code}
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900">
                                      {track.name}
                                    </h3>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      track.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {track.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {track.description || '-'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200">
                                  {trackStudents.length} Santri &bull; {trackRombels.length} Rombel
                                </span>
                                <button
                                  onClick={() => handleOpenAddLevel(prog.id, track.id)}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Tingkat</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEditTrack(track)}
                                  className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                                  title="Edit Cabang"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTrack(track)}
                                  className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                  title="Hapus Cabang"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Track Levels list */}
                            {isTrackExpanded && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                {trackLevels.map((lvl) => {
                                  const lvlStudents = students.filter(s => s.level_id === lvl.id && s.status === 'aktif');
                                  const lvlRombels = rombels.filter(r => {
                                    const cls = dbService.getClassById(r.class_id);
                                    return cls?.level_id === lvl.id;
                                  });

                                  return (
                                    <div
                                      key={lvl.id}
                                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                                              {lvl.level_order}
                                            </span>
                                            <h4 className="text-xs font-bold text-slate-900">
                                              {lvl.name}
                                            </h4>
                                          </div>
                                          <span className="text-[10px] font-mono text-slate-400">
                                            {lvl.code} &bull; {lvl.duration}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleOpenEditLevel(lvl)}
                                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteLevel(lvl)}
                                            className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      <p className="text-[11px] text-slate-500 line-clamp-2">
                                        {lvl.description || '-'}
                                      </p>

                                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-100 text-slate-500">
                                        <span>{lvlStudents.length} Santri</span>
                                        <span>{lvlRombels.length} Rombel</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Case 2: Program has direct Levels without Tracks (like Tahfidz, BTQ) */}
                  {progDirectLevels.length > 0 && (
                    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-emerald-100 ml-3 sm:ml-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Tingkatan / Jenjang Pendidikan Langsung
                        </span>
                        <button
                          onClick={() => handleOpenAddLevel(prog.id)}
                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Tingkat</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {progDirectLevels.map((lvl) => {
                          const lvlStudents = students.filter(s => s.level_id === lvl.id && s.status === 'aktif');
                          const lvlRombels = rombels.filter(r => {
                            const cls = dbService.getClassById(r.class_id);
                            return cls?.level_id === lvl.id;
                          });

                          return (
                            <div
                              key={lvl.id}
                              className="bg-slate-50/70 rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                                      {lvl.level_order}
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                      {lvl.name}
                                    </h4>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {lvl.code} &bull; {lvl.duration}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditLevel(lvl)}
                                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLevel(lvl)}
                                    className="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500">
                                {lvl.description || '-'}
                              </p>

                              <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-slate-200 text-slate-600">
                                <span>{lvlStudents.length} Santri Aktif</span>
                                <span>{lvlRombels.length} Rombel</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: PROGRAM ADD / EDIT */}
      <Modal
        isOpen={isProgramModalOpen}
        onClose={() => setIsProgramModalOpen(false)}
        title={editingProgram ? 'Edit Program Pendidikan' : 'Tambah Program Pendidikan Baru'}
        subtitle="Kelola master program utama akademik pesantren"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProgram} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Program <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={programForm.code}
                onChange={e => setProgramForm({ ...programForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: KITABIYAH / TAHFIDZ"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe / Bidang
              </label>
              <input
                type="text"
                value={programForm.type}
                onChange={e => setProgramForm({ ...programForm, type: e.target.value })}
                placeholder="Kitabiyah, Tahfidz, BTQ, Umum"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Program <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={programForm.name}
                onChange={e => setProgramForm({ ...programForm, name: e.target.value })}
                placeholder="Contoh: Kitabiyah Salafiyah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi / Target
              </label>
              <input
                type="text"
                value={programForm.duration}
                onChange={e => setProgramForm({ ...programForm, duration: e.target.value })}
                placeholder="Contoh: 3 Tahun / Target 30 Juz"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Program
              </label>
              <select
                value={programForm.status}
                onChange={e => setProgramForm({ ...programForm, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Program
              </label>
              <textarea
                rows={3}
                value={programForm.description}
                onChange={e => setProgramForm({ ...programForm, description: e.target.value })}
                placeholder="Deskripsi penjelasan kurikulum program..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProgramModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Simpan Program
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: TRACK ADD / EDIT */}
      <Modal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title={editingTrack ? 'Edit Cabang Kurikulum' : 'Tambah Cabang Kurikulum (Track)'}
        subtitle="Sub-cabang dari program pendidikan (e.g. Safinatun Najah, Iktisyaf)"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Induk <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={trackForm.program_id}
                onChange={e => setTrackForm({ ...trackForm, program_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Cabang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={trackForm.code}
                onChange={e => setTrackForm({ ...trackForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: SAFINAH / IKTISYAF"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Cabang Kurikulum <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={trackForm.name}
                onChange={e => setTrackForm({ ...trackForm, name: e.target.value })}
                placeholder="Contoh: Safinatun Najah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urutan Tampilan
              </label>
              <input
                type="number"
                value={trackForm.sort_order}
                onChange={e => setTrackForm({ ...trackForm, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={trackForm.status}
                onChange={e => setTrackForm({ ...trackForm, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={trackForm.description}
                onChange={e => setTrackForm({ ...trackForm, description: e.target.value })}
                placeholder="Keterangan kurikulum cabang..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTrackModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Simpan Cabang
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: LEVEL ADD / EDIT */}
      <Modal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        title={editingLevel ? 'Edit Tingkat / Jenjang' : 'Tambah Tingkat / Jenjang Baru'}
        subtitle="Jenjang kelas (e.g. Mubtadi', Mutawassith, Mutaqoddim, Juz 1, Al-Kasyaf)"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveLevel} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Induk <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={levelForm.program_id}
                onChange={e => setLevelForm({ ...levelForm, program_id: e.target.value, track_id: '' })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Pilih Program --</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabang Kurikulum (Opsional)
              </label>
              <select
                value={levelForm.track_id}
                onChange={e => setLevelForm({ ...levelForm, track_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="">-- Tanpa Cabang (Langsung Program) --</option>
                {tracks
                  .filter(t => !levelForm.program_id || t.program_id === levelForm.program_id)
                  .map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Tingkat / Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={levelForm.name}
                onChange={e => setLevelForm({ ...levelForm, name: e.target.value })}
                placeholder="Contoh: Mubtadi' / Juz 1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Tingkat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={levelForm.code}
                onChange={e => setLevelForm({ ...levelForm, code: e.target.value.toUpperCase() })}
                placeholder="Contoh: MUBTADI / JUZ_1"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urutan Jenjang (Level Order) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={levelForm.level_order}
                onChange={e => setLevelForm({ ...levelForm, level_order: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Durasi Standar
              </label>
              <input
                type="text"
                value={levelForm.duration}
                onChange={e => setLevelForm({ ...levelForm, duration: e.target.value })}
                placeholder="Contoh: 1 Tahun"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Materi / Kompetensi
              </label>
              <textarea
                rows={2}
                value={levelForm.description}
                onChange={e => setLevelForm({ ...levelForm, description: e.target.value })}
                placeholder="Deskripsi materi dasar yang dikaji..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsLevelModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Simpan Tingkat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
