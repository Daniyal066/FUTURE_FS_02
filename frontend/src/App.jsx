import React, { useState } from 'react';
import { LeadProvider, useLeads } from './context/LeadContext';
import Sidebar from './components/Sidebar';
import Overview from './views/Overview';
import LeadsManager from './views/LeadsManager';
import LeadIntakePortal from './views/LeadIntakePortal';
import FollowUpLogs from './views/FollowUpLogs';

const VIEW_META = {
  dashboard:    { label: 'Dashboard',            sub: 'Pipeline metrics and conversion overview' },
  leads:        { label: 'Leads Directory',       sub: 'Search, filter and manage your CRM records' },
  'add-lead':   { label: 'Client Registration',   sub: 'Intake new prospect leads into the pipeline' },
  'follow-ups': { label: 'Interaction Timeline',  sub: 'Chronological record of all follow-up notes' },
};

function MainLayout() {
  const { leads, loading, error, toast, getLeadsList } = useLeads();
  const [activeView, setActiveView] = useState('dashboard');
  const [viewKey,    setViewKey]    = useState(0);

  const navigateTo = (view) => {
    setActiveView(view);
    setViewKey(k => k + 1);
  };

  const renderView = () => {
    switch (activeView) {
      case 'leads':       return <LeadsManager />;
      case 'add-lead':    return <LeadIntakePortal />;
      case 'follow-ups':  return <FollowUpLogs />;
      default:            return <Overview />;
    }
  };

  const meta = VIEW_META[activeView] || VIEW_META.dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Dark Navy Sidebar ── */}
      <Sidebar activeView={activeView} setActiveView={navigateTo} leads={leads} loading={loading} />

      {/* ── Light Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">

        {/* ── Sticky White Header ── */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-40">

          {/* Breadcrumb + Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 select-none">AetherCRM</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-slate-300 flex-shrink-0">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-slate-800 truncate">{meta.label}</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* DB Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-500 select-none">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${loading ? 'bg-amber-400' : error ? 'bg-red-400' : 'bg-emerald-500'}`} />
              {loading ? 'Syncing' : error ? 'Offline' : 'Connected'}
            </div>

            {/* Lead Count */}
            {!loading && leads.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] font-semibold text-blue-600 select-none">
                {leads.length} leads
              </div>
            )}

            {/* Refresh */}
            <button
              id="refresh-matrix-btn"
              onClick={getLeadsList}
              disabled={loading}
              title="Refresh data"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors duration-150 disabled:opacity-50 select-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex-shrink-0 mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500 flex-shrink-0">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-red-700">Backend offline — running on fallback data</p>
                <p className="text-[10px] text-red-500 mt-0.5">Start the Node.js server on port 5001 to connect live.</p>
              </div>
            </div>
            <button
              onClick={getLeadsList}
              className="flex-shrink-0 px-3 py-1.5 bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 rounded-lg text-[10px] font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Scrollable View ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div key={viewKey} className="view-enter max-w-6xl">
            {renderView()}
          </div>
        </main>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`toast-enter fixed bottom-5 right-5 z-[999] flex items-center gap-3 px-4 py-3 bg-white border rounded-xl shadow-lg select-none max-w-xs ${
            toast.type === 'error' ? 'border-l-[3px] border-l-red-500 border-slate-200' : 'border-l-[3px] border-l-emerald-500 border-slate-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${toast.type === 'error' ? 'bg-red-400' : 'bg-emerald-500'}`} />
          <p className="text-sm font-medium text-slate-700">{toast.message}</p>
        </div>
      )}
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
