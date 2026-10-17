import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ApiConfig,
  GraphEdge,
  GraphNode,
  MatchRecommendation,
  MatchRequest,
  StudentProfile,
} from './types/student';
import { DEMO_STUDENTS, PRESET_DEMO_PROFILES } from './data/demoStudents';
import { apiService } from './services/apiService';
import { buildStudentGraph } from './services/graphService';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { ProfileForm } from './components/ProfileForm';
import { MatchResults } from './components/MatchResults';
import { NetworkGraph } from './components/NetworkGraph';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { ApiConsole } from './components/ApiConsole';
import { HandoffDocs } from './components/HandoffDocs';
import { Footer } from './components/Footer';
import { Check, ArrowRight, Sparkles, Network, Terminal, BookOpen } from 'lucide-react';

const EMPTY_PROFILE: MatchRequest = {
  name: '',
  skills: [],
  interests: [],
  goal: '',
  role: 'Frontend',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matching' | 'network' | 'profile' | 'api'>('dashboard');
  const [apiSubTab, setApiSubTab] = useState<'tester' | 'docs'>('tester');
  const [currentUser, setCurrentUser] = useState<MatchRequest>(EMPTY_PROFILE);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [matchSource, setMatchSource] = useState<'backend' | 'demo'>('demo');
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Graph state
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [threshold, setThreshold] = useState<number>(2);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Modal and config state
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(apiService.getConfig());
  const [invitedStudents, setInvitedStudents] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Initial data load
  useEffect(() => {
    // Generate initial graph dataset from demo cohort
    const initialGraph = buildStudentGraph(DEMO_STUDENTS, threshold, null);
    setGraphNodes(initialGraph.nodes);
    setGraphEdges(initialGraph.edges);

    // Initial check of backend if configured
    if (apiService.getBaseUrl()) {
      apiService.checkHealth().then(() => {
        setApiConfig(apiService.getConfig());
      });
    }
  }, []);

  // Update graph when threshold or user changes
  const refreshGraph = useCallback(
    (newThreshold: number, user: MatchRequest | null) => {
      const activeUser = user && user.name.trim() ? user : null;
      const updatedGraph = buildStudentGraph(DEMO_STUDENTS, newThreshold, activeUser);
      setGraphNodes(updatedGraph.nodes);
      setGraphEdges(updatedGraph.edges);
    },
    []
  );

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    refreshGraph(newThreshold, currentUser);
  };

  const handleFindTeam = async (profileData: MatchRequest) => {
    setIsLoadingMatches(true);
    setCurrentUser(profileData);

    try {
      const response = await apiService.findMatches(profileData);
      setMatches(response.recommendations);
      setMatchSource(response.source || 'demo');

      // Update graph to include user node and connections
      refreshGraph(threshold, profileData);

      showToast(`Found ${response.recommendations.length} recommended teammates!`);

      // Smooth scroll to results
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch {
      showToast('Error finding matches. Used local matching engine.');
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleQuickLoadDemo = () => {
    const elenaPreset = PRESET_DEMO_PROFILES[0].profile;
    setCurrentUser(elenaPreset);
    handleFindTeam(elenaPreset);
    showToast('Loaded demo profile: Elena Rostova (Frontend)');
  };

  const handleReset = () => {
    setCurrentUser(EMPTY_PROFILE);
    setMatches([]);
    setSelectedStudentId(null);
    setInspectedStudent(null);
    refreshGraph(threshold, null);
    showToast('Reset profile and search results.');
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);

    if (studentId === 'current-user') {
      if (currentUser.name) {
        setInspectedStudent({
          id: 'current-user',
          name: currentUser.name,
          role: currentUser.role as any,
          skills: currentUser.skills,
          interests: currentUser.interests,
          goal: currentUser.goal,
          bio: 'Your current active hacker profile.',
        });
      }
      return;
    }

    const found = DEMO_STUDENTS.find((s) => s.id === studentId);
    if (found) {
      setInspectedStudent(found);
    }
  };

  const handleFocusInGraph = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Switch to network or scroll down to graph section
    const graphElement = document.getElementById('network-graph-section');
    if (graphElement) {
      graphElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInvite = (studentId: string) => {
    setInvitedStudents((prev) => new Set(prev).add(studentId));
    const target = DEMO_STUDENTS.find((s) => s.id === studentId);
    showToast(`Connected with ${target ? target.name : 'teammate'}!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const scrollToForm = () => {
    if (activeTab !== 'dashboard' && activeTab !== 'matching') {
      setActiveTab('dashboard');
    }
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-violet-100 selection:text-violet-900">
      {/* Sleek Top Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        apiConfig={apiConfig}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        userName={currentUser.name}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Tab: Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <HeroSection
              totalProfiles={DEMO_STUDENTS.length}
              activeMatchesCount={matches.length}
              apiConfig={apiConfig}
              onFindTeamClick={scrollToForm}
              onExploreNetworkClick={() => setActiveTab('network')}
              onQuickLoadDemo={handleQuickLoadDemo}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
              {/* 2-Column Split: Form and Results */}
              <div
                ref={formSectionRef}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-20"
              >
                <div className="lg:col-span-6">
                  <ProfileForm
                    initialValues={currentUser}
                    onSubmit={handleFindTeam}
                    onReset={handleReset}
                    isLoading={isLoadingMatches}
                  />
                </div>

                <div ref={resultsSectionRef} className="lg:col-span-6 scroll-mt-20">
                  <MatchResults
                    recommendations={matches}
                    source={matchSource}
                    onSelectStudent={handleSelectStudent}
                    onFocusInGraph={handleFocusInGraph}
                    isLoading={isLoadingMatches}
                  />
                </div>
              </div>

              {/* Full Width Interactive Network Graph */}
              <div id="network-graph-section" className="pt-4 scroll-mt-20">
                <NetworkGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={handleSelectStudent}
                  threshold={threshold}
                  onChangeThreshold={handleThresholdChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Find Teammates (Matching focused view) */}
        {activeTab === 'matching' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Find Your Hackathon Teammates
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Submit your project focus and skills to get immediate explainable recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <ProfileForm
                  initialValues={currentUser}
                  onSubmit={handleFindTeam}
                  onReset={handleReset}
                  isLoading={isLoadingMatches}
                />
              </div>

              <div className="lg:col-span-6">
                <MatchResults
                  recommendations={matches}
                  source={matchSource}
                  onSelectStudent={handleSelectStudent}
                  onFocusInGraph={handleFocusInGraph}
                  isLoading={isLoadingMatches}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Explore Network */}
        {activeTab === 'network' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Student Collaboration Network
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Interactive topological graph of all 12 student profiles, skills, and shared interests.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <NetworkGraph
              nodes={graphNodes}
              edges={graphEdges}
              selectedStudentId={selectedStudentId}
              onSelectStudent={handleSelectStudent}
              threshold={threshold}
              onChangeThreshold={handleThresholdChange}
            />

            {/* Quick Directory Grid */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                All Cohort Members ({DEMO_STUDENTS.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {DEMO_STUDENTS.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className="text-left rounded-2xl border border-slate-200/90 bg-white p-4 hover:border-violet-300 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 border border-violet-100">
                        {student.role}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 truncate">
                      {student.skills.join(' · ')}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 truncate">
                      "{student.goal}"
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: My Profile */}
        {activeTab === 'profile' && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                My Hacker Profile & Preferences
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Update your skills and hackathon aspirations to recalculate teammate synergies.
              </p>
            </div>

            <ProfileForm
              initialValues={currentUser}
              onSubmit={(vals) => {
                handleFindTeam(vals);
                setActiveTab('dashboard');
              }}
              onReset={handleReset}
              isLoading={isLoadingMatches}
            />
          </div>
        )}

        {/* Tab: API Console & Docs */}
        {activeTab === 'api' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Backend API Console & Integration Specs
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Live HTTP route testing, Neo4j graph endpoints, schema contracts, and developer handoff.
                </p>
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setApiSubTab('tester')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    apiSubTab === 'tester'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Interactive Endpoint Tester</span>
                </button>
                <button
                  onClick={() => setApiSubTab('docs')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    apiSubTab === 'docs'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Integration Guide & Contracts</span>
                </button>
              </div>
            </div>

            {apiSubTab === 'tester' ? <ApiConsole /> : <HandoffDocs />}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Student Details Modal */}
      <StudentDetailModal
        student={inspectedStudent}
        currentUserProfile={currentUser.skills.length > 0 ? currentUser : null}
        onClose={() => setInspectedStudent(null)}
        onInvite={handleInvite}
        isInvited={inspectedStudent ? invitedStudents.has(inspectedStudent.id) : false}
      />

      {/* API Integration Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onConfigUpdated={(cfg) => setApiConfig(cfg)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs font-bold text-slate-900 shadow-xl shadow-slate-200/50 backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="h-5 w-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
