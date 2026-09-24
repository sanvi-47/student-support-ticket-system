import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  CannedResponse,
  EscalationLevel,
  Priority,
  Ticket,
  TicketActivity,
  TicketFilter,
  TicketStatus,
  User,
} from '../types';

import { CANNED_RESPONSES, INITIAL_ACTIVITIES, INITIAL_TICKETS, MOCK_USERS } from '../mockData';
import { calculateSla, computeSlaDeadline } from '../utils/slaCalculator';

interface TicketContextType {
  tickets: Ticket[];
  activities: Record<string, TicketActivity[]>;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  selectedTicket: Ticket | null;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  cannedResponses: CannedResponse[];
  filters: TicketFilter;
  setFilters: React.Dispatch<React.SetStateAction<TicketFilter>>;
  resetFilters: () => void;
  
  // Actions
  createTicket: (data: {
    title: string;
    description: string;
    category: Ticket['category'];
    subcategory: string;
    priority: Priority;
    department: Ticket['department'];
    attachments?: Ticket['attachments'];
  }) => Ticket;
  
  updateTicketStatus: (ticketId: string, newStatus: TicketStatus, note?: string) => void;
  assignTicket: (ticketId: string, staffUser: User) => void;
  changePriority: (ticketId: string, newPriority: Priority, reason?: string) => void;
  addComment: (ticketId: string, message: string, isInternal: boolean) => void;
  resolveTicket: (ticketId: string, resolutionSummary: string, rootCauseCategory: string) => void;
  reopenTicket: (ticketId: string, reason: string) => void;
  rateTicket: (ticketId: string, rating: number, comment?: string) => void;
  escalateTicket: (ticketId: string, level: EscalationLevel, reason: string) => void;
  resetToMockData: () => void;
}

const defaultFilters: TicketFilter = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
  category: 'ALL',
  department: 'ALL',
  slaStatus: 'ALL',
  assignedToMe: false,
  escalatedOnly: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_TICKETS = 'edumerge_tickets_v1';
