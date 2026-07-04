import React from 'react';
import { useLeads } from '../context/LeadContext';

export default function Overview() {
  const { leads, loading } = useLeads();

  // Compute CRM Stats
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Compute Source distribution
  const sourceDistribution = leads.reduce((acc, lead) => {
    const src = lead.source || 'Website Contact Form';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  // Get recent 4 leads
  const recentLeads = [...leads].slice(0, 4);

  // Get recent activity note additions
  const recentNotes = [];
  leads.forEach(lead => {
    lead.notes.forEach(note => {
      recentNotes.push({
        leadId: lead._id,
        leadName: lead.name,
        body: note.body,
        createdAt: new Date(note.createdAt)
      });
    });
  });
  // Sort notes by date descending
  recentNotes.sort((a, b) => b.createdAt - a.createdAt);
  const topRecentNotes = recentNotes.slice(0, 4);

  const statCards = [
    {
      label: 'Total Leads',
      value: loading ? '...' : totalLeads,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      label: 'Contacted Leads',
      value: loading ? '...' : contactedLeads,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.102-5.122-3.4-6.22-6.22l1.293-.97a1.242 1.242 0 00.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      label: 'Converted Clients',
      value: loading ? '...' : convertedLeads,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      label: 'Win Rate (%)',
      value: loading ? '...' : `${conversionRate}%`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      ),
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Performance Dashboard</h2>
        <p className="text-xs text-slate-400">Overview of client conversion metrics and pipeline volume</p>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="glow-card bg-slate-900/60 backdrop-blur-xl border border-slate-800/85 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <span className="text-2xl lg:text-3xl font-bold text-slate-100 mt-1 block">{card.value}</span>
            </div>
            <div className={`p-3 rounded-xl border ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Grid Sub-Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-1.5 3h1.5m-7.5-6h7.5m-7.5 3h7.5m-7.5 3h7.5M3 5.25h18v13.5H3V5.25z" />
            </svg>
            Recent System Activity
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm">Synchronizing logs...</div>
          ) : topRecentNotes.length === 0 && recentLeads.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No activity recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {topRecentNotes.map((note, idx) => (
                <div key={`n-${idx}`} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-start gap-3 text-xs">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <p className="text-slate-300">
                      Added update note to <span className="font-semibold text-slate-200">{note.leadName}</span>
                    </p>
                    <p className="text-slate-400 mt-1 italic font-medium">"{note.body}"</p>
                    <span className="block text-[10px] text-slate-550 mt-1.5 font-bold">
                      {note.createdAt.toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}

              {recentLeads.map((lead, idx) => (
                <div key={`l-${idx}`} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-center font-bold text-slate-400">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">{lead.name}</p>
                      <p className="text-slate-400 text-[10px]">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] bg-slate-800 text-slate-450 px-2 py-0.5 rounded border border-slate-750">
                      {lead.source}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      lead.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Source and status Pipeline Metrics */}
        <div className="space-y-6">
          {/* Status distribution */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              Pipeline Status
            </h3>

            <div className="space-y-3.5">
              {[
                { name: 'new', count: newLeads, pct: totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0, color: 'bg-indigo-500' },
                { name: 'contacted', count: contactedLeads, pct: totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0, color: 'bg-amber-500' },
                { name: 'converted', count: convertedLeads, pct: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0, color: 'bg-emerald-500' }
              ].map((pipe) => (
                <div key={pipe.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-slate-350">{pipe.name}</span>
                    <span className="text-slate-450">{pipe.count} ({Math.round(pipe.pct)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${pipe.color} rounded-full`} style={{ width: `${pipe.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sources summary list */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              Lead Origin Channels
            </h3>

            {totalLeads === 0 ? (
              <div className="text-center text-slate-500 text-xs py-4">No channels active.</div>
            ) : (
              <div className="divide-y divide-slate-800/40 max-h-40 overflow-y-auto pr-1">
                {Object.entries(sourceDistribution).map(([source, count]) => (
                  <div key={source} className="flex justify-between py-2 text-xs">
                    <span className="text-slate-350">{source}</span>
                    <span className="font-bold text-slate-200">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
