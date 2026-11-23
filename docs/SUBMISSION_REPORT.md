# TRIALSHOPY AI SMART STUDENT MENTOR & CAREER GUIDANCE DISPLAY
## Comprehensive Project Assignment Submission Report & Implementation Proposal

**Proposed by:** Trialshopy EdTech | Smart Campus Initiative  
**Target Deployment:** University Library Learning Common Hub (Station #01)  
**Partner Institution Testbed:** Lovely Professional University (LPU)  
**Student Test Case:** Jagadeesh Chinta (Roll: 12204581, B.Tech CSE, Semester 6, CGPA 7.5)  
**Submission Date:** 11 November 2026 (Assignment Deadline: 13 November 2026)  
**Document Status:** Final Implementation Report, Architecture Specification & Delivered MVP  

---

## 1. Executive Summary & Problem Statement

### 1.1 Executive Summary
The **Trialshopy AI Smart Student Mentor Display** is an intelligent, voice-guided interactive kiosk engineered for university libraries, student commons, and academic hubs. The system bridges the critical gap between fragmented institutional academic records and actionable, student-centric guidance. 

Operating under the strict privacy tenets of India's **Digital Personal Data Protection (DPDP) Act, 2023**, the kiosk authenticates students using non-biometric methods (campus RFID smart card or student registration ID), retrieves verified semester coursework and attendance metrics from the university Student Information System (SIS/LMS), analyzes topic-level performance deficits using explainable rules, conducts a natural voice/touch dialogue, and generates a time-bound **14-Day Targeted Learning Roadmap**. Students seamlessly transfer their roadmap, practice modules, and diagnostic reports to their personal mobile device via an ephemeral QR code.

### 1.2 Problem Statement
In contemporary higher education institutions, academic data is severely fragmented across disparate portals (LMS, attendance systems, internal marks spreadsheets, examination portals). Students face several compounding barriers:
1. **Lack of Explainability:** Students frequently see lagging grades without understanding *why* (e.g., failing a quiz due to incomplete prerequisite lab submissions).
2. **Faculty Bandwidth Constraints:** Faculty mentors and academic counselors are constrained by high student-to-faculty ratios (often exceeding 80:1), making frequent personalized interventions difficult.
3. **Execution Gap:** Even when students know their weak areas, they lack structured, daily time-budgeted study plans (e.g., 45–60 min/day blocks) to systematically close the gap.
4. **Accountability & Tracking:** Universities lack non-intrusive mechanisms to verify whether advisory interventions translate into measurable academic improvements.

The Trialshopy AI Smart Student Mentor solves this by offering an always-available, privacy-first, supportive campus kiosk that acts as an academic compass while maintaining authorized human-in-the-loop escalation.

---

## 2. System Architecture & High-Level Data Flow

```
                                  CAMPUS NETWORK PERIMETER
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                        │
 │  +-----------------------+     Touch / Voice     +----------------------------------+  │
 │  |   32-43" Commercial   | <===================> |   Kiosk Front-End (Next.js 16)   |  │
 │  |  Touchscreen Display  |                       |  - TailwindCSS v4 Dark Canvas    |  │
 │  +-----------------------+                       |  - Web Speech API (STT / TTS)    |  │
 │                                                  |  - Inactivity Auto-Reset Watchdog|  │
 │                                                  +----------------------------------+  │
 │                                                                   │                    │
 │                                                                   │ Internal JSON API  │
 │                                                                   ▼                    │
 │  +-----------------------+                       +----------------------------------+  │
 │  | University SIS / LMS  |                       |  Next.js Edge / Node.js Backend  |  │
 │  | - REST Data Connector | <===================> |  - Route: /api/mentor            |  │
 │  | - Coursework & Marks  |    Secure HTTPS/mTLS  |  - Session Context State Machine |  │
 │  +-----------------------+                       +----------------------------------+  │
 │                                                                   │                    │
 │                                                                   │ Grounded Prompts   │
 │                                                                   ▼                    │
 │                                                  +----------------------------------+  │
 │                                                  | Google Gemini 1.5 Flash /        |  │
 │                                                  | Resilient Fallback Engine        |  │
 │                                                  +----------------------------------+  │
 │                                                                   │                    │
 │                                                                   ▼                    │
 │                                                  +----------------------------------+  │
 │                                                  | Ephemeral QR Handoff Engine      |  │
 │                                                  | - Live Mobile Companion Webpage  |  │
 │                                                  | - Client-Side PDF Exporter       |  │
 │                                                  +----------------------------------+  │
 │                                                                                        │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Kiosk Frontend Architecture
- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript.
- **Display Hardening (`app/globals.css`):** Locked 1920×1080 viewport (`overflow: hidden`, `overscroll-behavior: none`), disabled browser text selection, touch-callout suppression, custom dark slate/indigo library aesthetic, and 48px+ minimum touch targets.
- **Audio & Speech Engine:** Dual-channel Web Speech API integration:
  - **Speech-to-Text (STT):** Continuous speech recognition via `webkitSpeechRecognition` with microphone visualizer.
  - **Text-to-Speech (TTS):** Natural speech synthesis with pitch/rate normalization and instant language switching between English (`en-IN`) and Hindi (`hi-IN`).
- **Inactivity Watchdog:** A 60-second safety countdown listening to global pointer, touch, and keypress events. On timeout, session state is expunged and returns to `WAKE_SCREEN`.

### 2.2 Backend & AI Orchestration Layer
- **API Endpoint:** `/api/mentor` (POST)
- **Model:** Google Gemini 1.5 Flash with structured system persona prompting.
- **Grounded Prompting:** Incorporates student diagnostic context directly into prompt instructions. Grounded in actual facts (Jagadeesh Chinta: CSE302 64%, Trees 52%, Graphs 44%, OS 78%, DBMS 84%).
- **Resilient Fallback Engine:** Built-in multi-turn mock conversational engine that delivers identical, high-fidelity academic diagnostics if `GEMINI_API_KEY` is not set or network fails.

### 2.3 University Data Connector Schema
The system models student records through strict TypeScript contracts (`types/kiosk.ts`):
```typescript
interface StudentProfile {
  fullName: string;
  university: string;
  degree: string;
  currentSemester: number;
  rollId: string;
  cgpa: number;
  enrolledCourses: CoursePerformance[];
}
```

### 2.4 Ephemeral Mobile Handoff Engine
- **QR Generation:** High-res SVG QR codes rendered client-side via `qrcode.react`.
- **Target URL:** `/mobile-roadmap/[sessionId]`
- **Companion Webpage:** Mobile-responsive checklist allowing students to mark daily tasks, launch practice modules on LeetCode/LPU LMS, and download offline PDF summaries.

---

## 3. Hardware Bill of Materials (BOM) & Specifications

| Component | Specification | Rationale & Deployment Considerations |
|---|---|---|
| **Commercial Display** | 32" to 43" Full HD / 4K Commercial Touch Display (1920×1080 minimum resolution, 450+ nits brightness, 10-point capacitive touch, 16/7 or 24/7 commercial rating) | Provides clear legibility for seated or standing students in bright library environments without reflections. |
| **Compute Engine** | Intel Core i5/i7 Mini PC (16GB DDR5 RAM, 512GB NVMe SSD, Dual Gigabit Ethernet + Wi-Fi 6E, Fanless or low-noise acoustic profile, Windows 11 IoT Enterprise or Ubuntu LTS in kiosk lock-down mode) | Compact form factor fits inside the kiosk chassis; fanless operation ensures dead silence inside quiet library study commons. |
| **Microphone Array** | USB Noise-Cancelling Boundary / Directional Microphone Array with hardware DSP voice isolation (pickup range: 0.5m – 1.2m) | Filters out library background ambient noise while isolating the student's voice directly in front of the kiosk. |
| **Audio Speaker** | Directional Acoustic Focused Speaker (narrow 30° sound dispersion beam) with 3.5mm Headphone Jack | Prevents sound from bleeding into adjacent library study carrels while maintaining privacy for sensitive conversations. |
| **Presence Sensor** | Optical Ultrasonic or Infrared Proximity Sensor (detection range: 1.5m), supplemented by an optional 1080p webcam **strictly configured for non-biometric presence detection** | Automatically transitions display from sleep to WakeScreen upon student approach. No video recording or facial logging occurs. |
| **RFID / NFC Reader** | 13.56 MHz Contactless Smart Card Reader (Mifare / ISO 14443A compliant with USB HID interface) | Allows students to tap their existing LPU Smart Campus ID Card for rapid 1-second authentication. |
| **Physical Enclosure** | Floor-standing or wall-mounted powder-coated steel kiosk housing with lockable maintenance access, integrated surge suppression, and internal cable management | Vandal-resistant, tamper-proof design meeting campus public space safety guidelines. |

---

## 4. Privacy, Security & Responsible AI Framework

The Trialshopy AI Smart Student Mentor has been designed from the ground up to comply with India's **Digital Personal Data Protection (DPDP) Act, 2023** and global educational data privacy standards:

### 4.1 DPDP Act Compliance & Consent Architecture
- **Explicit Informed Consent:** State 1 (`ConsentAuthModal`) enforces a mandatory consent gate detailing exact data minimization principles before any academic record is retrieved.
- **Purpose Limitation:** Academic records are accessed exclusively for the active mentoring session and are never repurposed for profiling, commercial targeting, or disciplinary actions.
- **Zero-Retention Ephemeral Policy:** Once the session terminates (either via manual "End Session" or the 60-second inactivity watchdog), session state, tokens, and cached transcript data are expunged from the kiosk memory.

### 4.2 Non-Biometric Authentication Guarantee
- **No Facial Recognition:** The kiosk explicitly rejects facial recognition as an identity mechanism.
- **Supported Login Modes:** 
  1. Contactless Campus RFID / Smart Card tap.
  2. Student Registration / Roll ID number entry with university portal SSO verification.

### 4.3 Scope Boundaries & Exclusion of Pseudoscience
- **Strict Prohibition of Palmistry:** As specified in Section 15 of the brief, palm scanning and biometric palmistry are completely excluded from the academic MVP.
- **No Emotional or Affective Inferences:** The AI mentor does not attempt to infer a student's emotional state, honesty, or cognitive capacity from webcam imagery. All dialogue is grounded purely in verified coursework metrics and direct student text/voice inputs.

### 4.4 Human Faculty Escalation & Referral Safeguards
AI mentoring is intended to support—not replace—human professors. When diagnostic evidence detects lagging subject scores (<55% or attendance <80%), the system automatically:
- Issues an authorized **Faculty Mentor Referral Slip** (`AcademicProgressReportModal.tsx`).
- Directs the student to their assigned professor (**Dr. Rajesh V., Associate Professor, CSE • Block 34, 3rd Floor, Desk #12**).
- Distinguishes self-reported milestone completion from official university SIS grade updates.

---

## 5. Minimum Viable Product (MVP) vs. Future Roadmap

| Lifecycle Stage | Feature / Capability | Delivery Status in MVP |
|---|---|---|
| **Delivered MVP** | Kiosk Standby Display with Live IST Clock & Radar Ring | ✅ Production-ready (`WakeScreen.tsx`) |
| **Delivered MVP** | DPDP Consent Gate & RFID/Roll ID Dual Authentication | ✅ Production-ready (`ConsentAuthModal.tsx`) |
| **Delivered MVP** | 3-Column Academic Diagnostics with CSE302 Deep Dive | ✅ Production-ready (`AcademicDiagnosisDashboard.tsx`) |
| **Delivered MVP** | Grounded Gemini AI Voice Mentor (STT/TTS + English/Hindi) | ✅ Production-ready (`AiMentorConversation.tsx` & `/api/mentor`) |
| **Delivered MVP** | Targeted 14-Day Recovery Roadmap with Interactive Tasks | ✅ Production-ready (`PersonalizedRoadmap.tsx` & `roadmapGenerator.ts`) |
| **Delivered MVP** | Official Academic Progress & Faculty Escalation Report | ✅ Production-ready (`AcademicProgressReportModal.tsx`) |
| **Delivered MVP** | Ephemeral QR Mobile Companion Handoff | ✅ Production-ready (`MobileHandoffScreen.tsx` & `qrcode.react`) |
| **Delivered MVP** | Responsive Mobile Companion Webpage | ✅ Production-ready (`app/mobile-roadmap/[sessionId]/page.tsx`) |
| **Delivered MVP** | Client-Side Official PDF Export Utility | ✅ Production-ready (`lib/pdfExport.ts` via `jspdf`) |
| **Phase 2 (Post-MVP)** | Bidirectional LMS Grade Synchronization | 🔄 Scheduled (Direct LPU UMS API Webhooks) |
| **Phase 3** | Multilingual Expansion (Telugu, Tamil, Marathi, Punjabi) | 🔄 Planned (Deepgram / Google Cloud Speech-to-Text) |
| **Phase 4** | In-Kiosk LeetCode / Python Sandbox IDE | 🔄 Planned (Monaco Editor WebAssembly sandbox) |
| **Phase 5** | Campus Placement Mock Interview Voice Simulator | 🔄 Planned (AI technical behavioral interviewer) |

---

## 6. Testing, Verification Matrix & Success Metrics

### 6.1 Verification & Quality Assurance Matrix

| Test Category | Target Component | Test Scenario | Acceptance Criteria | Verified Result |
|---|---|---|---|---|
| **Compilation** | Whole Project | Full Next.js 16 production build | `npm run build` succeeds with 0 errors | **Pass (100% Green)** |
| **Type Safety** | TypeScript Contracts | Static type validation | `npx tsc --noEmit` returns code 0 | **Pass (0 Errors)** |
| **Authentication** | `ConsentAuthModal` | Tap RFID / Enter Roll ID `12204581` | Profile loads correctly from synthetic SIS connector | **Pass** |
| **Diagnostic Rules** | `mockStudent.ts` | Filter courses with scores <70% | CSE302 flagged with 5 concrete diagnostic evidence notes | **Pass** |
| **Voice AI / Speech** | `AiMentorConversation` | Web Speech API STT and TTS | Audio speaks clean text; STT populates input | **Pass** |
| **Gemini Fallback** | `/api/mentor` | Test without `GEMINI_API_KEY` | Structured mock diagnostic progression activates without crashing | **Pass** |
| **Interactive Tasks** | `PersonalizedRoadmap` | Cycle task status button | State toggles `Not Started` ➔ `In Progress` ➔ `Completed` & updates % | **Pass** |
| **PDF Generation** | `pdfExport.ts` | Click "Export Official PDF" | Generates formatted 1-page A4 PDF document | **Pass** |
| **Mobile Sync** | `mobile-roadmap` | Open URL `/mobile-roadmap/12204581` | Responsive mobile checklist renders with localStorage persistence | **Pass** |
| **Inactivity Safety** | `KioskContext` | Wait 60s without touch input | Kiosk hard-resets automatically to State 0 | **Pass** |

### 6.2 Proposed Success Metrics & Institutional KPIs
1. **Authentication Success Rate:** >95% of student sessions initiated at the kiosk complete authentication within 15 seconds.
2. **Roadmap Generation Rate:** >85% of authenticated diagnostic sessions produce a finalized 14-day recovery roadmap.
3. **Mobile Handoff Engagement:** >60% of students scan the QR code to track their daily tasks on their smartphone.
4. **Academic Improvement Delta:** Target a +10% to +15% score increase in subsequent internal assessments (e.g., CSE302 lifting from 64% to 75%+) over a 14 to 28-day intervention cycle.
5. **System Availability:** 99.8% uptime during university library operating hours (8:00 AM – 11:00 PM).

---

## 7. Conclusion & Next Steps

The Trialshopy AI Smart Student Mentor Display MVP is fully implemented, thoroughly typed, and verified for campus demonstration. It transforms complex academic metrics into an empowering, grounded, and human-centric mentoring experience.

**Deliverables Summary:**
- Complete Next.js 16 application source code in `c:\Users\jagadeesh chinta\OneDrive\Desktop\trialshopy-app\`.
- All 6 interactive kiosk screens operational with smooth touch transitions.
- Fully integrated Gemini-powered AI backend with resilient offline fallback.
- Client-side PDF export and live mobile companion checklist.
- Complete documentation and architectural blueprints.

*Submitted to Trialshopy Evaluation Committee • 11 November 2026*

