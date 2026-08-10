import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, bio, location, avatar, phone, countryCode } = req.body;
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (avatar !== undefined) user.avatar = avatar;
  if (phone !== undefined) user.phone = phone;
  if (countryCode !== undefined) user.countryCode = countryCode;

  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters long');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.password) {
    res.status(400);
    throw new Error('OAuth accounts signed in via Google cannot change password');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});


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


const getLeaderboard = asyncHandler(async (req, res) => {
  const topUsers = await User.find({})
    .select('-password')
    .sort({ xp: -1, averageRating: -1, totalReviews: -1 })
    .limit(10);

  res.json({ success: true, data: topUsers });
});

export { getProfile, updateProfile, updateSkills, uploadAvatar, searchUsers, changePassword, getLeaderboard };
