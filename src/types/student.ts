export type StudentRole =
  | 'AI/ML'
  | 'Designer'
  | 'Frontend'
  | 'Backend'
  | 'Data'
  | 'Research'
  | 'QA'
  | 'Database'
  | 'Product';

export interface StudentProfile {
  id: string;
  name: string;
  skills: string[];
  interests: string[];
  goal: string;
  role: StudentRole;
  avatarInitials?: string;
  avatarColor?: string;
  availability?: 'Looking for team' | 'Team formation in progress';
  bio?: string;
}

export interface MatchRequest {
  name: string;
  skills: string[];
  interests: string[];
  goal: string;
  role: StudentRole | string;
}

export interface MatchReason {
  category: 'role' | 'skill' | 'interest' | 'goal';
  explanation: string;
}

export interface MatchRecommendation {
  id: string;
  name: string;
  score: number; // 0 to 100
  skills: string[];
  interests: string[];
  role: StudentRole;
  goal: string;
  reasons: string[];
  complementarySkills: string[];
  missingRoleAddressed?: string;
  isDemoResult?: boolean;
}

export interface MatchResponse {
  recommendations: MatchRecommendation[];
  source?: 'backend' | 'demo';
  matchedAt?: string;
  totalEvaluated?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  role: StudentRole;
  skills: string[];
  interests: string[];
  goal: string;
  color: string;
  isUser?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  label: string;
  sharedInterests: string[];
  sharedSkills: string[];
  connectionType?: 'synergy' | 'interest' | 'skill';
}

export interface ApiConfig {
  baseUrl: string;
  status: 'demo' | 'connected' | 'error' | 'checking';
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
}
