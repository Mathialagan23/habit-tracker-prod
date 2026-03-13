const { z } = require('zod');

// ── Enums ──────────────────────────────────
const categoryEnum = z.enum(['fitness', 'learning', 'productivity', 'mindfulness', 'health', 'other']);
const difficultyEnum = z.enum(['easy', 'medium', 'hard']);

// ── Auth ───────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Habits ─────────────────────────────────
const createHabitSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  frequency: z
    .object({
      type: z.enum(['daily', 'weekly', 'custom']).optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    })
    .optional(),
  category: categoryEnum.optional(),
  difficulty: difficultyEnum.optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
  reminderEnabled: z.boolean().optional(),
  schedule: z
    .array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
    .optional(),
});

const updateHabitSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  frequency: z
    .object({
      type: z.enum(['daily', 'weekly', 'custom']).optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    })
    .optional(),
  isArchived: z.boolean().optional(),
  category: categoryEnum.optional(),
  difficulty: difficultyEnum.optional(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
  reminderEnabled: z.boolean().optional(),
  schedule: z
    .array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/))
    .optional(),
});

// ── Logs ───────────────────────────────────
const createLogSchema = z.object({
  date: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  note: z.string().max(500).optional(),
  scheduleTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
});

// ── Users ──────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().max(500).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  createHabitSchema,
  updateHabitSchema,
  createLogSchema,
  updateProfileSchema,
  changePasswordSchema,
};
