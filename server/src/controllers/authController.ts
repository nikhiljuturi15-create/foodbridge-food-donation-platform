import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, role, phone, address, city, organizationType, registrationNumber } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const isVerified = role === 'ADMIN' || role === 'DONOR' || (role === 'RECIPIENT' && !!registrationNumber);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name,
          role: role || 'DONOR',
          phone,
          address,
          city,
          organizationType,
          registrationNumber,
          isVerified,
        },
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          details: JSON.stringify({ email: user.email, role: user.role, organizationType: user.organizationType }),
        },
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          organizationType: user.organizationType,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
        return;
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          address: user.address,
          city: user.city,
          organizationType: user.organizationType,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          city: true,
          organizationType: true,
          registrationNumber: true,
          isVerified: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { name, phone, address, city, organizationType } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.userId },
        data: {
          name,
          phone,
          address,
          city,
          organizationType,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          city: true,
          organizationType: true,
          isVerified: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
