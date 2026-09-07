import { z } from "zod";

/**
 * Example validator to demonstrate server-side validation using Zod.
 * This pattern will be used for registration, payments, and admin actions.
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
