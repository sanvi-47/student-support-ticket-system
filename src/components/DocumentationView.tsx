import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
  GitBranch,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Edumerge Pre-Drive Product Engineering Submission</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
          Assignment 4: Student Support & Ticket Management
        </h1>
        <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Comprehensive Approach Note, State Machine Architecture, SLA & Ageing Engine Design, Edge-Case Handling, and Mandatory AI Usage Report.
        </p>
      </div>

      {/* 1. Problem Understanding & Product Thinking */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>1. Problem Understanding & Institutional Context</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          In higher education institutions (colleges with 5,000+ students and multiple departments), student grievances and administrative requests (fee receipts, attendance waivers, hall tickets, bonafide certificates, hostel repairs) are frequently fragmented across informal WhatsApp messages, emails, and physical counter queues.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Standard commercial helpdesks fail in higher-ed because they lack <strong>institutional state-awareness</strong>:
        </p>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <li>
            <strong>SLA Unfairness on Student Delays:</strong> When a department officer asks a student for missing bank UTR or police lost reports, the staff member is unfairly penalized with an SLA breach if the student takes 3 days to respond. Our system implements an <em>SLA Pause State Machine</em>.
          </li>
          <li>
            <strong>Exam Criticality:</strong> A hall ticket lock 24 hours before an exam cannot wait for standard 48-hour queues. It demands automatic priority overrides and executive escalation.
          </li>
          <li>
            <strong>Multi-Role Privacy:</strong> Staff require internal collaboration notes (e.g. "Reconciling UTR batch with bank gateway") that must remain strictly invisible to students while maintaining an immutable audit log.
          </li>
        </ul>
      </div>

      {/* 2. State Machine & Architecture */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-600" />
          <span>2. Ticket Lifecycle & SLA State Machine</span>
        </h2>

        {/* State Flow Diagram in CSS */}
        <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
          <div className="text-indigo-400 font-bold">// Finite State Machine Transitions</div>
          <div>[DRAFT] ➔ (Submit) ➔ [OPEN]</div>
          <div>[OPEN] ➔ (Assign to Staff) ➔ [IN_PROGRESS]</div>
          <div>[IN_PROGRESS] ➔ (Request Student Info) ➔ [PENDING_STUDENT_ACTION] *SLA Pauses*</div>
          <div>[PENDING_STUDENT_ACTION] ➔ (Student Replies/Uploads) ➔ [IN_PROGRESS] *SLA Resumes*</div>
          <div>[IN_PROGRESS] ➔ (Resolve with Root Cause) ➔ [RESOLVED]</div>
          <div>[RESOLVED] ➔ (Student Disputes &lt;48h) ➔ [REOPENED] (Auto Escalated L1)</div>
          <div>[RESOLVED] ➔ (Student Rates / 72h Inactivity) ➔ [CLOSED]</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
            <h4 className="text-xs font-bold text-indigo-900">SLA Tiers & Targets</h4>
            <p className="text-xs text-indigo-800">
              • <strong>Critical:</strong> 4h First Response | 18h Resolution<br />
              • <strong>High:</strong> 8h First Response | 36h Resolution<br />
              • <strong>Medium:</strong> 24h First Response | 72h Resolution<br />
              • <strong>Low:</strong> 48h First Response | 120h Resolution
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
            <h4 className="text-xs font-bold text-amber-900">Two-Tier Escalation Engine</h4>
            <p className="text-xs text-amber-800">
              • <strong>Level 1 (Breach):</strong> Automatically flagged when SLA reaches 100% time elapsed or upon dispute reopening.<br />
              • <strong>Level 2 (Executive):</strong> Escalated to Dean / Management console with mandatory justification.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Validation & Edge Cases Handled */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>3. Critical Edge Cases & Failure Scenarios Handled</span>
        </h2>

        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900">1. Student Response Delay (SLA skewing):</strong>
            <p className="text-xs text-slate-600 mt-0.5">
              <em>Solution:</em> When set to <code className="text-indigo-600 font-mono">PENDING_STUDENT_ACTION</code>, the resolution clock freezes and records cumulative paused minutes (<code className="text-indigo-600 font-mono">totalPausedMinutes</code>), which extends the effective deadline upon resumption.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900">2. Reopen Abuse & Infinite Loops:</strong>
            <p className="text-xs text-slate-600 mt-0.5">
              <em>Solution:</em> Students can only reopen within a 48-hour grace period post-resolution, requiring mandatory written justification. Reopening automatically triggers a Level 1 Escalation alert so supervisors inspect the repeat failure.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900">3. Staff Race Condition (Simultaneous Claiming):</strong>
            <p className="text-xs text-slate-600 mt-0.5">
              <em>Solution:</em> Ticket ownership enforces single-owner accountability with optimistic UI updates and assignment audit logging, recording previous and new assignee in the event stream.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <strong className="text-slate-900">4. Premature Closing without Root Cause:</strong>
            <p className="text-xs text-slate-600 mt-0.5">
              <em>Solution:</em> Staff cannot simply toggle a ticket to Resolved; the system mandates selecting a categorized Root Cause and entering an explanatory student-facing resolution summary.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mandatory AI Usage Report */}
      <div className="bg-white rounded-3xl border-2 border-indigo-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Recruitment Brief Compliance
            </span>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Mandatory AI Usage Report</span>
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Completed & Verified
          </span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <span className="font-bold text-slate-900 block mb-1">AI TOOL USED:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
              Gemini / Claude / Cursor (AI-assisted Pair Programming)
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">WHAT I ASKED AI TO DO:</span>
            <ol className="list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
              <li>Scaffold a domain model for a higher-education ticket management system with college-specific categories (fees, exams, ID card, attendance).</li>
              <li>Design an SLA calculation engine that dynamically calculates elapsed time, warnings, and accounts for paused intervals during student dependency states.</li>
              <li>Generate realistic seed datasets and initial audit logs reflecting actual college campus operational scenarios.</li>
            </ol>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">PROMPT THAT WAS MOST USEFUL:</span>
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-xs leading-relaxed">
              "Design a TypeScript state machine and SLA calculation algorithm for a college support desk where ticket status PENDING_STUDENT_ACTION pauses the resolution countdown clock so support officers are not penalized while waiting for student document uploads."
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">CODE GENERATED BY AI:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              The initial boilerplate for the React Context, Lucide icons UI scaffolding, and base mock data entities.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">CODE I MODIFIED:</span>
            <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Refactored the SLA calculation engine to properly persist and compute <code className="text-indigo-600 font-mono">totalPausedMinutes</code> across multiple pause/resume cycles, and enforced strict permission masking so students cannot see internal staff notes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <span className="font-bold text-rose-900 block">AI OUTPUT THAT WAS WRONG:</span>
            <p className="text-xs text-rose-800 leading-relaxed">
              The AI originally wrote the SLA calculation using a simple static calculation: <code className="font-mono">now - createdAt &gt; slaHours</code>. This completely broke whenever a ticket was placed in "Pending Student Action" or resolved, falsely marking tickets as "Breached" even when staff resolved them early or were waiting for students!
            </p>

            <span className="font-bold text-rose-900 block pt-1">HOW I IDENTIFIED THE PROBLEM:</span>
            <p className="text-xs text-rose-800 leading-relaxed">
              During manual verification, placing a ticket in "Pending Student Action" caused the countdown to continue ticking down in the background, causing immediate false SLA breach alerts for tickets waiting for police lost reports.
            </p>

            <span className="font-bold text-rose-900 block pt-1">HOW I FIXED IT:</span>
            <p className="text-xs text-rose-800 leading-relaxed">
              I redesigned the state machine in <code className="font-mono text-rose-900 font-bold">slaCalculator.ts</code> and <code className="font-mono text-rose-900 font-bold">TicketContext.tsx</code> to record <code className="font-mono font-bold">slaPausedAt</code> when entering the paused state, compute elapsed pause duration on resumption, and increment <code className="font-mono font-bold">totalPausedMinutes</code> which offsets the effective deadline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
