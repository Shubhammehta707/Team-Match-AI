/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  UserCheck,
  Send,
  AlertCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile, MatchRecommendation } from './types';

interface MatchFinderProps {
  students: StudentProfile[];
  onSelectStudentToInspect: (studentId: string) => void;
}

export const MatchFinder: React.FC<MatchFinderProps> = ({ students, onSelectStudentToInspect }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('stu-12'); // Jordan Lee default
  const [name, setName] = useState<string>('Jordan Lee');
  const [role, setRole] = useState<string>('Frontend Engineer');
  const [skillsInput, setSkillsInput] = useState<string>('React, Next.js, TypeScript, Tailwind CSS');
  const [interestsInput, setInterestsInput] = useState<string>('Healthcare, AI Agents, Accessibility');
  const [goal, setGoal] = useState<string>(
    'Build an accessible web portal for patient vital stats and physician tele-consults'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<{
    matches: MatchRecommendation[];
    disclaimer: string;
    scoringFactors: any;
    query: any;
  } | null>(null);

  // Sync form when student preset dropdown changes
  const handlePresetChange = (stuId: string) => {
    setSelectedStudentId(stuId);
    if (stuId === 'custom') {
      setName('Alex Chen (New Applicant)');
      setRole('Full-Stack Developer');
      setSkillsInput('React, Python, FastAPI, Docker');
      setInterestsInput('FinTech, Open Source, AI Agents');
      setGoal('Build an autonomous financial agent for micro-investing');
      return;
    }

    const found = students.find((s) => s.id === stuId);
    if (found) {
      setName(found.name);
      setRole(found.role);
      setSkillsInput(found.skills.join(', '));
      setInterestsInput(found.interests.join(', '));
      setGoal(found.goal);
    }
  };

  const handleSubmitMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const interests = interestsInput
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const payload = {
      id: selectedStudentId !== 'custom' ? selectedStudentId : undefined,
      name,
      role,
      skills,
      interests,
      goal
    };

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Matching request failed with status ' + response.status);
        setMatchResults(null);
      } else {
        setMatchResults(data);
      }
    } catch (err: any) {
      setError('Network or server error: ' + err.message);
      setMatchResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Run initial match on mount if not yet run
  React.useEffect(() => {
    if (!matchResults && students.length > 0) {
      handleSubmitMatch();
    }
  }, [students]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Explanation */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              POST /api/match Live Recommender
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deterministic Hackathon Teammate Matching
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Calculates explainable compatibility scores (0–100) using <strong>skill complementarity</strong> (bringing missing abilities), <strong>role synergy</strong> (cross-functional squad balance), <strong>shared interests</strong>, and <strong>project goal alignment</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <select
              value={selectedStudentId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <optgroup label="12 Sample Demo Students">
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </optgroup>
              <option value="custom">-- Custom Student Input --</option>
            </select>

            <button
              onClick={() => handleSubmitMatch()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Evaluating...' : 'Find Matches'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Profile & Recommended Teammates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requester Profile Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-slate-100 text-base">Submitting Student Profile</h2>
              </div>
              <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                Self-Match Protected
              </span>
            </div>

            <form onSubmit={handleSubmitMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Hackathon Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  placeholder="e.g. Frontend Engineer, ML / AI Engineer"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  required
                  placeholder="e.g. React, Next.js, TypeScript"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Interests / Themes (comma separated)
                </label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  required
                  placeholder="e.g. Healthcare, AI Agents, Accessibility"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Project Goal & Vision
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                  rows={3}
                  placeholder="What are you building and hoping to accomplish?"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Evaluating Compatibility...' : 'Find Top 3 Teammates'}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Self-Match Guarantee:</strong> Submitting student ({name}) is strictly excluded from recommendations.
              </span>
            </div>
          </div>

          {/* Scoring Factors Breakdown Card */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-3 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              Transparent Scoring Weight Matrix (0–100)
            </h3>
            <ul className="space-y-2">
              <li className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="font-medium text-slate-300">Skill Complementarity</span>
                <span className="font-mono text-indigo-400 font-bold">Max 40 pts (40%)</span>
              </li>
              <li className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="font-medium text-slate-300">Role Cross-Functionality</span>
                <span className="font-mono text-purple-400 font-bold">Max 20 pts (20%)</span>
              </li>
              <li className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="font-medium text-slate-300">Shared Domain Interests</span>
                <span className="font-mono text-pink-400 font-bold">Max 25 pts (25%)</span>
              </li>
              <li className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                <span className="font-medium text-slate-300">Project Goal & Scope Alignment</span>
                <span className="font-mono text-emerald-400 font-bold">Max 15 pts (15%)</span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-400 italic pt-1">
              * Scores are heuristic compatibility indicators calculated deterministically from self-reported profile attributes, not scientifically validated psychological metrics.
            </p>
          </div>
        </div>

        {/* Right Column: Recommendations Results */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/50 p-4 flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Matching Error</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center space-y-3">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
              <p className="text-slate-300 font-medium">Evaluating pool of student profiles...</p>
              <p className="text-slate-500 text-xs">Executing cross-discipline role & skill matrix queries</p>
            </div>
          )}

          {!loading && matchResults && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Top Recommended Teammates
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      {matchResults.matches.length} Matches Found
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ranked by multi-factor deterministic compatibility score
                  </p>
                </div>
              </div>

              {matchResults.matches.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
                  No matches found for the current query criteria.
                </div>
              ) : (
                matchResults.matches.map((match, idx) => (
                  <div
                    key={match.id}
                    className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-xl hover:border-indigo-500/50 transition relative overflow-hidden"
                  >
                    {/* Top match crown/badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg">{match.name}</h3>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                              {match.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">ID: {match.id}</p>
                        </div>
                      </div>

                      {/* Compatibility Gauge Badge */}
                      <div className="text-right">
                        <div className="inline-flex flex-col items-end">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                              {match.score}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">/100</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Fit Score
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Component Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Skills</span>
                          <span className="font-semibold text-indigo-300">
                            {match.breakdown.skillComplementarity}/40
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(match.breakdown.skillComplementarity / 40) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Role</span>
                          <span className="font-semibold text-purple-300">
                            {match.breakdown.roleSynergy}/20
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(match.breakdown.roleSynergy / 20) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Interests</span>
                          <span className="font-semibold text-pink-300">
                            {match.breakdown.sharedInterests}/25
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500 rounded-full"
                            style={{ width: `${(match.breakdown.sharedInterests / 25) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Goal</span>
                          <span className="font-semibold text-emerald-300">
                            {match.breakdown.goalAlignment}/15
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(match.breakdown.goalAlignment / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specific Explanation Reasons */}
                    <div className="space-y-1.5 bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-xl">
                      <h4 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Why This Match Works (Explainability):
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {match.reasons.map((reason, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills & Interests Tags */}
                    <div className="space-y-2 pt-1 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-400 font-medium mr-1">Skills:</span>
                        {match.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-slate-400 font-medium mr-1">Interests:</span>
                        {match.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-2 py-0.5 rounded bg-pink-950/40 text-pink-300 border border-pink-900/40"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 text-slate-400">
                        <span className="font-medium text-slate-300">Project Goal: </span>
                        {match.goal}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
