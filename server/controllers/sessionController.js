import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { transferCredits, handleMutualExchange, refundCredits } from '../utils/creditManager.js';
import { sendSessionNotificationEmail } from '../utils/sendEmail.js';

/**
 * @desc    Create a new session request
 * @route   POST /api/sessions
 * @access  Private
 */
const createSession = asyncHandler(async (req, res) => {
  const { partnerId, skillOffered, skillRequested, scheduledDate, duration, creditCost, meetingLink, notes } = req.body;

  if (!partnerId || !skillOffered || !skillRequested || !scheduledDate) {
    res.status(400);
    throw new Error('Please provide partnerId, skillOffered, skillRequested, and scheduledDate');
  }

  // Validate partner exists
  const partner = await User.findById(partnerId);
  if (!partner) {
    res.status(404);
    throw new Error('Partner user not found');
  }

  // Cannot create session with yourself
  if (partnerId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot create a session with yourself');
  }

  // Validate date is in the future
  if (new Date(scheduledDate) <= new Date()) {
    res.status(400);
    throw new Error('Scheduled date must be in the future');
  }

  const session = await Session.create({
    participants: [req.user._id, partnerId],
    skillOffered,
    skillRequested,
    scheduledDate,
    duration: duration || 60,
    creditCost: creditCost || 10,
    meetingLink: meetingLink || '',
    notes: notes || '',
    createdBy: req.user._id,
  });

  // Create notification for partner
  await Notification.create({
    recipient: partnerId,
    type: 'session_request',
    message: `${req.user.name} has requested a skill exchange session with you`,
    relatedUser: req.user._id,
    relatedSession: session._id,
  });

  // Emit socket notification
  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(partnerId.toString(), 'notification', {
      type: 'session_request',
      message: `${req.user.name} has requested a skill exchange session with you`,
      session: session._id,
    });
  }

  const populatedSession = await Session.findById(session._id).populate('participants', 'name avatar averageRating');

  res.status(201).json({
    success: true,
    data: populatedSession,
  });
});

/**
 * @desc    Get current user's sessions
 * @route   GET /api/sessions
 * @access  Private
 */
const getUserSessions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { participants: req.user._id };

  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const totalCount = await Session.countDocuments(query);

  const sessions = await Session.find(query)
    .populate('participants', 'name avatar averageRating')
    .populate('createdBy', 'name')
    .sort({ scheduledDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: sessions.length,
    data: sessions,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

/**
 * @desc    Get session by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('participants', 'name avatar email bio averageRating skillsToTeach skillsToLearn')
    .populate('createdBy', 'name');

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  // Verify user is a participant
  const isParticipant = session.participants.some(
    (p) => p._id.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to view this session');
  }

  res.json({ success: true, data: session });
});

/**
 * @desc    Accept a session request
 * @route   PUT /api/sessions/:id/accept
 * @access  Private
 */
const acceptSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status !== 'pending') {
    res.status(400);
    throw new Error('Session is not in pending status');
  }

  // Verify user is a participant but NOT the creator
  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (session.createdBy.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot accept your own session request');
  }

  session.status = 'accepted';
  await session.save();

  // Notify session creator
  const creatorId = session.createdBy.toString();
  await Notification.create({
    recipient: creatorId,
    type: 'session_accepted',
    message: `${req.user.name} has accepted your session request`,
    relatedUser: req.user._id,
    relatedSession: session._id,
  });

  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(creatorId, 'notification', {
      type: 'session_accepted',
      message: `${req.user.name} has accepted your session request`,
      session: session._id,
    });
  }

  // Try sending email notification
  try {
    const creator = await User.findById(creatorId);
    if (creator && creator.email) {
      await sendSessionNotificationEmail(creator.email, creator.name, session, 'accepted');
    }
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }

  const populatedSession = await Session.findById(session._id).populate('participants', 'name avatar averageRating');

  res.json({ success: true, data: populatedSession });
});

/**
 * @desc    Reject a session request
 * @route   PUT /api/sessions/:id/reject
 * @access  Private
 */
const rejectSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status !== 'pending') {
    res.status(400);
    throw new Error('Session is not in pending status');
  }

  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (session.createdBy.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot reject your own session request');
  }

  session.status = 'rejected';
  await session.save();

  const creatorId = session.createdBy.toString();
  await Notification.create({
    recipient: creatorId,
    type: 'session_rejected',
    message: `${req.user.name} has declined your session request`,
    relatedUser: req.user._id,
    relatedSession: session._id,
  });

  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(creatorId, 'notification', {
      type: 'session_rejected',
      message: `${req.user.name} has declined your session request`,
      session: session._id,
    });
  }

  res.json({ success: true, data: session });
});

/**
 * @desc    Mark session as completed (requires both participants to confirm)
 * @route   PUT /api/sessions/:id/complete
 * @access  Private
 */
const completeSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status !== 'accepted') {
    res.status(400);
    throw new Error('Session must be accepted before it can be completed');
  }

  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Check if user already confirmed completion
  const alreadyCompleted = session.completedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );
  if (alreadyCompleted) {
    res.status(400);
    throw new Error('You have already confirmed completion');
  }

  // Add user to completedBy
  session.completedBy.push(req.user._id);

  // If both participants confirmed, complete the session
  if (session.completedBy.length === 2) {
    session.status = 'completed';
    session.completedAt = new Date();

    // Handle credit transfer
    const isMutualExchange = session.skillOffered && session.skillRequested &&
      session.skillOffered.trim() !== '' && session.skillRequested.trim() !== '';

    if (isMutualExchange) {
      // Both are teaching and learning — no credits exchanged
      await handleMutualExchange(
        session.participants[0].toString(),
        session.participants[1].toString(),
        session._id
      );
    } else {
      // One-way: creator requested to learn, so the other participant is the teacher
      const learnerId = session.createdBy.toString();
      const teacherId = session.participants.find(
        (p) => p.toString() !== learnerId
      ).toString();

      await transferCredits(
        learnerId,
        teacherId,
        session.creditCost,
        session._id,
        `Session: ${session.skillOffered} ↔ ${session.skillRequested}`
      );
    }

    // Notify both participants
    for (const participantId of session.participants) {
      const pid = participantId.toString();
      await Notification.create({
        recipient: pid,
        type: 'session_completed',
        message: 'Session has been completed! You can now leave a review.',
        relatedSession: session._id,
      });

      const io = req.app.get('io');
      if (io && io.emitToUser) {
        io.emitToUser(pid, 'notification', {
          type: 'session_completed',
          message: 'Session completed! Leave a review.',
          session: session._id,
        });
      }
    }

    // Try sending email notifications
    try {
      for (const participantId of session.participants) {
        const user = await User.findById(participantId);
        if (user && user.email) {
          await sendSessionNotificationEmail(user.email, user.name, session, 'completed');
        }
      }
    } catch (err) {
      console.error('Email notification failed:', err.message);
    }
  } else {
    // Notify the other participant that one has confirmed
    const otherParticipant = session.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );

    const io = req.app.get('io');
    if (io && io.emitToUser) {
      io.emitToUser(otherParticipant.toString(), 'notification', {
        type: 'session_completed',
        message: `${req.user.name} has confirmed session completion. Please confirm to finalize.`,
        session: session._id,
      });
    }
  }

  await session.save();

  const populatedSession = await Session.findById(session._id).populate('participants', 'name avatar averageRating');

  res.json({ success: true, data: populatedSession });
});

/**
 * @desc    Cancel a session
 * @route   PUT /api/sessions/:id/cancel
 * @access  Private
 */
const cancelSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (!['pending', 'accepted'].includes(session.status)) {
    res.status(400);
    throw new Error('Can only cancel pending or accepted sessions');
  }

  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  session.status = 'cancelled';
  await session.save();

  // Notify the other participant
  const otherParticipant = session.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  await Notification.create({
    recipient: otherParticipant.toString(),
    type: 'session_cancelled',
    message: `${req.user.name} has cancelled the session`,
    relatedUser: req.user._id,
    relatedSession: session._id,
  });

  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(otherParticipant.toString(), 'notification', {
      type: 'session_cancelled',
      message: `${req.user.name} has cancelled the session`,
      session: session._id,
    });
  }

  res.json({ success: true, data: session });
});

export {
  createSession,
  getUserSessions,
  getSessionById,
  acceptSession,
  rejectSession,
  completeSession,
  cancelSession,
};
