/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { StudentProfile, GraphNode, GraphEdge, GraphData } from './types.js';

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-01',
    name: 'Maya Lin',
    role: 'Full-Stack Developer',
    skills: ['React', 'Node.js', 'PostgreSQL', 'GraphQL', 'TypeScript'],
    interests: ['ClimateTech', 'Open Source', 'Clean Energy'],
    goal: 'Build an MVP for real-time carbon footprint tracking across supply chains',
    project: 'EcoTrack AI'
  },
  {
    id: 'stu-02',
    name: 'Liam Chen',
    role: 'ML / AI Engineer',
    skills: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Docker'],
    interests: ['AI Agents', 'NLP', 'Healthcare'],
    goal: 'Win Best AI Track with an automated clinical triage agent',
    project: 'TriageMind'
  },
  {
    id: 'stu-03',
    name: 'Priya Patel',
    role: 'UI / UX Designer',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Tailwind CSS'],
    interests: ['Accessibility', 'EdTech', 'Mental Health'],
    goal: 'Win Best Design & Usability with an inclusive gamified learning interface',
    project: 'LearnEase'
  },
  {
    id: 'stu-04',
    name: 'Alex Rivera',
    role: 'Backend Engineer',
    skills: ['Go', 'Docker', 'Kubernetes', 'gRPC', 'Redis', 'PostgreSQL'],
    interests: ['FinTech', 'High-Throughput Systems', 'Web3'],
    goal: 'Build an ultra-low latency micropayments settlement engine',
    project: 'FlashPay'
  },
  {
    id: 'stu-05',
    name: 'Sofia Ramos',
    role: 'Mobile Developer',
    skills: ['Flutter', 'Dart', 'Firebase', 'Swift', 'REST APIs'],
    interests: ['Social Good', 'Mental Health', 'Gamification'],
    goal: 'Ship an offline-first mobile app for peer mental health journaling',
    project: 'MindHaven'
  },
  {
    id: 'stu-06',
    name: 'Devonte Washington',
    role: 'Product Manager',
    skills: ['Product Roadmap', 'Wireframing', 'Agile Scrum', 'Market Research', 'Pitch Decks'],
    interests: ['FinTech', 'EdTech', 'Future of Work'],
    goal: 'Deliver a business-ready MVP with validated customer discovery and pitch for grand prize',
    project: 'FlashPay'
  },
  {
    id: 'stu-07',
    name: 'Elena Rostov',
    role: 'Data Scientist',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL', 'Tableau'],
    interests: ['ClimateTech', 'Data Journalism', 'BioTech'],
    goal: 'Discover actionable climate trends by analyzing open Copernicus satellite telemetry',
    project: 'EcoTrack AI'
  },
  {
    id: 'stu-08',
    name: 'Marcus Thorne',
    role: 'DevOps / Cloud Engineer',
    skills: ['AWS', 'Terraform', 'CI/CD', 'Linux', 'Docker', 'Monitoring'],
    interests: ['CyberSecurity', 'Open Source', 'DevTools'],
    goal: 'Deploy resilient multi-cloud infrastructure and automated demo pipelines for the judging demo',
    project: 'CloudPulse'
  },
  {
    id: 'stu-09',
    name: 'Hana Takahashi',
    role: 'Frontend Engineer',
    skills: ['Three.js', 'Vue.js', 'WebGL', 'Tailwind CSS', 'TypeScript'],
    interests: ['Creative Coding', 'AR/VR', 'Gaming'],
    goal: 'Create an interactive 3D web experience that wows the hackathon judges',
    project: 'HoloWorld'
  },
  {
    id: 'stu-10',
    name: 'Carlos Mendez',
    role: 'Hardware / IoT Engineer',
    skills: ['C++', 'Rust', 'Arduino', 'ESP32', 'MQTT', 'Circuit Design'],
    interests: ['Smart Cities', 'Hardware Hacking', 'Clean Energy'],
    goal: 'Prototype a mesh network of low-cost air pollution monitoring sensors',
    project: 'AirMesh'
  },
  {
    id: 'stu-11',
    name: 'Aisha Al-Mansoor',
    role: 'Security & Blockchain Engineer',
    skills: ['Solidity', 'Rust', 'Cryptography', 'Smart Contracts', 'Security Auditing'],
    interests: ['Web3', 'CyberSecurity', 'Privacy'],
    goal: 'Architect a zero-knowledge verifiable credential system for hackathon attendee badges',
    project: 'ZK-Pass'
  },
  {
    id: 'stu-12',
    name: 'Jordan Lee',
    role: 'Frontend Engineer',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    interests: ['Healthcare', 'AI Agents', 'Accessibility'],
    goal: 'Build an accessible web portal for patient vital stats and physician tele-consults',
    project: 'TriageMind'
  }
];

