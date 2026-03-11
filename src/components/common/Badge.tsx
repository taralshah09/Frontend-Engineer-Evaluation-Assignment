import React from "react";
import { TASK_TYPE_META } from "../../data/microtaskData";

interface BadgeProps {
    status: string;
}

export function Badge({ status }: BadgeProps) {
    const map: Record<string, [string, string]> = {
        active: ["badge-active", "Active"],
        pending: ["badge-pending", "Pending"],
        approved: ["badge-active", "Approved"],
        rejected: ["badge-rejected", "Rejected"],
        completed: ["badge-completed", "Completed"],
        paused: ["badge-pending", "Paused"],
    };
    const [cls, label] = map[status] || ["badge-completed", status];
    return <span className={`badge ${cls}`}><span className="badge-dot" />{label}</span>;
}

interface TypeBadgeProps {
    type: keyof typeof TASK_TYPE_META;
}

export function TypeBadge({ type }: TypeBadgeProps) {
    const meta = TASK_TYPE_META[type];
    return <span className={`badge ${meta.color}`}>{meta.icon} {meta.label}</span>;
}
