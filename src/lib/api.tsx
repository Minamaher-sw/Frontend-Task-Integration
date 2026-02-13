/**
 * API Utility - Production-ready API client
 * Handles all backend communication with proper error handling and types.
 * * @module APIUtility
 */

import { ApiError, handleResponse } from "./error.handle";
import {
    Agent,
    Attachment,
    Language, Model,
    Prompt,
    TestCallResponse,
    UploadResponse,
    UploadUrlResponse,
    Voice
} from "./interfaces";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";


// ============================================================================
// FETCH HELPERS
// ============================================================================

/**
 * Base fetch wrapper that injects API base URL and default headers.
 * * @template T - The expected return type
 * @param {string} endpoint - The API endpoint path (starting with /)
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<T>} The parsed JSON response
 * @throws {ApiError} Handled by the handleResponse utility
 */
async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    return handleResponse<T>(response);
}

/**
 * Helper for POST requests with JSON body.
 * * @template T - The expected return type
 * @param {string} endpoint - The API endpoint path
 * @param {unknown} data - The body object to stringify
 * @returns {Promise<T>}
 */
async function postJSON<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    return fetchAPI<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/**
 * Helper for PUT requests with JSON body.
 * * @template T - The expected return type
 * @param {string} endpoint - The API endpoint path
 * @param {unknown} data - The body object to stringify
 * @returns {Promise<T>}
 */
async function putJSON<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    return fetchAPI<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// ============================================================================
// LANGUAGE API
// ============================================================================

/**
 * Retrieves a list of all supported languages from the backend.
 * * @async
 * @returns {Promise<Language[]>} Array of language objects
 * @throws {Error} Re-throws after logging if fetch fails
 */
export async function fetchLanguages(): Promise<Language[]> {
    try {
        return await fetchAPI<Language[]>("/languages");
    } catch (error) {
        console.error("[API] Failed to fetch languages:", error);
        throw error;
    }
}

// ============================================================================
// VOICE API
// ============================================================================

/**
 * Retrieves a list of all available AI voices.
 * * @async
 * @returns {Promise<Voice[]>} Array of voice objects
 */
export async function fetchVoices(): Promise<Voice[]> {
    try {
        return await fetchAPI<Voice[]>("/voices");
    } catch (error) {
        console.error("[API] Failed to fetch voices:", error);
        throw error;
    }
}

/**
 * Client-side utility to filter a voice list by a specific language code.
 * * @param {Voice[]} voices - List of voices to filter
 * @param {string} languageCode - The code to filter by (e.g., 'en-US')
 * @returns {Voice[]} Filtered array of voices
 */
export function filterVoicesByLanguage(
    voices: Voice[],
    languageCode: string
): Voice[] {
    return voices.filter((voice) => voice.language === languageCode);
}

// ============================================================================
// PROMPT API
// ============================================================================

/**
 * Retrieves a list of pre-defined system prompts.
 * * @async
 * @returns {Promise<Prompt[]>}
 */
export async function fetchPrompts(): Promise<Prompt[]> {
    try {
        return await fetchAPI<Prompt[]>("/prompts");
    } catch (error) {
        console.error("[API] Failed to fetch prompts:", error);
        throw error;
    }
}

// ============================================================================
// MODEL API
// ============================================================================

/**
 * Retrieves a list of available AI models.
 * * @async
 * @returns {Promise<Model[]>}
 */
export async function fetchModels(): Promise<Model[]> {
    try {
        return await fetchAPI<Model[]>("/models");
    } catch (error) {
        console.error("[API] Failed to fetch models:", error);
        throw error;
    }
}

// ============================================================================
// AGENT API
// ============================================================================

/**
 * Creates a new AI Agent.
 * * @async
 * @param {Omit<Agent, "id">} agentData - The agent configuration excluding the auto-generated ID
 * @returns {Promise<Agent>} The created agent object including its new ID
 */
export async function createAgent(
    agentData: Omit<Agent, "id">
): Promise<Agent> {
    try {
        return await postJSON<Agent>("/agents", agentData);
    } catch (error) {
        console.error("[API] Failed to create agent:", error);
        throw error;
    }
}

/**
 * Updates an existing AI Agent's configuration.
 * * @async
 * @param {string} id - The unique identifier of the agent
 * @param {Partial<Agent>} agentData - The fields to update
 * @returns {Promise<Agent>} The updated agent object
 */
export async function updateAgent(
    id: string,
    agentData: Partial<Agent>
): Promise<Agent> {
    try {
        return await putJSON<Agent>(`/agents/${id}`, agentData);
    } catch (error) {
        console.error("[API] Failed to update agent:", error);
        throw error;
    }
}

