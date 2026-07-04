import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

// Connection helper
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-Memory Database Fallback Store (Pre-populated for dynamic demo review)
let inMemoryLeads = [
  {
    _id: "mem_lead_1",
    name: "Sarah Jenkins",
    email: "sarah.j@techcorp.com",
    source: "LinkedIn",
    status: "new",
    notes: [
      { body: "Initial contact via outreach campaign", createdAt: new Date(Date.now() - 3600000 * 3) },
      { body: "Requested pricing list for enterprise license", createdAt: new Date(Date.now() - 3600000 * 2) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: "mem_lead_2",
    name: "Marcus Vance",
    email: "m.vance@designstudio.io",
    source: "Website Contact Form",
    status: "contacted",
    notes: [
      { body: "Inquired about custom integration services", createdAt: new Date(Date.now() - 3600000 * 20) },
      { body: "Sent scheduling link for introductory call", createdAt: new Date(Date.now() - 3600000 * 18) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: "mem_lead_3",
    name: "Elena Rostova",
    email: "elena@ventures.co",
    source: "Referral",
    status: "converted",
    notes: [
      { body: "Referred by existing partner", createdAt: new Date(Date.now() - 3600000 * 46) },
      { body: "Contract signed. Onboarding set for next Monday", createdAt: new Date(Date.now() - 3600000 * 42) }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48)
  }
];

// Robust Email Validation Regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * GET /api/leads
 * Retrieves all leads sorted newest first.
 */
export const getLeads = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      res.status(200).json(leads);
    } else {
      res.status(200).json(inMemoryLeads);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/leads
 * Creates a new lead with duplicate checking.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, email, source, status, notes } = req.body;

    // Strict input validations
    if (!name || !name.trim() || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ error: 'Name is required and must be between 2 and 50 characters.' });
    }
    if (!email || !email.trim() || !emailRegex.test(email.trim().toLowerCase())) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const emailLower = email.trim().toLowerCase();

    if (isDbConnected()) {
      // Check duplicate email
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
        source: source || undefined,
        status: status || undefined,
        notes: formattedNotes
      });

      const savedLead = await newLead.save();
      res.status(201).json(savedLead);
    } else {
      // In-Memory Unique Check
      const existing = inMemoryLeads.find(l => l.email === emailLower);
      if (existing) {
        return res.status(400).json({ error: 'A lead with this email address already exists.' });
      }

      let formattedNotes = [];
      if (Array.isArray(notes)) {
        formattedNotes = notes.map(n => {
          if (typeof n === 'string') return { body: n, createdAt: new Date() };
          return { body: n.body, createdAt: n.createdAt || new Date() };
        });
      }

      const newLead = {
        _id: 'mem_' + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: emailLower,
        source: source || 'Website Contact Form',
        status: status || 'new',
        notes: formattedNotes,
        createdAt: new Date()
      };

      inMemoryLeads.unshift(newLead);
      res.status(201).json(newLead);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/leads/:id
 * Updates specific lead variables or appends notes logs.
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, source, status, note } = req.body;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const updateFields = {};
      if (name !== undefined) {
        if (name.trim().length < 2 || name.trim().length > 50) {
          return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
        }
        updateFields.name = name.trim();
      }
      if (source !== undefined) updateFields.source = source.trim();
      if (status !== undefined) updateFields.status = status;

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

      const updateQuery = { $set: updateFields };
      if (note !== undefined && note.trim() !== '') {
        updateQuery.$push = { notes: { body: note.trim() } };
      }

      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, runValidators: true }
      );

      if (!updatedLead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      res.status(200).json(updatedLead);
    } else {
      // In-memory updates
      const lead = inMemoryLeads.find(l => l._id === id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }

      if (name !== undefined) {
        if (name.trim().length < 2 || name.trim().length > 50) {
          return res.status(400).json({ error: 'Name must be between 2 and 50 characters.' });
        }
        lead.name = name.trim();
      }

      if (email !== undefined) {
        const emailLower = email.trim().toLowerCase();
        if (!emailRegex.test(emailLower)) {
          return res.status(400).json({ error: 'A valid email address is required.' });
        }
        const existing = inMemoryLeads.find(l => l.email === emailLower && l._id !== id);
        if (existing) {
          return res.status(400).json({ error: 'A lead with this email address already exists.' });
        }
        lead.email = emailLower;
      }

      if (source !== undefined) lead.source = source.trim();
      if (status !== undefined) {
        if (!['new', 'contacted', 'converted'].includes(status)) {
          return res.status(400).json({ error: 'Status must be new, contacted, or converted.' });
        }
        lead.status = status;
      }

      if (note !== undefined && note.trim() !== '') {
        lead.notes.push({ body: note.trim(), createdAt: new Date() });
      }

      res.status(200).json(lead);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/leads/:id
 * Removes lead records.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const deletedLead = await Lead.findByIdAndDelete(id);
      if (!deletedLead) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      res.status(200).json({ message: 'Lead successfully deleted.', id });
    } else {
      const index = inMemoryLeads.findIndex(l => l._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Lead not found.' });
      }
      inMemoryLeads.splice(index, 1);
      res.status(200).json({ message: 'Lead successfully deleted.', id });
    }
  } catch (error) {
    next(error);
  }
};
