import React from 'react';
import {
  Users,
  Sparkles,
  Network,
  CheckCircle,
  Code2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';
import { ApiConfig } from '../types/student';

interface HeroSectionProps {
  totalProfiles: number;
  roleCount: number;
  skillCount: number;
  activeMatchesCount: number;
  apiConfig: ApiConfig;
  onFindTeamClick: () => void;
  onExploreNetworkClick: () => void;
  onQuickLoadDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalProfiles,
  roleCount,
  skillCount,
  activeMatchesCount,
  apiConfig,
  onFindTeamClick,
  onExploreNetworkClick,
  onQuickLoadDemo,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white px-4 pt-10 pb-12 sm:px-6 lg:px-8">
      {/* Subtle ambient gradient backdrop */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-200/30 via-indigo-100/30 to-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-10 -z-10 h-64 w-64 rounded-full bg-violet-100/40 blur-2xl" />

      <div className="mx-auto max-w-7xl">
        {/* Hero Top Grid: Heading on left, Connected network illustration on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Small AI-powered matching badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1 text-xs font-semibold text-violet-700 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" />
              <span>Explainable Teammate Discovery</span>
              <span className="text-violet-300">·</span>
              <span className="text-[11px] font-normal text-violet-600">Explainable Skill Matching</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-[1.15]">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                Hackathon Team
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Discover like-minded builders, connect complementary skills, and turn your next big idea into reality.
              Every recommendation features transparent synergy rationales and mutual passion alignment.
            </p>

            {/* Functional Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onFindTeamClick}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Find My Team</span>
              </button>

              <button
                onClick={onExploreNetworkClick}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
              >
                <Network className="h-4 w-4 text-violet-600" />
                <span>Explore Network</span>
              </button>

              <button
                onClick={onQuickLoadDemo}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <span>Load Sample Profile</span>
              </button>
            </div>
          </div>

          {/* Right Side: Tasteful Abstract Illustration of Connected Profiles */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-md">
              {/* Card Header label */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800">Illustrative Sample Trio</span>
                </div>
                <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                  96% illustrative
                </span>
              </div>

              {/* Connected student profile avatars */}
              <div className="space-y-3 relative">
                {/* SVG connection lines */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-300 via-indigo-200 to-sky-300 -z-10" />

                {/* Profile Node 1: AI/ML */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs hover:border-violet-200 transition-all">
                  <div className="h-9 w-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
                    AA
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">Aarav</span>
                      <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        AI/ML
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">Python · LLMs · Data Analysis</div>
                  </div>
                </div>

                {/* Profile Node 2: Designer */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs hover:border-rose-200 transition-all">
                  <div className="h-9 w-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-200">
                    DI
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">Diya</span>
                      <span className="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Designer
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">UI/UX · Figma · Accessibility</div>
                  </div>
                </div>

                {/* Profile Node 3: Frontend */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 shadow-xs hover:border-sky-200 transition-all">
                  <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200">
                    KA
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">Kabir</span>
                      <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        Frontend
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">React · TypeScript · CSS</div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Shared Interest: <strong className="text-slate-700 font-semibold">Education & AI</strong></span>
                <span className="text-emerald-600 font-semibold">Full Stack Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics - 4 Compact Attractive Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Card 1: Student Profiles */}
          <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Student Profiles</span>
              <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:scale-105 transition-transform">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalProfiles}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {apiConfig.status === 'connected' && apiConfig.backendMode === 'neo4j'
                  ? 'Neo4j profiles'
                  : 'demo profiles'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Across {roleCount} role tracks
            </div>
          </div>

          {/* Card 2: Available Teammates */}
          <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Candidate Profiles</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalProfiles}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 font-semibold">
                in directory
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Profiles available for matching</div>
          </div>

          {/* Card 3: Successful Matches */}
          <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-sky-200 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Recommendations</span>
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {activeMatchesCount}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {activeMatchesCount === 1 ? 'result' : 'results'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Illustrative compatibility scores</div>
          </div>

          {/* Card 4: Skills Connected */}
          <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Unique Skills</span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                <Code2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {skillCount}
              </span>
              <span className="text-[11px] font-medium text-slate-400">skill domains</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Across student profiles</div>
          </div>
        </div>
      </div>
    </section>
  );
};
