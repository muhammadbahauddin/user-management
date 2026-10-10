import { useState } from 'react'
import './App.css'
import { Alert } from './components/Alert'
import { ConfirmDialog } from './components/ConfirmDialog'
import { PlusIcon, RefreshIcon } from './components/Icons'
import { Modal } from './components/Modal'
import { Spinner } from './components/Spinner'
import { UserForm } from './components/UserForm'
import { UserTable } from './components/UserTable'
import { useUsers } from './hooks/useUsers'
import type { User, UserInput } from './types/user'
import { EMPTY_USER_FORM, toFormValues } from './validation/userForm'

type FormState = { mode: 'create' } | { mode: 'edit'; user: User } | null

function App() {
  const { users, isLoading, error, reload, createUser, updateUser, deleteUser } = useUsers()

  // UI-only state lives here, in the component that needs it.
  const [form, setForm] = useState<FormState>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = async (input: UserInput) => {
    if (form?.mode === 'edit') {
      await updateUser(form.user.id, input)
      setNotice(`${input.first_name} ${input.last_name} was updated.`)
    } else {
      await createUser(input)
      setNotice(`${input.first_name} ${input.last_name} was added.`)
    }
    setForm(null)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    await deleteUser(userToDelete.id)
    setNotice(`${userToDelete.first_name} ${userToDelete.last_name} was deleted.`)
    setUserToDelete(null)
  }

  const openCreate = () => {
    setNotice(null)
    setForm({ mode: 'create' })
  }

  return (
    <div className="app">
      <header className="page-header">
        <div>
          <p className="eyebrow">User management</p>
          <h1>
            Users
            <span className="count-badge" aria-label={`${users.length} users`}>
              {isLoading && users.length === 0 ? '…' : users.length}
            </span>
          </h1>
          <p className="subtitle">Add, edit and remove the people in your system.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="button button-secondary" onClick={reload} disabled={isLoading}>
            <RefreshIcon />
            Refresh
          </button>
          <button type="button" className="button button-primary" onClick={openCreate}>
            <PlusIcon />
            Add user
          </button>
        </div>
      </header>

      <main>
        {notice && (
          <Alert
            variant="success"
            action={
              <button type="button" className="icon-button" onClick={() => setNotice(null)} aria-label="Dismiss">
                ×
              </button>
            }
          >
            {notice}
          </Alert>
        )}

        {error && (
          <Alert
            variant="error"
            action={
              <button type="button" className="button button-small" onClick={reload}>
                Try again
              </button>
            }
          >
            {error}
          </Alert>
        )}

        {isLoading && users.length === 0 ? (
          <Spinner label="Loading users…" />
        ) : users.length > 0 ? (
          <UserTable
            users={users}
            onEdit={(user) => {
              setNotice(null)
              setForm({ mode: 'edit', user })
            }}
            onDelete={(user) => {
              setNotice(null)
              setUserToDelete(user)
            }}
          />
        ) : (
          !error && (
            <div className="empty-state">
              <p>No users yet.</p>
              <button type="button" className="button button-primary" onClick={openCreate}>
                Add the first user
              </button>
            </div>
          )
        )}
      </main>

      {form && (
        <Modal title={form.mode === 'edit' ? 'Edit user' : 'Add user'} onClose={() => setForm(null)}>
          <UserForm
            // A new key gives a fresh form (fresh state) for each user opened.
            key={form.mode === 'edit' ? form.user.id : 'new'}
            initialValues={form.mode === 'edit' ? toFormValues(form.user) : EMPTY_USER_FORM}
            submitLabel={form.mode === 'edit' ? 'Save changes' : 'Create user'}
            onSubmit={handleSubmit}
            onCancel={() => setForm(null)}
          />
        </Modal>
      )}

      {userToDelete && (
        <ConfirmDialog
          title="Delete user"
          message={
            <>
              Are you sure you want to delete{' '}
              <strong>
                {userToDelete.first_name} {userToDelete.last_name}
              </strong>
              ? This cannot be undone.
            </>
          }
          confirmLabel="Delete"
          workingLabel="Deleting…"
          onConfirm={handleDelete}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  )
}

export default App
