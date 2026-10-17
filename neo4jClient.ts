/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import neo4j, { Driver, Session } from 'neo4j-driver';
import { DatabaseStatus, StudentProfile, GraphData, GraphNode, GraphEdge } from './types.js';
import { DEMO_STUDENTS, buildDemoGraph } from './data/demoData.js';

let driver: Driver | null = null;
let lastKnownStatus: DatabaseStatus = {
  configured: false,
  connected: false,
  mode: 'demo',
  message: 'Initializing...'
};

/**
 * Initializes and retrieves the singleton Neo4j driver if credentials exist.
 */
export function getNeo4jDriver(): Driver | null {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    return null;
  }

  if (!driver) {
    try {
      driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
        {
          maxConnectionLifetime: 30 * 60 * 1000,
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 5000
        }
      );
    } catch (err: any) {
      console.warn('[Neo4j] Failed to initialize driver:', err.message);
      driver = null;
    }
  }

  return driver;
}

/**
 * Performs an actual real-time connection check to verify Neo4j availability.
 * Times out after 3.5 seconds to avoid blocking health checks.
 */
export async function checkNeo4jConnectivity(): Promise<DatabaseStatus> {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    lastKnownStatus = {
      configured: false,
      connected: false,
      mode: 'demo',
      message: 'NEO4J_URI, NEO4J_USERNAME, or NEO4J_PASSWORD not configured. Running in in-memory demo mode.'
    };
    return lastKnownStatus;
  }

  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    lastKnownStatus = {
      configured: true,
      connected: false,
      uri: redactUri(uri),
      mode: 'demo',
      message: 'Failed to create Neo4j driver with provided URI. Falling back to demo mode.'
    };
    return lastKnownStatus;
  }

  const startTime = Date.now();
  try {
    // Timeout promise after 3500ms
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timed out after 3500ms')), 3500)
    );

    const verifyPromise = (async () => {
      const serverInfo = await activeDriver.getServerInfo();
      return serverInfo;
    })();

    const serverInfo = await Promise.race([verifyPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    lastKnownStatus = {
      configured: true,
      connected: true,
      uri: redactUri(uri),
      mode: 'neo4j',
      latencyMs,
      message: `Connected to Neo4j (${serverInfo.agent || 'Server'} on ${serverInfo.address || 'remote'})`
    };
    return lastKnownStatus;
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    lastKnownStatus = {
      configured: true,
      connected: false,
      uri: redactUri(uri),
      mode: 'demo',
      latencyMs,
      message: `Neo4j connection check failed: ${err.message}. Safely falling back to demo mode.`
    };
    return lastKnownStatus;
  }
}

/**
 * Redacts credentials or sensitive parts of URI for safe display.
 */
function redactUri(uri: string): string {
  try {
    const parsed = new URL(uri);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return uri.replace(/\/\/.*@/, '//***@');
  }
}

/**
 * Seed students into Neo4j idempotently using parameterized Cypher queries.
 * Safe to run repeatedly without creating duplicates.
 */
export async function seedNeo4jGraph(students: StudentProfile[] = DEMO_STUDENTS): Promise<{ success: boolean; nodesCreatedOrMatched: number; message: string }> {
  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    throw new Error('Neo4j driver is not configured.');
  }

  const database = process.env.NEO4J_DATABASE || undefined;
  const session: Session = activeDriver.session({ database });

  try {
    // Setup unique constraints idempotently
    try {
      await session.run('CREATE CONSTRAINT student_id_unique IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE');
      await session.run('CREATE CONSTRAINT skill_name_unique IF NOT EXISTS FOR (sk:Skill) REQUIRE sk.name IS UNIQUE');
      await session.run('CREATE CONSTRAINT interest_name_unique IF NOT EXISTS FOR (i:Interest) REQUIRE i.name IS UNIQUE');
      await session.run('CREATE CONSTRAINT project_name_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.name IS UNIQUE');
    } catch (constraintErr: any) {
      console.warn('[Neo4j] Constraint setup warning (may already exist or not supported on free editions):', constraintErr.message);
    }

    let nodeOps = 0;

    for (const student of students) {
      // 1. Merge student node
      await session.run(
        `
        MERGE (s:Student {id: $id})
        SET s.name = $name,
            s.role = $role,
            s.goal = $goal,
            s.updatedAt = datetime()
        RETURN s
        `,
        {
          id: student.id,
          name: student.name,
          role: student.role,
          goal: student.goal
        }
      );
      nodeOps++;

      // 2. Merge skills and HAS_SKILL relationships
      if (student.skills && student.skills.length > 0) {
        await session.run(
          `
          MATCH (s:Student {id: $studentId})
          UNWIND $skills AS skillName
          MERGE (sk:Skill {name: trim(skillName)})
          MERGE (s)-[:HAS_SKILL]->(sk)
          `,
          {
            studentId: student.id,
            skills: student.skills
          }
        );
      }

      // 3. Merge interests and INTERESTED_IN relationships
      if (student.interests && student.interests.length > 0) {
        await session.run(
          `
          MATCH (s:Student {id: $studentId})
          UNWIND $interests AS interestName
          MERGE (i:Interest {name: trim(interestName)})
          MERGE (s)-[:INTERESTED_IN]->(i)
          `,
          {
            studentId: student.id,
            interests: student.interests
          }
        );
      }

      // 4. Merge project and WORKING_ON relationship
      if (student.project) {
        await session.run(
          `
          MATCH (s:Student {id: $studentId})
          MERGE (p:Project {name: trim($projectName)})
          MERGE (s)-[:WORKING_ON]->(p)
          `,
          {
            studentId: student.id,
            projectName: student.project
          }
        );
      }
    }

    return {
      success: true,
      nodesCreatedOrMatched: nodeOps,
      message: `Successfully seeded ${students.length} student profiles and connected graph relationships into Neo4j.`
    };
  } finally {
    await session.close();
  }
}

