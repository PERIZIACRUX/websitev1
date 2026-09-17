import { z } from "zod";

export const RetrieveRegistrationSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  email: z.string().email("Invalid email address"),
});

export type RetrieveRegistrationInput = z.infer<typeof RetrieveRegistrationSchema>;
