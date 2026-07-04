const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Fetches all leads from the database, sorted newest first.
 */
export async function fetchLeads() {
  const res = await fetch(`${API_BASE_URL}/leads`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to fetch leads');
  }
  return res.json();
}

/**
 * Creates a new lead in the database.
 * @param {Object} leadData - { name, email, source, status, notes }
 */
export async function createLead(leadData) {
  const res = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create lead');
  }
  return res.json();
}

/**
 * Updates an existing lead's fields (like status) or appends a note.
 * @param {string} id - Lead ID
 * @param {Object} updateData - { status, note, notes, ... }
 */
export async function updateLead(id, updateData) {
  const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update lead');
  }
  return res.json();
}

/**
 * Deletes a lead by ID.
 * @param {string} id - Lead ID
 */
export async function deleteLead(id) {
  const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete lead');
  }
  return res.json();
}
