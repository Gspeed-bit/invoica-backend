import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import crypto from 'crypto';
import { sendVerificationEmail } from 'src/utils/email/emailUtils';



export const register = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    username,
    email,
    phone,
    businessName,
    accountType,
    password,
    confirmPassword,
  } = req.body;

  try {
    // Validation for password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    // Check if email or username already exists
    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });

    if (emailExists)
      return res.status(400).json({ message: 'Email already exists' });
    if (usernameExists)
      return res.status(400).json({ message: 'Username already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 3600000; // 1 hour

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      businessName,
      accountType,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
    });

    await user.save();

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${emailVerificationToken}`;
    await sendVerificationEmail(
      user.email,
      'Email Verification',
      `Please verify your email by clicking the following link: ${verificationLink}`
    );

    res.status(201).json({
      message:
        'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Check if user exists by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user)
      return res
        .status(400)
        .json({ message: 'Invalid email/username or password' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: 'Invalid email/username or password' });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request Password Reset
export const resetPasswordRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiration

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendVerificationEmail(
      user.email,
      'Password Reset Request',
      `Click here to reset: ${resetLink}`
    );

    return res.json({ message: 'Reset email sent' });
  } catch (error) {
    console.error('Reset Password Request Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Reset Password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Email Verification
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired token' });

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
