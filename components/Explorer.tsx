"use client";

import { useState } from "react";
import {
    Box,
    Divider,
    Stack,
    Typography,
    Button,
    Alert,
    Drawer,
    IconButton,
    useMediaQuery,
    useTheme,
    Fab,
} from "@mui/material";
import { Plus, Menu, X } from "lucide-react";
import UploadModal from "./UploadModal";
import { Photo } from "@/types";
import { useAuth } from "@/lib/contexts/AuthContext";
import dynamic from "next/dynamic";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

// Lazy import MapClient (no SSR)
const MapClient = dynamic(() => import("./MapClient"), {
    ssr: false,
});

interface ExplorerProps {
    photos: Photo[];
}

export default function Explorer({ photos }: ExplorerProps) {
    useRequireAuth();
    const { userId } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [uploadOpen, setUploadOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const sidebarContent = (
        <Box
            sx={{
                p: 2,
                height: "100%",
                bgcolor: "background.default",
            }}
        >
            <Stack spacing={2}>
                {/* Header with close button on mobile */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6" fontWeight={800}>
                        Explorer
                    </Typography>
                    {isMobile && (
                        <IconButton
                            size="small"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <X size={20} />
                        </IconButton>
                    )}
                </Box>

                {/* Upload Button */}
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Plus size={18} />}
                    onClick={() => {
                        setUploadOpen(true);
                        if (isMobile) setSidebarOpen(false);
                    }}
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
    );

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
                height: "100%",
                overflow: "hidden",
            }}
        >
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Box
                    sx={{
                        borderRight: 1,
                        borderColor: "divider",
                        overflowY: "auto",
                    }}
                >
                    {sidebarContent}
                </Box>
            )}

            {/* Mobile Drawer Sidebar */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    PaperProps={{
                        sx: { width: 280 },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            {/* Map Container */}
            <Box sx={{ position: "relative", height: "100%" }}>
                <MapClient photos={photos} />

                {/* Mobile Menu Button (FAB) */}
                {isMobile && (
                    <Fab
                        color="primary"
                        aria-label="Open menu"
                        onClick={() => setSidebarOpen(true)}
                        sx={{
                            position: "absolute",
                            top: 16,
                            left: 16,
                            zIndex: 1000,
                        }}
                    >
                        <Menu size={24} />
                    </Fab>
                )}

                {/* Mobile Upload Button (FAB) */}
                {isMobile && userId && (
                    <Fab
                        color="secondary"
                        aria-label="Upload photo"
                        onClick={() => setUploadOpen(true)}
                        sx={{
                            position: "absolute",
                            bottom: 80,
                            right: 16,
                            zIndex: 1000,
                        }}
                    >
                        <Plus size={24} />
                    </Fab>
                )}
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
