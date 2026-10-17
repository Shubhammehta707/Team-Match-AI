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
      const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
      this.baseUrl = (stored !== null ? stored : envUrl).trim();
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
    this.baseUrl = url.trim();
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
      };
      return { connected: false, error: 'No backend URL configured. Operating in transparent Demo Mode.' };
    }

    this.config.status = 'checking';
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      // Normalize target URL (remove trailing slash)
      const cleanUrl = targetUrl.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        this.config = {
          baseUrl: cleanUrl,
          status: 'connected',
          latencyMs,
          lastChecked: new Date().toISOString(),
          errorMessage: undefined,
        };
        return { connected: true, latencyMs };
      } else {
        const errText = `HTTP ${response.status} ${response.statusText}`;
        this.config = {
          baseUrl: cleanUrl,
          status: 'error',
          lastChecked: new Date().toISOString(),
          errorMessage: errText,
        };
        return { connected: false, error: errText };
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err?.name === 'AbortError';
      const errMsg = isAbort ? 'Connection timed out (3.5s)' : (err?.message || 'Network unreachable');

      this.config = {
        baseUrl: targetUrl,
        status: 'error',
        lastChecked: new Date().toISOString(),
        errorMessage: errMsg,
      };
      return { connected: false, error: errMsg };
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
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.students || []);
          return { students: list, source: 'backend' };
        }
      } catch {
        // Fall back seamlessly to demo
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
    if (this.config.status === 'connected' && this.baseUrl) {
      try {
        const cleanUrl = this.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/graph?threshold=${threshold}`, {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.nodes && data.edges) {
            return { nodes: data.nodes, edges: data.edges, source: 'backend' };
          }
        }
      } catch {
        // Fallback below
      }
    }

    const localGraph = buildStudentGraph(DEMO_STUDENTS, threshold, userProfile);
    return { ...localGraph, source: 'demo' };
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
          // Adapt safely to { recommendations: [...] } or { matches: [...] }
          const recommendations: MatchRecommendation[] =
            payload.recommendations || payload.matches || [];

          return {
            recommendations: recommendations.slice(0, 3).map((r) => ({
              ...r,
              isDemoResult: false,
            })),
            source: 'backend',
            matchedAt: new Date().toISOString(),
            totalEvaluated: payload.totalEvaluated || recommendations.length,
          };
        }
      } catch {
        // Fall through to local fallback
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
}

export const apiService = ApiService.getInstance();
