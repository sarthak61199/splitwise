import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { updateGroupSchema } from "@/validation/groups";
import { idSchema } from "@/validation/id";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getSession();

    const userId = session?.id as string;

    const groupIdUnsafe = (await params).groupId;

    const valid = idSchema.safeParse(groupIdUnsafe);

    if (!valid.success) {
      return NextResponse.json(
        { message: "Invalid data", data: valid.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const groupId = valid.data;

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

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        name: true,
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Group not found", data: {} },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Group fetched sucessfully", data: { group } },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: {} },
      { status: 500 }
    );
  }

  redirect("/dashboard");
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getSession();

    const userId = session?.id as string;

    const groupIdUnsafe = (await params).groupId;

    const valid = idSchema.safeParse(groupIdUnsafe);

    if (!valid.success) {
      return NextResponse.json(
        { message: "Invalid data", data: valid.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const groupId = valid.data;

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

    const hasUnsettledExpenses = await prisma.expense.findFirst({
      where: {
        groupId: groupId,
        shares: {
          some: {
            amount: {
              not: 0,
            },
          },
        },
      },
    });

    if (hasUnsettledExpenses) {
      return NextResponse.json(
        { message: "Cannot delete group with unsettled expenses", data: {} },
        { status: 400 }
      );
    }

    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    NextResponse.json(
      { message: "Group deleted sucessfully", data: {} },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: {} },
      { status: 500 }
    );
  }

  redirect("/dashboard");
}

export async function PUT(
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

    const bodyValid = updateGroupSchema.safeParse(body);

    if (!bodyValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: bodyValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name } = bodyValid.data;

    await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        name,
      },
    });

    revalidatePath("/dashboard");

    return NextResponse.json(
      { message: "Group updated sucessfully", data: {} },
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
