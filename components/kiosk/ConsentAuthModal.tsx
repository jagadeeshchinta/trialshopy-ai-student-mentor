'use client';

// ============================================================
// components/kiosk/ConsentAuthModal.tsx
// State 1 — CONSENT_AUTH
//
// DPDP-compliant privacy gate + dual-mode authentication:
//   Tab A: Tap Campus RFID / Smart Card (NFC simulation)
//   Tab B: Enter Student Roll / Registration ID
//
// On success → giveConsentAndAuthenticate(student)
// On cancel  → resetSession()
// ============================================================

import { useState } from 'react';
import {
  Shield,
  CreditCard,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useKiosk } from '@/context/KioskContext';
import { fetchStudentByRollId } from '@/lib/data/mockStudent';

type AuthTab = 'rfid' | 'rollid';

// ─── DPDP notice data ─────────────────────────────────────

const DPDP_CARDS = [
  {
    emoji: '📋',
    title: 'Data Minimisation',
    body: 'Retrieves only semester coursework, attendance records, and internal assessment marks from the LPU SIS/LMS. No other personal data is accessed.',
  },
  {
    emoji: '🔒',
    title: 'Zero Permanent Biometric Retention',
    body: 'No biometric data is collected or stored. Session data is fully expunged immediately upon logout or inactivity timeout (60 seconds).',
  },
] as const;

// ─── Auth tab config ──────────────────────────────────────

const AUTH_TABS: { id: AuthTab; label: string }[] = [
  { id: 'rfid',   label: 'Tap Campus RFID / Smart Card' },
  { id: 'rollid', label: 'Enter Student Roll / Registration ID' },
];

// ─── Component ────────────────────────────────────────────

