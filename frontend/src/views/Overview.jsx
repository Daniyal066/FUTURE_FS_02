import React, { useMemo } from 'react';
import { useLeads } from '../context/LeadContext';

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

function ProgressBar({ pct, color }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
      <div className="h-full rounded-full progress-bar" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* KPI card — white, crisp border, subtle shadow */
function KPICard({ label, value, sub, loading, delay }) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 animate-fade-in"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: delay }}
    >
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-slate-900 leading-none">
        {loading ? <span className="skeleton inline-block w-14 h-8 rounded" /> : value}
      </p>
      <p className="text-[11px] text-slate-400 mt-2">{sub}</p>
    </div>
  );
}

export default function Overview() {
  const { leads, loading } = useLeads();

  const stats = useMemo(() => {
    const total     = leads.length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const newLeads  = leads.filter(l => l.status === 'new').length;
    const winRate   = total > 0 ? Math.round((converted / total) * 100) : 0;
    return { total, contacted, converted, newLeads, winRate };
  }, [leads]);

  const sourceDistribution = useMemo(() =>
    leads.reduce((acc, lead) => {
      const src = lead.source || 'Website Contact Form';
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {}),
  [leads]);

  const recentActivity = useMemo(() => {
    const events = [];
    leads.forEach(lead => {
      (lead.notes || []).forEach(note => {
        events.push({ type: 'note', leadName: lead.name, leadStatus: lead.status, body: note.body, date: new Date(note.timestamp || note.createdAt) });
      });
      events.push({ type: 'lead', leadName: lead.name, leadStatus: lead.status, source: lead.source, email: lead.email, date: new Date(lead.createdAt) });
    });
    return events.sort((a, b) => b.date - a.date).slice(0, 7);
  }, [leads]);

  const kpiCards = [
    { label: 'Total Leads',      value: stats.total,           sub: 'All time',          delay: '0ms'   },
    { label: 'Contacted',        value: stats.contacted,        sub: 'In progress',       delay: '50ms'  },
    { label: 'Converted Clients',value: stats.converted,        sub: 'Closed won',        delay: '100ms' },
    { label: 'Win Rate',         value: `${stats.winRate}%`,    sub: 'Conversion ratio',  delay: '150ms' },
  ];

  const pipelineRows = [
    { name: 'New',       count: stats.newLeads,  pct: stats.total > 0 ? (stats.newLeads  / stats.total) * 100 : 0, color: '#6366F1' },
    { name: 'Contacted', count: stats.contacted, pct: stats.total > 0 ? (stats.contacted / stats.total) * 100 : 0, color: '#F59E0B' },
    { name: 'Converted', count: stats.converted, pct: stats.total > 0 ? (stats.converted / stats.total) * 100 : 0, color: '#10B981' },
  ];

  return (
    <div className="space-y-5 pb-6">

      {/* ── Title ── */}
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Pipeline metrics and conversion overview.</p>
      </div>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={i} loading={loading} {...card} />
        ))}
      </section>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Recent Activity ── */}
        <div
          className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden animate-fade-in"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: '80ms' }}
        >
          <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">Live</span>
          </div>

          <div>
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="skeleton h-11 rounded-lg" />)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors duration-100 animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0">
                      {(event.leadName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">
                        {event.type === 'note' ? `Note — ${event.leadName}` : `Registered — ${event.leadName}`}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {event.type === 'note' ? `"${event.body}"` : event.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusPill status={event.leadStatus} />
                      <span className="text-[9px] text-slate-400 whitespace-nowrap hidden sm:block">
                        {event.date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">

          {/* Pipeline Status */}
          <div
            className="bg-white border border-slate-200 rounded-xl animate-fade-in"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: '120ms' }}
          >
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Pipeline Status</h3>
            </div>
            <div className="p-5 space-y-4">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)
              ) : (
                pipelineRows.map(row => (
                  <div key={row.name}>
                    <div className="flex items-center justify-between text-xs font-medium mb-2">
                      <span className="text-slate-600">{row.name}</span>
                      <span className="text-slate-800">{row.count} · {Math.round(row.pct)}%</span>
                    </div>
                    <ProgressBar pct={row.pct} color={row.color} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lead Sources */}
          <div
            className="bg-white border border-slate-200 rounded-xl animate-fade-in"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: '160ms' }}
          >
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Lead Sources</h3>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-7 rounded" />)}</div>
              ) : Object.keys(sourceDistribution).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(sourceDistribution).map(([src, count]) => {
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={src}>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-slate-600 truncate font-medium">{src}</span>
                          <span className="text-slate-800 ml-2 font-semibold flex-shrink-0">{count}</span>
                        </div>
                        <ProgressBar pct={pct} color="#3B82F6" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Conversion Rate */}
          <div
            className="bg-white border border-slate-200 rounded-xl p-5 animate-fade-in"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', animationDelay: '200ms' }}
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Conversion Rate</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-slate-900">{loading ? '—' : `${stats.winRate}%`}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stats.converted}/{stats.total} leads won</div>
              </div>
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray={`${loading ? 0 : stats.winRate * 0.88} 88`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
