import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskStore, submissionStore, campaignStore, userStore } from "@/storage";
import type {
    Task,
    TaskFilters,
    TaskFormValues,
    BulkUpdateTaskPayload,
    Campaign,
    Submission,
    SubmissionFilters,
    SubmissionFormValues,
    User,
} from "@/libs/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
// Centralised to make invalidation predictable

export const taskKeys = {
    all: ["tasks"] as const,
    list: (filters?: TaskFilters) => ["tasks", "list", filters] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
};

export const userKeys = {
    all: ["users"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
};

export const submissionKeys = {
    all: ["submissions"] as const,
    list: (filters?: SubmissionFilters) =>
        ["submissions", "list", filters] as const,
    byTask: (taskId: string) => ["submissions", "task", taskId] as const,
};

export const campaignKeys = {
    all: ["campaigns"] as const,
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(filters?: TaskFilters) {
    return useQuery({
        queryKey: taskKeys.list(filters),
        queryFn: () => taskStore.getAll(filters),
    });
}

export function useTask(id: string) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => taskStore.getById(id),
        enabled: !!id,
    });
}

export function useCreateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values: TaskFormValues) => taskStore.create(values),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

export function useUpdateTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, values }: { id: string; values: Partial<Task> }) =>
            taskStore.update(id, values as Partial<TaskFormValues>),
        onSuccess: (updated: Task) => {
            qc.invalidateQueries({ queryKey: taskKeys.all });
            qc.setQueryData(taskKeys.detail(updated.id), updated);
        },
    });
}

export function useDeleteTask() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => taskStore.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.all });
        },
    });
}

export function useBulkUpdateTasks() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkUpdateTaskPayload) =>
            taskStore.bulkUpdate(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function useSubmissions(filters?: SubmissionFilters) {
    return useQuery({
        queryKey: submissionKeys.list(filters),
        queryFn: () => submissionStore.getAll(filters),
    });
}

export function useTaskSubmissions(taskId: string) {
    return useQuery({
        queryKey: submissionKeys.byTask(taskId),
        queryFn: () => submissionStore.getByTaskId(taskId),
        enabled: !!taskId,
    });
}

export function useCreateSubmission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            taskId,
            userId,
            values,
        }: {
            taskId: string;
            userId: string;
            values: SubmissionFormValues;
        }) => submissionStore.create(taskId, userId, values),
        onMutate: async ({ taskId, userId, values }) => {
            // Cancel any outgoing refetches
            await qc.cancelQueries({ queryKey: submissionKeys.all });
            await qc.cancelQueries({ queryKey: userKeys.detail(userId) });

            // Snapshot the previous value
            const previousSubmissions = qc.getQueryData(submissionKeys.list({ user_id: userId }));
            const previousUser = qc.getQueryData<User>(userKeys.detail(userId));

            // Optimistically update to the new value
            if (previousSubmissions) {
                const optimisticSub = {
                    id: `temp-${Date.now()}`,
                    task_id: taskId,
                    user_id: userId,
                    status: "pending" as const,
                    submitted_at: new Date().toISOString(),
                    ...values
                };
                qc.setQueryData(submissionKeys.list({ user_id: userId }), [optimisticSub, ...(previousSubmissions as any[])]);
            }

            if (previousUser) {
                qc.setQueryData(userKeys.detail(userId), {
                    ...previousUser,
                    total_submissions: previousUser.total_submissions + 1,
                });
            }

            return { previousSubmissions, previousUser };
        },
        onError: (err, variables, context) => {
            if (context?.previousSubmissions) {
                qc.setQueryData(submissionKeys.list({ user_id: variables.userId }), context.previousSubmissions);
            }
            if (context?.previousUser) {
                qc.setQueryData(userKeys.detail(variables.userId), context.previousUser);
            }
        },
        onSuccess: (sub: Submission) => {
            qc.invalidateQueries({ queryKey: submissionKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.byTask(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.detail(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.all });
            qc.invalidateQueries({ queryKey: userKeys.detail(sub.user_id) });
        },
    });
}

export function useApproveSubmission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => submissionStore.approve(id),
        onSuccess: (sub: Submission) => {
            qc.invalidateQueries({ queryKey: submissionKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.byTask(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.detail(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

export function useRejectSubmission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            submissionStore.reject(id, reason),
        onSuccess: (sub: Submission) => {
            qc.invalidateQueries({ queryKey: submissionKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.byTask(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.detail(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.all });
        },
    });
}

export function useCampaigns() {
    return useQuery<Campaign[]>({
        queryKey: campaignKeys.all,
        queryFn: () => campaignStore.getAll(),
    });
}

export function useCreateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values: { name: string; description?: string }) =>
            campaignStore.create(values.name, values.description),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
        },
    });
}

export function useDeleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignStore.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            qc.invalidateQueries({ queryKey: taskKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.all });
        },
    });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useUser(id: string) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => userStore.getById(id),
        enabled: !!id,
    });
}