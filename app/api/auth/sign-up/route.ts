import prisma from "@/lib/db";
import { signUpSchema } from "@/validation/auth";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const valid = signUpSchema.safeParse(body);

    if (!valid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: valid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, name, password } = valid.data;

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { message: "User already exists", data: {} },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Signed up successfully", data: {} },
      { status: 201 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: {} },
      { status: 500 }
    );
  }
}
