/**
 * @file Message.js
 * @description Mongoose model for individual chat messages in a conversation.
 */

import mongoose from 'mongoose';

/**
 * Message Schema definition.
 */
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation reference ID is required'],
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender user ID is required']
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Compound index for querying chronological message stream in a conversation
messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
