import Explorer from "@/components/Explorer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Photo, PhotoRow } from "@/types";
import { Alert, Container, Typography, Box } from "@mui/material";

async function loadPhotos(): Promise<Photo[]> {
    try {
        const supabase = await createServerSupabaseClient();

        // chek authenticated user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn("User not authenticated - returning empty photos array");
            return [];
        }

        const { data: photos, error } = await supabase
            .from("photos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

        if (error) {
            console.error("Error fetching photos:", error);
            return [];
        }

        if (!photos || photos.length === 0) {
            return [];
        }

        // Generate signed URLs for each photo
        const photosWithUrls = await Promise.allSettled(
            photos.map(async (photo: PhotoRow) => {
                const { data: signed } = await supabase.storage
                    .from("photos")
                    .createSignedUrl(photo.path, 60 * 60 * 24); // valid for 24 hours

                if (!signed?.signedUrl) {
                    console.warn(`Failed to generate signed URL for photo ${photo.id}`);
                    return null;
                }

                return {
                    id: photo.id,
                    title: photo.title || "Untitled",
                    description: photo.description,
                    lat: photo.lat,
                    lon: photo.lon,
                    imageUrl: signed.signedUrl,
                    userId: photo.user_id,
                    createdAt: photo.created_at,
                } as Photo;
            })
        );

        // Filter out any failed URL generations
        return photosWithUrls
            .filter((result): result is PromiseFulfilledResult<NonNullable<Photo>> =>
                result.status === "fulfilled" && result.value !== null
            )
            .map(result => result.value);

    } catch (error) {
        console.error("Unexpected error loading photos:", error);
        return [];
    }
}

export default async function HomePage() {
    const photos = await loadPhotos();

    // if no photos, show welcome message
    if (photos.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box textAlign="center">
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Welcome to GeoPhotos
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        No photos uploaded yet. Start by uploading your first geotagged photo!
                    </Typography>
                    <Alert severity="info" sx={{ mt: 3 }}>
                        Go to <strong>/upload</strong> to add your first photo to the map.
                    </Alert>
                </Box>
            </Container>
        );
    }

    return <Explorer photos={photos} />;
}

// Deactivate static optimization
export const dynamic = 'force-dynamic';
export const revalidate = 0;
