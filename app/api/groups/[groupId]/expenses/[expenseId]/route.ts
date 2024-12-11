import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { updateExpense } from "@/validation/expenses";
import { idSchema } from "@/validation/id";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
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

  const expenseIdUnsafe = (await params).expenseId;

  const expenseIdValid = idSchema.safeParse(expenseIdUnsafe);

  if (!expenseIdValid.success) {
    return NextResponse.json(
      {
        message: "Invalid data",
        data: expenseIdValid.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const expenseId = expenseIdValid.data;

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

  try {
    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
        groupId: groupId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const formattedShares = expense.shares.map((share) => ({
      user: share.user,
      amount: Number(share.amount),
    }));

    return NextResponse.json(
      {
        message: "Expense details fetched successfully",
        data: {
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          date: expense.date,
          paidBy: expense.paidBy,
          shares: formattedShares,
        },
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "Internal server error", data: {} },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
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

    const expenseIdUnsafe = (await params).expenseId;

    const expenseIdValid = idSchema.safeParse(expenseIdUnsafe);

    if (!expenseIdValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: expenseIdValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const expenseId = expenseIdValid.data;

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

    const bodyValid = updateExpense.safeParse(body);

    if (!bodyValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: bodyValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { description, amount, paidById, shares } = bodyValid.data;

    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: {
          id: expenseId,
          groupId: groupId,
        },
        data: {
          description,
          amount,
          paidById,
          updatedAt: new Date(),
        },
      });

      await tx.expenseShare.deleteMany({
        where: {
          expenseId: expenseId,
        },
      });

      if (shares?.length) {
        await tx.expenseShare.createMany({
          data: shares.map((share) => ({
            expenseId: expenseId,
            userId: share.userId,
            amount: share.amount,
          })),
        });
      }
    });

    return NextResponse.json(
      { message: "Expense updated successfully", data: {} },
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string; expenseId: string }> }
) {
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

  const expenseIdUnsafe = (await params).expenseId;

  const expenseIdValid = idSchema.safeParse(expenseIdUnsafe);

  if (!expenseIdValid.success) {
    return NextResponse.json(
      {
        message: "Invalid data",
        data: expenseIdValid.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const expenseId = expenseIdValid.data;

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

  try {
    await prisma.$transaction(async (tx) => {
      await tx.expenseShare.deleteMany({
        where: {
          expenseId: expenseId,
        },
      });

      await tx.expense.delete({
        where: {
          id: expenseId,
          groupId: groupId,
        },
      });
    });

    return NextResponse.json(
      { message: "Expense deleted successfully", data: {} },
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
