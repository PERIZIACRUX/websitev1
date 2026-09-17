# components/perizia/

PERIZIA-specific React components.

Examples:
- `RegistrationForm.tsx` — multi-step registration form (client component)
- `WorkshopSelector.tsx` — workshop picker during registration
- `PaymentButton.tsx` — initiates the payment gateway UI
- `VenueMap.tsx` — Google Maps embed for venue directions

## Rules
- PERIZIA components are only used within `app/(public)/perizia/` and `app/register/` pages.
- Forms collect user input and submit to API routes/server actions.
- Server actions perform all validation and business logic.
- Components NEVER compute fees, enforce capacity, or decide payment success.
- All pricing, capacity, and payment decisions are server-side only.
