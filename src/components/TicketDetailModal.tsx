import React, { useState } from 'react';
import { useTicketContext } from '../context/TicketContext';
import { MOCK_USERS } from '../mockData';
import {
  calculateSla,
  getAgeingBracket,
  getPriorityBadgeColor,
  getStatusBadgeColor,
  formatTimeAgo,
} from '../utils/slaCalculator';
import type { Priority } from '../types';
import {
  X,
  Clock,
  Flame,
  CheckCircle2,
  PauseCircle,
  Lock,
  Send,
  UserCheck,
  ShieldAlert,
  Star,
  RotateCcw,
  Paperclip,
  Download,
  Building2,
  Sparkles,
} from 'lucide-react';

interface TicketDetailModalProps {
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ onClose }) => {
  const {
    selectedTicket,
    activities,
    currentUser,
    updateTicketStatus,
    assignTicket,
    changePriority,
    addComment,
    resolveTicket,
    reopenTicket,
    rateTicket,
    escalateTicket,
    cannedResponses,
  } = useTicketContext();

  const [activeTab, setActiveTab] = useState<'reply' | 'note'>('reply');
  const [messageText, setMessageText] = useState('');
  const [selectedCannedId, setSelectedCannedId] = useState('');

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rootCauseCategory, setRootCauseCategory] = useState('Configuration / Record Sync');

  // Reopen modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  // Escalation modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  // Rating state
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  if (!selectedTicket) return null;

  const ticketActivities = activities[selectedTicket.id] || [];
  const sla = calculateSla(selectedTicket);
  const ageing = getAgeingBracket(selectedTicket.createdAt);
  const isStudent = currentUser.role === 'STUDENT';
  const isAssignedToCurrentUser = selectedTicket.assignedToId === currentUser.id;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addComment(selectedTicket.id, messageText.trim(), activeTab === 'note');
    setMessageText('');
  };

  const handleApplyCanned = (cannedId: string) => {
    setSelectedCannedId(cannedId);
    const canned = cannedResponses.find((c) => c.id === cannedId);
    if (canned) {
      setMessageText((prev) => (prev ? `${prev}\n\n${canned.text}` : canned.text));
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) return;
    resolveTicket(selectedTicket.id, resolutionSummary.trim(), rootCauseCategory);
    setShowResolveModal(false);
    setResolutionSummary('');
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    reopenTicket(selectedTicket.id, reopenReason.trim());
    setShowReopenModal(false);
    setReopenReason('');
  };

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;
    escalateTicket(selectedTicket.id, 'LEVEL_2_EXECUTIVE', escalateReason.trim());
    setShowEscalateModal(false);
    setEscalateReason('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateTicket(selectedTicket.id, ratingScore, ratingComment.trim());
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              {selectedTicket.ticketNumber}
            </span>

            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(
                selectedTicket.status
              )}`}
            >
              {selectedTicket.status.replace(/_/g, ' ')}
            </span>

            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadgeColor(
                selectedTicket.priority
              )}`}
            >
              {selectedTicket.priority} Priority
            </span>

            {selectedTicket.escalationLevel !== 'NONE' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                {selectedTicket.escalationLevel === 'LEVEL_2_EXECUTIVE' ? 'Dean Escalation' : 'SLA Breached'}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content - 2 Column Split */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Ticket Details & Activity Feed */}
          <div className="lg:col-span-2 p-5 sm:p-6 space-y-6 overflow-y-auto">
            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug mb-2">
                {selectedTicket.title}
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </div>
            </div>

            {/* Attachments Section */}
            {selectedTicket.attachments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attachments ({selectedTicket.attachments.length})</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-indigo-900 font-medium hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{att.name}</span>
                      <span className="text-indigo-400 text-[10px]">({att.size})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Summary Banner (if resolved or closed) */}
            {selectedTicket.resolutionSummary && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Official Resolution Summary</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Root Cause: {selectedTicket.rootCauseCategory}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  {selectedTicket.resolutionSummary}
                </p>
              </div>
            )}

            {/* Student Feedback & CSAT */}
            {selectedTicket.feedbackRating ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">Student Feedback Rating:</span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= selectedTicket.feedbackRating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {selectedTicket.feedbackComment && (
                  <p className="text-xs text-amber-800 italic">"{selectedTicket.feedbackComment}"</p>
                )}
              </div>
            ) : (
              /* If resolved and current user is student, allow rating */
              selectedTicket.status === 'RESOLVED' && isStudent && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-900">Rate your support experience</h4>
                  </div>
                  <p className="text-xs text-indigo-700">
                    Are you satisfied with the resolution provided? Submitting a rating will close this ticket.
                  </p>
                  <form onSubmit={handleRatingSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingScore(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 transition-transform hover:scale-110 ${
                              star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-semibold text-slate-700 ml-2">
                        {ratingScore === 5 ? 'Excellent' : ratingScore === 4 ? 'Good' : 'Needs improvement'}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Optional feedback comment..."
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      Submit Rating & Close Ticket
                    </button>
                  </form>
                </div>
              )
            )}

            {/* Activity History & Conversation Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Activity History & Conversation ({ticketActivities.length})
              </h3>

              <div className="space-y-3">
                {ticketActivities.map((act) => {
                  if (act.type === 'INTERNAL_NOTE') {
                    // Internal Note: Hide from student
                    if (isStudent) return null;

                    return (
                      <div
                        key={act.id}
                        className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Internal Staff Note — {act.actorName}</span>
                          </div>
                          <span className="text-amber-700/80 text-[11px]">{formatTimeAgo(act.timestamp)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-950 font-mono whitespace-pre-wrap">
                          {act.message}
                        </p>
                      </div>
                    );
                  }

                  if (act.type === 'PUBLIC_REPLY' || act.type === 'STUDENT_REPLY') {
                    const isActorStudent = act.actorRole === 'STUDENT';
                    return (
                      <div
                        key={act.id}
                        className={`rounded-2xl p-4 space-y-1.5 border ${
                          isActorStudent
                            ? 'bg-blue-50/50 border-blue-200 ml-0 sm:mr-10'
                            : 'bg-emerald-50/50 border-emerald-200 mr-0 sm:ml-10'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${
                                isActorStudent ? 'bg-blue-600' : 'bg-emerald-600'
                              }`}
                            >
                              {act.actorName.charAt(0)}
                            </div>
                            <span>
                              {act.actorName} ({isActorStudent ? 'Student' : 'Staff'})
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">{formatTimeAgo(act.timestamp)}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {act.message}
                        </p>
                      </div>
                    );
                  }

                  // System / Audit events
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-2.5 py-1 px-3 text-xs text-slate-500 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-slate-700">{act.actorName}</strong>: {act.message}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatTimeAgo(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Composer (Replies & Internal Notes) */}
            {selectedTicket.status !== 'CLOSED' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                {/* Tabs: Public Reply vs Internal Note (Internal Note disabled for Student) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reply')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTab === 'reply' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Public Reply {isStudent ? 'to Staff' : 'to Student'}
                    </button>
                    {!isStudent && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('note')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                          activeTab === 'note'
                            ? 'bg-amber-100 text-amber-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Internal Note (Staff Only)</span>
                      </button>
                    )}
                  </div>

                  {/* Canned Responses Shortcut (Staff Only) */}
                  {!isStudent && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedCannedId}
                        onChange={(e) => handleApplyCanned(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">⚡ Insert Canned Template...</option>
                        {cannedResponses.map((cr) => (
                          <option key={cr.id} value={cr.id}>
                            {cr.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder={
                      activeTab === 'note'
                        ? 'Write internal notes visible only to department colleagues...'
                        : isStudent
                        ? 'Type your response or clarification for support staff...'
                        : 'Type your official message to the student...'
                    }
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      {activeTab === 'note'
                        ? '⚠️ Internal notes are logged in the audit trail but hidden from students.'
                        : 'Students receive notification of replies.'}
                    </p>
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
                        activeTab === 'note'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{activeTab === 'note' ? 'Save Note' : 'Send Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Workflows, SLA, Student Details */}
          <div className="p-5 sm:p-6 bg-slate-50/50 space-y-6 overflow-y-auto">
            {/* Quick Actions & Status Workflow */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Ticket Workflow & Actions
              </h3>

              <div className="space-y-2">
                {/* Take Ownership / Assign Button */}
                {!isStudent && !isAssignedToCurrentUser && (
                  <button
                    onClick={() => assignTicket(selectedTicket.id, currentUser)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Claim Ticket (Assign to Me)</span>
                  </button>
                )}

                {/* State Machine Transition Buttons */}
                {!isStudent && selectedTicket.status === 'OPEN' && (
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Start Working (Mark In Progress)
                  </button>
                )}

                {!isStudent && selectedTicket.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() =>
                      updateTicketStatus(
                        selectedTicket.id,
                        'PENDING_STUDENT_ACTION',
                        'Requested student clarification. SLA timer paused.'
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold hover:bg-purple-100 transition-colors"
                  >
                    <PauseCircle className="w-4 h-4 text-purple-600" />
                    <span>Request Info (Pause SLA)</span>
                  </button>
                )}

                {!isStudent && selectedTicket.status === 'PENDING_STUDENT_ACTION' && (
                  <button
                    onClick={() =>
                      updateTicketStatus(
                        selectedTicket.id,
                        'IN_PROGRESS',
                        'Resumed processing ticket. SLA timer resumed.'
                      )
                    }
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Resume SLA (Mark In Progress)
                  </button>
                )}

                {!isStudent && selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                )}

                {/* Reopen Workflow for Student */}
                {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                  <button
                    onClick={() => setShowReopenModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Reopen Ticket (Issue Unresolved)</span>
                  </button>
                )}

                {/* Escalate to Level 2 Dean */}
                {selectedTicket.escalationLevel === 'NONE' && selectedTicket.status !== 'CLOSED' && (
                  <button
                    onClick={() => setShowEscalateModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                  >
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>Escalate to Dean / L2 Oversight</span>
                  </button>
                )}
              </div>
            </div>

            {/* SLA Engine Metrics Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>SLA & Ageing Engine</span>
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    sla.isBreached
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : sla.slaStatus === 'PAUSED'
                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {sla.slaStatus}
                </span>
              </div>

              {/* SLA Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>SLA Time Elapsed</span>
                  <span>{sla.percentageElapsed}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      sla.isBreached
                        ? 'bg-rose-500'
                        : sla.slaStatus === 'WARNING'
                        ? 'bg-amber-500'
                        : sla.slaStatus === 'PAUSED'
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${sla.percentageElapsed}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs space-y-1.5 pt-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Resolution:</span>
                  <span className="font-semibold">{selectedTicket.slaResolutionHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Clock:</span>
                  <span className="font-semibold text-slate-800">{sla.formattedRemaining}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total SLA Paused:</span>
                  <span className="font-semibold">{selectedTicket.totalPausedMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ageing Bracket:</span>
                  <span className="font-semibold text-indigo-600">{ageing}</span>
                </div>
              </div>
            </div>

            {/* Assignment & Metadata */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Assignment & Details
              </h4>

              <div className="space-y-2">
                <div>
                  <span className="block text-[11px] text-slate-400 mb-0.5">Assigned Officer</span>
                  {!isStudent ? (
                    <select
                      value={selectedTicket.assignedToId || ''}
                      onChange={(e) => {
                        const user = MOCK_USERS.find((u) => u.id === e.target.value);
                        if (user) assignTicket(selectedTicket.id, user);
                      }}
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Unassigned</option>
                      {MOCK_USERS.filter((u) => u.role !== 'STUDENT').map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.department || 'Admin'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-700">
                      {selectedTicket.assignedToName || 'Unassigned (In Triage Queue)'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-0.5">Department</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {selectedTicket.department.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] text-slate-400 mb-0.5">Priority</span>
                  {!isStudent ? (
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) =>
                        changePriority(selectedTicket.id, e.target.value as Priority, 'Staff reassessment')
                      }
                      className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CRITICAL">🔴 Critical (18h SLA)</option>
                      <option value="HIGH">🟠 High (36h SLA)</option>
                      <option value="MEDIUM">🟡 Medium (72h SLA)</option>
                      <option value="LOW">⚪ Low (120h SLA)</option>
                    </select>
                  ) : (
                    <span className="font-semibold text-slate-700">{selectedTicket.priority}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Student Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Student Information
              </h4>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  {selectedTicket.studentName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedTicket.studentName}</div>
                  <div className="text-[11px] text-indigo-600 font-mono font-medium">
                    USN: {selectedTicket.studentUsn}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600">
                <p>
                  <span className="text-slate-400">Department:</span> {selectedTicket.studentDepartment}
                </p>
                <p>
                  <span className="text-slate-400">Semester:</span> Semester {selectedTicket.studentSemester}
                </p>
                <p>
                  <span className="text-slate-400">Email:</span> {selectedTicket.studentEmail}
                </p>
                <p>
                  <span className="text-slate-400">Phone:</span> {selectedTicket.studentPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Mark Ticket as Resolved</span>
              </h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Root Cause Category (For Audit & Analytics)
                </label>
                <select
                  value={rootCauseCategory}
                  onChange={(e) => setRootCauseCategory(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value="Configuration / Record Sync">Configuration / Record Sync</option>
                  <option value="Payment Gateway Reversal">Payment Gateway Reversal</option>
                  <option value="Document Generated & Issued">Document Generated & Issued</option>
                  <option value="Hardware / RFID Log Correction">Hardware / RFID Log Correction</option>
                  <option value="Attendance Medical Condonation Approved">Attendance Medical Condonation Approved</option>
                  <option value="Student Input Error">Student Input Error</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Explanation (Visible to Student)
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Detail the action taken and how the student can verify resolution..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REOPEN MODAL */}
      {showReopenModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <span>Reopen Ticket</span>
              </h3>
              <button onClick={() => setShowReopenModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReopenSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Reopening (Why is the issue still unresolved?)
                </label>
                <textarea
                  required
                  rows={4}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Please state what remains incomplete or what new proof has been attached..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Escalate to Dean / L2 Oversight</span>
              </h3>
              <button
                onClick={() => setShowEscalateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Escalating flags this ticket for Dean of Student Affairs intervention and elevates its priority to CRITICAL.
            </p>
            <form onSubmit={handleEscalateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Justification for Escalation
                </label>
                <textarea
                  required
                  rows={4}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="e.g. Exam tomorrow morning and hall ticket locked, repeated SLA breach..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
