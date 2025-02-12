import nodemailer from 'nodemailer';
import { KEYS } from 'src/config/config';

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: KEYS.email, // Your email address
      pass: KEYS.emailPassword, // Your email password or app-specific password
    },
    logger: true, // Enable logging
    debug: true, // Show debug output
  });

  const mailOptions = {
    from: KEYS.email, // Sender's email address
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
