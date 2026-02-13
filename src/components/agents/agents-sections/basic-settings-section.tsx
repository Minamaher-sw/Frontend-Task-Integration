// ============================================================================
// BASIC SETTINGS SECTION - REDESIGNED LAYOUT
// ============================================================================

import { BasicSettingsSectionProps } from "@/lib/interfaces";
import { CollapsibleSection } from "../collapsible-wrapper-component";
import { filterVoicesByLanguage } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { SelectDropdown } from "../select-dropdown-wrapper-component";

/**
 * Renders the "Basic Settings" section for configuring an agent's core identity and behavior.
 * This section includes fields for agent name, call type, language, voice, model, prompt template,
 * system prompt, voice settings (latency and speed), and agent description.
 *
 * LAYOUT: Two-column design with left column containing core settings in a grid,
 * and right column reserved for additional controls or future expansion.
 *
 * @param {Object} props - The props for the BasicSettingsSection component.
 * @param {string} props.agentName - The current name of the agent.
 * @param {(name: string) => void} props.setAgentName - Callback to update the agent name.
 * @param {string} props.callType - The current call type (e.g., "inbound" or "outbound").
 * @param {(type: string) => void} props.setCallType - Callback to update the call type.
 * @param {string} props.language - The currently selected language code.
 * @param {(lang: string) => void} props.setLanguage - Callback to update the language.
 * @param {string} props.voice - The currently selected voice ID.
 * @param {(voice: string) => void} props.setVoice - Callback to update the voice.
 * @param {string} props.prompt - The current system prompt for the agent.
 * @param {(prompt: string) => void} props.setPrompt - Callback to update the system prompt.
 * @param {string} props.model - The currently selected model ID.
 * @param {(model: string) => void} props.setModel - Callback to update the model.
 * @param {number[]} props.latency - The current latency value as an array (for slider).
 * @param {(latency: number[]) => void} props.setLatency - Callback to update the latency.
 * @param {number[]} props.speed - The current speech speed value as an array (for slider).
 * @param {(speed: number[]) => void} props.setSpeed - Callback to update the speech speed.
 * @param {string} props.description - The current agent description.
 * @param {(desc: string) => void} props.setDescription - Callback to update the agent description.
 * @param {Array<{ id: string, code: string, name: string }>} props.languages - List of available languages.
 * @param {Array<{ id: string, name: string, tag: string, language: string }>} props.voices - List of available voices.
 * @param {Array<{ id: string, name: string, description: string }>} props.prompts - List of available prompt templates.
 * @param {Array<{ id: string, name: string, description: string }>} props.models - List of available models.
 * @param {boolean} props.isLoadingLanguages - Whether languages are currently loading.
 * @param {boolean} props.isLoadingVoices - Whether voices are currently loading.
 * @param {boolean} props.isLoadingPrompts - Whether prompt templates are currently loading.
 * @param {boolean} props.isLoadingModels - Whether models are currently loading.
 * @param {number} props.requiredFieldCount - The number of required fields not yet filled.
 * @param {Map<string, string>} props.validationErrors - Map of field names to validation error messages.
 *
 * @returns {JSX.Element} The rendered BasicSettingsSection component.
 */
export function BasicSettingsSection({
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
  languages,
  voices,
  prompts,
  models,
  isLoadingLanguages,
  isLoadingVoices,
  isLoadingPrompts,
  isLoadingModels,
  requiredFieldCount,
  validationErrors,
}: BasicSettingsSectionProps) {
  const filteredVoices = filterVoicesByLanguage(voices, language);
  const isLoadingData = isLoadingLanguages || isLoadingVoices || isLoadingPrompts || isLoadingModels;

  return (
    <CollapsibleSection
      title="Basic Settings"
      description="Configure your agent's core identity and behavior."
      badge={requiredFieldCount}
      defaultOpen={true}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column — Main Settings (spans 2 columns on large screens) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className={validationErrors.has("agentName") ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-start gap-2">
                {validationErrors.has("agentName") && (
                  <p className="text-xs text-red-500">{validationErrors.get("agentName")}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">{agentName.length}/100</p>
              </div>
            </div>

            {/* Agent Description */}
            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Input
                id="agent-description"
                placeholder="Describe what this agent does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                disabled={isLoadingData}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>

            {/* Call Type */}
            <div className="space-y-2">
              <SelectDropdown
                id="call-type"
                label="Call Type"
                isRequired
                value={callType}
                onValueChange={setCallType}
                isLoading={false}
                disabled={isLoadingData}
              >
                <SelectItem value="inbound">Inbound (Receive Calls)</SelectItem>
                <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
              </SelectDropdown>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <SelectDropdown
                id="language"
                label="Language"
                isRequired
                value={language}
                onValueChange={setLanguage}
                isLoading={isLoadingLanguages}
                disabled={isLoadingData}
              >
                {languages.length > 0 ? (
                  languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No languages available</div>
                )}
              </SelectDropdown>
            </div>

            {/* Voice */}
            <div className="space-y-2">
              <SelectDropdown
                id="voice"
                label="Voice"
                isRequired
                value={voice}
                onValueChange={setVoice}
                isLoading={isLoadingVoices}
                disabled={!language || isLoadingData}
                helpText={!language ? "Select a language first" : undefined}
              >
                {filteredVoices.length > 0 ? (
                  filteredVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex items-center gap-2">
                        <span>{v.name}</span>
                        <Badge variant="outline" className="text-xs ml-1">
                          {v.tag}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                ) : language ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No voices available for {language}
                  </div>
                ) : null}
              </SelectDropdown>
            </div>

            {/* Prompt Template */}
            <div className="space-y-2">
              <SelectDropdown
                id="prompt"
                label="Prompt"
                value={prompt}
                onValueChange={setPrompt}
                isLoading={isLoadingPrompts}
                disabled={isLoadingData}
                helpText="Select a template to use as a starting point (optional)"
              >
                {prompts.length > 0 ? (
                  prompts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground">{p.description}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No templates available</div>
                )}
              </SelectDropdown>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <SelectDropdown
                id="model"
                label="Model"
                isRequired
                value={model}
                onValueChange={setModel}
                isLoading={isLoadingModels}
                disabled={isLoadingData}
              >
                {models.length > 0 ? (
                  models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No models available</div>
                )}
              </SelectDropdown>
            </div>

            {/* Voice Settings - Latency */}
            <div className="space-y-2">
              <Label htmlFor="latency" className="text-sm">
                Latency: {latency[0].toFixed(1)}s
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.3s</span>
                <span>3.0s</span>
              </div>
            </div>

            {/* Voice Settings - Speed */}
            <div className="space-y-2">
              <Label htmlFor="speed" className="text-sm">
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
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50 WPM</span>
                <span>200 WPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Reserved for Future Use / Additional Controls */}
        <div className="lg:col-span-1">
          {/* This space can be used for additional settings, help text, or controls in the future */}
        </div>
      </div>
    </CollapsibleSection>
  );
}