import { z } from "zod";

export const idSchema = z.string().min(1, "Id is required").cuid2();
