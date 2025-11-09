import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getPhotoComments, addComment as addCommentApi, deleteComment as deleteCommentApi } from "@/lib/api/comments";
import { Comment, UseCommentsReturn } from "@/types";

/**
 * Custom hook to manage comments for a photo
 * Encapsulates all comment-related logic and state
 */
export function useComments(photoId: string | null, userId: string): UseCommentsReturn {
    const supabase = useMemo(() => createBrowserSupabaseClient(), []);

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load comments
    const loadComments = useCallback(async () => {
        if (!photoId) return;

        setLoading(true);
        setError(null);

        const result = await getPhotoComments(supabase, photoId);

        if (result.error) {
            setError(result.error);
            setComments([]);
        } else if (result.data) {
            setComments(result.data);
        }

        setLoading(false);
    }, [photoId, supabase]);

    // Load on mount or when photoId changes
    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Add comment
    const addComment = useCallback(async (content: string) => {
        if (!photoId || !content.trim()) return;

        setError(null);

        const result = await addCommentApi(supabase, {
            photoId,
            userId,
            content,
        });

        if (result.error) {
            setError(result.error);
            throw new Error(result.error);
        } else if (result.data) {
            setComments((prev) => [result.data, ...prev]);
        }
    }, [photoId, userId, supabase]);

    // Delete comment
    const deleteComment = useCallback(async (commentId: string) => {
        setError(null);

        const result = await deleteCommentApi(supabase, commentId, userId);

        if (result.error) {
            setError(result.error);
            throw new Error(result.error);
        } else {
            // Optimistically update UI
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
    }, [userId, supabase]);

    // Refresh comments
    const refresh = useCallback(async () => {
        await loadComments();
    }, [loadComments]);

    return {
        comments,
        loading,
        error,
        addComment,
        deleteComment,
        refresh,
    };
}