/**
 * Retrieves details for a specific agent by ID.
 * * @async
 * @param {string} id - The agent ID
 * @returns {Promise<Agent>}
 */
export async function fetchAgentById(id: string): Promise<Agent> {
    try {
        return await fetchAPI<Agent>(`/agents/${id}`);
    } catch (error) {
        console.error("[API] Failed to fetch agent:", error);
        throw error;
    }
}

// ============================================================================
// FILE UPLOAD API
// ============================================================================

/**
 * Requests a signed URL from the backend to securely upload a file to cloud storage.
 * * @async
 * @returns {Promise<UploadUrlResponse>} Contains the signedUrl and storage key
 */
export async function getUploadUrl(): Promise<UploadUrlResponse> {
    try {
        return await postJSON<UploadUrlResponse>("/attachments/upload-url", {});
    } catch (error) {
        console.error("[API] Failed to get upload URL:", error);
        throw error;
    }
}

/**
 * Directly uploads a file to a pre-signed URL (e.g., S3 or GCS).
 * * @async
 * @param {string} signedUrl - The secure URL provided by getUploadUrl
 * @param {File} file - The file object from a file input or blob
 * @returns {Promise<UploadResponse>}
 * @throws {ApiError} If the cloud storage provider returns a non-OK status
 */
export async function uploadFileToSignedUrl(
    signedUrl: string,
    file: File
): Promise<UploadResponse> {
    try {
        const response = await fetch(signedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            body: file,
        });

        if (!response.ok) {
            throw new ApiError(
                response.status,
                `Failed to upload file: ${response.statusText}`
            );
        }

        return response.json();
    } catch (error) {
        console.error("[API] Failed to upload file:", error);
        throw error;
    }
}

/**
 * Notifies the backend that a file upload has been completed to link it to the DB.
 * * @async
 * @param {string} key - The storage key/path of the file
 * @param {string} fileName - Original name of the file
 * @param {number} fileSize - Size in bytes
 * @param {string} mimeType - The file's MIME type
 * @returns {Promise<Attachment>} The registered attachment record
 */
export async function registerAttachment(
    key: string,
    fileName: string,
    fileSize: number,
    mimeType: string
): Promise<Attachment> {
    try {
        return await postJSON<Attachment>("/attachments", {
            key,
            fileName,
            fileSize,
            mimeType,
        });
    } catch (error) {
        console.error("[API] Failed to register attachment:", error);
        throw error;
    }
}

/**
 * Orchestrator function that performs the full upload flow:
 * 1. Gets a signed URL
 * 2. Uploads the file to storage
 * 3. Registers the attachment with the backend
 * * @async
 * @param {File} file - The file to upload
 * @returns {Promise<Attachment>} The final registered attachment record
 */
export async function uploadFile(file: File): Promise<Attachment> {
    try {
        // Step 1: Get upload URL
        const uploadUrl = await getUploadUrl();

        // Step 2: Upload file
        await uploadFileToSignedUrl(uploadUrl.signedUrl, file);

        // Step 3: Register attachment
        const attachment = await registerAttachment(
            uploadUrl.key,
            file.name,
            file.size,
            file.type || "application/octet-stream"
        );

        return attachment;
    } catch (error) {
        console.error("[API] Failed to upload file:", error);
        throw error;
    }
}

// ============================================================================
// TEST CALL API
// ============================================================================

/**
 * Triggers a test call for a specific agent.
 * * @async
 * @param {string} agentId - ID of the agent to test
 * @param {Object} testCallData - Information for the call recipient
 * @param {string} testCallData.firstName - Recipient's first name
 * @param {string} testCallData.lastName - Recipient's last name
 * @param {string} testCallData.gender - Recipient's gender
 * @param {string} testCallData.phoneNumber - Destination phone number
 * @returns {Promise<TestCallResponse>}
 */
export async function initiateTestCall(
    agentId: string,
    testCallData: {
        firstName: string;
        lastName: string;
        gender: string;
        phoneNumber: string;
    }
): Promise<TestCallResponse> {
    try {
        return await postJSON<TestCallResponse>(
            `/agents/${agentId}/test-call`,
            testCallData
        );
    } catch (error) {
        console.error("[API] Failed to initiate test call:", error);
        throw error;
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely extracts a human-readable error message from various error types.
 * * @param {unknown} error - The error object to parse
 * @returns {string} The error message or a default fallback
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred";
}