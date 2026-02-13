import { ServiceDescriptionSectionProps } from "@/lib/interfaces";
import { CollapsibleSection } from "../collapsible-wrapper-component";
import { Textarea } from "@/components/ui/textarea";

/**
 * Renders a collapsible section for entering a service or product description.
 *
 * @param serviceDescription - The current value of the service or product description.
 * @param setServiceDescription - Callback to update the service or product description.
 * @returns A React component that allows users to input and track the length of a service or product description.
 */
export function ServiceDescriptionSection({
  serviceDescription,
  setServiceDescription,
}: ServiceDescriptionSectionProps) {
  return (
    <CollapsibleSection
      title="Service/Product Description"
      description="Add a knowledge base about your service or product."
    >
      <div className="space-y-2">
        <Textarea
          placeholder="Describe your service or product... (optional)"
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
