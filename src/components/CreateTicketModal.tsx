import React, { useState } from 'react';
import { useTicketContext } from '../context/TicketContext';
import type { Department, Priority, TicketCategory } from '../types';
import { X, PlusCircle, Paperclip, AlertCircle, Sparkles, Building2, Check } from 'lucide-react';

interface CreateTicketModalProps {
  onClose: () => void;
  onSuccess: (ticketId: string) => void;
}

const CATEGORY_MAP: Record<TicketCategory, { defaultDept: Department; subcategories: string[]; defaultPriority: Priority }> = {
  FEES_AND_PAYMENTS: {
    defaultDept: 'ACCOUNTS',
    subcategories: ['Online Payment Discrepancy', 'Fee Concession / Scholarship', 'Chalan Verification', 'Refund / Excess Payment'],
    defaultPriority: 'HIGH',
  },
  ATTENDANCE_AND_LEAVE: {
    defaultDept: 'STUDENT_AFFAIRS',
    subcategories: ['Medical Condonation', 'Sports / Cultural On-Duty (OD)', 'Internal Marks / CIE Discrepancy', 'Semester Attendance Shortage'],
    defaultPriority: 'HIGH',
  },
  EXAM_AND_HALL_TICKET: {
    defaultDept: 'EXAMINATION_CELL',
    subcategories: ['Hall Ticket Block', 'Timetable Clashing', 'Revaluation Request', 'Duplicate Grade Card'],
    defaultPriority: 'CRITICAL',
  },
  ID_CARD_AND_ACCESS: {
    defaultDept: 'STUDENT_AFFAIRS',
    subcategories: ['Replacement ID Card (Lost/Damaged)', 'Campus Gate RFID Access', 'Library Barcode Sync'],
    defaultPriority: 'MEDIUM',
  },
  CERTIFICATES_AND_DOCS: {
    defaultDept: 'ACADEMIC_REGISTRAR',
    subcategories: ['Bonafide Certificate', 'Transcript / WES Verification', 'Medium of Instruction Certificate', 'Provisional Degree Certificate'],
    defaultPriority: 'LOW',
  },
  HOSTEL_AND_CAMPUS: {
    defaultDept: 'HOSTEL_ADMIN',
    subcategories: ['Room Maintenance & Repairs', 'Mess & Food Quality', 'Hostel Wi-Fi Network', 'Room Allocation / Transfer'],
    defaultPriority: 'HIGH',
  },
  GENERAL_ADMIN: {
    defaultDept: 'LIBRARY',
    subcategories: ['Library Fine Reversal', 'Bus Pass / Transportation', 'Address / Contact Details Update', 'General Query'],
    defaultPriority: 'LOW',
  },
};

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose, onSuccess }) => {
  const { createTicket, currentUser } = useTicketContext();

  const [category, setCategory] = useState<TicketCategory>('FEES_AND_PAYMENTS');
  const [subcategory, setSubcategory] = useState(CATEGORY_MAP.FEES_AND_PAYMENTS.subcategories[0]);
  const [department, setDepartment] = useState<Department>(CATEGORY_MAP.FEES_AND_PAYMENTS.defaultDept);
  const [priority, setPriority] = useState<Priority>(CATEGORY_MAP.FEES_AND_PAYMENTS.defaultPriority);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mockFiles, setMockFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  const handleCategoryChange = (newCat: TicketCategory) => {
    setCategory(newCat);
    const meta = CATEGORY_MAP[newCat];
    setSubcategory(meta.subcategories[0]);
    setDepartment(meta.defaultDept);
    setPriority(meta.defaultPriority);
  };

  const handleAddSampleAttachment = () => {
    const samples = [
      { name: 'Fee_Payment_Receipt.pdf', size: '420 KB', type: 'application/pdf' },
      { name: 'Medical_Certificate_Endorsed.pdf', size: '1.2 MB', type: 'application/pdf' },
      { name: 'Campus_Security_Lost_Report.pdf', size: '680 KB', type: 'application/pdf' },
    ];
    const pick = samples[mockFiles.length % samples.length];
    setMockFiles([...mockFiles, pick]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newTicket = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory,
      priority,
      department,
      attachments: mockFiles,
    });

    onSuccess(newTicket.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Raise Support Ticket</h2>
              <p className="text-xs text-slate-500">Student Helpdesk & Grievance Redressal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Student Info preview */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Raising request as: </span>
              <strong className="text-indigo-950 font-bold">{currentUser.name}</strong>
              <span className="text-indigo-600 font-mono ml-1.5">
                ({currentUser.usn || currentUser.department || 'User'})
              </span>
            </div>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Verified
            </span>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as TicketCategory)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="FEES_AND_PAYMENTS">Fees & Online Payments</option>
                <option value="ATTENDANCE_AND_LEAVE">Attendance, OD & Medical Leave</option>
                <option value="EXAM_AND_HALL_TICKET">Exam Cell & Hall Tickets</option>
                <option value="ID_CARD_AND_ACCESS">ID Card & Campus RFID Access</option>
                <option value="CERTIFICATES_AND_DOCS">Certificates, Bonafide & Transcripts</option>
                <option value="HOSTEL_AND_CAMPUS">Hostel, Mess & Infrastructure</option>
                <option value="GENERAL_ADMIN">Library & General Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                {CATEGORY_MAP[category].subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Department</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="ACCOUNTS">Accounts / Finance Office</option>
                <option value="ACADEMIC_REGISTRAR">Academic Registrar Office</option>
                <option value="EXAMINATION_CELL">Examination & Evaluation Cell</option>
                <option value="STUDENT_AFFAIRS">Student Affairs / Dean Office</option>
                <option value="HOSTEL_ADMIN">Hostel Warden & Maintenance</option>
                <option value="LIBRARY">Central Library Desk</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="CRITICAL">🔴 Critical (18 Hours Resolution SLA)</option>
                <option value="HIGH">🟠 High (36 Hours Resolution SLA)</option>
                <option value="MEDIUM">🟡 Medium (72 Hours Resolution SLA)</option>
                <option value="LOW">⚪ Low (120 Hours Resolution SLA)</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject / Brief Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fee installment receipt not generated after UPI payment debit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Explanation *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details such as transaction references, dates, course codes, or problem description to help staff resolve quickly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Supporting Documents / Evidence</span>
              </label>
              <button
                type="button"
                onClick={handleAddSampleAttachment}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Attach Sample Document</span>
              </button>
            </div>

            {mockFiles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mockFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-700"
                  >
                    <span>{f.name}</span>
                    <span className="text-[10px] text-slate-400">({f.size})</span>
                    <button
                      type="button"
                      onClick={() => setMockFiles(mockFiles.filter((_, idx) => idx !== i))}
                      className="ml-1 text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={handleAddSampleAttachment}
                className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center text-xs text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Click to attach transaction slips, medical certificates, or FIR receipts (PDF, PNG, JPG up to 5MB)
              </div>
            )}
          </div>

          {/* Notice Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Institutional SLA Commitment:</strong> Your request will be assigned to a department officer within working hours. You will receive real-time notifications when the officer replies or takes action.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !description.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 transition-all"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
