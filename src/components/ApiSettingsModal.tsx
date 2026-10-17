import React, { useState } from 'react';
import { ApiConfig } from '../types/student';
import { apiService } from '../services/apiService';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Code,
} from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: (config: ApiConfig) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = apiService.getConfig();
  const [urlInput, setUrlInput] = useState(currentConfig.baseUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const cleanInput = urlInput.trim();

    if (!cleanInput) {
      apiService.setBaseUrl('');
      await apiService.checkHealth('');
      onConfigUpdated(apiService.getConfig());
      setTesting(false);
      setTestResult({
        success: true,
        message: 'Reverted to standard local Demo Mode with 12 fictional profiles.',
      });
      return;
    }

    const res = await apiService.checkHealth(cleanInput);
    if (res.connected) {
      apiService.setBaseUrl(cleanInput);
      onConfigUpdated(apiService.getConfig());
      setTestResult({
        success: true,
        message: `Successfully connected to backend! Ping returned in ${res.latencyMs}ms.`,
        latencyMs: res.latencyMs,
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Failed to reach /api/health endpoint.',
      });
    }
    setTesting(false);
  };

  const handleRevertDemo = async () => {
    setUrlInput('');
    apiService.setBaseUrl('');
    await apiService.checkHealth('');
    onConfigUpdated(apiService.getConfig());
    setTestResult({
      success: true,
      message: 'Operating in transparent Demo Mode with local matching algorithm.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close API configuration"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">API Integration Settings</h3>
            <p className="text-xs text-slate-500">
              Configure external backend endpoint or run in standalone Demo Mode.
            </p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600">Current Mode:</span>
            <div className="flex items-center gap-1.5">
              {currentConfig.status === 'connected' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">Backend Connected</span>
                  {currentConfig.latencyMs && (
                    <span className="text-slate-500 font-mono">({currentConfig.latencyMs}ms)</span>
                  )}
                </>
              ) : currentConfig.status === 'error' ? (
                <>
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span className="font-bold text-rose-600">Connection Failed (Fallback to Demo)</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span className="font-bold text-violet-700">Standalone Demo Mode</span>
                </>
              )}
            </div>
          </div>
          {currentConfig.baseUrl && (
            <div className="mt-2 text-xs text-slate-500 truncate font-mono">
              Base URL: {currentConfig.baseUrl}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleTestAndSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              External API Base URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://api.myhackathon.org or http://localhost:8000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-mono focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/15"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Leave empty to run entirely with client-side demo matching.
            </p>
          </div>

          {/* Test Feedback Notice */}
          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleRevertDemo}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Reset to Demo Mode
            </button>

            <button
              type="submit"
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Pinging /api/health...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Test & Save URL</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Expected API Contract Documentation */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Code className="h-3.5 w-3.5 text-violet-600" />
            <span>Expected API Endpoints Contract</span>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 font-mono text-[11px] text-slate-600 space-y-1">
            <div><span className="text-emerald-700 font-bold">GET</span>  /api/health <span className="text-slate-400">→ {"{ status: 'ok' }"}</span></div>
            <div><span className="text-emerald-700 font-bold">GET</span>  /api/students <span className="text-slate-400">→ Array of StudentProfile</span></div>
            <div><span className="text-emerald-700 font-bold">GET</span>  /api/graph <span className="text-slate-400">→ {"{ nodes, edges }"}</span></div>
            <div><span className="text-violet-700 font-bold">POST</span> /api/match <span className="text-slate-400">→ {"{ recommendations: [...] }"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
