/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { authService } from './services/auth';
import { dbService } from './services/db';
import { cloudSyncService } from './services/cloudSync';
import { Student, StudentStatus } from './types/database';

// Layout & Context
import { ToastProvider, useToast } from './components/common/Toast';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { ComingSoon } from './components/common/ComingSoon';
import { RunningSlogan } from './components/common/RunningSlogan';

// Authentication
import { LoginPage } from './components/auth/LoginPage';

// Pages
import { DashboardPage } from './components/dashboard/DashboardPage';
import { StudentListPage } from './components/students/StudentListPage';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { StudentFormModal } from './components/students/StudentFormModal';
import { StudentStatusModal } from './components/students/StudentStatusModal';
import { GraduationProcessModal } from './components/students/GraduationProcessModal';
import { TransferProcessModal } from './components/students/TransferProcessModal';
import { WithdrawalProcessModal } from './components/students/WithdrawalProcessModal';
import { RollbackStatusModal } from './components/students/RollbackStatusModal';
import { AlumniListPage } from './components/alumni/AlumniListPage';
import { StudentHistoryPage } from './components/history/StudentHistoryPage';
import { ClassesPage } from './components/classes/ClassesPage';
import { EducationDashboard } from './components/education/EducationDashboard';
import { ProgramHierarchyPage } from './components/education/ProgramHierarchyPage';
import { AcademicYearPage } from './components/education/AcademicYearPage';
import { ClassManagementPage } from './components/education/ClassManagementPage';
import { RombelPage } from './components/education/RombelPage';
import { ClassPromotionPage } from './components/education/ClassPromotionPage';
import { TeacherListPage } from './components/teachers/TeacherListPage';
import { SubjectManagementPage } from './components/education/SubjectManagementPage';
import { DormitoryPage } from './components/dormitory/DormitoryPage';

// STAGE 5: AKADEMIK & PEMBELAJARAN
import { AcademicDashboard } from './components/academic/AcademicDashboard';
import { ScheduleManagementPage } from './components/academic/ScheduleManagementPage';
import { GradeComponentPage } from './components/academic/GradeComponentPage';
import { StudentGradesPage } from './components/academic/StudentGradesPage';
import { KitabiyahGradesPage } from './components/academic/KitabiyahGradesPage';
import { TahfidzPage } from './components/academic/TahfidzPage';
import { MurojaahPage } from './components/academic/MurojaahPage';
import { BTQPage } from './components/academic/BTQPage';
import { AttendancePage } from './components/academic/AttendancePage';
import { StudentReportCardPage } from './components/academic/StudentReportCardPage';
import { AcademicSummaryPage } from './components/academic/AcademicSummaryPage';

// STAGE 6: SURAT-MENYURAT, DOKUMEN SANTRI, ARSIP & TEMPLATE SURAT
import { AdministrationDashboard } from './components/administration/AdministrationDashboard';
import { IncomingLettersPage } from './components/administration/IncomingLettersPage';
import { OutgoingLettersPage } from './components/administration/OutgoingLettersPage';
import { StudentLettersPage } from './components/administration/StudentLettersPage';
import { LetterTemplatesPage } from './components/administration/LetterTemplatesPage';
import { LetterNumberConfigPage } from './components/administration/LetterNumberConfigPage';
import { StudentDocumentsPage } from './components/administration/StudentDocumentsPage';
import { DocumentArchivesPage } from './components/administration/DocumentArchivesPage';

// RAPAT & EVALUASI BULANAN
import { MeetingDashboard } from './components/meetings/MeetingDashboard';
import { MeetingAgendaPage } from './components/meetings/MeetingAgendaPage';
import { MeetingDetailPage } from './components/meetings/MeetingDetailPage';
import { MeetingResultsPage } from './components/meetings/MeetingResultsPage';
import { MeetingFollowupPage } from './components/meetings/MeetingFollowupPage';
import { MeetingReportsPage } from './components/meetings/MeetingReportsPage';
import { MeetingCalendarPage } from './components/meetings/MeetingCalendarPage';
import { MeetingArchivesPage } from './components/meetings/MeetingArchivesPage';
import { LiveNotetakerStudio } from './components/meetings/LiveNotetakerStudio';

