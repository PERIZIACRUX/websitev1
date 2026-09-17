import { z } from "zod";

export const TestPaymentSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  status: z.enum(["SUCCESS", "FAILURE"], {
    required_error: "Status must be either SUCCESS or FAILURE",
  }),
});

export type TestPaymentInput = z.infer<typeof TestPaymentSchema>;
