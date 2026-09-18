import { SignJWT } from "jose";

export interface SessionPayload {
  registrationId: string;
  registrationNumber: string;
}

export async function createSessionToken(payload: SessionPayload) {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "default_secret");
  const alg = "HS256";
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return {
    name: "perizia_session",
    value: token,
    options: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      path: "/",
      maxAge: 60 * 60 * 2 * 1000, // express expects ms for maxAge, unlike some others, wait, express cookie maxAge is in milliseconds. 2 hours.
    },
  };
}
