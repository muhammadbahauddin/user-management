// Shapes of the data exchanged with the CodeIgniter API.

export type Gender = 'male' | 'female' | 'other'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: Gender
  telephone: string | null
  age: number
  created_at: string | null
  updated_at: string | null
}

// What the client sends on create (POST) and update (PUT).
export type UserInput = Omit<User, 'id' | 'created_at' | 'updated_at'>

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]
