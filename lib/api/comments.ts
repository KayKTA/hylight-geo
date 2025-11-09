import { SupabaseClient } from "@supabase/supabase-js";
import { Comment, ApiResponse } from "@/types";

/**
 * Fetch all comments for a photo
 */
export async function getPhotoComments(
    supabase: SupabaseClient,
    photoId: string
): Promise<ApiResponse<Comment[]>> {
    try {
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("photo_id", photoId)
            .order("created_at", { ascending: false });

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return { data: null, error: error.message || "Failed to fetch comments" };
    }
}

/**
 * Add a new comment
 */
export async function addComment(
    supabase: SupabaseClient,
    params: {
        photoId: string;
        userId: string;
        content: string;
    }
): Promise<ApiResponse<Comment>> {
    const { photoId, userId, content } = params;

    try {
        const { data, error } = await supabase
            .from("comments")
            .insert({
                photo_id: photoId,
                user_id: userId,
                content: content.trim(),
            })
            .select()
            .single();

        if (error) {
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("Error adding comment:", error);
        return { data: null, error: error.message || "Failed to add comment" };
    }
}

/**
 * Delete a comment
 */
export async function deleteComment(
    supabase: SupabaseClient,
    commentId: string,
    userId: string
): Promise<ApiResponse<void>> {
    try {
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", commentId)
            .eq("user_id", userId); // Security: only owner can delete

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: undefined, error: null };
    } catch (error: any) {
        console.error("Error deleting comment:", error);
        return { data: null, error: error.message || "Failed to delete comment" };
    }
}

/**
 * Get comment count for a photo
 */
export async function getCommentCount(
    supabase: SupabaseClient,
    photoId: string
): Promise<ApiResponse<number>> {
    try {
        const { count, error } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("photo_id", photoId);

        if (error) {
            return { data: null, error: error.message };
        }

        return { data: count || 0, error: null };
    } catch (error: any) {
        console.error("Error getting comment count:", error);
        return { data: null, error: error.message || "Failed to get comment count" };
    }
}
