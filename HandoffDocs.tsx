/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Copy, Check, Terminal, Database, Shield, Code, Server, BookOpen } from 'lucide-react';

export const HandoffDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-8 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Frontend Developer Integration Handoff
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          TeamMatch AI Backend Specification & Integration Guide
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
          Complete API contracts, TypeScript definitions, Neo4j graph schema, idempotent Cypher seeding queries, deterministic scoring algorithms, and environment configuration instructions.
        </p>
      </div>

      {/* 1. Environment Configuration */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            1. Environment Configuration (.env)
          </h2>
          <button
            onClick={() =>
              copyCode(
                'env',
                `# Server port\nPORT=3000\n\n# Optional Neo4j Database\nNEO4J_URI=neo4j+s://your-instance.databases.neo4j.io\nNEO4J_USERNAME=neo4j\nNEO4J_PASSWORD=your-strong-password\nNEO4J_DATABASE=neo4j`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
          >
            {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'env' ? 'Copied' : 'Copy .env'}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The backend runs in <strong>dual-mode</strong>: if Neo4j environment variables are omitted or offline, the API automatically and safely falls back to the high-performance in-memory demo engine. Database status and active mode are explicitly reported in <code className="text-indigo-300">GET /api/health</code>.
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
{`PORT=3000

# Optional Neo4j Connection (leave blank or omit to run in Demo mode)
NEO4J_URI="neo4j+s://your-cluster.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="your-strong-password"
NEO4J_DATABASE="neo4j"`}
        </pre>
      </div>

      {/* 2. Endpoint Contracts */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-400" />
          2. API Endpoints Contract
        </h2>

        {/* GET /api/health */}
        <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              GET
            </span>
            <code className="text-white text-sm font-semibold">/api/health</code>
          </div>
          <p className="text-xs text-slate-400">
            Returns system status, active data mode (<code>neo4j</code> | <code>demo</code>), and real-time connectivity status.
          </p>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "status": "ok",
  "timestamp": "2026-10-17T06:14:00.000Z",
  "service": "TeamMatch AI Recommendation Backend",
  "version": "1.0.0",
  "mode": "demo", // or "neo4j"
  "database": {
    "configured": false,
    "connected": false,
    "mode": "demo",
    "message": "NEO4J_URI not configured. Running in in-memory demo mode."
  },
  "summary": { "studentCount": 12, "totalNodes": 98, "totalEdges": 111 }
}`}
          </pre>
        </div>

        {/* GET /api/students */}
        <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              GET
            </span>
            <code className="text-white text-sm font-semibold">/api/students</code>
          </div>
          <p className="text-xs text-slate-400">
            Returns array of all 12 student profiles. Supports optional query parameters: <code>?role=Frontend</code>, <code>?skill=React</code>, <code>?search=Healthcare</code>.
          </p>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "success": true,
  "count": 12,
  "mode": "demo",
  "data": [
    {
      "id": "stu-12",
      "name": "Jordan Lee",
      "role": "Frontend Engineer",
      "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      "interests": ["Healthcare", "AI Agents", "Accessibility"],
      "goal": "Build an accessible web portal for patient vital stats and physician tele-consults",
      "project": "TriageMind"
    }
  ]
}`}
          </pre>
        </div>

        {/* GET /api/graph */}
        <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              GET
            </span>
            <code className="text-white text-sm font-semibold">/api/graph</code>
          </div>
          <p className="text-xs text-slate-400">
            Returns structured graph nodes and edges adhering to the graph model:
            <code>(:Student)-[:HAS_SKILL]-&gt;(:Skill)</code>, <code>(:Student)-[:INTERESTED_IN]-&gt;(:Interest)</code>, <code>(:Student)-[:WORKING_ON]-&gt;(:Project)</code>.
          </p>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`{
  "success": true,
  "schema": {
    "nodeTypes": ["Student", "Skill", "Interest", "Project"],
    "edgeTypes": ["HAS_SKILL", "INTERESTED_IN", "WORKING_ON"]
  },
  "data": {
    "nodes": [
      { "id": "stu-02", "label": "Liam Chen", "type": "Student", "properties": { "role": "ML / AI Engineer" } },
      { "id": "skill:pytorch", "label": "PyTorch", "type": "Skill", "properties": { "name": "PyTorch" } }
    ],
    "edges": [
      { "id": "edge:stu-02-HAS_SKILL-skill:pytorch", "source": "stu-02", "target": "skill:pytorch", "type": "HAS_SKILL", "label": "HAS_SKILL" }
    ]
  }
}`}
          </pre>
        </div>

        {/* POST /api/match */}
        <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              POST
            </span>
            <code className="text-white text-sm font-semibold">/api/match</code>
          </div>
          <p className="text-xs text-slate-400">
            Accepts applicant student profile, validates inputs, excludes self-match, and returns up to 3 recommendations with normalized 0–100 score, explainable reasons, and granular score breakdown.
          </p>
          <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{`// POST /api/match Request Body:
{
  "id": "stu-12", // optional ID to prevent self-matching
  "name": "Jordan Lee",
  "role": "Frontend Engineer",
  "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  "interests": ["Healthcare", "AI Agents", "Accessibility"],
  "goal": "Build an accessible web portal for patient vital stats and physician tele-consults"
}

// 200 OK Response:
{
  "success": true,
  "count": 3,
  "disclaimer": "Scores are heuristic compatibility indicators calculated deterministically from self-reported profile attributes, not scientifically validated psychological metrics.",
  "matches": [
    {
      "id": "stu-02",
      "name": "Liam Chen",
      "score": 71, // 0 to 100
      "role": "ML / AI Engineer",
      "skills": ["Python", "PyTorch", "FastAPI", "LangChain", "Docker"],
      "interests": ["AI Agents", "NLP", "Healthcare"],
      "goal": "Win Best AI Track with an automated clinical triage agent",
      "reasons": [
        "Strong role synergy: ML / AI Engineer directly balances your Frontend Engineer for full-coverage hackathon delivery.",
        "Brings key technical capabilities you lack: Python, PyTorch, FastAPI.",
        "Shared passion: Both excited about AI Agents, Healthcare.",
        "Harmonized hackathon mindset: Aligned expectations on project tempo and delivery goals."
      ],
      "breakdown": {
        "skillComplementarity": 32, // max 40
        "roleSynergy": 19,          // max 20
        "sharedInterests": 20,      // max 25
        "goalAlignment": 0          // max 15
      }
    }
  ]
}`}
          </pre>
        </div>
      </div>

      {/* 3. Scoring Engine Breakdown */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          3. Scoring Engine & Deterministic Factors
        </h2>

        <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>
            The scoring engine uses a deterministic, transparent formula normalized between <strong>0 and 100 points</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-indigo-300 block mb-1">1. Skill Complementarity (40 pts max)</span>
              <span>Rewards candidates who bring technical capabilities that the requester lacks (up to 32 pts), plus common baseline tooling overlap for smooth collaboration (up to 8 pts).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-purple-300 block mb-1">2. Role Synergy (20 pts max)</span>
              <span>Evaluates cross-functional squad harmony using an asymmetric role matrix (e.g. Frontend + Backend, ML + Full-Stack, UI/UX + Mobile).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-pink-300 block mb-1">3. Shared Interests (25 pts max)</span>
              <span>Quantifies alignment on hackathon track themes and passions (e.g. Healthcare, ClimateTech, FinTech, EdTech, Web3).</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-1">4. Goal & Scope Alignment (15 pts max)</span>
              <span>Token and intent matching for hackathon deliverables, ambition level (e.g. "Win Best Hack" vs "Learn & Ship MVP"), and target product vision.</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Disclaimer: Scores are heuristic compatibility indicators calculated deterministically from self-reported profile attributes, not scientifically validated psychological metrics.
          </p>
        </div>
      </div>

      {/* 4. Idempotent Neo4j Cypher Schema & Seeding */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          4. Neo4j Graph Model & Idempotent Cypher Seeding
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          The seeding logic uses parameterized Cypher <code className="text-indigo-300">MERGE</code> queries with unique constraints. It is safe to execute repeatedly without generating duplicate nodes or relationships.
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
{`// 1. Unique Constraints
CREATE CONSTRAINT student_id_unique IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (sk:Skill) REQUIRE sk.name IS UNIQUE;
CREATE CONSTRAINT interest_name_unique IF NOT EXISTS FOR (i:Interest) REQUIRE i.name IS UNIQUE;
CREATE CONSTRAINT project_name_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.name IS UNIQUE;

// 2. Idempotent Node & Edge Merging
MERGE (s:Student {id: $id})
SET s.name = $name, s.role = $role, s.goal = $goal, s.updatedAt = datetime();

// Merge Skills
MATCH (s:Student {id: $studentId})
UNWIND $skills AS skillName
MERGE (sk:Skill {name: trim(skillName)})
MERGE (s)-[:HAS_SKILL]->(sk);

// Merge Interests
MATCH (s:Student {id: $studentId})
UNWIND $interests AS interestName
MERGE (i:Interest {name: trim(interestName)})
MERGE (s)-[:INTERESTED_IN]->(i);

// Merge Project
MATCH (s:Student {id: $studentId})
MERGE (p:Project {name: trim($projectName)})
MERGE (s)-[:WORKING_ON]->(p);`}
        </pre>
      </div>
    </div>
  );
};
