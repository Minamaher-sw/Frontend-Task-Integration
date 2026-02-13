
import { AlertCircle } from "lucide-react";

/**
 * Displays an error alert with a provided message.
 *
 * @param message - The error message to display in the alert.
 * @returns A styled error alert component.
 */
export function ErrorAlert({ message }: { message: string }) {
    return (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{message}</div>
        </div>
    );
}
