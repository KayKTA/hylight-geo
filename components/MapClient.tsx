"use client";

import { useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Photo } from "@/types";
import { Box, Typography, Chip, Stack, Button } from "@mui/material";
import { Calendar, MapPin } from "lucide-react";
import PhotoDetailModal from "./PhotoDetailModal";


// Personalised icon for markers
const createCustomIcon = (color: string = "#3b82f6") => new L.Icon({
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

// Adjust map view to fit all markers
function FitBounds({ photos }: { photos: Photo[] }) {
    const map = useMap();

    useMemo(() => {
        if (photos.length === 0) return;

        if (photos.length === 1) {
            // center on single photo
            map.setView([photos[0].lat, photos[0].lon], 13);
        } else {
            // adjust bounds to fit all photos
            const bounds = L.latLngBounds(photos.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [photos, map]);

    return null;
}

export default function MapClient({
    photos,
    userId
}: {
    photos: Photo[];
    userId: string | null;
}) {
    const icon = useMemo(() => createCustomIcon(), []);
    const defaultCenter: [number, number] = [46.603354, 1.888334];

    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    return (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
            <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: "100%", width: "100%" }}
                minZoom={2}
                maxZoom={18}
                worldCopyJump
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <FitBounds photos={photos} />

                {photos.map((photo) => (
                    <Marker
                        key={photo.id}
                        position={[photo.lat, photo.lon]}
                        icon={icon}
                    >
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
                                        label={`${photo.commentCount} note${photo.commentCount > 1 ? 's' : ''}`}
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
