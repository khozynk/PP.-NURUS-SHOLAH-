import React, { useState } from 'react';
import { 
  Building2, 
  Bed, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ArrowRightLeft, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Clock, 
  X,
  History,
  Layers,
  Award
} from 'lucide-react';
import { dbService } from '../../services/db';
import { authService } from '../../services/auth';
import { DormBuilding, DormRoom, Student, Teacher, StudentRoomHistory } from '../../types/database';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface DormitoryPageProps {
  initialTab?: 'gedung' | 'rooms' | 'occupants' | 'history';
}

export const DormitoryPage: React.FC<DormitoryPageProps> = ({ initialTab = 'rooms' }) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser() || undefined;
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState<'gedung' | 'rooms' | 'occupants' | 'history'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [buildings, setBuildings] = useState<DormBuilding[]>(() => dbService.getDormBuildings());
  const [rooms, setRooms] = useState<DormRoom[]>(() => dbService.getDormRooms());
  const [students, setStudents] = useState<Student[]>(() => dbService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(() => dbService.getTeachers());
  const [roomHistories, setRoomHistories] = useState<StudentRoomHistory[]>(() => dbService.getStudentRoomHistory());

  // Filters
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<DormBuilding | null>(null);
  const [buildingForm, setBuildingForm] = useState({
    nama: '',
    kode: '',
    gender: 'putra' as 'putra' | 'putri',
    lantai_count: 2,
    keterangan: '',
    status: 'aktif' as 'aktif' | 'nonaktif' | 'renovasi'
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<DormRoom | null>(null);
  const [roomForm, setRoomForm] = useState({
    building_id: '',
    nama_kamar: '',
    kode_kamar: '',
    lantai: 1,
    capacity: 12,
    gender: 'putra' as 'putra' | 'putri',
    mentor_id: '',
    status: 'aktif' as 'aktif' | 'penuh' | 'maintenance' | 'nonaktif',
    keterangan: ''
  });

  // Assign Student Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetRoomForAssign, setTargetRoomForAssign] = useState<DormRoom | null>(null);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<string>('');
  const [allowOvercapacityAssign, setAllowOvercapacityAssign] = useState(false);

  // Transfer Student Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [targetRoomForTransfer, setTargetRoomForTransfer] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [transferReason, setTransferReason] = useState<string>('Penataan kapasitas & pembinaan');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [allowOvercapacityTransfer, setAllowOvercapacityTransfer] = useState(false);

  // View Occupants Modal
  const [viewingRoomOccupants, setViewingRoomOccupants] = useState<DormRoom | null>(null);

  const reloadData = () => {
    setBuildings(dbService.getDormBuildings());
    setRooms(dbService.getDormRooms());
    setStudents(dbService.getStudents());
    setTeachers(dbService.getTeachers());
    setRoomHistories(dbService.getStudentRoomHistory());
  };

  // Buildings CRUD
  const handleOpenAddBuilding = () => {
    setEditingBuilding(null);
    setBuildingForm({
      nama: '',
      kode: `GDG-${String(buildings.length + 1).padStart(2, '0')}`,
      gender: 'putra',
      lantai_count: 2,
      keterangan: '',
      status: 'aktif'
    });
    setIsBuildingModalOpen(true);
  };

  const handleOpenEditBuilding = (b: DormBuilding) => {
    setEditingBuilding(b);
    setBuildingForm({
      nama: b.nama,
      kode: b.kode,
      gender: b.gender,
      lantai_count: b.lantai_count || 1,
      keterangan: b.keterangan || '',
      status: b.status
    });
    setIsBuildingModalOpen(true);
  };

  const handleSaveBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingForm.nama.trim()) {
      showToast('Peringatan', 'Nama gedung asrama wajib diisi.', 'error');
      return;
    }

    try {
      if (editingBuilding) {
        dbService.updateDormBuilding(editingBuilding.id, {
          ...buildingForm,
          jumlah_lantai: Number(buildingForm.lantai_count)
        }, currentUser);
        showToast('Berhasil', `Gedung "${buildingForm.nama}" diperbarui.`, 'success');
      } else {
        dbService.createDormBuilding({
          ...buildingForm,
          jumlah_lantai: Number(buildingForm.lantai_count)
        }, currentUser);
        showToast('Berhasil', `Gedung baru "${buildingForm.nama}" ditambahkan.`, 'success');
      }
      setIsBuildingModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan gedung.', 'error');
    }
  };

  const handleDeleteBuilding = (b: DormBuilding) => {
    const bRooms = rooms.filter(r => r.building_id === b.id);
    if (bRooms.length > 0) {
      showToast('Tidak Bisa Dihapus', `Gedung "${b.nama}" masih memiliki ${bRooms.length} kamar. Hapus atau pindahkan kamar terlebih dahulu.`, 'error');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus Gedung "${b.nama}"?`)) return;
    try {
      dbService.deleteDormBuilding(b.id, currentUser);
      showToast('Berhasil', `Gedung "${b.nama}" berhasil dihapus.`, 'success');
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menghapus gedung.', 'error');
    }
  };

  // Rooms CRUD
  const handleOpenAddRoom = (defaultBuildingId?: string) => {
    setEditingRoom(null);
    const bId = defaultBuildingId || buildings[0]?.id || '';
    const selectedB = buildings.find(b => b.id === bId);
    setRoomForm({
      building_id: bId,
      nama_kamar: '',
      kode_kamar: '',
      lantai: 1,
      capacity: 12,
      gender: selectedB?.gender || 'putra',
      mentor_id: teachers[0]?.id || '',
      status: 'aktif',
      keterangan: ''
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (r: DormRoom) => {
    setEditingRoom(r);
    setRoomForm({
      building_id: r.building_id,
      nama_kamar: r.nama_kamar,
      kode_kamar: r.kode_kamar,
      lantai: r.lantai,
      capacity: r.capacity || r.kapasitas || 12,
      gender: r.gender,
      mentor_id: r.mentor_id || '',
      status: r.status as any,
      keterangan: r.keterangan || r.notes || ''
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.nama_kamar.trim() || !roomForm.building_id) {
      showToast('Peringatan', 'Nama kamar dan gedung asrama wajib diisi.', 'error');
      return;
    }

    try {
      const capNum = Number(roomForm.capacity);
      if (editingRoom) {
        dbService.updateDormRoom(editingRoom.id, {
          ...roomForm,
          kapasitas: capNum,
          capacity: capNum,
          lantai: Number(roomForm.lantai)
        }, currentUser);
        showToast('Berhasil', `Kamar "${roomForm.nama_kamar}" diperbarui.`, 'success');
      } else {
        dbService.createDormRoom({
          ...roomForm,
          kapasitas: capNum,
          capacity: capNum,
          lantai: Number(roomForm.lantai)
        }, currentUser);
        showToast('Berhasil', `Kamar baru "${roomForm.nama_kamar}" ditambahkan.`, 'success');
      }
      setIsRoomModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menyimpan kamar.', 'error');
    }
  };

  const handleDeleteRoom = (r: DormRoom) => {
    const occupants = students.filter(s => s.room_id === r.id && s.status === 'aktif');
    if (occupants.length > 0) {
      showToast('Tidak Bisa Dihapus', `Kamar "${r.nama_kamar}" masih memiliki ${occupants.length} penghuni santri aktif.`, 'error');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus Kamar ${r.nama_kamar}?`)) return;

    try {
      dbService.deleteDormRoom(r.id, currentUser);
      showToast('Berhasil', `Kamar "${r.nama_kamar}" dihapus.`, 'success');
      reloadData();
    } catch (err: any) {
      showToast('Gagal', err.message || 'Gagal menghapus kamar.', 'error');
    }
  };

  // Student Assignment
  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoomForAssign || !selectedStudentForAssign) {
      showToast('Peringatan', 'Pilih santri terlebih dahulu.', 'error');
      return;
    }

    try {
      dbService.assignStudentToRoom(
        selectedStudentForAssign,
        targetRoomForAssign.id,
        allowOvercapacityAssign,
        currentUser
      );
      showToast('Berhasil', `Santri berhasil ditempatkan ke kamar ${targetRoomForAssign.nama_kamar}.`, 'success');
      setIsAssignModalOpen(false);
      reloadData();
    } catch (err: any) {
      showToast('Gagal Menempatkan Santri', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Student Room Transfer
  const handleTransferStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToTransfer || !targetRoomForTransfer) {
      showToast('Peringatan', 'Pilih kamar tujuan transfer.', 'warning');
      return;
    }

    try {
      dbService.transferStudentRoom({
        studentId: studentToTransfer.id,
        newRoomId: targetRoomForTransfer,
        transferDate,
        reason: transferReason,
        notes: transferNotes,
        allowOvercapacity: allowOvercapacityTransfer
      }, currentUser);

      showToast('Berhasil', `Santri ${studentToTransfer.nama_lengkap} berhasil dipindahkan ke kamar baru.`, 'success');
      setIsTransferModalOpen(false);
      setViewingRoomOccupants(null);
      reloadData();
    } catch (err: any) {
      showToast('Gagal Memindahkan Santri', err.message || 'Terjadi kesalahan sistem.', 'error');
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    if (buildingFilter !== 'all' && r.building_id !== buildingFilter) return false;
    if (floorFilter !== 'all' && String(r.lantai) !== floorFilter) return false;
    if (genderFilter !== 'all' && r.gender !== genderFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const b = buildings.find(bld => bld.id === r.building_id);
      const matches = 
        r.nama_kamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kode_kamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b && b.nama.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!matches) return false;
    }
    return true;
  });

  // KPI Metrics
  const activeStudents = students.filter(s => s.status === 'aktif' && !s.is_archived);
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.capacity || r.kapasitas || 0), 0);
  const totalOccupants = activeStudents.filter(s => s.room_id).length;
  const santriWithoutRoom = activeStudents.filter(s => !s.room_id);
  const fullRooms = rooms.filter(r => {
    const occ = activeStudents.filter(s => s.room_id === r.id).length;
    const cap = r.capacity || r.kapasitas || 0;
    return cap > 0 && occ >= cap;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-700" />
            <span>Manajemen Asrama & Kamar Santri</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Struktur gedung asrama, kapasitas kamar, penempatan santri, dan riwayat mutasi pindah kamar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddBuilding}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Tambah Gedung</span>
          </button>
          <button
            onClick={() => handleOpenAddRoom()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Gedung</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{buildings.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{rooms.length} Total Kamar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kapasitas Terisi</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-800 mt-2">
            {totalOccupants} <span className="text-xs font-normal text-slate-400">/ {totalCapacity}</span>
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full" 
              style={{ width: `${Math.min(100, (totalOccupants / (totalCapacity || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kamar Penuh</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-2">{fullRooms.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dari {rooms.length} kamar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Belum Punya Kamar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-2">{santriWithoutRoom.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Santri aktif belum ditempatkan</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-px text-xs sm:text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('gedung')}
          className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'gedung'
              ? 'border-emerald-700 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gedung & Lantai ({buildings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'border-emerald-700 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bed className="w-4 h-4" />
          <span>Kamar Santri ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('occupants')}
          className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'occupants'
              ? 'border-emerald-700 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Santri & Penempatan ({totalOccupants})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-emerald-700 text-emerald-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pindah Kamar ({roomHistories.length})</span>
        </button>
      </div>

      {/* TAB 0: GEDUNG & LANTAI */}
      {activeTab === 'gedung' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Struktur Gedung & Lantai Asrama</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur hierarki asrama: Gedung &rarr; Lantai &rarr; Kamar &rarr; Santri
              </p>
            </div>
            <button
              onClick={handleOpenAddBuilding}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Gedung Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map(b => {
              const bRooms = rooms.filter(r => r.building_id === b.id);
              const bRoomIds = new Set(bRooms.map(r => r.id));
              const bOccupants = activeStudents.filter(s => s.room_id && bRoomIds.has(s.room_id));
              const bCapacity = bRooms.reduce((sum, r) => sum + (r.capacity || r.kapasitas || 0), 0);
              const bOccPercent = bCapacity > 0 ? Math.min(100, Math.round((bOccupants.length / bCapacity) * 100)) : 0;
              const maxLantai = b.lantai_count || b.jumlah_lantai || 1;

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {b.kode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.gender === 'putra' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {b.gender === 'putra' ? 'Santri Putra' : 'Santri Putri'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{b.nama}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {maxLantai} Lantai &bull; {bRooms.length} Kamar
                      </p>
                      {b.keterangan && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                          "{b.keterangan}"
                        </p>
                      )}
                    </div>

                    {/* Capacity Indicator */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Hunian Gedung:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {bOccupants.length} / {bCapacity} santri ({bOccPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            bOccPercent >= 100 ? 'bg-rose-500' : bOccPercent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${bOccPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>{bRooms.length} Kamar Terdaftar</span>
                        <span>{Math.max(0, bCapacity - bOccupants.length)} Slot Kosong</span>
                      </div>
                    </div>

                    {/* Floor Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pembagian Lantai:
                      </span>
                      <div className="space-y-1.5">
                        {Array.from({ length: maxLantai }, (_, i) => i + 1).map(fl => {
                          const flRooms = bRooms.filter(r => r.lantai === fl);
                          const flCap = flRooms.reduce((s, r) => s + (r.capacity || r.kapasitas || 0), 0);
                          const flOcc = activeStudents.filter(s => {
                            const rm = flRooms.find(r => r.id === s.room_id);
                            return !!rm;
                          }).length;

                          return (
                            <div key={fl} className="bg-white border border-slate-200/80 rounded-lg p-2 text-xs flex items-center justify-between">
                              <span className="font-semibold text-slate-700">Lantai {fl}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500">{flRooms.length} kamar</span>
                                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                                  {flOcc} / {flCap}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAddRoom(b.id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Tambah Kamar di Gedung Ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Kamar</span>
                      </button>
                      <button
                        onClick={() => {
                          setBuildingFilter(b.id);
                          setActiveTab('rooms');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Lihat Semua Kamar di Gedung Ini"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kamar ({bRooms.length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBuilding(b)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Gedung"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBuilding(b)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Gedung"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: ROOMS GRID & BUILDINGS */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kamar atau gedung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={buildingFilter}
                  onChange={(e) => setBuildingFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Gedung</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.nama}</option>
                  ))}
                </select>

                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Gender</option>
                  <option value="putra">Asrama Putra</option>
                  <option value="putri">Asrama Putri</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm bg-white font-medium text-slate-700"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="penuh">Penuh Saja</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Bed className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm sm:text-base">Belum Ada Kamar Sesuai Filter</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Silakan tambah kamar baru atau sesuaikan filter pencarian asrama di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(r => {
                const bld = buildings.find(b => b.id === r.building_id);
                const mentor = teachers.find(t => t.id === r.mentor_id);
                const occupants = activeStudents.filter(s => s.room_id === r.id);
                const roomCap = r.capacity || r.kapasitas || 12;
                const isFull = occupants.length >= roomCap;
                const occPercent = Math.min(100, Math.round((occupants.length / roomCap) * 100));

                return (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                      isFull ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-slate-200/90 hover:border-emerald-400'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Room Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {r.kode_kamar}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.gender === 'putra' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {r.gender === 'putra' ? 'Santri Putra' : 'Santri Putri'}
                          </span>
                        </div>

                        {isFull ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>KAMAR PENUH</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Tersedia ({roomCap - occupants.length} slot)
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{r.nama_kamar}</h3>
                        <p className="text-xs text-slate-500">
                          {bld?.nama || 'Gedung'} &bull; Lantai {r.lantai}
                        </p>
                      </div>

                      {/* Occupancy Indicator Requirement 15 */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Kapasitas Santri:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {occupants.length} / {r.capacity} santri
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFull ? 'bg-rose-500' : occPercent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${occPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Mentor */}
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Award className="w-3.5 h-3.5 text-purple-700" />
                          <span>Pembimbing Kamar:</span>
                        </div>
                        <p className="font-semibold text-slate-800 pl-5">
                          {mentor?.nama_lengkap || 'Belum Ditentukan'}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingRoomOccupants(r)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Penghuni ({occupants.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setTargetRoomForAssign(r);
                            setSelectedStudentForAssign('');
                            setAllowOvercapacityAssign(false);
                            setIsAssignModalOpen(true);
                          }}
                          disabled={isFull && !isSuperAdmin}
                          className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isFull && !isSuperAdmin
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                          }`}
                          title={isFull && !isSuperAdmin ? 'Kamar penuh, hanya Super Admin yang dapat menambah santri' : 'Tempatkan santri'}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Santri</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditRoom(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Kamar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Kamar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OCCUPANTS LIST */}
      {activeTab === 'occupants' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Daftar Seluruh Penghuni Kamar Asrama</h3>
                <p className="text-xs text-slate-500">Santri aktif yang telah terdaftar di kamar dan gedung asrama</p>
              </div>

              <span className="font-mono text-xs font-semibold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                Total: {totalOccupants} Santri
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Santri</th>
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-4">Asrama & Gedung</th>
                    <th className="py-3 px-4">Kamar</th>
                    <th className="py-3 px-4">Program & Kelas</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {activeStudents.filter(s => s.room_id).map(s => {
                    const r = rooms.find(rm => rm.id === s.room_id);
                    const b = buildings.find(bld => bld.id === r?.building_id);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {s.nama_lengkap}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {s.nis}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {b?.nama || s.asrama || 'Gedung'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {r?.nama_kamar || s.nomor_kamar || 'Kamar'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{s.program}</div>
                          <div className="text-[11px] text-slate-400">Rombel: {s.rombel || '-'}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setStudentToTransfer(s);
                              setTargetRoomForTransfer('');
                              setTransferReason('Mutasi kamar santri');
                              setTransferNotes('');
                              setAllowOvercapacityTransfer(false);
                              setIsTransferModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Pindah Kamar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFER HISTORY AUDIT */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Pindah Kamar (Mutasi Asrama)</h3>
              <p className="text-xs text-slate-500">Catatan lengkap perpindahan kamar santri beserta alasan dan petugas penanggung jawab</p>
            </div>

            {roomHistories.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm">Belum ada riwayat pemindahan kamar yang tercatat.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tanggal Pindah</th>
                      <th className="py-3 px-4">Santri</th>
                      <th className="py-3 px-4">Kamar Asal</th>
                      <th className="py-3 px-4">Kamar Tujuan</th>
                      <th className="py-3 px-4">Alasan & Catatan</th>
                      <th className="py-3 px-4">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {roomHistories.map(rh => {
                      const st = students.find(s => s.id === rh.student_id);
                      const oldR = rooms.find(r => r.id === rh.previous_room_id);
                      const newR = rooms.find(r => r.id === rh.room_id);

                      return (
                        <tr key={rh.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {rh.start_date}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {st?.nama_lengkap || 'Santri'}
                            <div className="text-[11px] font-mono text-slate-400">NIS: {st?.nis || '-'}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            {oldR ? oldR.nama_kamar : '-'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                            {newR ? newR.nama_kamar : 'Kamar Tujuan'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 max-w-xs">
                            <span className="font-semibold block">{rh.alasan}</span>
                            {rh.catatan && <span className="text-[11px] text-slate-400">{rh.catatan}</span>}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {rh.petugas || 'Administrator'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Gedung */}
      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        title={editingBuilding ? 'Ubah Gedung Asrama' : 'Tambah Gedung Asrama Baru'}
        subtitle="Kelola gedung pemukiman santri PP Nurus Sholah"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveBuilding} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Gedung</label>
            <input
              type="text"
              required
              value={buildingForm.nama}
              onChange={(e) => setBuildingForm({ ...buildingForm, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              placeholder="Contoh: Gedung Asrama Putra Sunan Giri"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Gedung</label>
              <input
                type="text"
                required
                value={buildingForm.kode}
                onChange={(e) => setBuildingForm({ ...buildingForm, kode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peruntukan Santri</label>
              <select
                value={buildingForm.gender}
                onChange={(e) => setBuildingForm({ ...buildingForm, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="putra">Santri Putra</option>
                <option value="putri">Santri Putri</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Lantai</label>
              <input
                type="number"
                min={1}
                max={5}
                value={buildingForm.lantai_count}
                onChange={(e) => setBuildingForm({ ...buildingForm, lantai_count: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Gedung</label>
              <select
                value={buildingForm.status}
                onChange={(e) => setBuildingForm({ ...buildingForm, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="aktif">Aktif Digunakan</option>
                <option value="nonaktif">Nonaktif / Renovasi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keterangan Gedung</label>
            <textarea
              rows={2}
              value={buildingForm.keterangan}
              onChange={(e) => setBuildingForm({ ...buildingForm, keterangan: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              placeholder="Fasilitas kamar mandi, aula halaqah, dll..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBuildingModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Gedung
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add/Edit Kamar */}
      <Modal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        title={editingRoom ? 'Ubah Data Kamar Asrama' : 'Tambah Kamar Asrama Baru'}
        subtitle="Pengaturan nama kamar, kapasitas tampung, dan pembimbing"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gedung Asrama <span className="text-rose-500">*</span></label>
            <select
              required
              value={roomForm.building_id}
              onChange={(e) => setRoomForm({ ...roomForm, building_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="">-- Pilih Gedung --</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.nama} ({b.gender === 'putra' ? 'Putra' : 'Putri'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kamar <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={roomForm.nama_kamar}
                onChange={(e) => setRoomForm({ ...roomForm, nama_kamar: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                placeholder="Contoh: Kamar 01 Abu Bakar"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Kamar</label>
              <input
                type="text"
                value={roomForm.kode_kamar}
                onChange={(e) => setRoomForm({ ...roomForm, kode_kamar: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                placeholder="Contoh: KMR-01"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lantai</label>
              <input
                type="number"
                min={1}
                max={5}
                value={roomForm.lantai}
                onChange={(e) => setRoomForm({ ...roomForm, lantai: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kapasitas Maksimal (Santri)</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peruntukan Gender</label>
              <select
                value={roomForm.gender}
                onChange={(e) => setRoomForm({ ...roomForm, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="putra">Santri Putra</option>
                <option value="putri">Santri Putri</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Kamar</label>
              <select
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="penuh">Penuh</option>
                <option value="maintenance">Maintenance</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ustadz Pembimbing Kamar</label>
            <select
              value={roomForm.mentor_id}
              onChange={(e) => setRoomForm({ ...roomForm, mentor_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="">-- Pilih Pembimbing --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nama_lengkap} ({t.jabatan})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Kamar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Penempatan Santri ke Kamar (Requirement 15) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Tempatkan Santri ke ${targetRoomForAssign?.nama_kamar || 'Kamar'}`}
        subtitle={`Kapasitas: ${activeStudents.filter(s => s.room_id === targetRoomForAssign?.id).length} / ${targetRoomForAssign?.capacity || targetRoomForAssign?.kapasitas || 12} santri`}
        maxWidth="lg"
      >
        {targetRoomForAssign && (() => {
          const roomCap = targetRoomForAssign.capacity || targetRoomForAssign.kapasitas || 12;
          const occCount = activeStudents.filter(s => s.room_id === targetRoomForAssign.id).length;
          const isFull = occCount >= roomCap;
          // Available students matching gender (prefer unassigned)
          const eligibleStudents = activeStudents.filter(s => {
            if (targetRoomForAssign.gender === 'putra' && s.jenis_kelamin !== 'L') return false;
            if (targetRoomForAssign.gender === 'putri' && s.jenis_kelamin !== 'P') return false;
            return s.room_id !== targetRoomForAssign.id;
          });

          return (
            <form onSubmit={handleAssignStudent} className="space-y-4 text-xs sm:text-sm">
              {isFull && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">KAMAR PENUH!</h5>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Kamar ini telah mencapai kapasitas {occCount} dari {targetRoomForAssign.capacity} santri. Sesuai ketentuan, santri baru tidak boleh dimasukkan melebihi batas kuota.
                    </p>
                    {isSuperAdmin && (
                      <label className="flex items-center gap-2 mt-2 pt-2 border-t border-rose-200 cursor-pointer font-semibold text-rose-900">
                        <input
                          type="checkbox"
                          checked={allowOvercapacityAssign}
                          onChange={(e) => setAllowOvercapacityAssign(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span>Izinkan Penempatan Khusus (Hak Otoritas Super Admin)</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Santri yang Ditempatkan:
                </label>
                <select
                  required
                  value={selectedStudentForAssign}
                  onChange={(e) => setSelectedStudentForAssign(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Pilih Santri ({eligibleStudents.length} tersedia) --</option>
                  {eligibleStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nama_lengkap} (NIS: {s.nis}) &bull; {s.room_id ? `Saat ini di Kamar lain` : 'Belum Punya Kamar'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isFull && (!isSuperAdmin || !allowOvercapacityAssign)}
                  className={`px-5 py-2 font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    isFull && (!isSuperAdmin || !allowOvercapacityAssign)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  Konfirmasi Penempatan
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Modal: Pindah Kamar (Requirement 16) */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Form Pindah Kamar Santri (Mutasi Asrama)"
        subtitle={studentToTransfer ? `${studentToTransfer.nama_lengkap} (NIS: ${studentToTransfer.nis})` : ''}
        maxWidth="lg"
      >
        {studentToTransfer && (() => {
          const currentRoom = rooms.find(r => r.id === studentToTransfer.room_id);
          const currentBuilding = buildings.find(b => b.id === currentRoom?.building_id);
          const candidateRooms = rooms.filter(r => {
            if (studentToTransfer.jenis_kelamin === 'L' && r.gender !== 'putra') return false;
            if (studentToTransfer.jenis_kelamin === 'P' && r.gender !== 'putri') return false;
            return r.id !== studentToTransfer.room_id;
          });
          const targetRoomObj = rooms.find(r => r.id === targetRoomForTransfer);
          const targetOccCount = targetRoomObj ? activeStudents.filter(s => s.room_id === targetRoomObj.id).length : 0;
          const targetCap = targetRoomObj ? (targetRoomObj.capacity || targetRoomObj.kapasitas || 12) : 12;
          const isTargetFull = targetRoomObj ? targetOccCount >= targetCap : false;

          return (
            <form onSubmit={handleTransferStudent} className="space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Kamar Asal Saat Ini:</span>
                <p className="font-bold text-slate-800 text-sm">
                  {currentRoom ? currentRoom.nama_kamar : studentToTransfer.nomor_kamar || 'Belum Menempati Kamar'}
                </p>
                <p className="text-xs text-slate-500">
                  {currentBuilding?.nama || studentToTransfer.asrama || 'Gedung Asrama PP Nurus Sholah'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kamar Tujuan Pindah <span className="text-rose-500">*</span>:
                </label>
                <select
                  required
                  value={targetRoomForTransfer}
                  onChange={(e) => setTargetRoomForTransfer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Pilih Kamar Tujuan --</option>
                  {candidateRooms.map(r => {
                    const occ = activeStudents.filter(s => s.room_id === r.id).length;
                    const rCap = r.capacity || r.kapasitas || 12;
                    const b = buildings.find(bld => bld.id === r.building_id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.nama_kamar} ({b?.nama}) &bull; Terisi {occ}/{rCap} {occ >= rCap ? '[PENUH]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {isTargetFull && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Peringatan: Kamar Tujuan Penuh ({targetOccCount}/{targetRoomObj?.capacity})</span>
                  </div>
                  {isSuperAdmin ? (
                    <label className="flex items-center gap-2 pt-1 cursor-pointer font-semibold text-amber-900">
                      <input
                        type="checkbox"
                        checked={allowOvercapacityTransfer}
                        onChange={(e) => setAllowOvercapacityTransfer(e.target.checked)}
                        className="rounded text-amber-700"
                      />
                      <span>Izinkan Overcapacity (Otoritas Super Admin)</span>
                    </label>
                  ) : (
                    <p className="text-slate-600">
                      Kamar ini tidak dapat dipilih karena kapasitas telah penuh. Silakan pilih kamar lain atau minta persetujuan Super Admin.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Pindah</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alasan Pindah</label>
                  <input
                    type="text"
                    required
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    placeholder="Contoh: Penataan pembinaan tahfidz"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan Petugas</label>
                <textarea
                  rows={2}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  placeholder="Catatan perpindahan lemari / fasilitas kamar..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isTargetFull && (!isSuperAdmin || !allowOvercapacityTransfer)}
                  className={`px-5 py-2 font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    isTargetFull && (!isSuperAdmin || !allowOvercapacityTransfer)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  Konfirmasi & Proses Pindah
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Modal: View Occupants in a Room (Requirement 15) */}
      <Modal
        isOpen={Boolean(viewingRoomOccupants)}
        onClose={() => setViewingRoomOccupants(null)}
        title={`Daftar Penghuni ${viewingRoomOccupants?.nama_kamar || 'Kamar'}`}
        subtitle={`Kapasitas: ${activeStudents.filter(s => s.room_id === viewingRoomOccupants?.id).length} / ${viewingRoomOccupants?.capacity} Santri`}
        maxWidth="2xl"
      >
        {viewingRoomOccupants && (() => {
          const occupants = activeStudents.filter(s => s.room_id === viewingRoomOccupants.id);
          const bld = buildings.find(b => b.id === viewingRoomOccupants.building_id);

          return (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{bld?.nama || 'Gedung'} &bull; Lantai {viewingRoomOccupants.lantai}</span>
                  <p className="text-slate-500">Kode: {viewingRoomOccupants.kode_kamar} &bull; Gender: {viewingRoomOccupants.gender}</p>
                </div>
                <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  {occupants.length} Santri Terdaftar
                </span>
              </div>

              {occupants.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  Kamar ini masih kosong (belum ada santri yang ditempatkan).
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {occupants.map(s => (
                    <div key={s.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          NIS: {s.nis} &bull; Program: <span className="text-emerald-700 font-medium">{s.program}</span> &bull; Rombel: {s.rombel || '-'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setStudentToTransfer(s);
                          setTargetRoomForTransfer('');
                          setTransferReason('Mutasi kamar');
                          setTransferNotes('');
                          setAllowOvercapacityTransfer(false);
                          setIsTransferModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Pindah</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingRoomOccupants(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
