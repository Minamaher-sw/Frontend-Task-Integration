// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Language {
    id: string;
    name: string;
    code: string;
}

export interface Voice {
    id: string;
    name: string;
    tag: "Premium" | "Standard";
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

/**
 * Represents an agent with properties for identification, configuration, and capabilities.
 *
 * @property {string} id - Unique identifier for the agent.
 * @property {string} name - Name of the agent.
 * @property {string} [description] - Optional description of the agent.
 * @property {"inbound" | "outbound"} callType - Type of call handled by the agent.
 * @property {string} language - Language used by the agent.
 * @property {string} voice - Voice profile of the agent.
 * @property {string} prompt - Prompt text for the agent.
 * @property {string} model - Model used by the agent.
 * @property {number} latency - Latency setting for the agent.
 * @property {number} speed - Speed setting for the agent.
 * @property {string} [callScript] - Optional call script for the agent.
 * @property {string} [serviceDescription] - Optional service description.
 * @property {string[]} [attachments] - Optional list of attachment file paths.
 * @property {object} [tools] - Optional tools and capabilities.
 * @property {boolean} [tools.allowHangUp] - Whether the agent can hang up calls.
 * @property {boolean} [tools.allowCallback] - Whether the agent can allow callbacks.
 * @property {boolean} [tools.liveTransfer] - Whether the agent supports live transfer.
 */
export interface Agent {
    id: string;
    name: string;
    description?: string;
    callType: "inbound" | "outbound";
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

export interface TestCallResponse {
    success: boolean;
    callId: string;
    agentId: string;
    status: string;
}

// ============================================================================
// Agent Form Related Interfaces
// ============================================================================

export interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: "uploading" | "success" | "error";
    error?: string;
}

export interface FormValidationError {
    field: string;
    message: string;
}

export interface AgentFormInitialData {
    agentName?: string;
    description?: string;
    callType?: "inbound" | "outbound";
    language?: string;
    voice?: string;
    prompt?: string;
    model?: string;
    latency?: number;
    speed?: number;
    callScript?: string;
    serviceDescription?: string;
}

export interface AgentFormProps {
    mode: "create" | "edit";
    initialData?: AgentFormInitialData;
}

export interface ReferenceDataSectionProps {
    uploadingFiles: Map<string, UploadingFile>;
    uploadedAttachments: Attachment[];
    isDragging: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (files: FileList | null) => void;
    onRemoveAttachment: (id: string) => void;
}

export interface SelectDropdownProps {
    id: string;
    label: string;
    isRequired?: boolean;
    value: string;
    onValueChange: (value: string) => void;
    isLoading: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    helpText?: string;
}

export interface BasicSettingsSectionProps {
    // Form values
    agentName: string;
    setAgentName: (value: string) => void;
    callType: string;
    setCallType: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    voice: string;
    setVoice: (value: string) => void;
    prompt: string;
    setPrompt: (value: string) => void;
    model: string;
    setModel: (value: string) => void;
    latency: number[];
    setLatency: (value: number[]) => void;
    speed: number[];
    setSpeed: (value: number[]) => void;
    description: string;
    setDescription: (value: string) => void;
    // Data and loading states
    languages: Language[];
    voices: Voice[];
    prompts: Prompt[];
    models: Model[];
    isLoadingLanguages: boolean;
    isLoadingVoices: boolean;
    isLoadingPrompts: boolean;
    isLoadingModels: boolean;
    // Validation
    requiredFieldCount: number;
    validationErrors: Map<string, string>;
}

export interface ToolsSectionProps {
  allowHangUp: boolean;
  setAllowHangUp: (value: boolean) => void;
  allowCallback: boolean;
  setAllowCallback: (value: boolean) => void;
  liveTransfer: boolean;
  setLiveTransfer: (value: boolean) => void;
}

export interface CallScriptSectionProps {
  callScript: string;
  setCallScript: (value: string) => void;
}

export interface ServiceDescriptionSectionProps {
  serviceDescription: string;
  setServiceDescription: (value: string) => void;
}

export interface TestCallCardProps {
  testFirstName: string;
  setTestFirstName: (value: string) => void;
  testLastName: string;
  setTestLastName: (value: string) => void;
  testGender: string;
  setTestGender: (value: string) => void;
  testPhone: string;
  setTestPhone: (value: string) => void;
  onStartTestCall: () => Promise<void>;
  isTestCalling: boolean;
  testCallError: string | null;
  testCallSuccess: boolean;
  agentSaved: boolean;
  isSaving: boolean;
}