'use client';

// ============================================================
// components/kiosk/AcademicDiagnosisDashboard.tsx
// State 2 — ACADEMIC_DIAGNOSTIC
//
// Full 1920×1080 academic health dashboard:
//   Top bar   : Student identity + CGPA / attendance chips
//   Left col  : Academic health metric cards (attendance,
//               internal average, flagged count, CGPA bar)
//   Centre col: Course performance cards for all 3 courses
//   Right col : CSE302 deep-dive — animated sub-topic bars
//               + explainable diagnostic findings
//   Footer    : "Proceed to AI Mentor" / "End Session"
// ============================================================

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Users,
  ArrowRight,
  BarChart2,
  LogOut,
  Gauge,
  FileWarning,
} from 'lucide-react';
import { useKiosk } from '@/context/KioskContext';
import { MOCK_STUDENT } from '@/lib/data/mockStudent';
import type { CoursePerformance, TopicAssessment } from '@/types/kiosk';

// ─── Score → colour helpers ───────────────────────────────

function scoreHex(pct: number): string {
  if (pct >= 70) return '#22c55e';  // green-500
  if (pct >= 55) return '#f59e0b';  // amber-500
  return '#ef4444';                  // red-500
}

function attendanceHex(pct: number): string {
  if (pct >= 80) return '#22c55e';
  if (pct >= 70) return '#f59e0b';
  return '#ef4444';
}

