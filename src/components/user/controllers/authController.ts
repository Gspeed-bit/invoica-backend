import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import crypto from 'crypto';
import { sendResetLink, sendVerificationEmail } from 'src/utils/email/emailUtils';
import { sanitizeUser } from 'src/sanitizeUser';

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
    const emailVerificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    console.log(emailVerificationToken);
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
      emailVerificationExpires,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

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
    // Check if user exists by email or username, excluding the password field
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select(
      'password firstName lastName email username phone businessName accountType'
    ); // Ensure password is included here

    if (!user)
      return res
        .status(400)
        .json({ message: 'Invalid email/username or password' });

    // Check if the user has a password
    if (!user.password)
      return res.status(400).json({ message: 'User does not have a password' });

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

    // Sanitize the user object by removing the password and other sensitive fields
    const sanitizedUser = sanitizeUser(user, ['password']);

    // Return the token and user data (excluding password) in the response
    res.status(200).json({
      token,
      user: sanitizedUser, // Include user data in the response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Request Password Reset
export const forgotPassword = async (
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

    // Generate email verification token
    const resetLink = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
    console.log(resetLink);

    // Send verification email
    await sendResetLink(user.email, resetToken);

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
  const token = req.body.token || req.query.token; // Extract token from body or query
  const { newPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password and clear reset token fields
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
  console.log(token);
  if (!token) return res.status(400).json({ message: 'Token is required' });

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as { email: string };

    if (!decoded || !decoded.email) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({
      email: decoded.email,
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
