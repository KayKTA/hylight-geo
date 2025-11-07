import Explorer from "@/components/Explorer";
import { createServerClient } from "@/lib/supabase";
import type { Photo, PhotoRow } from "@/types";

async function loadPhotos(): Promise<Photo[]> {

    const admin = createServerClient();

    const { data: photos, error } = await admin
        .from("photos")
        .select("id, title, lat, lon, path")
        .order("created_at", { ascending: false })
        .limit(500);

    if (error || !photos) return [];

    // Generate signed URLs for each photo
    const output: Photo[] = [];
    for (const photo of photos as PhotoRow[]) {
        const { data: signed, error: signErr } = await admin
        .storage
        .from("photos")
        .createSignedUrl(photo.path, 60 * 30); // 30 min

        if (signErr || !signed?.signedUrl) continue;

        output.push({
            id: photo.id,
            title: photo.title,
            lat: photo.lat,
            lon: photo.lon,
            imageUrl: signed.signedUrl,
        });
    }
    return output;
}

export default async function HomePage() {
    const photos = await loadPhotos();
    return <Explorer photos={photos} />;
}
