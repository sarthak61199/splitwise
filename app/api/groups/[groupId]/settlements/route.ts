import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { simplifyDebts } from "@/utils/simplify-debts";
import { idSchema } from "@/validation/id";
import { createSettlementSchema } from "@/validation/settlements";
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

    const settlements = await prisma.settlement.findMany({
      where: {
        groupId,
      },
      select: {
        id: true,
        amount: true,
        date: true,
        fromUser: {
          select: {
            name: true,
          },
        },
        toUser: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(
      {
        message: "Settlements fetched successfully",
        data: {
          settlements: settlements.map((s) => ({
            ...s,
            amount: Number(s.amount),
          })),
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

  const bodyValid = createSettlementSchema.safeParse(body);

  if (!bodyValid.success) {
    return NextResponse.json(
      { message: "Invalid data", data: bodyValid.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { fromUserId, toUserId, amount } = bodyValid.data;

  try {
    const expenses = await prisma.expense.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        shares: true,
      },
    });

    const settlements = await prisma.settlement.findMany({
      where: {
        groupId: groupId,
      },
    });

    const balances: Record<string, number> = {};

    expenses.forEach((expense) => {
      balances[expense.paidById] =
        (balances[expense.paidById] || 0) + Number(expense.amount);
      expense.shares.forEach((share) => {
        balances[share.userId] =
          (balances[share.userId] || 0) - Number(share.amount);
      });
    });

    settlements.forEach((settlement) => {
      balances[settlement.fromUserId] += Number(settlement.amount);
      balances[settlement.toUserId] -= Number(settlement.amount);
    });

    const simplifiedDebts = simplifyDebts(balances);

    const validSettlement = simplifiedDebts.some(
      (debt) =>
        debt.from === fromUserId &&
        debt.to === toUserId &&
        amount <= debt.amount
    );

    if (!validSettlement) {
      return NextResponse.json(
        { error: "Invalid settlement: does not match any current debts" },
        { status: 400 }
      );
    }

    await prisma.settlement.create({
      data: {
        groupId: groupId,
        fromUserId,
        toUserId,
        amount,
        date: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Settlement recorded successfully",
      },
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
