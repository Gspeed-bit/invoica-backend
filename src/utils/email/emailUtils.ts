import nodemailer from 'nodemailer';
import { emailStyles } from './emailStyles';

export const sendVerificationEmail = async (
  email: string,
  code: string,
) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      'Email credentials are not set in the environment variables.'
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const htmlMessage = `
  <div style="${emailStyles.container}">
    <h1 style="${emailStyles.header}">Welcome to Invoica!</h1>
    <p style="${emailStyles.paragraph}">Hi there,</p>
    <p style="${emailStyles.paragraph}">
      Thank you for joining Invoica! We're excited to have you on board. Please use the verification code below to confirm your email address:
    </p>
    <p style="${emailStyles.paragraph}">
      If you didn't create this account, you can safely ignore this email.
    </p>
    <p style="${emailStyles.paragraph}">
      Verification Code: <strong>${code}</strong>
    </p>
    <p style="text-align: center;">
      <a href="http://localhost:5000/verify?token=${code}" style="${emailStyles.button}">Verify Email</a>
      
    </p>
    <footer style="${emailStyles.footer}">
      <p>
        Invoica Inc., Your Address, City, Country<br />
        Need help? <a href="mailto:support@yourdomain.com" style="color: #3A0CA3; text-decoration: none;">Contact Support</a>
      </p>
      <p>© 2025 Invoica. All rights reserved.</p>
    </footer>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Invoica Email Verification',
    html: htmlMessage,
  });
};



export const sendResetLink = async (email: string, resetToken: string) => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    throw new Error(
      'Email credentials are not set in the environment variables.'
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`;

  const htmlMessage = `
  <div style="${emailStyles.container}">
    <h1 style="${emailStyles.header}">Password Reset Request</h1>
    <p style="${emailStyles.paragraph}">Hi,</p>
    <p style="${emailStyles.paragraph}">
      We received a request to reset your password. Click the button below to proceed:
    </p>
    <p style="text-align: center;">
      <a href="${resetUrl}" style="${emailStyles.button}">Reset Password</a>
    </p>
    <p style="${emailStyles.paragraph}">
      If you did not request this, please ignore this email. Your password will not be changed.
    </p>
    <footer style="${emailStyles.footer}">
      <p>
        Invoica Inc., Your Address, City, Country<br />
        Need help? <a href="mailto:support@yourdomain.com" style="color: #3A0CA3; text-decoration: none;">Contact Support</a>
      </p>
      <p>© 2025 Invoica. All rights reserved.</p>
    </footer>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset Request - Invoica',
    html: htmlMessage,
  });
};
