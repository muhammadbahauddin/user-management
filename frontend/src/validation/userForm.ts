import type { Gender, User, UserInput } from '../types/user'

// Form fields are kept as strings (that's what <input> gives us) and converted
// to the API types only on submit.
export interface UserFormValues {
  first_name: string
  last_name: string
  email: string
  gender: Gender | ''
  telephone: string
  age: string
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>

export const EMPTY_USER_FORM: UserFormValues = {
  first_name: '',
  last_name: '',
  email: '',
  gender: '',
  telephone: '',
  age: '',
}

// Same rules as the backend (UserModel). The server is still the source of
// truth - client-side checks are only for fast feedback.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TELEPHONE_PATTERN = /^\+?[0-9 ()-]{7,30}$/

export function validateUserForm(values: UserFormValues): UserFormErrors {
  const errors: UserFormErrors = {}

  const firstName = values.first_name.trim()
  const lastName = values.last_name.trim()
  const email = values.email.trim()
  const telephone = values.telephone.trim()
  const age = values.age.trim()

  if (!firstName) errors.first_name = 'First name is required.'
  else if (firstName.length > 100) errors.first_name = 'First name must be 100 characters or less.'

  if (!lastName) errors.last_name = 'Last name is required.'
  else if (lastName.length > 100) errors.last_name = 'Last name must be 100 characters or less.'

  if (!email) errors.email = 'Email is required.'
  else if (!EMAIL_PATTERN.test(email) || email.length > 255) errors.email = 'Please enter a valid email address.'

  if (!values.gender) errors.gender = 'Please select a gender.'

  if (telephone && !TELEPHONE_PATTERN.test(telephone)) {
    errors.telephone = 'Use 7-30 digits, spaces, +, - or parentheses.'
  }

  if (!age) errors.age = 'Age is required.'
  else if (!/^\d+$/.test(age) || Number(age) < 1 || Number(age) > 120) {
    errors.age = 'Age must be a whole number between 1 and 120.'
  }

  return errors
}

export function toFormValues(user: User): UserFormValues {
  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    gender: user.gender,
    telephone: user.telephone ?? '',
    age: String(user.age),
  }
}

// Only call after validateUserForm() returned no errors.
export function toUserInput(values: UserFormValues): UserInput {
  const telephone = values.telephone.trim()

  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim(),
    gender: values.gender as Gender,
    telephone: telephone === '' ? null : telephone,
    age: Number(values.age),
  }
}
