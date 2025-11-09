"use client";

import { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Photo } from "@/types";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { Calendar, MapPin } from "lucide-react";

// Icône personnalisée pour les markers
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

// Composant pour ajuster automatiquement la vue de la carte
function FitBounds({ photos }: { photos: Photo[] }) {
    const map = useMap();

    useMemo(() => {
        if (photos.length === 0) return;

        if (photos.length === 1) {
            // Une seule photo : centrer dessus
            map.setView([photos[0].lat, photos[0].lon], 13);
        } else {
            // Plusieurs photos : ajuster pour tout voir
            const bounds = L.latLngBounds(photos.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [photos, map]);

    return null;
}

// Formater la date
function formatDate(dateString?: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export default function MapClient({ photos }: { photos: Photo[] }) {
    const icon = useMemo(() => createCustomIcon(), []);

    // Centre par défaut si pas de photos
    const defaultCenter: [number, number] = [46.603354, 1.888334]; // Centre de la France

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
                {/* Tile Layer - Style CartoDB Voyager (plus moderne) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    // url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Ajuster automatiquement la vue */}
                <FitBounds photos={photos} />

                {/* Markers */}
                {photos.map((photo) => (
                    <Marker
                        key={photo.id}
                        position={[photo.lat, photo.lon]}
                        icon={icon}
                    >
                        <Popup maxWidth={300} minWidth={250}>
                            <Stack spacing={1.5}>
                                {/* Image */}
                                <Box
                                    component="img"
                                    src={photo.imageUrl}
                                    alt={photo.title || "Photo"}
                                    sx={{
                                        width: "100%",
                                        height: 180,
                                        objectFit: "cover",
                                        borderRadius: 1,
                                        cursor: "pointer",
                                        transition: "opacity 0.2s",
                                        "&:hover": {
                                            opacity: 0.9,
                                        },
                                    }}
                                    onClick={() => window.open(photo.imageUrl, "_blank")}
                                />

                                {/* Titre */}
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {photo.title || "Untitled"}
                                </Typography>

                                {/* Description */}
                                {photo.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                        }}
                                    >
                                        {photo.description}
                                    </Typography>
                                )}

                                {/* Métadonnées */}
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
                            </Stack>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Légende avec nombre de photos */}
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

            {/* Message si aucune photo */}
            {photos.length === 0 && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        bgcolor: "background.paper",
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        zIndex: 1000,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        No photos yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload your first geotagged photo to see it on the map
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
