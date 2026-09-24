import React, { useMemo } from 'react';
import { useTicketContext } from '../context/TicketContext';
import type {
  Priority,
  TicketStatus,
  Department,
  TicketFilter,
} from '../types';
import {
  calculateSla,
  getAgeingBracket,
  getPriorityBadgeColor,
  getStatusBadgeColor,
  formatTimeAgo,
} from '../utils/slaCalculator';
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  User as UserIcon,
  CheckCircle2,
  PauseCircle,
  Flame,
  Building2,
  Tag,
  Paperclip,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface TicketListProps {
  onSelectTicket: (ticketId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ onSelectTicket }) => {
  const { tickets, currentUser, filters, setFilters, resetFilters } = useTicketContext();

  // Quick Queue Filters
  const activeQueue = useMemo(() => {
    if (filters.assignedToMe) return 'assigned';
    if (filters.slaStatus === 'BREACHED' || filters.slaStatus === 'WARNING') return 'breaching';
    if (filters.status === 'PENDING_STUDENT_ACTION') return 'pending';
    if (filters.escalatedOnly) return 'escalated';
    return 'all';
  }, [filters]);

  const setQuickQueue = (queue: 'all' | 'assigned' | 'breaching' | 'pending' | 'escalated') => {
    switch (queue) {
      case 'all':
        setFilters((prev) => ({
          ...prev,
          assignedToMe: false,
          slaStatus: 'ALL',
          status: 'ALL',
          escalatedOnly: false,
        }));
        break;
      case 'assigned':
        setFilters((prev) => ({
          ...prev,
          assignedToMe: true,
          slaStatus: 'ALL',
          status: 'ALL',
          escalatedOnly: false,
        }));
        break;
      case 'breaching':
        setFilters((prev) => ({
          ...prev,
          assignedToMe: false,
          slaStatus: 'BREACHED',
          status: 'ALL',
          escalatedOnly: false,
        }));
        break;
      case 'pending':
        setFilters((prev) => ({
          ...prev,
          assignedToMe: false,
          slaStatus: 'ALL',
          status: 'PENDING_STUDENT_ACTION',
          escalatedOnly: false,
        }));
        break;
      case 'escalated':
        setFilters((prev) => ({
          ...prev,
          assignedToMe: false,
          slaStatus: 'ALL',
          status: 'ALL',
          escalatedOnly: true,
        }));
        break;
    }
  };

  // Filtered & Sorted Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Role-specific scoping: If student, show either their own tickets or all if searching
      if (currentUser.role === 'STUDENT' && filters.assignedToMe) {
        if (t.studentId !== currentUser.id && t.studentEmail !== currentUser.email) return false;
      }

      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matches =
          t.ticketNumber.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.studentName.toLowerCase().includes(query) ||
          t.studentUsn.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Quick filter assigned to me
      if (filters.assignedToMe && currentUser.role !== 'STUDENT') {
        if (t.assignedToId !== currentUser.id) return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'ALL' && t.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'ALL' && t.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'ALL' && t.category !== filters.category) {
        return false;
      }

      // Department filter
      if (filters.department && filters.department !== 'ALL' && t.department !== filters.department) {
        return false;
      }

      // SLA Status filter
      if (filters.slaStatus && filters.slaStatus !== 'ALL') {
        const sla = calculateSla(t);
        if (filters.slaStatus === 'BREACHED' && !sla.isBreached && sla.slaStatus !== 'WARNING') return false;
        if (filters.slaStatus !== 'BREACHED' && sla.slaStatus !== filters.slaStatus) return false;
      }

      // Escalated only
      if (filters.escalatedOnly && t.escalationLevel === 'NONE') {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'priority') {
        const weight: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return filters.sortOrder === 'asc'
          ? weight[a.priority] - weight[b.priority]
          : weight[b.priority] - weight[a.priority];
      }
      if (filters.sortBy === 'slaDeadline') {
        return filters.sortOrder === 'asc'
          ? new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime()
          : new Date(b.slaDeadline).getTime() - new Date(a.slaDeadline).getTime();
      }
      return filters.sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets, filters, currentUser]);

  // Counts for pills
  const counts = useMemo(() => {
    const assignedCount = currentUser.role === 'STUDENT'
      ? tickets.filter((t) => t.studentId === currentUser.id).length
      : tickets.filter((t) => t.assignedToId === currentUser.id).length;

    const breachingCount = tickets.filter((t) => {
      const calc = calculateSla(t);
      return calc.isBreached || calc.slaStatus === 'WARNING';
    }).length;

    const pendingCount = tickets.filter((t) => t.status === 'PENDING_STUDENT_ACTION').length;
    const escalatedCount = tickets.filter((t) => t.escalationLevel !== 'NONE').length;

    return { all: tickets.length, assigned: assignedCount, breaching: breachingCount, pending: pendingCount, escalated: escalatedCount };
  }, [tickets, currentUser]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Quick Queues */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setQuickQueue('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeQueue === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>All Tickets</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-700/20 text-current">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setQuickQueue('assigned')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeQueue === 'assigned'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>{currentUser.role === 'STUDENT' ? 'My Raised Tickets' : 'Assigned to Me'}</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-indigo-500/20 text-current">
            {counts.assigned}
          </span>
        </button>

        <button
          onClick={() => setQuickQueue('breaching')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeQueue === 'breaching'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>SLA Breached / Warning</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-rose-500/20 text-current">
            {counts.breaching}
          </span>
        </button>

        <button
          onClick={() => setQuickQueue('pending')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeQueue === 'pending'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <PauseCircle className="w-3.5 h-3.5" />
          <span>Pending Student Action (SLA Paused)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-purple-500/20 text-current">
            {counts.pending}
          </span>
        </button>

        <button
          onClick={() => setQuickQueue('escalated')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeQueue === 'escalated'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Escalated to Management</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-amber-500/20 text-current">
            {counts.escalated}
          </span>
        </button>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket # (e.g. 1042), title, USN, student name..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sort:</span>
            <select
              value={`${filters.sortBy}_${filters.sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('_');
                setFilters((prev) => ({
                  ...prev,
                  sortBy: by as TicketFilter['sortBy'],
                  sortOrder: order as 'asc' | 'desc',
                }));
              }}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="slaDeadline_asc">SLA Urgency (Earliest Deadline)</option>
              <option value="priority_desc">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value as TicketStatus | 'ALL' }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_STUDENT_ACTION">Pending Student Action</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={filters.priority || 'ALL'}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value as Priority | 'ALL' }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">🔴 Critical (18h SLA)</option>
              <option value="HIGH">🟠 High (36h SLA)</option>
              <option value="MEDIUM">🟡 Medium (72h SLA)</option>
              <option value="LOW">⚪ Low (120h SLA)</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={filters.department || 'ALL'}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, department: e.target.value as Department | 'ALL' }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Departments</option>
              <option value="ACCOUNTS">Accounts / Finance</option>
              <option value="ACADEMIC_REGISTRAR">Academic Registrar</option>
              <option value="EXAMINATION_CELL">Examination Cell</option>
              <option value="STUDENT_AFFAIRS">Student Affairs / Dean</option>
              <option value="HOSTEL_ADMIN">Hostel Administration</option>
              <option value="LIBRARY">Central Library</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              SLA State
            </label>
            <select
              value={filters.slaStatus || 'ALL'}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  slaStatus: e.target.value as TicketFilter['slaStatus'],
                }))
              }
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            >
              <option value="ALL">All SLA States</option>
              <option value="ON_TRACK">On Track</option>
              <option value="WARNING">Warning (&lt;25% SLA)</option>
              <option value="BREACHED">Breached SLA</option>
              <option value="PAUSED">Paused (Awaiting Student)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Items */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No tickets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No tickets match your active filter criteria. Try adjusting the search term or clearing filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTickets.map((ticket) => {
            const sla = calculateSla(ticket);
            const ageing = getAgeingBracket(ticket.createdAt);

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-md hover:border-indigo-300 relative group ${
                  sla.isBreached
                    ? 'border-rose-300 bg-rose-50/20'
                    : ticket.escalationLevel !== 'NONE'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row: Ticket #, Badges, Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {ticket.ticketNumber}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.replace(/_/g, ' ')}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadgeColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>

                    {/* Escalation Tag */}
                    {ticket.escalationLevel !== 'NONE' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                        <Flame className="w-3 h-3 text-rose-600" />
                        {ticket.escalationLevel === 'LEVEL_2_EXECUTIVE' ? 'Dean Oversight (L2)' : 'Breached (L1)'}
                      </span>
                    )}

                    {/* Category */}
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {ticket.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Ageing & Created At */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        ageing === '>72h'
                          ? 'bg-rose-100 text-rose-700'
                          : ageing === '48-72h'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      title="Ticket Ageing Bracket"
                    >
                      Age: {ageing}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(ticket.createdAt)}</span>
                  </div>
                </div>

                {/* Ticket Title */}
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
                  {ticket.title}
                </h4>

                {/* Snippet */}
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {ticket.description}
                </p>

                {/* Footer Info: Student, Assignee, SLA Timer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
                  {/* Left: Student & Department */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {ticket.studentName.charAt(0)}
                      </div>
                      <span>{ticket.studentName}</span>
                      <span className="text-slate-400">({ticket.studentUsn})</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ticket.department.replace(/_/g, ' ')}</span>
                    </div>

                    {ticket.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Paperclip className="w-3 h-3 text-slate-400" />
                        <span>{ticket.attachments.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Right: Assignee & SLA Status */}
                  <div className="flex items-center gap-3">
                    {/* Assignee */}
                    <div className="flex items-center gap-1.5">
                      {ticket.assignedToName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{ticket.assignedToName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span>Unassigned</span>
                        </span>
                      )}
                    </div>

                    {/* SLA Status Pill */}
                    <div
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        sla.isBreached
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : sla.slaStatus === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : sla.slaStatus === 'PAUSED'
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {sla.isBreached ? (
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                      ) : sla.slaStatus === 'PAUSED' ? (
                        <PauseCircle className="w-3.5 h-3.5 text-purple-600" />
                      ) : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                      <span>{sla.formattedRemaining}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
