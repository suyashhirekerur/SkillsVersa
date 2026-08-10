import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
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
      'Conversation must have exactly 2 participants'
    ],
    required: [true, 'Participants are required']
  },
  lastMessage: {
    text: {
      type: String,
      default: '',
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for fast lookup of a user's active conversations sorted by recent activity
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
