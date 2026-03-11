import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskStore, submissionStore } from "@/storage";
import type {
    Task,
    TaskFilters,
    TaskFormValues,
    BulkUpdateTaskPayload,
    Submission,
    SubmissionFilters,
    SubmissionFormValues,
} from "@/libs/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
// Centralised to make invalidation predictable

export const taskKeys = {
    all: ["tasks"] as const,
    list: (filters?: TaskFilters) => ["tasks", "list", filters] as const,
    detail: (id: string) => ["tasks", "detail", id] as const,
};

export const submissionKeys = {
    all: ["submissions"] as const,
    list: (filters?: SubmissionFilters) =>
        ["submissions", "list", filters] as const,
    byTask: (taskId: string) => ["submissions", "task", taskId] as const,
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
        onSuccess: (sub: Submission) => {
            qc.invalidateQueries({ queryKey: submissionKeys.all });
            qc.invalidateQueries({ queryKey: submissionKeys.byTask(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.detail(sub.task_id) });
            qc.invalidateQueries({ queryKey: taskKeys.all });
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