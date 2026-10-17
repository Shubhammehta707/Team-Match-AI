/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEMO_STUDENTS, buildDemoGraph } from '../server/data/demoData.js';
import { scoreCandidate, findTopMatches } from '../server/matchingEngine.js';
import { checkNeo4jConnectivity } from '../server/neo4jClient.js';
import { MatchRequest } from '../server/types.js';

async function runTests() {
  console.log('--- Starting TeamMatch AI Backend Automated Tests ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || '');
      failed++;
    }
  }

  // TEST 1: Demo data sanity check
  assert(DEMO_STUDENTS.length === 12, '12 fictional sample student profiles exist');
  const allHaveRequiredFields = DEMO_STUDENTS.every(
    s => s.id && s.name && s.role && Array.isArray(s.skills) && s.skills.length > 0 && Array.isArray(s.interests) && s.interests.length > 0 && s.goal
  );
  assert(allHaveRequiredFields, 'All 12 demo profiles contain id, name, skills, interests, goal and role');

  // TEST 2: Graph representation
  const graph = buildDemoGraph();
  assert(graph.nodes.length > 0, `Graph nodes generated: ${graph.nodes.length}`);
  assert(graph.edges.length > 0, `Graph edges generated: ${graph.edges.length}`);
  const hasSkillEdges = graph.edges.some(e => e.type === 'HAS_SKILL');
  const hasInterestEdges = graph.edges.some(e => e.type === 'INTERESTED_IN');
  const hasWorkingOnEdges = graph.edges.some(e => e.type === 'WORKING_ON');
  assert(hasSkillEdges && hasInterestEdges && hasWorkingOnEdges, 'Graph includes HAS_SKILL, INTERESTED_IN, and WORKING_ON relationships');

  // TEST 3: Matching engine scoring and normalization (0-100)
  const sampleRequester: MatchRequest = {
    id: 'stu-12',
    name: 'Jordan Lee',
    role: 'Frontend Engineer',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    interests: ['Healthcare', 'AI Agents', 'Accessibility'],
    goal: 'Build an accessible web portal for patient vital stats and physician tele-consults'
  };

  const matches = findTopMatches(sampleRequester, DEMO_STUDENTS, 3);
  assert(matches.length <= 3, 'Returns at most three recommended teammates');
  assert(matches.length > 0, 'Returns valid recommendations');

  // Check self-match prevention
  const selfMatch = matches.find(m => m.id === sampleRequester.id || m.name.toLowerCase() === sampleRequester.name.toLowerCase());
  assert(!selfMatch, 'Never recommends submitting student as their own match (self-match prevention)');

  // Check score bounds and attributes
  const allValidScores = matches.every(m => m.score >= 0 && m.score <= 100);
  assert(allValidScores, 'All recommendation scores are normalized between 0 and 100');

  const allHaveReasons = matches.every(m => Array.isArray(m.reasons) && m.reasons.length > 0);
  assert(allHaveReasons, 'All recommendations include explainable human-readable reasons');

  const allHaveBreakdown = matches.every(
    m => m.breakdown && typeof m.breakdown.skillComplementarity === 'number' && typeof m.breakdown.roleSynergy === 'number'
  );
  assert(allHaveBreakdown, 'All recommendations include granular score breakdown');

  // Check top match synergy for Jordan Lee (Frontend Healthcare):
  // Liam Chen is ML/AI in Healthcare with Python, PyTorch -> should score very highly!
  const liamMatch = matches.find(m => m.name === 'Liam Chen');
  assert(!!liamMatch, 'Liam Chen (ML/AI Healthcare) recommended for Jordan Lee (Frontend Healthcare)');
  if (liamMatch) {
    console.log(`   Top Match Details: ${liamMatch.name} (${liamMatch.role}) - Score: ${liamMatch.score}/100`);
    console.log(`   Reasons: ${liamMatch.reasons.join(' | ')}`);
  }

  // TEST 4: Health & Connectivity check without Neo4j credentials
  const dbStatus = await checkNeo4jConnectivity();
  assert(dbStatus.mode === 'demo' || dbStatus.mode === 'neo4j', 'Database status reports active mode (neo4j or demo)');
  if (!process.env.NEO4J_URI) {
    assert(dbStatus.connected === false, 'Correctly reports connected: false when credentials are not configured');
    assert(dbStatus.mode === 'demo', 'Correctly falls back to demo mode');
  }

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
