import { Loader2 } from "lucide-react";

/**
 * Renders a loading spinner icon with a spinning animation.
 *
 * @param size - The size of the spinner. Can be "sm" (small) or "md" (medium). Defaults to "sm".
 * @returns A JSX element representing the loading spinner.
 */
export function LoadingSpinner({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return <Loader2 className={`${sizeClass} animate-spin`} />;
}