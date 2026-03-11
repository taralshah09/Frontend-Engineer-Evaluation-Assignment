"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authStore, sessionStorage as mockSession } from "@/storage";
import type { Session, User } from "@/libs/types";

interface AuthContextValue {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    isWorker: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = mockSession.get();
        if (stored) {
            setSession(stored);
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(
        async (username: string, password: string) => {
            const { session: newSession, user: newUser } = await authStore.login(
                username,
                password
            );
            setSession(newSession);
            setUser(newUser);

            if (newSession.role === "admin") {
                router.push("/admin/tasks");
            } else {
                router.push("/worker/feed");
            }
        },
        [router]
    );

    const logout = useCallback(async () => {
        await authStore.logout();
        setSession(null);
        setUser(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                isLoading,
                isAdmin: session?.role === "admin",
                isWorker: session?.role === "worker",
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}