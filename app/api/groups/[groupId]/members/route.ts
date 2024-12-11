import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { addMemberSchema } from "@/validation/groups";
import { idSchema } from "@/validation/id";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    const groupIdUnsafe = (await params).groupId;
    const idValid = idSchema.safeParse(groupIdUnsafe);

    if (!idValid.success) {
      return NextResponse.json(
        { message: "Invalid data", data: idValid.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const groupId = idValid.data;

    const isMember = await prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not allowed to perform this action", data: {} },
        { status: 403 }
      );
    }

    const members = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Memebers fetched successfully",
        data: { members: members?.members },
      },
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    const groupIdUnsafe = (await params).groupId;
    const idValid = idSchema.safeParse(groupIdUnsafe);

    if (!idValid.success) {
      return NextResponse.json(
        { message: "Invalid data", data: idValid.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const groupId = idValid.data;

    const isMember = await prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not allowed to perform this action", data: {} },
        { status: 403 }
      );
    }

    const body = await req.json();

    const bodyValid = addMemberSchema.safeParse(body);

    if (!bodyValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: bodyValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = bodyValid.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", data: {} },
        { status: 404 }
      );
    }

    const existingMember = await prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { message: "User is already a member", data: {} },
        { status: 400 }
      );
    }

    await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        members: {
          connect: {
            email,
          },
        },
      },
    });

    revalidatePath("/dashboard/groups/[groupId]", "page");

    return NextResponse.json(
      { message: "Member added successfully", data: {} },
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getSession();
    const userId = session?.id as string;

    const groupIdUnsafe = (await params).groupId;
    const groupIdValid = idSchema.safeParse(groupIdUnsafe);

    if (!groupIdValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: groupIdValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const groupId = groupIdValid.data;

    const { searchParams } = new URL(req.url);
    const memberIdUnsafe = searchParams.get("memberId");

    const memberIdValid = idSchema.safeParse(memberIdUnsafe);

    if (!memberIdValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: memberIdValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const memberId = memberIdValid.data;

    if (!memberId) {
      return NextResponse.json(
        { message: "Member ID required", data: {} },
        { status: 400 }
      );
    }

    const isMember = await prisma.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { message: "You are not allowed to perform this action", data: {} },
        { status: 403 }
      );
    }

    const hasUnsettledExpenses = await prisma.expenseShare.findFirst({
      where: {
        userId: memberId,
        expense: {
          groupId: groupId,
        },
      },
    });

    if (hasUnsettledExpenses) {
      return NextResponse.json(
        { message: "Cannot remove member with unsettled expenses", data: {} },
        { status: 400 }
      );
    }

    await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        members: {
          disconnect: {
            id: memberId,
          },
        },
      },
    });

    revalidatePath("/dashboard/groups/[groupId]", "page");

    return NextResponse.json(
      { message: "Member removed successfully", data: {} },
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
