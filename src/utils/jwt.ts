import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { KEYS } from 'src/config/config';

dotenv.config();

const JWT_SECRET = KEYS.jwtSecret;

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT Verification Failed:', error);
    return null;
  }
};
