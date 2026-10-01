import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name must be under 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  bio: z.string().max(300, 'Bio must be under 300 characters').optional().default(''),
  skills: z.array(z.string()).optional().default([]),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60).optional(),
  bio: z.string().max(300).optional(),
  neighborhood: z.string().min(2).optional(),
  skills: z.array(z.string()).optional(),
  avatar: z.string().url().optional(),
});

export const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be under 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.string().min(2, 'Category is required'),
  urgency: z.enum(['URGENT', 'TODAY', 'FLEXIBLE']).default('FLEXIBLE'),
  neighborhood: z.string().min(2, 'Neighborhood is required'),
  preferredDate: z.string().min(1, 'Date is required'),
  preferredTime: z.string().min(1, 'Time is required'),
  reward: z.string().max(100).optional(),
});

export const updateRequestSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  category: z.string().min(2).optional(),
  urgency: z.enum(['URGENT', 'TODAY', 'FLEXIBLE']).optional(),
  neighborhood: z.string().min(2).optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  reward: z.string().optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(3, 'Review comment must be at least 3 characters').max(500, 'Review comment must be under 500 characters'),
});
