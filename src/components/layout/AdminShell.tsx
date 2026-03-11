"use client";

import React, { useState, useRef, useEffect } from "react";
import { TaskComposerPage } from "@/features/microtask/TaskComposerPage";
import { AdminTasksPage } from "@/features/microtask/AdminTasksPage";
import { AdminSubmissionsPage } from "@/features/microtask/AdminSubmissionsPage";
import { useSubmissions, useCreateCampaign } from "@/features/hooks";
import type { Session } from "@/libs/types";
import { SEED_CAMPAIGNS } from "@/mock/seed";
import {
    MdFlashOn,
    MdOutlineInbox,
    MdEdit,
    MdPerson,
    MdLogout,
    MdMenu,
    MdExpandLess,
    MdAdd,
} from "react-icons/md";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface AdminShellProps {
    session: Session;
    onLogout: () => void;
}

const CAMPAIGN_COLORS = ["#6366f1", "#059669", "#d97706", "#0284c7"];

export function AdminShell({ session, onLogout }: AdminShellProps) {
    const [page, setPage] = useState("tasks");
    const [composing, setComposing] = useState(false);
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
    const [filterTaskId, setFilterTaskId] = useState<string | null>(null);
    const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState("");
    const createCampaignMutation = useCreateCampaign();
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data: pendingSubs } = useSubmissions({ status: "pending" });
    const pendingCount = pendingSubs?.length ?? 0;

    const navItems = [
        { id: "tasks", icon: <MdFlashOn size={17} />, label: "Tasks", badge: null as number | null },
        { id: "submissions", icon: <MdOutlineInbox size={17} />, label: "Submissions", badge: pendingCount || null },
    ];

    const initials = session.username.slice(0, 2).toUpperCase();

    const handleOpenComposer = (taskId?: string) => {
        setEditTaskId(taskId ?? null);
        setComposing(true);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await onLogout();
    };

    const handleClickCampaign = (campaignId: string) => {
        setActiveCampaignId(campaignId);
        setPage("tasks");
        setComposing(false);
        setFilterTaskId(null);
    };

    const handleClearCampaign = () => {
        setActiveCampaignId(null);
        setFilterTaskId(null);
    };

    const handleViewSubmissions = (taskId: string) => {
        setFilterTaskId(taskId);
        setPage("submissions");
        setComposing(false);
    };

    const handleNavTo = (pageId: string) => {
        setPage(pageId);
        setComposing(false);
        if (pageId === "tasks") {
            setActiveCampaignId(null);
            setFilterTaskId(null);
        }
        if (pageId === "submissions") {
            setFilterTaskId(null);
        }
    };

    const activeCampaign = activeCampaignId
        ? SEED_CAMPAIGNS.find((c) => c.id === activeCampaignId)
        : null;

    const getTopbarTitle = () => {
        if (composing) return "";
        if (page === "submissions") return "Submissions";
        if (activeCampaign) return `Tasks › ${activeCampaign.name}`;
        return "Task Management";
    };

    const getTopbarSub = () => {
        if (composing) return "";
        if (page === "submissions") return "Review worker submissions";
        if (activeCampaign) return `Showing tasks in ${activeCampaign.name}`;
        return "Manage and monitor all tasks";
    };

    const [sidebarWidth, setSidebarWidth] = useState(232);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const savedWidth = localStorage.getItem("adminSidebarWidth");
        if (savedWidth) setSidebarWidth(parseInt(savedWidth, 10));
    }, []);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            let newWidth = e.clientX;
            if (newWidth < 180) newWidth = 180;
            if (newWidth > 480) newWidth = 480;
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false);
                localStorage.setItem("adminSidebarWidth", sidebarWidth.toString());
            }
        };

        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, sidebarWidth]);

    return (
        <div className={`app${sidebarOpen ? " sidebar-open" : ""}`} style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}>
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            <aside className="sidebar" style={{ width: `var(--sidebar-width)` }}>
                <div className="sidebar-logo">
                    <div className="logo-mark">M</div>
                    <span className="logo-text">microtask</span>
                    <span className="logo-badge">Admin</span>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-label">Platform</div>
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${page === item.id && !composing && !activeCampaignId ? "active" : ""}`}
                            onClick={() => handleNavTo(item.id)}
                        >
                            <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                        </div>
                    ))}
                    <div className={`nav-item ${composing ? "active" : ""}`} onClick={() => handleOpenComposer()}>
                        <span style={{ display: "flex", alignItems: "center" }}><MdEdit size={17} /></span>
                        <span>Task Composer</span>
                    </div>
                </div>

                <div className="sidebar-section" style={{ marginTop: 8 }}>
                    <div className="sidebar-section-label">Campaigns</div>
                    {SEED_CAMPAIGNS.map((c, i) => (
                        <div
                            key={c.id}
                            className={`nav-item ${activeCampaignId === c.id && page === "tasks" && !composing ? "active" : ""}`}
                            onClick={() => handleClickCampaign(c.id)}
                        >
                            <span style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length],
                                flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 12.5 }}>{c.name}</span>
                        </div>
                    ))}
                    {isCreatingCampaign ? (
                        <div style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: "var(--radius-sm)", margin: "4px 0" }}>
                            <input
                                autoFocus
                                className="input input-sm"
                                placeholder="Campaign name..."
                                value={newCampaignName}
                                onChange={e => setNewCampaignName(e.target.value)}
                                onKeyDown={async e => {
                                    if (e.key === "Enter" && newCampaignName.trim()) {
                                        await createCampaignMutation.mutateAsync({ name: newCampaignName.trim() });
                                        setNewCampaignName("");
                                        setIsCreatingCampaign(false);
                                    }
                                    if (e.key === "Escape") setIsCreatingCampaign(false);
                                }}
                                style={{ width: "100%", fontSize: 12 }}
                            />
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                <button
                                    className="btn btn-primary btn-xs"
                                    style={{ flex: 1, fontSize: 10, padding: "2px 4px" }}
                                    onClick={async () => {
                                        if (newCampaignName.trim()) {
                                            await createCampaignMutation.mutateAsync({ name: newCampaignName.trim() });
                                            setNewCampaignName("");
                                            setIsCreatingCampaign(false);
                                        }
                                    }}
                                >Save</button>
                                <button
                                    className="btn btn-ghost btn-xs"
                                    style={{ flex: 1, fontSize: 10, padding: "2px 4px" }}
                                    onClick={() => setIsCreatingCampaign(false)}
                                >Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="nav-item" onClick={() => setIsCreatingCampaign(true)} style={{ color: "var(--indigo)", opacity: 0.8 }}>
                            <MdAdd size={16} />
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>New Campaign</span>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="user-card" onClick={() => setProfileOpen(v => !v)} style={{ cursor: "pointer", position: "relative" }}>
                        <div className="avatar" style={{ background: "#6366f1" }}>{initials}</div>
                        <div className="user-info">
                            <div className="user-name">{session.username}</div>
                            <div className="user-role">Administrator</div>
                        </div>
                        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", color: "var(--text-muted)" }}>
                            <MdExpandLess size={16} />
                        </span>
                    </div>
                </div>
            </aside>

            <div
                className={`sidebar-resizer ${isResizing ? "is-resizing" : ""}`}
                onMouseDown={startResizing}
            />

            <main className="main">
                <div className="topbar">
                    <div className="topbar-menu-btn" onClick={() => setSidebarOpen(v => !v)}>
                        <MdMenu size={20} />
                    </div>
                    {composing ? (
                        <div className="breadcrumb">
                            <span style={{ cursor: "pointer", color: "var(--indigo)" }} onClick={() => setComposing(false)}>Tasks</span>
                            <span>›</span>
                            <span>{editTaskId ? "Edit Task" : "New Task"}</span>
                        </div>
                    ) : activeCampaign && page === "tasks" ? (
                        <div className="breadcrumb">
                            <span
                                style={{ cursor: "pointer", color: "var(--indigo)" }}
                                onClick={handleClearCampaign}
                            >
                                Tasks
                            </span>
                            <span>›</span>
                            <span>{activeCampaign.name}</span>
                        </div>
                    ) : (
                        <>
                            <span className="topbar-title">{getTopbarTitle()}</span>
                            <div className="topbar-sep" />
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                {getTopbarSub()}
                            </span>
                        </>
                    )}
                    <div className="topbar-actions">
                        <ThemeToggle />
                        <div ref={profileRef} style={{ position: "relative" }}>
                            <div
                                className="avatar avatar-sm"
                                style={{ background: "#6366f1", cursor: "pointer", outline: profileOpen ? "2px solid #6366f1" : "none", outlineOffset: 2 }}
                                onClick={() => setProfileOpen(v => !v)}
                            >
                                {initials}
                            </div>
                            {profileOpen && (
                                <div style={{
                                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220,
                                    background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                                    boxShadow: "var(--shadow-lg)", zIndex: 1000, overflow: "hidden",
                                }}>
                                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                                        <div className="avatar" style={{ background: "#6366f1", width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>{initials}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{session.username}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{session.email}</div>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Administrator</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: "6px 0" }}>
                                        <button
                                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 13, transition: "background 0.15s", textAlign: "left" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                            onClick={() => { setProfileOpen(false); }}
                                        >
                                            <MdPerson size={16} /> View Profile
                                        </button>
                                        <button
                                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "#fda4af", fontSize: 13, transition: "background 0.15s", textAlign: "left" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(225,29,72,0.08)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                        >
                                            <MdLogout size={16} /> {loggingOut ? "Signing out…" : "Sign out"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="page-content">
                    {composing && (
                        <TaskComposerPage
                            onBack={() => { setComposing(false); setEditTaskId(null); }}
                            editTaskId={editTaskId}
                        />
                    )}
                    {!composing && page === "tasks" && (
                        <AdminTasksPage
                            onOpenComposer={() => handleOpenComposer()}
                            onEditTask={(id) => handleOpenComposer(id)}
                            onViewSubmissions={handleViewSubmissions}
                            campaignId={activeCampaignId ?? undefined}
                        />
                    )}
                    {!composing && page === "submissions" && (
                        <AdminSubmissionsPage
                            filterTaskId={filterTaskId ?? undefined}
                            onClearTaskFilter={() => setFilterTaskId(null)}
                        />
                    )}
                </div>
            </main>

        </div>
    );
}
