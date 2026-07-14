import mongoose from 'mongoose';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const noteSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Note body is required'],
      trim: true,
      minlength: [1, 'Note cannot be empty']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
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
      enum: {
        values: ['LinkedIn', 'Website Contact Form', 'Referral', 'Other'],
        message: 'Source must be LinkedIn, Website Contact Form, Referral, or Other'
      },
      default: 'Website Contact Form'
    },
    customSource: {
      type: String,
      default: '',
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
  },
  {
    versionKey: false
  }
);

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
