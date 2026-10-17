import React from 'react';
import { MatchRequest, StudentProfile, StudentRole } from '../types/student';
import { ROLE_COLORS } from '../data/demoStudents';
import { X, CheckCircle2, UserPlus, Target, Sparkles, Code2, Heart } from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentProfile | null;
  currentUserProfile?: MatchRequest | null;
  onClose: () => void;
  onInvite: (studentId: string) => void;
  isInvited: boolean;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  currentUserProfile,
  onClose,
  onInvite,
  isInvited,
}) => {
  if (!student) return null;

  const roleConfig = ROLE_COLORS[student.role] || ROLE_COLORS['Frontend'];

  // Calculate synergy highlights with current user if filled
  const hasUser = !!currentUserProfile && currentUserProfile.skills.length > 0;
  const userSkillsSet = new Set((currentUserProfile?.skills || []).map((s) => s.toLowerCase()));
  const userInterestsSet = new Set((currentUserProfile?.interests || []).map((i) => i.toLowerCase()));

  const sharedInterests = student.interests.filter((i) => userInterestsSet.has(i.toLowerCase()));
  const complementarySkills = student.skills.filter((s) => !userSkillsSet.has(s.toLowerCase()));
  const sharedSkills = student.skills.filter((s) => userSkillsSet.has(s.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-sm"
            style={{ backgroundColor: roleConfig.hex }}
          >
            {student.avatarInitials || student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold border ${roleConfig.bg} ${roleConfig.border} ${roleConfig.text}`}
              >
                {student.role}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {student.bio || 'Active hackathon competitor ready to build high-impact software.'}
            </p>
          </div>
        </div>

        {/* Details Content */}
        <div className="mt-6 space-y-4">
          {/* Goal Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Target className="h-3.5 w-3.5 text-violet-600" />
              <span>Project Ambition / Goal</span>
            </div>
            <p className="mt-1 text-xs text-slate-800 font-medium leading-relaxed">
              "{student.goal}"
            </p>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
              <Code2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Core Skills & Stack</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {student.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Domain Passions</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {student.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Synergy Breakdown with Current User */}
          {hasUser && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                <span>Synergy with your profile ({currentUserProfile?.name})</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                {sharedInterests.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-500">Shared Domain: </span>
                    <span className="text-violet-800 font-medium">{sharedInterests.join(', ')}</span>
                  </div>
                )}
                {complementarySkills.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-500">Adds New Capabilities: </span>
                    <span className="text-emerald-700 font-medium">
                      {complementarySkills.join(', ')}
                    </span>
                  </div>
                )}
                {sharedSkills.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-500">Shared Foundation: </span>
                    <span className="text-slate-800">{sharedSkills.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => onInvite(student.id)}
            disabled={isInvited}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isInvited
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-xs hover:shadow-sm'
            }`}
          >
            {isInvited ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Invite Sent</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Invite to Hackathon Squad</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
