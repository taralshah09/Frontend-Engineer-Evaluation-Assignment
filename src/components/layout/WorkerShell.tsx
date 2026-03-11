import React, { useState, useEffect, useRef } from "react";
import { WorkerFeedPage } from "@/features/microtask/WorkerFeedPage";
import { useSubmissions } from "@/features/hooks";
import { userStore } from "@/storage";
import type { Session, User } from "@/libs/types";
import {
    MdFlashOn,
    MdPerson,
    MdLogout,
    MdMenu,
    MdExpandLess,
} from "react-icons/md";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface WorkerShellProps {
    session: Session;
    onLogout: () => void;
}

export function WorkerShell({ session, onLogout }: WorkerShellProps) {
    const [page, setPage] = useState("feed");
    const [workerUser, setWorkerUser] = useState<User | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const { data: mySubs = [] } = useSubmissions({ user_id: session.userId });

    useEffect(() => {
        userStore.getById(session.userId).then(user => {
            if (user) setWorkerUser(user);
        }).catch(() => { });
    }, [session.userId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { id: "feed", icon: <MdFlashOn size={17} />, label: "Tasks" },
        { id: "profile", icon: <MdPerson size={17} />, label: "Profile" },
    ];

    const initials = session.username.slice(0, 2).toUpperCase();
    const approvedSubs = mySubs.filter(s => s.status === "approved");
    const pendingSubs = mySubs.filter(s => s.status === "pending");

    const totalEarned = workerUser?.total_earned ?? 0;
    const approvedCount = workerUser?.approved_submissions ?? approvedSubs.length;
    const totalSubmissions = workerUser?.total_submissions ?? mySubs.length;

    const handleLogout = async () => {
        setLoggingOut(true);
        await onLogout();
    };

    const [sidebarWidth, setSidebarWidth] = useState(232);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const savedWidth = localStorage.getItem("workerSidebarWidth");
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
                localStorage.setItem("workerSidebarWidth", sidebarWidth.toString());
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
                    <span className="logo-badge" style={{ background: "#059669" }}>Worker</span>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-label">Navigation</div>
                    {navItems.map(item => (
                        <div key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
                            <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ margin: "12px 8px", background: "rgba(91,91,214,0.1)", border: "1px solid rgba(91,91,214,0.2)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Your Earnings</div>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>${totalEarned.toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{approvedCount}/{totalSubmissions} approved</div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-card" onClick={() => setProfileOpen(v => !v)} style={{ cursor: "pointer" }}>
                        <div className="avatar" style={{ background: "#059669" }}>{initials}</div>
                        <div className="user-info">
                            <div className="user-name">{session.username}</div>
                            <div className="user-role">Worker</div>
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
                    <span className="topbar-title">{page === "feed" ? "Tasks Feed" : "My Profile"}</span>
                    <div className="topbar-sep" />
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {page === "feed" ? "Browse and complete available tasks" : "Your account and earnings"}
                    </span>
                    <div className="topbar-actions">
                        <ThemeToggle />
                        <div ref={profileRef} style={{ position: "relative" }}>
                            <div
                                className="avatar avatar-sm"
                                style={{ background: "#059669", cursor: "pointer", outline: profileOpen ? "2px solid #059669" : "none", outlineOffset: 2 }}
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
                                        <div className="avatar" style={{ background: "#059669", width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>{initials}</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{session.username}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{session.email}</div>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>Worker</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Earned</div>
                                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>${totalEarned.toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Approved</div>
                                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{approvedCount}/{totalSubmissions}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: "6px 0" }}>
                                        <button
                                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: 13, transition: "background 0.15s", textAlign: "left" }}
                                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                                            onClick={() => { setProfileOpen(false); setPage("profile"); }}
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
                    {page === "feed" && <WorkerFeedPage session={session} />}
                    {page === "profile" && (
                        <div className="table-card" style={{ padding: 32, maxWidth: 560 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                                <div className="avatar" style={{ background: "#059669", width: 56, height: 56, fontSize: 20 }}>{initials}</div>
                                <div>
                                    <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 20 }}>{session.username}</div>
                                    <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{session.email} · Worker</div>
                                </div>
                            </div>
                            <div className="divider" />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
                                {[
                                    { label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, sub: "AUD" },
                                    { label: "Submissions", value: String(totalSubmissions), sub: "total" },
                                    { label: "Approved", value: String(approvedCount), sub: totalSubmissions > 0 ? `${Math.round((approvedCount / totalSubmissions) * 100)}% rate` : "—" },
                                ].map(s => (
                                    <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px 16px" }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 20 }}>{s.value}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="divider" />
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 14, marginTop: 16 }}>Recent Submissions</div>
                            {mySubs.length === 0 ? (
                                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No submissions yet. Head to the feed to get started!</div>
                            ) : (
                                mySubs.slice(0, 5).map(sub => (
                                    <div key={sub.id} className="detail-row" style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{sub.task_id}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(sub.submitted_at).toLocaleDateString("en-AU")}</div>
                                        </div>
                                        <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                                    </div>
                                ))
                            )}
                            <div style={{ marginTop: 24 }}>
                                <button
                                    className="btn btn-danger"
                                    style={{ justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                >
                                    <MdLogout size={16} /> {loggingOut ? "Signing out…" : "Sign out"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
