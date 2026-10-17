/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MatchFinder } from './components/MatchFinder';
import { StudentDirectory } from './components/StudentDirectory';
import { GraphViewer } from './components/GraphViewer';
import { ApiConsole } from './components/ApiConsole';
import { HandoffDocs } from './components/HandoffDocs';
import { StudentProfile, HealthResponse } from './types';
import { AlertCircle, Server } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'match' | 'students' | 'graph' | 'api' | 'handoff'>('match');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch health check
  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      console.error('Health fetch failed:', err);
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStudents(data.data);
      }
    } catch (err: any) {
      console.error('Students fetch failed:', err);
      setError('Could not connect to backend /api/students: ' + err.message);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchStudents();
  }, []);

  const handleSelectStudentForMatching = (studentId: string) => {
    setActiveTab('match');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        loadingHealth={loadingHealth}
        onRefreshHealth={fetchHealth}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Match Finder */}
        {activeTab === 'match' && (
          <MatchFinder
            students={students}
            onSelectStudentToInspect={handleSelectStudentForMatching}
          />
        )}

        {/* Tab 2: 12 Demo Profiles Directory */}
        {activeTab === 'students' && (
          <StudentDirectory
            students={students}
            onSelectForMatching={handleSelectStudentForMatching}
          />
        )}

        {/* Tab 3: Graph Viewer */}
        {activeTab === 'graph' && <GraphViewer />}

        {/* Tab 4: Live API Console & Tester */}
        {activeTab === 'api' && <ApiConsole />}

        {/* Tab 5: Frontend Integration Handoff & Docs */}
        {activeTab === 'handoff' && <HandoffDocs />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">TeamMatch AI</span>
            <span>•</span>
            <span>Hackathon Squad Recommendation Backend</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GET /api/health</span>
            <span>GET /api/students</span>
            <span>GET /api/graph</span>
            <span>POST /api/match</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
