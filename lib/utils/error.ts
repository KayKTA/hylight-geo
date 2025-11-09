/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "An unexpected error occurred";
}

/**
 * Log error with context
 */
export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);

    // In production, send to error tracking service (Sentry, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //     Sentry.captureException(error);
    // }
}
