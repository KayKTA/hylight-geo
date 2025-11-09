"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Hook to protect routes that require authentication
 * Redirects to /login if the user is not authenticated
 */
export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Avoid redirect loop while still loading auth state
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    return { user, loading };
}
