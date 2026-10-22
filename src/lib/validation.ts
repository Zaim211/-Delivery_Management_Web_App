import { z } from "zod";

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const productSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().nonnegative(),
  zoneIds: z.array(z.string().min(1)).default([]),
});

export const zoneSchema = z.object({
  name: z.string().min(1).max(120),
  centerLat: z.coerce.number().min(-90).max(90),
  centerLng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().positive().max(100_000),
});

export const orderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  customerLat: z.coerce.number().min(-90).max(90),
  customerLng: z.coerce.number().min(-180).max(180),
  address: z.string().min(1).max(300),
});