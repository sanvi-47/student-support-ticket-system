import React from 'react';
import { useTicketContext } from '../context/TicketContext';
import { MOCK_USERS } from '../mockData';
import {
  LifeBuoy,
  PlusCircle,
  RotateCcw,
  BarChart3,
  ListTodo,
  FileText,
  GraduationCap,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'tickets' | 'analytics' | 'docs';
  setCurrentTab: (tab: 'tickets' | 'analytics' | 'docs') => void;
  openCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openCreateModal,
}) => {
  const { currentUser, setCurrentUser, tickets, resetToMockData } = useTicketContext();

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'REOPENED'
  ).length;

  const breachedCount = tickets.filter((t) => t.slaStatus === 'BREACHED').length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <LifeBuoy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Edumerge</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Campus Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Student Support & SLA Management</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrentTab('tickets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'tickets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <span>Tickets Queue</span>
              {openTicketsCount > 0 && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Executive Dashboard</span>
              {breachedCount > 0 && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold border border-rose-200">
                  {breachedCount} breached
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('docs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'docs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Approach & AI Report</span>
            </button>
          </nav>

          {/* Right Action Bar: Role Switcher & New Ticket Button */}
          <div className="flex items-center gap-3">
            {/* Persona Switcher Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <div className="flex items-center gap-1.5">
                {currentUser.role === 'STUDENT' ? (
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                ) : currentUser.role === 'ADMIN' ? (
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                ) : (
                  <Briefcase className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Role:</span>
              </div>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const user = MOCK_USERS.find((u) => u.id === e.target.value);
                  if (user) setCurrentUser(user);
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                title="Switch active user persona to view role-based features"
              >
                {MOCK_USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role === 'STUDENT' ? `Student - ${user.usn}` : user.role === 'ADMIN' ? 'Dean' : user.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (confirm('Reset tickets and activities to default pre-seeded dataset?')) {
                  resetToMockData();
                }
              }}
              title="Reset state to initial mock data"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Create Ticket Primary CTA */}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Raise Ticket</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-slate-200 py-2 gap-1 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('tickets')}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'tickets' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Tickets ({openTicketsCount})
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Executive Analytics
          </button>
          <button
            onClick={() => setCurrentTab('docs')}
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${
              currentTab === 'docs' ? 'bg-indigo-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Approach & AI Report
          </button>
        </div>
      </div>
    </header>
  );
};
