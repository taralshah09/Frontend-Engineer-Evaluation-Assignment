import { Task } from "@/libs/types";

export type DripState = "Active" | "Waiting" | "Completed";

export interface DripStatus {
    releasedSlots: number;
    state: DripState;
    nextReleaseIn: number; // in minutes
    totalSlots: number;
}

export function calculateDripStatus(task: Task, now: Date = new Date()): DripStatus {
    if (!task.drip_enabled || !task.drip_amount || !task.drip_interval || !task.drip_start_time) {
        return {
            releasedSlots: task.amount,
            state: "Completed",
            nextReleaseIn: 0,
            totalSlots: task.amount
        };
    }

    const startTime = new Date(task.drip_start_time).getTime();
    const currentTime = now.getTime();
    const elapsedMs = Math.max(0, currentTime - startTime);
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

    // Calculate how many intervals have passed
    // At t=0, first batch is released.
    const intervalsPassed = Math.floor(elapsedMinutes / task.drip_interval);
    
    // Total slots released so far
    let releasedSlots = (intervalsPassed + 1) * task.drip_amount;
    
    // Cap at total amount
    releasedSlots = Math.min(releasedSlots, task.amount);

    const isAllReleased = releasedSlots >= task.amount;
    
    if (isAllReleased) {
        return {
            releasedSlots,
            state: "Completed",
            nextReleaseIn: 0,
            totalSlots: task.amount
        };
    }

    // Time until next release
    const nextReleaseMs = (intervalsPassed + 1) * task.drip_interval * 60 * 1000 + startTime;
    const nextReleaseIn = Math.max(0, Math.ceil((nextReleaseMs - currentTime) / (1000 * 60)));

    return {
        releasedSlots,
        state: releasedSlots > 0 ? "Active" : "Waiting",
        nextReleaseIn,
        totalSlots: task.amount
    };
}
