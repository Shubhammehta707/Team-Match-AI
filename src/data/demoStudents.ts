import { StudentProfile, StudentRole } from '../types/student';

export const ROLE_COLORS: Record<StudentRole, { bg: string; border: string; text: string; hex: string; lightHex: string }> = {
  'AI/ML': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', hex: '#7c3aed', lightHex: '#ede9fe' },
  'Designer': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', hex: '#e11d48', lightHex: '#ffe4e6' },
  'Frontend': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', hex: '#0284c7', lightHex: '#e0f2fe' },
  'Backend': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', hex: '#059669', lightHex: '#d1fae5' },
  'Data': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', hex: '#d97706', lightHex: '#fef3c7' },
  'Research': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', hex: '#4f46e5', lightHex: '#e0e7ff' },
  'QA': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', hex: '#0d9488', lightHex: '#ccfbf1' },
  'Database': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hex: '#2563eb', lightHex: '#dbeafe' },
  'Product': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', hex: '#8b5cf6', lightHex: '#ede9fe' },
};

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'aarav',
    name: 'Aarav',
    skills: ['Python', 'AI/ML', 'Data Analysis'],
    interests: ['Education', 'AI'],
    goal: 'AI learning assistant',
    role: 'AI/ML',
    avatarInitials: 'AA',
    avatarColor: '#a855f7',
    bio: 'CS junior focused on transformers and interactive student tutoring architectures.'
  },
  {
    id: 'diya',
    name: 'Diya',
    skills: ['UI/UX', 'Figma', 'Wireframing'],
    interests: ['Education', 'Design'],
    goal: 'accessible learning apps',
    role: 'Designer',
    avatarInitials: 'DI',
    avatarColor: '#f43f5e',
    bio: 'Design systems lead passionate about WCAG contrast and frictionless onboarding.'
  },
  {
    id: 'kabir',
    name: 'Kabir',
    skills: ['JavaScript', 'React', 'CSS'],
    interests: ['Web Development', 'Education'],
    goal: 'interactive web apps',
    role: 'Frontend',
    avatarInitials: 'KA',
    avatarColor: '#06b6d4',
    bio: 'Frontend developer crafting snappy client-side interfaces and modular UI components.'
  },
  {
    id: 'meera',
    name: 'Meera',
    skills: ['Research', 'Documentation', 'Presentation'],
    interests: ['Education', 'Social Impact'],
    goal: 'research learning needs',
    role: 'Research',
    avatarInitials: 'ME',
    avatarColor: '#6366f1',
    bio: 'Cognitive science student investigating how students retain complex algorithmic concepts.'
  },
  {
    id: 'rohan',
    name: 'Rohan',
    skills: ['Node.js', 'APIs', 'JavaScript'],
    interests: ['Web Development', 'AI'],
    goal: 'reliable backends',
    role: 'Backend',
    avatarInitials: 'RO',
    avatarColor: '#10b981',
    bio: 'Backend engineer specializing in resilient microservices, rate-limiting, and REST contracts.'
  },
  {
    id: 'anaya',
    name: 'Anaya',
    skills: ['Python', 'Data Visualization', 'SQL'],
    interests: ['Analytics', 'Education'],
    goal: 'student analytics dashboard',
    role: 'Data',
    avatarInitials: 'AN',
    avatarColor: '#f59e0b',
    bio: 'Data analyst focused on turning raw telemetry into actionable student progress views.'
  },
  {
    id: 'ishaan',
    name: 'Ishaan',
    skills: ['React', 'JavaScript', 'Git'],
    interests: ['Web Development', 'Product Building'],
    goal: 'student collaboration tools',
    role: 'Frontend',
    avatarInitials: 'IS',
    avatarColor: '#06b6d4',
    bio: 'Full-cycle web builder passionate about collaborative canvas tools and fast state management.'
  },
  {
    id: 'sara',
    name: 'Sara',
    skills: ['Figma', 'UI/UX', 'Prototyping'],
    interests: ['Design', 'Accessibility'],
    goal: 'easy-to-use student apps',
    role: 'Designer',
    avatarInitials: 'SA',
    avatarColor: '#f43f5e',
    bio: 'UX researcher dedicated to simplified typography and low-barrier digital experiences.'
  },
  {
    id: 'vivaan',
    name: 'Vivaan',
    skills: ['Python', 'Machine Learning', 'APIs'],
    interests: ['AI', 'Automation'],
    goal: 'AI-powered tool',
    role: 'AI/ML',
    avatarInitials: 'VI',
    avatarColor: '#a855f7',
    bio: 'Machine learning practitioner working with fast inference engines and semantic search.'
  },
  {
    id: 'nisha',
    name: 'Nisha',
    skills: ['Testing', 'Documentation', 'Research'],
    interests: ['Quality', 'Education'],
    goal: 'improve app reliability',
    role: 'QA',
    avatarInitials: 'NI',
    avatarColor: '#14b8a6',
    bio: 'Software verification advocate writing automated E2E suites and clear integration docs.'
  },
  {
    id: 'arjun',
    name: 'Arjun',
    skills: ['Neo4j', 'Cypher', 'Node.js'],
    interests: ['Graph Databases', 'AI'],
    goal: 'graph-powered apps',
    role: 'Database',
    avatarInitials: 'AR',
    avatarColor: '#3b82f6',
    bio: 'Database architect modeling complex entity graphs and knowledge network traversals.'
  },
  {
    id: 'kiara',
    name: 'Kiara',
    skills: ['Product Planning', 'Pitching', 'Research'],
    interests: ['Startups', 'Education'],
    goal: 'student products',
    role: 'Product',
    avatarInitials: 'KI',
    avatarColor: '#8b5cf6',
    bio: 'Product strategist focused on user empathy, competition pitch readiness, and roadmaps.'
  }
];

