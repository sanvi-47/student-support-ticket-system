import React, { useState } from 'react';
import { TicketProvider, useTicketContext } from './context/TicketContext';
import { Navbar } from './components/Navbar';
import { TicketList } from './components/TicketList';
import { AnalyticsView } from './components/AnalyticsView';
import { DocumentationView } from './components/DocumentationView';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'tickets' | 'analytics' | 'docs'>('tickets');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { selectedTicketId, setSelectedTicketId } = useTicketContext();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'tickets' && (
          <TicketList onSelectTicket={(id) => setSelectedTicketId(id)} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView onSelectTicket={(id) => setSelectedTicketId(id)} />
        )}

        {currentTab === 'docs' && <DocumentationView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>Edumerge Solutions • Pre-Drive Product Engineering Submission • Candidate Assessment</p>
      </footer>

      {/* Ticket Details Modal */}
      {selectedTicketId && (
        <TicketDetailModal onClose={() => setSelectedTicketId(null)} />
      )}

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newId) => {
            setIsCreateModalOpen(false);
            setSelectedTicketId(newId);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <TicketProvider>
      <MainAppContent />
    </TicketProvider>
  );
}
