"use client";

import { useState } from "react";
import {
    Box,
    Stack,
    Typography,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    TextField,
    Alert,
    LinearProgress,
    Card,
    CardMedia,
    Chip,
    Snackbar,
} from "@mui/material";
import { Upload, X, MapPin, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import * as exifr from "exifr";
import { Gps } from "@/types";

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

interface SnackMessage {
    type: "success" | "info" | "warning" | "error";
    msg: string;
    persistent?: boolean;
}

export default function UploadModal({
    open,
    onClose,
    userId,
}: {
    open: boolean;
    onClose: () => void;
    userId: string;
}) {
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [gps, setGps] = useState<Gps>({ lat: "", lon: "" });
    const [gpsSource, setGpsSource] = useState<"exif" | "manual" | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [snack, setSnack] = useState<SnackMessage | null>(null);

    const handleFile = async (uploaded: File) => {
        if (!uploaded.type.startsWith("image/")) {
            setSnack({ type: "error", msg: "Please select an image file.", persistent: true });
            return;
        }

        // warning for large files
        if (uploaded.size > 20 * 1024 * 1024) {
            setSnack({
                type: "warning",
                msg: "Large file detected. Upload may take a while.",
            });
        }

        setFile(uploaded);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(uploaded);

        // Reset GPS
        setGps({ lat: "", lon: "" });
        setGpsSource(null);

        // Extract EXIF GPS data
        try {
            const meta: any = await (exifr as any).gps(uploaded);
            if (meta?.latitude && meta?.longitude) {
                setGps({
                    lat: Number(meta.latitude.toFixed(6)),
                    lon: Number(meta.longitude.toFixed(6)),
                });
                setGpsSource("exif");
                setSnack({
                    type: "success",
                    msg: "GPS coordinates extracted from EXIF!",
                });
            } else {
                setSnack({
                    type: "info",
                    msg: "No GPS data found. Please enter manually.",
                });
            }
        } catch (error) {
            console.error("EXIF extraction error:", error);
            setSnack({
                type: "info",
                msg: "No GPS data found. Please enter manually.",
            });
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        setTitle("");
        setDescription("");
        setGps({ lat: "", lon: "" });
        setGpsSource(null);
        setSnack(null);
    };

    const isValid = () => {
        if (!file || !gps.lat || !gps.lon) return false;
        if (isNaN(Number(gps.lat)) || isNaN(Number(gps.lon))) return false;
        if (Number(gps.lat) < -90 || Number(gps.lat) > 90) return false;
        if (Number(gps.lon) < -180 || Number(gps.lon) > 180) return false;
        return true;
    };

    const handleUpload = async () => {
        if (!userId || !file) return;

        setUploading(true);
        setUploadProgress(0);
        setSnack(null);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            // Upload to Storage
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
            const path = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("photos")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            clearInterval(progressInterval);
            setUploadProgress(95);

            // Insert into DB
            const { error: insertError } = await supabase.from("photos").insert({
                user_id: userId,
                path,
                lat: Number(gps.lat),
                lon: Number(gps.lon),
                title: title.trim() || null,
                description: description.trim() || null,
                exif: null,
            });

            if (insertError) throw insertError;

            setUploadProgress(100);
            setSnack({ type: "success", msg: "Photo uploaded successfully!" });

            // Clean up and close after a short delay
            setTimeout(() => {
                handleRemoveFile();
                router.refresh(); // Refresh to display the new photo
                onClose();
            }, 500);

        } catch (e: any) {
            console.error("Upload error:", e);
            setSnack({
                type: "error",
                msg: e?.message ?? "Upload failed. Please try again.",
                persistent: true,
            });
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            Upload Photo
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <X size={20} />
                        </IconButton>
                    </Box>

                    {/* Persistent alert for errors */}
                    {snack?.persistent && (
                        <Alert severity={snack.type} sx={{ mb: 2 }} onClose={() => setSnack(null)}>
                            {snack.msg}
                        </Alert>
                    )}
                    {/* Snackbar for non-persistent messages (info, warning, temporary success) */}
                    <Snackbar
                        open={!!snack && !snack.persistent}
                        onClose={() => setSnack(null)}
                        autoHideDuration={3000}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    >
                        {snack && !snack.persistent ? (
                            <Alert severity={snack.type} variant="filled" onClose={() => setSnack(null)}>
                                {snack.msg}
                            </Alert>
                        ) : undefined}
                    </Snackbar>

                    <Stack spacing={3}>
                        {/* Upload zone */}
                        {!file ? (
                            <Box
                                sx={{
                                    border: "2px dashed",
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: "action.hover",
                                    },
                                }}
                                component="label"
                            >
                                <Camera size={40} style={{ opacity: 0.5, marginBottom: 8 }} />
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Click to select or drag & drop
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supports JPG, PNG, HEIC - Large files may take longer
                                </Typography>
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                />
                            </Box>
                        ) : (
                            <Box>
                                {/* Selected image header */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography variant="subtitle2">Selected Image</Typography>
                                    <IconButton size="small" onClick={handleRemoveFile}>
                                        <X size={18} />
                                    </IconButton>
                                </Box>

                                {/* Image preview */}
                                {preview && (
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={preview}
                                            alt="Preview"
                                            sx={{ objectFit: "contain", bgcolor: "black" }}
                                        />
                                    </Card>
                                )}

                                {/* Info chips */}
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                                    <Chip label={file.name} size="small" />
                                    <Chip label={formatFileSize(file.size)} size="small" variant="outlined" />
                                    {gpsSource === "exif" && (
                                        <Chip
                                            label="GPS from EXIF"
                                            size="small"
                                            color="success"
                                            icon={<MapPin size={14} />}
                                        />
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Form (visible only if file selected) */}
                        {file && (
                            <>
                                <TextField
                                    label="Title"
                                    placeholder="My awesome photo"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                    size="small"
                                />

                                <TextField
                                    label="Description (optional)"
                                    placeholder="Taken during my trip to..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    rows={2}
                                    fullWidth
                                    size="small"
                                />

                                {/* GPS Coordinates */}
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                                    >
                                        <MapPin size={16} />
                                        GPS Coordinates *
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Latitude"
                                            type="number"
                                            placeholder="48.8566"
                                            value={gps.lat}
                                            onChange={(e) => {
                                                setGps((prev) => ({
                                                    ...prev,
                                                    lat: e.target.value === "" ? "" : Number(e.target.value),
                                                }));
                                                if (gpsSource === "exif") setGpsSource("manual");
                                            }}
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.000001" }}
                                            error={
                                                gps.lat !== "" &&
                                                (isNaN(Number(gps.lat)) ||
                                                    Number(gps.lat) < -90 ||
                                                    Number(gps.lat) > 90)
                                            }
                                        />
                                        <TextField
                                            label="Longitude"
                                            type="number"
                                            placeholder="2.3522"
                                            value={gps.lon}
                                            onChange={(e) => {
                                                setGps((prev) => ({
                                                    ...prev,
                                                    lon: e.target.value === "" ? "" : Number(e.target.value),
                                                }));
                                                if (gpsSource === "exif") setGpsSource("manual");
                                            }}
                                            fullWidth
                                            size="small"
                                            inputProps={{ step: "0.000001" }}
                                            error={
                                                gps.lon !== "" &&
                                                (isNaN(Number(gps.lon)) ||
                                                    Number(gps.lon) < -180 ||
                                                    Number(gps.lon) > 180)
                                            }
                                        />
                                    </Stack>
                                </Box>

                                {/* Upload button */}
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleUpload}
                                    disabled={!isValid() || uploading}
                                    startIcon={<Upload size={18} />}
                                >
                                    {uploading ? "Uploading..." : "Upload Photo"}
                                </Button>

                                {/* Progress bar */}
                                {uploading && (
                                    <Box>
                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 0.5, display: "block" }}
                                        >
                                            {uploadProgress}%
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