export const DEMO_PROJECTS = [
  { id: 'proj-01', name: 'EcoTrack AI', track: 'ClimateTech & Sustainability', description: 'Real-time carbon footprint tracker powered by satellite and logistics data.' },
  { id: 'proj-02', name: 'TriageMind', track: 'Healthcare & AI', description: 'Intelligent triage and diagnosis support assistant for ER clinics.' },
  { id: 'proj-03', name: 'LearnEase', track: 'EdTech & Accessibility', description: 'Accessible learning platform designed for neurodivergent learners.' },
  { id: 'proj-04', name: 'FlashPay', track: 'FinTech', description: 'Sub-second micro-transaction rail with automatic fraud detection.' },
  { id: 'proj-05', name: 'MindHaven', track: 'Mental Health & Social Impact', description: 'Confidential peer-support mobile application with privacy-first mood tracking.' },
  { id: 'proj-06', name: 'CloudPulse', track: 'Developer Tools', description: 'Observability and instant rollback orchestrator for hackathon deployments.' },
  { id: 'proj-07', name: 'HoloWorld', track: 'Creative Media & Gaming', description: 'Browser-native 3D interactive spatial audio metaverse.' },
  { id: 'proj-08', name: 'AirMesh', track: 'Smart Cities & IoT', description: 'Hyper-local solar-powered particulate matter sensor network.' },
  { id: 'proj-09', name: 'ZK-Pass', track: 'Web3 & Privacy', description: 'Zero-knowledge verifiable identity credentials for privacy preservation.' }
];

/**
 * Builds the graph representation (nodes & edges) from the demo dataset.
 * Adheres strictly to the schema:
 * (:Student)-[:HAS_SKILL]->(:Skill)
 * (:Student)-[:INTERESTED_IN]->(:Interest)
 * (:Student)-[:WORKING_ON]->(:Project)
 */
export function buildDemoGraph(): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Add Students
  DEMO_STUDENTS.forEach((student) => {
    nodeMap.set(`student:${student.id}`, {
      id: student.id,
      label: student.name,
      type: 'Student',
      properties: {
        role: student.role,
        goal: student.goal,
        skillsCount: student.skills.length,
        interestsCount: student.interests.length,
        project: student.project || null
      }
    });

    // Add Skills and HAS_SKILL edges
    student.skills.forEach((skillName) => {
      const skillId = `skill:${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!nodeMap.has(skillId)) {
        nodeMap.set(skillId, {
          id: skillId,
          label: skillName,
          type: 'Skill',
          properties: { name: skillName }
        });
      }

      edges.push({
        id: `edge:${student.id}-HAS_SKILL-${skillId}`,
        source: student.id,
        target: skillId,
        type: 'HAS_SKILL',
        label: 'HAS_SKILL'
      });
    });

    // Add Interests and INTERESTED_IN edges
    student.interests.forEach((interestName) => {
      const interestId = `interest:${interestName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!nodeMap.has(interestId)) {
        nodeMap.set(interestId, {
          id: interestId,
          label: interestName,
          type: 'Interest',
          properties: { name: interestName }
        });
      }

      edges.push({
        id: `edge:${student.id}-INTERESTED_IN-${interestId}`,
        source: student.id,
        target: interestId,
        type: 'INTERESTED_IN',
        label: 'INTERESTED_IN'
      });
    });

    // Add Projects and WORKING_ON edges
    if (student.project) {
      const projectMeta = DEMO_PROJECTS.find(p => p.name === student.project);
      const projectId = `proj:${student.project.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      if (!nodeMap.has(projectId)) {
        nodeMap.set(projectId, {
          id: projectId,
          label: student.project,
          type: 'Project',
          properties: {
            name: student.project,
            track: projectMeta?.track || 'General Hackathon Track',
            description: projectMeta?.description || ''
          }
        });
      }

      edges.push({
        id: `edge:${student.id}-WORKING_ON-${projectId}`,
        source: student.id,
        target: projectId,
        type: 'WORKING_ON',
        label: 'WORKING_ON'
      });
    }
  });

  const nodes = Array.from(nodeMap.values());

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      mode: 'demo'
    }
  };
}
