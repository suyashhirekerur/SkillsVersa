import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import cloudinary from '../config/cloudinary.js';

const getFileCategory = (mimetype, filename = '') => {
  const ext = filename.split('.').pop().toLowerCase();
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (
    mimetype.includes('pdf') ||
    mimetype.includes('word') ||
    mimetype.includes('spreadsheet') ||
    mimetype.includes('presentation') ||
    mimetype.includes('excel') ||
    mimetype.includes('text') ||
    mimetype.includes('json') ||
    mimetype.includes('zip') ||
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'zip'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
};

const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please select a file to upload');
  }

  const { originalname, mimetype, size, buffer } = req.file;
  const fileType = getFileCategory(mimetype, originalname);

  let fileUrl = '';
  let publicId = '';

  // Attempt Cloudinary Upload if configured
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    try {
      const resourceType = fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'raw';
      
      const uploadStream = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'chat_attachments',
              resource_type: resourceType,
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const cloudResult = await uploadStream(buffer);
      fileUrl = cloudResult.secure_url;
      publicId = cloudResult.public_id;
    } catch (err) {
      console.warn('Cloudinary upload failed or not configured, using data URI fallback:', err.message);
    }
  }

  // Fallback to base64 data-URL if Cloudinary not available
  if (!fileUrl) {
    const base64Data = buffer.toString('base64');
    fileUrl = `data:${mimetype};base64,${base64Data}`;
  }

  res.status(200).json({
    success: true,
    data: {
      url: fileUrl,
      fileType,
      fileName: originalname,
      fileSize: size,
      publicId,
    },
  });
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

  res.json({ success: true, count: conversations.length, data: conversations });
});

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error('Invalid or missing target user ID');
  }

  if (userId === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot create a conversation with yourself');
  }

  // Find existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
  }).populate('participants', 'name avatar isOnline lastSeen');

  // Create if not found
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, userId],
    });
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar isOnline lastSeen');
  }

  res.json({ success: true, data: conversation });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
    res.status(400);
    throw new Error('Invalid conversation ID');
  }

  // Verify user is participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to view this conversation');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const totalCount = await Message.countDocuments({ conversation: conversationId });

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Mark unread messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.user._id },
      readBy: { $nin: [req.user._id] },
    },
    { $addToSet: { readBy: req.user._id } }
  );

  res.json({
    success: true,
    count: messages.length,
    data: messages,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

 
const sendMessage = asyncHandler(async (req, res) => {
  let { conversationId, recipientId, text = '', attachments = [] } = req.body;

  const trimmedText = text ? text.trim() : '';

  if (!trimmedText && (!attachments || attachments.length === 0)) {
    res.status(400);
    throw new Error('Message must contain text or at least one attachment');
  }

  // If recipientId provided, find or create conversation
  if (recipientId && !conversationId) {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      });
    }

    conversationId = conversation._id;
  }

  if (!conversationId) {
    res.status(400);
    throw new Error('Please provide conversationId or recipientId');
  }

  // Verify user is participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to send messages in this conversation');
  }

  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    text: trimmedText,
    attachments,
    readBy: [req.user._id],
  });

  // Prepare last message snippet summary
  let lastMessageText = trimmedText;
  if (!lastMessageText && attachments.length > 0) {
    const firstAtt = attachments[0];
    if (firstAtt.fileType === 'image') lastMessageText = '📷 Photo';
    else if (firstAtt.fileType === 'video') lastMessageText = '📹 Video';
    else if (firstAtt.fileType === 'audio') lastMessageText = '🎵 Audio file';
    else lastMessageText = `📄 ${firstAtt.fileName || 'Document'}`;
  }

  // Update conversation's last message
  conversation.lastMessage = {
    text: lastMessageText,
    sender: req.user._id,
    timestamp: new Date(),
  };
  conversation.updatedAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name avatar');

  // Emit to recipient via socket
  const recipientParticipant = conversation.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  if (recipientParticipant) {
    const io = req.app.get('io');
    if (io && io.emitToUser) {
      io.emitToUser(recipientParticipant.toString(), 'receiveMessage', {
        conversationId,
        message: populatedMessage,
      });
    }
  }

  res.status(201).json({ success: true, data: populatedMessage });
});

export { getConversations, getOrCreateConversation, getMessages, sendMessage, uploadAttachment };
