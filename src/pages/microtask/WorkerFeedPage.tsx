import React, { useState, useRef } from "react";
import { useTasks, useCreateSubmission, useSubmissions } from "@/features/hooks";
import { TypeBadge } from "../../components/common/Badge";
import type { Session, Task, SubmissionFormValues } from "@/libs/types";

const TASK_TYPE_META = {
    social_media_posting: { label: "Social Posting", icon: "📢", cardClass: "social" },
    email_sending: { label: "Email Sending", icon: "✉️", cardClass: "email" },
    social_media_liking: { label: "Social Liking", icon: "❤️", cardClass: "like" },
};

interface WorkerFeedPageProps {
    session: Session;
}

export function WorkerFeedPage({ session }: WorkerFeedPageProps) {
    const [activeTab, setActiveTab] = useState("all");
    const [sort, setSort] = useState("latest");
    const [openTask, setOpenTask] = useState<Task | null>(null);
    const [submitMode, setSubmitMode] = useState(false);
    const [postUrl, setPostUrl] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [screenshotB64, setScreenshotB64] = useState<string>("");
    const [submitted, setSubmitted] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const { data: tasks = [], isLoading } = useTasks({ status: "active" });
    const { data: mySubs = [] } = useSubmissions({ user_id: session.userId });
    const createSubmission = useCreateSubmission();

    const filtered = tasks
        .filter(t => {
            if (activeTab === "posting") return t.task_type === "social_media_posting";
            if (activeTab === "email") return t.task_type === "email_sending";
            if (activeTab === "liking") return t.task_type === "social_media_liking";
            return true;
        })
        .sort((a, b) => sort === "reward" ? b.reward - a.reward : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const myApproved = mySubs.filter(s => s.status === "approved");
    const myPending = mySubs.filter(s => s.status === "pending");
    const totalEarned = myApproved.reduce((acc, s) => {
        const task = tasks.find(t => t.id === s.task_id);
        return acc + (task?.reward ?? 0);
    }, 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setScreenshotB64(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!openTask) return;
        if (!screenshotB64) { showToast("❌ Please upload a screenshot as evidence."); return; }

        let values: SubmissionFormValues;
        if (openTask.task_type === "social_media_posting" || openTask.task_type === "social_media_liking") {
            if (!postUrl.trim()) { showToast("❌ Please enter the post URL."); return; }
            values = { task_type: openTask.task_type, post_url: postUrl.trim(), screenshot_url: screenshotB64 };
        } else {
            if (!emailContent.trim()) { showToast("❌ Please paste your email content."); return; }
            values = { task_type: "email_sending", email_content: emailContent.trim(), screenshot_url: screenshotB64 };
        }

        try {
            await createSubmission.mutateAsync({ taskId: openTask.id, userId: session.userId, values });
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSubmitMode(false);
                setOpenTask(null);
                setPostUrl(""); setEmailContent(""); setScreenshotB64("");
            }, 2500);
        } catch (err: unknown) {
            showToast(`❌ ${err instanceof Error ? err.message : "Failed to submit. Please try again."}`);
        }
    };

    const hasAlreadySubmitted = (task: Task) => {
        if (task.allow_multiple_submissions) return false;
        return mySubs.some(s => s.task_id === task.id);
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-muted)", fontSize: 14 }}>
                ⏳ Loading tasks…
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div className="tabs">
                    {[
                        { id: "all", label: "All Tasks" },
                        { id: "posting", label: "📢 Posting" },
                        { id: "email", label: "✉️ Email" },
                        { id: "liking", label: "❤️ Liking" },
                    ].map(tab => (
                        <div key={tab.id} className={`tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </div>
                    ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input className="input input-sm" style={{ width: 180 }} placeholder="Search tasks…" />
                    </div>
                    <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="latest">Latest first</option>
                        <option value="reward">Highest reward</option>
                    </select>
                </div>
            </div>

            <div className="worker-stats-bar" style={{ background: "linear-gradient(135deg, #0f1117, #1a1e2e)", borderRadius: "var(--radius-lg)", padding: "18px 24px", marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5568", letterSpacing: "0.05em", textTransform: "uppercase" }}>Total Earned</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 24, color: "#e2e8f4", marginTop: 2 }}>
                        ${totalEarned.toFixed(2)}
                    </div>
                </div>
                {[
                    { label: "Tasks Submitted", value: String(mySubs.length) },
                    { label: "Approved", value: String(myApproved.length) },
                    { label: "Pending", value: String(myPending.length) },
                ].map(s => (
                    <div key={s.label} style={{ borderLeft: "1px solid #1e2130", paddingLeft: 28 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#4b5568", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 20, color: "#e2e8f4", marginTop: 2 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="task-grid">
                {filtered.map(task => {
                    const meta = TASK_TYPE_META[task.task_type];
                    const alreadyDone = hasAlreadySubmitted(task);
                    const slotsLeft = Math.max(0, task.amount - task.approved_count);
                    return (
                        <div key={task.id} className={`task-card ${meta.cardClass}`} onClick={() => { setOpenTask(task); setSubmitMode(false); }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                                <TypeBadge type={task.task_type as any} />
                                <span className="reward-chip">${task.reward.toFixed(2)}</span>
                            </div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 14, lineHeight: 1.4, marginBottom: 8 }}>{task.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
                                {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span className="campaign-chip" style={{ fontSize: 11 }}><span style={{ background: "var(--indigo)" }} />{task.campaign_id}</span>
                                {alreadyDone ? (
                                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Submitted ✓</span>
                                ) : (
                                    <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setOpenTask(task); setSubmitMode(true); }}>
                                        Submit →
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                        <div style={{ fontWeight: 600 }}>No active tasks</div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>Check back soon for new tasks.</div>
                    </div>
                )}
            </div>

            {openTask && (
                <div className="sheet-overlay" onClick={() => { setOpenTask(null); setSubmitMode(false); setPostUrl(""); setEmailContent(""); setScreenshotB64(""); }}>
                    <div className="sheet sheet-wide" onClick={e => e.stopPropagation()}>
                        <div className="sheet-header">
                            <div>
                                <TypeBadge type={openTask.task_type as any} />
                                <div className="sheet-title" style={{ marginTop: 8 }}>{openTask.title}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginLeft: "auto" }}>
                                <span className="reward-chip" style={{ fontSize: 16 }}>${openTask.reward.toFixed(2)}</span>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setOpenTask(null); setSubmitMode(false); }}>✕</button>
                            </div>
                        </div>
                        <div className="sheet-body">
                            {!submitMode ? (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                                        {[
                                            { label: "Reward", value: `$${openTask.reward.toFixed(2)} AUD` },
                                            { label: "Slots left", value: `${Math.max(0, openTask.amount - openTask.approved_count)}` },
                                        ].map(s => (
                                            <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{s.label}</div>
                                                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, marginTop: 2 }}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {openTask.description && (
                                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>{openTask.description}</div>
                                    )}
                                    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 16 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                                            {openTask.details || (
                                                openTask.task_type === "social_media_posting" ? "📢 Post on Twitter/X or LinkedIn\n• Use campaign hashtags\n• Tag @MicroTaskIO\n• Post must be public\n\nSubmit: Post URL + Screenshot"
                                                    : openTask.task_type === "email_sending" ? "✉️ Send email to 5+ recipients\n• Include key features\n• Add sign-up CTA link\n• Personalise each email\n\nSubmit: Full email content + Screenshot"
                                                        : "❤️ Like the specified post\n• Use personal account only\n• Account 3+ months old\n• 50+ followers required\n\nSubmit: Profile URL + Screenshot"
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {submitted ? (
                                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Submitted!</div>
                                            <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Your submission is pending review. You'll earn ${openTask.reward.toFixed(2)} once approved.</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="section-title">Submit Your Work</div>
                                            {(openTask.task_type === "social_media_posting" || openTask.task_type === "social_media_liking") && (
                                                <div className="form-group">
                                                    <label className="form-label">Post URL <span style={{ color: "var(--rose)" }}>*</span></label>
                                                    <input className="input" placeholder="https://twitter.com/yourhandle/status/…" value={postUrl} onChange={e => setPostUrl(e.target.value)} />
                                                </div>
                                            )}
                                            {openTask.task_type === "email_sending" && (
                                                <div className="form-group">
                                                    <label className="form-label">Email Content <span style={{ color: "var(--rose)" }}>*</span></label>
                                                    <textarea className="input" rows={6} placeholder="Paste the full email you sent (including subject line)…" value={emailContent} onChange={e => setEmailContent(e.target.value)} />
                                                </div>
                                            )}
                                            <div className="form-group">
                                                <label className="form-label">Evidence Screenshot <span style={{ color: "var(--rose)" }}>*</span></label>
                                                <div
                                                    style={{ border: `2px dashed ${screenshotB64 ? "var(--indigo)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", padding: 28, textAlign: "center", cursor: "pointer", transition: "all 0.15s", background: screenshotB64 ? "rgba(99,102,241,0.05)" : "var(--surface-2)" }}
                                                    onClick={() => fileRef.current?.click()}
                                                >
                                                    {screenshotB64 ? (
                                                        <>
                                                            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--indigo)" }}>Screenshot uploaded</div>
                                                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Click to change</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                                                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Click to upload or drag &amp; drop</div>
                                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>PNG, JPG up to 5MB</div>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: "none" }}
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="sheet-footer">
                            {!submitMode && !submitted && (
                                <>
                                    {hasAlreadySubmitted(openTask) ? (
                                        <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>✓ You have already submitted this task.</div>
                                    ) : (
                                        <button className="btn btn-primary" onClick={() => setSubmitMode(true)}>Submit This Task →</button>
                                    )}
                                    <button className="btn btn-outline" onClick={() => setOpenTask(null)}>Close</button>
                                </>
                            )}
                            {submitMode && !submitted && (
                                <>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSubmit}
                                        disabled={createSubmission.isPending}
                                    >
                                        {createSubmission.isPending ? "⏳ Submitting…" : "📤 Submit for Review"}
                                    </button>
                                    <button className="btn btn-outline" onClick={() => setSubmitMode(false)}>← Back to Details</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className="toast"><span className="toast-icon">{toast.startsWith("✅") ? "✅" : "❌"}</span>{toast}</div>}
        </>
    );
}