const LOCAL_STORAGE_KEY_ACTIVITIES = 'edumerge_activities_v1';
const LOCAL_STORAGE_KEY_USER = 'edumerge_current_user_v1';

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return MOCK_USERS[0]; // Default to Student Rahul Sharma
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_TICKETS;
  });

  const [activities, setActivities] = useState<Record<string, TicketActivity[]>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_ACTIVITIES;
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilter>(defaultFilters);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  // Recalculate SLA statuses periodically or on change
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          const calc = calculateSla(t);
          if (calc.slaStatus !== t.slaStatus) {
            return { ...t, slaStatus: calc.slaStatus };
          }
          return t;
        })
      );
    }, 30000); // 30 sec check
    return () => clearInterval(timer);
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const appendActivity = (ticketId: string, activity: Omit<TicketActivity, 'id' | 'ticketId' | 'timestamp'>) => {
    const newAct: TicketActivity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketId,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newAct],
    }));
  };

  const createTicket: TicketContextType['createTicket'] = (data) => {
    const now = new Date().toISOString();
    const count = tickets.length + 1053;
    const ticketNumber = `TKT-2026-${count}`;
    const id = `tkt_${Date.now()}`;
    const deadline = computeSlaDeadline(now, data.priority);

    const newTicket: Ticket = {
      id,
      ticketNumber,
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      priority: data.priority,
      status: 'OPEN',
      department: data.department,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentUsn: currentUser.usn || '1MS22CS084',
      studentEmail: currentUser.email,
      studentPhone: currentUser.phone || '+91 98450 12345',
      studentDepartment: 'Computer Science & Engineering',
      studentSemester: 6,
      createdAt: now,
      updatedAt: now,
      slaResponseHours: data.priority === 'CRITICAL' ? 4 : data.priority === 'HIGH' ? 8 : 24,
      slaResolutionHours: data.priority === 'CRITICAL' ? 18 : data.priority === 'HIGH' ? 36 : 72,
      slaDeadline: deadline,
      slaStatus: 'ON_TRACK',
      totalPausedMinutes: 0,
      escalationLevel: 'NONE',
      attachments: data.attachments || [],
      tags: [data.category.toLowerCase().replace(/_/g, '-')],
    };

    setTickets((prev) => [newTicket, ...prev]);

    appendActivity(id, {
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      type: 'TICKET_CREATED',
      message: `Created ticket #${ticketNumber}: "${data.title}" with priority ${data.priority}.`,
    });

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, note?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const now = new Date().toISOString();
        let totalPaused = t.totalPausedMinutes;
        let pausedAt = t.slaPausedAt;

        // SLA Pause State Machine Logic
        if (newStatus === 'PENDING_STUDENT_ACTION' && t.status !== 'PENDING_STUDENT_ACTION') {
          pausedAt = now;
        } else if (t.status === 'PENDING_STUDENT_ACTION' && newStatus !== 'PENDING_STUDENT_ACTION') {
          if (t.slaPausedAt) {
            const pausedDurationMins = Math.floor(
              (new Date().getTime() - new Date(t.slaPausedAt).getTime()) / (60 * 1000)
            );
            totalPaused += Math.max(1, pausedDurationMins);
            pausedAt = undefined;
          }
        }

        const updated: Ticket = {
          ...t,
          status: newStatus,
          updatedAt: now,
          totalPausedMinutes: totalPaused,
          slaPausedAt: pausedAt,
          firstResponseAt: t.firstResponseAt || (currentUser.role !== 'STUDENT' ? now : undefined),
        };

        const calc = calculateSla(updated);
        updated.slaStatus = calc.slaStatus;

        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'STATUS_CHANGED',
          message: note || `Changed status from ${t.status} to ${newStatus}${newStatus === 'PENDING_STUDENT_ACTION' ? ' (SLA Paused)' : ''}.`,
          previousValue: t.status,
          newValue: newStatus,
        });

        return updated;
      })
    );
  };

  const assignTicket = (ticketId: string, staffUser: User) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const now = new Date().toISOString();
        const prevAssignee = t.assignedToName || 'Unassigned';

        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'ASSIGNED',
          message: `Assigned ticket to ${staffUser.name} (${staffUser.department || 'Staff'}).`,
          previousValue: prevAssignee,
          newValue: staffUser.name,
        });

        return {
          ...t,
          assignedToId: staffUser.id,
          assignedToName: staffUser.name,
          assignedToRole: staffUser.role === 'ADMIN' ? 'Dean / HOD' : 'Department Officer',
          status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
          updatedAt: now,
        };
      })
    );
  };

  const changePriority = (ticketId: string, newPriority: Priority, reason?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const now = new Date().toISOString();
        const newDeadline = computeSlaDeadline(t.createdAt, newPriority);

        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'PRIORITY_CHANGED',
          message: `Priority changed from ${t.priority} to ${newPriority}. ${reason ? `Reason: ${reason}` : ''}`,
          previousValue: t.priority,
          newValue: newPriority,
        });

        const updated: Ticket = {
          ...t,
          priority: newPriority,
          slaDeadline: newDeadline,
          updatedAt: now,
        };
        const calc = calculateSla(updated);
        updated.slaStatus = calc.slaStatus;

        return updated;
      })
    );
  };

  const addComment = (ticketId: string, message: string, isInternal: boolean) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const isStudent = currentUser.role === 'STUDENT';
    const type: TicketActivity['type'] = isInternal
      ? 'INTERNAL_NOTE'
      : isStudent
      ? 'STUDENT_REPLY'
      : 'PUBLIC_REPLY';

    appendActivity(ticketId, {
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      type,
      message,
    });

    // Auto-advance status if student replied to PENDING_STUDENT_ACTION
    if (isStudent && targetTicket.status === 'PENDING_STUDENT_ACTION') {
      updateTicketStatus(ticketId, 'IN_PROGRESS', 'Student responded with requested info. SLA resumed.');
    } else {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, updatedAt: new Date().toISOString() } : t))
      );
    }
  };

  const resolveTicket = (ticketId: string, resolutionSummary: string, rootCauseCategory: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'RESOLVED',
          message: `Ticket marked as Resolved. Root cause: [${rootCauseCategory}]. Summary: "${resolutionSummary}"`,
        });

        const updated: Ticket = {
          ...t,
          status: 'RESOLVED',
          resolvedAt: now,
          resolutionSummary,
          rootCauseCategory,
          updatedAt: now,
        };
        const calc = calculateSla(updated);
        updated.slaStatus = calc.slaStatus;
        return updated;
      })
    );
  };

  const reopenTicket = (ticketId: string, reason: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'REOPENED',
          message: `Ticket reopened by ${currentUser.name}. Reason: "${reason}"`,
          previousValue: t.status,
          newValue: 'REOPENED',
        });

        return {
          ...t,
          status: 'REOPENED',
          updatedAt: now,
          escalationLevel: t.escalationLevel === 'NONE' ? 'LEVEL_1_BREACH' : t.escalationLevel,
        };
      })
    );
  };

  const rateTicket = (ticketId: string, rating: number, comment?: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'RATED',
          message: `Student submitted feedback rating: ${rating}/5 stars. ${comment ? `"${comment}"` : ''}`,
        });

        return {
          ...t,
          feedbackRating: rating,
          feedbackComment: comment,
          status: 'CLOSED', // Auto-close on rating
          closedAt: new Date().toISOString(),
        };
      })
    );
  };

  const escalateTicket = (ticketId: string, level: EscalationLevel, reason: string) => {
    const now = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        appendActivity(ticketId, {
          actorId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          type: 'ESCALATED',
          message: `Escalated to ${level}. Reason: ${reason}`,
          previousValue: t.escalationLevel,
          newValue: level,
        });

        return {
          ...t,
          escalationLevel: level,
          escalationReason: reason,
          escalatedAt: now,
          priority: 'CRITICAL', // Escalate automatically elevates to CRITICAL
          updatedAt: now,
        };
      })
    );
  };

  const resetToMockData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_TICKETS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_ACTIVITIES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    setTickets(INITIAL_TICKETS);
    setActivities(INITIAL_ACTIVITIES);
    setCurrentUser(MOCK_USERS[0]);
    setSelectedTicketId(null);
    setFilters(defaultFilters);
  };

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        activities,
        currentUser,
        setCurrentUser,
        selectedTicket,
        selectedTicketId,
        setSelectedTicketId,
        cannedResponses: CANNED_RESPONSES,
        filters,
        setFilters,
        resetFilters,
        createTicket,
        updateTicketStatus,
        assignTicket,
        changePriority,
        addComment,
        resolveTicket,
        reopenTicket,
        rateTicket,
        escalateTicket,
        resetToMockData,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicketContext = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicketContext must be used within a TicketProvider');
  }
  return context;
};
