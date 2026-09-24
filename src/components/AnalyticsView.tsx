import React, { useMemo } from 'react';
import { useTicketContext } from '../context/TicketContext';
import { calculateSla, getAgeingBracket } from '../utils/slaCalculator';
import type { Department, TicketCategory } from '../types';
import {
  BarChart3,
  Clock,
  Flame,
  TrendingUp,
  Download,
  Building2,
  PieChart,
  ShieldAlert,
  ChevronRight,
  Star,
} from 'lucide-react';

interface AnalyticsViewProps {
  onSelectTicket: (ticketId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onSelectTicket }) => {
  const { tickets } = useTicketContext();

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tickets.length;
    const resolvedOrClosed = tickets.filter(
      (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
    );
    const active = tickets.filter(
      (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'REOPENED'
    );
    const pendingStudent = tickets.filter((t) => t.status === 'PENDING_STUDENT_ACTION');

    let totalResolutionHours = 0;
    let resolvedCountWithTime = 0;

    resolvedOrClosed.forEach((t) => {
      if (t.resolvedAt) {
        const hours =
          (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) /
          (1000 * 60 * 60);
        totalResolutionHours += Math.max(1, hours);
        resolvedCountWithTime += 1;
      }
    });

    const avgResolutionTimeHours =
      resolvedCountWithTime > 0
        ? (totalResolutionHours / resolvedCountWithTime).toFixed(1)
        : '24.5';

    // SLA compliance
    const breached = tickets.filter((t) => {
      const calc = calculateSla(t);
      return calc.isBreached;
    });

    const slaComplianceRate =
      total > 0 ? (((total - breached.length) / total) * 100).toFixed(1) : '100';

    // CSAT
    const ratedTickets = tickets.filter((t) => t.feedbackRating);
    const totalStars = ratedTickets.reduce((acc, t) => acc + (t.feedbackRating || 0), 0);
    const avgCsat =
      ratedTickets.length > 0 ? (totalStars / ratedTickets.length).toFixed(1) : '4.8';

    // Ageing analysis
    const ageingCounts = {
      '<24h': 0,
      '24-48h': 0,
      '48-72h': 0,
      '>72h': 0,
    };

    active.forEach((t) => {
      const bracket = getAgeingBracket(t.createdAt);
      ageingCounts[bracket] += 1;
    });

    // Department breakdown
    const deptMap: Record<Department, { total: number; active: number; breached: number }> = {
      ACCOUNTS: { total: 0, active: 0, breached: 0 },
      ACADEMIC_REGISTRAR: { total: 0, active: 0, breached: 0 },
      EXAMINATION_CELL: { total: 0, active: 0, breached: 0 },
      STUDENT_AFFAIRS: { total: 0, active: 0, breached: 0 },
      HOSTEL_ADMIN: { total: 0, active: 0, breached: 0 },
      LIBRARY: { total: 0, active: 0, breached: 0 },
    };

    tickets.forEach((t) => {
      if (deptMap[t.department]) {
        deptMap[t.department].total += 1;
        if (t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'REOPENED') {
          deptMap[t.department].active += 1;
        }
        const calc = calculateSla(t);
        if (calc.isBreached) {
          deptMap[t.department].breached += 1;
        }
      }
    });

    // Category breakdown
    const categoryMap: Partial<Record<TicketCategory, number>> = {};
    tickets.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    });

    const escalatedTickets = tickets.filter((t) => t.escalationLevel !== 'NONE');

    return {
      total,
      activeCount: active.length,
      resolvedCount: resolvedOrClosed.length,
      pendingStudentCount: pendingStudent.length,
      avgResolutionTimeHours,
      slaComplianceRate,
      breachedCount: breached.length,
      avgCsat,
      csatCount: ratedTickets.length,
      ageingCounts,
      deptMap,
      categoryMap,
      escalatedTickets,
    };
  }, [tickets]);

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = [
      'Ticket Number',
      'Title',
      'Category',
      'Department',
      'Priority',
      'Status',
      'Student Name',
      'Student USN',
      'Assigned To',
      'Created At',
      'SLA Status',
      'Escalation Level',
    ];

    const rows = tickets.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.department,
      t.priority,
      t.status,
      `"${t.studentName}"`,
      t.studentUsn,
      `"${t.assignedToName || 'Unassigned'}"`,
      t.createdAt,
      t.slaStatus,
      t.escalationLevel,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Edumerge_Support_Tickets_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Campus Administrative Visibility & SLA Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance monitoring, bottleneck diagnosis, and student satisfaction metrics
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors w-fit"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Raised */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Tickets
          </span>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Campus lifetime</span>
        </div>

        {/* Active Backlog */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Backlog
          </span>
          <div className="text-2xl font-black text-indigo-600">{metrics.activeCount}</div>
          <span className="text-[11px] text-indigo-500 mt-1 block">Open / In Progress</span>
        </div>

        {/* SLA Compliance % */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            SLA Compliance
          </span>
          <div className="text-2xl font-black text-emerald-600">{metrics.slaComplianceRate}%</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Target &gt;90%
          </span>
        </div>

        {/* Breached SLA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            SLA Breaches
          </span>
          <div className="text-2xl font-black text-rose-600">{metrics.breachedCount}</div>
          <span className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
            <Flame className="w-3 h-3" /> Urgent action
          </span>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Resolution
          </span>
          <div className="text-2xl font-black text-slate-900">{metrics.avgResolutionTimeHours}h</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Institutional ART</span>
        </div>

        {/* Student CSAT */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Student CSAT
          </span>
          <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
            <span>{metrics.avgCsat}</span>
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">From {metrics.csatCount} reviews</span>
        </div>
      </div>

      {/* Middle Row: Ticket Ageing Matrix & Escalation Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Ageing Matrix */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Ticket Ageing Distribution (Active Backlog)</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {metrics.activeCount} active
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Tickets categorized by total elapsed time since creation. Tracks operational stagnation before SLA threshold breaches.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* <24h */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                &lt; 24 Hours
              </span>
              <div className="text-2xl font-black text-emerald-800">
                {metrics.ageingCounts['<24h']}
              </div>
              <span className="text-[10px] text-emerald-600 mt-1 block">Fresh / Healthy</span>
            </div>

            {/* 24-48h */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                24 – 48 Hours
              </span>
              <div className="text-2xl font-black text-blue-800">
                {metrics.ageingCounts['24-48h']}
              </div>
              <span className="text-[10px] text-blue-600 mt-1 block">Standard Window</span>
            </div>

            {/* 48-72h */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                48 – 72 Hours
              </span>
              <div className="text-2xl font-black text-amber-800">
                {metrics.ageingCounts['48-72h']}
              </div>
              <span className="text-[10px] text-amber-600 mt-1 block">Approaching Cap</span>
            </div>

            {/* >72h */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                &gt; 72 Hours
              </span>
              <div className="text-2xl font-black text-rose-800">
                {metrics.ageingCounts['>72h']}
              </div>
              <span className="text-[10px] text-rose-600 font-bold mt-1 block">Critical Ageing</span>
            </div>
          </div>

          {/* Ageing Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            {metrics.activeCount > 0 ? (
              <>
                <div
                  style={{ width: `${(metrics.ageingCounts['<24h'] / metrics.activeCount) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`<24h: ${metrics.ageingCounts['<24h']}`}
                />
                <div
                  style={{ width: `${(metrics.ageingCounts['24-48h'] / metrics.activeCount) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title={`24-48h: ${metrics.ageingCounts['24-48h']}`}
                />
                <div
                  style={{ width: `${(metrics.ageingCounts['48-72h'] / metrics.activeCount) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`48-72h: ${metrics.ageingCounts['48-72h']}`}
                />
                <div
                  style={{ width: `${(metrics.ageingCounts['>72h'] / metrics.activeCount) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`>72h: ${metrics.ageingCounts['>72h']}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-200 h-full"></div>
            )}
          </div>
        </div>

        {/* Executive Escalation Console */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Escalated Cases (Dean / L2 Attention)</span>
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
              {metrics.escalatedTickets.length} Escalated
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Tickets flagged for executive review due to SLA breach or critical urgency (e.g. Exam hall ticket locks).
          </p>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {metrics.escalatedTickets.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No tickets currently escalated. Operations are running within tolerance.
              </div>
            ) : (
              metrics.escalatedTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="p-3 bg-rose-50/40 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-rose-50 cursor-pointer transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-rose-800">
                        {t.ticketNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-200 text-rose-900">
                        {t.priority}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {t.department.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 line-clamp-1">{t.title}</h5>
                    <p className="text-[11px] text-rose-700 italic line-clamp-1">
                      Reason: {t.escalationReason || 'Automatic SLA breach escalation'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Department Performance Matrix & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Workload & Breaches */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Department Workload & SLA Compliance Table</span>
            </h3>
            <span className="text-xs text-slate-400">Institutional Departments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Total Received</th>
                  <th className="py-2.5 px-3 text-center">Active Queue</th>
                  <th className="py-2.5 px-3 text-center">SLA Breaches</th>
                  <th className="py-2.5 px-3 text-right">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(Object.keys(metrics.deptMap) as Department[]).map((dept) => {
                  const data = metrics.deptMap[dept];
                  const hasBreach = data.breached > 0;
                  return (
                    <tr key={dept} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {dept.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600">{data.total}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold">
                          {data.active}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hasBreach ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                            {data.breached}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {hasBreach ? (
                          <span className="text-rose-600 font-semibold">Attention Needed</span>
                        ) : data.active > 0 ? (
                          <span className="text-emerald-600 font-semibold">Optimal</span>
                        ) : (
                          <span className="text-slate-400">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Category Distribution */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Grievance Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">By Domain</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(metrics.categoryMap).map(([cat, count]) => {
              const pct = metrics.total > 0 ? Math.round(((count as number) / metrics.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
