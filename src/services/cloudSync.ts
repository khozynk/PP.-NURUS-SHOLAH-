import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';
import { DatabaseSchema } from '../types/database';
import { dbService } from './db';
import { authService } from './auth';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  lastSyncedBy: string | null;
  errorMessage: string | null;
  syncedModulesCount: number;
}

const COLLECTION_NAME = 'app_sync';
const SYNC_META_DOC = 'sync_meta';

// Helper to remove any undefined values which Firestore rejects
function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

class CloudSyncService {
  private status: SyncStatus = 'idle';
  private lastSyncedAt: string | null = null;
  private lastSyncedBy: string | null = null;
  private errorMessage: string | null = null;
  private unsubscribeSnapshot: Unsubscribe | null = null;
  private syncTimeout: any = null;
  private isProcessingRemoteUpdate: boolean = false;
  private statusListeners: Set<(state: SyncState) => void> = new Set();
  private initialized: boolean = false;
  private localMutationCount: number = 0;

  constructor() {
    // Delay initialization slightly to let app boot
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.init();
      }, 500);
    }
  }

  public getStatus(): SyncState {
    return {
      status: this.status,
      lastSyncedAt: this.lastSyncedAt,
      lastSyncedBy: this.lastSyncedBy,
      errorMessage: this.errorMessage,
      syncedModulesCount: 7
    };
  }

  public subscribeStatus(listener: (state: SyncState) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(): void {
    const s = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(s);
      } catch (err) {
        console.error('Error in sync status listener:', err);
      }
    });
  }

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Listen to local changes to schedule cloud sync
    if (typeof window !== 'undefined') {
      window.addEventListener('database-change', ((event: CustomEvent) => {
        // If the change came from cloud, do not loop back and push to cloud again
        if (event.detail && event.detail.fromCloud) {
          return;
        }
        this.queueLocalToCloudSync();
      }) as EventListener);
    }

    // Start listening for remote changes in Firestore
    this.startRemoteListener();

    // Perform initial pull or seed
    this.pullFromCloudOrSeed();
  }

  /**
   * Listen to real-time changes in Firestore app_sync collection
   */
  private startRemoteListener(): void {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      this.unsubscribeSnapshot = onSnapshot(
        colRef,
        { includeMetadataChanges: true },
        (snapshot) => {
          // If this snapshot has pending local writes, ignore it to prevent loop
          if (snapshot.metadata.hasPendingWrites) {
            return;
          }

          if (this.isProcessingRemoteUpdate) {
            return;
          }

          if (snapshot.empty) {
            return;
          }

          const docsMap: Record<string, any> = {};
          snapshot.forEach(docSnap => {
            docsMap[docSnap.id] = docSnap.data();
          });

          // Check if there is a sync_meta doc
          const meta = docsMap[SYNC_META_DOC];
          if (!meta || !meta.updated_at) {
            return;
          }

          // If the remote timestamp is newer than our local last sync, apply it
          if (this.lastSyncedAt && new Date(meta.updated_at).getTime() <= new Date(this.lastSyncedAt).getTime()) {
            return;
          }

          this.applyRemoteData(docsMap, meta);
        },
        (error) => {
          console.warn('Real-time sync listener warning (offline or reconnecting):', error.message);
          this.status = 'offline';
          this.errorMessage = error.message;
          this.notifyStatus();
        }
      );
    } catch (err: any) {
      console.error('Failed to setup Firestore real-time listener:', err);
      this.status = 'error';
      this.errorMessage = err.message || 'Gagal memulai pemantau real-time cloud';
      this.notifyStatus();
    }
  }

  /**
   * Apply incoming Firestore documents into local dbService and localStorage
   */
  private applyRemoteData(docsMap: Record<string, any>, meta: any): void {
    try {
      this.isProcessingRemoteUpdate = true;
      const partial: Partial<DatabaseSchema> = {};

      if (docsMap['module_core']) {
        const c = docsMap['module_core'];
        if (c.students) partial.students = c.students;
        if (c.student_history) partial.student_history = c.student_history;
        if (c.alumni) partial.alumni = c.alumni;
        if (c.student_graduations) partial.student_graduations = c.student_graduations;
        if (c.student_transfers) partial.student_transfers = c.student_transfers;
        if (c.student_withdrawals) partial.student_withdrawals = c.student_withdrawals;
        if (c.settings) partial.settings = c.settings;
        if (typeof c.is_empty_state === 'boolean') partial.is_empty_state = c.is_empty_state;
      }

      if (docsMap['module_education']) {
        const e = docsMap['module_education'];
        if (e.education_programs) partial.education_programs = e.education_programs;
        if (e.education_tracks) partial.education_tracks = e.education_tracks;
        if (e.education_levels) partial.education_levels = e.education_levels;
        if (e.academic_years) partial.academic_years = e.academic_years;
        if (e.classes) partial.classes = e.classes;
        if (e.rombels) partial.rombels = e.rombels;
        if (e.teachers) partial.teachers = e.teachers;
        if (e.teacher_subjects) partial.teacher_subjects = e.teacher_subjects;
        if (e.subjects) partial.subjects = e.subjects;
        if (e.dorm_buildings) partial.dorm_buildings = e.dorm_buildings;
        if (e.dorm_rooms) partial.dorm_rooms = e.dorm_rooms;
        if (e.student_education_history) partial.student_education_history = e.student_education_history;
        if (e.student_room_history) partial.student_room_history = e.student_room_history;
        if (e.homeroom_history) partial.homeroom_history = e.homeroom_history;
      }

      if (docsMap['module_academic']) {
        const a = docsMap['module_academic'];
        if (a.academic_periods) partial.academic_periods = a.academic_periods;
        if (a.schedules) partial.schedules = a.schedules;
        if (a.grade_components) partial.grade_components = a.grade_components;
        if (a.student_grades) partial.student_grades = a.student_grades;
        if (a.tahfidz_records) partial.tahfidz_records = a.tahfidz_records;
        if (a.tahfidz_targets) partial.tahfidz_targets = a.tahfidz_targets;
        if (a.tahfidz_audit_logs) partial.tahfidz_audit_logs = a.tahfidz_audit_logs;
        if (a.murojaah_records) partial.murojaah_records = a.murojaah_records;
        if (a.btq_records) partial.btq_records = a.btq_records;
        if (a.attendance_records) partial.attendance_records = a.attendance_records;
        if (a.student_reports) partial.student_reports = a.student_reports;
      }

      if (docsMap['module_administration']) {
        const adm = docsMap['module_administration'];
        if (adm.incoming_letters) partial.incoming_letters = adm.incoming_letters;
        if (adm.outgoing_letters) partial.outgoing_letters = adm.outgoing_letters;
        if (adm.student_letters) partial.student_letters = adm.student_letters;
        if (adm.letter_templates) partial.letter_templates = adm.letter_templates;
        if (adm.letter_number_configs) partial.letter_number_configs = adm.letter_number_configs;
        if (adm.student_documents) partial.student_documents = adm.student_documents;
        if (adm.document_archives) partial.document_archives = adm.document_archives;
      }

      if (docsMap['module_finance']) {
        const f = docsMap['module_finance'];
        if (f.financial_categories) partial.financial_categories = f.financial_categories;
        if (f.financial_transactions) partial.financial_transactions = f.financial_transactions;
        if (f.expense_requests) partial.expense_requests = f.expense_requests;
        if (f.expense_approvals) partial.expense_approvals = f.expense_approvals;
        if (f.pondok_budgets) partial.pondok_budgets = f.pondok_budgets;
        if (f.pondok_activities) partial.pondok_activities = f.pondok_activities;
        if (f.activity_participants) partial.activity_participants = f.activity_participants;
        if (f.activity_budgets) partial.activity_budgets = f.activity_budgets;
        if (f.activity_lpjs) partial.activity_lpjs = f.activity_lpjs;
      }

      if (docsMap['module_meetings_ops']) {
        const m = docsMap['module_meetings_ops'];
        if (m.pondok_meetings) partial.pondok_meetings = m.pondok_meetings;
        if (m.meeting_participants) partial.meeting_participants = m.meeting_participants;
        if (m.meeting_agendas) partial.meeting_agendas = m.meeting_agendas;
        if (m.meeting_minutes) partial.meeting_minutes = m.meeting_minutes;
        if (m.meeting_decisions) partial.meeting_decisions = m.meeting_decisions;
        if (m.meeting_followups) partial.meeting_followups = m.meeting_followups;
        if (m.meeting_results) partial.meeting_results = m.meeting_results;
        if (m.meeting_reports) partial.meeting_reports = m.meeting_reports;
        if (m.meeting_monthly_evaluations) partial.meeting_monthly_evaluations = m.meeting_monthly_evaluations;
        if (m.meeting_monthly_plans) partial.meeting_monthly_plans = m.meeting_monthly_plans;
        if (m.meeting_templates) partial.meeting_templates = m.meeting_templates;
        if (m.meeting_attachments) partial.meeting_attachments = m.meeting_attachments;
        if (m.operational_notifications) partial.operational_notifications = m.operational_notifications;
      }

      if (docsMap['module_system']) {
        const s = docsMap['module_system'];
        if (s.users) partial.users = s.users;
        if (s.roles) partial.roles = s.roles;
        if (s.permissions) partial.permissions = s.permissions;
        if (s.audit_logs) partial.audit_logs = s.audit_logs;
      }

      // Merge into local db
      dbService.loadFromCloud(partial);

      this.lastSyncedAt = meta.updated_at || new Date().toISOString();
      this.lastSyncedBy = meta.updated_by || 'Perangkat Lain';
      this.status = 'synced';
      this.errorMessage = null;
      this.notifyStatus();
    } catch (err: any) {
      console.error('Gagal menerapkan perubahan data dari Firestore:', err);
    } finally {
      setTimeout(() => {
        this.isProcessingRemoteUpdate = false;
      }, 300);
    }
  }

  /**
   * Queue sync from local to cloud with debounce
   */
  public queueLocalToCloudSync(): void {
    this.localMutationCount++;
    this.status = 'syncing';
    this.notifyStatus();

    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.syncNow().catch((err) => {
        console.error('Failed to sync to Firestore:', err);
      });
    }, 600);
  }

  /**
   * Push current local database to Firestore
   */
  public async syncNow(): Promise<boolean> {
    try {
      this.status = 'syncing';
      this.errorMessage = null;
      this.notifyStatus();

      const rawDb = dbService.getRawData();
      const currentUser = authService.getCurrentUser();
      const nowIso = new Date().toISOString();
      const author = currentUser ? `${currentUser.nama_lengkap} (${currentUser.role})` : 'Admin Pesantren';

      // 1. Module Core
      const moduleCore = cleanForFirestore({
        id: 'module_core',
        students: rawDb.students || [],
        student_history: rawDb.student_history || [],
        alumni: rawDb.alumni || [],
        student_graduations: rawDb.student_graduations || [],
        student_transfers: rawDb.student_transfers || [],
        student_withdrawals: rawDb.student_withdrawals || [],
        settings: rawDb.settings,
        is_empty_state: !!rawDb.is_empty_state,
        updated_at: nowIso,
        updated_by: author
      });

      // 2. Module Education
      const moduleEducation = cleanForFirestore({
        id: 'module_education',
        education_programs: rawDb.education_programs || [],
        education_tracks: rawDb.education_tracks || [],
        education_levels: rawDb.education_levels || [],
        academic_years: rawDb.academic_years || [],
        classes: rawDb.classes || [],
        rombels: rawDb.rombels || [],
        teachers: rawDb.teachers || [],
        teacher_subjects: rawDb.teacher_subjects || [],
        subjects: rawDb.subjects || [],
        dorm_buildings: rawDb.dorm_buildings || [],
        dorm_rooms: rawDb.dorm_rooms || [],
        student_education_history: rawDb.student_education_history || [],
        student_room_history: rawDb.student_room_history || [],
        homeroom_history: rawDb.homeroom_history || [],
        updated_at: nowIso,
        updated_by: author
      });

      // 3. Module Academic
      const moduleAcademic = cleanForFirestore({
        id: 'module_academic',
        academic_periods: rawDb.academic_periods || [],
        schedules: rawDb.schedules || [],
        grade_components: rawDb.grade_components || [],
        student_grades: rawDb.student_grades || [],
        tahfidz_records: rawDb.tahfidz_records || [],
        tahfidz_targets: rawDb.tahfidz_targets || [],
        tahfidz_audit_logs: (rawDb.tahfidz_audit_logs || []).slice(0, 100),
        murojaah_records: rawDb.murojaah_records || [],
        btq_records: rawDb.btq_records || [],
        attendance_records: rawDb.attendance_records || [],
        student_reports: rawDb.student_reports || [],
        updated_at: nowIso,
        updated_by: author
      });

      // 4. Module Administration
      const moduleAdmin = cleanForFirestore({
        id: 'module_administration',
        incoming_letters: rawDb.incoming_letters || [],
        outgoing_letters: rawDb.outgoing_letters || [],
        student_letters: rawDb.student_letters || [],
        letter_templates: rawDb.letter_templates || [],
        letter_number_configs: rawDb.letter_number_configs || [],
        student_documents: rawDb.student_documents || [],
        document_archives: rawDb.document_archives || [],
        updated_at: nowIso,
        updated_by: author
      });

      // 5. Module Finance
      const moduleFinance = cleanForFirestore({
        id: 'module_finance',
        financial_categories: rawDb.financial_categories || [],
        financial_transactions: rawDb.financial_transactions || [],
        expense_requests: rawDb.expense_requests || [],
        expense_approvals: rawDb.expense_approvals || [],
        pondok_budgets: rawDb.pondok_budgets || [],
        pondok_activities: rawDb.pondok_activities || [],
        activity_participants: rawDb.activity_participants || [],
        activity_budgets: rawDb.activity_budgets || [],
        activity_lpjs: rawDb.activity_lpjs || [],
        updated_at: nowIso,
        updated_by: author
      });

      // 6. Module Meetings & Ops
      const moduleMeetings = cleanForFirestore({
        id: 'module_meetings_ops',
        pondok_meetings: rawDb.pondok_meetings || [],
        meeting_participants: rawDb.meeting_participants || [],
        meeting_agendas: rawDb.meeting_agendas || [],
        meeting_minutes: rawDb.meeting_minutes || [],
        meeting_decisions: rawDb.meeting_decisions || [],
        meeting_followups: rawDb.meeting_followups || [],
        meeting_results: rawDb.meeting_results || [],
        meeting_reports: rawDb.meeting_reports || [],
        meeting_monthly_evaluations: rawDb.meeting_monthly_evaluations || [],
        meeting_monthly_plans: rawDb.meeting_monthly_plans || [],
        meeting_templates: rawDb.meeting_templates || [],
        meeting_attachments: rawDb.meeting_attachments || [],
        operational_notifications: rawDb.operational_notifications || [],
        updated_at: nowIso,
        updated_by: author
      });

      // 7. Module System
      const moduleSystem = cleanForFirestore({
        id: 'module_system',
        users: rawDb.users || [],
        roles: rawDb.roles || [],
        permissions: rawDb.permissions || [],
        audit_logs: (rawDb.audit_logs || []).slice(0, 50),
        updated_at: nowIso,
        updated_by: author
      });

      // 8. Meta Sync
      const syncMeta = cleanForFirestore({
        id: SYNC_META_DOC,
        version: rawDb.version || 1,
        updated_at: nowIso,
        updated_by: author,
        total_students: (rawDb.students || []).length,
        is_empty_state: !!rawDb.is_empty_state
      });

      // Push all partitions in parallel
      await Promise.all([
        setDoc(doc(db, COLLECTION_NAME, 'module_core'), moduleCore, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_education'), moduleEducation, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_academic'), moduleAcademic, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_administration'), moduleAdmin, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_finance'), moduleFinance, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_meetings_ops'), moduleMeetings, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, 'module_system'), moduleSystem, { merge: true }),
        setDoc(doc(db, COLLECTION_NAME, SYNC_META_DOC), syncMeta, { merge: true })
      ]);

      this.lastSyncedAt = nowIso;
      this.lastSyncedBy = author;
      this.status = 'synced';
      this.errorMessage = null;
      this.notifyStatus();
      return true;
    } catch (err: any) {
      console.error('Error during cloud sync to Firestore:', err);
      this.status = 'error';
      this.errorMessage = err.message || 'Gagal menyinkronkan data ke cloud';
      this.notifyStatus();
      return false;
    }
  }

  /**
   * Pull all documents from cloud on startup. If cloud is empty, seed it with current local db.
   */
  public async pullFromCloudOrSeed(): Promise<boolean> {
    try {
      this.status = 'syncing';
      this.notifyStatus();

      const colRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        console.info('Cloud database is empty. Seeding initial local database to Firestore...');
        return await this.syncNow();
      }

      const docsMap: Record<string, any> = {};
      snapshot.forEach(docSnap => {
        docsMap[docSnap.id] = docSnap.data();
      });

      const meta = docsMap[SYNC_META_DOC];
      if (meta && meta.updated_at) {
        this.applyRemoteData(docsMap, meta);
        return true;
      } else {
        // If meta is missing, push local data
        return await this.syncNow();
      }
    } catch (err: any) {
      console.warn('Initial cloud pull failed (device might be offline or initializing):', err.message);
      this.status = 'offline';
      this.errorMessage = err.message;
      this.notifyStatus();
      return false;
    }
  }

  public destroy(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.statusListeners.clear();
    this.initialized = false;
  }
}

export const cloudSyncService = new CloudSyncService();
