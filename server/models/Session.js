import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  participants: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    validate: [
      function (val) {
        return Array.isArray(val) && val.length === 2;
      },
      'Session must have exactly 2 participants'
    ],
    required: [true, 'Participants are required']
  },
  skillOffered: {
    type: String,
    required: [true, 'Skill offered is required'],
    trim: true
  },
  skillRequested: {
    type: String,
    required: [true, 'Skill requested is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  duration: {
    type: Number,
    default: 60,
    min: [15, 'Duration must be at least 15 minutes']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid session status'
    },
    default: 'pending'
  },
  creditCost: {
    type: Number,
    default: 10,
    min: [0, 'Credit cost cannot be negative']
  },
  meetingLink: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  contract: {
    agreedByTeacher: { type: Boolean, default: false },
    agreedByLearner: { type: Boolean, default: false },
    learningGoals: { type: String, default: '' },
    deliverables: { type: String, default: '' },
    signedAt: { type: Date }
  },
  resources: {
    notes: { type: String, default: '' },
    codeSnippets: { type: String, default: '' },
    links: [{ title: String, url: String }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator user ID is required']
  },
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for optimized lookups by participant, status, and schedule
sessionSchema.index({ participants: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ scheduledDate: 1 });
sessionSchema.index({ createdBy: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
