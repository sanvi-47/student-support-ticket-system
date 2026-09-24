import type { Priority, Ticket, TicketStatus } from '../types';

export const SLA_CONFIG: Record<Priority, { responseHours: number; resolutionHours: number }> = {
  CRITICAL: { responseHours: 4, resolutionHours: 18 },
  HIGH: { responseHours: 8, resolutionHours: 36 },
  MEDIUM: { responseHours: 24, resolutionHours: 72 },
  LOW: { responseHours: 48, resolutionHours: 120 },
};

export interface SlaCalculationResult {
  slaStatus: 'ON_TRACK' | 'WARNING' | 'BREACHED' | 'PAUSED';
  remainingMinutes: number;
  percentageElapsed: number;
  isBreached: boolean;
  formattedRemaining: string;
}

export function computeSlaDeadline(createdAt: string, priority: Priority): string {
  const created = new Date(createdAt).getTime();
  const resolutionHours = SLA_CONFIG[priority].resolutionHours;
  const deadline = new Date(created + resolutionHours * 60 * 60 * 1000);
  return deadline.toISOString();
}

export function calculateSla(ticket: Ticket): SlaCalculationResult {
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    const resolvedTime = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : new Date().getTime();
    const deadlineTime = new Date(ticket.slaDeadline).getTime() + (ticket.totalPausedMinutes * 60 * 1000);
    const wasBreached = resolvedTime > deadlineTime;
    return {
      slaStatus: wasBreached ? 'BREACHED' : 'ON_TRACK',
      remainingMinutes: 0,
      percentageElapsed: 100,
      isBreached: wasBreached,
      formattedRemaining: wasBreached ? 'Breached before resolution' : 'Resolved within SLA',
    };
  }

  if (ticket.status === 'PENDING_STUDENT_ACTION') {
    return {
      slaStatus: 'PAUSED',
      remainingMinutes: 0,
      percentageElapsed: 0,
      isBreached: false,
      formattedRemaining: 'SLA Paused (Awaiting Student Action)',
    };
  }

  const now = Date.now();
  const created = new Date(ticket.createdAt).getTime();
  const totalAllocatedMinutes = SLA_CONFIG[ticket.priority].resolutionHours * 60;
  
  // Account for previously paused minutes
  const effectiveDeadline = new Date(ticket.slaDeadline).getTime() + (ticket.totalPausedMinutes * 60 * 1000);
  const remainingMinutes = Math.floor((effectiveDeadline - now) / (60 * 1000));
  
  const elapsedMinutes = Math.floor((now - created) / (60 * 1000)) - ticket.totalPausedMinutes;
  const percentageElapsed = Math.min(100, Math.max(0, Math.floor((elapsedMinutes / totalAllocatedMinutes) * 100)));

  if (remainingMinutes <= 0) {
    const overdueMinutes = Math.abs(remainingMinutes);
    const hours = Math.floor(overdueMinutes / 60);
    const mins = overdueMinutes % 60;
    return {
      slaStatus: 'BREACHED',
      remainingMinutes,
      percentageElapsed: 100,
      isBreached: true,
      formattedRemaining: `Overdue by ${hours > 0 ? `${hours}h ` : ''}${mins}m`,
    };
  }

  // Warning when less than 25% of SLA remaining
  const isWarning = remainingMinutes <= totalAllocatedMinutes * 0.25;
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  return {
    slaStatus: isWarning ? 'WARNING' : 'ON_TRACK',
    remainingMinutes,
    percentageElapsed,
    isBreached: false,
    formattedRemaining: `${hours > 0 ? `${hours}h ` : ''}${mins}m remaining`,
  };
}

export function getAgeingBracket(createdAt: string): '<24h' | '24-48h' | '48-72h' | '>72h' {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours < 24) return '<24h';
  if (ageHours < 48) return '24-48h';
  if (ageHours < 72) return '48-72h';
  return '>72h';
}

export function formatTimeAgo(isoDate: string): string {
  const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function getStatusBadgeColor(status: TicketStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'PENDING_STUDENT_ACTION':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'RESOLVED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'CLOSED':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'REOPENED':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function getPriorityBadgeColor(priority: Priority): string {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border-orange-300';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'LOW':
      return 'bg-slate-50 text-slate-600 border-slate-300';
  }
}
