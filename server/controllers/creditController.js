import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';

const getBalance = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { credits: req.user.credits },
  });
});

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {
    $or: [{ from: req.user._id }, { to: req.user._id }],
  };

  const totalCount = await Transaction.countDocuments(query);

  const transactions = await Transaction.find(query)
    .populate('from', 'name avatar')
    .populate('to', 'name avatar')
    .populate('session', 'skillOffered skillRequested')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: transactions.length,
    data: transactions,
    pagination: {
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
    },
  });
});

export { getBalance, getTransactions };
