import React, { useState } from 'react';
import { LeadProvider, useLeads } from './context/LeadContext';
import Sidebar from './components/Sidebar';
import Overview from './views/Overview';
import LeadsManager from './views/LeadsManager';
import LeadIntakePortal from './views/LeadIntakePortal';
import FollowUpLogs from './views/FollowUpLogs';

function MainLayout() {
  const { leads, loading, error, toast, getLeadsList } = useLeads();
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'leads':
        return <LeadsManager />;
      case 'add-lead':
        return <LeadIntakePortal />;
      case 'follow-ups':
        return <FollowUpLogs />;
      case 'dashboard':
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[10rem] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[10rem] pointer-events-none -z-10" />

      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} leads={leads} />

      {/* View Container */}
      <div className="flex-grow flex flex-col min-h-screen max-w-[calc(100vw-16rem)]">
        {/* Header (Top navigation bar) */}
        <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 select-none">
          <div className="mx-auto px-6 lg:px-8 py-4.5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">AetherCRM Panel</span>
              <h1 className="text-sm font-semibold text-slate-400 mt-0.5">
                Workspace / {activeView.replace('-', ' ').toUpperCase()}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={getLeadsList}
                disabled={loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition-all active:scale-95 flex items-center gap-2 text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Refresh Matrix</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Toast Notification */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-[999] p-4 rounded-xl border shadow-2xl flex items-center gap-2.5 transition-all duration-300 animate-slide-up ${
            toast.type === 'error'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
          }`}>
            {toast.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* View Layout Workspace */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-450 flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 flex-shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-bold text-sm">Server Offline Warning</h4>
                  <p className="text-xs text-rose-400/80 mt-0.5">Please ensure the node.js/express backend server is running on port 5001.</p>
                </div>
              </div>
              <button onClick={getLeadsList} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/30 text-rose-350 hover:text-white rounded-xl text-xs font-bold transition-all">
                Retry Connection
              </button>
            </div>
          )}

          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LeadProvider>
      <MainLayout />
    </LeadProvider>
  );
}
