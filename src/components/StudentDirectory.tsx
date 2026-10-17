import React, { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { StudentProfile } from '../types/student';

interface StudentDirectoryProps {
  students: StudentProfile[];
  source: 'backend' | 'demo';
  onSelectStudent: (studentId: string) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  source,
  onSelectStudent,
}) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All roles');
  const roles = useMemo(
    () => ['All roles', ...Array.from(new Set(students.map((student) => student.role))).sort()],
    [students]
  );
  const filteredStudents = students.filter((student) => {
    const query = search.trim().toLowerCase();
    const matchesRole = role === 'All roles' || student.role === role;
    const matchesSearch =
      !query ||
      [student.name, student.role, student.goal, ...student.skills, ...student.interests].some(
        (value) => value.toLowerCase().includes(query)
      );
    return matchesRole && matchesSearch;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            <h1 className="text-xl font-bold text-slate-900">Student Directory</h1>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
              {source === 'backend' ? 'Backend data' : 'Demo data'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {filteredStudents.length} of {students.length} profiles
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, role, skill..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-violet-400 sm:w-64"
            />
          </label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400"
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No student profiles match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <article
              key={student.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900">{student.name}</h2>
                  <p className="mt-0.5 text-sm font-medium text-violet-700">{student.role}</p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-500">
                  {student.id}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{student.goal}</p>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Skills
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Interests
                </p>
                <p className="mt-1.5 text-sm text-slate-600">{student.interests.join(' · ')}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className="mt-5 w-full rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                View profile
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
