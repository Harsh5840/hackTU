import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"Modern Colours" <no-reply@moderncolours.com>',
      to,
      subject,
      text,
    });
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Error sending email', error);
  }
};
