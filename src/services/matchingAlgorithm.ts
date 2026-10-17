import { MatchRecommendation, MatchRequest, StudentProfile, StudentRole } from '../types/student';

// Defines which roles naturally complement each other for hackathon squads
const COMPLEMENTARY_ROLE_MAP: Record<string, StudentRole[]> = {
  'Frontend': ['Designer', 'Backend', 'AI/ML', 'Product', 'Data'],
  'Backend': ['Frontend', 'AI/ML', 'Database', 'QA', 'Designer'],
  'AI/ML': ['Frontend', 'Backend', 'Data', 'Designer', 'Product'],
  'Designer': ['Frontend', 'Product', 'AI/ML', 'Research', 'Backend'],
  'Data': ['AI/ML', 'Backend', 'Frontend', 'Research'],
  'Research': ['Product', 'Designer', 'AI/ML', 'Frontend'],
  'QA': ['Backend', 'Frontend', 'Database'],
  'Database': ['Backend', 'Data', 'AI/ML'],
  'Product': ['Frontend', 'Designer', 'AI/ML', 'Research']
};

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function calculateLocalMatches(
  user: MatchRequest,
  candidates: StudentProfile[],
  limit: number = 3
): MatchRecommendation[] {
  const userSkillsSet = new Set(user.skills.map((s) => s.toLowerCase().trim()));
  const userInterestsSet = new Set(user.interests.map((i) => i.toLowerCase().trim()));
  const userGoalWords = new Set(normalizeText(user.goal));
  const normalizedUserName = user.name.trim().toLowerCase();

  const scoredCandidates = candidates
    .filter((candidate) => {
      // Do not match candidate to themselves
      const candidateName = candidate.name.trim().toLowerCase();
      if (candidateName === normalizedUserName && candidateName.length > 0) {
        return false;
      }
      return true;
    })
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Role Synergy & Complementarity (up to 35 pts)
      const idealComplements = COMPLEMENTARY_ROLE_MAP[user.role] || [];
      const isComplementaryRole = idealComplements.includes(candidate.role);
      const isSameRole = candidate.role.toLowerCase() === user.role.toLowerCase();

      if (isComplementaryRole) {
        score += 35;
        reasons.push(
          `Role Synergy: ${candidate.name}'s focus as ${candidate.role} balances your ${user.role} role for an end-to-end hackathon build.`
        );
      } else if (isSameRole) {
        score += 18;
        reasons.push(
          `Peer Specialization: You both focus on ${candidate.role}, enabling deep pair programming and distributed load.`
        );
      } else {
        score += 24;
        reasons.push(
          `Cross-Functional: ${candidate.name} brings ${candidate.role} capability into your project loop.`
        );
      }

      // 2. Shared Interests Overlap (up to 30 pts)
      const sharedInterests = candidate.interests.filter((ci) =>
        userInterestsSet.has(ci.toLowerCase().trim())
      );

      if (sharedInterests.length > 0) {
        const interestPoints = Math.min(30, sharedInterests.length * 15);
        score += interestPoints;
        reasons.push(
          `Shared Vision: Mutual excitement around ${sharedInterests.join(' & ')} ensures aligned project motivation.`
        );
      } else {
        score += 8;
        reasons.push(
          `Domain Expansion: ${candidate.name}'s interests (${candidate.interests.slice(0, 2).join(', ')}) bring fresh angles to the table.`
        );
      }

      // 3. Skill Complementarity & Gap Filling (up to 20 pts)
      const complementarySkills = candidate.skills.filter(
        (cs) => !userSkillsSet.has(cs.toLowerCase().trim())
      );
      const sharedSkills = candidate.skills.filter((cs) =>
        userSkillsSet.has(cs.toLowerCase().trim())
      );

      if (complementarySkills.length > 0) {
        const compPoints = Math.min(20, complementarySkills.length * 7);
        score += compPoints;
        reasons.push(
          `Fills Skill Gaps: Adds ${complementarySkills.slice(0, 2).join(' & ')} to your stack without redundant overlap.`
        );
      } else if (sharedSkills.length > 0) {
        score += 12;
        reasons.push(
          `Shared Technical Foundation: Common fluency in ${sharedSkills.join(', ')} speeds up communication.`
        );
      }

      // 4. Project Goal & Semantic Alignment (up to 15 pts)
      const candidateGoalWords = normalizeText(candidate.goal);
      const commonGoalWords = candidateGoalWords.filter((w) => userGoalWords.has(w));

      if (commonGoalWords.length > 0) {
        const goalPoints = Math.min(15, commonGoalWords.length * 6);
        score += goalPoints;
        reasons.push(
          `Goal Convergence: Both projects target similar objectives around "${candidate.goal}".`
        );
      } else {
        score += 5;
      }

      // Cap score between 35 and 98 to keep demo realistic and believable
      const finalScore = Math.min(98, Math.max(42, Math.round(score)));

      // Select top 2 or 3 distinct reasons
      const refinedReasons = reasons.slice(0, 3);

      return {
        id: candidate.id,
        name: candidate.name,
        score: finalScore,
        skills: candidate.skills,
        interests: candidate.interests,
        role: candidate.role,
        goal: candidate.goal,
        reasons: refinedReasons,
        complementarySkills,
        missingRoleAddressed: isComplementaryRole ? candidate.role : undefined,
        isDemoResult: true
      } as MatchRecommendation;
    });

  // Sort by highest matching score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates.slice(0, limit);
}
