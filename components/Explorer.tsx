"use client";

import { Box, Divider, Stack, Typography } from "@mui/material";
import MapClient from "./MapClient";
import { Photo } from "@/types";

export default function Explorer({ photos }: { photos: Photo[] }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
                height: "100dvh",
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
                <Stack spacing={1.5}>
                    <Typography variant="h6" fontWeight={800}>
                        Explorer
                    </Typography>

                    <Typography color="text.secondary">
                        {photos.length} geotagged photo{photos.length !== 1 && "s"}
                    </Typography>

                    <Divider />

                    <Typography variant="body2" color="text.secondary">
                        Filters coming soon: date, country, search...
                    </Typography>
                </Stack>
            </Box>

            <Box sx={{ position: "relative" }}>
                <MapClient photos={photos} />
            </Box>
        </Box>
    );
}
