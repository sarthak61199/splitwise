import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { createExpense } from "@/validation/expenses";
import { idSchema } from "@/validation/id";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getSession();

  const userId = session?.id as string;

  const groupId = (await params).groupId;

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
    const expenses = await prisma.expense.findMany({
      where: {
        groupId: groupId,
      },
      select: {
        paidBy: {
          select: {
            id: true,
            name: true,
          },
        },
        id: true,
        date: true,
        description: true,
        amount: true,
        shares: {
          select: {
            amount: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Expenses fetched successfully",
        data: {
          expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
        },
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

    const bodyValid = createExpense.safeParse(body);

    if (!bodyValid.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          data: bodyValid.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { description, amount, paidById, shares, date } = bodyValid.data;

    const groupMembers = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      select: {
        members: {
          select: {
            id: true,
          },
        },
      },
    });

    const memberIds = new Set(groupMembers?.members.map((m) => m.id));
    const allUsersAreMembers = shares.every((share) =>
      memberIds.has(share.userId)
    );

    if (!allUsersAreMembers) {
      return NextResponse.json(
        { message: "All users must be group members", data: {} },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          description: description.trim(),
          amount,
          groupId: groupId,
          paidById,
          date,
        },
      });

      await tx.expenseShare.createMany({
        data: shares.map((share) => ({
          expenseId: newExpense.id,
          userId: share.userId,
          amount: share.amount,
        })),
      });
    });

    return NextResponse.json(
      { message: "Expense created successfully", data: {} },
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
