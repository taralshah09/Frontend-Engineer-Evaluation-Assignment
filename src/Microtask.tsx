"use client";

import React, { useState, useEffect } from "react";
import "@/styles/Microtask.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/features/microtask/LoginPage";
import { AdminShell } from "@/components/layout/AdminShell";
import { WorkerShell } from "@/components/layout/WorkerShell";
import { seedLocalStorage } from "@/mock/seed";
import { authStore, sessionStorage as ss } from "@/storage";
import type { Session } from "@/libs/types";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 0,
        },
    },
});

export default function Microtask() {
    const [session, setSession] = useState<Session | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        seedLocalStorage();
        const existing = ss.get();
        if (existing) setSession(existing);
        setMounted(true);
    }, []);

    const handleLogin = async (username: string, password: string) => {
        setLoginLoading(true);
        setLoginError("");
        try {
            const { session: newSession } = await authStore.login(username, password);
            setSession(newSession);
        } catch (err: unknown) {
            setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        await authStore.logout();
        setSession(null);
    };

    if (!mounted) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
                {!session && (
                    <LoginPage
                        onLogin={handleLogin}
                        loading={loginLoading}
                        error={loginError}
                    />
                )}
                {session?.role === "admin" && (
                    <AdminShell session={session} onLogout={handleLogout} />
                )}
                {session?.role === "worker" && (
                    <WorkerShell session={session} onLogout={handleLogout} />
                )}
            </div>
        </QueryClientProvider>
    );
}