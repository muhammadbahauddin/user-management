import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { GENDER_OPTIONS, type UserInput } from '../types/user'
import { getErrorMessage } from '../utils/errors'
import {
  toUserInput,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from '../validation/userForm'
import { Alert } from './Alert'
import { FormField } from './FormField'

interface UserFormProps {
  initialValues: UserFormValues
  submitLabel: string
  onSubmit: (input: UserInput) => Promise<void>
  onCancel: () => void
}

// Used for both "create" and "edit" - only the initial values and label differ.
export function UserForm({ initialValues, submitLabel, onSubmit, onCancel }: UserFormProps) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange =
    (field: keyof UserFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const next = { ...values, [field]: event.target.value }
      setValues(next)
      // Don't nag before the first submit; afterwards re-check the field as the user types.
      if (hasTriedSubmit) {
        setErrors((current) => ({ ...current, [field]: validateUserForm(next)[field] }))
      }
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasTriedSubmit(true)
    setFormError(null)

    const clientErrors = validateUserForm(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(toUserInput(values)) // on success the parent closes the form
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && Object.keys(err.fieldErrors).length > 0) {
        // Server-side rules the client can't check, e.g. "email already registered".
        setErrors(err.fieldErrors as UserFormErrors)
        setFormError('Please fix the highlighted fields.')
      } else {
        setFormError(getErrorMessage(err))
      }
      setIsSubmitting(false)
    }
  }

  const inputProps = (field: keyof UserFormValues) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: handleChange(field),
    disabled: isSubmitting,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  return (
    <form className="user-form" onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <div className="form-grid">
        <FormField id="first_name" label="First name" required error={errors.first_name}>
          <input type="text" autoComplete="given-name" autoFocus {...inputProps('first_name')} />
        </FormField>

        <FormField id="last_name" label="Last name" required error={errors.last_name}>
          <input type="text" autoComplete="family-name" {...inputProps('last_name')} />
        </FormField>

        <FormField id="email" label="Email" required error={errors.email}>
          <input type="email" autoComplete="email" {...inputProps('email')} />
        </FormField>

        <FormField id="gender" label="Gender" required error={errors.gender}>
          <select {...inputProps('gender')}>
            <option value="">Select…</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="telephone" label="Telephone" error={errors.telephone} hint="e.g. +57 300 123 4567">
          <input type="tel" autoComplete="tel" {...inputProps('telephone')} />
        </FormField>

        <FormField id="age" label="Age" required error={errors.age}>
          <input type="number" inputMode="numeric" min={1} max={120} {...inputProps('age')} />
        </FormField>
      </div>

      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="button button-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
