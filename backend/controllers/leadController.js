import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

const isDbConnected = () => mongoose.connection.readyState === 1;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_SOURCES = ['LinkedIn', 'Website Contact Form', 'Referral', 'Other'];
const VALID_STATUSES = ['new', 'contacted', 'converted'];

let inMemoryLeads = [
  {
    _id: 'mem_lead_1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@techcorp.com',
    source: 'LinkedIn',
    customSource: '',
    status: 'new',
    notes: [
      { _id: 'n1a', body: 'Initial contact via LinkedIn outreach campaign.', timestamp: new Date(Date.now() - 3600000 * 3) },
      { _id: 'n1b', body: 'Requested pricing deck for enterprise license tier.', timestamp: new Date(Date.now() - 3600000 * 2) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: 'mem_lead_2',
    name: 'Marcus Vance',
    email: 'm.vance@designstudio.io',
    source: 'Website Contact Form',
    customSource: '',
    status: 'contacted',
    notes: [
      { _id: 'n2a', body: 'Inquired about white-label integration services.', timestamp: new Date(Date.now() - 3600000 * 20) },
      { _id: 'n2b', body: 'Sent scheduling link for introductory strategy call.', timestamp: new Date(Date.now() - 3600000 * 18) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: 'mem_lead_3',
    name: 'Elena Rostova',
    email: 'elena@ventures.co',
    source: 'Referral',
    customSource: '',
    status: 'converted',
    notes: [
      { _id: 'n3a', body: 'Referred by existing partner at Apex Capital.', timestamp: new Date(Date.now() - 3600000 * 46) },
      { _id: 'n3b', body: 'Contract signed. Onboarding scheduled for next Monday.', timestamp: new Date(Date.now() - 3600000 * 42) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    _id: 'mem_lead_4',
    name: 'James Whitfield',
    email: 'j.whitfield@cloudbase.net',
    source: 'LinkedIn',
    customSource: '',
    status: 'contacted',
    notes: [
      { _id: 'n4a', body: 'Responded to InMail — interested in the Starter plan.', timestamp: new Date(Date.now() - 3600000 * 72) },
      { _id: 'n4b', body: 'Shared product demo link. Follow-up scheduled in 3 days.', timestamp: new Date(Date.now() - 3600000 * 65) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 78)
  },
  {
    _id: 'mem_lead_5',
    name: 'Priya Mehta',
    email: 'priya.m@softspark.ai',
    source: 'Referral',
    customSource: '',
    status: 'new',
    notes: [
      { _id: 'n5a', body: 'Warm intro via Tom Brennan at MeshWorks — high intent lead.', timestamp: new Date(Date.now() - 3600000 * 8) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 10)
  },
  {
    _id: 'mem_lead_6',
    name: 'Oliver Hartmann',
    email: 'oliver.h@kinetica.de',
    source: 'Other',
    customSource: 'Industry Conference — DevSummit 2026',
    status: 'converted',
    notes: [
      { _id: 'n6a', body: 'Met at DevSummit Berlin — expressed strong interest in API tier.', timestamp: new Date(Date.now() - 3600000 * 120) },
      { _id: 'n6b', body: 'Completed trial successfully. Upgraded to Pro plan.', timestamp: new Date(Date.now() - 3600000 * 96) },
      { _id: 'n6c', body: 'Invoice sent. Payment confirmed.', timestamp: new Date(Date.now() - 3600000 * 80) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 125)
  }
];

/**
 * GET /api/leads
 * Retrieves all leads sorted newest first.
 */
export const getLeads = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.status(200).json(leads);
    }
    res.status(200).json(inMemoryLeads);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads
 * Creates a new lead with duplicate and validation checking.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, email, source, customSource, status, notes } = req.body;

    if (!name || !name.trim() || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ error: 'Name is required and must be between 2 and 50 characters.' });
    }
    if (!email || !email.trim() || !emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (source && !VALID_SOURCES.includes(source)) {
      return res.status(400).json({ error: `Source must be one of: ${VALID_SOURCES.join(', ')}.` });
    }

    const emailLower = email.trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await Lead.findOne({ email: emailLower });
      if (existing) {
        return res.status(400).json({ error: 'A lead with this email address already exists.' });
      }

      let formattedNotes = [];
      if (Array.isArray(notes)) {
        formattedNotes = notes.map(n => typeof n === 'string' ? { body: n } : n);
      }

      const newLead = new Lead({
        name: name.trim(),
        email: emailLower,
        source: source || 'Website Contact Form',
        customSource: (source === 'Other' && customSource) ? customSource.trim() : '',
        status: status || 'new',
        notes: formattedNotes
      });

      const savedLead = await newLead.save();
      return res.status(201).json(savedLead);
    }

    const existing = inMemoryLeads.find(l => l.email === emailLower);
    if (existing) {
      return res.status(400).json({ error: 'A lead with this email address already exists.' });
    }

    let formattedNotes = [];
    if (Array.isArray(notes)) {
      formattedNotes = notes.map((n, i) => ({
        _id: `n_${Date.now()}_${i}`,
        body: typeof n === 'string' ? n : n.body,
        timestamp: n.timestamp ? new Date(n.timestamp) : new Date()
      }));
    }

    const newLead = {
      _id: 'mem_' + Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      email: emailLower,
      source: source || 'Website Contact Form',
      customSource: (source === 'Other' && customSource) ? customSource.trim() : '',
      status: status || 'new',
      notes: formattedNotes,
      createdAt: new Date()
    };

    inMemoryLeads.unshift(newLead);
    res.status(201).json(newLead);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/leads/:id
 * Updates specific lead fields or appends a note.
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, source, customSource, status, note } = req.body;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const updateFields = {};

      if (name !== undefined) {
        if (!name.trim() || name.trim().length < 2 || name.trim().length > 50) {
          return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
        }
        updateFields.name = name.trim();
      }

      if (email !== undefined) {
        const emailLower = email.trim().toLowerCase();
        if (!emailRegex.test(emailLower)) {
          return res.status(400).json({ error: 'A valid email address is required.' });
        }
        const existing = await Lead.findOne({ email: emailLower, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ error: 'A lead with this email address already exists.' });
        }
        updateFields.email = emailLower;
      }

      if (source !== undefined) {
        if (!VALID_SOURCES.includes(source)) {
          return res.status(400).json({ error: `Source must be one of: ${VALID_SOURCES.join(', ')}.` });
        }
        updateFields.source = source;
        updateFields.customSource = (source === 'Other' && customSource) ? customSource.trim() : '';
      }

      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
          return res.status(400).json({ error: 'Status must be new, contacted, or converted.' });
        }
        updateFields.status = status;
      }

      const updateQuery = { $set: updateFields };
      if (note !== undefined && note.trim() !== '') {
        updateQuery.$push = { notes: { body: note.trim() } };
      }

      const updatedLead = await Lead.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true });
      if (!updatedLead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      return res.status(200).json(updatedLead);
    }

    const lead = inMemoryLeads.find(l => l._id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (name !== undefined) {
      if (!name.trim() || name.trim().length < 2 || name.trim().length > 50) {
        return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
      }
      lead.name = name.trim();
    }

    if (email !== undefined) {
      const emailLower = email.trim().toLowerCase();
      if (!emailRegex.test(emailLower)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }
      const dup = inMemoryLeads.find(l => l.email === emailLower && l._id !== id);
      if (dup) {
        return res.status(400).json({ error: 'A lead with this email address already exists.' });
      }
      lead.email = emailLower;
    }

    if (source !== undefined) {
      if (!VALID_SOURCES.includes(source)) {
        return res.status(400).json({ error: `Source must be one of: ${VALID_SOURCES.join(', ')}.` });
      }
      lead.source = source;
      lead.customSource = (source === 'Other' && customSource) ? customSource.trim() : '';
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Status must be new, contacted, or converted.' });
      }
      lead.status = status;
    }

    if (note !== undefined && note.trim() !== '') {
      lead.notes.push({
        _id: 'n_' + Math.random().toString(36).substring(2, 9),
        body: note.trim(),
        timestamp: new Date()
      });
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/leads/:id
 * Removes a lead record from DB or in-memory store.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const deletedLead = await Lead.findByIdAndDelete(id);
      if (!deletedLead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      return res.status(200).json({ message: 'Lead successfully deleted.', id });
    }

    const index = inMemoryLeads.findIndex(l => l._id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found.' });
    }
    inMemoryLeads.splice(index, 1);
    res.status(200).json({ message: 'Lead successfully deleted.', id });
  } catch (error) {
    next(error);
  }
};
