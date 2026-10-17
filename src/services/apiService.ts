import { DEMO_STUDENTS } from '../data/demoStudents';
import { ApiConfig, GraphEdge, GraphNode, MatchRecommendation, MatchRequest, MatchResponse, StudentProfile } from '../types/student';
import { buildStudentGraph } from './graphService';
import { calculateLocalMatches } from './matchingAlgorithm';

const API_STORAGE_KEY = 'team_match_api_base_url';

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string = '';
  private config: ApiConfig = {
    baseUrl: '',
    status: 'demo',
    lastChecked: undefined,
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(API_STORAGE_KEY);
      const envUrl = import.meta.env.VITE_API_BASE_URL || '';
      this.baseUrl = (stored !== null ? stored : envUrl || window.location.origin)
        .trim()
        .replace(/\/+$/, '');
      this.config.baseUrl = this.baseUrl;
      if (!this.baseUrl) {
        this.config.status = 'demo';
      }
    }
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.trim().replace(/\/+$/, '');
    this.config.baseUrl = this.baseUrl;
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_STORAGE_KEY, this.baseUrl);
    }
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Performs an honest health check against the configured backend.
   * Never displays a false "connected" status.
   */
  public async checkHealth(customUrl?: string): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
    const targetUrl = (customUrl !== undefined ? customUrl : this.baseUrl).trim();

    if (!targetUrl) {
      this.config = {
        baseUrl: '',
        status: 'demo',
        lastChecked: new Date().toISOString(),
        errorMessage: undefined,
        backendMode: 'demo',
        databaseConnected: false,
        databaseMessage: 'No backend URL configured. Using local demo data.',
      };
      return { connected: false, error: 'No backend URL configured. Operating in transparent Demo Mode.' };
    }

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    this.config.status = 'checking';
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(`${cleanUrl}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      const latencyMs = Math.round(performance.now() - startTime);
      const health = await response.json();

      if (response.ok && health?.status === 'ok') {
        this.config = {
          baseUrl: cleanUrl,
          status: 'connected',
          latencyMs,
          lastChecked: new Date().toISOString(),
          errorMessage: undefined,
          backendMode: health.mode === 'neo4j' ? 'neo4j' : 'demo',
          databaseConnected: health.database?.connected === true,
          databaseMessage:
            typeof health.database?.message === 'string'
              ? health.database.message
              : 'Database connectivity was not reported by the backend.',
        };
        return { connected: true, latencyMs };
      } else {
        const errText = response.ok
          ? 'Backend health response did not report status "ok".'
          : `HTTP ${response.status} ${response.statusText}`;
        this.config = {
          baseUrl: cleanUrl,
          status: 'error',
          lastChecked: new Date().toISOString(),
          errorMessage: errText,
          backendMode: health?.mode === 'neo4j' ? 'neo4j' : 'demo',
          databaseConnected: health?.database?.connected === true,
          databaseMessage: health?.database?.message,
        };
        return { connected: false, error: errText };
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      const errMsg = isAbort ? 'Connection timed out (3.5s)' : (err?.message || 'Network unreachable');

      this.config = {
        baseUrl: cleanUrl,
        status: 'error',
        lastChecked: new Date().toISOString(),
        errorMessage: errMsg,
        backendMode: 'demo',
        databaseConnected: false,
        databaseMessage: 'Backend health check failed; using local demo data.',
      };
      return { connected: false, error: errMsg };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Retrieves student profiles from live backend or local demo dataset.
   */
  public async getStudents(): Promise<{ students: StudentProfile[]; source: 'backend' | 'demo' }> {
    if (this.config.status === 'connected' && this.baseUrl) {
      try {
        const cleanUrl = this.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/students`, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const payload = await res.json();
          const list = Array.isArray(payload)
            ? payload
            : payload?.data ?? payload?.students;
          if (
            !Array.isArray(list) ||
            !list.every(
              (student) =>
                student &&
                typeof student.id === 'string' &&
                typeof student.name === 'string' &&
                typeof student.role === 'string' &&
                Array.isArray(student.skills) &&
                Array.isArray(student.interests) &&
                typeof student.goal === 'string'
            )
          ) {
            throw new Error('Backend returned an invalid student response.');
          }
          return {
            students: list,
            source: payload?.mode === 'demo' ? 'demo' : 'backend',
          };
        }
        throw new Error(`Student request failed with HTTP ${res.status}.`);
      } catch {
        this.markRequestFailure('Student request failed. Using local demo data.');
      }
    }

    return { students: DEMO_STUDENTS, source: 'demo' };
  }

  /**
   * Retrieves network graph from live backend or local computation.
   */
  public async getGraph(
    threshold: number = 2,
    userProfile?: MatchRequest | null
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[]; source: 'backend' | 'demo' }> {
    // The interactive network is a student-affinity graph, while /api/graph
    // returns a typed entity graph. Derive this view from the active profiles.
    const { students, source } = await this.getStudents();
    const graph = buildStudentGraph(students, threshold, userProfile);
    return { ...graph, source };
  }

  /**
   * Performs teammate matching.
   * If live backend is connected, queries POST /api/match.
   * If unavailable or unconfigured, uses transparent local explainable algorithm.
   */
  public async findMatches(request: MatchRequest): Promise<MatchResponse> {
    if (this.config.status === 'connected' && this.baseUrl) {
      try {
        const cleanUrl = this.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (res.ok) {
          const payload = await res.json();
          const resultList = payload.recommendations ?? payload.matches;
          if (!Array.isArray(resultList)) {
            throw new Error('Backend returned an invalid match response.');
          }
          const recommendations: MatchRecommendation[] = resultList
            .filter(
              (match: any) =>
                match &&
                typeof match.id === 'string' &&
                typeof match.name === 'string' &&
                typeof match.score === 'number' &&
                Array.isArray(match.skills) &&
                Array.isArray(match.interests) &&
                Array.isArray(match.reasons)
            )
            .map((match: any) => ({
              ...match,
              goal: typeof match.goal === 'string' ? match.goal : '',
              complementarySkills: Array.isArray(match.complementarySkills)
                ? match.complementarySkills
                : match.skills.filter(
                    (skill: string) =>
                      !request.skills.some(
                        (userSkill) =>
                          userSkill.toLowerCase().trim() === skill.toLowerCase().trim()
                      )
                  ),
            }));

          return {
            recommendations: recommendations.slice(0, 3).map((r) => ({
              ...r,
              isDemoResult: payload.mode !== 'neo4j',
            })),
            source: payload.mode === 'neo4j' ? 'backend' : 'demo',
            matchedAt: new Date().toISOString(),
            totalEvaluated: payload.totalEvaluated || payload.count || recommendations.length,
          };
        }
        throw new Error(`Match request failed with HTTP ${res.status}.`);
      } catch {
        this.markRequestFailure('Match request failed. Using the local matching engine.');
      }
    }

    // Local transparent matching fallback
    const localRecommendations = calculateLocalMatches(request, DEMO_STUDENTS, 3);
    return {
      recommendations: localRecommendations,
      source: 'demo',
      matchedAt: new Date().toISOString(),
      totalEvaluated: DEMO_STUDENTS.length,
    };
  }

  private markRequestFailure(message: string) {
    this.config = {
      ...this.config,
      status: 'error',
      lastChecked: new Date().toISOString(),
      errorMessage: message,
    };
  }
}

export const apiService = ApiService.getInstance();
