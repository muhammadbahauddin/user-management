import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client'
import { usersApi } from '../api/users'
import type { User, UserInput } from '../types/user'
import { getErrorMessage } from '../utils/errors'

/**
 * Owns the users list fetched from the API and the actions that change it.
 *
 * - The list is loaded once and kept in state (a simple client-side cache).
 * - After create/update/delete the cache is updated from the server's response,
 *   so the table changes immediately without refetching everything.
 * - Each load uses an AbortController: starting a new load (or leaving the page)
 *   cancels the previous request, so an older, slower response can never
 *   overwrite newer data.
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    usersApi
      .list(controller.signal)
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(err))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [reloadKey])

  const reload = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadKey((key) => key + 1)
  }, [])

  const createUser = useCallback(async (input: UserInput) => {
    const created = await usersApi.create(input)
    setUsers((current) => [...current, created])
    return created
  }, [])

  const updateUser = useCallback(async (id: number, input: UserInput) => {
    const updated = await usersApi.update(id, input)
    setUsers((current) => current.map((user) => (user.id === id ? updated : user)))
    return updated
  }, [])

  const deleteUser = useCallback(async (id: number) => {
    try {
      await usersApi.remove(id)
    } catch (err) {
      // 404 = someone else already deleted it; the end result is the same.
      if (!(err instanceof ApiError && err.status === 404)) {
        throw err
      }
    }
    setUsers((current) => current.filter((user) => user.id !== id))
  }, [])

  return { users, isLoading, error, reload, createUser, updateUser, deleteUser }
}
