/**
 * API Utility Functions
 * Centralized API calls to the backend server
 * Implements all endpoints from the task requirements
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ============================================================================
// TYPES
// ============================================================================

export interface Language {
    id: string;
    name: string;
    code: string;
}

export interface Voice {
    id: string;
    name: string;
    tag: string;
    language: string;
}

export interface Prompt {
    id: string;
    name: string;
    description: string;
}

export interface Model {
    id: string;
    name: string;
    description: string;
}

export interface Agent {
    id: string;
    name: string;
    description?: string;
    callType: string;
    language: string;
    voice: string;
    prompt: string;
    model: string;
    latency: number;
    speed: number;
    callScript?: string;
    serviceDescription?: string;
    attachments?: string[];
    tools?: {
        allowHangUp: boolean;
        allowCallback: boolean;
        liveTransfer: boolean;
    };
}

export interface Attachment {
    id: string;
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

export interface UploadUrlResponse {
    key: string;
    signedUrl: string;
    expiresIn: number;
}

export interface UploadResponse {
    success: boolean;
    key: string;
    message: string;
}

export interface TestCallResponse {
    success: boolean;
    callId: string;
    agentId: string;
    status: string;
}

// ============================================================================
// LANGUAGE API - TASK 1
// ============================================================================

/**
 * Fetch all available languages for the dropdown
 * GET /api/languages
 */
export async function fetchLanguages(): Promise<Language[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/languages`);
        if (!response.ok) {
            throw new Error(`Failed to fetch languages: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching languages:", error);
        return [];
    }
}

// ============================================================================
// VOICE API - TASK 1
// ============================================================================

/**
 * Fetch all available voices for the dropdown
 * GET /api/voices
 */
export async function fetchVoices(): Promise<Voice[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/voices`);
        if (!response.ok) {
            throw new Error(`Failed to fetch voices: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching voices:", error);
        return [];
    }
}

/**
 * Filter voices by language code
 */
export function filterVoicesByLanguage(voices: Voice[], languageCode: string): Voice[] {
    return voices.filter((voice) => voice.language === languageCode);
}

// ============================================================================
// PROMPT API - TASK 1
// ============================================================================

/**
 * Fetch all available prompt templates for the dropdown
 * GET /api/prompts
 */
export async function fetchPrompts(): Promise<Prompt[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/prompts`);
        if (!response.ok) {
            throw new Error(`Failed to fetch prompts: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching prompts:", error);
        return [];
    }
}

// ============================================================================
// MODEL API - TASK 1
// ============================================================================

/**
 * Fetch all available AI models for the dropdown
 * GET /api/models
 */
export async function fetchModels(): Promise<Model[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching models:", error);
        return [];
    }
}

// ============================================================================
// AGENT CRUD API - TASK 3
// ============================================================================

/**
 * Create a new agent
 * POST /api/agents
 */
export async function createAgent(agentData: Omit<Agent, "id">): Promise<Agent | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/agents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(agentData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create agent: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating agent:", error);
        return null;
    }
}

/**
 * Update an existing agent
 * PUT /api/agents/:id
 */
export async function updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(agentData),
        });

        if (!response.ok) {
            throw new Error(`Failed to update agent: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating agent:", error);
        return null;
    }
}

/**
 * Fetch a single agent by ID
 * GET /api/agents/:id
 */
export async function fetchAgentById(id: string): Promise<Agent | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch agent: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching agent:", error);
        return null;
    }
}

// ============================================================================
// FILE UPLOAD API - TASK 2 (3-Step Process)
// ============================================================================

/**
 * STEP 1: Get a signed upload URL
 * POST /api/attachments/upload-url
 */
export async function getUploadUrl(): Promise<UploadUrlResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/attachments/upload-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get upload URL: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting upload URL:", error);
        return null;
    }
}

/**
 * STEP 2: Upload file to signed URL
 * PUT {signedUrl}
 */
export async function uploadFileToSignedUrl(
    signedUrl: string,
    file: File
): Promise<UploadResponse | null> {
    try {
        const response = await fetch(signedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": "application/octet-stream",
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error uploading file:", error);
        return null;
    }
}

/**
 * STEP 3: Register the attachment
 * POST /api/attachments
 */
export async function registerAttachment(
    key: string,
    fileName: string,
    fileSize: number,
    mimeType: string
): Promise<Attachment | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/attachments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key,
                fileName,
                fileSize,
                mimeType,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to register attachment: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error registering attachment:", error);
        return null;
    }
}

/**
 * Complete 3-step file upload process
 */
export async function uploadFile(file: File): Promise<Attachment | null> {
    try {
        // Step 1: Get signed URL
        const uploadUrl = await getUploadUrl();
        if (!uploadUrl) throw new Error("Failed to get upload URL");

        // Step 2: Upload file
        const uploadResult = await uploadFileToSignedUrl(uploadUrl.signedUrl, file);
        if (!uploadResult) throw new Error("Failed to upload file");

        // Step 3: Register attachment
        const attachment = await registerAttachment(
            uploadUrl.key,
            file.name,
            file.size,
            file.type
        );

        return attachment;
    } catch (error) {
        console.error("Error in upload process:", error);
        return null;
    }
}

// ============================================================================
// TEST CALL API - TASK 4
// ============================================================================

/**
 * Initiate a test call for an agent
 * POST /api/agents/:id/test-call
 */
export async function initiateTestCall(
    agentId: string,
    testCallData: {
        firstName: string;
        lastName: string;
        gender: string;
        phoneNumber: string;
    }
): Promise<TestCallResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/agents/${agentId}/test-call`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(testCallData),
        });

        if (!response.ok) {
            throw new Error(`Failed to initiate test call: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error initiating test call:", error);
        return null;
    }
}