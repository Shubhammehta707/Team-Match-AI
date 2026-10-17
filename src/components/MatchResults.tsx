import React, { useState } from 'react';
import { MatchRecommendation, StudentRole } from '../types/student';
import { ROLE_COLORS } from '../data/demoStudents';
import {
  Sparkles,
  ArrowRight,
  UserPlus,
  Eye,
  Check,
  Award,
  Network,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface MatchResultsProps {
  recommendations: MatchRecommendation[];
  source?: 'backend' | 'demo';
  matchedAt?: string;
  onSelectStudent: (studentId: string) => void;
  onFocusInGraph: (studentId: string) => void;
  isLoading: boolean;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  recommendations,
  source = 'demo',
  onSelectStudent,
  onFocusInGraph,
  isLoading,
}) => {
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  const handleInvite = (studentId: string) => {
    setInvitedMap((prev) => ({ ...prev, [studentId]: true }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        </div>
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 animate-pulse shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-10 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-200/60 rounded" />
            <div className="h-16 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 border border-violet-100">
          <Sparkles className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900">
          No matches calculated yet
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Complete your profile on the left and click "Find My Team", or use "Load Demo Profile"
          to preview instant teammate recommendations.
        </p>
      </div>
    );
  }

  // Find max score to mark the highest recommendation
  const highestScore = Math.max(...recommendations.map((r) => r.score));

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Recommended Teammates
            </h2>
            <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 font-mono tabular-nums">
              {recommendations.length} Candidates
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by role synergy, skill complementarity, and shared project vision.
          </p>
        </div>

        {/* Source indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
          <span className="font-medium text-slate-700">
            {source === 'backend' ? 'Live API Match Engine' : 'Demo Mode Recommendations'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-400 italic">Illustrative Scores</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {recommendations.map((match) => {
          const roleConfig = ROLE_COLORS[match.role as StudentRole] || ROLE_COLORS['Frontend'];
          const isInvited = invitedMap[match.id];
          const isTopMatch = match.score === highestScore;

          return (
            <div
              key={match.id}
              className={`group relative rounded-2xl border bg-white p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                isTopMatch
                  ? 'border-violet-300 ring-2 ring-violet-500/10 shadow-md shadow-violet-500/5'
                  : 'border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* Top Match Tag */}
              {isTopMatch && (
                <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  <Award className="h-3 w-3" />
                  <span>Highest Synergy Match</span>
                </div>
              )}

              {/* Top Row: Avatar, Info, and Circular/Gauge Match Score */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-extrabold text-sm text-white shadow-sm"
                    style={{ backgroundColor: roleConfig.hex }}
                  >
                    {match.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                        {match.name}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-lg border font-semibold ${roleConfig.bg} ${roleConfig.border} ${roleConfig.text}`}
                      >
                        {match.role}
                      </span>
                      {match.missingRoleAddressed && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                          Fills Role Gap
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Goal: <span className="text-slate-700 font-medium">{match.goal}</span>
                    </div>
                  </div>
                </div>

                {/* Circular Score Badge with Ring */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="relative flex items-center justify-center h-13 w-13 rounded-full bg-violet-50 border border-violet-100 shadow-2xs">
                    <span className="text-lg font-black text-violet-700 font-mono tabular-nums">
                      {match.score}
                    </span>
                    <span className="absolute -bottom-1 text-[9px] font-bold text-violet-500 uppercase tracking-wider">
                      %
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    Match Score
                  </span>
                </div>
              </div>

              {/* Skills & Shared Interests Pastel Badges */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider shrink-0">
                    Skills:
                  </span>
                  {match.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium border border-slate-200/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider shrink-0">
                    Interests:
                  </span>
                  {match.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs font-medium border border-indigo-100"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Complementary Skills Added */}
              {match.complementarySkills && match.complementarySkills.length > 0 && (
                <div className="mt-3 rounded-xl bg-emerald-50/70 border border-emerald-100 p-2.5 flex items-center gap-2 text-xs text-emerald-900">
                  <span className="font-bold text-emerald-800 shrink-0">Adds to squad:</span>
                  <span className="font-medium text-emerald-700">
                    {match.complementarySkills.join(', ')}
                  </span>
                </div>
              )}

              {/* Specific Explainability Reasons */}
              <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                  <span>Why this teammate is recommended:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {match.reasons.map((reason, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-violet-600 font-bold shrink-0 mt-0.5">•</span>
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onFocusInGraph(match.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors cursor-pointer"
                >
                  <Network className="h-3.5 w-3.5" />
                  <span>Inspect in Network Graph</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectStudent(match.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    View Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInvite(match.id)}
                    disabled={isInvited}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isInvited
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-violet-600 text-white hover:bg-violet-700 shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {isInvited ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
