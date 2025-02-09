import express from 'express';
import {
  register,
  login,
  resetPassword,
  verifyEmail,
  forgotPassword,
} from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user and sends an email verification link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: 'John'
 *               lastName:
 *                 type: string
 *                 example: 'Doe'
 *               username:
 *                 type: string
 *                 example: 'john_doe'
 *               email:
 *                 type: string
 *                 example: 'john.doe@example.com'
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               businessName:
 *                 type: string
 *                 example: 'Doe Enterprises'
 *               accountType:
 *                 type: string
 *                 enum:
 *                   - individual
 *                   - business
 *                 example: 'individual'
 *               password:
 *                 type: string
 *                 example: 'Password123'
 *               confirmPassword:
 *                 type: string
 *                 example: 'Password123'
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. Please check your email to verify your account."
 *                 token:
 *                   type: string
 *                   example: "jwt_token"  # Include token in response example
 *       400:
 *         description: Bad request, validation errors, or email/username already taken
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username or email already exists"
 *       500:
 *         description: Internal server error
 */

router.post('/register', register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     description: Login a user with either email or username.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrUsername:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "jwt_token"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "user_id"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     username:
 *                       type: string
 *                       example: "john_doe"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     businessName:
 *                       type: string
 *                       example: "Doe Enterprises"
 *                     accountType:
 *                       type: string
 *                       example: "individual"
 *       400:
 *         description: Invalid email/username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid email/username or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

router.post('/login', login);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Forgot password reset
 *     description: Sends a password reset link to the user email if the email exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *       400:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password-request', forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the password with the token and new password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset_token"
 *               newPassword:
 *                 type: string
 *                 example: newStrongPassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /verify:
 *   get:
 *     summary: Verify user's email
 *     description: Verifies the user's email address using the token sent to their email.
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Email verified successfully"
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid or expired token"
 *       500:
 *         description: Server error
 */

router.get('/verify', verifyEmail);

export default router;
// Compare this snippet from src/components/user/routes/authRoutes.ts:
