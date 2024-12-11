import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("token");

  return NextResponse.json(
    { message: "Signed out successfully", data: {} },
    { status: 200 }
  );
}
