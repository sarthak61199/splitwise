import prisma from "@/lib/db";
import { generateToken } from "@/lib/token";
import { signInSchema } from "@/validation/auth";
import { compare } from "bcrypt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const body = await req.json();

    const valid = signInSchema.safeParse(body);

    if (!valid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: valid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = valid.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials", data: {} },
        { status: 400 }
      );
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials", data: {} },
        { status: 400 }
      );
    }

    const token = await generateToken({ id: user.id, email: user.email });

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 86400 * 7,
      path: "/",
    });

    return NextResponse.json(
      { message: "Signed in successfully", data: {} },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: {} },
      { status: 500 }
    );
  }
}