function statusBadgeClasses(status: CoursePerformance['status']): string {
  switch (status) {
    case 'Strong':
      return 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50';
    case 'On Track':
      return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
    case 'Requires Immediate Focus':
      return 'bg-red-900/60 text-red-300 border-red-700/50';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

function statusBadgeText(status: CoursePerformance['status']): string {
  switch (status) {
    case 'Strong':                   return '✓ Strong';
    case 'On Track':                 return '● On Track';
    case 'Requires Immediate Focus': return '⚠ Needs Focus';
    default:                         return status;
  }
}

// ─── Sub-topic animated progress bar ─────────────────────

function TopicBar({
  topic,
  animate,
  delayMs,
}: {
  topic: TopicAssessment;
  animate: boolean;
  delayMs: number;
}) {
  const hex = scoreHex(topic.scorePercent);

  const proficiencyColor =
    topic.proficiency === 'Proficient' ? 'text-green-400' :
    topic.proficiency === 'Competent'  ? 'text-blue-400'  :
    topic.proficiency === 'Lagging'    ? 'text-amber-400' :
                                         'text-red-400';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-slate-200 text-sm font-medium leading-snug flex-1 min-w-0 truncate">
          {topic.topicName}
        </span>
        <span className="text-sm font-black tabular-nums flex-shrink-0" style={{ color: hex }}>
          {topic.scorePercent}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-3 w-full rounded-full bg-slate-700/60 overflow-hidden">
        {/* Shimmer overlay while not yet animated */}
        {!animate && (
          <div className="absolute inset-0 shimmer rounded-full" />
        )}
        {/* Fill */}
        <div
          className="h-full rounded-full bar-fill"
          style={{
            width: animate ? `${topic.scorePercent}%` : '0%',
            backgroundColor: hex,
            transitionDelay: `${delayMs}ms`,
          }}
        />
      </div>

      <span className={`text-xs font-semibold ${proficiencyColor}`}>
        {topic.proficiency}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────

export default function AcademicDiagnosisDashboard() {
  const { activeStudent, startMentorChat, resetSession } = useKiosk();
  const student = activeStudent || MOCK_STUDENT;
  const [barsAnimated, setBarsAnimated] = useState(false);

  // Trigger bar fill animation after the screen fades in
  useEffect(() => {
    const t = setTimeout(() => setBarsAnimated(true), 500);
    return () => clearTimeout(t);
  }, []);

  // ── Derived stats ───────────────────────────────────────
  const courses  = student.enrolledCourses;
  const avgAtt   = Math.round(courses.reduce((s, c) => s + c.attendancePercent,     0) / courses.length);
  const avgScore = Math.round(courses.reduce((s, c) => s + c.overallScorePercent, 0) / courses.length);
  const flagged  = courses.filter(c => c.overallScorePercent < 70 || c.attendancePercent < 80);
  const dsaCourse = courses.find(c => c.courseCode === 'CSE302');

  // ── Metric card data ────────────────────────────────────
  const metricCards = [
    {
      Icon: Users,
      label: 'Avg Attendance',
      value: `${avgAtt}%`,
      sub:   avgAtt >= 80 ? 'Above eligibility threshold' : '⚠ Below 80% threshold',
      valueColor: avgAtt >= 80 ? 'text-green-400'  : 'text-amber-400',
      borderColor: avgAtt >= 80 ? 'border-green-800/45' : 'border-amber-800/45',
    },
    {
      Icon: Gauge,
      label: 'Internal Average',
      value: `${avgScore}%`,
      sub:   avgScore >= 70 ? 'Satisfactory performance' : 'Below satisfactory',
      valueColor: avgScore >= 70 ? 'text-blue-400' : 'text-amber-400',
      borderColor: avgScore >= 70 ? 'border-blue-800/45' : 'border-amber-800/45',
    },
    {
      Icon: FileWarning,
      label: 'Flagged Subjects',
      value: `${flagged.length}`,
      sub:   flagged.length > 0 ? `${flagged.length} High Priority` : 'All courses on track',
      valueColor: flagged.length > 0 ? 'text-red-400' : 'text-green-400',
      borderColor: flagged.length > 0 ? 'border-red-800/45' : 'border-green-800/45',
    },
  ] as const;

  return (
    <div className="kiosk-screen-enter w-full min-h-screen bg-slate-950 flex flex-col overflow-y-auto">

      {/* ══════════════ TOP HEADER BAR ══════════════════════════ */}
      <div className="flex-shrink-0 bg-slate-900/90 border-b border-slate-700/60 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sm:gap-6">

        {/* Student identity */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Avatar initials */}
          <div
            className="
              h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex-shrink-0
              bg-gradient-to-br from-indigo-600 to-violet-700
              flex items-center justify-center
              text-white text-xl sm:text-2xl font-black
              shadow-lg shadow-indigo-900/60
            "
            aria-label={`${student.fullName} avatar`}
          >
            {student.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-lg sm:text-xl font-black leading-tight truncate">
              {student.fullName}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 truncate">
              {student.degree}&nbsp;·&nbsp;Semester&nbsp;{student.currentSemester}&nbsp;·&nbsp;ID:&nbsp;{student.rollId}
            </p>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {[
            {
              label:      'CGPA',
              value:      student.cgpa.toFixed(1),
              valueClass: 'text-indigo-300',
            },
            {
              label:      'Avg Attendance',
              value:      `${avgAtt}%`,
              valueClass: avgAtt >= 80 ? 'text-green-400' : 'text-amber-400',
            },
            {
              label:      'University',
              value:      'LPU',
              valueClass: 'text-slate-200',
            },
          ].map(({ label, value, valueClass }) => (
            <div
              key={label}
              className="text-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/40"
            >
              <p className={`text-xl sm:text-2xl font-black leading-none ${valueClass}`}>{value}</p>
              <p className="text-slate-500 text-[10px] sm:text-xs mt-1 font-medium">{label}</p>
            </div>
          ))}

          {/* Session step badge */}
          <div className="px-3 sm:px-4 py-2 rounded-xl bg-indigo-900/40 border border-indigo-700/40 text-center">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Step 2 / 5</p>
            <p className="text-indigo-200 text-xs mt-0.5">Diagnostic</p>
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN 3-COLUMN GRID ══════════════════════ */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr_400px] xl:grid-cols-[300px_1fr_430px] gap-5 p-5">

        {/* ───────────── LEFT: Academic Health ─────────────────── */}
        <div className="flex flex-col gap-4">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1">
            Academic Health
          </p>

          {/* Metric cards */}
          {metricCards.map(({ Icon, label, value, sub, valueColor, borderColor }) => (
            <div
              key={label}
              className={`bg-slate-900 border ${borderColor} rounded-2xl p-5 flex flex-col gap-3`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 flex-shrink-0 ${valueColor}`} />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className={`text-4xl font-black leading-none ${valueColor}`}>{value}</p>
              <p className="text-slate-500 text-xs">{sub}</p>
            </div>
          ))}

          {/* CGPA gradient bar */}
          <div className="bg-slate-900 border border-indigo-800/40 rounded-2xl p-5 mt-auto">
            <div className="flex items-center gap-2.5 mb-3">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                Cumulative GPA
              </span>
            </div>
            <p className="text-4xl font-black text-indigo-400 leading-none">
              {student.cgpa.toFixed(1)}
              <span className="text-slate-600 text-lg font-semibold"> / 10.0</span>
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-700/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-700"
                style={{
                  width: barsAnimated ? `${(student.cgpa / 10) * 100}%` : '0%',
                }}
              />
            </div>
            <p className="text-slate-600 text-xs mt-1.5">{student.university}</p>
          </div>
        </div>

        {/* ───────────── CENTRE: Course Cards ──────────────────── */}
        <div className="flex flex-col gap-4 min-w-0">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1">
            Sem&nbsp;{student.currentSemester}&nbsp;Enrolled Courses
          </p>

          {courses.map((course) => {
            const isFlagged = course.status === 'Requires Immediate Focus';
            return (
              <div
                key={course.courseCode}
                className={`
                  bg-slate-900 border rounded-2xl p-5
                  transition-all duration-300
                  ${isFlagged
                    ? 'border-red-700/55 shadow-[0_0_28px_rgba(239,68,68,0.07)]'
                    : course.status === 'Strong'
                    ? 'border-emerald-800/50'
                    : 'border-slate-700/50'
                  }
                `}
              >
                {/* Course header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/50 flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-500 text-xs font-mono tracking-wider">{course.courseCode}</p>
                      <p className="text-white font-bold text-sm leading-snug mt-0.5 truncate">
                        {course.courseName.split('(')[0].trim()}
                      </p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span
                    className={`
                      flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-bold
                      ${statusBadgeClasses(course.status)}
                    `}
                  >
                    {statusBadgeText(course.status)}
                  </span>
                </div>

                {/* Score + attendance bars */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Overall Score', pct: course.overallScorePercent, colorFn: scoreHex },
                    { label: 'Attendance',    pct: course.attendancePercent,    colorFn: attendanceHex },
                  ].map(({ label, pct, colorFn }) => (
                    <div key={label}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-slate-500 text-xs">{label}</span>
                        <span
                          className="font-black text-sm tabular-nums"
                          style={{ color: colorFn(pct) }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-700/60">
                        <div
                          className="h-full rounded-full bar-fill"
                          style={{
                            width: barsAnimated ? `${pct}%` : '0%',
                            backgroundColor: colorFn(pct),
                            transitionDelay: '200ms',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Alert row for flagged courses */}
                {isFlagged && (
                  <div className="mt-4 flex items-center gap-2.5 px-3 py-2.5 bg-red-950/40 border border-red-800/40 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-xs font-medium leading-snug">
                      Detailed breakdown available in the Diagnostic Panel →
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ───────────── RIGHT: CSE302 Deep Dive ───────────────── */}
        <div className="flex flex-col gap-4 kiosk-scroll">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest px-1 flex-shrink-0">
            Diagnostic Deep Dive · CSE302
          </p>

          {dsaCourse ? (
            <>
              {/* Sub-topic breakdown */}
              <div className="bg-slate-900 border border-amber-800/40 rounded-2xl p-5 flex flex-col gap-5 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <p className="text-slate-100 text-sm font-bold">Sub-topic Assessment Breakdown</p>
                </div>

                {dsaCourse.topicAssessments.map((topic, idx) => (
                  <TopicBar
                    key={topic.topicName}
                    topic={topic}
                    animate={barsAnimated}
                    delayMs={300 + idx * 160}
                  />
                ))}
              </div>

              {/* Diagnostic findings callout */}
              <div className="bg-slate-900 border border-red-800/40 rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-slate-100 text-sm font-bold">Diagnostic Findings</p>
                  <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-900/60 border border-red-800/40 text-red-300 text-[10px] font-black uppercase tracking-wide">
                    High Priority
                  </span>
                </div>

                <div className="space-y-3">
                  {dsaCourse.diagnosticEvidence.map((evidence, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 bg-red-950/30 border border-red-900/30 rounded-xl"
                    >
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-900/70 flex items-center justify-center text-xs text-red-300 font-black mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 text-xs leading-relaxed">{evidence}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI recommendation chip */}
              <div className="flex items-start gap-3 p-4 bg-indigo-950/50 border border-indigo-800/40 rounded-2xl flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-indigo-200 text-xs leading-relaxed">
                  <strong className="text-indigo-100 font-semibold">AI Recommendation:&nbsp;</strong>
                  Prioritise completing the DFS traversal lab and BST deletion exercises
                  before Week 10 assessments to recover the grade deficit.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-slate-600 text-sm">No flagged course data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ CTA FOOTER ══════════════════════════════ */}
      <div className="flex-shrink-0 bg-slate-900/90 border-t border-slate-700/60 px-8 py-5 flex items-center justify-between gap-6">

        {/* End session */}
        <button
          onClick={resetSession}
          className="
            flex items-center gap-2 px-6 py-3.5 rounded-xl min-h-[52px]
            text-slate-400 hover:text-red-300
            border border-slate-700 hover:border-red-800/60
            text-sm font-semibold
            transition-all duration-200 touch-manipulation
          "
        >
          <LogOut className="h-4 w-4" />
          End Session
        </button>

        {/* Centre info */}
        <p className="text-slate-600 text-xs text-center leading-relaxed">
          Reviewing diagnostics for{' '}
          <span className="text-slate-300 font-semibold">{student.fullName}</span>
          <br />
          <span className="text-slate-700">
            {flagged.length > 0
              ? `${flagged.length} course${flagged.length > 1 ? 's' : ''} flagged for immediate attention`
              : 'All courses are healthy'}
          </span>
        </p>

        {/* Primary CTA */}
        <button
          onClick={startMentorChat}
          className="
            flex items-center gap-3 px-10 py-4 rounded-2xl min-h-[60px]
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            active:from-indigo-700 active:to-violet-700
            active:scale-[0.98]
            text-white text-lg font-extrabold tracking-tight
            shadow-2xl shadow-indigo-950/70
            border border-indigo-500/20
            transition-all duration-200
            touch-manipulation
          "
        >
          Proceed to Guided AI Mentor Consultation
          <ArrowRight className="h-5 w-5 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}

