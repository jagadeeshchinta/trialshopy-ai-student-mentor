'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  GraduationCap,
  LogOut,
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Cpu,
  Layers,
  ArrowUpRight,
  UserCheck,
  BrainCircuit,
} from 'lucide-react';
import AiMentorConversation from '@/components/dashboard/AiMentorConversation';
import PersonalizedRoadmap from '@/components/dashboard/PersonalizedRoadmap';

interface StudentData {
  name: string;
  registrationNumber: string;
  university: string;
  degree: string;
  batch: string;
  currentSemester: number;
  currentCgpa: number;
  activeBacklogs: number;
  coreStrengths: string[];
  areasForImprovement: string[];
}

// Smooth animated counter component
function AnimatedCounter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = value * eased;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toFixed(decimals)}</>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Always scroll squarely to the top header on mount & when loading finishes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [isLoading]);

  // Silent data fetch from /api/student-data
  useEffect(() => {
    let isMounted = true;
    async function fetchStudentProfile() {
      try {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const res = await fetch(`/api/student-data${search}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (isMounted) {
          setData(json);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Silent fetch failed, using fallback:', err);
        if (isMounted) {
          const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const fallbackName = searchParams?.get('name') || 'Jagadeesh Chinta';
          const isGuest = searchParams?.get('guest') === 'true';

          setData({
            name: fallbackName,
            registrationNumber: isGuest ? 'GUEST-UNVERIFIED' : (searchParams?.get('id') || '12311668'),
            university: isGuest ? 'Campus Visitor / Prospective Student' : 'Lovely Professional University (LPU)',
            degree: isGuest ? 'Unregistered Student • Guest Mode' : 'B.Tech Computer Science and Engineering',
            batch: '2027',
            currentSemester: 7,
            currentCgpa: isGuest ? 7.8 : 7.5,
            activeBacklogs: 0,
            coreStrengths: [
              'Data Structures and Algorithms',
              'Next.js',
              'Cloud Computing',
            ],
            areasForImprovement: [
              'Operating Systems',
              'Advanced Computer Networks',
            ],
          });
          setIsLoading(false);
        }
      }
    }

    fetchStudentProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Subtle Glowing Radial Gradients Behind Cards */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-purple-600/12 rounded-full blur-[160px] pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none" />

      {/* Loading State Animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping duration-1000" />
                <div className="w-12 h-12 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold tracking-widest text-white uppercase font-mono">
                  Loading Academic Profile...
                </p>
                <p className="text-xs text-indigo-300/70 font-mono mt-1">
                  Connecting to University SIS / LMS API
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {!isLoading && data && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col gap-8 py-2"
        >
          
          {/* ────── HEADER BANNER ────── */}
          <motion.header
            variants={itemVariants}
            className="w-full rounded-3xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
          >
            {/* Ambient accent banner flare */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Student Info Left */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-[0_0_30px_rgba(99,102,241,0.4)] shrink-0 border border-white/20">
                JC
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                    {data.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Student
                  </span>
                </div>
                <p className="text-sm sm:text-base text-indigo-200/90 mt-1 font-medium">
                  {data.degree}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    Semester {data.currentSemester} (Batch {data.batch})
                  </span>
                  <span>•</span>
                  <span>Reg ID: {data.registrationNumber}</span>
                  <span>•</span>
                  <span className="text-slate-300">{data.university}</span>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => router.push('/')}
              className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 cursor-pointer self-end md:self-center shrink-0 shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.header>

          {/* ────── GRID TOP ROW: Key Metrics ────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Card 1: Cumulative CGPA */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-3xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">Cumulative GPA</h3>
                    <p className="text-xs text-slate-400 font-mono">Academic Standing: Excellent</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Scale: 10.0
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight">
                  <AnimatedCounter value={data.currentCgpa} decimals={1} />
                </span>
                <span className="text-xl sm:text-2xl text-slate-500 font-bold">/ 10.0</span>
              </div>

              {/* CGPA Progress Bar */}
              <div className="mt-4">
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${(data.currentCgpa / 10) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono mt-2">
                  <span>Pass (4.0)</span>
                  <span>Distinction (7.0+)</span>
                  <span>Target (10.0)</span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Active Backlogs */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-3xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">Active Backlogs</h3>
                    <p className="text-xs text-slate-400 font-mono">Exam Status: All Clear</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clean Record
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 tracking-tight">
                  <AnimatedCounter value={data.activeBacklogs} decimals={0} />
                </span>
                <span className="text-sm sm:text-base text-emerald-400 font-semibold font-mono">
                  Pending Courses
                </span>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="text-xs text-emerald-200/90 leading-relaxed font-medium">
                  Eligible for all on-campus tier-1 placement drives and final semester capstone project.
                </p>
              </div>
            </motion.div>

          </div>

          {/* ────── GRID BOTTOM ROW: Core Strengths & Focus Areas ────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Card 3: Core Strengths */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-3xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">Core Strengths</h3>
                      <p className="text-xs text-slate-400 font-mono">High Proficiency & Consistent Performance</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-indigo-300">
                    {data.coreStrengths.length} Mastered
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Based on continuous LMS assessments, lab evaluations, and mid-semester exams:
                </p>

                {/* Glowing Pill Badges */}
                <div className="flex flex-wrap gap-3">
                  {data.coreStrengths.map((strength, idx) => (
                    <motion.div
                      key={strength}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                      className="px-4 py-3 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 hover:border-indigo-400/60 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex items-center gap-2.5 transition-all group"
                    >
                      <Cpu className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
                      <span className="text-xs sm:text-sm font-bold text-indigo-100 tracking-wide">
                        {strength}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Evaluated via Automated Testing</span>
                <span className="text-indigo-400/80 flex items-center gap-1 font-semibold">
                  Top 10% in Class <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>

            {/* Card 4: Focus Areas */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-3xl p-6 sm:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-wide">Focus Areas</h3>
                      <p className="text-xs text-slate-400 font-mono">Recommended Academic Interventions</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-300">
                    {data.areasForImprovement.length} Flagged
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Targeted subjects requiring review before end-semester theory examinations:
                </p>

                {/* Focus Area Cards */}
                <div className="flex flex-col gap-3">
                  {data.areasForImprovement.map((area, idx) => (
                    <motion.div
                      key={area}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1, duration: 0.4 }}
                      className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-amber-100">
                          {area}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Needs Focus
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>AI Revision Plan Available</span>
                <span className="text-amber-400/80 font-semibold">
                  60-sec Revision Guides Ready
                </span>
              </div>
            </motion.div>

          </div>

          {/* ────── AI MENTOR INTERACTIVE CONVERSATION ────── */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-wide">Live AI Academic Advisor</h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Context-Aware • Instant Edge Guidance
              </span>
            </div>
            <AiMentorConversation studentData={data} />
          </motion.div>

          {/* ────── PERSONALIZED 4-WEEK ROADMAP & MOBILE HANDOFF ────── */}
          <motion.div variants={itemVariants} className="mt-8">
            <PersonalizedRoadmap weakSubjects={data.areasForImprovement} studentName={data.name} />
          </motion.div>

        </motion.div>
      )}

      {/* ────── FOOTER ────── */}
      <footer className="z-10 w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 border-t border-white/5 pt-6 mt-8 font-mono gap-2">
        <p>© 2026 TRIALSHOPY AI INITIATIVE • CAMPUS KIOSK v2.4</p>
        <p>ZERO BIOMETRIC RETENTION • DPDP ACT COMPLIANT</p>
      </footer>

    </div>
  );
}
