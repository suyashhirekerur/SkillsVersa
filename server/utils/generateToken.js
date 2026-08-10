import jwt from 'jsonwebtoken';

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
