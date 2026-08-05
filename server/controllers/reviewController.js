import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Create a review for a completed session
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { sessionId, rating, comment } = req.body;

  if (!sessionId || !rating) {
    res.status(400);
    throw new Error('Please provide sessionId and rating');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  // Find session and validate
  const session = await Session.findById(sessionId);
  if (!session) {
    res.status(404);
    throw new Error('Session not found');
  }

  if (session.status !== 'completed') {
    res.status(400);
    throw new Error('Can only review completed sessions');
  }

  // Verify reviewer is a participant
  const isParticipant = session.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    res.status(403);
    throw new Error('You are not a participant of this session');
  }

  // Determine reviewee (the other participant)
  const revieweeId = session.participants.find(
    (p) => p.toString() !== req.user._id.toString()
  );

  // Check if review already exists
  const existingReview = await Review.findOne({
    reviewer: req.user._id,
    session: sessionId,
  });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this session');
  }

  // Create review
  const review = await Review.create({
    reviewer: req.user._id,
    reviewee: revieweeId,
    session: sessionId,
    rating,
    comment: comment || '',
  });

  // Update reviewee's average rating
  const reviewee = await User.findById(revieweeId);
  const newTotalReviews = reviewee.totalReviews + 1;
  const newAvgRating = ((reviewee.averageRating * reviewee.totalReviews) + rating) / newTotalReviews;

  reviewee.averageRating = Math.round(newAvgRating * 10) / 10; // Round to 1 decimal
  reviewee.totalReviews = newTotalReviews;
  await reviewee.save();

  // Create notification for reviewee
  await Notification.create({
    recipient: revieweeId,
    type: 'new_review',
    message: `${req.user.name} has left you a ${rating}-star review`,
    relatedUser: req.user._id,
    relatedSession: sessionId,
  });

  const io = req.app.get('io');
  if (io && io.emitToUser) {
    io.emitToUser(revieweeId.toString(), 'notification', {
      type: 'new_review',
      message: `${req.user.name} left you a ${rating}-star review`,
    });
  }

  const populatedReview = await Review.findById(review._id)
    .populate('reviewer', 'name avatar')
    .populate('reviewee', 'name avatar');

  res.status(201).json({ success: true, data: populatedReview });
});

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:id
 * @access  Private
 */
const getUserReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const totalCount = await Review.countDocuments({ reviewee: req.params.id });

  const reviews = await Review.find({ reviewee: req.params.id })
    .populate('reviewer', 'name avatar')
    .populate('session', 'skillOffered skillRequested')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

export { createReview, getUserReviews };
