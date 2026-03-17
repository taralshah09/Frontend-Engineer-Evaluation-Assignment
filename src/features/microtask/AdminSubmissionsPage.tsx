import React, { useState } from "react";
import {
    useSubmissions,
    useApproveSubmission,
    useRejectSubmission,
    useTasks,
    useCampaigns,
    useDeleteCampaign,
} from "@/features/hooks";
import { useQueryState } from "nuqs";
import { Badge, TypeBadge } from "../../components/common/Badge";
import type { Submission } from "@/libs/types";
import { MarkdownRenderer } from "../../components/common/MarkdownRenderer";
import {
    MdSearch,
    MdHourglassEmpty,
    MdCheckCircle,
    MdCancel,
    MdVisibility,
    MdLink,
    MdInbox,
    MdBlock,
    MdClose,
    MdCheck,
    MdDelete
} from "react-icons/md";

interface AdminSubmissionsPageProps {
    filterTaskId?: string;
    onClearTaskFilter?: () => void;
}

export function AdminSubmissionsPage({ filterTaskId, onClearTaskFilter }: AdminSubmissionsPageProps = {}) {
    const [activeTab, setActiveTab] = useQueryState<"pending" | "approved" | "rejected">("tab", {
        defaultValue: "pending",
        shallow: false,
        parse: (value) => (value as "pending" | "approved" | "rejected") || "pending",
        serialize: (value) => value
    });
    const [openSub, setOpenSub] = useState<Submission | null>(null);
    const [search, setSearch] = useQueryState("search", { defaultValue: "", shallow: false });
    const [filterType, setFilterType] = useQueryState("type", { defaultValue: "", shallow: false });
    const [qTaskId, setQTaskId] = useQueryState("taskId", { defaultValue: "", shallow: false });
    
    const effectiveTaskId = filterTaskId || qTaskId;

    const [rejecting, setRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const { data: allSubs = [], isLoading } = useSubmissions();
    const { data: tasks = [] } = useTasks();
    const { data: campaigns = [] } = useCampaigns();

    const approveMutation = useApproveSubmission();
    const rejectMutation = useRejectSubmission();
    const deleteCampaignMutation = useDeleteCampaign();

    const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]));
    const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c]));

    const counts = {
        pending: allSubs.filter(s => s.status === "pending" && (!effectiveTaskId || s.task_id === effectiveTaskId) && (!filterType || s.task_type === filterType)).length,
        approved: allSubs.filter(s => s.status === "approved" && (!effectiveTaskId || s.task_id === effectiveTaskId) && (!filterType || s.task_type === filterType)).length,
        rejected: allSubs.filter(s => s.status === "rejected" && (!effectiveTaskId || s.task_id === effectiveTaskId) && (!filterType || s.task_type === filterType)).length,
    };

    const filtered = allSubs.filter(s => {
        if (s.status !== activeTab) return false;
        if (effectiveTaskId && s.task_id !== effectiveTaskId) return false;
        if (filterType && s.task_type !== filterType) return false;

        if (search) {
            const q = search.toLowerCase();
            const taskTitle = taskMap[s.task_id]?.title.toLowerCase() || "";
            const workerName = s.user_id.replace("user_", "").toLowerCase();
            return taskTitle.includes(q) || workerName.includes(q);
        }

        return true;
    });

    const activeTask = effectiveTaskId ? taskMap[effectiveTaskId] : null;

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
            showToast("Submission approved!");
            setOpenSub(null);
        } catch {
            showToast("Failed to approve. Please try again.", "error");
        }
    };

    const handleReject = async (sub: Submission) => {
        try {
            await rejectMutation.mutateAsync({ id: sub.id, reason: rejectReason });
            showToast("Submission rejected.", "error");
            setOpenSub(null);
            setRejecting(false);
            setRejectReason("");
        } catch {
            showToast("Failed to reject. Please try again.", "error");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14, gap: 8 }}>
                <MdHourglassEmpty size={18} /> Loading submissions…
            </div>
        );
    }

    return (
        <>
            {activeTask && (
                <div style={{ background: "var(--indigo-light)", border: "1px solid var(--indigo)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--indigo)", fontWeight: 700, fontSize: 14 }}>
                            <MdLink size={18} /> Filtered by: {activeTask.title}
                        </div>
                        <span className="campaign-chip"><span style={{ background: "var(--indigo)" }} />{campaignMap[activeTask.campaign_id]?.name || activeTask.campaign_id}</span>
                        <button 
                            className="btn btn-danger btn-xs" 
                            style={{ padding: "4px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}
                            onClick={async () => {
                                if (confirm("Delete this entire campaign and all its tasks?")) {
                                    await deleteCampaignMutation.mutateAsync(activeTask.campaign_id);
                                    onClearTaskFilter?.();
                                }
                            }}
                        >
                            <MdDelete size={14} /> Delete Campaign
                        </button>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--indigo)", fontWeight: 600 }} onClick={() => { setQTaskId(""); onClearTaskFilter?.(); }}>
                        <MdClose size={18} style={{ marginRight: 4 }} /> Clear Filter
                    </button>
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
                    <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><MdSearch size={16} /></span>
                    <input
                        className="input input-sm"
                        style={{ width: 220 }}
                        placeholder="Search worker or task…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All task types</option>
                    <option value="social_media_posting">Social Posting</option>
                    <option value="email_sending">Email Sending</option>
                    <option value="social_media_liking">Social Liking</option>
                </select>
            </div>

            <div className="table-card">
                <table>
                    <thead>
                        <tr>
                            <th>Worker</th>
                            <th>Task</th>
                            <th>Campaign</th>
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
                                    <td>
                                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                            {task ? (campaignMap[task.campaign_id]?.name || task.campaign_id) : "—"}
                                        </div>
                                    </td>
                                    <td><TypeBadge type={sub.task_type as any} /></td>
                                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(sub.submitted_at)}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); setOpenSub(sub); }}>
                                            <MdVisibility size={14} style={{ marginRight: 4 }} /> Preview
                                        </button>
                                    </td>
                                    <td>
                                        <Badge status={sub.status} />
                                        {sub.phase_id && (
                                            <div style={{ fontSize: 10, color: "var(--indigo)", fontWeight: 600, marginTop: 2 }}>
                                                Phase Index: {task?.phases?.find(p => p.id === sub.phase_id)?.phase_index ?? "—"}
                                            </div>
                                        )}
                                    </td>
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
                        <div className="empty-icon" style={{ display: "flex", justifyContent: "center" }}>
                            {activeTab === "pending" ? <MdInbox size={36} color="var(--border)" /> : activeTab === "approved" ? <MdCheckCircle size={36} color="#059669" /> : <MdBlock size={36} color="var(--rose)" />}
                        </div>
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
                                <div style={{ minWidth: 0 }}>
                                    <div className="sheet-title">{openSub.user_id.replace("user_", "")}</div>
                                    <div className="sheet-subtitle">{formatDate(openSub.submitted_at)}</div>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm sheet-close" onClick={() => { setOpenSub(null); setRejecting(false); }}><MdClose size={20} /></button>
                        </div>
                        <div className="sheet-body">
                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 20 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Task Context</div>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{taskMap[openSub.task_id]?.title ?? openSub.task_id}</div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <TypeBadge type={openSub.task_type as any} />
                                    <Badge status={openSub.status} />
                                    {openSub.phase_id && (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--indigo)", background: "var(--indigo-light)", padding: "2px 8px", borderRadius: 4 }}>
                                            {taskMap[openSub.task_id]?.phases?.find(p => p.id === openSub.phase_id)?.phase_name ?? "Phased"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="section-title">Submitted Evidence</div>
                            {(openSub.task_type === "social_media_posting" || openSub.task_type === "social_media_liking") && (
                                <div className="detail-row">
                                    <span className="detail-label">Post URL</span>
                                    <a className="detail-value" href={(openSub as any).post_url} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", textDecoration: "none" }}>
                                        <MdLink size={14} style={{ marginRight: 4 }} />
                                        {(openSub as any).post_url}
                                    </a>
                                </div>
                            )}
                            {openSub.task_type === "email_sending" && (
                                <div style={{ marginBottom: 16 }}>
                                    <div className="form-label">Email Content</div>
                                    <div className="sub-evidence-box">
                                        <MarkdownRenderer content={(openSub as any).email_content} />
                                    </div>
                                </div>
                            )}
                            <div style={{ marginBottom: 20 }}>
                                <div className="form-label" style={{ marginBottom: 8 }}>Screenshot</div>
                                <div className="screenshot-preview" style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 12, border: "1px solid var(--border)" }}>
                                    <img src={openSub.screenshot_url} alt="Evidence screenshot" style={{ maxWidth: "100%", borderRadius: "var(--radius-xs)" }} />
                                </div>
                            </div>

                            {(rejecting || openSub.status === "rejected") && (
                                <div style={{ background: "var(--rose-light)", border: "1px solid #fecdd3", borderRadius: "var(--radius-sm)", padding: 14 }}>
                                    <div className="form-label" style={{ color: "var(--rose)", marginBottom: 8 }}>Rejection Reason</div>
                                    {openSub.status === "rejected"
                                        ? <p style={{ fontSize: 13, color: "#9f1239" }}>{"rejection_reason" in openSub ? openSub.rejection_reason : ""}</p>
                                        : <>
                                            <textarea
                                                className="input"
                                                rows={3}
                                                placeholder="Explain why this submission is being rejected…"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                            />
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginTop: 6,
                                                fontSize: 11,
                                                color: rejectReason.trim().length < 10 ? "var(--rose)" : "var(--text-muted)"
                                            }}>
                                                <span>Minimum 10 characters required</span>
                                                <span>{rejectReason.trim().length} characters</span>
                                            </div>
                                        </>
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
                                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                                        >
                                            {approveMutation.isPending ? <MdHourglassEmpty size={18} /> : <MdCheck size={18} />}
                                            {approveMutation.isPending ? "Approving…" : "Approve"}
                                        </button>
                                        <button className="btn btn-danger" onClick={() => setRejecting(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <MdClose size={18} /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleReject(openSub)}
                                            disabled={rejectMutation.isPending || rejectReason.trim().length < 10}
                                            style={{ display: "flex", alignItems: "center", gap: 6 }}
                                        >
                                            {rejectMutation.isPending ? <MdHourglassEmpty size={18} /> : null}
                                            {rejectMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setRejecting(false)}>Cancel</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div className="toast">
                    <span className="toast-icon" style={{ display: "flex", alignItems: "center" }}>
                        {toast.type === "success" ? <MdCheckCircle size={18} /> : <MdCancel size={18} />}
                    </span>
                    {toast.msg}
                </div>
            )}
        </>
    );
}
