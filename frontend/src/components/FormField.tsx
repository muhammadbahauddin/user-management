import type { ReactNode } from 'react'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

// Label + input + error message. The input itself is passed as children and
// should set aria-describedby={`${id}-error`} so screen readers read the error.
export function FormField({ id, label, required, error, hint, children }: FormFieldProps) {
  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="required" aria-hidden="true"> *</span> : <span className="optional"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  )
}