/**
 * Fetch students from Neo4j if available, or fallback to DEMO_STUDENTS.
 */
export async function fetchStudentsWithFallback(): Promise<{ students: StudentProfile[]; mode: 'neo4j' | 'demo' }> {
  const status = await checkNeo4jConnectivity();
  if (!status.connected) {
    return { students: DEMO_STUDENTS, mode: 'demo' };
  }

  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    return { students: DEMO_STUDENTS, mode: 'demo' };
  }

  const database = process.env.NEO4J_DATABASE || undefined;
  const session: Session = activeDriver.session({ database });

  try {
    const result = await session.run(`
      MATCH (s:Student)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(i:Interest)
      OPTIONAL MATCH (s)-[:WORKING_ON]->(p:Project)
      RETURN s.id AS id,
             s.name AS name,
             s.role AS role,
             s.goal AS goal,
             collect(DISTINCT sk.name) AS skills,
             collect(DISTINCT i.name) AS interests,
             head(collect(DISTINCT p.name)) AS project
      ORDER BY s.id ASC
    `);

    if (result.records.length === 0) {
      // Database connected but empty: auto-seed demo data into it
      console.log('[Neo4j] Connected database has 0 students. Auto-seeding initial demo profiles...');
      await seedNeo4jGraph(DEMO_STUDENTS);
      return { students: DEMO_STUDENTS, mode: 'neo4j' };
    }

    const students: StudentProfile[] = result.records.map((record) => ({
      id: record.get('id') || `stu-${Math.random().toString(36).substring(2, 7)}`,
      name: record.get('name') || 'Unnamed Student',
      role: record.get('role') || 'Participant',
      skills: (record.get('skills') || []).filter(Boolean),
      interests: (record.get('interests') || []).filter(Boolean),
      goal: record.get('goal') || '',
      project: record.get('project') || undefined
    }));

    return { students, mode: 'neo4j' };
  } catch (err: any) {
    console.warn('[Neo4j] Query error, falling back to demo profiles:', err.message);
    return { students: DEMO_STUDENTS, mode: 'demo' };
  } finally {
    await session.close();
  }
}

/**
 * Fetch graph nodes and edges from Neo4j if available, or fallback to buildDemoGraph().
 */
export async function fetchGraphWithFallback(): Promise<GraphData> {
  const status = await checkNeo4jConnectivity();
  if (!status.connected) {
    return buildDemoGraph();
  }

  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    return buildDemoGraph();
  }

  const database = process.env.NEO4J_DATABASE || undefined;
  const session: Session = activeDriver.session({ database });

  try {
    const nodesQuery = await session.run(`
      MATCH (n)
      RETURN id(n) AS neoId,
             labels(n) AS labels,
             properties(n) AS props,
             coalesce(n.id, n.name, toString(id(n))) AS entityId,
             coalesce(n.name, n.id, 'Unnamed') AS label
      LIMIT 300
    `);

    const edgesQuery = await session.run(`
      MATCH (source)-[r]->(target)
      RETURN id(r) AS relId,
             type(r) AS type,
             coalesce(source.id, source.name, toString(id(source))) AS sourceId,
             coalesce(target.name, target.id, toString(id(target))) AS targetId,
             type(r) AS label
      LIMIT 500
    `);

    if (nodesQuery.records.length === 0) {
      return buildDemoGraph();
    }

    const nodes: GraphNode[] = nodesQuery.records.map((r) => {
      const labels: string[] = r.get('labels') || [];
      let type: 'Student' | 'Skill' | 'Interest' | 'Project' = 'Student';
      if (labels.includes('Skill')) type = 'Skill';
      else if (labels.includes('Interest')) type = 'Interest';
      else if (labels.includes('Project')) type = 'Project';

      return {
        id: String(r.get('entityId')),
        label: String(r.get('label')),
        type,
        properties: r.get('props') || {}
      };
    });

    const edges: GraphEdge[] = edgesQuery.records.map((r) => ({
      id: `rel-${r.get('relId')}`,
      source: String(r.get('sourceId')),
      target: String(r.get('targetId')),
      type: r.get('type') as any,
      label: String(r.get('label'))
    }));

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        mode: 'neo4j'
      }
    };
  } catch (err: any) {
    console.warn('[Neo4j] Graph query error, falling back to buildDemoGraph():', err.message);
    return buildDemoGraph();
  } finally {
    await session.close();
  }
}
