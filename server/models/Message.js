import mongoose from 'mongoose';


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
    default: '',
    trim: true
  },
  attachments: [{
    url: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'other'],
      default: 'other'
    },
    fileName: {
      type: String,
      default: 'Attachment'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    publicId: {
      type: String,
      default: ''
    }
  }],
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
