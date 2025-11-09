import Explorer from "@/components/Explorer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserPhotos } from "@/lib/api/photos";
import { getCommentCount } from "@/lib/api/comments";
import { Photo } from "@/types";

/**
 * Load all photos for the authenticated user with comment counts
 */
async function loadPhotos(): Promise<Photo[]> {
    try {
        const supabase = await createServerSupabaseClient();

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Fetch photos using API layer
        const result = await getUserPhotos(supabase);

        if (result.error || !result.data) {
            console.error("Error loading photos:", result.error);
            return [];
        }

        // Add comment counts to each photo
        const photosWithCounts = await Promise.all(
            result.data.map(async (photo) => {
                const countResult = await getCommentCount(supabase, photo.id);
                return {
                    ...photo,
                    commentCount: countResult.data || 0,
                };
            })
        );

        return photosWithCounts;
    } catch (error) {
        console.error("Unexpected error loading photos:", error);
        return [];
    }
}

/**
 * Home page - displays map with user's photos
 */
export default async function HomePage() {
    const photos = await loadPhotos();

    return <Explorer photos={photos} />;
}

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
