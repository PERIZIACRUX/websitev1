/**
 * app/register/page.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * PERIZIA Participant Registration — Placeholder
 *
 * The full registration flow will be implemented in a later step.
 * This route is reserved for the multi-step registration experience:
 *   Step 1: Personal details
 *   Step 2: Workshop selection
 *   Step 3: Payment
 *   Step 4: Confirmation
 *
 * IMPORTANT:
 *   - All registration business logic lives in server/services/ and
 *     server/workflows/ — never in this React component.
 *   - Pricing is computed server-side only.
 *   - Capacity is enforced server-side only.
 *   - Payment success is verified server-side only.
 */

import FestToggle from "@/components/shared/FestToggle";
import RegistrationForm from "@/components/perizia/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-gray-200 bg-white mb-10">
        <h1 className="text-2xl font-black tracking-widest text-blue-600">PERIZIA</h1>
        <FestToggle />
      </header>

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-3 text-gray-900">Registration</h2>
          <p className="text-gray-600">Fill in your details and select your workshops.</p>
        </div>
        
        <RegistrationForm />
      </div>
    </main>
  );
}

export const metadata = {
  title: "Register — PERIZIA Academic Fest",
  description: "Register for PERIZIA, the annual academic fest.",
};
