import React from 'react';
import { LeadProvider, useLeads } from './context/LeadContext';
import LeadForm from './components/LeadForm';
import LeadDashboard from './components/LeadDashboard';

function MainLayout() {
  const { leads, loading, error, toast, getLeadsList } = useLeads();

  // Compute CRM Stats
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[10rem] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[10rem] pointer-events-none -z-10" />

      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[999] p-4 rounded-xl border shadow-2xl flex items-center gap-2.5 transition-all duration-300 ${
          toast.type === 'error'
            ? 'bg-rose-500/10 text-rose-450 border-rose-500/25'
            : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25'
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

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/35">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5.5 h-5.5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent m-0 select-none">
                AetherCRM
              </h1>
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase mt-0.5">
                Enterprise Client & Lead Engine
              </p>
            </div>
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

      {/* Main Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Connection Offline Alert */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-450 flex items-center justify-between gap-4 animate-bounce">
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

        {/* Stats Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glow-card bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-100 mt- block">
                {loading && leads.length === 0 ? '...' : totalLeads}
              </span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>

          <div className="glow-card bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacted</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1 block">
                {loading && leads.length === 0 ? '...' : contactedLeads}
              </span>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.102-5.122-3.4-6.22-6.22l1.293-.97a1.242 1.242 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
          </div>

          <div className="glow-card bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Converted</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1 block">
                {loading && leads.length === 0 ? '...' : convertedLeads}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>

          <div className="glow-card bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Rate</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1 block">
                {loading && leads.length === 0 ? '...' : `${conversionRate}%`}
              </span>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Form & Table Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <LeadForm />
          </div>
          <div className="lg:col-span-2">
            <LeadDashboard />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/40 text-center py-6 mt-12 text-xs text-slate-500 font-medium">
        <p>&copy; {new Date().getFullYear()} AetherCRM Engine. Designed for Future Intern Evaluation.</p>
      </footer>
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
