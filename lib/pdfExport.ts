// ============================================================
// lib/pdfExport.ts
// Official Academic Diagnostic & Personalized Roadmap PDF Exporter
// Generates a clean, professional PDF report using jsPDF.
// ============================================================

import { jsPDF } from 'jspdf';
import type { StudentProfile, PersonalizedRoadmap } from '@/types/kiosk';

export function exportRoadmapToPdf(
  student: StudentProfile,
  roadmap: PersonalizedRoadmap
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // ── Header Band ─────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TRIALSHOPY SMART CAMPUS ACADEMIC MENTOR KIOSK', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'Official Academic Diagnostic Audit & 14-Day Targeted Roadmap Report • Station #01',
    14,
    19
  );

  y = 36;

  // ── Document Title ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Student Academic Performance & Roadmap Report', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Report Reference: TR-LPU-CSE-${student.rollId}-V1 | Generated: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    14,
    y
  );
  y += 8;

  // ── Student Info Table Box ──────────────────────────────────
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  doc.text('Student Name:', 18, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.fullName, 45, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Registration ID:', 110, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.rollId, 140, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Programme / Sem:', 18, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${student.degree} (Sem ${student.currentSemester})`, 48, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Current CGPA:', 110, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // indigo-600
  doc.text(`${student.cgpa.toFixed(1)} / 10.0`, 140, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('University / Campus:', 18, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(student.university, 52, y + 21);

  y += 33;

  // ── Diagnostic Section ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Verified Academic Diagnostic & Subject Audit (LPU SIS)', 14, y);
  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Course Name', 16, y + 5);
  doc.text('Score', 95, y + 5);
  doc.text('Attendance', 120, y + 5);
  doc.text('Status & Priority', 150, y + 5);
  y += 7;

  // Table rows
  student.enrolledCourses.forEach((c) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const isFocus = c.status === 'Requires Immediate Focus';
    if (isFocus) {
      doc.setFillColor(254, 242, 242);
      doc.rect(14, y, pageWidth - 28, 6.5, 'F');
      doc.setTextColor(185, 28, 28);
    } else {
      doc.setTextColor(30, 41, 59);
    }
    doc.text(c.courseName, 16, y + 4.5);
    doc.text(`${c.overallScorePercent}%`, 95, y + 4.5);
    doc.text(`${c.attendancePercent}%`, 120, y + 4.5);
    doc.setFont('helvetica', isFocus ? 'bold' : 'normal');
    doc.text(c.status, 150, y + 4.5);
    y += 6.5;
  });

  y += 3;

  // Topic Breakdown Box
  doc.setFillColor(255, 251, 235); // amber-50
  doc.setDrawColor(253, 230, 138); // amber-200
  doc.roundedRect(14, y, pageWidth - 28, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('CSE302 DSA Root-Cause Findings:', 18, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  doc.text('• Binary Search Trees & Traversals: 52% (Quiz 2 dropped 18% below subject average)', 18, y + 9);
  doc.text('• Graph Algorithms (BFS/DFS): 44% (DFS traversal lab recorded INCOMPLETE on LMS)', 18, y + 13);
  doc.text('• Course attendance at 76% is under the 80% end-semester exam eligibility threshold.', 18, y + 16.5);

  y += 24;

  // ── 14-Day Roadmap Section ──────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Targeted 14-Day Academic Recovery Roadmap (CSE302 DSA)', 14, y);
  y += 6;

  roadmap.phases.forEach((phase) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text(`Phase ${phase.phaseNumber}: ${phase.phaseName} (${phase.suggestedTimeframe})`, 14, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Goal: ${phase.goalSummary}`, 14, y);
    y += 5;

    phase.tasks.forEach((task) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Checkbox square
      doc.setDrawColor(148, 163, 184);
      doc.rect(16, y - 2.5, 3, 3);

      doc.setFont('helvetica', 'bold');
      doc.text(`[${task.priority}] ${task.title}`, 22, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`(${task.estimatedDuration})`, 160, y);
      y += 4;

      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(task.description.slice(0, 105), 22, y);
      y += 4.5;
    });

    y += 2;
  });

  // ── Faculty Escalation Sign-Off Section ─────────────────────
  y = Math.max(y, 245);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Faculty Mentor Referral & Escalation Slip', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Assigned Faculty: Dr. Rajesh V. (Associate Professor, CSE • Block 34 Desk 12)', 18, y + 11);
  doc.text('Action: Review Quiz 2 paper, clear DFS lab doubt, and verify Week 2 mock test result.', 18, y + 15);

  doc.line(18, y + 26, 75, y + 26);
  doc.text('Student Signature', 18, y + 29);

  doc.line(110, y + 26, 175, y + 26);
  doc.text('Faculty Mentor Signature & Stamp', 110, y + 29);

  // ── Footer ──────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Trialshopy Smart Campus Display System • DPDP Act 2023 Compliant • Ephemeral Token Generated',
    14,
    290
  );

  // Save the PDF
  doc.save(`Trialshopy_Academic_Roadmap_${student.rollId}.pdf`);
}

