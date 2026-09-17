import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export const TestPaymentSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  status: z.enum(["SUCCESS", "FAILURE"], {
    required_error: "Status must be either SUCCESS or FAILURE",
  }),
});

export const periziaRegistrationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(255),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

export const RetrieveRegistrationSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  email: z.string().email("Invalid email address"),
});

export type RetrieveRegistrationInput = z.infer<typeof RetrieveRegistrationSchema>;
