import { useState } from 'react'
import { FileUpload } from './FileUpload'

interface AssignmentInputProps {
  onSubmit: (input: string) => void
  isLoading: boolean
  apiKey?: string
}

export function AssignmentInput({ onSubmit, isLoading, apiKey = '' }: AssignmentInputProps) {
  const [value, setValue] = useState('')
  const isValid = value.trim().length >= 10

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && !isLoading) {
      onSubmit(value.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      {/* File upload — drag & drop + buttons, populates textarea on extraction */}
      <FileUpload
        apiKey={apiKey}
        onExtracted={(text) => setValue(text)}
        onClear={() => setValue('')}
      />

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          placeholder="Paste your assignment here... e.g. 'Write a 5-page essay on the causes of WWI, due Friday. Needs a thesis, 3 body paragraphs, and a conclusion.'"
          rows={6}
          className="w-full resize-none rounded-2xl border border-border bg-card-bg px-5 py-4 text-text-primary placeholder-text-muted outline-none focus:border-action transition-all text-base leading-relaxed disabled:opacity-50"
        />
        <span className="absolute bottom-3 right-4 text-xs text-text-muted select-none">
          {value.length} chars
        </span>
      </div>

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="relative flex items-center justify-center gap-3 rounded-2xl bg-action px-8 py-4 font-semibold text-text-inverse text-base transition-all hover:bg-action-hover active:bg-action-pressed disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-text-inverse/30 border-t-text-inverse animate-spin" />
            Breaking it down...
          </>
        ) : (
          'Break It Down'
        )}
      </button>

      {!isValid && value.length > 0 && (
        <p className="text-center text-sm text-text-secondary">
          Keep going \u2014 describe the assignment in a bit more detail
        </p>
      )}
    </form>
  )
}
