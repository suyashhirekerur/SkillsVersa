import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const totalCount = await Notification.countDocuments({ recipient: req.user._id });

  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('relatedUser', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: notifications.length,
    data: notifications,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`,
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({ success: true, data: { count } });
});

export { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
