import { z } from "zod";
import { idSchema } from "./id";

export const createSettlementSchema = z.object({
  fromUserId: idSchema,
  toUserId: idSchema,
  amount: z.number().gt(0),
});
