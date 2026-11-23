// ============================================================
// app/layout.tsx
// Root layout for the Trialshopy AI Smart Student Mentor
// Display kiosk application.
//
// Responsibilities:
//  - Wraps the entire app in <KioskProvider>
//  - Applies global kiosk-optimised dark-mode styles
//  - Sets viewport meta for a 1920×1080 fixed kiosk canvas
// ============================================================

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { KioskProvider } from '@/context/KioskContext';
import './globals.css';

// ─── Fonts ───────────────────────────────────────────────────

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// ─── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Trialshopy AI Smart Student Mentor | LPU Campus Kiosk',
  description:
    'AI-powered academic mentor kiosk — personalised diagnostics, learning roadmaps, and mobile handoff for LPU students.',
  robots: { index: false, follow: false }, // kiosk is not for public indexing
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Prevent browser zoom on a touch kiosk
  maximumScale: 1,
  userScalable: false,
};

// ─── Layout ───────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          font-sans antialiased
          bg-gray-950 text-gray-50
          overflow-x-hidden min-h-screen
        `}
      >
        {/*
         * KioskProvider supplies the session state machine to the entire
         * component tree. The 60-second inactivity timeout is the default;
         * override via the inactivityTimeoutMs prop during development.
         */}
        <KioskProvider inactivityTimeoutMs={60_000}>
          {children}
        </KioskProvider>
      </body>
    </html>
  );
}
