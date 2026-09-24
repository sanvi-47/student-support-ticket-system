# Edumerge Solutions — Pre-Drive Product Engineering Assessment
## Assignment 4: Student Support & Ticket Management System

**Candidate:** Engineering Candidate  
**Project Repository / Location:** `student-support-system`  
**Submission Target:** `tech_interview@edumerge.com`  

---

## 1. Executive Summary & Problem Understanding

Higher education institutions face unique operational challenges that generic IT helpdesks (e.g., Zendesk, Jira Service Desk) fail to resolve:
1. **Diverse Grievance Lifecycles:** Student issues span wildly different institutional departments—from transactional disputes (accounts/fees), to academic gatekeepers (exam cell hall tickets, internal marks), to campus living (hostel maintenance) and regulatory filings (bonafide certificates for government scholarships).
2. **Asymmetric Accountability & SLA Distortion:** In standard helpdesks, tickets waiting on student input continue to burn SLA time, resulting in false breach warnings and staff frustration. Our system implements a **State-Driven SLA Pause Mechanism** (`PENDING_STUDENT_ACTION`).
3. **High-Stakes Deadlines:** Unlike ordinary enterprise tickets, a student missing a hall ticket before semester exams has catastrophic consequences. The system incorporates **automated Priority Overrides** and **Two-Tier Escalation** directly to the Dean of Student Affairs.

---

## 2. Product Personas & Role-Based Workflows

The solution provides an interactive role switcher allowing immediate evaluation across three core stakeholder tiers:

### A. Student Persona (e.g., Rahul Sharma — USN: 1MS22CS084)
- **Guided Filing:** Category-to-Department mapping prevents misdirected tickets.
- **Transparent Status Tracking:** Live SLA timers, status badges, and chronological audit feeds.
- **Clarification Loop:** When staff request information, the student can respond and attach documents, automatically resuming the paused SLA.
- **Dispute Redressal & CSAT:** Ability to reopen tickets within a 48-hour window with justification, or rate satisfaction (1–5 stars) to finalize ticket closure.

### B. Department Staff / Officer Persona (e.g., Priya Nair — Accounts, Anita Desai — Exam Cell)
- **Workload Queues:** Filter by "Assigned to Me", "My Department Queue", "Breaching Soon", or "Pending Action".
- **Single-Click Ownership:** "Claim Ticket" workflow with assignment concurrency tracking.
- **Dual-Stream Communication:**
  - *Public Replies:* Directly visible to students.
  - *Internal Staff Notes:* Highlighted in amber, locked to staff eyes only, enabling back-office collaboration without confusing students.
- **Canned Responses:** Institutional response templates (bank UTR verification, police lost report criteria, bonafide counter timing).
- **Mandatory Root-Cause Categorization:** Forcing officers to pick a verified root-cause (e.g., "Payment Gateway Reversal", "RFID Scanner Lag") before marking a ticket as Resolved.

### C. Dean / Management Administrator Persona (e.g., Prof. K. R. Raman)
- **Institutional Visibility Dashboard:**
  - Live SLA Compliance Rate (% tickets resolved within SLA).
  - Average Resolution Time (ART in hours).
  - Ageing Distribution Matrix (`<24h`, `24–48h`, `48–72h`, `>72h`).
  - Department Workload & Bottleneck Heatmap.
- **Executive Intervention Console:** Dedicated queue of Level 1 (SLA breach) and Level 2 (Dean escalation) tickets with instant reassignment authority.
- **Audit Compliance Export:** One-click CSV export with full ticket metadata for management review.

---

## 3. Core Architectural Decisions & Domain Model

### 3.1 Domain Model Structure
- **Ticket Entity:**
  ```typescript
  interface Ticket {
    id: string;
    ticketNumber: string;        // Human-readable format: TKT-2026-1042
    title: string;
    description: string;
    category: TicketCategory;    // FEES, ATTENDANCE, EXAM, ID_CARD, etc.
    subcategory: string;
    priority: Priority;          // CRITICAL, HIGH, MEDIUM, LOW
    status: TicketStatus;        // OPEN, IN_PROGRESS, PENDING_STUDENT_ACTION, RESOLVED, CLOSED, REOPENED
    department: Department;      // ACCOUNTS, ACADEMIC_REGISTRAR, EXAM_CELL, etc.
    
    // Student Details
    studentId: string;
    studentName: string;
    studentUsn: string;
    studentDepartment: string;
    studentSemester: number;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // SLA & Ageing Engine
    slaResponseHours: number;
    slaResolutionHours: number;
    slaDeadline: string;         // ISO timestamp calculated from priority
    slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'PAUSED';
    slaPausedAt?: string;        // Tracks when paused
    totalPausedMinutes: number;  // Cumulative paused duration

    // Escalation & Resolution
    escalationLevel: 'NONE' | 'LEVEL_1_BREACH' | 'LEVEL_2_EXECUTIVE';
    escalationReason?: string;
    resolutionSummary?: string;
    rootCauseCategory?: string;
    feedbackRating?: number;     // 1 to 5 Stars
  }
  ```

