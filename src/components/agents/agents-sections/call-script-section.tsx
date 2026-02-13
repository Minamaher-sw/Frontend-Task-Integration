import { CallScriptSectionProps } from "@/lib/interfaces";
import { CollapsibleSection } from "../collapsible-wrapper-component";
import { Textarea } from "@/components/ui/textarea";

/**
 * Renders a collapsible section for editing a call script.
 *
 * @param callScript - The current value of the call script.
 * @param setCallScript - Function to update the call script value.
 * @returns A React component that allows users to input and edit a call script, displaying the character count.
 */
export function CallScriptSection({ callScript, setCallScript }: CallScriptSectionProps) {
  return (
    <CollapsibleSection
      title="Call Script"
      description="Define the conversation flow and responses."
    >
      <div className="space-y-2">
        <Textarea
          placeholder="Write your call script here... (optional)"
          value={callScript}
          onChange={(e) => setCallScript(e.target.value)}
          rows={6}
          maxLength={20000}
        />
        <p className="text-xs text-muted-foreground text-right">{callScript.length}/20000</p>
      </div>
    </CollapsibleSection>
  );
}
