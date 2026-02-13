import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FormValidationError } from "./interfaces";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getRequiredFieldErrors(
  agentName: string,
  callType: string,
  language: string,
  voice: string,
  prompt: string,
  model: string
): FormValidationError[] {
  const errors: FormValidationError[] = [];

  if (!agentName.trim()) errors.push({ field: "agentName", message: "Agent name is required" });
  if (!callType) errors.push({ field: "callType", message: "Call type is required" });
  if (!language) errors.push({ field: "language", message: "Language is required" });
  if (!voice) errors.push({ field: "voice", message: "Voice is required" });
  if (!prompt.trim()) errors.push({ field: "prompt", message: "Prompt is required" });
  if (!model) errors.push({ field: "model", message: "Model is required" });

  return errors;
}