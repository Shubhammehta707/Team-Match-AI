import React, { useState } from 'react';
import { ApiConfig } from '../types/student';
import {
  Network,
  CheckCircle2,
  AlertCircle,
  Server,
  User,
  SlidersHorizontal,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'matching' | 'network' | 'profile' | 'api';
  onSelectTab: (tab: 'dashboard' | 'matching' | 'network' | 'profile' | 'api') => void;
  apiConfig: ApiConfig;
  onOpenApiSettings: () => void;
  userName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  apiConfig,
  onOpenApiSettings,
  userName = 'Demo User',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems: { id: 'dashboard' | 'matching' | 'network' | 'profile' | 'api'; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'matching', label: 'Find Teammates' },
    { id: 'network', label: 'Explore Network' },
    { id: 'profile', label: 'My Profile' },
    { id: 'api', label: 'API Console & Docs' },
  ];

  const handleNavClick = (tab: 'dashboard' | 'matching' | 'network' | 'profile' | 'api') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold tracking-tight text-slate-900">TeamMatch</span>
                <span className="text-lg font-bold text-violet-600">AI</span>
              </div>
              <div className="text-[10px] font-medium text-slate-400 tracking-wide -mt-1 hidden sm:block">
                HACKATHON MATCHER
              </div>
            </div>
          </button>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-sm ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: API Status Badge & User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Badge */}
          <button
            onClick={onOpenApiSettings}
            title="Configure backend or view connection diagnostics"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50/40 hover:text-violet-700 transition-all cursor-pointer"
          >
            {apiConfig.status === 'connected' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-700 font-semibold">Backend Connected</span>
                {apiConfig.latencyMs !== undefined && (
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    ({apiConfig.latencyMs}ms)
                  </span>
                )}
              </>
            ) : apiConfig.status === 'checking' ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                <span className="text-violet-600">Pinging...</span>
              </>
            ) : apiConfig.status === 'error' ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-rose-600">Offline · Demo Fallback</span>
              </>
            ) : (
              <>
                <Server className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-violet-700 font-semibold">Demo Mode</span>
              </>
            )}
            <SlidersHorizontal className="h-3 w-3 text-slate-400 ml-0.5" />
          </button>

          {/* User Profile Avatar / Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 rounded-full p-1 pl-2 pr-1 border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer"
              aria-label="User account menu"
            >
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block max-w-[120px] truncate">
                {userName || 'My Account'}
              </span>
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {userName ? userName.slice(0, 1).toUpperCase() : 'U'}
              </div>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{userName || 'Active Hacker'}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    Mode: {apiConfig.status === 'connected' ? 'Live API' : 'Demo Mode'}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleNavClick('profile');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit Profile & Skills</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenApiSettings();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    <span>API Server Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-violet-50 text-violet-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenApiSettings();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Configure Backend ({apiConfig.status})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
