// ============================================================
// lib/roadmapGenerator.ts
// Generator utility for Personalized Learning Roadmaps.
// Translates student diagnostic weaknesses (CSE302 DSA) into
// a realistic, structured 14-day multi-phase recovery plan.
// ============================================================

import type {
  PersonalizedRoadmap,
  RoadmapPhase,
  StudentProfile,
} from '@/types/kiosk';

interface RoadmapGenerationOptions {
  dailyMinutes?: number;
  specificFocus?: string;
}

export function buildPersonalizedRoadmap(
  student: StudentProfile,
  options: RoadmapGenerationOptions = {}
): PersonalizedRoadmap {
  const dailyMins = options.dailyMinutes ?? 60;

  const phase1: RoadmapPhase = {
    phaseNumber: 1,
    phaseName: 'Foundation Repair — Trees & Traversals',
    goalSummary:
      'Re-anchor core tree traversal logic, master BST node deletion edge-cases, and clear the pending DFS LMS lab submission.',
    suggestedTimeframe: 'Days 1–7 (Week 1)',
    tasks: [
      {
        id: 'task-101',
        title: 'Complete and Resubmit DFS Traversal Lab (Week 7)',
        description:
          'Implement adjacency list DFS traversal with recursion stack tracking and resubmit on the LPU LMS portal.',
        estimatedDuration: '3 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Graph Algorithms (BFS/DFS)',
        resourceUrl: 'https://ums.lpu.in',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-102',
        title: 'Master Binary Tree Traversals (Inorder, Preorder, Postorder)',
        description:
          'Solve 6 recursive & iterative traversal problems on LeetCode (Problems #94, #144, #145) to rebuild confidence.',
        estimatedDuration: '2.5 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Binary Search Trees & Traversals',
        resourceUrl: 'https://leetcode.com/tag/tree/',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-103',
        title: 'Repair BST Search, Insertion & Node Deletion Logic',
        description:
          'Address Quiz 2 deficit by practicing the 3 cases of BST deletion (leaf, one-child, two-children in-order successor).',
        estimatedDuration: '3 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Binary Search Trees & Traversals',
        resourceUrl: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-104',
        title: 'Attend CSE Faculty Doubt-Clearing Session',
        description:
          'Review Quiz 2 test paper with Course Faculty at Block 34 Desk 12 for 1-on-1 walkthrough of graded errors.',
        estimatedDuration: '45 Mins',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Binary Search Trees & Traversals',
        priority: 'Medium',
        status: 'Not Started',
      },
    ],
  };

  const phase2: RoadmapPhase = {
    phaseNumber: 2,
    phaseName: 'Algorithmic Consolidation — Graph BFS/DFS & Exam Readiness',
    goalSummary:
      'Master BFS shortest-path algorithms, cycle detection, and complete a full diagnostic mock test to secure 75%+ overall.',
    suggestedTimeframe: 'Days 8–14 (Week 2)',
    tasks: [
      {
        id: 'task-201',
        title: 'BFS Shortest Path in Unweighted Graphs',
        description:
          'Implement queue-based BFS exploration for shortest distance calculation and connected components identification.',
        estimatedDuration: '3.5 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Graph Algorithms (BFS/DFS)',
        resourceUrl: 'https://leetcode.com/tag/breadth-first-search/',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-202',
        title: 'Cycle Detection in Directed and Undirected Graphs',
        description:
          'Learn coloring technique / visited array recursion stack for directed graphs and disjoint set union (DSU) basics.',
        estimatedDuration: '3 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Graph Algorithms (BFS/DFS)',
        resourceUrl: 'https://leetcode.com/problems/course-schedule/',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-203',
        title: 'CSE302 Mid-Semester Diagnostic Retest Simulation',
        description:
          'Take a timed 90-minute mock exam covering Trees, BST, and Graph traversals to verify readiness for finals.',
        estimatedDuration: '2 Hours',
        relatedCourseCode: 'CSE302',
        relatedTopicName: 'Comprehensive CSE302',
        priority: 'High',
        status: 'Not Started',
      },
      {
        id: 'task-204',
        title: 'OS (CSE316) & DBMS (CSE305) Retention Check',
        description:
          'Spend 2 hours reviewing Operating Systems process scheduling and DBMS SQL indexing to preserve 78%+ and 84% marks.',
        estimatedDuration: '2 Hours',
        relatedCourseCode: 'CSE316 / CSE305',
        priority: 'Medium',
        status: 'Not Started',
      },
    ],
  };

  return {
    studentRollId: student.rollId,
    generatedAt: new Date().toISOString(),
    mentorSummary: `Targeted 14-Day Academic Recovery Plan for ${student.fullName}. Designed around ${dailyMins} min/day study blocks to lift CSE302 from 64% to 75%+ while maintaining strong performance in DBMS (84%) and OS (78%).`,
    phases: [phase1, phase2],
    priorityCourses: ['CSE302'],
  };
}

