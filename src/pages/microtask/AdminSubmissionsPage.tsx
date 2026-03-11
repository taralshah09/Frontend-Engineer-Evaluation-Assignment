import React, { useState } from "react";
import {
    useSubmissions,
    useApproveSubmission,
    useRejectSubmission,
    useTasks,
} from "@/features/hooks";
import { Badge, TypeBadge } from "../../components/common/Badge";
import type { Submission } from "@/libs/types";

interface AdminSubmissionsPageProps {
    filterTaskId?: string;
    onClearTaskFilter?: () => void;
}

export function AdminSubmissionsPage({ filterTaskId, onClearTaskFilter }: AdminSubmissionsPageProps = {}) {
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
    const [openSub, setOpenSub] = useState<Submission | null>(null);
    const [rejecting, setRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const { data: allSubs = [], isLoading } = useSubmissions();
    const { data: tasks = [] } = useTasks();

    const approveMutation = useApproveSubmission();
    const rejectMutation = useRejectSubmission();

    const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]));

    const counts = {
        pending: allSubs.filter(s => s.status === "pending").length,
        approved: allSubs.filter(s => s.status === "approved").length,
        rejected: allSubs.filter(s => s.status === "rejected").length,
    };

    const filtered = allSubs.filter(s => {
        if (s.status !== activeTab) return false;
        if (filterTaskId && s.task_id !== filterTaskId) return false;
        return true;
    });

    const getWorkerInitials = (userId: string) => userId.split("_").map(p => p[0]).join("").toUpperCase().slice(0, 2);
    const getAvatarColor = (userId: string) => {
        const colors = ["#6366f1", "#059669", "#0284c7", "#d97706", "#e11d48", "#7c3aed"];
        let hash = 0;
        for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) % colors.length;
        return colors[hash];
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("en-AU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch { return iso; }
    };

    const handleApprove = async (sub: Submission) => {
        try {
            await approveMutation.mutateAsync(sub.id);
            showToast("✅ Submission approved!");
            setOpenSub(null);
        } catch {
            showToast("❌ Failed to approve. Please try again.");
        }
    };

    const handleReject = async (sub: Submission) => {
        try {
            await rejectMutation.mutateAsync({ id: sub.id, reason: rejectReason });
            showToast("❌ Submission rejected.");
            setOpenSub(null);
            setRejecting(false);
            setRejectReason("");
        } catch {
            showToast("❌ Failed to reject. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14 }}>
                ⏳ Loading submissions…
            </div>
        );
    }

    return (
        <>
            {filterTaskId && (
                <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "var(--indigo-light)", color: "var(--indigo)",
                        border: "1px solid #c7d2fe", borderRadius: 99,
                        padding: "4px 12px", fontSize: 12.5, fontWeight: 600,
                    }}>
                        🔗 Filtered by task: <strong>{taskMap[filterTaskId]?.title ?? filterTaskId}</strong>
                        {onClearTaskFilter && (
                            <button
                                onClick={onClearTaskFilter}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--indigo)", fontSize: 14, lineHeight: 1, padding: "0 0 0 4px", display: "flex" }}
                                title="Clear filter"
                            >✕</button>
                        )}
                    </span>
                </div>
            )}
            <div className="submissions-filter-row" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <div className="tabs">
                    {(["pending", "approved", "rejected"] as const).map(tab => (
                        <div key={tab} className={`tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span className="tab-count">{counts[tab]}</span>
                        </div>
                    ))}
                </div>
                <div className="search-wrap" style={{ marginLeft: "auto" }}>
                    <span className="search-icon">🔍</span>
                    <input className="input input-sm" style={{ width: 220 }} placeholder="Search worker or task…" />
                </div>
                <select className="select">
                    <option>All task types</option>
                    <option>Social Posting</option>
                    <option>Email Sending</option>
                    <option>Social Liking</option>
                </select>
            </div>

            <div className="table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Worker</th>
                            <th>Task</th>
                            <th>Type</th>
                            <th>Submitted</th>
                            <th>Evidence</th>
                            <th>Status</th>
                            {activeTab === "rejected" && <th>Reason</th>}
                            {activeTab === "pending" && <th style={{ width: 180 }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(sub => {
                            const task = taskMap[sub.task_id];
                            const initials = getWorkerInitials(sub.user_id);
                            const color = getAvatarColor(sub.user_id);
                            return (
                                <tr key={sub.id} onClick={() => setOpenSub(sub)}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div className="avatar avatar-sm" style={{ background: color, flexShrink: 0 }}>{initials}</div>
                                            <span style={{ fontWeight: 600, fontSize: 13 }}>{sub.user_id.replace("user_", "")}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
                                            {task?.title ?? sub.task_id}
                                        </div>
                                    </td>
                                    <td><TypeBadge type={sub.task_type as any} /></td>
                                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(sub.submitted_at)}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); setOpenSub(sub); }}>👁 Preview</button>
                                    </td>
                                    <td><Badge status={sub.status} /></td>
                                    {activeTab === "rejected" && (
                                        <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {"rejection_reason" in sub ? sub.rejection_reason ?? "—" : "—"}
                                        </td>
                                    )}
                                    {activeTab === "pending" && (
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="btn btn-success btn-xs"
                                                    onClick={() => handleApprove(sub)}
                                                    disabled={approveMutation.isPending}
                                                >
                                                    {approveMutation.isPending ? "…" : "Approve"}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-xs"
                                                    onClick={() => { setOpenSub(sub); setRejecting(true); }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">{activeTab === "pending" ? "📭" : activeTab === "approved" ? "✅" : "❌"}</div>
                        <div className="empty-title">No {activeTab} submissions</div>
                        <div className="empty-desc">{activeTab === "pending" ? "All caught up! No submissions waiting for review." : `No ${activeTab} submissions yet.`}</div>
                    </div>
                )}
            </div>

            {openSub && (
                <div className="sheet-overlay" onClick={() => { setOpenSub(null); setRejecting(false); setRejectReason(""); }}>
                    <div className="sheet sheet-wide" onClick={e => e.stopPropagation()}>
                        <div className="sheet-header">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="avatar avatar-lg" style={{ background: getAvatarColor(openSub.user_id) }}>
                                    {getWorkerInitials(openSub.user_id)}
                                </div>
                                <div>
                                    <div className="sheet-title">{openSub.user_id.replace("user_", "")}</div>
                                    <div className="sheet-subtitle">{formatDate(openSub.submitted_at)}</div>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm sheet-close" onClick={() => { setOpenSub(null); setRejecting(false); }}>✕</button>
                        </div>
                        <div className="sheet-body">
                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Task Context</div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{taskMap[openSub.task_id]?.title ?? openSub.task_id}</div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <TypeBadge type={openSub.task_type as any} />
                                    <Badge status={openSub.status} />
                                </div>
                            </div>

                            <div className="section-title">Submitted Evidence</div>
                            {(openSub.task_type === "social_media_posting" || openSub.task_type === "social_media_liking") && (
                                <div className="detail-row">
                                    <span className="detail-label">Post URL</span>
                                    <a className="detail-value" href={(openSub as any).post_url} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", textDecoration: "none" }}>
                                        {(openSub as any).post_url}
                                    </a>
                                </div>
                            )}
                            {openSub.task_type === "email_sending" && (
                                <div style={{ marginBottom: 16 }}>
                                    <div className="form-label">Email Content</div>
                                    <div className="sub-evidence-box">{(openSub as any).email_content}</div>
                                </div>
                            )}
                            <div style={{ marginBottom: 20 }}>
                                <div className="form-label" style={{ marginBottom: 8 }}>Screenshot</div>
                                <div className="screenshot-preview">
                                    <img src={openSub.screenshot_url} alt="Evidence screenshot" style={{ maxWidth: "100%" }} />
                                </div>
                            </div>

                            {(rejecting || openSub.status === "rejected") && (
                                <div style={{ background: "var(--rose-light)", border: "1px solid #fecdd3", borderRadius: "var(--radius-sm)", padding: 14 }}>
                                    <div className="form-label" style={{ color: "var(--rose)", marginBottom: 8 }}>Rejection Reason</div>
                                    {openSub.status === "rejected"
                                        ? <p style={{ fontSize: 13, color: "#9f1239" }}>{"rejection_reason" in openSub ? openSub.rejection_reason : ""}</p>
                                        : <textarea
                                            className="input"
                                            rows={3}
                                            placeholder="Explain why this submission is being rejected…"
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                        />
                                    }
                                </div>
                            )}
                        </div>
                        {openSub.status === "pending" && (
                            <div className="sheet-footer">
                                {!rejecting ? (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApprove(openSub)}
                                            disabled={approveMutation.isPending}
                                        >
                                            {approveMutation.isPending ? "⏳ Approving…" : "✓ Approve"}
                                        </button>
                                        <button className="btn btn-danger" onClick={() => setRejecting(true)}>✕ Reject</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(openSub)}
                                            disabled={rejectMutation.isPending || !rejectReason.trim()}
                                        >
                                            {rejectMutation.isPending ? "⏳ Rejecting…" : "Confirm Rejection"}
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setRejecting(false)}>Cancel</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && <div className="toast"><span className="toast-icon">{toast.startsWith("✅") ? "✅" : "❌"}</span>{toast}</div>}
        </>
    );
}
