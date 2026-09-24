export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export type TicketCategory =
  | 'FEES_AND_PAYMENTS'
  | 'ATTENDANCE_AND_LEAVE'
  | 'EXAM_AND_HALL_TICKET'
  | 'ID_CARD_AND_ACCESS'
  | 'CERTIFICATES_AND_DOCS'
  | 'HOSTEL_AND_CAMPUS'
  | 'GENERAL_ADMIN';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_STUDENT_ACTION'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type EscalationLevel = 'NONE' | 'LEVEL_1_BREACH' | 'LEVEL_2_EXECUTIVE';

export type Department =
  | 'ACCOUNTS'
  | 'ACADEMIC_REGISTRAR'
  | 'EXAMINATION_CELL'
  | 'STUDENT_AFFAIRS'
  | 'HOSTEL_ADMIN'
  | 'LIBRARY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: Department;
  avatar: string;
  usn?: string; // University Seat Number (for students)
  phone?: string;
}

export type ActivityType =
  | 'TICKET_CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'PRIORITY_CHANGED'
  | 'ESCALATED'
  | 'PUBLIC_REPLY'
  | 'INTERNAL_NOTE'
  | 'DOC_ATTACHED'
  | 'STUDENT_REPLY'
  | 'RESOLVED'
  | 'REOPENED'
  | 'RATED';

export interface TicketActivity {
  id: string;
  ticketId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role | 'SYSTEM';
  type: ActivityType;
  message: string;
  previousValue?: string;
  newValue?: string;
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. TKT-2026-1042
  title: string;
  description: string;
  category: TicketCategory;
  subcategory: string;
  priority: Priority;
  status: TicketStatus;
  department: Department;
  
  // Student Details
  studentId: string;
  studentName: string;
  studentUsn: string;
  studentEmail: string;
  studentPhone: string;
  studentDepartment: string;
  studentSemester: number;

  // Assignment Details
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;

  // SLA & Ageing Engine
  slaResponseHours: number;
  slaResolutionHours: number;
  slaDeadline: string; // ISO string
  slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'PAUSED';
  slaPausedAt?: string;
  totalPausedMinutes: number;

  // Escalation
  escalationLevel: EscalationLevel;
  escalationReason?: string;
  escalatedAt?: string;

  // Resolution & Feedback
  resolutionSummary?: string;
  rootCauseCategory?: string;
  feedbackRating?: number; // 1 to 5
  feedbackComment?: string;

  attachments: Attachment[];
  tags: string[];
}

export interface CannedResponse {
  id: string;
  title: string;
  category: TicketCategory;
  text: string;
}

export interface TicketFilter {
  search: string;
  status?: TicketStatus | 'ALL';
  priority?: Priority | 'ALL';
  category?: TicketCategory | 'ALL';
  department?: Department | 'ALL';
  slaStatus?: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'PAUSED' | 'ALL';
  assignedToMe?: boolean;
  escalatedOnly?: boolean;
  sortBy: 'createdAt' | 'slaDeadline' | 'priority' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}
