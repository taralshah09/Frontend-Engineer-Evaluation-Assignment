import type {
    Task,
    TaskFormValues,
    Submission,
    SubmissionFormValues,
    User,
    Campaign,
    TaskFilters,
    SubmissionFilters,
    BulkUpdateTaskPayload,
    Session,
} from "../libs/types";
import { nanoid } from "nanoid";

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
    USERS: "mt_users",
    TASKS: "mt_tasks",
    SUBMISSIONS: "mt_submissions",
    CAMPAIGNS: "mt_campaigns",
    SESSION: "mt_session",
} as const;

// ─── Delay helpers ────────────────────────────────────────────────────────────

const randomDelay = (min: number, max: number) =>
    new Promise((res) => setTimeout(res, Math.random() * (max - min) + min));

const readDelay = () => randomDelay(800, 2000);
const writeDelay = () => randomDelay(2000, 4000);

const maybeThrow = (label: string) => {
    if (Math.random() < 0.08) {
        throw new Error(`[MockServer] ${label} failed — simulated network error.`);
    }
};

// ─── Generic helpers ──────────────────────────────────────────────────────────

function getAll<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
    } catch {
        return [];
    }
}

function setAll<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
}

// ─── Session / Auth ───────────────────────────────────────────────────────────

export const sessionStorage = {
    get(): Session | null {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem(KEYS.SESSION);
            return raw ? (JSON.parse(raw) as Session) : null;
        } catch {
            return null;
        }
    },

    set(session: Session): void {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    },

    clear(): void {
        localStorage.removeItem(KEYS.SESSION);
    },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authStore = {
    async login(
        username: string,
        password: string
    ): Promise<{ session: Session; user: User }> {
        await writeDelay();

        if (username === "admin" && password === "admin") {
            const users = getAll<User>(KEYS.USERS);
            const adminUser = users.find((u) => u.id === "user_admin");
            if (!adminUser) throw new Error("Admin user not found in seed data.");

            const session: Session = {
                userId: adminUser.id,
                role: "admin",
                username: adminUser.username,
                email: adminUser.email,
            };
            sessionStorage.set(session);
            return { session, user: adminUser };
        }

        const users = getAll<User>(KEYS.USERS);
        let user = users.find(
            (u) => u.username.toLowerCase() === username.toLowerCase() && u.role === "worker"
        );

        if (!user) {
            user = {
                id: `user_${nanoid(8)}`,
                username,
                email: `${username}@example.com`,
                role: "worker",
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
                created_at: new Date().toISOString(),
                total_earned: 0,
                total_submissions: 0,
                approved_submissions: 0,
            };
            users.push(user);
            setAll(KEYS.USERS, users);
        }

        const session: Session = {
            userId: user.id,
            role: "worker",
            username: user.username,
            email: user.email,
        };
        sessionStorage.set(session);
        return { session, user };
    },

    async logout(): Promise<void> {
        await randomDelay(300, 600);
        sessionStorage.clear();
    },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const userStore = {
    async getById(id: string): Promise<User | null> {
        await readDelay();
        const users = getAll<User>(KEYS.USERS);
        return users.find((u) => u.id === id) ?? null;
    },

    async getAll(): Promise<User[]> {
        await readDelay();
        return getAll<User>(KEYS.USERS);
    },
};

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaignStore = {
    async getAll(): Promise<Campaign[]> {
        await readDelay();
        return getAll<Campaign>(KEYS.CAMPAIGNS);
    },

    async create(name: string, description?: string): Promise<Campaign> {
        await writeDelay();
        maybeThrow("Campaign create");

        const campaigns = getAll<Campaign>(KEYS.CAMPAIGNS);
        const campaign: Campaign = {
            id: `camp_${nanoid(8)}`,
            name,
            description,
            created_at: new Date().toISOString(),
        };
        campaigns.push(campaign);
        setAll(KEYS.CAMPAIGNS, campaigns);
        return campaign;
    },
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const taskStore = {
    async getAll(filters?: TaskFilters): Promise<Task[]> {
        await readDelay();
        let tasks = getAll<Task>(KEYS.TASKS);

        if (filters?.status) {
            tasks = tasks.filter((t) => t.status === filters.status);
        }
        if (filters?.task_type) {
            tasks = tasks.filter((t) => t.task_type === filters.task_type);
        }
        if (filters?.campaign_id) {
            tasks = tasks.filter((t) => t.campaign_id === filters.campaign_id);
        }
        if (filters?.search) {
            const q = filters.search.toLowerCase();
            tasks = tasks.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.description.toLowerCase().includes(q)
            );
        }

        return tasks;
    },

    async getById(id: string): Promise<Task | null> {
        await readDelay();
        const tasks = getAll<Task>(KEYS.TASKS);
        return tasks.find((t) => t.id === id) ?? null;
    },

    async create(values: TaskFormValues): Promise<Task> {
        await writeDelay();
        maybeThrow("Task create");

        const tasks = getAll<Task>(KEYS.TASKS);
        const now = new Date().toISOString();
        const task: Task = {
            id: `task_${nanoid(8)}`,
            ...values,
            status: "active",
            created_at: now,
            updated_at: now,
            submissions_count: 0,
            approved_count: 0,
        };
        tasks.push(task);
        setAll(KEYS.TASKS, tasks);
        return task;
    },

    async update(id: string, values: Partial<TaskFormValues>): Promise<Task> {
        await writeDelay();
        maybeThrow("Task update");

        const tasks = getAll<Task>(KEYS.TASKS);
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error(`Task ${id} not found`);

        tasks[idx] = {
            ...tasks[idx],
            ...values,
            updated_at: new Date().toISOString(),
        };
        setAll(KEYS.TASKS, tasks);
        return tasks[idx];
    },

    async delete(id: string): Promise<void> {
        await writeDelay();
        maybeThrow("Task delete");

        const tasks = getAll<Task>(KEYS.TASKS).filter((t) => t.id !== id);
        setAll(KEYS.TASKS, tasks);

        const subs = getAll<Submission>(KEYS.SUBMISSIONS).filter(
            (s) => s.task_id !== id
        );
        setAll(KEYS.SUBMISSIONS, subs);
    },

    async bulkUpdate(payload: BulkUpdateTaskPayload): Promise<Task[]> {
        await writeDelay();
        maybeThrow("Bulk update");

        const tasks = getAll<Task>(KEYS.TASKS);
        const updated: Task[] = [];

        for (const id of payload.ids) {
            const idx = tasks.findIndex((t) => t.id === id);
            if (idx !== -1) {
                tasks[idx] = {
                    ...tasks[idx],
                    ...payload.updates,
                    updated_at: new Date().toISOString(),
                };
                updated.push(tasks[idx]);
            }
        }

        setAll(KEYS.TASKS, tasks);
        return updated;
    },

    _updateCounts(taskId: string): void {
        const tasks = getAll<Task>(KEYS.TASKS);
        const subs = getAll<Submission>(KEYS.SUBMISSIONS).filter(
            (s) => s.task_id === taskId
        );
        const idx = tasks.findIndex((t) => t.id === taskId);
        if (idx === -1) return;

        tasks[idx].submissions_count = subs.length;
        tasks[idx].approved_count = subs.filter((s) => s.status === "approved").length;

        if (tasks[idx].approved_count >= tasks[idx].amount) {
            tasks[idx].status = "completed";
        }

        setAll(KEYS.TASKS, tasks);
    },
};

// ─── Submissions ──────────────────────────────────────────────────────────────

export const submissionStore = {
    async getAll(filters?: SubmissionFilters): Promise<Submission[]> {
        await readDelay();
        let subs = getAll<Submission>(KEYS.SUBMISSIONS);

        if (filters?.status) {
            subs = subs.filter((s) => s.status === filters.status);
        }
        if (filters?.task_id) {
            subs = subs.filter((s) => s.task_id === filters.task_id);
        }
        if (filters?.user_id) {
            subs = subs.filter((s) => s.user_id === filters.user_id);
        }

        return subs.sort(
            (a, b) =>
                new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
    },

    async getByTaskId(taskId: string): Promise<Submission[]> {
        await readDelay();
        return getAll<Submission>(KEYS.SUBMISSIONS)
            .filter((s) => s.task_id === taskId)
            .sort(
                (a, b) =>
                    new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
            );
    },

    async create(
        taskId: string,
        userId: string,
        values: SubmissionFormValues
    ): Promise<Submission> {
        await writeDelay();
        maybeThrow("Submission create");

        const subs = getAll<Submission>(KEYS.SUBMISSIONS);
        const now = new Date().toISOString();

        const base = {
            id: `sub_${nanoid(8)}`,
            task_id: taskId,
            user_id: userId,
            status: "pending" as const,
            submitted_at: now,
            screenshot_url: values.screenshot_url,
        };

        let submission: Submission;

        if (
            values.task_type === "social_media_posting" ||
            values.task_type === "social_media_liking"
        ) {
            submission = {
                ...base,
                task_type: values.task_type,
                post_url: values.post_url,
            } as Submission;
        } else {
            submission = {
                ...base,
                task_type: "email_sending",
                email_content: values.email_content,
            } as Submission;
        }

        subs.push(submission);
        setAll(KEYS.SUBMISSIONS, subs);
        taskStore._updateCounts(taskId);

        const users = getAll<User>(KEYS.USERS);
        const userIdx = users.findIndex((u) => u.id === userId);
        if (userIdx !== -1) {
            users[userIdx].total_submissions += 1;
            setAll(KEYS.USERS, users);
        }

        return submission;
    },

    async approve(submissionId: string): Promise<Submission> {
        await writeDelay();
        maybeThrow("Submission approve");

        const subs = getAll<Submission>(KEYS.SUBMISSIONS);
        const idx = subs.findIndex((s) => s.id === submissionId);
        if (idx === -1) throw new Error(`Submission ${submissionId} not found`);

        subs[idx] = {
            ...subs[idx],
            status: "approved",
            reviewed_at: new Date().toISOString(),
        };
        setAll(KEYS.SUBMISSIONS, subs);

        taskStore._updateCounts(subs[idx].task_id);

        const tasks = getAll<Task>(KEYS.TASKS);
        const task = tasks.find((t) => t.id === subs[idx].task_id);
        if (task) {
            const users = getAll<User>(KEYS.USERS);
            const userIdx = users.findIndex((u) => u.id === subs[idx].user_id);
            if (userIdx !== -1) {
                users[userIdx].total_earned += task.reward;
                users[userIdx].approved_submissions += 1;
                setAll(KEYS.USERS, users);
            }
        }

        return subs[idx];
    },

    async reject(submissionId: string, reason?: string): Promise<Submission> {
        await writeDelay();
        maybeThrow("Submission reject");

        const subs = getAll<Submission>(KEYS.SUBMISSIONS);
        const idx = subs.findIndex((s) => s.id === submissionId);
        if (idx === -1) throw new Error(`Submission ${submissionId} not found`);

        subs[idx] = {
            ...subs[idx],
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            rejection_reason: reason,
        };
        setAll(KEYS.SUBMISSIONS, subs);
        taskStore._updateCounts(subs[idx].task_id);

        return subs[idx];
    },
};