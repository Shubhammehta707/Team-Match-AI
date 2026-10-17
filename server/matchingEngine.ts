/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchRequest, MatchRecommendation, StudentProfile, ScoreBreakdown } from './types.js';

// Pre-defined role synergy matrix (higher = greater role complementarity for a hackathon squad)
const ROLE_SYNERGY_MATRIX: Record<string, Record<string, number>> = {
  'Frontend Engineer': {
    'Backend Engineer': 20,
    'ML / AI Engineer': 19,
    'UI / UX Designer': 18,
    'DevOps / Cloud Engineer': 16,
    'Full-Stack Developer': 14,
    'Product Manager': 16,
    'Data Scientist': 15,
    'Hardware / IoT Engineer': 16,
    'Security & Blockchain Engineer': 15,
    'Mobile Developer': 12,
    'Frontend Engineer': 7
  },
  'Backend Engineer': {
    'Frontend Engineer': 20,
    'UI / UX Designer': 18,
    'ML / AI Engineer': 18,
    'Mobile Developer': 19,
    'Product Manager': 17,
    'DevOps / Cloud Engineer': 15,
    'Data Scientist': 16,
    'Hardware / IoT Engineer': 17,
    'Security & Blockchain Engineer': 16,
    'Full-Stack Developer': 13,
    'Backend Engineer': 6
  },
  'ML / AI Engineer': {
    'Frontend Engineer': 20,
    'Full-Stack Developer': 19,
    'Backend Engineer': 18,
    'UI / UX Designer': 18,
    'Product Manager': 17,
    'Data Scientist': 15,
    'Mobile Developer': 17,
    'DevOps / Cloud Engineer': 16,
    'Hardware / IoT Engineer': 16,
    'Security & Blockchain Engineer': 14,
    'ML / AI Engineer': 8
  },
  'UI / UX Designer': {
    'Frontend Engineer': 20,
    'Full-Stack Developer': 19,
    'Mobile Developer': 20,
    'Backend Engineer': 17,
    'ML / AI Engineer': 18,
    'Product Manager': 18,
    'Hardware / IoT Engineer': 15,
    'Data Scientist': 14,
    'DevOps / Cloud Engineer': 12,
    'Security & Blockchain Engineer': 13,
    'UI / UX Designer': 6
  },
  'Full-Stack Developer': {
    'UI / UX Designer': 19,
    'ML / AI Engineer': 19,
    'Product Manager': 18,
    'DevOps / Cloud Engineer': 17,
    'Data Scientist': 16,
    'Hardware / IoT Engineer': 17,
    'Security & Blockchain Engineer': 16,
    'Mobile Developer': 16,
    'Frontend Engineer': 14,
    'Backend Engineer': 14,
    'Full-Stack Developer': 11
  },
  'Product Manager': {
    'Full-Stack Developer': 20,
    'Frontend Engineer': 19,
    'Backend Engineer': 19,
    'UI / UX Designer': 19,
    'ML / AI Engineer': 18,
    'Mobile Developer': 18,
    'Hardware / IoT Engineer': 16,
    'Data Scientist': 16,
    'DevOps / Cloud Engineer': 15,
    'Security & Blockchain Engineer': 15,
    'Product Manager': 6
  },
  'Mobile Developer': {
    'Backend Engineer': 20,
    'UI / UX Designer': 20,
    'ML / AI Engineer': 18,
    'Product Manager': 17,
    'DevOps / Cloud Engineer': 15,
    'Full-Stack Developer': 16,
    'Data Scientist': 14,
    'Hardware / IoT Engineer': 16,
    'Security & Blockchain Engineer': 15,
    'Frontend Engineer': 12,
    'Mobile Developer': 7
  },
  'Data Scientist': {
    'Frontend Engineer': 19,
    'Full-Stack Developer': 18,
    'Product Manager': 17,
    'Backend Engineer': 17,
    'UI / UX Designer': 16,
    'DevOps / Cloud Engineer': 16,
    'ML / AI Engineer': 15,
    'Mobile Developer': 14,
    'Hardware / IoT Engineer': 15,
    'Security & Blockchain Engineer': 14,
    'Data Scientist': 8
  },
  'DevOps / Cloud Engineer': {
    'Backend Engineer': 18,
    'Frontend Engineer': 18,
    'Full-Stack Developer': 18,
    'ML / AI Engineer': 18,
    'Mobile Developer': 16,
    'Product Manager': 15,
    'Security & Blockchain Engineer': 17,
    'Hardware / IoT Engineer': 15,
    'UI / UX Designer': 13,
    'Data Scientist': 15,
    'DevOps / Cloud Engineer': 7
  },
  'Hardware / IoT Engineer': {
    'Backend Engineer': 19,
    'Full-Stack Developer': 18,
    'Mobile Developer': 18,
    'Frontend Engineer': 17,
    'ML / AI Engineer': 17,
    'Product Manager': 16,
    'UI / UX Designer': 15,
    'DevOps / Cloud Engineer': 15,
    'Security & Blockchain Engineer': 15,
    'Data Scientist': 14,
    'Hardware / IoT Engineer': 7
  },
  'Security & Blockchain Engineer': {
    'Full-Stack Developer': 19,
    'Backend Engineer': 19,
    'Frontend Engineer': 17,
    'DevOps / Cloud Engineer': 17,
    'Product Manager': 16,
    'Mobile Developer': 15,
    'UI / UX Designer': 14,
    'ML / AI Engineer': 15,
    'Data Scientist': 14,
    'Hardware / IoT Engineer': 15,
    'Security & Blockchain Engineer': 7
  }
};

