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
  getErrorMessage,
} from "@/lib/api";
import { getRequiredFieldErrors } from "@/lib/utils";

import { Agent, AgentFormProps, Attachment, Language, Model, Prompt, UploadingFile, Voice } from "@/lib/interfaces";
import { LoadingSpinner } from "../loading-spinner";
import { ErrorAlert } from "../alert/error-alert";
import { SuccessAlert } from "../alert/sucess-alert";
import { BasicSettingsSection } from "./agents-sections/basic-settings-section";
import { ReferenceDataSection } from "./agents-sections/reference-data-section";
import { ToolsSection } from "./agents-sections/tools-section";
import { Button } from "../ui/button";
import { CallScriptSection } from "./agents-sections/call-script-section";
import { ServiceDescriptionSection } from "./agents-sections/service-description-section";
import { TestCallCard } from "./test-call-card";

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // ──────────────────────────────────────────────────────────────────────────
  // STATE - DATA LOADING
  // ──────────────────────────────────────────────────────────────────────────

  const [languages, setLanguages] = useState<Language[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [dataError, setDataError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // STATE - FORM DATA
  // ──────────────────────────────────────────────────────────────────────────

  // Basic Settings
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState<"inbound" | "outbound" | "">(
    initialData?.callType ?? ""
  );
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState(initialData?.description ?? "");

  // Call Script & Service Description
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");
  const [serviceDescription, setServiceDescription] = useState(
    initialData?.serviceDescription ?? ""
  );

  // Tools
  const [allowHangUp, setAllowHangUp] = useState(false);
  const [allowCallback, setAllowCallback] = useState(false);
  const [liveTransfer, setLiveTransfer] = useState(false);

  // File Upload
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, UploadingFile>>(new Map());
  const [uploadedAttachments, setUploadedAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // STATE - SAVE & VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map());

  // ──────────────────────────────────────────────────────────────────────────
  // STATE - TEST CALL
  // ──────────────────────────────────────────────────────────────────────────

  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [isTestCalling, setIsTestCalling] = useState(false);
  const [testCallError, setTestCallError] = useState<string | null>(null);
  const [testCallSuccess, setTestCallSuccess] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // EFFECTS - LOAD DATA
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingLanguages(true);
        const langs = await fetchLanguages();
        setLanguages(langs);
      } catch (error) {
        const message = getErrorMessage(error);
        console.error("Failed to load languages:", message);
        setDataError("Failed to load languages. Please refresh the page.");
      } finally {
        setIsLoadingLanguages(false);
      }

      try {
        setIsLoadingVoices(true);
        const voices = await fetchVoices();
        setVoices(voices);
      } catch (error) {
        const message = getErrorMessage(error);
        console.error("Failed to load voices:", message);
        setDataError("Failed to load voices. Please refresh the page.");
      } finally {
        setIsLoadingVoices(false);
      }

      try {
        setIsLoadingPrompts(true);
        const prompts = await fetchPrompts();
        setPrompts(prompts);
      } catch (error) {
        const message = getErrorMessage(error);
        console.error("Failed to load prompts:", message);
        setDataError("Failed to load prompts. Please refresh the page.");
      } finally {
        setIsLoadingPrompts(false);
      }

      try {
        setIsLoadingModels(true);
        const models = await fetchModels();
        setModels(models);
      } catch (error) {
        const message = getErrorMessage(error);
        console.error("Failed to load models:", message);
        setDataError("Failed to load models. Please refresh the page.");
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadData();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // EFFECTS - UNSAVED CHANGES DETECTION
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [agentName, callType, language, voice, prompt, model, description, callScript, serviceDescription]);

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
  // HANDLERS - FILE UPLOAD
  // ──────────────────────────────────────────────────────────────────────────

  const ACCEPTED_TYPES = [".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx", ".xls"];

  const handleFileUpload = useCallback(
    async (file: File) => {
      const fileId = Math.random().toString(36).substring(2, 9);

      setUploadingFiles((prev) =>
        new Map(prev).set(fileId, {
          id: fileId,
          file,
          progress: 0,
          status: "uploading",
        })
      );

      try {
        const attachment = await uploadFile(file);
        setUploadedAttachments((prev) => [...prev, attachment]);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(fileId);
          if (existing) {
            newMap.set(fileId, { ...existing, status: "success", progress: 100 });
          }
          return newMap;
        });
      } catch (error) {
        const message = getErrorMessage(error);
        setUploadingFiles((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(fileId);
          if (existing) {
            newMap.set(fileId, { ...existing, status: "error", error: message });
          }
          return newMap;
        });
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (ACCEPTED_TYPES.includes(ext)) {
          handleFileUpload(file);
        }
      }
    },
    [handleFileUpload]
  );

  const handleRemoveAttachment = useCallback((id: string) => {
    setUploadedAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS - SAVE
  // ──────────────────────────────────────────────────────────────────────────

  const handleSaveAgent = useCallback(async () => {
    // Validate
    const errors = getRequiredFieldErrors(agentName, callType, language, voice, prompt, model);
    if (errors.length > 0) {
      const errorMap = new Map(errors.map((e) => [e.field, e.message]));
      setValidationErrors(errorMap);
      setSaveError("Please fill in all required fields.");
      return;
    }

    setValidationErrors(new Map());
    setSaveError(null);
    setIsSaving(true);

    try {
      const agentData: Omit<Agent, "id"> = {
        name: agentName,
        description,
        callType: callType as "inbound" | "outbound",
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

      let response: Agent;
      if (agentId) {
        response = await updateAgent(agentId, agentData);
      } else {
        response = await createAgent(agentData);
        setAgentId(response.id);
      }

      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      const message = getErrorMessage(error);
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [agentName, callType, language, voice, prompt, model, description, callScript, serviceDescription, latency, speed, uploadedAttachments, allowHangUp, allowCallback, liveTransfer, agentId]);

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS - TEST CALL
  // ──────────────────────────────────────────────────────────────────────────

  const handleStartTestCall = useCallback(async () => {
    if (!testPhone.trim()) {
      setTestCallError("Phone number is required.");
      return;
    }

    const errors = getRequiredFieldErrors(agentName, callType, language, voice, prompt, model);
    if (errors.length > 0) {
      setTestCallError("Please complete all required fields before testing.");
      return;
    }

    setTestCallError(null);
    setIsTestCalling(true);

    try {
      let currentAgentId = agentId;

      // Auto-save if needed
      if (!currentAgentId) {
        const agentData: Omit<Agent, "id"> = {
          name: agentName,
          description,
          callType: callType as "inbound" | "outbound",
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
        currentAgentId = savedAgent.id;
        setAgentId(currentAgentId);
        setHasUnsavedChanges(false);
      }

      const response = await initiateTestCall(currentAgentId, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });

      if (response.success) {
        setTestCallSuccess(true);
        setTimeout(() => {
          setTestFirstName("");
          setTestLastName("");
          setTestGender("");
          setTestPhone("");
          setTestCallSuccess(false);
        }, 2000);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setTestCallError(message);
    } finally {
      setIsTestCalling(false);
    }
  }, [agentName, callType, language, voice, prompt, model, description, callScript, serviceDescription, latency, speed, uploadedAttachments, allowHangUp, allowCallback, liveTransfer, testFirstName, testLastName, testGender, testPhone, agentId]);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  const requiredFieldCount = getRequiredFieldErrors(
    agentName,
    callType,
    language,
    voice,
    prompt,
    model
  ).length;

  const agentSaved = !!agentId;
  const isLoadingAnyData = isLoadingLanguages || isLoadingVoices || isLoadingPrompts || isLoadingModels;

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
          disabled={isSaving || isLoadingAnyData}
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            saveLabel
          )}
        </Button>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {dataError && <ErrorAlert message={dataError} />}
        {saveError && <ErrorAlert message={saveError} />}
        {saveSuccess && <SuccessAlert message={`Agent ${agentId ? "updated" : "created"} successfully!`} />}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <BasicSettingsSection
            agentName={agentName}
            setAgentName={setAgentName}
            callType={callType}
            setCallType={setCallType as any}
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
            languages={languages}
            voices={voices}
            prompts={prompts}
            models={models}
            isLoadingLanguages={isLoadingLanguages}
            isLoadingVoices={isLoadingVoices}
            isLoadingPrompts={isLoadingPrompts}
            isLoadingModels={isLoadingModels}
            requiredFieldCount={requiredFieldCount}
            validationErrors={validationErrors}
          />

          <CallScriptSection callScript={callScript} setCallScript={setCallScript} />

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
            fileInputRef={fileInputRef}
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

        {/* Right Column - Test Call */}
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
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveAgent} disabled={isSaving || isLoadingAnyData}>
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Saving...</span>
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