// lib/validations.ts
// Zod schemas for all forms in the application.

import { z } from "zod";

// ─── Task Composer ────────────────────────────────────────────────────────────

export const taskSchema = z.object({
    task_type: z.enum(["social_media_posting", "email_sending", "social_media_liking"], {
        required_error: "Please select a task type",
    }),
    title: z
        .string()
        .min(5, "Title must be at least 5 characters")
        .max(120, "Title must be under 120 characters"),
    description: z
        .string()
        .max(300, "Description must be under 300 characters")
        .optional()
        .or(z.literal("")),
    details: z
        .string()
        .min(20, "Please provide detailed task instructions (min 20 characters)"),
    amount: z
        .number({ invalid_type_error: "Amount must be a number" })
        .int("Amount must be a whole number")
        .min(1, "At least 1 submission required")
        .max(100_000, "Amount seems too large"),
    reward: z
        .number({ invalid_type_error: "Reward must be a number" })
        .min(0.5, "Minimum reward is $0.50 AUD")
        .max(500, "Maximum reward is $500 AUD"),
    allow_multiple_submissions: z.boolean().default(false),
    campaign_id: z.string().min(1, "Please select or create a campaign"),
});

export type TaskSchema = z.infer<typeof taskSchema>;

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    username: z
        .string()
        .min(2, "Username must be at least 2 characters")
        .max(30, "Username too long")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    password: z.string().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ─── Submission forms (discriminated union by task type) ───────────────────────

const screenshotField = z
    .string()
    .min(1, "Please upload a screenshot as evidence");

export const socialMediaSubmissionSchema = z.object({
    task_type: z.enum(["social_media_posting", "social_media_liking"]),
    post_url: z
        .string()
        .url("Please enter a valid URL (e.g. https://twitter.com/...)")
        .min(1, "Post URL is required"),
    screenshot_url: screenshotField,
});

export const emailSubmissionSchema = z.object({
    task_type: z.literal("email_sending"),
    email_content: z
        .string()
        .min(50, "Email content must be at least 50 characters")
        .max(5000, "Email content is too long"),
    screenshot_url: screenshotField,
});

export type SocialMediaSubmissionSchema = z.infer<
    typeof socialMediaSubmissionSchema
>;
export type EmailSubmissionSchema = z.infer<typeof emailSubmissionSchema>;

// ─── Submission review (reject with reason) ───────────────────────────────────

export const rejectSchema = z.object({
    reason: z
        .string()
        .min(10, "Please provide a reason (min 10 characters)")
        .max(500, "Reason too long"),
});

export type RejectSchema = z.infer<typeof rejectSchema>;

// ─── Bulk edit tasks ──────────────────────────────────────────────────────────

export const bulkEditSchema = z.object({
    amount: z
        .number()
        .int()
        .min(1)
        .max(100_000)
        .optional(),
    campaign_id: z.string().optional(),
    status: z.enum(["active", "paused", "completed"]).optional(),
}).refine(
    (data) =>
        data.amount !== undefined ||
        data.campaign_id !== undefined ||
        data.status !== undefined,
    { message: "At least one field must be updated" }
);

export type BulkEditSchema = z.infer<typeof bulkEditSchema>;