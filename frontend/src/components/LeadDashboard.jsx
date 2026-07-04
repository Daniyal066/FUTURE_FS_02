import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext';

export default function LeadDashboard() {
  const { leads, loading, editLead, removeLead } = useLeads();
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [newNotes, setNewNotes] = useState({}); // { [leadId]: 'note text' }
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [savingNoteId, setSavingNoteId] = useState(null);

  const handleStatusChange = async (leadId, newStatus) => {
    await editLead(leadId, { status: newStatus });
  };

  const handleAddNote = async (e, leadId) => {
    e.preventDefault();
    const noteText = newNotes[leadId] || '';
    if (!noteText.trim()) return;

    setSavingNoteId(leadId);
    const { success } = await editLead(leadId, { note: noteText.trim() });
    if (success) {
      setNewNotes((prev) => ({ ...prev, [leadId]: '' }));
    }
    setSavingNoteId(null);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to permanently delete this lead from AetherCRM?')) {
      await removeLead(leadId);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'converted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'contacted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'new':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Safe page index correction
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header, Search & Filters */}
      <div className="p-6 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              CRM Leads Database
              {totalItems > 0 && (
                <span className="text-xs bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-medium">
                  {totalItems} matched
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">View, update, analyze, and manage customer leads</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset page on filter change
              }}
              className="bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">All States</option>
              <option value="new">new</option>
              <option value="contacted">contacted</option>
              <option value="converted">converted</option>
            </select>
          </div>
        </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search leads by name, email, or source..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 uppercase tracking-wider text-xs font-semibold">
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Retrieving CRM directory...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                  No records match your active query.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isExpanded = expandedLeadId === lead._id;
                return (
                  <React.Fragment key={lead._id}>
                    {/* Main Row */}
                    <tr
                      className={`hover:bg-slate-800/30 transition-colors duration-150 group cursor-pointer ${isExpanded ? 'bg-slate-800/20' : ''}`}
                      onClick={() => setExpandedLeadId(isExpanded ? null : lead._id)}
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-350 group-hover:border-indigo-500/40 transition-colors">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{lead.name}</div>
                            <div className="text-xs text-slate-400">{lead.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4.5 text-sm text-slate-350">{lead.source}</td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(lead.status)}`}>
                            {lead.status}
                          </span>
                          <label htmlFor={`status-select-${lead._id}`} className="sr-only">Change Status</label>
                          <select
                            id={`status-select-${lead._id}`}
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="converted">converted</option>
                          </select>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4.5 text-xs text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Toggle expandable accordion notes */}
                          <button
                            onClick={() => setExpandedLeadId(isExpanded ? null : lead._id)}
                            title="Notes History"
                            className={`p-2 rounded-lg border transition-all duration-205 ${
                              isExpanded 
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                            </svg>
                          </button>

                          {/* Delete Lead */}
                          <button
                            onClick={() => handleDelete(lead._id)}
                            title="Delete Lead"
                            className="p-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 rounded-lg transition-all duration-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Notes Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/30">
                        <td colSpan="5" className="px-6 py-6 border-b border-slate-800">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Notes Log */}
                            <div>
                              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Interaction History</h4>
                              {lead.notes.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No notes logged for this client yet.</p>
                              ) : (
                                <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                  {lead.notes.map((note, index) => (
                                    <li key={index} className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl text-sm text-slate-300">
                                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                        <span className="uppercase tracking-wider">Note Log #{index + 1}</span>
                                        <span>
                                          {new Date(note.createdAt).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <p className="leading-relaxed text-slate-205">{note.body}</p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Add Note Form */}
                            <div>
                              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Add Interaction Update</h4>
                              <form onSubmit={(e) => handleAddNote(e, lead._id)} className="space-y-3">
                                <textarea
                                  rows="3"
                                  placeholder="Type proposal notes, email updates, contract terms..."
                                  value={newNotes[lead._id] || ''}
                                  onChange={(e) => setNewNotes({ ...newNotes, [lead._id]: e.target.value })}
                                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm"
                                />
                                <button
                                  type="submit"
                                  disabled={savingNoteId === lead._id || !(newNotes[lead._id] || '').trim()}
                                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95"
                                >
                                  {savingNoteId === lead._id ? 'Saving Note...' : 'Save Note Update'}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 select-none">
          <span>
            Showing Page **{activePage}** of **{totalPages}**
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage === 1}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage === totalPages}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
