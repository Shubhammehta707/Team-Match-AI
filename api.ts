/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import {
  checkNeo4jConnectivity,
  fetchStudentsWithFallback,
  fetchGraphWithFallback,
  seedNeo4jGraph
} from '../neo4jClient.js';
import { findTopMatches } from '../matchingEngine.js';
import { MatchRequest, HealthResponse } from '../types.js';
import { DEMO_STUDENTS, buildDemoGraph } from '../data/demoData.js';

export const apiRouter = Router();

/**
 * 1. GET /api/health
 * - Return application status.
 * - Report the active data mode: Neo4j or demo.
 * - Report database connectivity only after an actual connection check.
 */
apiRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbStatus = await checkNeo4jConnectivity();
    const demoGraph = buildDemoGraph();

    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TeamMatch AI Recommendation Backend',
      version: '1.0.0',
      mode: dbStatus.mode,
      database: dbStatus,
      summary: {
        studentCount: DEMO_STUDENTS.length,
        totalNodes: demoGraph.nodes.length,
        totalEdges: demoGraph.edges.length
      }
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'TeamMatch AI Recommendation Backend',
      message: 'Failed to complete system health check: ' + error.message
    });
  }
});

/**
 * 2. GET /api/students
 * - Return a list of student profiles.
 * - Each profile contains id, name, skills, interests, goal and role.
 * - Supports optional query filtering: ?role=... or ?search=... or ?skill=...
 */
apiRouter.get('/students', async (req: Request, res: Response) => {
  try {
    const { role, search, skill } = req.query;
    const { students, mode } = await fetchStudentsWithFallback();

    let filtered = [...students];

    if (typeof role === 'string' && role.trim()) {
      const qRole = role.toLowerCase().trim();
      filtered = filtered.filter(s => s.role.toLowerCase().includes(qRole));
    }

    if (typeof skill === 'string' && skill.trim()) {
      const qSkill = skill.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.skills.some(sk => sk.toLowerCase().includes(qSkill))
      );
    }

    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.goal.toLowerCase().includes(q) ||
          s.skills.some(sk => sk.toLowerCase().includes(q)) ||
          s.interests.some(i => i.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      mode,
      data: filtered
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve students: ' + error.message
    });
  }
});

/**
 * 3. GET /api/graph
 * - Return structured nodes and edges for students, skills, interests and projects.
 * - Use a documented schema consistent with the frontend.
 */
apiRouter.get('/graph', async (_req: Request, res: Response) => {
  try {
    const graphData = await fetchGraphWithFallback();
    res.status(200).json({
      success: true,
      schema: {
        nodeTypes: ['Student', 'Skill', 'Interest', 'Project'],
        edgeTypes: ['HAS_SKILL', 'INTERESTED_IN', 'WORKING_ON'],
        nodeAttributes: ['id', 'label', 'type', 'properties'],
        edgeAttributes: ['id', 'source', 'target', 'type', 'label']
      },
      data: graphData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to build graph data: ' + error.message
    });
  }
});

/**
 * 4. POST /api/match
 * - Accept a student's profile in JSON body.
 * - Return up to three recommended teammates.
 * - Include id, name, score from 0 to 100, skills, interests, role and specific explanation reasons.
 * - Never recommend the submitting student as their own match.
 */
