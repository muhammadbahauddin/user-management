import type { User, UserInput } from '../types/user'
import { apiRequest } from './client'

// One function per endpoint, so components never build URLs themselves.
export const usersApi = {
  list: (signal?: AbortSignal) => apiRequest<User[]>('/users', { signal }),

  create: (input: UserInput) =>
    apiRequest<User>('/users', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: number, input: UserInput) =>
    apiRequest<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(input) }),

  remove: (id: number) => apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
}
