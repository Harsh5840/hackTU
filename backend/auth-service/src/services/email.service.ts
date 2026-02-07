import nodemailer from 'nodemailer';
import { emailConfig } from '../config/env.config';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  try {
    const link = `http://localhost:3000/auth/verify-email?token=${token}`;
    await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject: 'Verify Your Email - Modern Colours',
      html: `<p>Please click <a href="${link}">here</a> to verify your email.</p>`,
    });
    logger.info(`Verification email sent to ${to}`);
  } catch (err: any) {
    logger.error(`Email error: ${err.message}`);
  }
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  try {
    const link = `http://localhost:3000/auth/reset-password?token=${token}`;
    await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject: 'Reset Password',
      html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
    });
    logger.info(`Reset email sent to ${to}`);
  } catch (err: any) {
    logger.error(`Email error: ${err.message}`);
  }
};
