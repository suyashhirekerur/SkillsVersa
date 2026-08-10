import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer user ID is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee user ID is required']
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session reference ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Unique compound index on reviewer and session to prevent duplicate reviews
reviewSchema.index({ reviewer: 1, session: 1 }, { unique: true });

// Index for fetching reviews by reviewee
reviewSchema.index({ reviewee: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
