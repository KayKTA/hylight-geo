import { SupabaseClient } from "@supabase/supabase-js";
import { Photo, ApiResponse } from "@/types";

/**
 * Fetch all photos for the authenticated user
 */
export async function getUserPhotos(
    supabase: SupabaseClient
): Promise<ApiResponse<Photo[]>> {
    try {
        const { data: photos, error } = await supabase
            .from("photos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return { data: null, error: error.message };
        }

        // Generate signed URLs (bucket is private)
        const photosWithUrls = await Promise.all(
            photos.map(async (photo) => {
                const { data: signedUrl } = await supabase.storage
                    .from("photos")
                    .createSignedUrl(photo.path, 60 * 60 * 24); // 24h expiry

                return {
                    ...photo,
                    imageUrl: signedUrl?.signedUrl || "",
                };
            })
        );

        return { data: photosWithUrls, error: null };
    } catch (error: any) {
        console.error("Error fetching photos:", error);
        return { data: null, error: error.message || "Failed to fetch photos" };
    }
}

/**
 * Fetch a single photo by ID
 */
export async function getPhotoById(
    supabase: SupabaseClient,
    photoId: string
): Promise<ApiResponse<Photo>> {
    try {
        const { data: photo, error } = await supabase
            .from("photos")
            .select("*")
            .eq("id", photoId)
            .single();

        if (error) {
            return { data: null, error: error.message };
        }

        const publicUrl = supabase.storage
            .from("photos")
            .getPublicUrl(photo.path);

        return {
            data: { ...photo, imageUrl: publicUrl.data.publicUrl },
            error: null,
        };
    } catch (error: any) {
        console.error("Error fetching photo:", error);
        return { data: null, error: error.message || "Failed to fetch photo" };
    }
}

/**
 * Upload a new photo
 */
export async function uploadPhoto(
    supabase: SupabaseClient,
    params: {
        userId: string;
        file: File;
        title?: string;
        description?: string;
        lat: number;
        lon: number;
    }
): Promise<ApiResponse<Photo>> {
    const { userId, file, title, description, lat, lon } = params;

    try {
        // 1. Upload to Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const path = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
            return { data: null, error: uploadError.message };
        }

        // 2. Insert into DB
        const { data: photo, error: insertError } = await supabase
            .from("photos")
            .insert({
                user_id: userId,
                path,
                lat,
                lon,
                title: title?.trim() || null,
                description: description?.trim() || null,
                exif: null,
            })
            .select()
            .single();

        if (insertError) {
            // Rollback: delete uploaded file
            await supabase.storage.from("photos").remove([path]);
            return { data: null, error: insertError.message };
        }

        const publicUrl = supabase.storage
            .from("photos")
            .getPublicUrl(photo.path);

        return {
            data: { ...photo, imageUrl: publicUrl.data.publicUrl },
            error: null,
        };
    } catch (error: any) {
        console.error("Error uploading photo:", error);
        return { data: null, error: error.message || "Failed to upload photo" };
    }
}

/**
 * Delete a photo
 */
export async function deletePhoto(
    supabase: SupabaseClient,
    photoId: string,
    path: string
): Promise<ApiResponse<void>> {
    try {
        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from("photos")
            .remove([path]);

        if (storageError) {
            return { data: null, error: storageError.message };
        }

        // 2. Delete from DB (cascade will delete comments)
        const { error: dbError } = await supabase
            .from("photos")
            .delete()
            .eq("id", photoId);

        if (dbError) {
            return { data: null, error: dbError.message };
        }

        return { data: undefined, error: null };
    } catch (error: any) {
        console.error("Error deleting photo:", error);
        return { data: null, error: error.message || "Failed to delete photo" };
    }
}
