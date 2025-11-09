"use client";

import { useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Photo } from "@/types";
import { Box, Typography, Chip, Stack, Button } from "@mui/material";
import { MessageSquare } from "lucide-react";
import PhotoDetailModal from "./PhotoDetailModal";
import { MAP_CONFIG } from "@/lib/constants";

// Custom marker icon
const createCustomIcon = (color: string = "#3b82f6") =>
    new L.Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
        `)}`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });

// Auto-fit bounds component
function FitBounds({ photos }: { photos: Photo[] }) {
    const map = useMap();

    useMemo(() => {
        if (photos.length === 0) return;

        if (photos.length === 1) {
            map.setView([photos[0].lat, photos[0].lon], 13);
        } else {
            const bounds = L.latLngBounds(photos.map((p) => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [photos, map]);

    return null;
}

interface MapClientProps {
    photos: Photo[];
    userId: string | null;
}

export default function MapClient({ photos, userId }: MapClientProps) {
    const icon = useMemo(() => createCustomIcon(), []);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    return (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
            <MapContainer
                center={MAP_CONFIG.DEFAULT_CENTER}
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                style={{ height: "100%", width: "100%" }}
                minZoom={MAP_CONFIG.MIN_ZOOM}
                maxZoom={MAP_CONFIG.MAX_ZOOM}
                worldCopyJump
                scrollWheelZoom
            >
                <TileLayer
                    attribution={MAP_CONFIG.TILE_ATTRIBUTION}
                    url={MAP_CONFIG.TILE_URL}
                />

                <FitBounds photos={photos} />

                {photos.map((photo) => (
                    <Marker key={photo.id} position={[photo.lat, photo.lon]} icon={icon}>
                        <Popup maxWidth={250} minWidth={200}>
                            <Stack spacing={1.5}>
                                {/* Image preview */}
                                <Box
                                    component="img"
                                    src={photo.imageUrl}
                                    alt={photo.title || "Photo"}
                                    sx={{
                                        width: "100%",
                                        height: 120,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                    }}
                                />

                                {/* Title */}
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {photo.title || "Untitled"}
                                </Typography>

                                {/* Comment count */}
                                {photo.commentCount !== undefined && photo.commentCount > 0 && (
                                    <Chip
                                        icon={<MessageSquare size={14} />}
                                        label={`${photo.commentCount} note${
                                            photo.commentCount > 1 ? "s" : ""
                                        }`}
                                        size="small"
                                        color="primary"
                                    />
                                )}

                                {/* View details button */}
                                <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    View Details
                                </Button>
                            </Stack>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend */}
            {photos.length > 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        bgcolor: "background.paper",
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        boxShadow: 2,
                        zIndex: 1000,
                    }}
                >
                    <Typography variant="caption" fontWeight={600}>
                        {photos.length} photo{photos.length > 1 ? "s" : ""}
                    </Typography>
                </Box>
            )}

            {/* Photo Detail Modal */}
            {userId && (
                <PhotoDetailModal
                    open={!!selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    photo={selectedPhoto}
                    userId={userId}
                />
            )}
        </Box>
    );
}
