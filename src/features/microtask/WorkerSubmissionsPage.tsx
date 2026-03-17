import React, { useState } from "react";
import { useSubmissions, useTasks, useCampaigns } from "@/features/hooks";
import { TypeBadge } from "@/components/common/Badge";
import { MdSearch, MdInbox, MdCheckCircle, MdCancel, MdHourglassEmpty, MdFilterList } from "react-icons/md";
import type { Session, SubmissionStatus } from "@/libs/types";

interface WorkerSubmissionsPageProps {
    session: Session;
}

export function WorkerSubmissionsPage({ session }: WorkerSubmissionsPageProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");

    const { data: mySubs = [], isLoading } = useSubmissions({ user_id: session.userId });
    const { data: tasks = [] } = useTasks();
    const { data: campaigns = [] } = useCampaigns();

    const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c.name]));
    const getCampaignName = (id: string) => campaignMap[id] || id;

    const filtered = mySubs
        .filter(sub => {
            if (statusFilter !== "all" && sub.status !== statusFilter) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            const task = tasks.find(t => t.id === sub.task_id);
            return (
                task?.title.toLowerCase().includes(q) ||
                sub.task_id.toLowerCase().includes(q)
            );
        });

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14, gap: 8 }}>
                <MdHourglassEmpty size={18} /> Loading your submissions…
            </div>
        );
    }

    return (
        <div className="animate-in">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div className="search-wrap">
                    <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><MdSearch size={16} /></span>
                    <input
                        className="input input-sm"
                        style={{ width: 240 }}
                        placeholder="Search by task title or ID…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                    <MdFilterList size={18} color="var(--text-muted)" />
                    <select 
                        className="select select-sm" 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="table-card" style={{ overflow: "hidden" }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Reward</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(sub => {
                            const task = tasks.find(t => t.id === sub.task_id);
                            return (
                                <tr key={sub.id} className="animate-up">
                                    <td>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{task?.title || sub.task_id}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{task ? getCampaignName(task.campaign_id) : ""}</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                                    </td>
                                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                        {new Date(sub.submitted_at).toLocaleDateString("en-AU", { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ fontSize: 13, fontWeight: 700, color: "var(--indigo)" }}>
                                        ${(task?.reward ?? 0).toFixed(2)}
                                    </td>
                                    <td>
                                        {sub.status === "rejected" && sub.rejection_reason && (
                                            <div style={{ fontSize: 11, color: "var(--rose)", fontStyle: "italic" }}>
                                                Reason: {sub.rejection_reason}
                                            </div>
                                        )}
                                        {sub.status === "approved" && (
                                            <div style={{ fontSize: 11, color: "var(--emerald)" }}>
                                                Approved at {new Date(sub.reviewed_at!).toLocaleDateString()}
                                            </div>
                                        )}
                                        {sub.status === "pending" && (
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                                Under review
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                            <MdInbox size={48} color="var(--border)" />
                        </div>
                        <div style={{ fontWeight: 600 }}>No submissions found</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                            {search || statusFilter !== "all" ? "Try adjusting your filters." : "Start completing tasks to see them here!"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
