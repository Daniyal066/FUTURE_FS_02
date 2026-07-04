import React from 'react';
import LeadDashboard from '../components/LeadDashboard';
import { useLeads } from '../context/LeadContext';

export default function LeadsManager() {
  const { leads, showToast } = useLeads();

  const handleExport = () => {
    if (leads.length === 0) {
      showToast('No leads available to export.', 'error');
      return;
    }
    // Bulk export placeholder toast
    showToast(`Bulk export triggered: compiling ${leads.length} leads to CSV...`);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner and Export Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 select-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Leads Directory</h2>
          <p className="text-xs text-slate-400">Perform updates, log interactions, filter, search, and manage leads</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white px-4 py-2.5 rounded-xl border border-slate-805 hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-2 self-start sm:self-center active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV (Bulk)
        </button>
      </div>

      {/* Main Dashboard Table Component */}
      <div className="w-full">
        <LeadDashboard />
      </div>
    </div>
  );
}
