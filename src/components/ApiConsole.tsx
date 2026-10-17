import React, { useState } from 'react';
import { Activity, Play } from 'lucide-react';
import { apiService } from '../services/apiService';

const MATCH_EXAMPLE = {
  name: 'Demo Student',
  role: 'Frontend Engineer',
  skills: ['React', 'TypeScript'],
  interests: ['Education', 'AI'],
  goal: 'Build an AI-powered learning assistant',
};

const endpoints = [
  { method: 'GET', path: '/api/health', label: 'Health and database status' },
  { method: 'GET', path: '/api/students', label: 'Student profiles' },
  { method: 'GET', path: '/api/graph', label: 'Graph nodes and edges' },
  { method: 'POST', path: '/api/match', label: 'Match recommendations' },
] as const;

export const ApiConsole: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<(typeof endpoints)[number]['path']>(
    endpoints[0].path
  );
  const [body, setBody] = useState(JSON.stringify(MATCH_EXAMPLE, null, 2));
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; duration: number; body: string } | null>(
    null
  );

  const selectedEndpoint = endpoints.find((endpoint) => endpoint.path === selectedPath)!;

  const runRequest = async () => {
    setLoading(true);
    setResponse(null);
    const startedAt = performance.now();
    try {
      const baseUrl = apiService.getBaseUrl() || window.location.origin;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { Accept: 'application/json' },
      };
      if (selectedEndpoint.method === 'POST') {
        JSON.parse(body);
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
        options.body = body;
      }
      const result = await fetch(`${baseUrl.replace(/\/+$/, '')}${selectedPath}`, options);
      const responseText = await result.text();
      let formattedBody = responseText;
      try {
        formattedBody = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch {
        // Preserve non-JSON backend errors for inspection.
      }
      setResponse({
        status: result.status,
        duration: Math.round(performance.now() - startedAt),
        body: formattedBody,
      });
    } catch (error) {
      setResponse({
        status: 0,
        duration: Math.round(performance.now() - startedAt),
        body: error instanceof Error ? error.message : 'Request failed.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-600" />
          <h1 className="text-xl font-bold text-slate-900">API Console</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Execute the documented backend endpoints against the configured API. Requests use the
          same origin by default.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Endpoint
            </span>
            <select
              value={selectedPath}
              onChange={(event) => setSelectedPath(event.target.value as typeof selectedPath)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            >
              {endpoints.map((endpoint) => (
                <option key={endpoint.path} value={endpoint.path}>
                  {endpoint.method} {endpoint.path} — {endpoint.label}
                </option>
              ))}
            </select>
          </label>

          {selectedEndpoint.method === 'POST' && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                JSON request body
              </span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={11}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 outline-none focus:border-violet-400"
              />
            </label>
          )}

          <button
            type="button"
            onClick={runRequest}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Sending request…' : `Send ${selectedEndpoint.method}`}
          </button>
        </div>

        <div className="min-h-64 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-semibold text-slate-900">Response</h2>
            {response && (
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-xs ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {response.status || 'Network error'} · {response.duration} ms
              </span>
            )}
          </div>
          <pre className="mt-4 max-h-[34rem] min-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300">
            {response?.body ?? 'Select an endpoint and send a request to inspect its response.'}
          </pre>
        </div>
      </div>
    </section>
  );
};
