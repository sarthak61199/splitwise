import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const updateGroupSchema = createGroupSchema.partial();

export const addMemberSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid Email"),
});

export type CreateGroupType = z.infer<typeof createGroupSchema>;
export type UpdateGroupType = z.infer<typeof updateGroupSchema>;
export type AddMemberType = z.infer<typeof addMemberSchema>;
