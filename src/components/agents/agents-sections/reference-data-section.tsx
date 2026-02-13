import { ReferenceDataSectionProps } from "@/lib/interfaces";
import { CollapsibleSection } from "../collapsible-wrapper-component";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils";

/**
 * Renders the "Reference Data" section for uploading and managing reference files.
 *
 * This component provides a drag-and-drop file upload area, displays the progress of files being uploaded,
 * and lists the files that have already been uploaded. Users can also remove uploaded files.
 *
 * @component
 * @param {Object} props - The props for the ReferenceDataSection component.
 * @param {Map<string, { id: string; file: File; status: "uploading" | "success" | "error"; progress: number; error?: string }>} props.uploadingFiles
 *   A map of files currently being uploaded, keyed by file ID. Each entry contains file metadata, upload status, progress, and optional error message.
 * @param {Array<{ id: string; fileName: string; fileSize: number }>} props.uploadedAttachments
 *   An array of uploaded file attachments, each with an ID, file name, and file size.
 * @param {boolean} props.isDragging
 *   Indicates whether a file is currently being dragged over the drop zone.
 * @param {(event: React.DragEvent<HTMLDivElement>) => void} props.onDragOver
 *   Handler for the drag over event on the drop zone.
 * @param {(event: React.DragEvent<HTMLDivElement>) => void} props.onDragLeave
 *   Handler for the drag leave event on the drop zone.
 * @param {(event: React.DragEvent<HTMLDivElement>) => void} props.onDrop
 *   Handler for the drop event on the drop zone.
 * @param {React.RefObject<HTMLInputElement>} props.fileInputRef
 *   Ref to the hidden file input element, used to trigger file selection dialog.
 * @param {(files: FileList | null) => void} props.onFileSelect
 *   Handler called when files are selected via the file input.
 * @param {(attachmentId: string) => void} props.onRemoveAttachment
 *   Handler called when an uploaded attachment is removed.
 *
 * @returns {JSX.Element} The rendered ReferenceDataSection component.
 *
 * @example
 * <ReferenceDataSection
 *   uploadingFiles={uploadingFiles}
 *   uploadedAttachments={uploadedAttachments}
 *   isDragging={isDragging}
 *   onDragOver={handleDragOver}
 *   onDragLeave={handleDragLeave}
 *   onDrop={handleDrop}
 *   fileInputRef={fileInputRef}
 *   onFileSelect={handleFileSelect}
 *   onRemoveAttachment={handleRemoveAttachment}
 * />
 */
export function ReferenceDataSection({
  uploadingFiles,
  uploadedAttachments,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
  onFileSelect,
  onRemoveAttachment,
}: ReferenceDataSectionProps) {
  const ACCEPTED_TYPES = [".pdf", ".doc", ".docx", ".txt", ".csv", ".xlsx", ".xls"];

  return (
    <CollapsibleSection
      title="Reference Data"
      description="Enhance your agent's knowledge base with uploaded files."
    >
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
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
              className="text-primary underline hover:no-underline"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Accepted: {ACCEPTED_TYPES.join(", ")}
          </p>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.size > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Uploading</h4>
            {Array.from(uploadingFiles.values()).map((uploadingFile) => (
              <div key={uploadingFile.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate flex-1">{uploadingFile.file.name}</span>
                  {uploadingFile.status === "uploading" && <LoadingSpinner size="sm" />}
                  {uploadingFile.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {uploadingFile.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                {uploadingFile.status === "uploading" && (
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-primary transition-all duration-300 progress-bar`}
                      data-progress={uploadingFile.progress}
                    />
                  </div>
                )}
                {uploadingFile.error && (
                  <p className="text-xs text-red-600">{uploadingFile.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedAttachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              Uploaded Files ({uploadedAttachments.length})
            </h4>
            {uploadedAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
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
                  className="h-7 w-7 shrink-0 hover:bg-red-100 hover:text-red-600"
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
            <FileText className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
