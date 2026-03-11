import React, { useState } from "react";

interface LoginPageProps {
    onLogin: (username: string, password: string) => void;
    loading?: boolean;
    error?: string;
}

export function LoginPage({ onLogin, loading = false, error = "" }: LoginPageProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");

    const handle = () => {
        if (!username || !password) { setLocalError("Please enter your credentials."); return; }
        setLocalError("");
        onLogin(username, password);
    };

    const displayError = localError || error;

    return (
        <div className="login-page">
            <div className="login-glow" />
            <div className="login-glow-2" />
            <div className="login-card animate-up">
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                    <div className="logo-mark" style={{ width: 40, height: 40, fontSize: 17 }}>M</div>
                    <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#e2e8f4" }}>MicroTask</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Internal task platform</div>
                    </div>
                </div>

                <div style={{ marginBottom: 6, display: "flex", gap: 8, flexDirection: "column" }}>
                    <div style={{ marginBottom: 16 }}>
                        <label className="login-label">Username</label>
                        <input className="login-input" placeholder="e.g. admin or your username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label className="login-label">Password</label>
                        <input className="login-input" type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
                    </div>
                </div>

                {displayError && <div style={{ background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.2)", borderRadius: 6, padding: "8px 12px", color: "#fda4af", fontSize: 13, marginBottom: 14 }}>{displayError}</div>}

                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px 14px", fontSize: 14 }} onClick={handle} disabled={loading}>
                    {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="login-hint" style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 600, color: "#4b5568", marginBottom: 6, fontSize: 11 }}>DEMO CREDENTIALS</div>
                    <div>Admin → <code style={{ color: "#818cf8" }}>admin / admin</code></div>
                    <div>Worker → any username + any password</div>
                </div>
            </div>
        </div>
    );
}
