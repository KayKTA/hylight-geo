export interface User {
    id: string;
    email: string;
}

export interface Photo {
    id: string;
    user_id: string;
    path: string;
    title: string | null;
    description: string | null;
    lat: number;
    lon: number;
    exif: any | null;
    created_at: string;
    imageUrl?: string;
    commentCount?: number;
}

export interface Comment {
    id: string;
    photo_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export interface Gps {
    lat: number | "";
    lon: number | "";
}

// API Response types
export type ApiResponse<T> =
    | { data: T; error: null }
    | { data: null; error: string };

// Hook return types
export interface UseCommentsReturn {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    addComment: (content: string) => Promise<void>;
    deleteComment: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}
