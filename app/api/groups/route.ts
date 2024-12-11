import prisma from "@/lib/db";
import { getSession, getUserId } from "@/lib/token";
import { createGroupSchema } from "@/validation/groups";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { message: "Groups fetched successfully", data: { groups } },
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

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    const body = await req.json();
    const valid = createGroupSchema.safeParse(body);

    if (!valid.success) {
      return NextResponse.json(
        { message: "Invalid data", data: valid.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name } = valid.data;

    await prisma.group.create({
      data: {
        name,
        members: {
          connect: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json(
      { message: "Group created successfully", data: {} },
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
