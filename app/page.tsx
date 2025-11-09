import Explorer from "@/components/Explorer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Photo, PhotoRow } from "@/types";
import { Alert, Container, Typography, Box } from "@mui/material";

async function loadPhotos(): Promise<Photo[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data: photos, error } = await supabase
            .from("photos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

        if (error || !photos || photos.length === 0) return [];

        const photosWithUrls = await Promise.allSettled(
            photos.map(async (photo: PhotoRow) => {
                const { data: signed } = await supabase.storage
                    .from("photos")
                    .createSignedUrl(photo.path, 60 * 60 * 24);

                if (!signed?.signedUrl) return null;

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

async function getUserId(): Promise<string | null> {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
}

export default async function HomePage() {
    const [photos, userId] = await Promise.all([
        loadPhotos(),
        getUserId()
    ]);

    return <Explorer photos={photos} userId={userId} />;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
