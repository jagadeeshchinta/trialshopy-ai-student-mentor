'use client';

// ============================================================
// app/page.tsx
// Kiosk Entry Screen: Renders the Interactive WakeScreen.
// Navigation to /dashboard is handled cleanly via Next.js router.
// Legacy in-place diagnostic switching has been removed to prevent screen flash.
// ============================================================

import React from 'react';
import InteractiveWakeScreen from '@/components/InteractiveWakeScreen';

export default function KioskPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#05050f] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-indigo-300/70 font-mono tracking-widest">INITIALIZING TRIALSHOPY KIOSK...</p>
        </div>
      </div>
    );
  }

  // Keep WakeScreen permanently mounted in verified/transitioning state until router.push('/dashboard') completes
  return <InteractiveWakeScreen />;
}
