/** photos as stored in Postgres */
export type PhotoRow = {
    id: string;
    user_id: string | null;
    path: string;
    lat: number;
    lon: number;
    exif: any | null;
    title: string | null;
    description: string | null;
    created_at: string;               // timestamptz → string in JS client
};

export interface Photo {
    id: string;
    title: string;
    description?: string | null;
    lat: number;
    lon: number;
    imageUrl: string;
    userId?: string;
    createdAt?: string;
    comments?: Comment[];
    commentCount?: number;
}
export interface Comment {
    id: string;
    photo_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export type Gps = {
    lat: number | "";
    lon: number | ""
};