export default function ConsentAuthModal() {
  const { giveConsentAndAuthenticate, resetSession } = useKiosk();

  const [consented,    setConsented]    = useState(false);
  const [activeTab,    setActiveTab]    = useState<AuthTab>('rollid');
  const [rollId,       setRollId]       = useState('12204581');
  const [loading,      setLoading]      = useState(false);
  const [rfidReading,  setRfidReading]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const clearError = () => setError(null);

  // ── Shared auth handler ─────────────────────────────────

  async function authenticate(id: string) {
    if (!consented) {
      setError('Please tick the consent checkbox above before authenticating.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      const student = await fetchStudentByRollId(id.trim());
      if (!student) {
        setError(
          `No record found for ID "${id.trim()}". ` +
          'Please verify your Roll Number and try again.'
        );
        return;
      }
      giveConsentAndAuthenticate(student);
    } catch {
      setError('Authentication service is currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── RFID simulation ────────────────────────────────────

  async function handleRfidTap() {
    if (!consented) {
      setError('Please tick the consent checkbox above before tapping your card.');
      return;
    }
    setRfidReading(true);
    clearError();
    // Simulate NFC/RFID read latency
    await new Promise<void>((resolve) => setTimeout(resolve, 1600));
    setRfidReading(false);
    // In production, decode student ID from the RFID chip; here we use the mock
    await authenticate('12204581');
  }

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="kiosk-screen-enter relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden px-6">

      {/* Ambient bg blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 48% 70% at 20% 50%, rgba(99,102,241,0.07) 0%, transparent 60%),' +
            'radial-gradient(ellipse 48% 70% at 80% 50%, rgba(139,92,246,0.07) 0%, transparent 60%)',
        }}
      />

      {/* ── Card shell ──────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[880px]">
        <div className="bg-slate-900 border border-slate-700/55 rounded-3xl shadow-2xl overflow-hidden">

          {/* ── Header ───────────────────────────────────── */}
          <div className="bg-gradient-to-r from-indigo-950/90 to-violet-950/90 border-b border-slate-700/55 px-10 py-7">
            <div className="flex items-center gap-2.5 mb-3">
              <Shield className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <span className="text-indigo-300 text-xs font-bold uppercase tracking-widest">
                DPDP Act 2023 Compliant · Session Privacy & Consent
              </span>
            </div>
            <h2 className="text-[2rem] font-black text-white leading-tight">
              Secure Session Access
            </h2>
            <p className="mt-1.5 text-slate-400 text-sm leading-relaxed">
              Review the data usage terms, provide consent, and authenticate to begin your mentoring session.
            </p>
          </div>

          {/* ── Body ─────────────────────────────────────── */}
          <div className="px-10 py-8 space-y-7">

            {/* DPDP notice cards */}
            <div className="grid grid-cols-2 gap-4">
              {DPDP_CARDS.map(({ emoji, title, body }) => (
                <div
                  key={title}
                  className="flex gap-3.5 p-5 bg-slate-800/50 border border-slate-700/40 rounded-2xl"
                >
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{emoji}</span>
                  <div>
                    <p className="text-slate-100 font-semibold text-sm">{title}</p>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Required consent checkbox */}
            <label className="flex items-start gap-4 p-5 bg-slate-800/40 border border-slate-600/50 rounded-2xl cursor-pointer group hover:border-indigo-500/60 transition-colors duration-200 min-h-[80px]">
              {/* Hidden native checkbox */}
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => { setConsented(e.target.checked); clearError(); }}
                className="sr-only"
                aria-label="Grant consent to access academic records for this session"
              />
              {/* Custom check box */}
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className={`
                    h-7 w-7 rounded-lg border-2 flex items-center justify-center
                    transition-all duration-200
                    ${consented
                      ? 'bg-indigo-600 border-indigo-500'
                      : 'border-slate-500 bg-slate-700/50 group-hover:border-indigo-400'
                    }
                  `}
                >
                  {consented && <CheckCircle2 className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />}
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed pt-0.5">
                <span className="text-white font-semibold">Required: </span>
                I grant permission to access my semester academic diagnostic records — including course
                scores, attendance data, and internal assessment marks — for this single mentoring
                session only. I understand this data will not be retained after the session ends.
              </p>
            </label>

            {/* Authentication section */}
            <div>
              {/* Tab buttons */}
              <div className="flex gap-2 mb-5" role="tablist" aria-label="Authentication method">
                {AUTH_TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={activeTab === id}
                    onClick={() => { setActiveTab(id); clearError(); }}
                    className={`
                      flex items-center gap-2.5 px-5 py-3.5 rounded-xl
                      text-sm font-semibold transition-all duration-200
                      touch-manipulation min-h-[52px]
                      ${id === 'rfid'
                        ? 'pr-6' : ''
                      }
                      ${activeTab === id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                      }
                    `}
                  >
                    {id === 'rfid'
                      ? <CreditCard className="h-4 w-4 flex-shrink-0" />
                      : <Hash className="h-4 w-4 flex-shrink-0" />
                    }
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Tab A: RFID Card Reader ─────────────────── */}
              {activeTab === 'rfid' && (
                <div className="flex flex-col items-center gap-5 py-4">
                  <button
                    onClick={handleRfidTap}
                    disabled={rfidReading || loading}
                    aria-label="Simulate RFID/NFC card tap"
                    className={`
                      relative h-48 w-72 rounded-2xl border-2 border-dashed
                      flex flex-col items-center justify-center gap-4
                      transition-all duration-300 touch-manipulation
                      disabled:cursor-not-allowed
                      ${rfidReading
                        ? 'border-indigo-500 bg-indigo-900/25 scale-[0.96] rfid-pulse'
                        : 'border-slate-600 bg-slate-800/30 hover:border-indigo-500/70 hover:bg-slate-800/60 active:scale-[0.95]'
                      }
                    `}
                  >
                    {rfidReading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-indigo-400 animate-spin" />
                        <span className="text-indigo-300 text-sm font-bold">Reading card…</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700/60">
                          <CreditCard className="h-9 w-9 text-slate-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-200 text-sm font-bold">Tap your LPU Smart Card</p>
                          <p className="text-slate-500 text-xs mt-1">near the card reader panel</p>
                        </div>
                      </>
                    )}
                  </button>
                  <p className="text-slate-600 text-xs flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600 inline-block" />
                    Hold card within 3 cm of the NFC reader
                  </p>
                </div>
              )}

              {/* ── Tab B: Roll Number Entry ─────────────────── */}
              {activeTab === 'rollid' && (
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={rollId}
                      onChange={(e) => { setRollId(e.target.value); clearError(); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !loading) authenticate(rollId); }}
                      placeholder="Enter Roll / Registration Number"
                      className="
                        w-full h-[56px] pl-12 pr-5 rounded-xl
                        bg-slate-800 border border-slate-600
                        text-white text-lg font-mono tracking-widest
                        placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans
                        focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25
                        transition-colors duration-200
                      "
                      aria-label="Student Roll Number"
                      inputMode="numeric"
                    />
                  </div>
                  <button
                    onClick={() => authenticate(rollId)}
                    disabled={loading || !rollId.trim()}
                    className="
                      h-[56px] px-7 rounded-xl min-w-[160px]
                      bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700
                      disabled:opacity-55 disabled:cursor-not-allowed
                      text-white text-base font-bold
                      flex items-center justify-center gap-2
                      transition-all duration-200 touch-manipulation
                      shadow-lg shadow-indigo-900/40
                    "
                  >
                    {loading
                      ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying…</>
                      : 'Verify & Login'
                    }
                  </button>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-red-950/50 border border-red-800/50 rounded-xl animate-[kioskFadeIn_0.25s_ease-out]">
                  <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="px-10 py-5 border-t border-slate-700/55 bg-slate-900/50 flex items-center justify-between">
            <button
              onClick={resetSession}
              className="
                flex items-center gap-2 px-6 py-3 rounded-xl
                text-slate-400 hover:text-red-300
                border border-slate-700 hover:border-red-800/60
                text-sm font-semibold
                transition-all duration-200 touch-manipulation min-h-[48px]
              "
            >
              <XCircle className="h-4 w-4" />
              Cancel Session
            </button>

            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>Session auto-resets after 60 s of inactivity</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 text-xs">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>LPU · Trialshopy Campus Kiosk · Station #01</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

