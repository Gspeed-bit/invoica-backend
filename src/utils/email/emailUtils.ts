import nodemailer from 'nodemailer';
import { emailStyles } from './emailStyles';

export const sendVerificationEmail = async (
  email: string,
  subject: string,
  htmlContent: string
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
    <div style="text-align: center;">
      <a href="http://localhost:5000/verify-email?email=${email}&code=${htmlContent}" style="${emailStyles.button}">Verify Email</a>
    </div>
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
    subject: subject,
    html: htmlMessage,
  });
};
