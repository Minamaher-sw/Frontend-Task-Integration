// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            errorData
        );
    }
    return response.json();
}
