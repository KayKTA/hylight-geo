"use client";

import {
    Dialog,
    DialogContent,
    Box,
    IconButton,
    Typography,
    Stack,
    Chip,
    Alert,
    Divider,
} from "@mui/material";
import { X, MapPin, Calendar, MessageSquare } from "lucide-react";
import { Photo } from "@/types";
import { useComments } from "@/lib/hooks/useComments";
import { formatRelativeTime, formatCoordinates } from "@/lib/utils/format";
import { useAuth } from "@/lib/contexts/AuthContext";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

interface PhotoDetailModalProps {
    open: boolean;
    onClose: () => void;
    photo: Photo | null;
}

export default function PhotoDetailModal({
    open,
    onClose,
    photo,
}: PhotoDetailModalProps) {
    const { userId } = useAuth();

    // Use custom hook for all comment logic
    const { comments, loading, error, addComment, deleteComment } = useComments(
        photo?.id || null,
        userId || ""
    );

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
                        <IconButton onClick={onClose} size="small" aria-label="Close">
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
                                    label={formatCoordinates(photo.lat, photo.lon)}
                                    size="small"
                                    variant="outlined"
                                />
                                {photo.created_at && (
                                    <Chip
                                        icon={<Calendar size={14} />}
                                        label={formatRelativeTime(photo.created_at)}
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
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                {/* Add comment form */}
                                <Box sx={{ mb: 3 }}>
                                    <CommentForm onSubmit={addComment} />
                                </Box>

                                {/* Comments list */}
                                <CommentList
                                    comments={comments}
                                    loading={loading}
                                    onDelete={deleteComment}
                                />
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
