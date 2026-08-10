import asyncHandler from 'express-async-handler';
import { findMatches, exploreUsers } from '../utils/matchAlgorithm.js';

const getMatches = asyncHandler(async (req, res) => {
  const { category, skill, limit } = req.query;
  const options = {
    category: category || null,
    skill: skill || null,
    limit: parseInt(limit) || 20,
  };

  const matches = await findMatches(req.user, options);

  res.json({
    success: true,
    count: matches.length,
    data: matches,
  });
});

const explore = asyncHandler(async (req, res) => {
  const { category, skill, page, limit } = req.query;
  const filters = {
    category: category || null,
    skill: skill || null,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 12,
    excludeUserId: req.user._id,
  };

  const result = await exploreUsers(filters);

  res.json({
    success: true,
    data: result.users,
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    },
  });
});

export { getMatches, explore };
