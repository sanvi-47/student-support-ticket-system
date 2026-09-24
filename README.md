# Edumerge Solutions — Student Support & SLA Intelligence System

**Pre-Drive Product Engineering Assignment — Assignment 4**  
*Campus Desk: Institutional Grievance Redressal, Dynamic SLA Pausing, Ageing Analysis & Executive Oversight*

---

## 🌟 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)

### Installation & Launch in 30 Seconds

```bash
# 1. Navigate to the project directory
cd C:\Users\sanvi\.gemini\antigravity\scratch\student-support-system

# 2. Dependencies are already installed! If running on a new machine:
npm install

# 3. Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173`** to interact with the live application.

---

## 🚀 Key Highlights & Architectural Features

### 1. Multi-Role Perspective Switcher
Easily switch between three real-world higher-ed personas from the top navigation bar without logging in or out:
- **Student (Rahul Sharma - USN: 1MS22CS084):** Raise requests, upload documents, track SLA countdown, reply to staff queries, reopen resolved tickets, and rate satisfaction (CSAT).
- **Staff / Department Officer (Priya Nair / Dr. Suresh Babu / Anita Desai):** Filter by department queue, claim tickets ("Assign to Me"), post private internal notes (locked from student eyes), utilize canned responses, and resolve tickets with required root-cause categorization.
- **Executive Administrator / Dean (Prof. K. R. Raman):** View institutional SLA compliance rates, average resolution time, ticket ageing distribution (`<24h`, `24–48h`, `48–72h`, `>72h`), and manage escalated Level 1 & Level 2 tickets.

### 2. State-Driven SLA Pause Engine
Unlike generic ticketing systems that unfairly penalize support officers while waiting for student document uploads, this system features a **state-driven SLA pause clock**:
- Entering `PENDING_STUDENT_ACTION` immediately freezes the resolution SLA.
- Records cumulative `totalPausedMinutes`.
- Resuming work (`IN_PROGRESS` or student reply) automatically recalculates the effective deadline.

### 3. Chronological Audit Trail & Security Boundary
- Every status shift, priority bump, assignment change, public comment, and internal note is logged with an immutable timestamp and actor badge.
- Internal staff notes are strictly omitted from the student's view to protect operational deliberations.

### 4. Executive Management Visibility & Compliance Export
- **Ageing Distribution Matrix:** Segmenting active backlogs into `<24h`, `24-48h`, `48-72h`, and `>72h` critical danger zones.
- **Department Workload Matrix:** Identifies operational bottlenecks across Accounts, Academic Registrar, Examination Cell, Student Affairs, Hostel, and Library.
- **One-Click Audit CSV Export:** Export complete historical ticket data with timestamps, SLA status, and resolution summaries.

---

## 📁 Repository Structure

```
student-support-system/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Role switcher, tabs, notifications & reset
│   │   ├── TicketList.tsx         # Filterable queue with live SLA pills & ageing
│   │   ├── TicketDetailModal.tsx  # Full audit trail, dual-stream notes, workflows
│   │   ├── CreateTicketModal.tsx  # Guided ticket creation with category mappings
│   │   ├── AnalyticsView.tsx      # Management visibility, ageing matrix & CSV export
│   │   └── DocumentationView.tsx  # In-app Approach Note & AI Usage Report
│   ├── context/
│   │   └── TicketContext.tsx      # State management, LocalStorage, event stream
│   ├── utils/
│   │   └── slaCalculator.ts       # Dynamic SLA timers, ageing brackets & formatters
│   ├── mockData.ts                # Realistic pre-seeded institutional dataset
│   ├── types.ts                   # TypeScript domain models
│   ├── App.tsx                    # Main layout coordinator
│   └── main.tsx                   # Vite React root
├── APPROACH_AND_TRADE_OFFS.md     # Detailed approach note, design decisions & trade-offs
├── MANDATORY_AI_USAGE_REPORT.md   # Completed AI usage report following the brief
├── package.json
└── vite.config.ts
```

---

## 📑 Assessment Documents Included

1. [APPROACH_AND_TRADE_OFFS.md](file:///C:/Users/sanvi/.gemini/antigravity/scratch/student-support-system/APPROACH_AND_TRADE_OFFS.md): Full breakdown of problem understanding, domain modeling, SLA algorithm, edge cases, and trade-offs.
2. [MANDATORY_AI_USAGE_REPORT.md](file:///C:/Users/sanvi/.gemini/antigravity/scratch/student-support-system/MANDATORY_AI_USAGE_REPORT.md): Required report detailing prompts, generated code, modifications made, and flawed AI output identified and corrected.
3. **In-App Reading View:** Evaluators can also click the **"Approach & AI Report"** tab inside the web application to read all documentation in an interactive UI.