- **Activity / Event Stream (Immutable Audit Log):**
  Every action (`STATUS_CHANGED`, `ASSIGNED`, `PRIORITY_CHANGED`, `ESCALATED`, `PUBLIC_REPLY`, `INTERNAL_NOTE`, `RESOLVED`, `REOPENED`, `RATED`) generates an immutable record capturing:
  `{ id, ticketId, timestamp, actorId, actorName, actorRole, type, message, previousValue, newValue }`.

---

## 4. SLA & Ageing Engine Design

### Priority & SLA Matrix:
| Priority | First Response SLA | Resolution SLA | Typical Scenario |
|---|---|---|---|
| **CRITICAL** | 4 Hours | 18 Hours | Exam hall ticket withheld, payment failure during exam freeze |
| **HIGH** | 8 Hours | 36 Hours | Medical leave condonation, hostel electrical faults |
| **MEDIUM** | 24 Hours | 72 Hours | CIE internal marks entry dispute, lost smart ID card |
| **LOW** | 48 Hours | 120 Hours | Bonafide certificate, library overdue fine dispute |

### Dynamic Pausing & Resumption Algorithm:
$$\text{Effective Deadline} = \text{Initial Deadline} + (\text{Cumulative Paused Minutes} \times 60 \times 1000)$$

1. When a ticket enters `PENDING_STUDENT_ACTION`, the countdown stops, `slaPausedAt` is recorded, and status displays `SLA Paused`.
2. When the student replies or uploads a file, the system calculates $\Delta t = \text{now} - \text{slaPausedAt}$, adds this to `totalPausedMinutes`, clears `slaPausedAt`, and returns status to `IN_PROGRESS`.
3. If remaining time $\le 25\%$ of total SLA, the ticket enters `WARNING` status.
4. If remaining time $\le 0$, the ticket enters `BREACHED` status and auto-flags for `LEVEL_1_BREACH` escalation.

---

## 5. Critical Edge Cases & Failure Scenarios Handled

1. **Student Response Delay / Stall:**
   - *Risk:* Staff metrics get penalized if a student takes weeks to upload a police report.
   - *Mitigation:* The `PENDING_STUDENT_ACTION` state freezes the SLA timer while tracking total paused minutes.
2. **Reopening War & Infinite Loops:**
   - *Risk:* A student repeatedly reopening resolved tickets without valid grounds.
   - *Mitigation:* Reopening is restricted to within 48 hours post-resolution, requires a mandatory justification field, and automatically triggers an executive review flag (`LEVEL_1_BREACH`).
3. **Simultaneous Assignment / Race Conditions:**
   - *Risk:* Two officers claim the same urgent ticket simultaneously.
   - *Mitigation:* Strict single-assignee state model with real-time activity log tracking prior assignee to ensure clear ownership.
4. **Premature Closing without Institutional Learning:**
   - *Risk:* Staff closing tickets without explaining what was done.
   - *Mitigation:* Marking as `RESOLVED` enforces selecting a categorized **Root Cause** (e.g. "Payment Gateway Reversal", "RFID Scanner Lag") and a student-facing **Resolution Summary**.
5. **Staff Internal Note Leakage:**
   - *Risk:* Sensitive internal deliberations accidentally exposed to students.
   - *Mitigation:* Strict role-based filtering in the activity stream view. Internal notes are completely omitted from the student's DOM.

---

## 6. Architectural Trade-offs

| Decision | Chosen Approach | Alternative Considered | Rationale |
|---|---|---|---|
| **Client-Side State with LocalStorage** | Reactive React Context + LocalStorage persistence with Instant Reset | Full Backend REST API with Express/Postgres | Allows instant zero-setup evaluation by interviewers without spinning up local database containers, while maintaining complete state persistence across browser reloads. |
| **SLA Computation** | Hybrid Dynamic Computation (on render + 30s background ticker) | Cron worker writing to DB | Eliminates drift when the application is idle and ensures real-time countdown updates without server cron infrastructure. |
| **Role-Switching Design** | Contextual Switcher Dropdown | Multi-tenant auth login wall | Lets the interviewer test Student, Staff, and Dean perspectives in under 30 seconds without logging out and back in. |
