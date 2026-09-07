import { z } from "zod";

/**
 * Validates the incoming registration payload for Perizia.
 */
export const periziaRegistrationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format").max(255),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  collegeName: z.string().min(2, "College name must be at least 2 characters").max(255),
  collegeId: z.string().max(100).optional(),
  
  editionId: z.string().uuid("Invalid edition ID format"),
  
  // A participant can select zero or multiple workshops
  workshopIds: z.array(z.string().uuid("Invalid workshop ID format")).default([]),
});

export type PeriziaRegistrationInput = z.infer<typeof periziaRegistrationSchema>;
