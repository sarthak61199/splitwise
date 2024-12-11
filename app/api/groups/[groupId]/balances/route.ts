import prisma from "@/lib/db";
import { getSession } from "@/lib/token";
import { simplifyDebts } from "@/utils/simplify-debts";
import { idSchema } from "@/validation/id";
import { NextResponse } from "next/server";

export async function GET(
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

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

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

    group?.members.forEach((member) => {
      balances[member.id] = 0;
    });

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

    const simplifiedTransactions = simplifyDebts(balances);

    const memberMap = new Map(group?.members.map((m) => [m.id, m]));
    const transactions = simplifiedTransactions.map((transaction) => ({
      amount: Number(transaction.amount),
      fromUser: memberMap.get(transaction.from),
      toUser: memberMap.get(transaction.to),
    }));

    return NextResponse.json(
      {
        message: "Balances fetched successfully",
        data: { balances: transactions },
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
