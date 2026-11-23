export interface StudentProfileData {
  id: string;
  name: string;
  rollId: string;
  university: string;
  degree: string;
  batch: string;
  currentSemester: number;
  currentCgpa: number;
  activeBacklogs: number;
  coreStrengths: string[];
  areasForImprovement: string[];
  isGuest?: boolean;
}

export const STUDENT_DIRECTORY: Record<string, StudentProfileData> = {
  '12311668': {
    id: '12311668',
    name: 'Jagadeesh Chinta',
    rollId: '12311668',
    university: 'Lovely Professional University (LPU)',
    degree: 'B.Tech Computer Science and Engineering',
    batch: '2027',
    currentSemester: 7,
    currentCgpa: 7.5,
    activeBacklogs: 0,
    coreStrengths: ['Data Structures and Algorithms', 'Next.js', 'Cloud Computing'],
    areasForImprovement: ['Operating Systems', 'Advanced Computer Networks'],
    isGuest: false,
  },
  '12311892': {
    id: '12311892',
    name: 'Priya Sharma',
    rollId: '12311892',
    university: 'Lovely Professional University (LPU)',
    degree: 'B.Tech CSE (AI & Machine Learning)',
    batch: '2027',
    currentSemester: 7,
    currentCgpa: 8.4,
    activeBacklogs: 0,
    coreStrengths: ['Deep Learning', 'PyTorch', 'Distributed Systems'],
    areasForImprovement: ['Computer Graphics', 'Microprocessors'],
    isGuest: false,
  },
  '12309441': {
    id: '12309441',
    name: 'Aman Verma',
    rollId: '12309441',
    university: 'Lovely Professional University (LPU)',
    degree: 'B.Tech Information Technology',
    batch: '2027',
    currentSemester: 7,
    currentCgpa: 7.1,
    activeBacklogs: 0,
    coreStrengths: ['Cybersecurity', 'Database Management', 'DevOps'],
    areasForImprovement: ['Theory of Computation', 'Compiler Design'],
    isGuest: false,
  },
  guest: {
    id: 'guest',
    name: 'Guest Student',
    rollId: 'GUEST-UNVERIFIED',
    university: 'Campus Visitor / Prospective Student',
    degree: 'Unregistered Student • Guest Mode',
    batch: '2027',
    currentSemester: 7,
    currentCgpa: 7.8,
    activeBacklogs: 0,
    coreStrengths: ['Problem Solving', 'System Architecture', 'Full-Stack Development'],
    areasForImprovement: ['Operating Systems', 'Advanced Computer Networks'],
    isGuest: true,
  },
};

export function getStudentById(id: string): StudentProfileData {
  return STUDENT_DIRECTORY[id] || STUDENT_DIRECTORY['guest'];
}

export function createGuestProfile(customName?: string): StudentProfileData {
  const name = customName && customName.trim() ? customName.trim() : 'Guest Student';
  return {
    ...STUDENT_DIRECTORY['guest'],
    name,
    rollId: 'GUEST-' + Math.floor(100000 + Math.random() * 900000),
  };
}
