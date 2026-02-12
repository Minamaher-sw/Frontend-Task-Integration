"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  fetchLanguages,
  fetchVoices,
  fetchPrompts,
  fetchModels,
  createAgent,
  updateAgent,
  uploadFile,
  initiateTestCall,
  type Language,
  type Voice,
  type Prompt,
  type Model,
  type Attachment,
} from "@/lib/api";
import {
  ChevronDown,
  Upload,
  X,
  FileText,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">
                    {badge} required
                  </Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ============================================================================
// FORM SECTIONS
// ============================================================================

function BasicSettingsSection({
  agentName,
  setAgentName,
  callType,
  setCallType,
  language,
  setLanguage,
  voice,
  setVoice,
  prompt,
  setPrompt,
  model,
  setModel,
  latency,
  setLatency,
  speed,
  setSpeed,
  description,
  setDescription,
  missingCount,
  languages,
  voices,
  prompts,
  models,
  isLoadingData,
}: {
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
  missingCount: number;
  languages: Language[];
  voices: Voice[];
  prompts: Prompt[];
  models: Model[];
  isLoadingData: boolean;
}) {
  const filteredVoices = voices.filter((v) => v.language === language);

  return (
    <CollapsibleSection
      title="Basic Settings"
      description="Configure your agent's core identity and behavior."
      badge={missingCount}
      defaultOpen={true}
    >
      <div className="space-y-6">
        {/* Two Column Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Agent Name */}
            <div className="space-y-2">
              <Label htmlFor="agent-name">
                Agent Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="agent-name"
                placeholder="e.g., Sales Support Agent"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                maxLength={100}
                disabled={isLoadingData}
              />
              <p className="text-xs text-muted-foreground text-right">
                {agentName.length}/100
              </p>
            </div>

            {/* Call Type */}
            <div className="space-y-2">
              <Label htmlFor="call-type">
                Call Type <span className="text-destructive">*</span>
              </Label>
              <Select value={callType} onValueChange={setCallType} disabled={isLoadingData}>
                <SelectTrigger id="call-type">
                  <SelectValue placeholder="Select call type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TASK 1: Language Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="language">
                Language <span className="text-destructive">*</span>
              </Label>
              <Select value={language} onValueChange={setLanguage} disabled={isLoadingData}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.length > 0 ? (
                    languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No languages available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* TASK 1: Voice Dropdown with Language Filtering */}
            <div className="space-y-2">
              <Label htmlFor="voice">
                Voice <span className="text-destructive">*</span>
              </Label>
              <Select
                value={voice}
                onValueChange={setVoice}
                disabled={isLoadingData || !language}
              >
                <SelectTrigger id="voice">
                  <SelectValue
                    placeholder={language ? "Select voice" : "Select language first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredVoices.length > 0 ? (
                    filteredVoices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          {v.name}
                          <Badge variant="outline" className="text-xs">
                            {v.tag}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  ) : language ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No voices available for this language
                    </div>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            {/* TASK 1: Model Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="model">
                Model <span className="text-destructive">*</span>
              </Label>
              <Select value={model} onValueChange={setModel} disabled={isLoadingData}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.length > 0 ? (
                    models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.description}</div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No models available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* TASK 1: Prompt Template Selector */}
            <div className="space-y-2">
              <Label htmlFor="prompt-template">
                Prompt Template
              </Label>
              <Select disabled={isLoadingData}>
                <SelectTrigger id="prompt-template">
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {prompts.length > 0 ? (
                    prompts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      No templates available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                Prompt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prompt"
                placeholder="Write the system prompt for your agent..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                maxLength={20000}
                disabled={isLoadingData}
              />
              <p className="text-xs text-muted-foreground text-right">
                {prompt.length}/20000
              </p>
            </div>

            {/* Voice Settings Subsection */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Voice Settings</h4>

              {/* Latency */}
              <div className="space-y-2">
                <Label htmlFor="latency" className="text-xs">
                  Latency: {latency[0].toFixed(2)}s
                </Label>
                <Slider
                  id="latency"
                  min={0}
                  max={3}
                  step={0.1}
                  value={latency}
                  onValueChange={setLatency}
                  disabled={isLoadingData}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust response delay (0–3 seconds)
                </p>
              </div>

              {/* Speed */}
              <div className="space-y-2">
                <Label htmlFor="speed" className="text-xs">
                  Speed: {speed[0]} WPM
                </Label>
                <Slider
                  id="speed"
                  min={50}
                  max={200}
                  step={5}
                  value={speed}
                  onValueChange={setSpeed}
                  disabled={isLoadingData}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust speech speed (50–200 words per minute)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <Separator />

        {/* Agent Description Subsection (Full Width) */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Agent Description</h4>
          <Textarea
            placeholder="What does this agent do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
            disabled={isLoadingData}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/500
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}

function CallScriptSection({
  callScript,
  setCallScript,
}: {
  callScript: string;
  setCallScript: (value: string) => void;
}) {
  return (
    <CollapsibleSection
      title="Call Script"
      description="Define the conversation flow and responses."
    >
      <div className="space-y-2">
        <Textarea
          placeholder="Write your call script here..."
          value={callScript}
          onChange={(e) => setCallScript(e.target.value)}
          rows={6}
          maxLength={20000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {callScript.length}/20000
        </p>
      </div>
    </CollapsibleSection>
  );
}

function ServiceDescriptionSection({
  serviceDescription,
  setServiceDescription,
}: {
  serviceDescription: string;
  setServiceDescription: (value: string) => void;
}) {
  return (
    <CollapsibleSection
      title="Service/Product Description"
      description="Add a knowledge base about your service or product."
    >
      <div className="space-y-2">
        <Textarea
          placeholder="Describe your service or product..."
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          rows={6}
          maxLength={20000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {serviceDescription.length}/20000
        </p>
      </div>
    </CollapsibleSection>
  );
}

function ReferenceDataSection({
  uploadingFiles,
  uploadedAttachments,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,  // ADD THIS,
  onFileSelect,
  onRemoveAttachment,
}: {
  uploadingFiles: Map<string, UploadingFile>;
  uploadedAttachments: Attachment[];
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;  // FIXED TYPE
  onFileSelect: (files: FileList | null) => void;
  onRemoveAttachment: (id: string) => void;
}) {
  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  // const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <CollapsibleSection
      title="Reference Data"
      description="Enhance your agent's knowledge base with uploaded files."
    >
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            onChange={(e) => onFileSelect(e.target.files)}
          />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            Drag & drop files here, or{" "}
            <button
              type="button"
              
              className="text-amber-400 underline"
               onClick={() => fileInputRef.current?.click()}  // THIS WILL NOW WORK
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
          </p>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.size > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Uploading Files</h4>
            {Array.from(uploadingFiles.values()).map((uploadingFile) => (
              <div key={uploadingFile.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{uploadingFile.file.name}</span>
                  {uploadingFile.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                {uploadingFile.status === 'uploading' && (
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                )}
                {uploadingFile.error && (
                  <p className="text-xs text-red-500">{uploadingFile.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Successfully Uploaded Files */}
        {uploadedAttachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Uploaded Files ({uploadedAttachments.length})</h4>
            {uploadedAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{attachment.fileName}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => onRemoveAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {uploadingFiles.size === 0 && uploadedAttachments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <FileText className="h-10 w-10 mb-2" />
            <p className="text-sm">No Files Available</p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}

function ToolsSection({
  allowHangUp,
  setAllowHangUp,
  allowCallback,
  setAllowCallback,
  liveTransfer,
  setLiveTransfer,
}: {
  allowHangUp: boolean;
  setAllowHangUp: (value: boolean) => void;
  allowCallback: boolean;
  setAllowCallback: (value: boolean) => void;
  liveTransfer: boolean;
  setLiveTransfer: (value: boolean) => void;
}) {
  return (
    <CollapsibleSection
      title="Tools"
      description="Tools that allow the AI agent to perform call-handling actions and manage session control."
    >
      <FieldGroup className="w-full">
        {/* Allow Hang Up */}
        <FieldLabel htmlFor="switch-hangup">
          <Field orientation="horizontal" className="items-center">
            <FieldContent>
              <FieldTitle>Allow hang up</FieldTitle>
              <FieldDescription>
                Select if you would like to allow the agent to hang up the call
              </FieldDescription>
            </FieldContent>
            <Switch
              id="switch-hangup"
              checked={allowHangUp}
              onCheckedChange={setAllowHangUp}
            />
          </Field>
        </FieldLabel>

        {/* Allow Callback */}
        <FieldLabel htmlFor="switch-callback">
          <Field orientation="horizontal" className="items-center">
            <FieldContent>
              <FieldTitle>Allow callback</FieldTitle>
              <FieldDescription>
                Select if you would like to allow the agent to make callbacks
              </FieldDescription>
            </FieldContent>
            <Switch
              id="switch-callback"
              checked={allowCallback}
              onCheckedChange={setAllowCallback}
            />
          </Field>
        </FieldLabel>

        {/* Live Transfer */}
        <FieldLabel htmlFor="switch-transfer">
          <Field orientation="horizontal" className="items-center">
            <FieldContent>
              <FieldTitle>Live transfer</FieldTitle>
              <FieldDescription>
                Select if you want to transfer the call to a human agent
              </FieldDescription>
            </FieldContent>
            <Switch
              id="switch-transfer"
              checked={liveTransfer}
              onCheckedChange={setLiveTransfer}
            />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </CollapsibleSection>
  );
}

function TestCallCard({
  testFirstName,
  setTestFirstName,
  testLastName,
  setTestLastName,
  testGender,
  setTestGender,
  testPhone,
  setTestPhone,
  onStartTestCall,
  isTestCalling,
  testCallError,
  testCallSuccess,
  agentSaved,
}: {
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
}) {
  return (
    <div className="lg:sticky lg:top-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Call
          </CardTitle>
          <CardDescription>
            {agentSaved
              ? "Make a test call to preview your agent. Each test call will deduct credits from your account."
              : "Save your agent first to enable test calls."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!agentSaved && (
              <div className="rounded-md bg-yellow-50 p-2 text-xs text-yellow-800">
                Please save your agent configuration before testing.
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="test-first-name">First Name</Label>
                <Input
                  id="test-first-name"
                  placeholder="John"
                  value={testFirstName}
                  onChange={(e) => setTestFirstName(e.target.value)}
                  disabled={!agentSaved}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-last-name">Last Name</Label>
                <Input
                  id="test-last-name"
                  placeholder="Doe"
                  value={testLastName}
                  onChange={(e) => setTestLastName(e.target.value)}
                  disabled={!agentSaved}
                />
              </div>
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={testGender} onValueChange={setTestGender} disabled={!agentSaved}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="test-phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <PhoneInput
                defaultCountry="EG"
                value={testPhone}
                onChange={(value) => setTestPhone(value)}
                placeholder="Enter phone number"
                disabled={!agentSaved}
              />
            </div>

            {testCallError && (
              <div className="rounded-md bg-red-50 p-2 text-xs text-red-800">
                {testCallError}
              </div>
            )}

            {testCallSuccess && (
              <div className="rounded-md bg-green-50 p-2 text-xs text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Test call initiated successfully!
              </div>
            )}

            {/* Test Call Button */}
            <Button
              className="w-full"
              onClick={onStartTestCall}
              disabled={isTestCalling || !agentSaved}
            >
              {isTestCalling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Test Call...
                </>
              ) : testCallSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Test Call Initiated!
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start Test Call
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // ──────────────────────────────────────────────────────────────────────────
  // TASK 1: DATA FETCHING
  // ──────────────────────────────────────────────────────────────────────────

  const [languages, setLanguages] = useState<Language[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const [langData, voiceData, promptData, modelData] = await Promise.all([
          fetchLanguages(),
          fetchVoices(),
          fetchPrompts(),
          fetchModels(),
        ]);

        setLanguages(langData);
        setVoices(voiceData);
        setPrompts(promptData);
        setModels(modelData);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        setDataError("Failed to load form data. Please refresh the page.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDropdownData();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────

  // Basic Settings
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");

  // Voice Settings
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);

  // Agent Description
  const [description, setDescription] = useState(initialData?.description ?? "");

  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(
    initialData?.serviceDescription ?? ""
  );

  // Tools
  const [allowHangUp, setAllowHangUp] = useState(false);
  const [allowCallback, setAllowCallback] = useState(false);
  const [liveTransfer, setLiveTransfer] = useState(false);

  // TASK 2: File Upload State
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TASK 3: Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // TASK 4: Test Call State
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isTestCalling, setIsTestCalling] = useState(false);
  const [testCallError, setTestCallError] = useState<string | null>(null);
  const [testCallSuccess, setTestCallSuccess] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  const basicSettingsMissing = [
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
  ].filter((v) => !v).length;

  const agentSaved = !!agentId;

  // ──────────────────────────────────────────────────────────────────────────
  // MARK UNSAVED CHANGES (Bonus Task)
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [agentName, callType, language, voice, prompt, model, description, callScript, serviceDescription]);

  // Warn on navigate away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && agentId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, agentId]);

  // ──────────────────────────────────────────────────────────────────────────
  // TASK 2: FILE UPLOAD HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  const handleFileUpload = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);

    // Add to uploading list
    setUploadingFiles((prev) => new Map(prev).set(fileId, {
      id: fileId,
      file,
      progress: 0,
      status: 'uploading',
    }));

    try {
      const attachment = await uploadFile(file);

      if (attachment) {
        setUploadedAttachments((prev) => [...prev, attachment]);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          newMap.set(fileId, { ...newMap.get(fileId)!, status: 'success', progress: 100 });
          return newMap;
        });
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      setUploadingFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(fileId, {
          ...newMap.get(fileId)!,
          status: 'error',
          error: error instanceof Error ? error.message : "Upload failed",
        });
        return newMap;
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      if (ACCEPTED_TYPES.includes(ext)) {
        handleFileUpload(file);
      }
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      if (ACCEPTED_TYPES.includes(ext)) {
        handleFileUpload(file);
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setUploadedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TASK 3: SAVE AGENT
  // ──────────────────────────────────────────────────────────────────────────

  const handleSaveAgent = async () => {
    // Validate required fields
    const missingFields = [agentName, callType, language, voice, prompt, model].filter(
      (v) => !v
    );

    if (missingFields.length > 0) {
      setSaveError("Please fill in all required fields marked with *.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const agentData = {
        name: agentName,
        description,
        callType,
        language,
        voice,
        prompt,
        model,
        latency: latency[0],
        speed: speed[0],
        callScript,
        serviceDescription,
        attachments: uploadedAttachments.map((a) => a.id),
        tools: {
          allowHangUp,
          allowCallback,
          liveTransfer,
        },
      };

      let response;

      if (agentId) {
        // Update existing agent
        response = await updateAgent(agentId, agentData);
      } else {
        // Create new agent
        response = await createAgent(agentData);
        if (response) {
          setAgentId(response.id);
        }
      }

      if (response) {
        setHasUnsavedChanges(false);
        // Show success notification
        console.log(`✅ Agent ${agentId ? "updated" : "created"} successfully!`);
      } else {
        throw new Error("Failed to save agent");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save agent");
      console.error("Error saving agent:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TASK 4: TEST CALL
  // ──────────────────────────────────────────────────────────────────────────

  const handleStartTestCall = async () => {
    // Validate phone number
    if (!testPhone) {
      setTestCallError("Phone number is required for test call");
      return;
    }

    // Validate agent required fields
    const missingFields = [agentName, callType, language, voice, prompt, model].filter(
      (v) => !v
    );

    if (missingFields.length > 0) {
      setTestCallError("Please complete all required agent fields before testing");
      return;
    }

    setTestCallError(null);
    try {
      let currentAgentId = agentId;

      // Auto-save if not saved
      if (!currentAgentId) {
        const agentData = {
          name: agentName,
          description,
          callType,
          language,
          voice,
          prompt,
          model,
          latency: latency[0],
          speed: speed[0],
          callScript,
          serviceDescription,
          attachments: uploadedAttachments.map((a) => a.id),
          tools: {
            allowHangUp,
            allowCallback,
            liveTransfer,
          },
        };

        const savedAgent = await createAgent(agentData);
        if (!savedAgent) throw new Error("Failed to auto-save agent");

        currentAgentId = savedAgent.id;
        setAgentId(currentAgentId);
        setHasUnsavedChanges(false);
      }

      // Initiate test call
      const testCallResponse = await initiateTestCall(currentAgentId, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });

      if (testCallResponse?.success) {
        setTestCallSuccess(true);
        console.log(`✅ Test call initiated! Call ID: ${testCallResponse.callId}`);

        // Clear form after success
        setTimeout(() => {
          setTestFirstName("");
          setTestLastName("");
          setTestGender("");
          setTestPhone("");
          setTestCallSuccess(false);
        }, 2000);
      } else {
        throw new Error("Failed to initiate test call");
      }
    } catch (error) {
      setTestCallError(error instanceof Error ? error.message : "Failed to start test call");
      console.error("Error starting test call:", error);
    } finally {
      setIsTestCalling(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button
          onClick={handleSaveAgent}
          disabled={isSaving || isLoadingData}
          className={isSaving ? "animate-pulse" : ""}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            saveLabel
          )}
        </Button>
      </div>

      {/* Error Banner */}
      {dataError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {dataError}
        </div>
      )}

      {saveError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {saveError}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Form Sections */}
        <div className="lg:col-span-2 space-y-4">
          <BasicSettingsSection
            agentName={agentName}
            setAgentName={setAgentName}
            callType={callType}
            setCallType={setCallType}
            language={language}
            setLanguage={setLanguage}
            voice={voice}
            setVoice={setVoice}
            prompt={prompt}
            setPrompt={setPrompt}
            model={model}
            setModel={setModel}
            latency={latency}
            setLatency={setLatency}
            speed={speed}
            setSpeed={setSpeed}
            description={description}
            setDescription={setDescription}
            missingCount={basicSettingsMissing}
            languages={languages}
            voices={voices}
            prompts={prompts}
            models={models}
            isLoadingData={isLoadingData}
          />

          <CallScriptSection
            callScript={callScript}
            setCallScript={setCallScript}
          />

          <ServiceDescriptionSection
            serviceDescription={serviceDescription}
            setServiceDescription={setServiceDescription}
          />

          <ReferenceDataSection
            uploadingFiles={uploadingFiles}
            uploadedAttachments={uploadedAttachments}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            fileInputRef={fileInputRef}  // ADD THIS
            onFileSelect={handleFileSelect}
            onRemoveAttachment={handleRemoveAttachment}
          />

          <ToolsSection
            allowHangUp={allowHangUp}
            setAllowHangUp={setAllowHangUp}
            allowCallback={allowCallback}
            setAllowCallback={setAllowCallback}
            liveTransfer={liveTransfer}
            setLiveTransfer={setLiveTransfer}
          />
        </div>

        {/* Right Column — Sticky Test Call Card */}
        <div className="lg:col-span-1">
          <TestCallCard
            testFirstName={testFirstName}
            setTestFirstName={setTestFirstName}
            testLastName={testLastName}
            setTestLastName={setTestLastName}
            testGender={testGender}
            setTestGender={setTestGender}
            testPhone={testPhone}
            setTestPhone={setTestPhone}
            onStartTestCall={handleStartTestCall}
            isTestCalling={isTestCalling}
            testCallError={testCallError}
            testCallSuccess={testCallSuccess}
            agentSaved={agentSaved}
          />
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAgent}
            disabled={isSaving || isLoadingData}
            className={isSaving ? "animate-pulse" : ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              saveLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
