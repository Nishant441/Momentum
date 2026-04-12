import { useState, useRef } from 'react'
import { FileText, Camera, X } from 'lucide-react'
import { validateFile, extractPdfText, extractImageText } from '../lib/extractText'

type ExtractState = 'idle' | 'uploading' | 'extracted' | 'error'

interface FileUploadProps {
  apiKey: string
  onExtracted: (text: string) => void
  onClear: () => void
}

export function FileUpload({ apiKey, onExtracted, onClear }: FileUploadProps) {
  const [extractState, setExtractState] = useState<ExtractState>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const pdfInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    const validError = validateFile(file)
    if (validError) {
      setError(validError)
      setExtractState('error')
      return
    }

    setExtractState('uploading')
    setFileName(file.name)
    setError(null)

    try {
      let text: string
      if (file.type === 'application/pdf') {
        text = await extractPdfText(file)
      } else {
        if (!apiKey) throw new Error('Add your API key first to extract text from images.')
        text = await extractImageText(file, apiKey)
      }

      if (!text.trim()) {
        throw new Error("Couldn\u2019t read this file \u2014 paste your assignment below.")
      }

      onExtracted(text)
      setExtractState('extracted')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn\u2019t read this file \u2014 paste your assignment below.",
      )
      setExtractState('error')
    }
  }

  const handleClear = () => {
    setExtractState('idle')
    setFileName(null)
    setError(null)
    onClear()
    // Reset file inputs so the same file can be re-selected
    if (pdfInputRef.current) pdfInputRef.current.value = ''
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the drop zone entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  // ── Extracted state: just show the chip ─────────────────────────────────
  if (extractState === 'extracted' && fileName) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success-text/25 bg-success-bg px-3 py-2">
        <FileText size={14} className="text-success-text flex-shrink-0" />
        <span className="flex-1 text-sm text-success-text font-medium truncate">{fileName}</span>
        <button
          onClick={handleClear}
          className="text-text-muted hover:text-danger-text transition-colors flex-shrink-0"
          title="Remove file"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  // ── Uploading state: show progress indicator ─────────────────────────────
  if (extractState === 'uploading' && fileName) {
    return (
      <div className="rounded-xl border border-border bg-raised px-4 py-3 flex items-center gap-3">
        <span className="h-4 w-4 rounded-full border-2 border-border border-t-action animate-spin flex-shrink-0" />
        <span className="text-sm text-text-secondary">
          Reading <span className="text-text-primary font-medium">{fileName}</span>…
        </span>
      </div>
    )
  }

  // ── Idle / error state: show upload buttons and drop zone ─────────────────
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`rounded-xl border-2 border-dashed transition-all ${
        isDragOver
          ? 'border-action/50 bg-sage-pale'
          : 'border-border bg-raised'
      } px-4 py-4 flex flex-col gap-3`}
    >
      {/* Buttons row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => pdfInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card-bg px-3 py-2 text-xs font-medium text-text-primary transition-all hover:border-border-strong"
        >
          <FileText size={13} />
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-card-bg px-3 py-2 text-xs font-medium text-text-primary transition-all hover:border-border-strong"
        >
          <Camera size={13} />
          Upload Image
        </button>

        {/* Drag hint */}
        <span className="flex-1 flex items-center justify-center text-xs text-text-muted">
          {isDragOver ? 'Drop it!' : 'or drag & drop a file'}
        </span>
      </div>

      {/* Error message */}
      {extractState === 'error' && error && (
        <p className="text-xs text-danger-text rounded-xl border border-danger-text/20 bg-danger-bg px-3 py-2">
          {error}
        </p>
      )}

      {/* Hidden file inputs */}
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />
    </div>
  )
}
