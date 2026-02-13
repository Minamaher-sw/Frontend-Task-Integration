import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectDropdownProps } from "@/lib/interfaces";
import { Label } from "../ui/label";
import { LoadingSpinner } from "../loading-spinner";

export function SelectDropdown({
  id,
  label,
  isRequired,
  value,
  onValueChange,
  isLoading,
  disabled,
  children,
  helpText,
}: SelectDropdownProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading || disabled}>
        <SelectTrigger id={id} className="relative">
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
}
