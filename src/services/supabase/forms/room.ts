// services/forms/room.ts
import z from "zod";

export const newRoomSchema = z.object({
  name: z.string().min(1).trim(),
  isPublic: z.boolean(),
});

export type NewRoomFormData = z.infer<typeof newRoomSchema>;