export const POPULAR_SKILLS = [
  'Python',
  'AI/ML',
  'Data Analysis',
  'React',
  'JavaScript',
  'Node.js',
  'UI/UX',
  'Figma',
  'SQL',
  'Data Visualization',
  'APIs',
  'Testing',
  'Product Planning',
  'Research',
  'Neo4j'
];

export const POPULAR_INTERESTS = [
  'Education',
  'AI',
  'Web Development',
  'Design',
  'Social Impact',
  'Analytics',
  'Accessibility',
  'Automation',
  'Startups',
  'Quality',
  'Graph Databases'
];

export const PREFERRED_ROLES: StudentRole[] = [
  'AI/ML',
  'Designer',
  'Frontend',
  'Backend',
  'Data',
  'Research',
  'QA',
  'Database',
  'Product'
];

export const PRESET_DEMO_PROFILES: { label: string; profile: { name: string; skills: string[]; interests: string[]; goal: string; role: StudentRole } }[] = [
  {
    label: 'Elena (Frontend Dev seeking AI & Design)',
    profile: {
      name: 'Elena Rostova',
      skills: ['React', 'JavaScript', 'CSS', 'TypeScript'],
      interests: ['Education', 'AI', 'Web Development'],
      goal: 'Build an AI-powered student study companion with great UI',
      role: 'Frontend'
    }
  },
  {
    label: 'Marcus (AI Engineer seeking Web & Product)',
    profile: {
      name: 'Marcus Chen',
      skills: ['Python', 'AI/ML', 'PyTorch'],
      interests: ['Education', 'Startups', 'Automation'],
      goal: 'Deploy an automated code feedback tool for college hackathons',
      role: 'AI/ML'
    }
  },
  {
    label: 'Zoe (UI/UX Designer seeking Full-Stack Eng)',
    profile: {
      name: 'Zoe Morales',
      skills: ['UI/UX', 'Figma', 'Prototyping', 'Wireframing'],
      interests: ['Accessibility', 'Education', 'Design'],
      goal: 'Design high-contrast accessible tools for neurodivergent learners',
      role: 'Designer'
    }
  }
];
