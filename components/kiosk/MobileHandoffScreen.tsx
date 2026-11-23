'use client';

// ============================================================
// components/kiosk/MobileHandoffScreen.tsx
// State 5 — QR_MOBILE_HANDOFF
//
// Generates an interactive scannable QR code using `qrcode.react`
// pointing to the live mobile companion page `/mobile-roadmap/[sessionId]`,
// allowing the student to transfer their 14-day roadmap and mentor
// insights to their smartphone.
// ============================================================

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Download,
} from 'lucide-react';
import { useKiosk } from '@/context/KioskContext';
import { exportRoadmapToPdf } from '@/lib/pdfExport';
import { buildPersonalizedRoadmap } from '@/lib/roadmapGenerator';

export default function MobileHandoffScreen() {
  const { activeStudent, currentRoadmap, startMentorChat, resetSession } = useKiosk();
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Inactivity countdown display
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const studentId = activeStudent?.rollId || '12204581';
  // Point directly to the live mobile companion route
  const relativeMobileUrl = `/mobile-roadmap/${studentId}`;

  // Get full origin if available on client
  const fullMobileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${relativeMobileUrl}`
      : `http://localhost:3000${relativeMobileUrl}`;

  const handleDownloadPdf = () => {
    if (activeStudent) {
      const roadmap = currentRoadmap || buildPersonalizedRoadmap(activeStudent);
      exportRoadmapToPdf(activeStudent, roadmap);
    }
  };

  return (
    <div className="kiosk-screen-enter w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 select-none">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-slate-900/90 border-b border-slate-700/60 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-900/40">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">Mobile Companion Handoff</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                State 5 of 5
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronize your 14-day recovery plan to mobile • Zero biometric data logged
            </p>
          </div>
        </div>

        {/* Inactivity alert pill */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-slate-300">
            Auto-resetting in <strong className="text-white font-mono">{secondsRemaining}s</strong> for privacy
          </span>
        </div>
      </header>

      {/* ── Main Handoff Area ─────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-10 shadow-2xl flex items-center gap-12">
          {/* QR Code Presentation Box */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="p-6 bg-white rounded-3xl shadow-2xl ring-4 ring-indigo-500/30">
              <QRCodeSVG
                value={fullMobileUrl}
                size={230}
                level="H"
                includeMargin={false}
              />
            </div>

            <Link
              href={relativeMobileUrl}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Open Companion Webpage Directly</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <span className="mt-1 text-[11px] font-mono text-slate-500 text-center">
              Scan with Campus LPU App or Phone Camera
            </span>
          </div>

          {/* Details & Security Guarantees */}
          <div className="flex-1 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Ready for Seamless Transfer</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                Continue your learning journey on your smartphone.
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Your 14-day CSE302 recovery plan, lab reminders, and LeetCode exercise checklists have been securely staged for handoff.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Synchronizes Phase 1 (Trees) & Phase 2 (Graphs) milestones directly to your phone.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Includes direct links to LPU LMS Week 7 DFS Lab submission.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Offline local checklist storage allows tracking completion anywhere on campus.</span>
              </div>
            </div>

            {/* Direct PDF export button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-all touch-manipulation min-h-[44px]"
              >
                <Download className="h-4 w-4 text-indigo-400" />
                <span>Download Official PDF Report</span>
              </button>
            </div>

            {/* DPDP Compliance Card */}
            <div className="flex items-start gap-3 p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-200">
              <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>DPDP Act 2023 Security:</strong> This QR transfer token is ephemeral. No personal or academic records remain cached on this terminal once you exit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Action Bar ─────────────────────────────────────── */}
      <footer className="flex-shrink-0 bg-slate-900/95 border-t border-slate-700/60 px-8 py-5 flex items-center justify-between">
        <button
          onClick={startMentorChat}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-bold transition-all touch-manipulation min-h-[52px]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Mentor Consultation</span>
        </button>

        <button
          onClick={resetSession}
          className="flex items-center gap-3 px-12 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-base font-extrabold shadow-xl shadow-emerald-950/60 border border-emerald-400/20 transition-all touch-manipulation min-h-[56px]"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Finished • Securely End Kiosk Session</span>
        </button>
      </footer>
    </div>
  );
}
