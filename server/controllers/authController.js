import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { grantSignupBonus } from '../utils/creditManager.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  // Grant signup bonus credits
  await grantSignupBonus(user._id);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      credits: user.credits,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

/**
 * @desc    Login user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        credits: user.credits,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

/**
 * @desc    Google OAuth callback handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Google authentication failed');
  }
  const token = generateToken(req.user._id);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/google/success?token=${token}`);
});

export { register, login, getMe, googleCallback };
