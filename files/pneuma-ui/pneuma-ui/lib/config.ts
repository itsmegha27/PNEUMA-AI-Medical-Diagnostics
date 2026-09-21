/** Single switch between the mock adapter and your Python service. */
export const USE_MOCK = true;
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MODEL_VERSION = "rf-v0.3";
