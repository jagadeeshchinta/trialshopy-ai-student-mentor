'use client';

// ============================================================
// app/mobile-roadmap/[sessionId]/page.tsx
// Live Mobile Companion Webpage
//
// Rendered when the student scans the State 5 kiosk QR code.
// Mobile-optimized touch layout:
//   • Student Identity & Target Goal Header
//   • Interactive Task Progress Checklist (stored in localStorage)
//   • Direct links to LeetCode and LPU LMS
//   • "Save Offline / Print Summary" & PDF Download
//   • Ephemeral DPDP session guarantee footer
// ============================================================

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Download,
  Share2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Award,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { MOCK_STUDENT } from '@/lib/data/mockStudent';
import { buildPersonalizedRoadmap } from '@/lib/roadmapGenerator';
import { exportRoadmapToPdf } from '@/lib/pdfExport';
import type { TaskStatus } from '@/types/kiosk';

function MobileRoadmapContent() {
  const params = useParams();
  const sessionId = (params?.sessionId as string) || '12204581';

  // Load student & roadmap
  const student = MOCK_STUDENT;
  const roadmap = buildPersonalizedRoadmap(student, { dailyMinutes: 60 });

  // Mobile task state with localStorage persistence
  const [tasksState, setTasksState] = useState<Record<string, TaskStatus>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`trialshopy_tasks_${sessionId}`);
      if (saved) {
        setTasksState(JSON.parse(saved));
      } else {
        const initial: Record<string, TaskStatus> = {};
        roadmap.phases.forEach((p) => {
          p.tasks.forEach((t) => {
            initial[t.id] = t.status;
          });
        });
        setTasksState(initial);
      }
    } catch {
      // fallback
    }
  }, [sessionId]);

  const toggleTask = (taskId: string) => {
    setTasksState((prev) => {
      const current = prev[taskId] || 'Not Started';
      const next: TaskStatus = current === 'Completed' ? 'Not Started' : 'Completed';
      const updated = { ...prev, [taskId]: next };
      try {
        localStorage.setItem(`trialshopy_tasks_${sessionId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const allTaskIds = roadmap.phases.flatMap((p) => p.tasks.map((t) => t.id));
  const completedCount = allTaskIds.filter((id) => tasksState[id] === 'Completed').length;
  const progressPct = Math.round((completedCount / (allTaskIds.length || 1)) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownloadPdf = () => {
    exportRoadmapToPdf(student, roadmap);
    showToast('Official PDF Report Downloaded!');
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-tight">Trialshopy Mobile Companion</h1>
            <p className="text-[10px] text-slate-400">Campus Kiosk Ephemeral Node</p>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md touch-manipulation min-h-[36px]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Save PDF</span>
        </button>
      </header>

      {/* ── Student Profile & Goal Card ─────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-900/40 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LPU CSE • Sem 6
              </span>
              <h2 className="text-xl font-black text-white mt-1">{student.fullName}</h2>
              <p className="text-xs text-slate-400 font-mono">Reg ID: {student.rollId}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-semibold">Baseline CGPA</span>
              <span className="text-xl font-black text-indigo-400">{student.cgpa}</span>
            </div>
          </div>

          {/* Target Milestone Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-xl bg-red-950 text-red-400 flex items-center justify-center font-bold flex-shrink-0">
                DSA
              </div>
              <div className="truncate">
                <span className="font-bold text-white block truncate">CSE302 Recovery Goal</span>
                <span className="text-red-400 font-semibold text-[11px]">64% ➔ 75%+ in 14 Days</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-slate-400 block">Progress</span>
              <span className="text-sm font-black text-emerald-400">{progressPct}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{completedCount} of {allTaskIds.length} tasks completed</span>
              <span>14-Day Timeline</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ──────────────────────────────────────── */}
      <div className="px-5 py-2 flex items-center gap-2">
        <button
          onClick={handlePrintSummary}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2"
        >
          <span>Print Summary</span>
        </button>
        <button
          onClick={handleDownloadPdf}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-xs font-bold flex items-center justify-center gap-2"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Official Report</span>
        </button>
      </div>

      {/* ── Diagnostic Findings Reminder ────────────────────────── */}
      <div className="px-5 py-3">
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="h-4 w-4" />
            <span>Kiosk Diagnostic Root Cause (CSE302)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Quiz 2 score (52%) and incomplete DFS lab are your target gap areas. Complete Phase 1 tasks first to clear your lab deficit.
          </p>
        </div>
      </div>

      {/* ── Roadmap Phases & Daily Tasks ────────────────────────── */}
      <div className="px-5 py-2 space-y-5 flex-1">
        {roadmap.phases.map((phase) => {
          const isExpanded = expandedPhases[phase.phaseNumber] ?? true;

          return (
            <div
              key={phase.phaseNumber}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Phase Collapsible Header */}
              <button
                onClick={() =>
                  setExpandedPhases((prev) => ({
                    ...prev,
                    [phase.phaseNumber]: !isExpanded,
                  }))
                }
                className="w-full px-5 py-4 bg-slate-850 flex items-center justify-between text-left border-b border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-black text-xs">
                    P{phase.phaseNumber}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">{phase.phaseName}</h3>
                    <p className="text-[11px] text-slate-400">{phase.suggestedTimeframe}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* Tasks List */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {phase.tasks.map((task) => {
                    const isDone = tasksState[task.id] === 'Completed';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-800/40 opacity-80'
                            : 'bg-slate-800/40 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-950" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-500" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  task.priority === 'High'
                                    ? 'bg-red-950 text-red-300 border border-red-800/40'
                                    : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                                }`}
                              >
                                {task.priority}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ⏱ {task.estimatedDuration}
                              </span>
                            </div>

                            <p
                              className={`text-xs font-bold leading-snug ${
                                isDone ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {task.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {task.description}
                            </p>

                            {/* External Practice Link */}
                            {task.resourceUrl && (
                              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Practice Resource</span>
                                <a
                                  href={task.resourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                                >
                                  <span>Open Module</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Faculty Contact Card ────────────────────────────────── */}
      <div className="px-5 py-3">
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-1.5">
          <span className="font-bold text-white block">Assigned Faculty Mentor</span>
          <p className="text-slate-300 text-[11px]">
            Dr. Rajesh V. • Block 34, 3rd Floor, Desk #12
          </p>
          <p className="text-[10px] text-slate-500">
            Show this mobile roadmap checklist during your doubt-clearing session.
          </p>
        </div>
      </div>

      {/* ── Disclaimer Footer ───────────────────────────────────── */}
      <footer className="mt-auto px-6 py-6 border-t border-slate-800/80 text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>DPDP Act 2023 Compliant</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs mx-auto">
          Secure 15-minute ephemeral token session. Synced with Trialshopy Smart Campus Node #01.
          Data is expunged from the kiosk terminal automatically.
        </p>
      </footer>

      {/* ── Floating Toast ──────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function MobileRoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm font-semibold">
          Loading Companion Roadmap...
        </div>
      }
    >
      <MobileRoadmapContent />
    </Suspense>
  );
}
