import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { ToolsSectionProps } from "@/lib/interfaces";
import { CollapsibleSection } from "../collapsible-wrapper-component";

export function ToolsSection({
  allowHangUp,
  setAllowHangUp,
  allowCallback,
  setAllowCallback,
  liveTransfer,
  setLiveTransfer,
}: ToolsSectionProps) {
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
                Allow the agent to hang up the call
              </FieldDescription>
            </FieldContent>
            <Switch id="switch-hangup" checked={allowHangUp} onCheckedChange={setAllowHangUp} />
          </Field>
        </FieldLabel>

        {/* Allow Callback */}
        <FieldLabel htmlFor="switch-callback">
          <Field orientation="horizontal" className="items-center">
            <FieldContent>
              <FieldTitle>Allow callback</FieldTitle>
              <FieldDescription>Allow the agent to make callbacks</FieldDescription>
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
              <FieldDescription>Allow transfer calls to a human agent</FieldDescription>
            </FieldContent>
            <Switch id="switch-transfer" checked={liveTransfer} onCheckedChange={setLiveTransfer} />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </CollapsibleSection>
  );
}