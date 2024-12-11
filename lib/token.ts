import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

type Payload = {
  id: string;
  email: string;
};

export async function generateToken(payload: Payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value as string;

  return verifyToken(token);
}

export function getUserId(req: NextRequest) {
  return req.headers.get("user-id") as string;
}
