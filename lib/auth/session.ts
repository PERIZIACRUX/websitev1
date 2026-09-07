import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "default_dev_secret_replace_in_prod_1234567890";
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = "perizia_session";

export type SessionPayload = {
  registrationId: string;
  registrationNumber: string;
};

export async function createSessionToken(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(encodedKey);

  return {
    name: SESSION_COOKIE_NAME,
    value: session,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax" as const,
      path: "/",
    }
  };
}

export async function createSessionCookie(payload: SessionPayload) {
  const cookieData = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(cookieData.name, cookieData.value, cookieData.options);
}

export async function verifySessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    if (!payload.registrationId || !payload.registrationNumber) {
      return null;
    }

    return {
      registrationId: payload.registrationId as string,
      registrationNumber: payload.registrationNumber as string,
    };
  } catch (_error) {
    return null;
  }
}
