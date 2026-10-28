import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['DONOR', 'RECIPIENT', 'ADMIN']),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  organizationType: z.string().optional(),
  registrationNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category: z.enum(['COOKED_MEALS', 'BAKERY', 'PRODUCE', 'DAIRY', 'PACKAGED_GOODS', 'OTHER']),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.string().min(1, 'Unit is required (e.g., kg, servings, meals, boxes)'),
  dietaryInfo: z.string().optional(),
  preparedAt: z.string().optional(),
  useBy: z.string().min(1, 'Use-by date and time is required'),
  pickupWindowStart: z.string().min(1, 'Pickup window start time is required'),
  pickupWindowEnd: z.string().min(1, 'Pickup window end time is required'),
  pickupAddress: z.string().min(3, 'Pickup address is required'),
  pickupCity: z.string().min(2, 'Pickup city is required'),
  storageInstructions: z.string().optional(),
  foodSafetyConfirmed: z.boolean().refine(val => val === true, {
    message: 'Food safety declaration must be confirmed',
  }),
  imageUrl: z.string().optional(),
});

export const updateListingSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  dietaryInfo: z.string().optional(),
  pickupWindowStart: z.string().optional(),
  pickupWindowEnd: z.string().optional(),
  pickupAddress: z.string().optional(),
  pickupCity: z.string().optional(),
  storageInstructions: z.string().optional(),
  status: z.enum(['AVAILABLE', 'CANCELLED', 'EXPIRED']).optional(),
});

export const createRequestSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID format'),
  requestedQuantity: z.number().positive('Requested quantity must be positive'),
  pickupTime: z.string().optional(),
  purpose: z.string().optional(),
});

export const reasonSchema = z.object({
  reason: z.string().optional(),
});

export const completePickupSchema = z.object({
  verificationCode: z.string().optional(),
});

export const verifyUserSchema = z.object({
  isVerified: z.boolean(),
});
