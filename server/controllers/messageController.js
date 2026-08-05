import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });

  res.json({ success: true, count: conversations.length, data: conversations });
});

/**
 * @desc    Get or create a conversation with another user
 * @route   GET /api/messages/conversations/:userId
 * @access  Private
 */
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

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

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

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

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  let { conversationId, recipientId, text } = req.body;

  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Message text is required');
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
    text: text.trim(),
    readBy: [req.user._id],
  });

  // Update conversation's last message
  conversation.lastMessage = {
    text: text.trim(),
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

  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(recipientParticipant.toString(), 'receiveMessage', {
      conversationId,
      message: populatedMessage,
    });
  }

  res.status(201).json({ success: true, data: populatedMessage });
});

export { getConversations, getOrCreateConversation, getMessages, sendMessage };
