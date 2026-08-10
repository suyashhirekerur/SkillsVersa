import mongoose from 'mongoose';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

export const transferCredits = async (fromUserId, toUserId, amount, sessionId = null, description = 'Session credit transfer') => {
  if (!fromUserId || !toUserId) {
    throw new Error('Both sender and receiver user IDs are required');
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Transfer amount must be a positive number');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromUser = await User.findById(fromUserId).session(session);
    const toUser = await User.findById(toUserId).session(session);

    if (!fromUser) {
      throw new Error(`Sender user with ID ${fromUserId} not found`);
    }

    if (!toUser) {
      throw new Error(`Receiver user with ID ${toUserId} not found`);
    }

    if (fromUser.credits < numericAmount) {
      throw new Error(`Insufficient credits. Required: ${numericAmount}, Available: ${fromUser.credits}`);
    }

    fromUser.credits -= numericAmount;
    toUser.credits += numericAmount;

    await fromUser.save({ session });
    await toUser.save({ session });

    await Transaction.create(
      [
        {
          from: fromUserId,
          to: toUserId,
          amount: numericAmount,
          type: 'session_payment',
          session: sessionId,
          description: description || 'Session credit payment',
          balanceAfter: fromUser.credits,
        },
        {
          from: fromUserId,
          to: toUserId,
          amount: numericAmount,
          type: 'session_earning',
          session: sessionId,
          description: description || 'Session credit earning',
          balanceAfter: toUser.credits,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      fromBalance: fromUser.credits,
      toBalance: toUser.credits,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in transferCredits:', error.message);
    throw error;
  }
};

export const handleMutualExchange = async (user1Id, user2Id, sessionId = null) => {
  try {
    if (!user1Id || !user2Id) {
      throw new Error('Both user IDs are required for mutual exchange');
    }

    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
      throw new Error('One or both users not found for mutual exchange');
    }

    await Transaction.create([
      {
        from: user1Id,
        to: user2Id,
        amount: 0,
        type: 'mutual_exchange',
        session: sessionId,
        description: 'Mutual skill exchange session',
        balanceAfter: user1.credits,
      },
      {
        from: user2Id,
        to: user1Id,
        amount: 0,
        type: 'mutual_exchange',
        session: sessionId,
        description: 'Mutual skill exchange session',
        balanceAfter: user2.credits,
      },
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error in handleMutualExchange:', error.message);
    throw error;
  }
};

export const grantSignupBonus = async (userId, amount = 50) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to grant signup bonus');
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Signup bonus amount must be positive');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    user.credits = (user.credits || 0) + numericAmount;
    await user.save();

    await Transaction.create({
      from: null,
      to: userId,
      amount: numericAmount,
      type: 'signup_bonus',
      description: 'Welcome bonus',
      balanceAfter: user.credits,
    });

    return {
      success: true,
      balance: user.credits,
    };
  } catch (error) {
    console.error('Error in grantSignupBonus:', error.message);
    throw error;
  }
};

export const refundCredits = async (userId, amount, sessionId = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required for refund');
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Refund amount must be a positive number');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    user.credits = (user.credits || 0) + numericAmount;
    await user.save();

    await Transaction.create({
      from: null,
      to: userId,
      amount: numericAmount,
      type: 'refund',
      session: sessionId,
      description: 'Session cancellation refund',
      balanceAfter: user.credits,
    });

    return {
      success: true,
      balance: user.credits,
    };
  } catch (error) {
    console.error('Error in refundCredits:', error.message);
    throw error;
  }
};

export default {
  transferCredits,
  handleMutualExchange,
  grantSignupBonus,
  refundCredits,
};