apiRouter.post('/match', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Invalid request body. Expected a JSON object containing student profile attributes.',
        expectedFields: {
          name: 'string (required)',
          role: 'string (required)',
          skills: 'string[] (required, at least 1 skill)',
          interests: 'string[] (required, at least 1 interest)',
          goal: 'string (required)',
          id: 'string (optional existing ID to exclude self-matching)'
        }
      });
      return;
    }

    // Validation
    const validationErrors: string[] = [];

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      validationErrors.push('Field "name" is required and must be a non-empty string.');
    }

    if (!body.role || typeof body.role !== 'string' || !body.role.trim()) {
      validationErrors.push('Field "role" is required (e.g., "Frontend Engineer", "Backend Engineer", "ML / AI Engineer").');
    }

    if (!Array.isArray(body.skills) || body.skills.length === 0) {
      validationErrors.push('Field "skills" is required and must be a non-empty array of strings.');
    } else if (body.skills.some((s: any) => typeof s !== 'string' || !s.trim())) {
      validationErrors.push('All items in "skills" array must be non-empty strings.');
    }

    if (!Array.isArray(body.interests) || body.interests.length === 0) {
      validationErrors.push('Field "interests" is required and must be a non-empty array of strings.');
    } else if (body.interests.some((i: any) => typeof i !== 'string' || !i.trim())) {
      validationErrors.push('All items in "interests" array must be non-empty strings.');
    }

    if (!body.goal || typeof body.goal !== 'string' || !body.goal.trim()) {
      validationErrors.push('Field "goal" is required and must be a descriptive string outlining hackathon intent.');
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed for student profile.',
        details: validationErrors
      });
      return;
    }

    const matchRequest: MatchRequest = {
      id: typeof body.id === 'string' ? body.id.trim() : undefined,
      name: body.name.trim(),
      role: body.role.trim(),
      skills: body.skills.map((s: string) => s.trim()),
      interests: body.interests.map((i: string) => i.trim()),
      goal: body.goal.trim()
    };

    // Retrieve pool of potential candidate teammates
    const { students: candidates, mode } = await fetchStudentsWithFallback();

    // Run deterministic, explainable matching algorithm
    const matches = findTopMatches(matchRequest, candidates, 3);

    res.status(200).json({
      success: true,
      query: {
        id: matchRequest.id || null,
        name: matchRequest.name,
        role: matchRequest.role,
        skills: matchRequest.skills,
        interests: matchRequest.interests,
        goal: matchRequest.goal
      },
      count: matches.length,
      mode,
      disclaimer: 'Scores are heuristic compatibility indicators calculated deterministically from self-reported profile attributes, not scientifically validated psychological metrics.',
      scoringFactors: {
        skillComplementarity: { max: 40, weight: '40%', description: 'Candidate technical skills missing from requester profile plus tooling baseline' },
        roleSynergy: { max: 20, weight: '20%', description: 'Cross-functional role complementarity (e.g., Frontend + Backend or UI/UX)' },
        sharedInterests: { max: 25, weight: '25%', description: 'Overlap in hackathon theme and domain passions' },
        goalAlignment: { max: 15, weight: '15%', description: 'Alignment in project scope, ambition level, and key technology priorities' }
      },
      matches
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during teammate matching: ' + error.message
    });
  }
});

/**
 * Optional Admin/Seeding Endpoint: POST /api/neo4j/seed
 * Idempotently merges the 12 sample profiles and relationship graph into Neo4j.
 */
apiRouter.post('/neo4j/seed', async (_req: Request, res: Response) => {
  try {
    const status = await checkNeo4jConnectivity();
    if (!status.connected) {
      res.status(503).json({
        success: false,
        mode: 'demo',
        error: 'Cannot seed Neo4j: database is not connected or credentials are missing.',
        details: status.message
      });
      return;
    }

    const result = await seedNeo4jGraph(DEMO_STUDENTS);
    res.status(200).json({
      mode: 'neo4j',
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to seed Neo4j database: ' + error.message
    });
  }
});

/**
 * GET /api/docs
 * Complete API schema, endpoint contract, example payloads, and frontend handoff.
 */
apiRouter.get('/docs', (_req: Request, res: Response) => {
  res.status(200).json({
    title: 'TeamMatch AI API Documentation & Frontend Integration Handoff',
    version: '1.0.0',
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Check backend status, active data mode (neo4j | demo), and live DB connectivity.',
        exampleResponse: {
          status: 'ok',
          mode: 'demo',
          database: {
            configured: false,
            connected: false,
            mode: 'demo',
            message: 'Running in in-memory demo mode.'
          }
        }
      },
      {
        path: '/api/students',
        method: 'GET',
        description: 'Fetch student profiles with id, name, skills, interests, goal, role. Optional ?role=, ?skill=, ?search=',
        exampleResponse: {
          success: true,
          count: 12,
          data: [{ id: 'stu-01', name: 'Maya Lin', role: 'Full-Stack Developer' }]
        }
      },
      {
        path: '/api/graph',
        method: 'GET',
        description: 'Returns structured nodes and edges for (:Student)-[:HAS_SKILL]->(:Skill), (:Interest), (:Project).',
        exampleResponse: {
          success: true,
          data: { nodes: [], edges: [] }
        }
      },
      {
        path: '/api/match',
        method: 'POST',
        description: 'Deterministic top-3 teammate recommendation engine with explainable reasons and score breakdown.',
        exampleRequestBody: {
          id: 'stu-12',
          name: 'Jordan Lee',
          role: 'Frontend Engineer',
          skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
          interests: ['Healthcare', 'AI Agents', 'Accessibility'],
          goal: 'Build an accessible web portal for patient vital stats and physician tele-consults'
        }
      }
    ]
  });
});
