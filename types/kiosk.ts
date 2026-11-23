// ============================================================
// types/kiosk.ts
// TypeScript contracts for the Trialshopy AI Smart Student
// Mentor Display campus kiosk MVP.
// ============================================================

// ─── Kiosk Session State Machine ────────────────────────────

/**
 * All possible states the kiosk session can be in.
 * The state machine flows:
 * WAKE_SCREEN → CONSENT_AUTH → ACADEMIC_DIAGNOSTIC →
 * AI_MENTOR_SESSION → ROADMAP_VIEW → QR_MOBILE_HANDOFF
 * and can reset back to WAKE_SCREEN at any time.
 */
export type KioskSessionStep =
  | 'WAKE_SCREEN'
  | 'CONSENT_AUTH'
  | 'ACADEMIC_DIAGNOSTIC'
  | 'AI_MENTOR_SESSION'
  | 'ROADMAP_VIEW'
  | 'QR_MOBILE_HANDOFF';

// ─── Academic Performance Types ─────────────────────────────

/** Proficiency level labels for a given sub-topic score. */
export type ProficiencyLevel =
  | 'Proficient'
  | 'Competent'
  | 'Lagging'
  | 'At Risk';

/** Status label for a course's overall health. */
export type CourseStatus =
  | 'Strong'
  | 'On Track'
  | 'Requires Immediate Focus'
  | 'Critical';

/** Granular assessment result for a single sub-topic within a course. */
export interface TopicAssessment {
  /** Human-readable topic name, e.g. "Arrays & Hashing" */
  topicName: string;
  /** Score as a percentage (0–100) */
  scorePercent: number;
  /** Interpreted proficiency bucket */
  proficiency: ProficiencyLevel;
  /** Optional additional notes from the LMS */
  notes?: string;
}

/** Full performance record for one enrolled course. */
export interface CoursePerformance {
  /** Course code + name, e.g. "Data Structures & Algorithms (CSE302)" */
  courseName: string;
  /** Short course code for display, e.g. "CSE302" */
  courseCode: string;
  /** Percentage score across all assessments (0–100) */
  overallScorePercent: number;
  /** High-level health label for this course */
  status: CourseStatus;
  /** Attendance percentage (0–100) */
  attendancePercent: number;
  /** Granular per-topic breakdown; may be empty for courses without sub-topics */
  topicAssessments: TopicAssessment[];
  /**
   * Diagnostic evidence: concrete explanation of *why* this course has its
   * status (populated by the SIS/LMS evidence engine).
   */
  diagnosticEvidence: string[];
}

/** Core student identity and academic metadata. */
export interface StudentProfile {
  /** Student's full name */
  fullName: string;
  /** University or institution */
  university: string;
  /** Degree programme */
  degree: string;
  /** Current semester number */
  currentSemester: number;
  /** University-issued roll / student ID */
  rollId: string;
  /** Most recently computed cumulative GPA (0–10 scale) */
  cgpa: number;
  /** Academic year string, e.g. "2023–2024" */
  academicYear: string;
  /** All currently enrolled courses */
  enrolledCourses: CoursePerformance[];
  /** Profile photo URL or base-64 data URI (optional for kiosk display) */
  avatarUrl?: string;
}

// ─── Personalised Learning Roadmap Types ────────────────────

/** Priority level for a roadmap task */
export type TaskPriority = 'High' | 'Medium' | 'Low';

/** Completion status of a roadmap task */
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

/** An atomic, actionable learning task within a roadmap phase. */
export interface RoadmapTask {
  /** Unique identifier */
  id: string;
  /** Short action-oriented title */
  title: string;
  /** Detailed description of what the student should do */
  description: string;
  /** Estimated time to complete (e.g. "2 hours", "3 days") */
  estimatedDuration: string;
  /** Which course this task addresses */
  relatedCourseCode: string;
  /** Which topic within that course this task targets */
  relatedTopicName?: string;
  /** Suggested external resource URL */
  resourceUrl?: string;
  /** Priority ordering */
  priority: TaskPriority;
  /** Current completion state */
  status: TaskStatus;
}

/** A themed phase grouping several related tasks in a roadmap. */
export interface RoadmapPhase {
  /** Phase number (1-indexed) */
  phaseNumber: number;
  /** Phase label, e.g. "Foundation Repair", "Skill Consolidation" */
  phaseName: string;
  /** Overall goal of this phase */
  goalSummary: string;
  /** Suggested calendar duration for this phase */
  suggestedTimeframe: string;
  /** Ordered list of tasks within this phase */
  tasks: RoadmapTask[];
}

/** A fully personalised multi-phase learning roadmap for a student. */
export interface PersonalizedRoadmap {
  /** ID of the student this roadmap was generated for */
  studentRollId: string;
  /** ISO timestamp of generation */
  generatedAt: string;
  /** Headline summary the AI mentor produced */
  mentorSummary: string;
  /** Ordered phases from most urgent to long-term */
  phases: RoadmapPhase[];
  /**
   * Top-level courses flagged for immediate intervention, ordered by urgency.
   */
  priorityCourses: string[];
}

// ─── Kiosk Session State ────────────────────────────────────

/** Full runtime state managed by the kiosk session controller. */
export interface KioskSessionState {
  /** Which screen/step the kiosk is currently showing */
  currentState: KioskSessionStep;
  /** The student who has authenticated in this session (null before auth) */
  activeStudent: StudentProfile | null;
  /** Whether the student has accepted the privacy / data-use consent */
  hasConsented: boolean;
  /** The roadmap generated during this session (null until generated) */
  currentRoadmap: PersonalizedRoadmap | null;
  /**
   * Timestamp (ms since epoch) of the last detected user interaction.
   * Used by the auto-reset inactivity timer.
   */
  lastInteractionAt: number;
  /**
   * Duration in milliseconds after which a session with no interaction
   * is automatically reset to WAKE_SCREEN. Default: 60 000 ms (60 s).
   */
  inactivityTimeoutMs: number;
}

// ─── Kiosk Context API ──────────────────────────────────────

/** All actions exposed by the KioskContext to child components. */
export interface KioskContextValue extends KioskSessionState {
  /** Advance from WAKE_SCREEN to CONSENT_AUTH */
  startSession: () => void;
  /** Record consent and authenticate the student; advance to ACADEMIC_DIAGNOSTIC */
  giveConsentAndAuthenticate: (student: StudentProfile) => void;
  /** Advance from ACADEMIC_DIAGNOSTIC to AI_MENTOR_SESSION */
  startMentorChat: () => void;
  /** Store a generated roadmap and advance to ROADMAP_VIEW */
  generateRoadmap: (roadmap: PersonalizedRoadmap) => void;
  /** Advance from ROADMAP_VIEW to QR_MOBILE_HANDOFF */
  showMobileHandoff: () => void;
  /** Hard-reset the entire session back to WAKE_SCREEN and clear all data */
  resetSession: () => void;
  /** Manually record a user interaction (resets the inactivity timer) */
  recordInteraction: () => void;
}

