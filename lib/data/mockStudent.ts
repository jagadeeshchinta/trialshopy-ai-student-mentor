// ============================================================
// lib/data/mockStudent.ts
// Synthetic University SIS / LMS data connector.
// Provides a realistic academic dataset for Jagadeesh Chinta
// (LPU, B.Tech CSE, Sem 6) to drive the kiosk MVP without
// a live backend.
// ============================================================

import type {
  StudentProfile,
  CoursePerformance,
  TopicAssessment,
} from '@/types/kiosk';

// ─── DSA Sub-Topic Assessments ───────────────────────────────

const dsaTopics: TopicAssessment[] = [
  {
    topicName: 'Arrays & Hashing',
    scorePercent: 85,
    proficiency: 'Proficient',
    notes: 'Consistently strong. Quiz 1 score: 87/100. Lab submitted on time.',
  },
  {
    topicName: 'Stacks & Queues',
    scorePercent: 78,
    proficiency: 'Competent',
    notes:
      'Good grasp of LIFO/FIFO principles. Minor gaps in monotonic stack patterns.',
  },
  {
    topicName: 'Binary Search Trees & Traversals',
    scorePercent: 52,
    proficiency: 'Lagging',
    notes:
      'Quiz 2 (Trees & Graphs) scored 52% — 18 percentage points below the student\'s own course average. ' +
      'In-order traversal lab: submitted but partially incorrect. BST deletion logic missing.',
  },
  {
    topicName: 'Graph Algorithms (BFS/DFS)',
    scorePercent: 44,
    proficiency: 'Lagging',
    notes:
      'DFS traversal lab: marked INCOMPLETE in LMS as of Sem 6 Week 8. ' +
      'BFS shortest-path problem set: 3/7 questions attempted. ' +
      'No re-attempt recorded for the missed lab.',
  },
];

// ─── Enrolled Courses ────────────────────────────────────────

const enrolledCourses: CoursePerformance[] = [
  // ── 1. Data Structures & Algorithms ──
  {
    courseName: 'Data Structures & Algorithms (CSE302)',
    courseCode: 'CSE302',
    overallScorePercent: 64,
    status: 'Requires Immediate Focus',
    attendancePercent: 76,
    topicAssessments: dsaTopics,
    diagnosticEvidence: [
      'Quiz 2 (Trees & Graphs): scored 52% — an 18% drop below this student\'s own rolling course average of 70%.',
      'DFS Traversal Lab (Week 7): recorded as INCOMPLETE in the LMS; no extension request filed.',
      'Graph Algorithms problem set: only 3 of 7 questions attempted; deadline passed without resubmission.',
      'Attendance at 76% is below the 80% threshold required to sit the end-semester examination without penalty.',
      'Peer comparison: class average for CSE302 is 72%; student is 8 points below cohort mean.',
    ],
  },

  // ── 2. Operating Systems ──
  {
    courseName: 'Operating Systems (CSE316)',
    courseCode: 'CSE316',
    overallScorePercent: 78,
    status: 'On Track',
    attendancePercent: 86,
    topicAssessments: [],
    diagnosticEvidence: [
      'Consistent quiz performance across Process Scheduling, Memory Management, and File Systems.',
      'Mid-semester examination: 76/100 — above class average of 71%.',
      'All lab submissions on time and graded; no incomplete flags.',
    ],
  },

  // ── 3. Database Management Systems ──
  {
    courseName: 'Database Management Systems (CSE305)',
    courseCode: 'CSE305',
    overallScorePercent: 84,
    status: 'Strong',
    attendancePercent: 90,
    topicAssessments: [],
    diagnosticEvidence: [
      'Highest-performing course this semester; consistently above class average.',
      'ER Modelling and Normalisation assignments: full marks (10/10).',
      'SQL Lab practical: completed all advanced query exercises (JOINs, subqueries, indexing).',
      'Mid-semester examination: 84/100 — 11 points above class average of 73%.',
    ],
  },
];

// ─── Primary Mock Student Record ─────────────────────────────

/**
 * Full synthetic academic record for Jagadeesh Chinta.
 * Simulates data as it would be fetched from the LPU SIS/LMS
 * REST API (e.g. GET /api/v1/students/{rollId}/profile).
 */
export const MOCK_STUDENT: StudentProfile = {
  fullName: 'Jagadeesh Chinta',
  university: 'Lovely Professional University (LPU)',
  degree: 'B.Tech Computer Science Engineering',
  currentSemester: 6,
  rollId: '12204581',
  cgpa: 7.5,
  academicYear: '2025–2026',
  enrolledCourses,
  avatarUrl: undefined, // No photo in demo mode; kiosk renders initials avatar
};

// ─── Helper Utilities ────────────────────────────────────────

/**
 * Simulate an asynchronous SIS lookup by Roll ID.
 * In production, replace with a real `fetch()` call to the
 * university API.
 *
 * @param rollId  Student roll/ID number
 * @returns       Resolved student profile or null if not found
 */
export async function fetchStudentByRollId(
  rollId: string
): Promise<StudentProfile | null> {
  // Simulate network latency
  await new Promise<void>((resolve) => setTimeout(resolve, 600));

  const cleanId = rollId?.trim();
  if (!cleanId) return null;

  return {
    ...MOCK_STUDENT,
    rollId: cleanId,
    fullName: cleanId === '12311668' ? 'Jagadeesh Chinta' : MOCK_STUDENT.fullName,
  };
}

/**
 * Returns courses that require immediate academic intervention
 * (overall score < 70% OR attendance < 80%).
 */
export function getFlaggedCourses(student: StudentProfile): CoursePerformance[] {
  return student.enrolledCourses.filter(
    (c) => c.overallScorePercent < 70 || c.attendancePercent < 80
  );
}

/**
 * Computes a simple overall academic health label for the student
 * based on their CGPA and number of flagged courses.
 */
export function getAcademicHealthLabel(
  student: StudentProfile
): 'Excellent' | 'Good' | 'Needs Attention' | 'At Risk' {
  const flagged = getFlaggedCourses(student).length;
  if (student.cgpa >= 8.5 && flagged === 0) return 'Excellent';
  if (student.cgpa >= 7.0 && flagged <= 1) return 'Good';
  if (student.cgpa >= 6.0 || flagged <= 2) return 'Needs Attention';
  return 'At Risk';
}

