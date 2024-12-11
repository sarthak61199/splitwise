import { z } from "zod";
import { idSchema } from "./id";

export const createExpense = z.object({
  description: z.string().trim().min(1, "Description is required"),
  amount: z.number().gt(0, "Amount is required"),
  paidById: z.string().min(1, "Please select who paid").cuid2(),
  date: z.date(),
  shares: z
    .object({
      userId: idSchema,
      amount: z.number(),
    })
    .array()
    .min(1, "Please select at least one member to split"),
});

export const updateExpense = createExpense.partial();

export type CreatExpenseType = z.infer<typeof createExpense>;
export type UpdateExpenseType = z.infer<typeof updateExpense>;
