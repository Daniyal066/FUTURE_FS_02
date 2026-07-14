import React, { useState, useMemo, useCallback } from 'react';
import { useLeads } from '../context/LeadContext';

/* ── Light-mode status badge ── */
function StatusBadge({ status }) {
  const styles = {
    new:       { background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569' },
    contacted: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' },
    converted: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' },
  };
  const s = styles[status] || styles.new;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={s}>
      {status}
    </span>
  );
}

/* ── Delete modal ── */
function DeleteModal({ lead, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full animate-scale-in shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Remove Lead?</h3>
        <p className="text-sm text-slate-500 mb-5">
          Permanently delete <span className="font-semibold text-slate-800">{lead.name}</span> from AetherCRM. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            id="cancel-delete-btn"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors active:scale-[0.98]"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 5;
const STATUS_FILTERS = ['all', 'new', 'contacted', 'converted'];

export default function LeadsManager() {
  const { leads, loading, editLead, removeLead, showToast } = useLeads();

  const [expandedId,   setExpandedId]   = useState(null);
  const [noteInputs,   setNoteInputs]   = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter(lead => {
      const matchSearch = !q || lead.name.toLowerCase().includes(q) || lead.email.toLowerCase().includes(q) || (lead.source || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  const totalPages     = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE));
  const safePage       = Math.min(currentPage, totalPages);
  const pageStart      = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = filteredLeads.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const handleSearch       = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (f)  => { setStatusFilter(f); setCurrentPage(1); };

  const handleStatusChange = useCallback(async (leadId, newStatus) => {
    await editLead(leadId, { status: newStatus });
  }, [editLead]);

  const handleAddNote = useCallback(async (e, leadId) => {
    e.preventDefault();
    const text = (noteInputs[leadId] || '').trim();
    if (!text) return;
    setSavingNoteId(leadId);
    const { success } = await editLead(leadId, { note: text });
    if (success) setNoteInputs(prev => ({ ...prev, [leadId]: '' }));
    setSavingNoteId(null);
  }, [noteInputs, editLead]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    await removeLead(deleteTarget._id);
    setDeleteTarget(null);
    setDeletingId(null);
    if (expandedId === deleteTarget._id) setExpandedId(null);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) { showToast('No leads to export.', 'error'); return; }
    const headers = ['Name', 'Email', 'Source', 'Status', 'Notes', 'Created At'];
    const rows = leads.map(l => [`"${l.name}"`, `"${l.email}"`, `"${l.source}"`, `"${l.status}"`, l.notes?.length || 0, `"${new Date(l.createdAt).toLocaleString()}"`].join(','));
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'aethercrm-leads.csv' });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`Exported ${leads.length} leads.`);
  };

  /* Pill style helper */
  const pillStyle = (filter) => {
    const active = statusFilter === filter;
    if (active) return { background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8' };
    return { background: 'transparent', border: '1px solid #E2E8F0', color: '#64748B' };
  };

  return (
    <div className="space-y-5 pb-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leads Directory</h2>
          <p className="text-sm text-slate-500 mt-0.5">Search, filter and manage your CRM pipeline.</p>
        </div>
        <button
          id="export-csv-btn"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Datagrid Panel ── */}
      <div
        className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-fade-in"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', animationDelay: '40ms' }}
      >

        {/* ── Controls Bar ── */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
              </svg>
            </div>
            <input
              id="leads-search-input"
              type="text"
              placeholder="Search by name, email or source..."
              value={searchQuery}
              onChange={handleSearch}
              className="input-field pl-10"
            />
          </div>

          {/* Status Pill Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter}
                id={`filter-${filter}-btn`}
                onClick={() => handleFilterChange(filter)}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold capitalize transition-all duration-150 hover:border-blue-300"
                style={pillStyle(filter)}
              >
                {filter === 'all' ? 'All Leads' : filter}
                {filter !== 'all' && (
                  <span className="ml-1.5 opacity-60">
                    {leads.filter(l => l.status === filter).length}
                  </span>
                )}
              </button>
            ))}
            {filteredLeads.length !== leads.length && (
              <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                {filteredLeads.length} matched
              </span>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Client', 'Source', 'Status', 'Joined', 'Actions'].map(col => (
                  <th
                    key={col}
                    className={`px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${col === 'Actions' ? 'text-right' : 'text-left'}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="bg-white">
                    <td colSpan={5} className="px-5 py-3">
                      <div className="skeleton h-10 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center bg-white">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No records match your query.</p>
                    <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, rowIdx) => {
                  const isExpanded = expandedId === lead._id;
                  const isEven     = rowIdx % 2 !== 0;
                  return (
                    <React.Fragment key={lead._id}>

                      {/* ── Row ── */}
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : lead._id)}
                        className="group cursor-pointer transition-colors duration-100 animate-fade-in"
                        style={{
                          background: isExpanded ? '#EFF6FF' : isEven ? '#F8FAFC' : '#FFFFFF',
                          animationDelay: `${rowIdx * 30}ms`,
                        }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#F1F5F9'; }}
                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = isEven ? '#F8FAFC' : '#FFFFFF'; }}
                      >
                        {/* Client */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-600 flex-shrink-0">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                                {lead.name}
                              </div>
                              <div className="text-[11px] text-slate-400">{lead.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-4">
                          <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg">
                            {lead.source}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={lead.status} />
                            <label htmlFor={`status-${lead._id}`} className="sr-only">Change status</label>
                            <select
                              id={`status-${lead._id}`}
                              value={lead.status}
                              onChange={e => handleStatusChange(lead._id, e.target.value)}
                              className="text-[11px] text-slate-500 rounded-md px-1.5 py-1 bg-white border border-slate-200 focus:outline-none focus:border-blue-400 cursor-pointer transition-colors hover:border-slate-300"
                            >
                              <option value="new">new</option>
                              <option value="contacted">contacted</option>
                              <option value="converted">converted</option>
                            </select>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <span className="text-[11px] text-slate-500">
                            {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`notes-toggle-${lead._id}`}
                              onClick={() => setExpandedId(isExpanded ? null : lead._id)}
                              title="Notes"
                              className="p-1.5 rounded-lg border transition-colors duration-150"
                              style={{
                                background: isExpanded ? '#EFF6FF' : 'transparent',
                                borderColor: isExpanded ? '#BFDBFE' : '#E2E8F0',
                                color: isExpanded ? '#2563EB' : '#94A3B8',
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                              </svg>
                            </button>
                            {(lead.notes?.length || 0) > 0 && (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                                {lead.notes.length}
                              </span>
                            )}
                            <button
                              id={`delete-lead-${lead._id}`}
                              onClick={() => setDeleteTarget(lead)}
                              disabled={deletingId === lead._id}
                              title="Delete"
                              className="p-1.5 rounded-lg border border-transparent text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-30"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Accordion ── */}
                      {isExpanded && (
                        <tr className="bg-blue-50/40 border-b border-blue-100">
                          <td colSpan={5} className="px-5 py-5">
                            <div className="accordion-content grid grid-cols-1 lg:grid-cols-2 gap-5">

                              {/* Notes History */}
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                                  Interaction History
                                  {lead.notes?.length > 0 && <span className="ml-2 font-normal text-slate-400">({lead.notes.length})</span>}
                                </p>
                                {!lead.notes?.length ? (
                                  <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                                ) : (
                                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {[...(lead.notes || [])].reverse().map((note, ni) => (
                                      <li key={ni} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold mb-1.5">
                                          <span className="uppercase tracking-wider text-blue-500">Log #{lead.notes.length - ni}</span>
                                          <span>{new Date(note.timestamp || note.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{note.body}</p>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              {/* Add Note */}
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Add Note</p>
                                <form onSubmit={e => handleAddNote(e, lead._id)} className="space-y-2.5">
                                  <textarea
                                    id={`note-input-${lead._id}`}
                                    rows={4}
                                    value={noteInputs[lead._id] || ''}
                                    onChange={e => setNoteInputs(prev => ({ ...prev, [lead._id]: e.target.value }))}
                                    placeholder="Log a call update, proposal detail, or follow-up action..."
                                    className="input-field resize-none"
                                  />
                                  <button
                                    id={`save-note-btn-${lead._id}`}
                                    type="submit"
                                    disabled={savingNoteId === lead._id || !(noteInputs[lead._id] || '').trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {savingNoteId === lead._id ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Saving...
                                      </>
                                    ) : 'Save Note'}
                                  </button>
                                </form>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>
            {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, filteredLeads.length)} of <span className="font-semibold text-slate-700">{filteredLeads.length}</span> leads
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                id="pagination-prev-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-7 h-7 rounded-md text-[11px] font-semibold transition-all border"
                  style={{
                    background:   safePage === p ? '#2563EB' : '#FFFFFF',
                    borderColor:  safePage === p ? '#2563EB' : '#E2E8F0',
                    color:        safePage === p ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                id="pagination-next-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal lead={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
