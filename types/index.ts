/** photos as stored in Postgres */
export type PhotoRow = {
    id: string;
    user_id: string | null;
    path: string;
    lat: number;
    lon: number;
    exif: any | null;                 // can refine later
    title: string | null;
    description: string | null;
    created_at: string;               // timestamptz → string in JS client
};

/** Mapped shape used by the UI (after we resolve the file URL) */
export type Photo = {
    id: string;
    title: string | null;
    lat: number;
    lon: number;
    imageUrl: string;                  // signed URL
};
