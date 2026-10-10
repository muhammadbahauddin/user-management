// Small wrapper around fetch: one place for the base URL, JSON headers and
// turning HTTP errors into a typed ApiError the UI can display.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export type FieldErrors = Record<string, string>

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: FieldErrors

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
  } catch (error) {
    // A cancelled request is not an error to show; let the caller ignore it.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new ApiError('Cannot reach the server. Check that the API is running.', 0)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    // The API always answers errors as { message, errors? }
    throw new ApiError(body?.message ?? `Request failed (${response.status}).`, response.status, body?.errors ?? {})
  }

  return body as T
}
