import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Review from '../models/Review.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const totalCount = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: users.length,
    data: users,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, data: user });
});

/**
 * @desc    Update user (admin only)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, role, bio, credits } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (bio !== undefined) user.bio = bio;
  if (credits !== undefined) user.credits = credits;

  await user.save();

  res.json({ success: true, data: user });
});

/**
 * @desc    Delete user and all related data (admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting yourself
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot delete your own account from admin panel');
  }

  // Cascade delete all related data
  await Session.deleteMany({ participants: req.params.id });
  await Review.deleteMany({ $or: [{ reviewer: req.params.id }, { reviewee: req.params.id }] });
  await Message.deleteMany({ sender: req.params.id });
  await Conversation.deleteMany({ participants: req.params.id });
  await Transaction.deleteMany({ $or: [{ from: req.params.id }, { to: req.params.id }] });
  await Notification.deleteMany({ recipient: req.params.id });

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'User and all related data deleted' });
});

/**
 * @desc    Get all sessions (admin only)
 * @route   GET /api/admin/sessions
 * @access  Private/Admin
 */
const getAllSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (status) {
    query.status = status;
  }

  const totalCount = await Session.countDocuments(query);

  const sessions = await Session.find(query)
    .populate('participants', 'name email avatar')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
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
 * @desc    Get platform statistics (admin only)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalSessions,
    completedSessions,
    pendingSessions,
    totalReviews,
    onlineUsers,
    creditStats,
  ] = await Promise.all([
    User.countDocuments(),
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    Session.countDocuments({ status: 'pending' }),
    Review.countDocuments(),
    User.countDocuments({ isOnline: true }),
    User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: '$credits' }, avgCredits: { $avg: '$credits' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalSessions,
      completedSessions,
      pendingSessions,
      totalReviews,
      onlineUsers,
      totalCreditsInCirculation: creditStats[0]?.totalCredits || 0,
      averageCreditsPerUser: Math.round((creditStats[0]?.avgCredits || 0) * 100) / 100,
    },
  });
});

export { getAllUsers, getUserById, updateUser, deleteUser, getAllSessions, getStats };
