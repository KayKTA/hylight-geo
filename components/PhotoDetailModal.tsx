"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    Box,
    IconButton,
    Typography,
    TextField,
    Button,
    Stack,
    Chip,
    Alert,
    Paper,
    Divider,
} from "@mui/material";
import { X, MapPin, Calendar, MessageSquare, Trash2, Send } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Photo, Comment } from "@/types";
import { useRouter } from "next/navigation";

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
}

export default function PhotoDetailModal({
    open,
    onClose,
    photo,
    userId,
}: {
    open: boolean;
    onClose: () => void;
    photo: Photo | null;
    userId: string;
}) {
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load comments when modal opens
    useEffect(() => {
        if (open && photo) {
            loadComments();
        }
    }, [open, photo?.id]);

    const loadComments = async () => {
        if (!photo) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("photo_id", photo.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (e: any) {
            console.error("Error loading comments:", e);
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!photo || !newComment.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("comments")
                .insert({
                    photo_id: photo.id,
                    user_id: userId,
                    content: newComment.trim(),
                })
                .select()
                .single();

            if (error) throw error;

            // Add new comment to list
            setComments([data, ...comments]);
            setNewComment("");
        } catch (e: any) {
            console.error("Error adding comment:", e);
            setError("Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId)
                .eq("user_id", userId); // Security: only delete own comments

            if (error) throw error;

            // Remove from list
            setComments(comments.filter((c) => c.id !== commentId));
        } catch (e: any) {
            console.error("Error deleting comment:", e);
            setError("Failed to delete comment");
        }
    };

    if (!photo) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { maxHeight: "90vh" }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box>
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderBottom: 1,
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            {photo.title || "Untitled"}
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <X size={20} />
                        </IconButton>
                    </Box>

                    {/* Image */}
                    <Box
                        component="img"
                        src={photo.imageUrl}
                        alt={photo.title || "Photo"}
                        sx={{
                            width: "100%",
                            maxHeight: "400px",
                            objectFit: "contain",
                            bgcolor: "black",
                        }}
                    />

                    {/* Details & Comments */}
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            {/* Description */}
                            {photo.description && (
                                <Typography variant="body1">{photo.description}</Typography>
                            )}

                            {/* Metadata */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                    icon={<MapPin size={14} />}
                                    label={`${photo.lat.toFixed(4)}, ${photo.lon.toFixed(4)}`}
                                    size="small"
                                    variant="outlined"
                                />
                                {photo.createdAt && (
                                    <Chip
                                        icon={<Calendar size={14} />}
                                        label={formatDate(photo.createdAt)}
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Stack>

                            <Divider />

                            {/* Comments section */}
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                                    <MessageSquare size={20} />
                                    <Typography variant="h6" fontWeight={700}>
                                        My Notes ({comments.length})
                                    </Typography>
                                </Box>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                        {error}
                                    </Alert>
                                )}

                                {/* Add comment form */}
                                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Add a note..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment();
                                            }
                                        }}
                                        multiline
                                        maxRows={3}
                                        disabled={submitting}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim() || submitting}
                                        sx={{ minWidth: "auto", px: 2 }}
                                    >
                                        <Send size={18} />
                                    </Button>
                                </Stack>

                                {/* Comments list */}
                                {loading ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading comments...
                                    </Typography>
                                ) : comments.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                                        No notes yet. Add your first note above!
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {comments.map((comment) => (
                                            <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            {comment.content}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDate(comment.created_at)}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
