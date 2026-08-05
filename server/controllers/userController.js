import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

/**
 * @desc    Get user public profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

/**
 * @desc    Update logged-in user profile (name, bio)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, bio } = req.body;
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;

  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

/**
 * @desc    Update logged-in user skills (skillsToTeach, skillsToLearn)
 * @route   PUT /api/users/skills
 * @access  Private
 */
const updateSkills = asyncHandler(async (req, res) => {
  const { skillsToTeach, skillsToLearn } = req.body;

  if (skillsToTeach !== undefined) {
    if (!Array.isArray(skillsToTeach)) {
      res.status(400);
      throw new Error('skillsToTeach must be an array');
    }
    for (const skill of skillsToTeach) {
      if (!skill.name || !skill.category) {
        res.status(400);
        throw new Error('Each skill in skillsToTeach must have a name and category');
      }
    }
  }

  if (skillsToLearn !== undefined) {
    if (!Array.isArray(skillsToLearn)) {
      res.status(400);
      throw new Error('skillsToLearn must be an array');
    }
    for (const skill of skillsToLearn) {
      if (!skill.name || !skill.category) {
        res.status(400);
        throw new Error('Each skill in skillsToLearn must have a name and category');
      }
    }
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (skillsToTeach !== undefined) user.skillsToTeach = skillsToTeach;
  if (skillsToLearn !== undefined) user.skillsToLearn = skillsToLearn;

  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

/**
 * @desc    Upload avatar to Cloudinary and update user profile
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'avatars' },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      stream.end(fileBuffer);
    });
  };

  const result = await streamUpload(req.file.buffer);

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.avatar = result.secure_url;
  const updatedUser = await user.save();

  res.json({ success: true, data: updatedUser });
});

/**
 * @desc    Search users by name, skill, category with pagination
 * @route   GET /api/users/search
 * @access  Public
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { skill, category, name, page = 1, limit = 10 } = req.query;

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  const conditions = [];

  if (category) {
    const categoryRegex = new RegExp(category, 'i');
    conditions.push({
      $or: [
        { skillsToTeach: { $elemMatch: { category: categoryRegex } } },
        { skillsToLearn: { $elemMatch: { category: categoryRegex } } },
      ],
    });
  }

  if (skill) {
    const skillRegex = new RegExp(skill, 'i');
    conditions.push({
      $or: [
        { skillsToTeach: { $elemMatch: { name: skillRegex } } },
        { skillsToLearn: { $elemMatch: { name: skillRegex } } },
      ],
    });
  }

  if (conditions.length > 0) {
    query.$and = conditions;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const totalCount = await User.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limitNum) || 1;

  const users = await User.find(query)
    .select('-password')
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      totalPages,
      totalCount,
    },
  });
});

export { getProfile, updateProfile, updateSkills, uploadAvatar, searchUsers };
