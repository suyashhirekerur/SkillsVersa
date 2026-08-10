import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { grantSignupBonus } from '../utils/creditManager.js';


const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email: normalizedEmail, password });

  // Grant signup bonus credits
  await grantSignupBonus(user._id);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      credits: user.credits,
      role: user.role,
      token,
    },
  });
});


const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        credits: user.credits,
        role: user.role,
        token,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});


const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Google authentication failed');
  }
  const token = generateToken(req.user._id);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/google/success?token=${token}`);
});

export { register, login, getMe, googleCallback };
