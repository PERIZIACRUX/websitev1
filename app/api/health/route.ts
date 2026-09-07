/**
 * app/api/health/route.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Health check endpoint.
 *
 * Returns a 200 OK with basic status information.
 * Used by load balancers, uptime monitors, and Cloudflare health checks.
 *
 * Intentionally minimal — does NOT expose sensitive system information.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "crux-perizia-platform",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
