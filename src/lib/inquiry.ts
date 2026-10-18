import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .min(7, "Please provide a valid phone number.")
    .max(30, "Phone number is too long.")
    .regex(
      /^\+?[\d\s\-().]{7,30}$/,
      "Please enter a valid international phone number (e.g. +91 98765 43210)."
    ),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  dateOfBirth: z.string().trim().max(30).optional().or(z.literal("")),
  service: z.string().trim().min(2).max(120),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(20).max(5000),
  website: z.string().max(0).optional(),
});

