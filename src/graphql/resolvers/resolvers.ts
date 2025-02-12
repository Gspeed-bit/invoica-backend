/* eslint-disable @typescript-eslint/no-explicit-any */
// resolvers/index.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../../models/User';
import { sendEmail } from '../../utils/mailer';
import { KEYS } from 'src/config/config';
import { sanitizeUser } from 'src/sanitizeUser';
import { verifyToken } from 'src/utils/jwt';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

const createToken = (user: IUser) =>
  jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { req }: { req: any }) => {
      if (!req.user) {
        return null;
      }

      const user = await User.findById(req.user.id);

      // Sanitize the user data to exclude the emailVerificationToken if verified
      if (!user) {
        return null;
      }
      return sanitizeUser(
        user,
        user.isEmailVerified
          ? []
          : ['emailVerificationToken', 'emailVerificationExpires']
      );
    },

    // New query to get user verification status
    getUserVerificationStatus: async (
      _: unknown,
      { email }: { email: string }
    ) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      return { isVerified: user.isEmailVerified };
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          email: string;
          password: string;
          confirmPassword: string;
          firstName: string;
          lastName: string;
          username: string;
          phone: string;
          accountType: 'individual' | 'business';
          businessName?: string;
        };
      }
    ): Promise<{ success: boolean; message: string; user?: IUser }> => {
      try {
        const {
          email,
          password,
          confirmPassword,
          firstName,
          lastName,
          username,
          phone,
          accountType,
          businessName,
        } = input;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          if (!existingUser.isEmailVerified) {
            throw new Error(
              'Account already exists but not verified. Please verify your email.'
            );
          }
          throw new Error('Account with email already exists.');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = jwt.sign({ email }, JWT_SECRET, {
          expiresIn: '2m',
        });

        const newUser = new User({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          username,
          phone,
          accountType,
          businessName,
          createdAt: new Date(),
          updatedAt: new Date(),
          emailVerificationToken: verificationToken,
          emailVerificationExpires: new Date(Date.now() + 1 * 60 * 1000),
        });

        // Sanitize the user data before saving to DB
        const sanitizedUser = sanitizeUser(newUser.toObject(), [
          'emailVerificationToken',
          'emailVerificationExpires',
        ]);

        // Ensure `id` is included in the sanitized result
        sanitizedUser.id = newUser._id;
        // Save sanitized user data to the database
        await newUser.save();
        await sendEmail(
          email,
          'Verify Your Email',
          `<a href='${KEYS.CLIENT_URL}/auth/verify/${verificationToken}'>Click here to verify</a>`
        );

        return {
          success: true,
          message: 'User registered successfully. Please verify your email.',
          user: sanitizedUser as unknown as IUser,
        };
      } catch (error) {
        console.error('Registration error:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Registration failed.',
        };
      }
    },

    login: async (
      _: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password)))
        throw new Error('Invalid credentials');

      if (!user.isEmailVerified)
        throw new Error('Please verify your email first');

      return { token: createToken(user), user };
    },

    verifyEmail: async (_: any, { token }: { token: string }) => {
      try {
        // Verify and decode the token
        const decoded = verifyToken(token);

        if (!decoded || typeof decoded === 'string') {
          throw new Error('Invalid or expired token');
        }

        // Find user based on the decoded email
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
          throw new Error('User not found');
        }

        // Check if email is already verified
        if (user.isEmailVerified) {
          throw new Error('Email is already verified');
        }
        // Check expiration time (both token expiration and db expiration)
        const currentTime = new Date();
        if (
          user.emailVerificationExpires &&
          currentTime > user.emailVerificationExpires
        ) {
          throw new Error(
            'Verification token has expired. Please request a new verification email.'
          );
        }

        const updatedUser = await User.findOneAndUpdate(
          { email: decoded.email },
          {
            isEmailVerified: true,
            emailVerificationToken: undefined,
            emailVerificationExpires: undefined,
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('Failed to verify user');
        }

        return { success: true, message: 'Email successfully verified!' };
      } catch (error) {
        console.error(
          'Email verification error:',
          error instanceof Error ? error.message : error
        );

        // Customize error message
        let errorMessage = (error as Error).message;
        if (error instanceof Error && error.message.includes('jwt expired')) {
          errorMessage =
            'Your verification link has expired. Please request a new verification email.';
        }

        return { success: false, message: errorMessage };
      }
    },

    resendVerificationEmail: async (_: any, { email }: { email: string }) => {
      // Check user verification status before proceeding
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      // If user is already verified, throw an error
      if (user.isEmailVerified) {
        throw new Error('Email already verified');
      }

      // Check if the verification token has already expired
      const currentTime = new Date();
      if (
        user.emailVerificationExpires &&
        currentTime < user.emailVerificationExpires
      ) {
        // Token hasn't expired yet, prevent sending a new one
        const remainingTime = Math.ceil(
          (user.emailVerificationExpires.getTime() - currentTime.getTime()) /
            1000
        ); // in seconds
        throw new Error(
          `Please wait ${remainingTime} seconds before requesting a new verification email.`
        );
      }

      // Generate a new verification token
      const verificationToken = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: '2m', // Set expiration time as needed
      });

      // Update the expiration time for the token (without storing the token itself)
      user.emailVerificationExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiration
      await user.save(); // Save only expiration time, no token in the DB

      // Send the verification email without storing the token in the DB
      await sendEmail(
        user.email,
        'Verify Your Email',
        `<a href='${KEYS.CLIENT_URL}/auth/verify/${verificationToken}'>Click here to verify</a>`
      );

      return {
        success: true,
        message:
          'A new verification email has been sent to your email address.',
      };
    },

    forgotPassword: async (_: unknown, { email }: { email: string }) => {
      const user = await User.findOne({ email });
      if (!user) return false;

      const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: '15m',
      });
      user.resetPasswordToken = resetToken;
      await user.save();

      await sendEmail(
        email,
        'Reset Password',
        `<a href="${process.env.CLIENT_URL}/reset/${resetToken}">Reset Password</a>`
      );

      return true;
    },

    resetPassword: async (
      _: unknown,
      { token, newPassword }: { token: string; newPassword: string }
    ) => {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await User.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
      });

      if (!user) throw new Error('Invalid token');

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      await user.save();

      return true;
    },
  },
};
