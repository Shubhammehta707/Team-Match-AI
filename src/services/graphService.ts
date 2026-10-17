import { DEMO_STUDENTS, ROLE_COLORS } from '../data/demoStudents';
import { GraphEdge, GraphNode, MatchRequest, StudentProfile } from '../types/student';

export interface GraphDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function buildStudentGraph(
  students: StudentProfile[] = DEMO_STUDENTS,
  minThreshold: number = 2,
  userProfile?: MatchRequest | null
): GraphDataset {
  const nodes: GraphNode[] = students.map((s) => ({
    id: s.id,
    label: s.name,
    role: s.role,
    skills: s.skills,
    interests: s.interests,
    goal: s.goal,
    color: ROLE_COLORS[s.role]?.hex || '#8b5cf6',
    isUser: false,
  }));

  if (userProfile && userProfile.name.trim().length > 0) {
    const userRoleKey = userProfile.role as keyof typeof ROLE_COLORS;
    nodes.push({
      id: 'current-user',
      label: `${userProfile.name} (You)`,
      role: (userProfile.role as any) || 'Frontend',
      skills: userProfile.skills,
      interests: userProfile.interests,
      goal: userProfile.goal,
      color: '#7c3aed',
      isUser: true,
    });
  }

  const edges: GraphEdge[] = [];
  const allNodesList = [...students];

  if (userProfile && userProfile.name.trim().length > 0) {
    allNodesList.push({
      id: 'current-user',
      name: userProfile.name,
      role: (userProfile.role as any) || 'Frontend',
      skills: userProfile.skills,
      interests: userProfile.interests,
      goal: userProfile.goal,
    });
  }

  // Calculate meaningful pairwise connections
  for (let i = 0; i < allNodesList.length; i++) {
    for (let j = i + 1; j < allNodesList.length; j++) {
      const a = allNodesList[i];
      const b = allNodesList[j];

      // Shared interests
      const aInterests = new Set(a.interests.map((x) => x.toLowerCase()));
      const sharedInterests = b.interests.filter((x) => aInterests.has(x.toLowerCase()));

      // Shared skills
      const aSkills = new Set(a.skills.map((x) => x.toLowerCase()));
      const sharedSkills = b.skills.filter((x) => aSkills.has(x.toLowerCase()));

      // Role synergy: complementary roles get weight
      const isComplementaryRole =
        (a.role === 'Designer' && (b.role === 'Frontend' || b.role === 'AI/ML')) ||
        (a.role === 'Frontend' && (b.role === 'Designer' || b.role === 'Backend' || b.role === 'AI/ML')) ||
        (a.role === 'Backend' && (b.role === 'Database' || b.role === 'Frontend' || b.role === 'AI/ML')) ||
        (a.role === 'AI/ML' && (b.role === 'Data' || b.role === 'Frontend' || b.role === 'Backend')) ||
        (a.role === 'Product' && (b.role === 'Designer' || b.role === 'Frontend' || b.role === 'AI/ML')) ||
        (a.role === 'QA' && (b.role === 'Frontend' || b.role === 'Backend'));

      // Weight calculation: each shared interest = 2 pts, each shared skill = 1 pt, role synergy = 2 pts
      let weight = sharedInterests.length * 2 + sharedSkills.length * 1 + (isComplementaryRole ? 2 : 0);

      // Check if threshold met
      if (weight >= minThreshold) {
        const labels: string[] = [];
        let connectionType: 'synergy' | 'interest' | 'skill' = 'skill';
        if (isComplementaryRole) {
          labels.push('Role Synergy');
          connectionType = 'synergy';
        } else if (sharedInterests.length > 0) {
          labels.push(sharedInterests[0]);
          connectionType = 'interest';
        } else {
          if (sharedSkills.length > 0) labels.push(sharedSkills[0]);
          connectionType = 'skill';
        }

        edges.push({
          id: `edge-${a.id}-${b.id}`,
          source: a.id,
          target: b.id,
          weight,
          label: labels.slice(0, 2).join(' · '),
          sharedInterests,
          sharedSkills,
          connectionType,
        });
      }
    }
  }

  return { nodes, edges };
}
