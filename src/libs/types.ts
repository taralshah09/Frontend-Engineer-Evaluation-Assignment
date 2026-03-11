export type TaskType =
  | "social_media_posting"
  | "email_sending"
  | "social_media_liking";

export type TaskStatus = "active" | "paused" | "completed";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type UserRole = "admin" | "worker";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  total_earned: number;
  total_submissions: number;
  approved_submissions: number;
}

export interface Session {
  userId: string;
  role: UserRole;
  username: string;
  email: string;
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  task_type: TaskType;
  title: string;
  description: string;
  details: string;
  amount: number;
  reward: number;
  allow_multiple_submissions: boolean;
  campaign_id: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  approved_count: number;
}

export interface TaskFormValues {
  task_type: TaskType;
  title: string;
  description: string;
  details: string;
  amount: number;
  reward: number;
  allow_multiple_submissions: boolean;
  campaign_id: string;
}

// ─── Submission ───────────────────────────────────────────────────────────────

// Base submission fields shared across all task types
interface SubmissionBase {
  id: string;
  task_id: string;
  user_id: string;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  screenshot_url: string;
}

export interface SocialMediaSubmission extends SubmissionBase {
  task_type: "social_media_posting" | "social_media_liking";
  post_url: string;
}

export interface EmailSubmission extends SubmissionBase {
  task_type: "email_sending";
  email_content: string;
}

export type Submission = SocialMediaSubmission | EmailSubmission;

export type SubmissionFormValues =
  | {
    task_type: "social_media_posting" | "social_media_liking";
    post_url: string;
    screenshot_url: string;
  }
  | {
    task_type: "email_sending";
    email_content: string;
    screenshot_url: string;
  };

// ─── Campaign ─────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

// ─── API / Storage response wrappers ─────────────────────────────────────────

export interface StorageResult<T> {
  data: T;
  error: null;
}

export interface StorageError {
  data: null;
  error: string;
}

export type StorageResponse<T> = StorageResult<T> | StorageError;

// ─── Filters & Sorting ────────────────────────────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus;
  task_type?: TaskType;
  campaign_id?: string;
  search?: string;
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  task_id?: string;
  user_id?: string;
  search?: string;
}

export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  order: SortOrder;
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export interface BulkUpdateTaskPayload {
  ids: string[];
  updates: Partial<Pick<Task, "amount" | "campaign_id" | "status">>;
}