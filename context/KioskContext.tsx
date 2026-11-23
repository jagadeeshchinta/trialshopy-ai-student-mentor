'use client';

// ============================================================
// context/KioskContext.tsx
// Global kiosk session state machine and context provider.
//
// Manages the full lifecycle of a single student interaction:
//   WAKE_SCREEN → CONSENT_AUTH → ACADEMIC_DIAGNOSTIC →
//   AI_MENTOR_SESSION → ROADMAP_VIEW → QR_MOBILE_HANDOFF
//
// Includes an inactivity auto-reset timer (default 60 s) for
// public kiosk safety — the session hard-resets to WAKE_SCREEN
// if no interaction is detected within the timeout window.
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  KioskContextValue,
  KioskSessionState,
  PersonalizedRoadmap,
  StudentProfile,
} from '@/types/kiosk';

// ─── Default / Initial State ─────────────────────────────────

const DEFAULT_INACTIVITY_TIMEOUT_MS = 60_000; // 60 seconds

const INITIAL_STATE: KioskSessionState = {
  currentState: 'WAKE_SCREEN',
  activeStudent: null,
  hasConsented: false,
  currentRoadmap: null,
  lastInteractionAt: Date.now(),
  inactivityTimeoutMs: DEFAULT_INACTIVITY_TIMEOUT_MS,
};

// ─── Context Creation ─────────────────────────────────────────

const KioskContext = createContext<KioskContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────

interface KioskProviderProps {
  children: React.ReactNode;
  /**
   * Override the inactivity timeout (ms). Useful for development
   * (set to a large value) or stricter kiosk policies.
   * @default 60000
   */
  inactivityTimeoutMs?: number;
}

export function KioskProvider({
  children,
  inactivityTimeoutMs = DEFAULT_INACTIVITY_TIMEOUT_MS,
}: KioskProviderProps) {
  const [state, setState] = useState<KioskSessionState>({
    ...INITIAL_STATE,
    inactivityTimeoutMs,
  });

  // Ref to hold the auto-reset timer so we can clear/restart it
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Inactivity Timer ──────────────────────────────────────

  /**
   * Clears any pending inactivity timer.
   */
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  /**
   * Starts (or restarts) the inactivity countdown.
   * When it fires, the session hard-resets to WAKE_SCREEN.
   */
  const restartInactivityTimer = useCallback(
    (currentStep: KioskSessionState['currentState']) => {
      clearInactivityTimer();

      // No timer needed on WAKE_SCREEN — it is already the idle state
      if (currentStep === 'WAKE_SCREEN') return;

      inactivityTimerRef.current = setTimeout(() => {
        console.info(
          '[KioskContext] Inactivity timeout reached — resetting session.'
        );
        setState({ ...INITIAL_STATE, inactivityTimeoutMs });
      }, inactivityTimeoutMs);
    },
    [clearInactivityTimer, inactivityTimeoutMs]
  );

  // Restart timer whenever the step changes
  useEffect(() => {
    restartInactivityTimer(state.currentState);
    return clearInactivityTimer;
  }, [state.currentState, restartInactivityTimer, clearInactivityTimer]);

  // Global pointer / keyboard / touch interaction capture for the timer
  useEffect(() => {
    const handleActivity = () => {
      setState((prev) => ({ ...prev, lastInteractionAt: Date.now() }));
      restartInactivityTimer(state.currentState);
    };

    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [state.currentState, restartInactivityTimer]);

  // ── State Transitions ─────────────────────────────────────

  /**
   * WAKE_SCREEN → CONSENT_AUTH
   * Triggered when the student touches / taps the kiosk to start.
   */
  const startSession = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentState: 'CONSENT_AUTH',
      lastInteractionAt: Date.now(),
    }));
  }, []);

  /**
   * CONSENT_AUTH → ACADEMIC_DIAGNOSTIC
   * Records consent acceptance and sets the authenticated student profile.
   */
  const giveConsentAndAuthenticate = useCallback(
    (student: StudentProfile) => {
      setState((prev) => ({
        ...prev,
        hasConsented: true,
        activeStudent: student,
        lastInteractionAt: Date.now(),
      }));
    },
    []
  );

  /**
   * ACADEMIC_DIAGNOSTIC → AI_MENTOR_SESSION
   * Student has reviewed their diagnostic and wishes to chat with the AI mentor.
   */
  const startMentorChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentState: 'AI_MENTOR_SESSION',
      lastInteractionAt: Date.now(),
    }));
  }, []);

  /**
   * AI_MENTOR_SESSION → ROADMAP_VIEW
   * Stores the AI-generated personalised roadmap and advances the view.
   */
  const generateRoadmap = useCallback((roadmap: PersonalizedRoadmap) => {
    setState((prev) => ({
      ...prev,
      currentState: 'ROADMAP_VIEW',
      currentRoadmap: roadmap,
      lastInteractionAt: Date.now(),
    }));
  }, []);

  /**
   * ROADMAP_VIEW → QR_MOBILE_HANDOFF
   * Student wants to continue on their mobile device.
   */
  const showMobileHandoff = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentState: 'QR_MOBILE_HANDOFF',
      lastInteractionAt: Date.now(),
    }));
  }, []);

  /**
   * Hard-reset the session back to WAKE_SCREEN and clear all session data.
   * Called manually (e.g. "End Session" button) or automatically by the
   * inactivity timer.
   */
  const resetSession = useCallback(() => {
    clearInactivityTimer();
    setState({ ...INITIAL_STATE, inactivityTimeoutMs });
  }, [clearInactivityTimer, inactivityTimeoutMs]);

  /**
   * Manually record a user interaction without changing state.
   * Useful for components that want to keep the session alive
   * during long-running async operations (e.g. AI streaming).
   */
  const recordInteraction = useCallback(() => {
    setState((prev) => ({ ...prev, lastInteractionAt: Date.now() }));
    restartInactivityTimer(state.currentState);
  }, [restartInactivityTimer, state.currentState]);

  // ── Context Value ─────────────────────────────────────────

  const contextValue: KioskContextValue = {
    ...state,
    startSession,
    giveConsentAndAuthenticate,
    startMentorChat,
    generateRoadmap,
    showMobileHandoff,
    resetSession,
    recordInteraction,
  };

  return (
    <KioskContext.Provider value={contextValue}>
      {children}
    </KioskContext.Provider>
  );
}

// ─── Consumer Hook ────────────────────────────────────────────

/**
 * Access the kiosk session context.
 * Must be used within a `<KioskProvider>` tree.
 *
 * @example
 * const { currentState, startSession } = useKiosk();
 */
export function useKiosk(): KioskContextValue {
  const ctx = useContext(KioskContext);
  if (ctx === null) {
    throw new Error(
      '[useKiosk] Must be used inside a <KioskProvider>. ' +
        'Ensure your component tree is wrapped with <KioskProvider>.'
    );
  }
  return ctx;
}

export default KioskContext;