function normalizeRole(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('front')) return 'Frontend Engineer';
  if (r.includes('back')) return 'Backend Engineer';
  if (r.includes('ml') || r.includes('ai') || r.includes('machine learning')) return 'ML / AI Engineer';
  if (r.includes('ui') || r.includes('ux') || r.includes('design')) return 'UI / UX Designer';
  if (r.includes('full') || r.includes('full-stack') || r.includes('fullstack')) return 'Full-Stack Developer';
  if (r.includes('product') || r.includes('pm')) return 'Product Manager';
  if (r.includes('mobile') || r.includes('ios') || r.includes('android') || r.includes('flutter')) return 'Mobile Developer';
  if (r.includes('data')) return 'Data Scientist';
  if (r.includes('devops') || r.includes('cloud') || r.includes('infra')) return 'DevOps / Cloud Engineer';
  if (r.includes('hardware') || r.includes('iot') || r.includes('embedded')) return 'Hardware / IoT Engineer';
  if (r.includes('security') || r.includes('blockchain') || r.includes('web3') || r.includes('crypto')) return 'Security & Blockchain Engineer';
  return role;
}

function extractKeywords(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'their', 'our', 'my', 'your', 'this', 'that',
    'build', 'make', 'create', 'develop', 'want', 'project', 'hackathon'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

export function scoreCandidate(
  requester: MatchRequest,
  candidate: StudentProfile
): MatchRecommendation | null {
  if (requester.id && candidate.id && requester.id === candidate.id) {
    return null;
  }
  if (
    requester.name &&
    candidate.name &&
    requester.name.trim().toLowerCase() === candidate.name.trim().toLowerCase()
  ) {
    return null;
  }

  const requesterSkillsLower = new Set<string>(
    (requester.skills || []).map((s: string) => s.toLowerCase().trim()).filter(Boolean)
  );
  const candidateSkills = (candidate.skills || []).map((s: string) => s.trim()).filter(Boolean);

  const complementarySkills = candidateSkills.filter(
    (s: string) => !requesterSkillsLower.has(s.toLowerCase())
  );
  const sharedSkills = candidateSkills.filter(
    (s: string) => requesterSkillsLower.has(s.toLowerCase())
  );

  let skillComplementarity = 0;
  if (complementarySkills.length > 0) {
    skillComplementarity += Math.min(32, complementarySkills.length * 8);
  }
  if (sharedSkills.length > 0) {
    skillComplementarity += Math.min(8, sharedSkills.length * 4);
  }
  skillComplementarity = Math.min(40, Math.max(0, skillComplementarity));

  const normReqRole = normalizeRole(requester.role || 'Full-Stack Developer');
  const normCandRole = normalizeRole(candidate.role || 'Full-Stack Developer');

  let roleSynergy = 12;
  if (ROLE_SYNERGY_MATRIX[normReqRole]?.[normCandRole] !== undefined) {
    roleSynergy = ROLE_SYNERGY_MATRIX[normReqRole][normCandRole];
  } else if (normReqRole.toLowerCase() === normCandRole.toLowerCase()) {
    roleSynergy = 8;
  } else {
    roleSynergy = 14;
  }
  roleSynergy = Math.min(20, Math.max(0, roleSynergy));

  const reqInterestsLower = new Set<string>(
    (requester.interests || []).map((i: string) => i.toLowerCase().trim()).filter(Boolean)
  );
  const sharedInterests = (candidate.interests || []).filter((i: string) =>
    reqInterestsLower.has(i.toLowerCase().trim())
  );

  let sharedInterestsScore = 0;
  if (sharedInterests.length === 1) sharedInterestsScore = 14;
  else if (sharedInterests.length === 2) sharedInterestsScore = 20;
  else if (sharedInterests.length >= 3) sharedInterestsScore = 25;
  else {
    const partials = (candidate.interests || []).filter((ci: string) => {
      const cLower = ci.toLowerCase();
      for (const ri of Array.from(reqInterestsLower)) {
        if (cLower.includes(ri) || ri.includes(cLower)) return true;
      }
      return false;
    });
    if (partials.length > 0) {
      sharedInterestsScore = Math.min(10, partials.length * 5);
    }
  }
  sharedInterestsScore = Math.min(25, Math.max(0, sharedInterestsScore));

  const reqGoalKeywords = extractKeywords(requester.goal || '');
  const candGoalKeywords = extractKeywords(candidate.goal || '');

  const commonKeywords = Array.from(reqGoalKeywords).filter((kw: string) =>
    candGoalKeywords.has(kw)
  );

  let goalAlignmentScore = 0;
  if (commonKeywords.length > 0) {
    goalAlignmentScore = Math.min(15, commonKeywords.length * 5);
  } else {
    const reqWantsWin = /win|prize|first|best|grand/i.test(requester.goal || '');
    const candWantsWin = /win|prize|first|best|grand/i.test(candidate.goal || '');
    if (reqWantsWin === candWantsWin) {
      goalAlignmentScore += 4;
    }
    const reqWantsMvp = /mvp|ship|launch|prototype/i.test(requester.goal || '');
    const candWantsMvp = /mvp|ship|launch|prototype/i.test(candidate.goal || '');
    if (reqWantsMvp && candWantsMvp) {
      goalAlignmentScore += 4;
    }
  }
  goalAlignmentScore = Math.min(15, Math.max(0, goalAlignmentScore));

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(skillComplementarity + roleSynergy + sharedInterestsScore + goalAlignmentScore)
    )
  );

  const reasons: string[] = [];

  if (roleSynergy >= 18) {
    reasons.push(
      `Strong role synergy: ${candidate.role} directly balances your ${requester.role || 'profile'} for full-coverage hackathon delivery.`
    );
  } else if (normReqRole.toLowerCase() === normCandRole.toLowerCase()) {
    reasons.push(
      `Peer collaboration: Shares your ${candidate.role} background, enabling paired work on challenging tasks.`
    );
  } else {
    reasons.push(
      `Complementary discipline: Offers ${candidate.role} perspective to round out the project squad.`
    );
  }

  if (complementarySkills.length > 0) {
    const highlights = complementarySkills.slice(0, 3).join(', ');
    reasons.push(
      `Brings key technical capabilities you lack: ${highlights}.`
    );
  }

  if (sharedInterests.length > 0) {
    reasons.push(
      `Shared passion: Both excited about ${sharedInterests.join(', ')}.`
    );
  } else if (sharedInterestsScore > 0) {
    reasons.push(
      `Adjacent domain interests that bridge your target hackathon themes.`
    );
  }

  if (commonKeywords.length > 0) {
    reasons.push(
      `Aligned project focus: Mutual focus on "${commonKeywords.slice(0, 3).join(', ')}".`
    );
  } else if (goalAlignmentScore > 0) {
    reasons.push(
      `Harmonized hackathon mindset: Aligned expectations on project tempo and delivery goals.`
    );
  }

  const breakdown: ScoreBreakdown = {
    skillComplementarity,
    roleSynergy,
    sharedInterests: sharedInterestsScore,
    goalAlignment: goalAlignmentScore
  };

  return {
    id: candidate.id,
    name: candidate.name,
    score: totalScore,
    role: candidate.role,
    skills: candidate.skills,
    interests: candidate.interests,
    goal: candidate.goal,
    reasons,
    breakdown
  };
}

export function findTopMatches(
  requester: MatchRequest,
  candidates: StudentProfile[],
  limit: number = 3
): MatchRecommendation[] {
  const scored = candidates
    .map(candidate => scoreCandidate(requester, candidate))
    .filter((res): res is MatchRecommendation => res !== null);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.breakdown.skillComplementarity - a.breakdown.skillComplementarity;
  });

  return scored.slice(0, limit);
}
