import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: [
        'session_request',
        'session_accepted',
        'session_rejected',
        'session_completed',
        'session_cancelled',
        'new_review',
        'new_message',
        'new_match',
        'credit_received'
      ],
      message: '{VALUE} is not a valid notification type'
    },
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for querying a user's notifications sorted by read status and date
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
