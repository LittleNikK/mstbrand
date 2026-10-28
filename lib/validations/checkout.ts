import { z } from 'zod';
import { addressSchema } from './auth';

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
  }),
  shippingAddress: addressSchema,
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum(['razorpay', 'cod', 'test_mode']).default('test_mode'),
  discountCode: z.string().optional(),
});

export const applyDiscountSchema = z.object({
  code: z.string().min(2, 'Code is required').toUpperCase(),
});
