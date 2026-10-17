/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  interests: string[];
  goal: string;
  project?: string;
}

export interface ScoreBreakdown {
  skillComplementarity: number;
  roleSynergy: number;
  sharedInterests: number;
  goalAlignment: number;
}

export interface MatchRecommendation {
  id: string;
  name: string;
  score: number;
  role: string;
  skills: string[];
  interests: string[];
  goal: string;
  reasons: string[];
  breakdown: ScoreBreakdown;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Student' | 'Skill' | 'Interest' | 'Project';
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'HAS_SKILL' | 'INTERESTED_IN' | 'WORKING_ON';
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    mode: 'neo4j' | 'demo';
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  mode: 'neo4j' | 'demo';
  database: {
    configured: boolean;
    connected: boolean;
    uri?: string;
    mode: 'neo4j' | 'demo';
    message: string;
    latencyMs?: number;
  };
  summary: {
    studentCount: number;
    totalNodes: number;
    totalEdges: number;
  };
}
