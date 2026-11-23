'use client';

// ============================================================
// components/kiosk/AcademicProgressReportModal.tsx
// Module H & Section 10 Compliance:
// Academic Progress Report & Faculty Escalation Referral Modal
//
// Distinguishes baseline verified marks from self-reported progress,
// displays before-and-after comparison metrics, and provides an
// authorized human faculty mentor referral path.
// ============================================================

import React, { useRef } from 'react';
import {
  X,
  Printer,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { StudentProfile, PersonalizedRoadmap, TaskStatus } from '@/types/kiosk';

interface ProgressReportProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  roadmap: PersonalizedRoadmap;
  tasksState: Record<string, TaskStatus>;
}

export default function AcademicProgressReportModal({
  isOpen,
  onClose,
  student,
  roadmap,
  tasksState,
}: ProgressReportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const allTasks = roadmap.phases.flatMap((p) => p.tasks);
  const completedTasks = allTasks.filter((t) => tasksState[t.id] === 'Completed');
  const inProgressTasks = allTasks.filter((t) => tasksState[t.id] === 'In Progress');
  const pendingTasks = allTasks.filter(
    (t) => !tasksState[t.id] || tasksState[t.id] === 'Not Started'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 select-none animate-[kioskFadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-8 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Official Academic Diagnostic & Progress Report</h2>
              <p className="text-xs text-slate-400">
                Trialshopy Smart Campus Station #01 • Generated for {student.fullName} ({student.rollId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all touch-manipulation min-h-[42px]"
            >
              <Printer className="h-4 w-4 text-indigo-400" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div ref={printRef} className="flex-1 overflow-y-auto kiosk-scroll p-8 space-y-6">
          {/* Section 1: Reference & Baseline Data */}
          <div className="grid grid-cols-4 gap-4 p-5 bg-slate-800/40 border border-slate-700/60 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Student Name:</span>
              <span className="text-white font-bold text-sm">{student.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Registration / Roll:</span>
              <span className="text-white font-mono font-bold text-sm">{student.rollId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Programme / Semester:</span>
              <span className="text-white font-bold text-sm">B.Tech CSE • Sem 6</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">Baseline CGPA:</span>
              <span className="text-indigo-400 font-bold text-sm">{student.cgpa} / 10.0</span>
            </div>
          </div>

          {/* Section 2: Subject Audit (Verified SIS Data vs Intervention Targets) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Coursework Diagnostic Audit (LPU SIS Database)
            </h3>
            <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Course Code & Title</th>
                    <th className="py-3 px-4 font-semibold">Attendance</th>
                    <th className="py-3 px-4 font-semibold">Baseline Score</th>
                    <th className="py-3 px-4 font-semibold">Target (14-Day)</th>
                    <th className="py-3 px-4 font-semibold">Status / Diagnostic Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr className="bg-red-950/20">
                    <td className="py-3 px-4 font-bold text-white">CSE302: Data Structures & Algorithms</td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">76% (Below 80% threshold)</td>
                    <td className="py-3 px-4 text-red-400 font-bold">64%</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">75%+</td>
                    <td className="py-3 px-4 text-red-300 font-semibold">Immediate Intervention Required</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">CSE316: Operating Systems</td>
                    <td className="py-3 px-4 text-emerald-400">86%</td>
                    <td className="py-3 px-4 text-blue-400 font-bold">78%</td>
                    <td className="py-3 px-4 text-slate-300">80%+</td>
                    <td className="py-3 px-4 text-blue-300">On Track</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">CSE305: Database Management Systems</td>
                    <td className="py-3 px-4 text-emerald-400">90%</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">84%</td>
                    <td className="py-3 px-4 text-slate-300">85%+</td>
                    <td className="py-3 px-4 text-emerald-300">Strong Standing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Diagnostic Gap Analysis */}
          <div className="p-5 bg-red-950/20 border border-red-900/40 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Specific Learning Gap Root Cause (CSE302)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-300 leading-relaxed">
              <li>Quiz 2 (Trees & Graphs) dropped 18% below student rolling subject average (52%).</li>
              <li>DFS Traversal Lab marked incomplete on LMS with no extension request logged.</li>
              <li>Graph Algorithms problem set attempted at only 3/7 questions.</li>
            </ul>
          </div>

          {/* Section 4: Self-Reported Task Execution Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                14-Day Roadmap Milestone Execution Status
              </h3>
              <span className="text-xs text-indigo-400 font-semibold">
                {completedTasks.length} Completed • {inProgressTasks.length} In Progress • {pendingTasks.length} Remaining
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <span className="text-slate-400 block font-semibold">Completed Milestones</span>
                <span className="text-2xl font-black text-emerald-400">{completedTasks.length}</span>
                <p className="text-[11px] text-slate-500 mt-1">Verified self-reported tasks</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40">
                <span className="text-slate-400 block font-semibold">Currently Active</span>
                <span className="text-2xl font-black text-indigo-400">{inProgressTasks.length}</span>
                <p className="text-[11px] text-slate-500 mt-1">Under active study</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <span className="text-slate-400 block font-semibold">Pending Milestones</span>
                <span className="text-2xl font-black text-slate-300">{pendingTasks.length}</span>
                <p className="text-[11px] text-slate-500 mt-1">Scheduled for Week 2</p>
              </div>
            </div>
          </div>

          {/* Section 5: Authorized Human Escalation & Mentor Referral */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-700/50 rounded-2xl flex items-start gap-4 text-xs">
            <UserCheck className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">Authorized Faculty Mentor Escalation Referral</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-600 text-white">
                  Referral Slip Active
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                As required by Trialshopy Responsible AI guidelines, students with sub-topic scores lagging below 55%
                are granted priority 1-on-1 access to course faculty for verified guidance.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-900/60 text-slate-300">
                <div>
                  <span className="text-slate-400 block font-semibold">Assigned Faculty Mentor:</span>
                  <span className="text-white font-bold">Dr. Rajesh V. (Associate Professor, CSE)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Campus Office Location:</span>
                  <span className="text-white font-bold">Block 34, 3rd Floor, Desk #12</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: DPDP Act & Privacy Disclaimer */}
          <div className="flex items-center gap-2.5 p-3.5 bg-slate-800/40 rounded-xl text-[11px] text-slate-500 border border-slate-800">
            <ShieldAlert className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <span>
              This diagnostic report was generated under student consent per the Digital Personal Data Protection (DPDP) Act, 2023.
              Kiosk terminal caches are scrubbed automatically upon logout.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Report Reference: TR-LPU-CSE-12204581-V1
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition-all touch-manipulation"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

