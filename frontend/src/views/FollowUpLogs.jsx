import React from 'react';
import { useLeads } from '../context/LeadContext';

export default function FollowUpLogs() {
  const { leads, loading } = useLeads();

  // Traverse all leads and collect notes
  const allNotes = [];
  leads.forEach((lead) => {
    if (Array.isArray(lead.notes)) {
      lead.notes.forEach((note) => {
        allNotes.push({
          leadId: lead._id,
          leadName: lead.name,
          leadEmail: lead.email,
          body: note.body,
          createdAt: new Date(note.createdAt)
        });
      });
    }
  });

  // Sort notes chronologically (newest first)
  allNotes.sort((a, b) => b.createdAt - a.createdAt);

  // Group notes by Date
  const groupedNotes = allNotes.reduce((groups, note) => {
    const dateStr = note.createdAt.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(note);
    return groups;
  }, {});

  const dateGroups = Object.entries(groupedNotes);

  return (
    <div className="space-y-8 select-none">
      {/* Banner */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Interaction Timeline</h2>
        <p className="text-xs text-slate-400">Chronological list of all updates, proposal logs, and customer follow-ups</p>
      </div>

      {/* Main Timeline Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-sm">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Retrieving interactions tree...</span>
          </div>
        ) : dateGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24a.75.75 0 011.25-.83 48.73 48.73 0 012.26 2.384m-.004 0L9.4 8.5" />
            </svg>
            <span>No notes have been logged across client accounts yet.</span>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:top-4 before:bottom-4 before:left-3.5 before:w-[1px] before:bg-slate-800">
            {dateGroups.map(([dateStr, notes]) => (
              <div key={dateStr} className="space-y-4 relative">
                {/* Date Header Node */}
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-indigo-400 z-10 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider select-none">{dateStr}</h3>
                </div>

                {/* Notes in Date Group */}
                <div className="pl-10 space-y-4">
                  {notes.map((note, noteIdx) => (
                    <div
                      key={noteIdx}
                      className="p-4.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 transition-colors hover:border-slate-700/60 duration-200"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold select-none">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">{note.leadName}</span>
                          <span>&bull;</span>
                          <span>{note.leadEmail}</span>
                        </div>
                        <span>
                          {note.createdAt.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-slate-205 text-sm leading-relaxed">{note.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
