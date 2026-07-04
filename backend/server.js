import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Lead from './models/Lead.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.error('MongoDB connection error (running in-memory fallback):', err.message);
  });

// In-Memory Fallback Database
let inMemoryLeads = [
  {
    _id: "mem_lead_1",
    name: "Sarah Jenkins",
    email: "sarah.j@techcorp.com",
    source: "LinkedIn",
    status: "new",
    notes: ["Initial contact via outreach campaign", "Requested pricing list for enterprise license"],
    createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
  },
  {
    _id: "mem_lead_2",
    name: "Marcus Vance",
    email: "m.vance@designstudio.io",
    source: "Website Contact Form",
    status: "contacted",
    notes: ["Inquired about custom integration services", "Sent scheduling link for introductory call"],
    createdAt: new Date(Date.now() - 3600000 * 24) // 24 hours ago
  },
  {
    _id: "mem_lead_3",
    name: "Elena Rostova",
    email: "elena@ventures.co",
    source: "Referral",
    status: "converted",
    notes: ["Referred by existing partner", "Contract signed. Onboarding set for next Monday"],
    createdAt: new Date(Date.now() - 3600000 * 48) // 2 days ago
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// API Routes

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy', dbConnected: isDbConnected() });
});

// POST /api/leads -> Create a new lead record
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, source, status, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required.' });
    }

    if (isDbConnected()) {
      const newLead = new Lead({ name, email, source, status, notes });
      const savedLead = await newLead.save();
      return res.status(201).json(savedLead);
    } else {
      const newLead = {
        _id: 'mem_' + Math.random().toString(36).substr(2, 9),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        source: source || 'Website Contact Form',
        status: status || 'new',
        notes: notes || [],
        createdAt: new Date()
      };
      inMemoryLeads.unshift(newLead);
      return res.status(201).json(newLead);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/leads -> Read and retrieve all lead records sorted by the newest first
app.get('/api/leads', async (req, res) => {
  try {
    if (isDbConnected()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.status(200).json(leads);
    } else {
      return res.status(200).json(inMemoryLeads);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/leads/:id -> Update an existing lead's status or push a new string to its notes array
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, source, status, note, notes } = req.body;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (email !== undefined) updateFields.email = email;
      if (source !== undefined) updateFields.source = source;
      if (status !== undefined) updateFields.status = status;
      if (notes !== undefined) updateFields.notes = notes;

      const updateQuery = { $set: updateFields };
      if (note !== undefined && note !== '') {
        updateQuery.$push = { notes: note };
      }

      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, runValidators: true }
      );

      if (!updatedLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.status(200).json(updatedLead);
    } else {
      // In-memory update
      const lead = inMemoryLeads.find(l => l._id === id);
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      if (name !== undefined) lead.name = name;
      if (email !== undefined) lead.email = email;
      if (source !== undefined) lead.source = source;
      if (status !== undefined) lead.status = status;
      if (notes !== undefined) lead.notes = notes;
      if (note !== undefined && note !== '') {
        lead.notes.push(note);
      }

      return res.status(200).json(lead);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/leads/:id -> Delete an individual lead by its ID
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && !id.startsWith('mem_')) {
      const deletedLead = await Lead.findByIdAndDelete(id);
      if (!deletedLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.status(200).json({ message: 'Lead deleted successfully', id });
    } else {
      const index = inMemoryLeads.findIndex(l => l._id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      inMemoryLeads.splice(index, 1);
      return res.status(200).json({ message: 'Lead deleted successfully', id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
