# Trialshopy AI Smart Student Mentor & Career Guidance Display

An AI-powered academic diagnosis, personalized learning roadmap, and career guidance kiosk MVP designed for university libraries and smart campus common spaces.

> **Project Submission:** Trialshopy AI/ML + AR/VR Development Internship Assignment  
> **Author:** Jagadeesh Chinta  
> **Deployment Target:** University Library Learning Common Hub • Station #01  
> **Full Technical Report:** [`trialshopy-app/docs/SUBMISSION_REPORT.md`](trialshopy-app/docs/SUBMISSION_REPORT.md)

---

## 🎯 Overview & Core Workflow

University students often deal with fragmented academic portals and limited faculty mentor bandwidth. This interactive kiosk bridges that gap through a 6-state guided workflow:

| State | Screen / Module | Purpose & Key Capabilities |
| :--- | :--- | :--- |
| **State 0** | **Standby Wake Screen** | Proximity-wake ambient radar UI with real-time IST clock and transparent camera presence notice (no facial recognition or mood profiling). |
| **State 1** | **DPDP Consent & Auth** | Explicit data-minimization consent and non-biometric login via Campus RFID Card tap or Student Roll ID (`12204581`). |
| **State 2** | **Academic Diagnosis** | Connects to synthetic SIS/LMS records to flag subject/topic performance gaps (e.g., *CSE302 Data Structures & Algorithms* at 64% with Trees at 52% and Graphs at 44%) with explainable evidence. |
| **State 3** | **AI Voice & Chat Mentor** | Grounded academic dialogue powered by **Google Gemini 1.5 Flash** (with resilient offline mock fallback) and **Web Speech API** (English & Hindi STT/TTS). |
| **State 4** | **14-Day Personalized Roadmap** | Structured 2-phase recovery and placement plan with interactive task tracking, LeetCode/LMS links, and human faculty escalation referral. |
| **State 5** | **QR Mobile Handoff & PDF** | Expiring 15-minute QR code linking to `/mobile-roadmap/[sessionId]`, client-side `jsPDF` report export, and auto-purge session reset. |

---

## 🛡️ Privacy, Security & Responsible AI Boundaries

Built in strict alignment with India's **Digital Personal Data Protection (DPDP) Act, 2023** and the assignment's ethical scope:
* **Non-Biometric Authentication:** Uses Campus RFID/ID login; facial recognition is strictly excluded.
* **No Emotion or Palmistry Inferences:** Camera usage is restricted to presence detection. Emotion profiling and palmistry are explicitly omitted as unscientific for educational decisions.
* **Ephemeral Zero-Retention Sessions:** Kiosk state auto-resets on 60-second inactivity or explicit exit, invalidating temporary session tokens and clearing local cache.
* **Human-in-the-Loop Escalation:** Supports direct booking and referral slips with faculty mentors (**Dr. Rajesh V., Block 34 Desk 12**) rather than replacing human counselors.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React
* **AI & Voice:** Google Gemini 1.5 Flash API (`/api/mentor` with deterministic fallback engine), Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **Reporting & Handoff:** `qrcode.react` (ephemeral mobile handoff), `jspdf` (client-side diagnostic PDF generation)
* **Documentation:** Full system architecture, hardware BOM, test matrix, and KPIs in [`trialshopy-app/docs/SUBMISSION_REPORT.md`](trialshopy-app/docs/SUBMISSION_REPORT.md)

---

## 🚀 Local Setup & Testing

### 1. Installation
```bash
# Navigate to the Next.js project directory
cd trialshopy-app

# Install dependencies
npm install
```

### 2. Environment Variables (Optional)
The system contains a resilient, grounded fallback engine that runs without any API keys. To connect live Google Gemini generation:
```bash
# Create .env.local in trialshopy-app/
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 3. Run Development Server
```bash
cd trialshopy-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the kiosk display.

