import React from 'react';
import { Network } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white shadow-2xs">
            <Network className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-slate-800">TeamMatch AI</span>
          <span className="text-slate-300">·</span>
          <span>Student Hackathon Teammate Matching Platform</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 flex-wrap">
          <span>Demo fallback available</span>
          <span className="text-slate-300">·</span>
          <span>Explainable Synergy Engine</span>
          <span className="text-slate-300">·</span>
          <span>Cytoscape.js Network</span>
        </div>
      </div>
    </footer>
  );
};
