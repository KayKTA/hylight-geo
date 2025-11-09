/**
 * Map configuration constants
 */
export const MAP_CONFIG = {
    DEFAULT_CENTER: [46.603354, 1.888334] as [number, number],
    DEFAULT_ZOOM: 6,
    MIN_ZOOM: 2,
    MAX_ZOOM: 18,
    TILE_URL: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    TILE_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;

/**
 * Upload configuration constants
 */
export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/heic", "image/jpg"],
    WARNING_SIZE: 20 * 1024 * 1024,
} as const;

/**
 * Storage configuration constants
 */
export const STORAGE_CONFIG = {
    BUCKET_NAME: "photos",
    SIGNED_URL_EXPIRY: 60 * 60 * 24, // 24h
} as const;
