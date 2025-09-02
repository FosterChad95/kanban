/**
 * Base schemas that can be shared between API and form validation
 * Provides common validation patterns and can be extended for specific use cases
 */

import { z } from "zod";
import { sanitizeText, sanitizeHtml } from "../lib/sanitization";

// Common field schemas with sanitization
export const NameField = z.string().transform(sanitizeText).pipe(z.string().min(1));
export const EmailField = z.string().email().toLowerCase().trim();
export const PasswordField = z.string().min(6);
export const OptionalDescriptionField = z.string().transform(sanitizeHtml).optional();
export const IdField = z.string().min(1);
export const OptionalIdField = z.string().optional();

// Subtask schemas
export const BaseSubtaskSchema = z.object({
  id: OptionalIdField,
  title: NameField,
});

export const SubtaskWithCompletionSchema = BaseSubtaskSchema.extend({
  isCompleted: z.boolean().default(false),
});

export const SubtaskUpdateSchema = z.object({
  id: IdField,
  title: NameField,
  completed: z.boolean(),
});

// Column schemas
export const BaseColumnSchema = z.object({
  id: OptionalIdField,
  name: NameField,
});

export const ColumnArraySchema = z.array(BaseColumnSchema);

// Task schemas
export const BaseTaskSchema = z.object({
  title: NameField,
  description: OptionalDescriptionField,
});

export const TaskCreateSchema = BaseTaskSchema.extend({
  columnId: IdField,
  subtasks: z.array(SubtaskWithCompletionSchema).optional().default([]),
});

export const TaskUpdateSchema = z.object({
  title: NameField.optional(),
  description: OptionalDescriptionField,
  columnId: IdField.optional(),
  subtasks: z.array(SubtaskUpdateSchema).optional(),
});

// Board schemas  
export const BaseBoardSchema = z.object({
  name: NameField,
  columns: ColumnArraySchema.optional().default([]),
});

export const BoardCreateSchema = BaseBoardSchema;

export const BoardUpdateSchema = z.object({
  name: NameField.optional(),
  columns: ColumnArraySchema.optional(),
  teamIds: z.array(IdField).optional(),
});

// User schemas
export const BaseUserSchema = z.object({
  name: NameField,
  email: EmailField,
});

export const UserCreateSchema = BaseUserSchema.extend({
  password: PasswordField,
  role: z.string().min(1).optional(),
});

export const UserUpdateSchema = z.object({
  name: NameField.optional(),
  email: EmailField.optional(),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const UserCredentialsSchema = z.object({
  email: EmailField,
  password: PasswordField,
});

// Team schemas
export const BaseTeamSchema = z.object({
  name: NameField,
});

export const TeamCreateSchema = BaseTeamSchema;

export const TeamUpdateSchema = z.object({
  teamName: NameField,
  users: z.array(
    z.object({
      id: IdField,
      name: NameField.optional(),
    })
  ).optional().default([]),
  boards: z.array(
    z.object({
      id: IdField,
      name: NameField.optional(),
    })
  ).optional().default([]),
});

// Common parameter schemas
export const IdParamSchema = z.object({
  id: IdField,
});

// Type exports for convenience
export type BaseSubtask = z.infer<typeof BaseSubtaskSchema>;
export type BaseColumn = z.infer<typeof BaseColumnSchema>;
export type BaseTask = z.infer<typeof BaseTaskSchema>;
export type BaseBoard = z.infer<typeof BaseBoardSchema>;
export type BaseUser = z.infer<typeof BaseUserSchema>;
export type BaseTeam = z.infer<typeof BaseTeamSchema>;

// Common validation utilities
export const withTrimming = <T extends z.ZodTypeAny>(schema: T) =>
  schema.transform((val: unknown) => typeof val === 'string' ? val.trim() : val);

export const withMinLength = (minLength: number, message?: string) =>
  z.string().min(minLength, message);

export const withMaxLength = (maxLength: number, message?: string) =>
  z.string().max(maxLength, message);