import { PesantrenProfilePage } from './components/settings/PesantrenProfilePage';
import { UsersManagementPage } from './components/settings/UsersManagementPage';
import { RolePermissionsPage } from './components/settings/RolePermissionsPage';
import { AppSettingsPage } from './components/settings/AppSettingsPage';
import { AuditLogPage } from './components/audit/AuditLogPage';
import { StudentReportPage } from './components/reports/StudentReportPage';
import { StatusReportPage } from './components/reports/StatusReportPage';
import { EducationReportPage } from './components/reports/EducationReportPage';
import { AdministrationReportPage } from './components/reports/AdministrationReportPage';
import { UserProfileModal } from './components/settings/UserProfileModal';

function AppContent() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentViewParam, setCurrentViewParam] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);

  const handleNavigate = useCallback((view: string, param?: any) => {
    setCurrentView(view);
    if (param !== undefined) {
      setCurrentViewParam(param);
    }
  }, []);

  // Modals state
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [studentToChangeStatus, setStudentToChangeStatus] = useState<Student | null>(null);
  const [studentToGraduate, setStudentToGraduate] = useState<Student | null>(null);
  const [studentToTransfer, setStudentToTransfer] = useState<Student | null>(null);
  const [studentToWithdraw, setStudentToWithdraw] = useState<Student | null>(null);
  const [studentToRollback, setStudentToRollback] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleDataChange = useCallback(() => {
    setDataVersion(prev => prev + 1);
  }, []);

  // Sync session on mount and listen for real-time cloud data updates from other devices
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    cloudSyncService.init();

    const handleDbEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      setDataVersion(prev => prev + 1);
      if (customEvent.detail && customEvent.detail.fromCloud) {
        showToast('Sinkronisasi Real-Time', 'Perubahan data dari perangkat lain berhasil disinkronkan ke layar.', 'info');
      }
    };

    window.addEventListener('database-change', handleDbEvent);
    window.addEventListener('storage', handleDbEvent);
    return () => {
      window.removeEventListener('database-change', handleDbEvent);
      window.removeEventListener('storage', handleDbEvent);
    };
  }, [showToast]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
    showToast('Login Berhasil', 'Selamat datang di Sistem Manajemen Data Santri PP Nurus Sholah.', 'success');
  };

  const handleReactivateStudent = (student: Student) => {
    try {
      dbService.reactivateStudent(student.id, 'Santri diaktifkan kembali oleh pengurus/admin', authService.getCurrentUser() || undefined);
      showToast('Santri Diaktifkan', `Status ${student.nama_lengkap} kini telah Aktif kembali.`, 'success');
      handleDataChange();
      setSelectedStudentDetail(null);
    } catch (err: any) {
      showToast('Gagal Mengaktifkan', err.message || 'Terjadi kesalahan.', 'error');
    }
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      dbService.deleteStudent(studentToDelete.id, authService.getCurrentUser() || undefined);
      showToast('Santri Dihapus', `Data santri ${studentToDelete.nama_lengkap} telah dihapus.`, 'info');
      setStudentToDelete(null);
      handleDataChange();
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-spatial-3d text-slate-800 flex flex-col antialiased relative selection:bg-emerald-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Ambient 3D Depth Lights (Enclosed to prevent horizontal scroll bleed) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header
        key={`header-${dataVersion}`}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigate={setCurrentView}
        onOpenMyProfile={() => setIsProfileModalOpen(true)}
        onDataChange={handleDataChange}
      />

      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Sidebar */}
        <Sidebar
          key={`sidebar-${dataVersion}`}
          currentView={currentView}
          onNavigate={setCurrentView}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 flex flex-col overflow-y-auto overflow-x-hidden w-full max-w-full">
          <div className="p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-12 flex-1">
            {/* Running Slogan Ticker Ribbon */}
            <RunningSlogan
              key={`slogan-${dataVersion}`}
              onDataChange={handleDataChange}
              className="mb-4 sm:mb-6"
            />

            {/* VIEW ROUTER */}
            {currentView === 'dashboard' && (
              <DashboardPage
                key={`dash-${dataVersion}`}
                onNavigate={setCurrentView}
                onOpenAddStudent={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
                onSelectStudent={setSelectedStudentDetail}
                onDataChange={handleDataChange}
              />
            )}

            {currentView === 'santri_aktif' && (
              <StudentListPage
                key={`santri-aktif-${dataVersion}`}
                initialStatusFilter="aktif"
                title="Data Santri Aktif"
                subtitle="Direktori santri aktif yang sedang menempuh pendidikan di PP Nurus Sholah"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'calon_santri' && (
              <StudentListPage
                key={`calon-santri-${dataVersion}`}
                initialStatusFilter="calon_santri"
                title="Data Calon Santri"
                subtitle="Pendaftar baru yang sedang dalam proses verifikasi atau seleksi masuk"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'santri_lulus' && (
              <StudentListPage
                key={`santri-lulus-${dataVersion}`}
                initialStatusFilter="lulus"
                title="Data Santri Lulus"
                subtitle="Santri yang telah dinyatakan lulus munaqasyah dan menyelesaikan kurikulum"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'santri_pindah' && (
              <StudentListPage
                key={`santri-pindah-${dataVersion}`}
                initialStatusFilter="pindah"
                title="Data Santri Pindah"
                subtitle="Santri yang berpindah atau mutasi ke pondok pesantren / sekolah lain"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'santri_keluar' && (
              <StudentListPage
                key={`santri-keluar-${dataVersion}`}
                initialStatusFilter="keluar"
                title="Data Santri Keluar"
                subtitle="Santri yang mengundurkan diri atau keluar sebelum menyelesaikan kurikulum"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'santri_tidak_aktif' && (
              <StudentListPage
                key={`santri-tidak-aktif-${dataVersion}`}
                initialStatusFilter="tidak_aktif"
                title="Data Santri Tidak Aktif"
                subtitle="Santri yang sedang cuti, sakit panjang, atau dinonaktifkan sementara"
                onSelectStudent={setSelectedStudentDetail}
                onEditStudent={(s) => {
                  setStudentToEdit(s);
                  setIsFormModalOpen(true);
                }}
                onChangeStatus={setStudentToChangeStatus}
                onDeleteStudent={setStudentToDelete}
                onOpenAddModal={() => {
                  setStudentToEdit(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {currentView === 'alumni' && (
              <AlumniListPage
                key={`alumni-${dataVersion}`}
                onSelectStudent={setSelectedStudentDetail}
                onDataChange={handleDataChange}
              />
            )}

            {currentView === 'riwayat_santri' && (
              <StudentHistoryPage
                key={`history-${dataVersion}`}
                onSelectStudent={setSelectedStudentDetail}
              />
            )}

            {/* STAGE 4: PENDIDIKAN, STRUKTUR, KELAS, ROMBEL, USTADZ & ASRAMA */}
            {currentView === 'pendidikan_dashboard' && (
              <EducationDashboard
                key={`edu-dash-${dataVersion}`}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'pendidikan_program' && (
              <ProgramHierarchyPage
                key={`edu-prog-${dataVersion}`}
              />
            )}

            {currentView === 'pendidikan_tahun_ajaran' && (
              <AcademicYearPage
                key={`edu-ay-${dataVersion}`}
              />
            )}

            {currentView === 'pendidikan_kelas' && (
              <ClassManagementPage
                key={`kelas-${dataVersion}`}
                onNavigateToRombel={(cId) => {
                  setCurrentView('pendidikan_rombel');
                }}
              />
            )}

            {currentView === 'pendidikan_rombel' && (
              <RombelPage
                key={`rombel-${dataVersion}`}
              />
            )}

            {currentView === 'pendidikan_kenaikan' && (
              <ClassPromotionPage
                key={`promotion-${dataVersion}`}
              />
            )}

            {currentView === 'pendidikan_guru' && (
              <TeacherListPage
                key={`guru-${dataVersion}`}
              />
            )}

            {currentView === 'pendidikan_mapel' && (
              <SubjectManagementPage
                key={`mapel-${dataVersion}`}
              />
            )}

            {/* STAGE 4: ASRAMA & KAMAR */}
            {(currentView === 'asrama_gedung_kamar' ||
              currentView === 'asrama_gedung' ||
              currentView === 'asrama_kamar' ||
              currentView === 'asrama_penempatan' ||
              currentView === 'asrama_riwayat') && (
              <DormitoryPage
                key={`asrama-${currentView}-${dataVersion}`}
                initialTab={
                  currentView === 'asrama_gedung'
                    ? 'gedung'
                    : currentView === 'asrama_penempatan'
                    ? 'occupants'
                    : currentView === 'asrama_riwayat'
                    ? 'history'
                    : 'rooms'
                }
              />
            )}

            {/* STAGE 5: AKADEMIK & PEMBELAJARAN */}
            {currentView === 'akademik_dashboard' && (
              <AcademicDashboard
                key={`akd-dash-${dataVersion}`}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'akademik_mapel' && (
              <SubjectManagementPage
                key={`akd-mapel-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_jadwal' && (
              <ScheduleManagementPage
                key={`akd-jadwal-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_penilaian' && (
              <GradeComponentPage
                key={`akd-cmp-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_nilai' && (
              <StudentGradesPage
                key={`akd-nilai-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_absensi' && (
              <AttendancePage
                key={`akd-abs-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_tahfidz' && (
              <TahfidzPage
                key={`akd-thf-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_murojaah' && (
              <MurojaahPage
                key={`akd-mrj-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_btq' && (
              <BTQPage
                key={`akd-btq-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_kitabiyah' && (
              <KitabiyahGradesPage
                key={`akd-ktb-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_rapor' && (
              <StudentReportCardPage
                key={`akd-rpr-${dataVersion}`}
              />
            )}

            {currentView === 'akademik_rekap' && (
              <AcademicSummaryPage
                key={`akd-rkp-${dataVersion}`}
              />
            )}

            {/* SEGERA HADIR: MODUL KEGIATAN */}
            {currentView === 'kegiatan_absensi' && (
              <ComingSoon
                title="Absensi & Kehadiran Santri"
                category="Kegiatan"
                description="Pencatatan presensi sholat berjamaah, pengajian sorogan, dan kegiatan asrama."
                plannedFeatures={[
                  'Presensi jamaah 5 waktu di masjid',
                  'Absensi halaqah Al-Qur\'an dan sorogan',
                  'Pencatatan izin pulang dan surat jalan wali',
                  'Rekap bulanan kedisiplinan asrama'
                ]}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'kegiatan_prestasi' && (
              <ComingSoon
                title="Prestasi & Piagam Santri"
                category="Kegiatan"
                description="Pendataan prestasi lomba MQK, MTQ, pidato bahasa Arab/Inggris, dan kejuaraan akademik."
                plannedFeatures={[
                  'Pencatatan medali dan juara tingkat kabupaten/provinsi',
                  'Arsip foto dan sertifikat kejuaraan',
                  'Pemberian beasiswa santri berprestasi',
                  'Statistik prestasi pesantren tahunan'
                ]}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'kegiatan_pembinaan' && (
              <ComingSoon
                title="Pembinaan & Kedisiplinan Santri"
                category="Kegiatan"
                description="Sistem konseling keamanan, buku pelanggaran ketertiban, dan pemantauan akhlak."
                plannedFeatures={[
                  'Sistem poin kedisiplinan dan tata tertib asrama',
                  'Konseling pembinaan wali asrama dan guru',
                  'Pemberitahuan resmi ke wali santri',
                  'Pembersihan catatan pasca-taubat/pembinaan'
                ]}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {/* RAPAT & EVALUASI BULANAN */}
            {(currentView === 'meet_dashboard' || currentView === 'administrasi_rapat') && (
              <MeetingDashboard
                key={`meet-dash-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_agenda_list' && (
              <MeetingAgendaPage
                key={`meet-agd-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_monthly' && (
              <MeetingAgendaPage
                key={`meet-mth-${dataVersion}`}
                onNavigate={handleNavigate}
                initialTypeFilter="Rapat Bulanan"
              />
            )}

            {currentView === 'meet_results' && (
              <MeetingResultsPage
                key={`meet-res-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_followup' && (
              <MeetingFollowupPage
                key={`meet-flw-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_reports' && (
              <MeetingReportsPage
                key={`meet-rep-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_calendar' && (
              <MeetingCalendarPage
                key={`meet-cal-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_archives' && (
              <MeetingArchivesPage
                key={`meet-arc-${dataVersion}`}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_detail' && (
              <MeetingDetailPage
                key={`meet-dtl-${dataVersion}`}
                meetingId={currentViewParam?.meetingId || 'mtg-01'}
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'meet_live_notulen' && (
              <LiveNotetakerStudio
                key={`meet-studio-${dataVersion}-${currentViewParam?.meetingId || 'def'}`}
                meetingId={currentViewParam?.meetingId}
                onNavigate={handleNavigate}
                onRefreshData={handleDataChange}
              />
            )}

            {currentView === 'administrasi_lpj' && (
              <ComingSoon
                title="Laporan Pertanggungjawaban (LPJ)"
                category="Administrasi"
                description="Pengarsipan LPJ kegiatan imtihan, PHBI, pembangunan fasilitas, dan kas pesantren."
                plannedFeatures={[
                  'Penyusunan LPJ kegiatan Haflah Akhirussanah',
                  'Pelaporan keuangan operasional bulanan',
                  'Penyimpanan bukti kuitansi & nota digital',
                  'Approval bertingkat pengasuh pesantren'
                ]}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}

            {/* STAGE 6: ADMINISTRASI, SURAT & DOKUMEN */}
            {currentView === 'admin_dashboard' && (
              <AdministrationDashboard
                key={`admin-dash-${dataVersion}`}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'admin_surat_masuk' && (
              <IncomingLettersPage
                key={`admin-inc-${dataVersion}`}
              />
            )}

            {currentView === 'admin_surat_keluar' && (
              <OutgoingLettersPage
                key={`admin-out-${dataVersion}`}
              />
            )}

            {currentView === 'admin_surat_santri' && (
              <StudentLettersPage
                key={`admin-stl-${dataVersion}`}
              />
            )}

            {currentView === 'admin_surat_keterangan' && (
              <StudentLettersPage
                key={`admin-sk-${dataVersion}`}
                initialJenisFilter="Surat Keterangan Santri"
              />
            )}

            {currentView === 'admin_surat_izin' && (
              <StudentLettersPage
                key={`admin-izn-${dataVersion}`}
                initialJenisFilter="Surat Izin"
              />
            )}

            {currentView === 'admin_surat_pengantar' && (
              <StudentLettersPage
                key={`admin-png-${dataVersion}`}
                initialJenisFilter="Surat Pengantar"
              />
            )}

            {currentView === 'admin_surat_panggilan' && (
              <StudentLettersPage
                key={`admin-pngl-${dataVersion}`}
                initialJenisFilter="Surat Panggilan"
              />
            )}

            {currentView === 'admin_surat_pernyataan' && (
              <StudentLettersPage
                key={`admin-prn-${dataVersion}`}
                initialJenisFilter="Surat Pernyataan"
              />
            )}

            {currentView === 'admin_surat_tugas' && (
              <StudentLettersPage
                key={`admin-tgs-${dataVersion}`}
                initialJenisFilter="Surat Tugas"
              />
            )}

            {currentView === 'admin_surat_rekomendasi' && (
              <StudentLettersPage
                key={`admin-rkm-${dataVersion}`}
                initialJenisFilter="Surat Rekomendasi"
              />
            )}

            {currentView === 'admin_template_surat' && (
              <LetterTemplatesPage
                key={`admin-tpl-${dataVersion}`}
              />
            )}

            {currentView === 'admin_nomor_surat' && (
              <LetterNumberConfigPage
                key={`admin-num-${dataVersion}`}
              />
            )}

            {currentView === 'admin_dokumen_santri' && (
              <StudentDocumentsPage
                key={`admin-doc-${dataVersion}`}
              />
            )}

            {currentView === 'admin_arsip_dokumen' && (
              <DocumentArchivesPage
                key={`admin-arc-${dataVersion}`}
              />
            )}

            {/* MODUL LAPORAN */}
            {currentView === 'laporan_santri' && (
              <StudentReportPage key={`laporan-${dataVersion}`} />
            )}

            {currentView === 'laporan_status' && (
              <StatusReportPage key={`laporan-status-${dataVersion}`} />
            )}

            {currentView === 'laporan_pendidikan' && (
              <EducationReportPage key={`laporan-pendidikan-${dataVersion}`} />
            )}

            {currentView === 'laporan_alumni' && (
              <StudentReportPage key={`laporan-alumni-${dataVersion}`} />
            )}

            {currentView === 'laporan_administrasi' && (
              <AdministrationReportPage key={`laporan-administrasi-${dataVersion}`} />
            )}

            {/* MODUL PENGATURAN */}
            {currentView === 'profil_pesantren' && (
              <PesantrenProfilePage 
                key={`profil-${dataVersion}`} 
                onDataChange={handleDataChange} 
              />
            )}

            {currentView === 'pengguna' && (
              <UsersManagementPage 
                key={`users-${dataVersion}`} 
                onDataChange={handleDataChange} 
              />
            )}

            {currentView === 'hak_akses' && (
              <RolePermissionsPage key={`roles-${dataVersion}`} />
            )}

            {currentView === 'pengaturan_app' && (
              <AppSettingsPage
                key={`settings-${dataVersion}`}
                onDataChange={handleDataChange}
              />
            )}

            {currentView === 'audit_log' && (
              <AuditLogPage key={`audit-${dataVersion}`} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Thumb Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onQuickAddStudent={() => {
          setStudentToEdit(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* GLOBAL MODALS */}
      {/* 1. Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudentDetail}
        isOpen={!!selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        onEdit={(s) => {
          setSelectedStudentDetail(null);
          setStudentToEdit(s);
          setIsFormModalOpen(true);
        }}
        onChangeStatus={(s) => {
          setSelectedStudentDetail(null);
          setStudentToChangeStatus(s);
        }}
        onGraduate={(s) => {
          setSelectedStudentDetail(null);
          setStudentToGraduate(s);
        }}
        onTransfer={(s) => {
          setSelectedStudentDetail(null);
          setStudentToTransfer(s);
        }}
        onWithdraw={(s) => {
          setSelectedStudentDetail(null);
          setStudentToWithdraw(s);
        }}
        onRollback={(s) => {
          setSelectedStudentDetail(null);
          setStudentToRollback(s);
        }}
        onReactivate={handleReactivateStudent}
      />

      {/* 2. Student Form Modal (Create & Edit with all 28 fields) */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        onSuccess={handleDataChange}
      />

      {/* 3. Student Status & Mutation Modal */}
      <StudentStatusModal
        isOpen={!!studentToChangeStatus}
        onClose={() => setStudentToChangeStatus(null)}
        student={studentToChangeStatus}
        onSuccess={handleDataChange}
      />

      {/* 4. Proses Kelulusan Modal (Section 4 & 5) */}
      <GraduationProcessModal
        isOpen={!!studentToGraduate}
        onClose={() => setStudentToGraduate(null)}
        student={studentToGraduate}
        onSuccess={handleDataChange}
      />

      {/* 5. Proses Pindah Modal (Section 12) */}
      <TransferProcessModal
        isOpen={!!studentToTransfer}
        onClose={() => setStudentToTransfer(null)}
        student={studentToTransfer}
        onSuccess={handleDataChange}
      />

      {/* 6. Proses Keluar Modal (Section 14) */}
      <WithdrawalProcessModal
        isOpen={!!studentToWithdraw}
        onClose={() => setStudentToWithdraw(null)}
        student={studentToWithdraw}
        onSuccess={handleDataChange}
      />

      {/* 7. Rollback Status Modal (Section 16: Super Admin) */}
      <RollbackStatusModal
        isOpen={!!studentToRollback}
        onClose={() => setStudentToRollback(null)}
        student={studentToRollback}
        onSuccess={handleDataChange}
      />

      {/* 8. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        title="Hapus / Arsipkan Data Santri"
        message={`Apakah Anda yakin ingin menghapus data santri "${studentToDelete?.nama_lengkap}" (NIS: ${studentToDelete?.nis})? Tindakan ini akan dicatat ke dalam audit log.`}
        confirmText="Ya, Hapus Data"
        cancelText="Batal"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* 9. User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={handleDataChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
