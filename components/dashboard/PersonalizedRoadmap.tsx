'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Code2,
  Cloud,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Terminal,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Target,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export interface RoadmapItem {
  week: number;
  topic: string;
  actionItem: string;
  resourceType: string;
}

interface GoalOption {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: React.ElementType;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'Software Development Engineer',
    title: 'Software Development Engineer',
    tag: 'Tier-1 Tech Placements',
    description: 'Master core OS concurrency, system architecture, and placement interview drills.',
    icon: Code2,
  },
  {
    id: 'DevOps & Cloud Infrastructure',
    title: 'DevOps & Cloud Infrastructure',
    tag: 'Cloud & Linux Internals',
    description: 'Linux systems, network protocol debugging, containerization, and automated pipelines.',
    icon: Cloud,
  },
  {
    id: 'Higher Studies & Research (GATE/MS)',
    title: 'Higher Studies & Research',
    tag: 'Academic Mastery',
    description: 'Rigorous theoretical foundations, OS kernel principles, and advanced networking theory.',
    icon: GraduationCap,
  },
];

export interface PersonalizedRoadmapProps {
  weakSubjects?: string[];
}

export default function PersonalizedRoadmap({
  weakSubjects = ['Operating Systems', 'Advanced Computer Networks'],
}: PersonalizedRoadmapProps = {}) {
  const [selectedGoal, setSelectedGoal] = useState<string>(GOAL_OPTIONS[0].id);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // In-memory cache by career goal to prevent duplicate API calls and save quota
  const roadmapCacheRef = useRef<Record<string, RoadmapItem[]>>({});

  const shareableUrl = `https://trialshopy-mentor.vercel.app/share/roadmap-${encodeURIComponent(
    selectedGoal.toLowerCase().replace(/[^a-z0-9]/g, '-')
  )}`;

  // Fetch roadmap when selectedGoal changes, checking memory and sessionStorage cache first
  useEffect(() => {
    let isMounted = true;

    // 1. Check in-memory cache
    if (roadmapCacheRef.current[selectedGoal] && roadmapCacheRef.current[selectedGoal].length > 0) {
      setRoadmap(roadmapCacheRef.current[selectedGoal]);
      setLoading(false);
      return;
    }

    // 2. Check sessionStorage cache
    try {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(`trialshopy_roadmap_${selectedGoal}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            roadmapCacheRef.current[selectedGoal] = parsed;
            setRoadmap(parsed);
            setLoading(false);
            return;
          }
        }
      }
    } catch (_) {}

    async function fetchRoadmap() {
      setLoading(true);
      try {
        const res = await fetch('/api/generate-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: selectedGoal,
            weakSubjects,
          }),
        });

        if (!res.ok) throw new Error('Failed to fetch roadmap');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.roadmap || [];

        if (isMounted) {
          roadmapCacheRef.current[selectedGoal] = items;
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(`trialshopy_roadmap_${selectedGoal}`, JSON.stringify(items));
            }
          } catch (_) {}
          setRoadmap(items);
          setLoading(false);
        }
      } catch (err) {
        console.error('Roadmap fetch error:', err);
        // Fallback resilience
        if (isMounted) {
          const fallbackItems = [
            {
              week: 1,
              topic: `Core Fundamentals of ${weakSubjects[0] || 'Operating Systems'}`,
              actionItem: 'Study Process Control Blocks, CPU Scheduling algorithms, and draw thread lifecycle states.',
              resourceType: 'YouTube Video',
            },
            {
              week: 2,
              topic: 'Memory Management, Paging & Concurrency',
              actionItem: 'Implement a virtual memory page replacement simulator and solve 3 deadlock prevention problems.',
              resourceType: 'Interactive Lab',
            },
            {
              week: 3,
              topic: `${weakSubjects[1] || 'Network Protocols'} & System Architecture`,
              actionItem: 'Analyze TCP/UDP socket connections, OSI layers, and debug live packet flows via Wireshark.',
              resourceType: 'Article',
            },
            {
              week: 4,
              topic: `${selectedGoal} Placement Capstone & Mock Drills`,
              actionItem: 'Build an end-to-end multi-threaded server application and solve 15 targeted interview questions.',
              resourceType: 'Documentation',
            },
          ];
          roadmapCacheRef.current[selectedGoal] = fallbackItems;
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem(`trialshopy_roadmap_${selectedGoal}`, JSON.stringify(fallbackItems));
            }
          } catch (_) {}
          setRoadmap(fallbackItems);
          setLoading(false);
        }
      }
    }

    fetchRoadmap();
    return () => {
      isMounted = false;
    };
  }, [selectedGoal, weakSubjects]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getResourceIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('video') || lower.includes('youtube')) return Video;
    if (lower.includes('lab') || lower.includes('interactive')) return Terminal;
    if (lower.includes('article')) return FileText;
    return BookOpen;
  };

  return (
    <div className="w-full rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 sm:p-8 relative overflow-hidden transition-all">
      
      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Personalized 4-Week Career Roadmap
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your target career goal to generate an AI-tailored recovery plan for{' '}
            <span className="text-amber-300 font-semibold">{weakSubjects.join(' & ')}</span>.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 self-start sm:self-auto flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          AI Dynamic Synthesis
        </span>
      </div>

      {/* ── GOAL SELECTION CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          const Icon = goal.icon;

          return (
            <motion.button
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`text-left p-5 rounded-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/80 border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
                  : 'bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
              }`}
            >
              {/* Subtle top indicator bar */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400" />
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/10 text-slate-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {goal.tag}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5 tracking-wide group-hover:text-indigo-200 transition-colors">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {goal.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className={isSelected ? 'text-indigo-300 font-semibold' : 'text-slate-500'}>
                  {isSelected ? '● Active Target' : 'Click to Target'}
                </span>
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600 group-hover:translate-x-1'
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── TIMELINE CONTAINER ── */}
      <div className="relative mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Action Plan: {selectedGoal}
            </h3>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating tailored schedule...</span>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/5 border border-white/5 animate-pulse flex items-center px-6 gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-white/10 rounded" />
                  <div className="h-3 w-3/4 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Vertical Timeline with Staggered Nodes */
          <div className="relative pl-6 sm:pl-8 space-y-6">
            {/* Vertical Guide Line */}
            <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500/50 to-indigo-500/10" />

            <AnimatePresence mode="wait">
              {roadmap.map((item, index) => {
                const ResourceIcon = getResourceIcon(item.resourceType);

                return (
                  <motion.div
                    key={`${selectedGoal}-week-${item.week}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      delay: index * 0.12,
                      duration: 0.35,
                      ease: 'easeOut',
                    }}
                    className="relative flex items-start gap-4 group"
                  >
                    {/* Glowing Timeline Marker */}
                    <div className="absolute -left-6 sm:-left-8 top-3 w-7 h-7 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10">
                      <span className="text-[10px] font-mono font-black text-indigo-300">
                        0{item.week}
                      </span>
                    </div>

                    {/* Timeline Item Card */}
                    <div className="flex-1 rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 border border-white/10 hover:border-indigo-400/40 p-5 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Week {item.week}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                            {item.topic}
                          </h4>
                        </div>

                        {/* Resource Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                          <ResourceIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{item.resourceType}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed pl-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <p>{item.actionItem}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── MOBILE HANDOFF (QR CODE) SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="rounded-2xl p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/30 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Take It With You • Mobile Companion Sync
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Scan this QR code with your smartphone camera to sync this 4-week roadmap directly to your personal device. Includes calendar milestones and curated resource links.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <button
              onClick={handleCopy}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-all font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Share Link</span>
                </>
              )}
            </button>

            <span className="text-[11px] font-mono text-indigo-300/80">
              ⚡ Instant Sync • No Sign-In Required
            </span>
          </div>
        </div>

        {/* QR Code Graphic with Glowing Border */}
        <div className="p-3 rounded-2xl bg-slate-950 border-2 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 flex items-center justify-center">
          <QRCodeSVG
            value={shareableUrl}
            size={110}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
            className="rounded-lg"
          />
        </div>
      </motion.div>

    </div>
  );
}
