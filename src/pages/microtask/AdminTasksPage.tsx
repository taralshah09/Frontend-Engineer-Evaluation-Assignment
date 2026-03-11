import React, { useState, useEffect } from "react";
import {
    useTasks,
    useDeleteTask,
    useUpdateTask,
    useSubmissions,
} from "@/features/hooks";
import { Badge, TypeBadge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import {
    MdFlashOn,
    MdOutlineInbox,
    MdHourglassEmpty,
    MdAttachMoney,
    MdSearch,
    MdEdit,
    MdDelete,
    MdAssignment,
    MdCheckCircle,
    MdCancel,
    MdClose,
    MdArrowForward,
    MdViewModule,
    MdViewList
} from "react-icons/md";

interface AdminTasksPageProps {
    onOpenComposer: () => void;
    onEditTask?: (id: string) => void;
    onViewSubmissions: (taskId: string) => void;
    campaignId?: string;
}

export function AdminTasksPage({ onOpenComposer, onEditTask, onViewSubmissions, campaignId }: AdminTasksPageProps) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selected, setSelected] = useState<string[]>([]);
    const [openTaskId, setOpenTaskId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"card" | "inline">(() => {
        return (localStorage.getItem("admin_view_mode") as "card" | "inline") || "inline";
    });
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "delete" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" | "delete" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const { data: tasks = [], isLoading } = useTasks();
    const { data: allSubs = [] } = useSubmissions();
    const deleteMutation = useDeleteTask();
    const updateMutation = useUpdateTask();

    const filtered = tasks.filter(t => {
        if (campaignId && t.campaign_id !== campaignId) return false;
        if (filterType !== "all" && t.task_type !== filterType) return false;
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(t => t.id));

    const openTask = openTaskId ? tasks.find(t => t.id === openTaskId) : null;
    const taskSubs = openTaskId ? allSubs.filter(s => s.task_id === openTaskId) : [];

    const campaignTasks = campaignId ? tasks.filter(t => t.campaign_id === campaignId) : tasks;
    const campaignTaskIds = new Set(campaignTasks.map(t => t.id));
    const campaignSubs = allSubs.filter(s => campaignTaskIds.has(s.task_id));

    const activeTasks = campaignTasks.filter(t => t.status === "active").length;
    const totalSubs = campaignTasks.reduce((acc, t) => acc + t.submissions_count, 0);
    const pendingSubsCount = campaignSubs.filter(s => s.status === "pending").length;
    const rewardsPaid = campaignSubs
        .filter(s => s.status === "approved")
        .reduce((acc, s) => {
            const task = campaignTasks.find(t => t.id === s.task_id);
            return acc + (task?.reward ?? 0);
        }, 0);

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString("en-AU", { month: "short", day: "numeric" }); }
        catch { return iso; }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this task? All associated submissions will also be removed.")) return;
        try {
            await deleteMutation.mutateAsync(id);
            setOpenTaskId(null);
            showToast("Task deleted.", "delete");
        } catch {
            showToast("Failed to delete task.", "error");
        }
    };

    const handlePause = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "paused" ? "active" : "paused";
        try {
            await updateMutation.mutateAsync({ id, values: { status: newStatus } });
            showToast(`Task ${newStatus === "paused" ? "paused" : "resumed"}.`);
        } catch {
            showToast("Failed to update task.", "error");
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14, gap: 8 }}>
                <MdHourglassEmpty size={18} /> Loading tasks…
            </div>
        );
    }

    return (
        <>
            <div className="stats-grid">
                {[
                    { label: "Active Tasks", value: String(activeTasks), delta: `${campaignTasks.length} total${campaignId ? " in campaign" : ""}`, dir: "up", icon: <MdFlashOn size={20} />, bg: "#eef2ff", ic: "#6366f1" },
                    { label: "Total Submissions", value: String(totalSubs), delta: campaignId ? "in this campaign" : "across all tasks", dir: "up", icon: <MdOutlineInbox size={20} />, bg: "#ecfdf5", ic: "#059669" },
                    { label: "Pending Review", value: String(pendingSubsCount), delta: pendingSubsCount > 0 ? "Needs attention" : "All clear", dir: pendingSubsCount > 0 ? "down" : "up", icon: <MdHourglassEmpty size={20} />, bg: "#fef3c7", ic: "#d97706" },
                    { label: "Rewards Paid", value: `$${rewardsPaid.toFixed(2)}`, delta: campaignId ? "in this campaign" : "total approved", dir: "up", icon: <MdAttachMoney size={20} />, bg: "#f0fdf4", ic: "#16a34a" },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon-wrap" style={{ background: s.bg, color: s.ic, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {s.icon}
                        </div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className={`stat-delta ${s.dir}`}>{s.dir === "up" ? "↑" : "↓"} {s.delta}</div>
                    </div>
                ))}
            </div>

            <div className="table-card">
                <div className="table-header">
                    <div className="table-title">All Tasks</div>
                    <div className="table-count">{filtered.length} tasks</div>
                    {selected.length > 0 && (
                        <span className="badge badge-pending" style={{ marginLeft: 4 }}>{selected.length} selected</span>
                    )}
                    <div className="table-actions">
                        <div className="search-wrap">
                            <span className="search-icon" style={{ display: "flex", alignItems: "center" }}><MdSearch size={16} /></span>
                            <input className="input input-sm" style={{ width: 200 }} placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">All types</option>
                            <option value="social_media_posting">Social Posting</option>
                            <option value="email_sending">Email Sending</option>
                            <option value="social_media_liking">Social Liking</option>
                        </select>
                        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="all">All status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                        </select>
                        {selected.length > 0 && (
                            <button className="btn btn-outline btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <MdEdit size={14} /> Bulk Edit
                            </button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={onOpenComposer}>+ New Task</button>
                    </div>
                </div>

                <div style={{ padding: "0 20px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <div className="view-toggle-group">
                        <button
                            className={`view-toggle-btn ${viewMode === "card" ? "active" : ""}`}
                            onClick={() => { setViewMode("card"); localStorage.setItem("admin_view_mode", "card"); }}
                            title="Card View"
                        >
                            <MdViewModule size={18} />
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === "inline" ? "active" : ""}`}
                            onClick={() => { setViewMode("inline"); localStorage.setItem("admin_view_mode", "inline"); }}
                            title="Table View"
                        >
                            <MdViewList size={18} />
                        </button>
                    </div>
                </div>

                {viewMode === "inline" ? (
                    <div className="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <div className={`checkbox ${selected.length === filtered.length && filtered.length > 0 ? "checked" : ""}`} onClick={toggleAll} />
                                    </th>
                                    <th>Task</th>
                                    <th>Type</th>
                                    <th>Campaign</th>
                                    <th>Reward</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(task => (
                                    <tr key={task.id} onClick={() => setOpenTaskId(task.id)}>
                                        <td onClick={e => { e.stopPropagation(); toggleSelect(task.id); }}>
                                            <div className={`checkbox ${selected.includes(task.id) ? "checked" : ""}`} />
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 13.5, maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                                        </td>
                                        <td><TypeBadge type={task.task_type as any} /></td>
                                        <td><span className="campaign-chip"><span />{task.campaign_id}</span></td>
                                        <td><span className="reward-chip">${task.reward.toFixed(2)}</span></td>
                                        <td style={{ minWidth: 160 }}>
                                            <ProgressBar
                                                value={task.approved_count}
                                                max={task.amount}
                                                color={task.approved_count / task.amount > 0.7 ? "#059669" : task.approved_count / task.amount > 0.3 ? "#d97706" : "#6366f1"}
                                            />
                                        </td>
                                        <td><Badge status={task.status} /></td>
                                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{formatDate(task.created_at)}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <button className="btn btn-ghost btn-xs" onClick={() => setOpenTaskId(task.id)}>View</button>
                                                <button className="btn btn-ghost btn-xs" onClick={() => onViewSubmissions(task.id)}>Submissions</button>
                                                <button className="btn btn-ghost btn-xs" onClick={() => onEditTask?.(task.id)}>Edit</button>
                                                <button
                                                    className="btn btn-xs"
                                                    style={{ color: "var(--rose)", background: "transparent" }}
                                                    onClick={() => handleDelete(task.id)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="admin-task-grid" style={{ padding: 20 }}>
                        {filtered.map(task => (
                            <div key={task.id} className="admin-task-card animate-up" onClick={() => setOpenTaskId(task.id)}>
                                <div className="admin-task-card-header">
                                    <TypeBadge type={task.task_type as any} />
                                    <Badge status={task.status} />
                                </div>
                                <div className="admin-task-card-body">
                                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: 40 }}>{task.title}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <span className="campaign-chip"><span />{task.campaign_id}</span>
                                        <span className="reward-chip">${task.reward.toFixed(2)}</span>
                                    </div>
                                    <div style={{ marginBottom: 4, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                        <span style={{ color: "var(--text-muted)" }}>Progress</span>
                                        <span style={{ fontWeight: 600 }}>{task.approved_count} / {task.amount}</span>
                                    </div>
                                    <ProgressBar
                                        value={task.approved_count}
                                        max={task.amount}
                                        color={task.approved_count / task.amount > 0.7 ? "#059669" : task.approved_count / task.amount > 0.3 ? "#d97706" : "#6366f1"}
                                    />
                                </div>
                                <div className="admin-task-card-footer">
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatDate(task.created_at)}</div>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); onViewSubmissions(task.id); }}>Subs</button>
                                        <button className="btn btn-ghost btn-xs" onClick={e => { e.stopPropagation(); onEditTask?.(task.id); }}>Edit</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon" style={{ display: "flex", justifyContent: "center" }}><MdAssignment size={36} /></div>
                        <div className="empty-title">No tasks found</div>
                        <div className="empty-desc">Try adjusting your filters or create a new task.</div>
                    </div>
                )}
            </div>

            {openTask && (
                <div className="sheet-overlay" onClick={() => setOpenTaskId(null)}>
                    <div className="sheet sheet-wide" onClick={e => e.stopPropagation()}>
                        <div className="sheet-header">
                            <div>
                                <TypeBadge type={openTask.task_type as any} />
                                <div className="sheet-title" style={{ marginTop: 8 }}>{openTask.title}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                                    <span className="campaign-chip"><span />{openTask.campaign_id}</span>
                                    <Badge status={openTask.status} />
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-sm sheet-close" onClick={() => setOpenTaskId(null)}><MdClose size={20} /></button>
                        </div>
                        <div className="sheet-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: "Reward", value: `$${openTask.reward.toFixed(2)} AUD` },
                                    { label: "Submissions", value: `${openTask.submissions_count}/${openTask.amount}` },
                                    { label: "Approved", value: String(openTask.approved_count) },
                                ].map(s => (
                                    <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{s.label}</div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18 }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div className="form-label" style={{ marginBottom: 8 }}>Slot progress</div>
                                <ProgressBar value={openTask.approved_count} max={openTask.amount} />
                            </div>
                            <div className="divider" />
                            <div className="section-title">Recent Submissions</div>
                            {taskSubs.slice(0, 3).map(sub => (
                                <div key={sub.id} className="detail-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div className="avatar avatar-sm" style={{ background: "#6366f1", flexShrink: 0 }}>
                                        {sub.user_id.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{sub.user_id.replace("user_", "")}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(sub.submitted_at)}</div>
                                    </div>
                                    <Badge status={sub.status} />
                                </div>
                            ))}
                            {taskSubs.length === 0 && (
                                <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "12px 0" }}>No submissions yet.</div>
                            )}
                            <div style={{ marginTop: 16 }}>
                                <button
                                    className="btn btn-outline"
                                    style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}
                                    onClick={() => { setOpenTaskId(null); onViewSubmissions(openTask.id); }}
                                >View all submissions <MdArrowForward size={16} /></button>
                            </div>
                        </div>
                        <div className="sheet-footer">
                            <button className="btn btn-primary" onClick={() => { setOpenTaskId(null); onEditTask?.(openTask.id); }}>Edit Task</button>
                            <button
                                className="btn btn-outline"
                                onClick={() => handlePause(openTask.id, openTask.status)}
                                disabled={updateMutation.isPending}
                            >
                                {openTask.status === "paused" ? "Resume Task" : "Pause Task"}
                            </button>
                            <button
                                className="btn btn-danger"
                                style={{ marginLeft: "auto" }}
                                onClick={() => handleDelete(openTask.id)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="toast">
                    <span className="toast-icon" style={{ display: "flex", alignItems: "center" }}>
                        {toast.type === "delete" ? <MdDelete size={16} /> : toast.type === "error" ? <MdCancel size={16} /> : <MdCheckCircle size={16} />}
                    </span>
                    {toast.msg}
                </div>
            )}
        </>
    );
}
