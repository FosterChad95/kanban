import { z } from "zod";

// Common schemas
export const IdParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Board schemas
export const CreateBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").trim(),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, "Column name is required").trim(),
      })
    )
    .optional()
    .default([]),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").trim().optional(),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Column name is required").trim(),
      })
    )
    .optional(),
  teamIds: z.array(z.string()).optional(),
}).passthrough(); // Allow additional properties for Prisma compatibility

// Task schemas
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").trim(),
  description: z.string().optional(),
  columnId: z.string().min(1, "Column ID is required"),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, "Subtask title is required").trim(),
        isCompleted: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
}).passthrough(); // Allow additional properties for Prisma compatibility

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").trim().optional(),
  description: z.string().optional(),
  columnId: z.string().min(1, "Column ID is required").optional(),
  subtasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Subtask title is required").trim(),
        completed: z.boolean(),
      })
    )
    .optional(),
}).passthrough(); // Allow additional properties for Prisma compatibility

// Team schemas
export const CreateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").trim(),
});

export const UpdateTeamSchema = z.object({
  teamName: z.string().min(1, "Team name is required").trim(),
  users: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  boards: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const AddUserToTeamSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  teamId: z.string().min(1, "Team ID is required"),
});

// User schemas
export const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required").trim().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").trim().optional(),
  email: z.string().email("Invalid email address").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

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