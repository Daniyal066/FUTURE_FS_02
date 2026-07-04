import mongoose from 'mongoose';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const noteSchema = new mongoose.Schema({
  body: {
    type: String,
    required: [true, 'Note body is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [emailRegex, 'Please provide a valid email address']
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    default: 'Website Contact Form',
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'contacted', 'converted'],
      message: 'Status must be either new, contacted, or converted'
    },
    default: 'new'
  },
  notes: {
    type: [noteSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
