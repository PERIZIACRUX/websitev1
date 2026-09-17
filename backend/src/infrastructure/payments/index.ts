/**
 * lib/payments/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Payment gateway abstraction layer.
 *
 * PLACEHOLDER — Will be implemented in a later step (Razorpay integration).
 *
 * This module will provide:
 *   - Order creation (amount authoritative from server, never from browser)
 *   - Payment verification (signature validation server-side)
 *   - Webhook handling (idempotent, server-side only)
 *   - Refund initiation (admin-only)
 *
 * Security principles:
 *   - PAYMENT_KEY_SECRET is server-only (never sent to browser).
 *   - The browser only receives an order_id to initiate the payment UI.
 *   - Payment success is determined by server-side signature verification,
 *     NOT by any value sent from the browser.
 *   - Idempotency keys must be used for all order creation calls.
 */


export interface CreateOrderParams {
  /** Amount in smallest currency unit (paise for INR) */
  amountPaise: number;
  currency: "INR";
  /** Internal reference to link payment to registration */
  receiptId: string;
}

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * Placeholder: create a payment order.
 * The amount is computed server-side from authoritative pricing rules.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function createOrder(
  _params: CreateOrderParams
): Promise<OrderResult> {
  throw new Error(
    "[lib/payments] createOrder() is not yet implemented. " +
      "Payment gateway integration will be built in a later step."
  );
}

/**
 * Placeholder: verify a payment signature returned by the gateway.
 * This MUST be called server-side before marking a registration as paid.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function verifyPaymentSignature(
  _orderId: string,
  _paymentId: string,
  _signature: string
): Promise<boolean> {
  throw new Error(
    "[lib/payments] verifyPaymentSignature() is not yet implemented. " +
      "Payment verification will be built in a later step."
  );
}
