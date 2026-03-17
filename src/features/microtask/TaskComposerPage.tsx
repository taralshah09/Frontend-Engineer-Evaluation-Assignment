import React, { useState, useEffect } from "react";
import { useCreateTask, useUpdateTask, useTask } from "@/features/hooks";
import { campaignStore } from "@/storage";
import type { Campaign, TaskFormValues, TaskType, TaskPhase } from "@/libs/types";
import {
    MdCampaign,
    MdEmail,
    MdFavorite,
    MdHelpOutline,
    MdHourglassEmpty,
    MdCheckCircle,
    MdCancel,
    MdSave,
    MdLink,
    MdAttachFile,
    MdAdd,
    MdDeleteOutline,
    MdDragIndicator,
    MdOutlineAvTimer
} from "react-icons/md";
import { nanoid } from "nanoid";
import { LexicalEditor } from "@/components/common/LexicalEditor";

interface TaskComposerPageProps {
    onBack: () => void;
    editTaskId?: string | null;
}

export function TaskComposerPage({ onBack, editTaskId }: TaskComposerPageProps) {
    const [selectedType, setSelectedType] = useState<TaskType | null>(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [details, setDetails] = useState("");
    const [amount, setAmount] = useState("");
    const [reward, setReward] = useState("");
    const [campaign, setCampaign] = useState("");
    const [multiSub, setMultiSub] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [enablePhases, setEnablePhases] = useState(false);
    const [phases, setPhases] = useState<Partial<TaskPhase>[]>([]);
    const [dripEnabled, setDripEnabled] = useState(false);
    const [dripAmount, setDripAmount] = useState("");
    const [dripInterval, setDripInterval] = useState("");
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const { data: existingTask } = useTask(editTaskId ?? "");

    const isEditing = !!editTaskId;

    useEffect(() => {
        campaignStore.getAll().then(setCampaigns).catch(() => { });
    }, []);

    useEffect(() => {
        if (existingTask) {
            setSelectedType(existingTask.task_type);
            setTitle(existingTask.title);
            setDesc(existingTask.description);
            setDetails(existingTask.details);
            setAmount(String(existingTask.amount));
            setReward(String(existingTask.reward));
            setCampaign(existingTask.campaign_id);
            setMultiSub(existingTask.allow_multiple_submissions);
            if (existingTask.phases && existingTask.phases.length > 0) {
                setEnablePhases(true);
                setPhases(existingTask.phases);
            }
            setDripEnabled(existingTask.drip_enabled ?? false);
            setDripAmount(existingTask.drip_amount ? String(existingTask.drip_amount) : "");
            setDripInterval(existingTask.drip_interval ? String(existingTask.drip_interval) : "");
        }
    }, [existingTask]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        if (!selectedType) { showToast("Please select a task type.", "error"); return; }
        if (!title.trim()) { showToast("Please enter a task title.", "error"); return; }
        if (!campaign) { showToast("Please select a campaign.", "error"); return; }
        if (enablePhases) {
            if (phases.length === 0) { showToast("Please add at least one phase.", "error"); return; }
            for (const p of phases) {
                if (!p.phase_name?.trim() || !p.slots || !p.reward || !p.task_type) {
                    showToast("Please fill all details for all phases.", "error");
                    return;
                }
            }
        } else {
            if (!amount || !reward) { showToast("Please enter amount and reward.", "error"); return; }
        }

        const values: TaskFormValues = {
            task_type: selectedType,
            title: title.trim(),
            description: desc.trim(),
            details: details.trim(),
            amount: enablePhases ? phases.reduce((acc, p) => acc + (p.slots || 0), 0) : parseInt(amount),
            reward: enablePhases ? phases.reduce((acc, p) => acc + (p.reward || 0), 0) : parseFloat(reward),
            allow_multiple_submissions: multiSub,
            campaign_id: campaign,
            phases: enablePhases ? phases as TaskPhase[] : undefined,
            drip_enabled: dripEnabled,
            drip_amount: dripEnabled ? parseInt(dripAmount) : undefined,
            drip_interval: dripEnabled ? parseInt(dripInterval) : undefined,
            drip_start_time: (dripEnabled && !existingTask?.drip_start_time) ? new Date().toISOString() : existingTask?.drip_start_time,
        };

        try {
            if (isEditing && editTaskId) {
                await updateTask.mutateAsync({ id: editTaskId, values });
                showToast("Task updated!");
            } else {
                await createTask.mutateAsync(values);
                showToast("Task created!");
                setSelectedType(null);
                setTitle(""); setDesc(""); setDetails("");
                setAmount(""); setReward(""); setCampaign("");
                setMultiSub(false);
                setEnablePhases(false);
                setPhases([]);
                setDripEnabled(false);
                setDripAmount("");
                setDripInterval("");
            }
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to save task. Please try again.", "error");
        }
    };

    const isSaving = createTask.isPending || updateTask.isPending;

    return (
        <>
            <div className="composer-layout">
                {/* Main form */}
                <div>
                    <div className="table-card" style={{ padding: 24, marginBottom: 20 }}>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 20 }}>
                            {isEditing ? "Edit Task" : "Task Details"}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Task Type <span style={{ color: "var(--rose)" }}>*</span></label>
                            <div className="type-selector">
                                {[
                                    { id: "social_media_posting" as TaskType, icon: <MdCampaign size={18} />, label: "Social Posting" },
                                    { id: "email_sending" as TaskType, icon: <MdEmail size={18} />, label: "Email Sending" },
                                    { id: "social_media_liking" as TaskType, icon: <MdFavorite size={18} />, label: "Social Liking" },
                                ].map(t => (
                                    <div key={t.id} className={`type-pill ${selectedType === t.id ? "selected" : ""}`} onClick={() => setSelectedType(t.id)}>
                                        <span className="type-pill-icon" style={{ display: "flex", alignItems: "center" }}>{t.icon}</span>
                                        <span className="type-pill-label">{t.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title <span style={{ color: "var(--rose)" }}>*</span></label>
                            <input className="input" placeholder="e.g. Promote our Tech Webinar on LinkedIn" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} />
                            <div className="form-hint">{title.length}/120 characters</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Short Description</label>
                            <input className="input" placeholder="Brief summary shown in the task feed (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Task Details <span style={{ color: "var(--rose)" }}>*</span></label>
                            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                                <div style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)", padding: "6px 10px", display: "flex", gap: 6 }}>
                                    {["B", "I", "H2", "•—", "` `", "🔗"].map(t => (
                                        <button key={t} className="btn btn-ghost btn-xs" style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 7px" }}>{t}</button>
                                    ))}
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", padding: "3px 0" }}>Markdown supported</span>
                                </div>
                                <LexicalEditor
                                    initialValue={details}
                                    onChange={setDetails}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="table-card" style={{ padding: 24, marginBottom: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 15 }}>Task Phases</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Enable sequential stages</span>
                                <div
                                    style={{ width: 40, height: 22, borderRadius: 99, background: enablePhases ? "var(--indigo)" : "#d1d5db", cursor: "pointer", padding: "2px", transition: "background 0.2s", display: "flex", alignItems: "center" }}
                                    onClick={() => {
                                        setEnablePhases(!enablePhases);
                                        if (!enablePhases && phases.length === 0) {
                                            setPhases([{ id: nanoid(6), phase_name: "Phase 1", slots: 10, reward: 1.0, task_type: selectedType || "social_media_posting", instructions: "" }]);
                                        }
                                    }}
                                >
                                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", transform: `translateX(${enablePhases ? "18px" : "0"})`, transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                                </div>
                            </div>
                        </div>

                        {enablePhases && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {phases.map((phase, idx) => (
                                    <div key={phase.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16, background: "var(--surface-1)", position: "relative" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                            <MdDragIndicator size={20} color="var(--text-muted)" style={{ cursor: "grab" }} />
                                            <div style={{ fontWeight: 600, fontSize: 12, color: "var(--indigo)", background: "var(--indigo-light)", padding: "2px 8px", borderRadius: 4 }}>
                                                Phase {idx + 1}
                                            </div>
                                            <input
                                                className="input input-sm"
                                                style={{ flex: 1, fontWeight: 600 }}
                                                placeholder="Phase Name (e.g. Content Creation)"
                                                value={phase.phase_name}
                                                onChange={e => {
                                                    const newPhases = [...phases];
                                                    newPhases[idx].phase_name = e.target.value;
                                                    setPhases(newPhases);
                                                }}
                                            />
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                style={{ color: "var(--rose)" }}
                                                onClick={() => setPhases(phases.filter((_, i) => i !== idx))}
                                            >
                                                <MdDeleteOutline size={18} />
                                            </button>
                                        </div>

                                        <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr", gap: 12, marginBottom: 12 }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 11 }}>Slots</label>
                                                <input
                                                    className="input input-sm"
                                                    type="number"
                                                    value={phase.slots}
                                                    onChange={e => {
                                                        const newPhases = [...phases];
                                                        newPhases[idx].slots = parseInt(e.target.value) || 0;
                                                        setPhases(newPhases);
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 11 }}>Reward ($)</label>
                                                <input
                                                    className="input input-sm"
                                                    type="number"
                                                    step="0.1"
                                                    value={phase.reward}
                                                    onChange={e => {
                                                        const newPhases = [...phases];
                                                        newPhases[idx].reward = parseFloat(e.target.value) || 0;
                                                        setPhases(newPhases);
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label className="form-label" style={{ fontSize: 11 }}>Task Type</label>
                                                <select
                                                    className="select select-sm"
                                                    style={{ width: "100%" }}
                                                    value={phase.task_type}
                                                    onChange={e => {
                                                        const newPhases = [...phases];
                                                        newPhases[idx].task_type = e.target.value as TaskType;
                                                        setPhases(newPhases);
                                                    }}
                                                >
                                                    <option value="social_media_posting">Social Posting</option>
                                                    <option value="email_sending">Email Sending</option>
                                                    <option value="social_media_liking">Social Liking</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" style={{ fontSize: 11 }}>Phase Instructions (Markdown)</label>
                                            <textarea
                                                className="input input-sm"
                                                rows={2}
                                                placeholder="Phase specific instructions..."
                                                value={phase.instructions}
                                                onChange={e => {
                                                    const newPhases = [...phases];
                                                    newPhases[idx].instructions = e.target.value;
                                                    setPhases(newPhases);
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    className="btn btn-outline btn-sm"
                                    style={{ borderStyle: "dashed", justifyContent: "center" }}
                                    onClick={() => setPhases([...phases, { id: nanoid(6), phase_name: `Phase ${phases.length + 1}`, slots: 10, reward: 1.0, task_type: "social_media_posting", instructions: "" }])}
                                >
                                    <MdAdd size={18} /> Add Another Phase
                                </button>
                            </div>
                        )}
                        {!enablePhases && (
                            <div style={{ background: "var(--surface-2)", padding: 16, borderRadius: "var(--radius-sm)", fontSize: 12, color: "var(--text-muted)", border: "1px dashed var(--border)" }}>
                                Standard task: Single phase with uniform instructions and reward.
                            </div>
                        )}
                    </div>

                    {selectedType && (
                        <div className="table-card" style={{ padding: 20 }}>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
                                Worker Submission Form Preview
                            </div>
                            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 16 }}>
                                {(selectedType === "social_media_posting" || selectedType === "social_media_liking") && (
                                    <>
                                        <div className="form-group"><label className="form-label">Post URL <span style={{ color: "var(--rose)" }}>*</span></label><input className="input" disabled placeholder="https://twitter.com/…" /></div>
                                        <div className="form-group">
                                            <label className="form-label">Evidence Screenshot <span style={{ color: "var(--rose)" }}>*</span></label>
                                            <div style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-sm)", padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                                <MdAttachFile size={20} /> Upload screenshot
                                            </div>
                                        </div>
                                    </>
                                )}
                                {selectedType === "email_sending" && (
                                    <>
                                        <div className="form-group"><label className="form-label">Email Content <span style={{ color: "var(--rose)" }}>*</span></label><textarea className="input" disabled rows={4} placeholder="Paste the full email you sent…" /></div>
                                        <div className="form-group">
                                            <label className="form-label">Evidence Screenshot <span style={{ color: "var(--rose)" }}>*</span></label>
                                            <div style={{ border: "2px dashed var(--border)", borderRadius: "var(--radius-sm)", padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                                                <MdAttachFile size={20} /> Upload screenshot of sent folder
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div className="table-card" style={{ padding: 20, marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Configuration</div>

                        <div className="form-group">
                            <label className="form-label">Campaign <span style={{ color: "var(--rose)" }}>*</span></label>
                            <select className="select" style={{ width: "100%" }} value={campaign} onChange={e => setCampaign(e.target.value)}>
                                <option value="">Select campaign…</option>
                                {campaigns.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <div className="form-hint">Group related tasks by campaign.</div>
                        </div>

                        <div className="form-grid-2" style={{ gap: 12 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Amount (slots)</label>
                                <input className="input" type="number" min={1} placeholder="e.g. 50" value={enablePhases ? phases.reduce((acc, p) => acc + (p.slots || 0), 0) : amount} onChange={e => setAmount(e.target.value)} disabled={enablePhases} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Reward (AUD $)</label>
                                <input className="input" type="number" min={0.5} step={0.5} placeholder="e.g. 5.00" value={enablePhases ? "" : reward} onChange={e => setReward(e.target.value)} disabled={enablePhases} />
                                {enablePhases && <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>Varies by phase</div>}
                            </div>
                        </div>

                        {reward && amount && (
                            <div className="reward-callout" style={{ marginTop: 14 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#4338ca", marginBottom: 4 }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MdSave size={14} /> Budget Estimate</span>
                                </div>
                                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#312e81" }}>
                                    ${(enablePhases ? phases.reduce((acc, p) => acc + (p.reward || 0) * (p.slots || 0), 0) : parseFloat(reward || "0") * parseInt(amount || "0")).toFixed(2)} AUD
                                </div>
                                <div style={{ fontSize: 12, color: "#6366f1", marginTop: 2 }}>
                                    {enablePhases ? `${phases.length} phases, ${phases.reduce((acc, p) => acc + (p.slots || 0), 0)} total slots` : `${amount} workers × $${parseFloat(reward || "0").toFixed(2)} each`}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="table-card" style={{ padding: 20, marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: dripEnabled ? 16 : 0 }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                    <MdOutlineAvTimer size={18} color="var(--indigo)" /> Drip Feed Slots
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Release slots in controlled batches</div>
                            </div>
                            <div
                                style={{ width: 40, height: 22, borderRadius: 99, background: dripEnabled ? "var(--indigo)" : "#d1d5db", cursor: "pointer", padding: "2px", transition: "background 0.2s", display: "flex", alignItems: "center" }}
                                onClick={() => setDripEnabled(!dripEnabled)}
                            >
                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", transform: `translateX(${dripEnabled ? "18px" : "0"})`, transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                            </div>
                        </div>

                        {dripEnabled && (
                            <div className="animate-in" style={{ padding: "12px 0 0", borderTop: "1px solid var(--border)", marginTop: 12 }}>
                                <div className="form-grid-2" style={{ gap: 12 }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: 11 }}>Release Amount</label>
                                        <input 
                                            className="input input-sm" 
                                            type="number" 
                                            placeholder="e.g. 5" 
                                            value={dripAmount} 
                                            onChange={e => setDripAmount(e.target.value)} 
                                        />
                                        <div className="form-hint" style={{ fontSize: 10 }}>Slots per batch</div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontSize: 11 }}>Interval (mins)</label>
                                        <input 
                                            className="input input-sm" 
                                            type="number" 
                                            placeholder="e.g. 60" 
                                            value={dripInterval} 
                                            onChange={e => setDripInterval(e.target.value)} 
                                        />
                                        <div className="form-hint" style={{ fontSize: 10 }}>How often to release</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 12, padding: "8px 10px", background: "var(--indigo-light)", borderRadius: 6, color: "var(--indigo)", fontSize: 11, display: "flex", gap: 6 }}>
                                    <MdHelpOutline size={14} style={{ flexShrink: 0 }} />
                                    <span>Release {dripAmount || "X"} slots every {dripInterval || "Y"} minutes until {enablePhases ? phases.reduce((acc, p) => acc + (p.slots || 0), 0) : (amount || "total")} slots reached.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="table-card" style={{ padding: 20, marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>Allow Multiple Submissions</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Worker can submit this task more than once</div>
                            </div>
                            <div
                                style={{ width: 40, height: 22, borderRadius: 99, background: multiSub ? "var(--indigo)" : "#d1d5db", cursor: "pointer", padding: "2px", transition: "background 0.2s", display: "flex", alignItems: "center" }}
                                onClick={() => setMultiSub(!multiSub)}
                            >
                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", transform: `translateX(${multiSub ? "18px" : "0"})`, transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-primary" style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }} onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <MdHourglassEmpty size={18} /> : isEditing ? <MdSave size={18} /> : <MdCheckCircle size={18} />}
                            {isSaving ? "Saving…" : isEditing ? "Update Task" : "Create Task"}
                        </button>
                        <button className="btn btn-outline" style={{ justifyContent: "center" }} onClick={onBack}>Cancel</button>
                    </div>
                </div>
            </div>

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
