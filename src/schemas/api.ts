import { z } from "zod";
import {
  IdParamSchema as BaseIdParamSchema,
  BoardCreateSchema,
  BoardUpdateSchema,
  TaskCreateSchema,
  TaskUpdateSchema,
  TeamCreateSchema,
  TeamUpdateSchema,
  UserCreateSchema,
  UserUpdateSchema,
} from "./base";

// Re-export base schemas with API-specific adjustments
export const IdParamSchema = BaseIdParamSchema;

// Board schemas with API-specific modifications
export const CreateBoardSchema = BoardCreateSchema;
export const UpdateBoardSchema = BoardUpdateSchema.passthrough(); // Allow additional properties for Prisma compatibility

// Task schemas with API-specific modifications
export const CreateTaskSchema = TaskCreateSchema.passthrough(); // Allow additional properties for Prisma compatibility
export const UpdateTaskSchema = TaskUpdateSchema.passthrough(); // Allow additional properties for Prisma compatibility

// Team schemas
export const CreateTeamSchema = TeamCreateSchema;
export const UpdateTeamSchema = TeamUpdateSchema;

export const AddUserToTeamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  teamId: z.string().min(1, "Team ID is required"),
});

// User schemas
export const SignupSchema = UserCreateSchema.extend({
  name: z.string().min(1, "Name is required").trim().optional(),
});
export const UpdateUserSchema = UserUpdateSchema;

// Export type helpers
export type CreateBoardData = z.infer<typeof CreateBoardSchema>;
export type UpdateBoardData = z.infer<typeof UpdateBoardSchema>;
export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
export type CreateTeamData = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamData = z.infer<typeof UpdateTeamSchema>;
export type SignupData = z.infer<typeof SignupSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;

// Extended board update interface for internal use
export interface BoardUpdatePayload {
  name?: string;
  columns?: Array<{
    id?: string;
    name: string;
  }>;
  teamIds?: string[];
}