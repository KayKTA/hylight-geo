"use client";

import { useEffect, useState } from "react";
import {
    Container,
    Stack,
    Typography,
    TextField,
    Button,
    Alert,
    Snackbar,
    LinearProgress,
    Paper,
    Box,
    IconButton,
    Chip,
    Card,
    CardMedia,
} from "@mui/material";
import { Upload, Image as ImageIcon, MapPin, X } from "lucide-react";
import * as exifr from "exifr";
import { Gps } from "@/types";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function UploadPage() {
    const supabase = createBrowserSupabaseClient();
    const router = useRouter();

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [gps, setGps] = useState<Gps>({ lat: "", lon: "" });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [snack, setSnack] = useState<{ type: "success" | "info" | "error"; msg: string } | null>(null);

    // Check user authentication
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUserId(user.id);
            setUserEmail(user.email ?? null);
            setLoading(false);
        })();
    }, [supabase, router]);

    const handleFile = async (uploaded: File) => {
        // Vérifier le type de fichier
        if (!uploaded.type.startsWith('image/')) {
            setSnack({ type: "error", msg: "Please select an image file." });
            return;
        }

        setFile(uploaded);

        // image preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(uploaded);

        //  Reset GPS
        setGps({ lat: "", lon: "" });

        // Extract EXIF GPS
        try {
            const meta: any = await (exifr as any).gps(uploaded);
            if (meta?.latitude && meta?.longitude) {
                setGps({
                    lat: Number(meta.latitude.toFixed(6)),
                    lon: Number(meta.longitude.toFixed(6))
                });
                setSnack({ type: "success", msg: "GPS coordinates extracted from EXIF!" });
            } else {
                setSnack({ type: "info", msg: "No GPS data found. Please enter manually." });
            }
        } catch (error) {
            console.error("EXIF extraction error:", error);
            setSnack({ type: "info", msg: "No GPS data found. Please enter manually." });
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        setTitle("");
        setDescription("");
        setGps({ lat: "", lon: "" });
    };

    const isValid = () => {
        if (!file) return false;
        if (!gps.lat || !gps.lon) return false;
        if (isNaN(Number(gps.lat)) || isNaN(Number(gps.lon))) return false;
        if (Number(gps.lat) < -90 || Number(gps.lat) > 90) return false;
        if (Number(gps.lon) < -180 || Number(gps.lon) > 180) return false;
        return true;
    };

    // Upload
    const onUpload = async () => {
        if (!userId || !file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
            const path = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("photos")
                .upload(path, file, {
                    cacheControl: "3600",
                    upsert: false
                });

            if (uploadError) throw uploadError;

            clearInterval(progressInterval);
            setUploadProgress(95);

            // 2. Insert into DB
            const { error: insertError } = await supabase
                .from("photos")
                .insert({
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

            // Success redirect to /
            setSnack({ type: "success", msg: "Photo uploaded successfully!" });

            setTimeout(() => {
                router.push('/');
            }, 1000);

        } catch (e: any) {
            console.error("Upload error:", e);
            setSnack({ type: "error", msg: e?.message ?? "Upload failed. Please try again." });
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ py: 6 }}>
                <LinearProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={4}>
                {/* Header */}
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Upload a Photo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload geotagged photos to display them on the map
                    </Typography>
                </Box>

                {/* Upload Zone */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        border: '2px dashed',
                        borderColor: file ? 'success.main' : 'divider',
                        bgcolor: file ? 'success.50' : 'background.default',
                        transition: 'all 0.3s'
                    }}
                >
                    {!file ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                py: 4
                            }}
                        >
                            <ImageIcon size={48} strokeWidth={1.5} />
                            <Typography variant="h6">
                                Choose an image
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                JPG, PNG, HEIC
                            </Typography>
                            <Button
                                component="label"
                                variant="contained"
                                startIcon={<Upload size={20} />}
                            >
                                Select File
                                <input
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                />
                            </Button>
                        </Box>
                    ) : (
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Selected Image
                                </Typography>
                                <IconButton size="small" onClick={handleRemoveFile}>
                                    <X size={20} />
                                </IconButton>
                            </Box>

                            {/* Preview */}
                            {preview && (
                                <Card>
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={preview}
                                        alt="Preview"
                                        sx={{ objectFit: 'contain', bgcolor: 'black' }}
                                    />
                                </Card>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={file.name} size="small" />
                                {/* <Chip
                                    label={`${(file.size).toFixed(2)} MB`}
                                    size="small"
                                    variant="outlined"
                                /> */}
                            </Box>
                        </Stack>
                    )}
                </Paper>

                {/* Form Fields */}
                {file && (
                    <Stack spacing={3}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            helperText="Optional - Give your photo a title"
                        />

                        <TextField
                            label="Description"
                            placeholder="Taken during my trip to..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            helperText="Optional - Add context to your photo"
                        />

                        {/* GPS Coordinates */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MapPin size={18} />
                                GPS Coordinates *
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Latitude"
                                    type="number"
                                    placeholder="48.8566"
                                    value={gps.lat}
                                    onChange={(e) => setGps((g) => ({ ...g, lat: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    fullWidth
                                    helperText="-90 to 90"
                                    inputProps={{ step: "0.000001" }}
                                    error={gps.lat !== "" && (isNaN(Number(gps.lat)) || Number(gps.lat) < -90 || Number(gps.lat) > 90)}
                                />
                                <TextField
                                    label="Longitude"
                                    type="number"
                                    placeholder="2.3522"
                                    value={gps.lon}
                                    onChange={(e) => setGps((g) => ({ ...g, lon: e.target.value === "" ? "" : Number(e.target.value) }))}
                                    fullWidth
                                    helperText="-180 to 180"
                                    inputProps={{ step: "0.000001" }}
                                    error={gps.lon !== "" && (isNaN(Number(gps.lon)) || Number(gps.lon) < -180 || Number(gps.lon) > 180)}
                                />
                            </Stack>
                        </Box>

                        {/* Upload Button */}
                        <Button
                            variant="contained"
                            size="large"
                            onClick={onUpload}
                            disabled={!isValid() || uploading}
                            startIcon={<Upload size={20} />}
                            sx={{ height: 48 }}
                        >
                            {uploading ? "Uploading..." : "Upload Photo"}
                        </Button>

                        {uploading && (
                            <Box>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {uploadProgress}% uploaded
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                )}
            </Stack>

            {/* Snackbar */}
            <Snackbar
                open={!!snack}
                onClose={() => setSnack(null)}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                {snack ? <Alert severity={snack.type} variant="filled">{snack.msg}</Alert> : undefined}
            </Snackbar>
        </Container>
    );
}
