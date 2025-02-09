import express from 'express';
import { register, login, resetPassword, resetPasswordRequest, verifyEmail } from '../controllers/authController';

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user and sends an email verification link
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
 *       400:
 *         description: Bad request, validation errors or email already taken
 *       500:
 *         description: Internal server error
 */

router.post('/register', register);

/**
 * @swagger
 * /auth/login:
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
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "jwt_token"
 *       400:
 *         description: Invalid email/username or password
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);


/**
 * @swagger
 * /auth/reset-password-request:
 *   post:
 *     summary: Request password reset
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
router.post('/reset-password-request', resetPasswordRequest);

/**
 * @swagger
 * /auth/reset-password:
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
 * /auth/verify-email:
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
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/verify-email', verifyEmail);

export default router;
// Compare this snippet from src/components/user/routes/authRoutes.ts: