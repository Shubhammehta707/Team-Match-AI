import React, { useState } from 'react';
import { MatchRequest, StudentRole } from '../types/student';
import {
  POPULAR_INTERESTS,
  POPULAR_SKILLS,
  PREFERRED_ROLES,
  PRESET_DEMO_PROFILES,
} from '../data/demoStudents';
import {
  User,
  Search,
  RotateCcw,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  Briefcase,
  Lightbulb,
  Heart,
  Tag,
} from 'lucide-react';

interface ProfileFormProps {
  initialValues: MatchRequest;
  onSubmit: (values: MatchRequest) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialValues,
  onSubmit,
  onReset,
  isLoading,
}) => {
  const [formData, setFormData] = useState<MatchRequest>(initialValues);
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  // Sync state if initialValues changes (e.g. from reset or demo load)
  React.useEffect(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues]);

  const toggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const newSkills = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: '' }));
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkill('');
      if (errors.skills) setErrors((prev) => ({ ...prev, skills: '' }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const newInterests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: '' }));
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInterest.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setCustomInterest('');
      if (errors.interests) setErrors((prev) => ({ ...prev, interests: '' }));
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interestToRemove),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your name or handle.';
    }
    if (formData.skills.length === 0) {
      newErrors.skills = 'Select or enter at least one skill.';
    }
    if (formData.interests.length === 0) {
      newErrors.interests = 'Select or enter at least one interest.';
    }
    if (!formData.goal.trim()) {
      newErrors.goal = 'Briefly state your project goal or hackathon idea.';
    }
    if (!formData.role) {
      newErrors.role = 'Please choose your preferred role.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleLoadPreset = (preset: (typeof PRESET_DEMO_PROFILES)[0]) => {
    setFormData({
      name: preset.profile.name,
      skills: [...preset.profile.skills],
      interests: [...preset.profile.interests],
      goal: preset.profile.goal,
      role: preset.profile.role,
    });
    setErrors({});
    setShowPresetsMenu(false);
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      skills: [],
      interests: [],
      goal: '',
      role: 'Frontend',
    });
    setCustomSkill('');
    setCustomInterest('');
    setErrors({});
    onReset();
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Tell us about yourself
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Define your skills, passions, and project ambition to find your matching squad.
          </p>
        </div>

        {/* Load Demo Profile Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-600" />
            <span>Load Demo Profile</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showPresetsMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowPresetsMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Choose a pre-filled profile
                </div>
                {PRESET_DEMO_PROFILES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="w-full text-left rounded-xl p-2.5 text-xs text-slate-700 hover:bg-violet-50/80 hover:text-violet-900 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900">{preset.label}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {preset.profile.role} · {preset.profile.skills.slice(0, 3).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Name and Role in 2-column grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Name Input with User Icon */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Your Name or Handle <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                placeholder="e.g. Alex Rivera"
                className={`w-full rounded-xl border bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/15'
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Preferred Role Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Preferred Role in Team <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value as StudentRole });
                  if (errors.role) setErrors({ ...errors, role: '' });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15 cursor-pointer transition-all"
              >
                {PREFERRED_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Skills Section with Selectable Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-violet-600" />
              <span>Skills (Select multiple)</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              {formData.skills.length} selected
            </span>
          </div>

          {/* Selected Chips */}
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-violet-100 border border-violet-200 px-2.5 py-1 text-xs font-semibold text-violet-800 shadow-2xs animate-in fade-in"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-violet-500 hover:text-violet-900 cursor-pointer ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {POPULAR_SKILLS.map((skill) => {
              const active = formData.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-violet-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {active ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>

          {/* Custom Skill Input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Or type a custom skill (e.g. Flutter, PyTorch)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSkill(e);
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 text-violet-600" />
              <span>Add</span>
            </button>
          </div>
          {errors.skills && <p className="mt-1 text-xs text-rose-500">{errors.skills}</p>}
        </div>

        {/* Interests Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Interests & Project Domains</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              {formData.interests.length} selected
            </span>
          </div>

          {/* Selected Interests */}
          {formData.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-800 shadow-2xs animate-in fade-in"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="text-indigo-400 hover:text-indigo-800 cursor-pointer ml-0.5"
                    aria-label={`Remove ${interest}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick Select Interests */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {POPULAR_INTERESTS.map((interest) => {
              const active = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {active ? `✓ ${interest}` : `+ ${interest}`}
                </button>
              );
            })}
          </div>

          {/* Custom Interest Input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Or type a custom interest (e.g. EdTech, Climate)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomInterest(e);
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleAddCustomInterest}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 text-indigo-600" />
              <span>Add</span>
            </button>
          </div>
          {errors.interests && <p className="mt-1 text-xs text-rose-500">{errors.interests}</p>}
        </div>

        {/* Project Goal Section */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span>Project Goal & Idea</span>
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.goal}
            onChange={(e) => {
              setFormData({ ...formData, goal: e.target.value });
              if (errors.goal) setErrors({ ...errors, goal: '' });
            }}
            placeholder="e.g. Build an interactive AI tutor for college STEM students with real-time feedback"
            className={`w-full rounded-xl border bg-slate-50/50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none ${
              errors.goal
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/15'
            }`}
          />
          {errors.goal && <p className="mt-1 text-xs text-rose-500">{errors.goal}</p>}
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/35 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Finding Matches...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Find My Team</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
