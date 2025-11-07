"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Photo } from "@/types";

const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41],
});

export default function MapClient({ photos }: { photos: Photo[] }) {
    const center: [number, number] =
        photos.length ? [
            photos.reduce((a, p) => a + p.lat, 0) / photos.length,
            photos.reduce((a, p) => a + p.lon, 0) / photos.length
        ] : [20, 0];

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <MapContainer center={center} zoom={3} style={{ height: "100%", width: "100%" }} minZoom={2} worldCopyJump>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {photos.map(p => (
                    <Marker key={p.id} position={[p.lat, p.lon]} icon={icon}>
                        <Popup>
                            <div style={{ fontWeight: 700, marginBottom: 8 }}>{p.title ?? "Photo"}</div>
                            <img
                                src={p.imageUrl}
                                alt={p.title ?? ""}
                                style={{ width: 180, height: 120, objectFit: "cover", borderRadius: 8 }}
                            />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
