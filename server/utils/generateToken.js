import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user ID
 * 
 * @param {string|object} id - The MongoDB User ID (string or ObjectId)
 * @returns {string} Signed JWT token
 * @throws {Error} If user ID or JWT_SECRET is missing
 */
const generateToken = (id) => {
  if (!id) {
    throw new Error('User ID is required to generate a token');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  const userId = typeof id === 'object' && id._id ? id._id.toString() : id.toString();

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export { generateToken };
export default generateToken;
