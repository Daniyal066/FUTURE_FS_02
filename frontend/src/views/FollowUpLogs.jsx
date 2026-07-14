import React, { useMemo } from 'react';
import { useLeads } from '../context/LeadContext';

function isToday(d) {
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function isYesterday(d) {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
}
function formatRelative(date) {
  const diff  = Date.now() - date;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 2)  return 'Yesterday';
  if (days  < 7)  return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function groupLabel(key) {
  const d = new Date(Number(key));
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/* Status dot */
function StatusPill({ status }) {
  const styles = {
    new:       { background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569' },
    contacted: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
    converted: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' },
  };
  const s = styles[status] || styles.new;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={s}>
      {status}
    </span>
  );
}

export default function FollowUpLogs() {
  const { leads, loading } = useLeads();

  const allNotes = useMemo(() => {
    const events = [];
    leads.forEach(lead => {
      (lead.notes || []).forEach(note => {
        events.push({
          leadId: lead._id, leadName: lead.name, leadEmail: lead.email,
          leadStatus: lead.status, body: note.body,
          date: new Date(note.timestamp || note.createdAt),
        });
      });
    });
    return events.sort((a, b) => b.date - a.date);
  }, [leads]);

  const groupedByDay = useMemo(() => {
    const groups = {};
    allNotes.forEach(note => {
      const key = String(new Date(note.date.getFullYear(), note.date.getMonth(), note.date.getDate()).getTime());
      if (!groups[key]) groups[key] = [];
      groups[key].push(note);
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, [allNotes]);

  const totalClients = useMemo(() => new Set(allNotes.map(n => n.leadId)).size, [allNotes]);
  const lastActivity = allNotes.length > 0 ? allNotes[0].date : null;

  const statCards = [
    { label: 'Total Notes',    value: allNotes.length,                                         valueClass: 'text-slate-900' },
    { label: 'Active Clients', value: totalClients,                                             valueClass: 'text-slate-900' },
    { label: 'Last Activity',  value: lastActivity ? formatRelative(lastActivity) : 'No data', valueClass: 'text-slate-900' },
  ];

  return (
    <div className="space-y-5 pb-6">

      {/* ── Page Header ── */}
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900">Interaction Timeline</h2>
        <p className="text-sm text-slate-500 mt-0.5">Chronological record of all client follow-up notes.</p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '40ms' }}>
        {statCards.map(stat => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200 rounded-xl p-4"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className={`text-2xl font-bold leading-none ${stat.valueClass} ${loading ? 'opacity-0' : ''}`}>
              {loading ? '—' : stat.value}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Timeline Card ── */}
      <div
        className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-fade-in"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: '80ms' }}
      >
        {/* Card Header */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Chronological Note Feed</h3>
          {allNotes.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {allNotes.length} entries
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-5 space-y-5">
            {[1, 2].map(g => (
              <div key={g} className="space-y-2.5">
                <div className="skeleton h-4 w-32 rounded" />
                {[1, 2].map(n => <div key={n} className="skeleton h-16 rounded-lg" />)}
              </div>
            ))}
          </div>
        ) : groupedByDay.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-600">No Interaction Notes Yet</h4>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">Notes added in the Leads Directory will appear here chronologically.</p>
          </div>
        ) : (
          /* Timeline */
          <div className="p-5 relative">
            {/* Vertical line */}
            <div
              className="absolute top-10 bottom-10 w-px bg-slate-200"
              style={{ left: '33px' }}
            />

            <div className="space-y-8">
              {groupedByDay.map(([key, notes], groupIdx) => (
                <div key={key} className="animate-fade-in" style={{ animationDelay: `${groupIdx * 50}ms` }}>

                  {/* Date Header Node */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 z-10"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">{groupLabel(key)}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{notes.length} interaction{notes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="pl-12 space-y-2.5">
                    {notes.map((note, ni) => (
                      <div
                        key={ni}
                        className="relative p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all duration-150 animate-fade-in"
                        style={{ animationDelay: `${(groupIdx * 50) + (ni * 30)}ms` }}
                      >
                        {/* Connector dot */}
                        <div
                          className="absolute w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-300"
                          style={{ left: '-33px', top: '18px' }}
                        />

                        {/* Header row */}
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-[10px] text-blue-600 flex-shrink-0">
                              {note.leadName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs font-semibold text-slate-700 truncate">{note.leadName}</span>
                            <StatusPill status={note.leadStatus} />
                            <span className="text-[10px] text-slate-400 truncate hidden sm:block">{note.leadEmail}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">
                            {note.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Body */}
                        <p className="text-sm text-slate-600 leading-relaxed">{note.body}</p>

                        {/* Relative time */}
                        <p className="text-[10px] text-slate-400 mt-2">{formatRelative(note.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
