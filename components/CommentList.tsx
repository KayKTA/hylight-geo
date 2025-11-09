"use client";

import { Stack, Paper, Box, Typography, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
import { Comment } from "@/types";
import { formatRelativeTime } from "@/lib/utils/format";

interface CommentListProps {
    comments: Comment[];
    loading: boolean;
    onDelete: (commentId: string) => Promise<void>;
}

export default function CommentList({ comments, loading, onDelete }: CommentListProps) {
    if (loading) {
        return (
            <Typography variant="body2" color="text.secondary">
                Loading comments...
            </Typography>
        );
    }

    if (comments.length === 0) {
        return (
            <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ py: 3 }}
            >
                No notes yet. Add your first note above!
            </Typography>
        );
    }

    return (
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
                                {formatRelativeTime(comment.created_at)}
                            </Typography>
                        </Box>
                        <IconButton
                            size="small"
                            onClick={() => onDelete(comment.id)}
                            sx={{ ml: 1 }}
                            aria-label="Delete comment"
                        >
                            <Trash2 size={16} />
                        </IconButton>
                    </Box>
                </Paper>
            ))}
        </Stack>
    );
}
