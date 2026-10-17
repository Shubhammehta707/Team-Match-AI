/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Send, Check, Copy, AlertCircle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultBody?: any;
  isErrorTest?: boolean;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'health',
    name: '1. Health & Database Connectivity',
    method: 'GET',
    path: '/api/health',
    description: 'Returns application status, active data mode (neo4j | demo), and live DB verification check.'
  },
  {
    id: 'students',
    name: '2. Student Profiles List',
    method: 'GET',
    path: '/api/students',
    description: 'Returns list of 12 sample student profiles with id, name, skills, interests, goal and role.'
  },
  {
    id: 'graph',
    name: '3. Graph Nodes & Relationships',
    method: 'GET',
    path: '/api/graph',
    description: 'Returns structured nodes and edges for (:Student), (:Skill), (:Interest), and (:Project).'
  },
  {
    id: 'match-valid',
    name: '4. Teammate Match (Valid Profile)',
    method: 'POST',
    path: '/api/match',
    description: 'Submits student profile and returns up to 3 recommendations with 0-100 score, reasons, and breakdown.',
    defaultBody: {
      id: 'stu-12',
      name: 'Jordan Lee',
      role: 'Frontend Engineer',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      interests: ['Healthcare', 'AI Agents', 'Accessibility'],
      goal: 'Build an accessible web portal for patient vital stats and physician tele-consults'
    }
  },
  {
    id: 'match-error',
    name: '5. Error Case: Missing Required Skills & Role',
    method: 'POST',
    path: '/api/match',
    description: 'Simulates malformed request to demonstrate 400 Bad Request error handling and validation messages.',
    isErrorTest: true,
    defaultBody: {
      name: 'Unfinished Profile',
      skills: [],
      goal: ''
    }
  }
];

export const ApiConsole: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [customBody, setCustomBody] = useState<string>(
    JSON.stringify(ENDPOINTS[0].defaultBody || {}, null, 2)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseBody, setResponseBody] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setCustomBody(JSON.stringify(ep.defaultBody || {}, null, 2));
    setResponseBody(null);
    setResponseStatus(null);
    setLatency(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseBody(null);
    setResponseStatus(null);
    const start = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = customBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      setResponseStatus(res.status);

      const headersObj: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headersObj[key] = val;
      });
      setResponseHeaders(headersObj);

      const json = await res.json();
      setResponseBody(json);
    } catch (err: any) {
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      setResponseStatus(500);
      setResponseBody({ error: 'Network / Client Execution Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    const origin = window.location.origin;
    if (selectedEndpoint.method === 'GET') {
      return `curl -X GET "${origin}${selectedEndpoint.path}" \\
  -H "Accept: application/json"`;
    }
    return `curl -X POST "${origin}${selectedEndpoint.path}" \\
  -H "Content-Type: application/json" \\
  -d '${customBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Live API Console & Endpoint Tester</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Directly execute and test live backend routes. Inspect HTTP status codes, latency, headers, and formatted JSON payloads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Selector & Request Body */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Endpoint to Test
            </span>

            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{ep.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ep.isErrorTest
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {ep.method} {ep.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.description}</p>
                </button>
              );
            })}
          </div>

          {/* Request Body Editor (if POST) */}
          {selectedEndpoint.method === 'POST' && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  JSON Request Body
                </span>
                <span className="text-[10px] text-slate-500 font-mono">application/json</span>
              </div>
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                rows={9}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Action Trigger */}
          <button
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Executing Request...' : `Send ${selectedEndpoint.method} Request`}
          </button>
        </div>

        {/* Right Column: Response Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">HTTP Response</span>
                {responseStatus !== null && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    Status: {responseStatus}
                  </span>
                )}
                {latency !== null && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {latency}ms
                  </span>
                )}
              </div>

              <button
                onClick={handleCopyCurl}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied cURL' : 'Copy cURL'}
              </button>
            </div>

            {/* Generated cURL preview */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">
              {generateCurl()}
            </div>

            {/* JSON Output Container */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Response Payload (JSON)
              </span>
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2" />
                  <p className="text-xs">Awaiting backend response...</p>
                </div>
              ) : responseBody ? (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[480px]">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              ) : (
                <div className="p-12 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                  Click "Send {selectedEndpoint.method} Request" to test this endpoint.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
