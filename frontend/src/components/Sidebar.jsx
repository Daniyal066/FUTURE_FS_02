import React from 'react';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sub: 'Analytics overview',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'leads',
    label: 'Leads Directory',
    sub: 'Manage pipeline',
    showBadge: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: 'add-lead',
    label: 'Add New Lead',
    sub: 'Register prospect',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
  },
  {
    id: 'follow-ups',
    label: 'Timeline Logs',
    sub: 'Interaction history',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeView, setActiveView, leads, loading }) {
  return (
    <aside
      id="main-sidebar"
      className="w-60 flex-shrink-0 h-screen flex flex-col select-none"
      style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}
    >
      {/* ── Brand ── */}
      <div
        className="flex items-center gap-3 px-5 h-14 flex-shrink-0"
        style={{ borderBottom: '1px solid #1E293B' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#1E3A8A' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>
        <div>
          <span className="block text-sm font-bold text-white tracking-tight">AetherCRM</span>
          <span className="block text-[9px] font-semibold tracking-widest uppercase text-slate-500">Enterprise Suite</span>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="px-5 pt-5 pb-1.5">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600">Navigation</span>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveView(item.id)}
              className="group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150 relative"
              style={{
                background:    isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                borderLeft:    isActive ? '2px solid #3B82F6' : '2px solid transparent',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex-shrink-0 transition-colors duration-150"
                  style={{ color: isActive ? '#60A5FA' : '#64748B' }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[13px] font-medium truncate transition-colors duration-150"
                  style={{ color: isActive ? '#93C5FD' : '#64748B' }}
                >
                  {item.label}
                </span>
              </div>

              {/* Count Badge */}
              {item.showBadge && !loading && leads.length > 0 && (
                <span
                  className="flex-shrink-0 ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? 'rgba(59,130,246,0.2)' : '#1E293B',
                    color:      isActive ? '#93C5FD' : '#475569',
                  }}
                >
                  {leads.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4" style={{ borderTop: '1px solid #1E293B' }} />

      {/* ── Pipeline Stats ── */}
      <div className="p-3 space-y-2">
        <span className="text-[9px] font-bold tracking-widest uppercase text-slate-600 px-1">Pipeline</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Total',  val: leads.length,                                       color: '#CBD5E1' },
            { label: 'Active', val: leads.filter(l => l.status !== 'converted').length, color: '#FCD34D' },
            { label: 'Won',    val: leads.filter(l => l.status === 'converted').length, color: '#34D399' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-lg p-2 text-center"
              style={{ background: '#1E293B', border: '1px solid #334155' }}
            >
              <div
                className="text-sm font-bold leading-none"
                style={{ color: loading ? '#334155' : s.color }}
              >
                {loading ? '—' : s.val}
              </div>
              <div className="text-[8px] font-semibold mt-1 uppercase tracking-wide text-slate-600">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-3 pb-3">
        <div
          className="px-3 py-2 rounded-lg text-center"
          style={{ background: '#1E293B', border: '1px solid #334155' }}
        >
          <p className="text-[9px] font-semibold tracking-wider text-slate-600">
            © 2026 Aether Suite · v2.0
          </p>
        </div>
      </div>
    </aside>
  );
}
