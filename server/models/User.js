/**
 * @file User.js
 * @description Mongoose model for User profiles, authentication, skills, and credits.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Schema for skills that a user can teach.
 */
const skillToTeachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    trim: true
  },
  proficiency: {
    type: String,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: '{VALUE} is not a valid proficiency level'
    },
    default: 'intermediate'
  }
});

/**
 * Schema for skills that a user wants to learn.
 */
const skillToLearnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    trim: true
  }
});

/**
 * User Schema definition.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  skillsToTeach: [skillToTeachSchema],
  skillsToLearn: [skillToLearnSchema],
  credits: {
    type: Number,
    default: 50,
    min: [0, 'Credits cannot be negative']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    },
    default: 'user'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for searching skills and role filtering
userSchema.index({ 'skillsToTeach.name': 1 });
userSchema.index({ 'skillsToLearn.name': 1 });
userSchema.index({ role: 1 });

/**
 * Pre-save middleware to hash password before saving to the database.
 * @param {Function} next - Mongoose next middleware function
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Match user-entered password with hashed password in database.
 * @param {string} enteredPassword - The plain text password entered by user.
 * @returns {Promise<boolean>} Resolves to true if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
