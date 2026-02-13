import { CheckCircle2 } from "lucide-react";

/**
 * Renders a success alert component with a green background and icon.
 *
 * @param message - The message to display inside the alert.
 * @returns A styled alert box containing the provided message.
 */
export function SuccessAlert({ message }: { message: string }) {
    return (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{message}</div>
        </div>
    );
}