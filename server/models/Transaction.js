import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient user ID (to) is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required']
  },
  type: {
    type: String,
    enum: {
      values: [
        'session_payment',
        'session_earning',
        'signup_bonus',
        'refund',
        'mutual_exchange'
      ],
      message: '{VALUE} is not a valid transaction type'
    },
    required: [true, 'Transaction type is required']
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  balanceAfter: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes for looking up transaction history by user or session
transactionSchema.index({ to: 1, createdAt: -1 });
transactionSchema.index({ from: 1, createdAt: -1 });
transactionSchema.index({ session: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
