/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Search, Filter, Sparkles, FolderGit2, Check, Copy } from 'lucide-react';
import { StudentProfile } from './types';

interface StudentDirectoryProps {
  students: StudentProfile[];
  onSelectForMatching: (studentId: string) => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  onSelectForMatching
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const roles = ['ALL', ...Array.from(new Set(students.map((s) => s.role)))];

  const filteredStudents = students.filter((student) => {
    const matchesRole = roleFilter === 'ALL' || student.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.name.toLowerCase().includes(q) ||
      student.role.toLowerCase().includes(q) ||
      student.goal.toLowerCase().includes(q) ||
      student.skills.some((s) => s.toLowerCase().includes(q)) ||
      student.interests.some((i) => i.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  const handleCopyJson = (student: StudentProfile) => {
    navigator.clipboard.writeText(JSON.stringify(student, null, 2));
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Student Profiles Directory</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
              12 Sample Demo Profiles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Endpoint: <code className="text-indigo-300 font-mono">GET /api/students</code> •
            Consistent sample dataset across matching and graph relationships
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by skill, name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r === 'ALL' ? 'All Roles' : r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 flex flex-col justify-between space-y-4 shadow-lg transition"
          >
            <div className="space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{student.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      {student.id}
                    </span>
                  </div>
                  <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {student.role}
                  </span>
                </div>

                <button
                  onClick={() => handleCopyJson(student)}
                  title="Copy student JSON"
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  {copiedId === student.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Goal */}
              <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                <span className="font-semibold text-slate-400 block mb-0.5">Project Goal:</span>
                "{student.goal}"
              </div>

              {/* Project Association */}
              {student.project && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-300">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Working on: <strong className="text-white">{student.project}</strong></span>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Skills ({student.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Interests ({student.interests.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.interests.map((interest) => (
                    <span
                      key={interest}
                      className="text-xs px-2 py-0.5 rounded bg-pink-950/30 text-pink-300 border border-pink-900/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => onSelectForMatching(student.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Find Teammates for {student.name.split(' ')[0]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
