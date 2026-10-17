import React, { useState } from 'react';
import { Layers, Users, BookOpen, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import { dbService } from '../../services/db';
import { EmptyState } from '../common/EmptyState';
import { SchoolClass } from '../../types/database';

interface ClassesPageProps {
  onFilterByClass?: (classId: string) => void;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({ onFilterByClass }) => {
  const classes = dbService.getClasses();
  const students = dbService.getStudents();
  const teachers = dbService.getTeachers();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Kelas & Rombel Pendidikan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengelompokan santri berdasarkan rombongan belajar tingkat Tsanawiyah, Aliyah, dan Tahfidz
          </p>
        </div>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Belum Ada Data Kelas"
          description="Tabel kelas masih kosong (0 data). Muat data demo untuk melihat contoh penempatan kelas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const enrolledStudents = students.filter(s => s.kelas_id === cls.id && s.status === 'aktif');
            const teacher = teachers.find(t => t.id === cls.wali_kelas_id);

            return (
              <div 
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {cls.tingkat}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      TA {cls.tahun_ajaran}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {cls.nama_kelas}
                  </h3>

                  <div className="text-xs text-slate-500 mb-4">
                    Wali Kelas: <span className="font-semibold text-slate-700">{cls.wali_kelas_nama || teacher?.nama_lengkap || '-'}</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Santri Aktif Terdaftar:</span>
                      <span className="font-bold font-mono text-slate-900">{enrolledStudents.length} Santri</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Kapasitas Maksimal:</span>
                      <span className="font-mono text-slate-700">{cls.kapasitas} Santri</span>
                    </div>
                    {/* Capacity progress bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (enrolledStudents.length / cls.kapasitas) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">ID: {cls.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
