import { z } from "zod";

/**
 * Schemas used with react-hook-form + zodResolver across the app.
 * Adjust constraints as needed for your UX rules.
 */

/* Subtask schema */
export const SubtaskSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, { message: "Subtask title is required" })
    .max(200, { message: "Subtask title is too long" }),
});

/* Add Task schema */
export const AddTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().or(z.literal("")),
  columnId: z.string().min(1, { message: "Column is required" }),
  subtasks: z
    .array(SubtaskSchema)
    .min(0)
    .transform((arr) =>
      // normalize: keep subtasks but callers can filter empty titles if desired
      arr.map((s) => ({
        id: s.id ?? crypto?.randomUUID?.() ?? "",
        title: s.title,
      }))
    ),
});

/* Add Team schema */
export const AddTeamSchema = z.object({
  teamName: z.string().min(1, { message: "Team name is required" }),
  users: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        avatar: z.string().optional(),
        email: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

/* Edit Team schema - same as Add Team but for editing */
export const EditTeamSchema = AddTeamSchema;

/* Add/Edit Board schema */
export const BoardSchema = z.object({
  name: z.string().min(1, { message: "Board name is required" }),
  columns: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, { message: "Column name is required" }),
      })
    )
    .min(0)
    .default([]),
});

/* Add User schema (for admin user creation) */
export const AddUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.string().min(1, { message: "Role is required" }),
});

/* Edit User schema (for admin user update) */
export const EditUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  avatar: z
    .string()
    .url({ message: "Invalid avatar URL" })
    .optional()
    .or(z.literal("")),
});

/* Sign up schema */
export const SignUpSchema = z.object({
  name: z.string().optional().or(z.literal("")),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

/* Sign in schema */
export const SignInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

/* View Task / Edit Task schema */
export const SubtaskWithCompletedSchema = SubtaskSchema.extend({
  completed: z.boolean().default(false),
});

export const ViewTaskSchema = AddTaskSchema.extend({
  subtasks: z.array(SubtaskWithCompletedSchema).default([]),
});

/* Type exports for convenience */
/* Use z.infer for validated (output) types, and z.input for the raw form input types */
export type AddTaskFormValues = z.infer<typeof AddTaskSchema>;
export type AddTaskInput = z.input<typeof AddTaskSchema>;

export type AddTeamFormValues = z.infer<typeof AddTeamSchema>;
export type AddTeamInput = z.input<typeof AddTeamSchema>;

export type BoardFormValues = z.infer<typeof BoardSchema>;
export type BoardInput = z.input<typeof BoardSchema>;

export type SignUpFormValues = z.infer<typeof SignUpSchema>;
export type SignUpInput = z.input<typeof SignUpSchema>;

export type SignInFormValues = z.infer<typeof SignInSchema>;
export type SignInInput = z.input<typeof SignInSchema>;

export type ViewTaskFormValues = z.infer<typeof ViewTaskSchema>;
export type ViewTaskInput = z.input<typeof ViewTaskSchema>;

export type AddUserFormValues = z.infer<typeof AddUserSchema>;
export type AddUserInput = z.input<typeof AddUserSchema>;

export type EditUserFormValues = z.infer<typeof EditUserSchema>;
export type EditUserInput = z.input<typeof EditUserSchema>;

export type EditTeamFormValues = z.infer<typeof EditTeamSchema>;
export type EditTeamInput = z.input<typeof EditTeamSchema>;
