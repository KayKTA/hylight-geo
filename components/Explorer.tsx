"use client";

import { useState } from "react";
import { Box, Divider, Stack, Typography, Button, Alert } from "@mui/material";
import { Plus } from "lucide-react";
import MapClient from "./MapClient";
import UploadModal from "./UploadModal";
import { Photo } from "@/types";

interface ExplorerProps {
    photos: Photo[];
    userId: string | null;
}

export default function Explorer({ photos, userId }: ExplorerProps) {
    const [uploadOpen, setUploadOpen] = useState(false);

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
                height: "100%", // Changed from 100dvh to 100%
                overflow: "hidden",
            }}
        >
            {/* Sidebar */}
            <Box
                sx={{
                    p: 2,
                    borderRight: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    overflowY: "auto",
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={800}>
                        Explorer
                    </Typography>

                    {/* Upload Button */}
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Plus size={18} />}
                        onClick={() => setUploadOpen(true)}
                        disabled={!userId}
                    >
                        Upload Photo
                    </Button>

                    {!userId && (
                        <Alert severity="warning" sx={{ fontSize: "0.875rem" }}>
                            Please login to upload photos
                        </Alert>
                    )}

                    <Divider />

                    <Typography color="text.secondary" variant="body2">
                        {photos.length} geotagged photo{photos.length !== 1 ? "s" : ""}
                    </Typography>

                    <Divider />

                    <Typography variant="body2" color="text.secondary">
                        Filters coming soon: date, country, search...
                    </Typography>
                </Stack>
            </Box>

            {/* Map */}
            <Box sx={{ position: "relative", height: "100%" }}>
                <MapClient photos={photos} userId={userId} />
            </Box>

            {/* Upload Modal */}
            {userId && (
                <UploadModal
                    open={uploadOpen}
                    onClose={() => setUploadOpen(false)}
                    userId={userId}
                />
            )}
        </Box>
    );
}
