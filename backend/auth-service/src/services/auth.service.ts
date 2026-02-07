import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateTokens } from '../utils/jwt.util';
import { logger } from '../utils/logger';

export const registerUser = async (data: any) => {
  const { email, password, firstName, lastName, phone, role } = data;
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('Email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      role: role || 'BUYER',
      isVerified: false
    }
  });

  // TODO: Send verification email
  logger.info(`User registered: ${user.id}`);
  
  return { id: user.id, email: user.email };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');

  const tokens = generateTokens({ id: user.id, email: user.email, role: user.role });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  return { 
    tokens, 
    user: { 
      id: user.id, 
      email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role 
    } 
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent return for security

  const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      code: token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour
    }
  });

  return token; // In real app, call emailService.sendPasswordResetEmail(email, token)
};

export const resetPassword = async (data: any) => {
  const { email, code, newPassword } = data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid request');

  const resetRecord = await prisma.passwordReset.findFirst({
    where: { 
      userId: user.id, 
      code, 
      expiresAt: { gt: new Date() },
      used: false 
    }
  });

  if (!resetRecord) throw new Error('Invalid or expired code');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    })
  ]);

  return { message: 'Password reset successful' };
};
