import { GENDER_OPTIONS, type Gender, type User } from '../types/user'
import { PencilIcon, TrashIcon } from './Icons'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const genderLabel = (gender: Gender) => GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender

const initials = (user: User) => `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()

// Same user, same avatar colour, without storing anything.
const AVATAR_COLORS = 6
const avatarColor = (id: number) => `avatar-${id % AVATAR_COLORS}`

// Presentational only: it receives data and reports clicks, it never calls the API.
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Gender</th>
            <th scope="col">Telephone</th>
            <th scope="col" className="numeric">Age</th>
            <th scope="col" className="actions-col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const fullName = `${user.first_name} ${user.last_name}`
            return (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <span className={`avatar ${avatarColor(user.id)}`} aria-hidden="true">
                      {initials(user)}
                    </span>
                    <div className="user-cell-text">
                      <span className="user-name">{fullName}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`pill pill-${user.gender}`}>{genderLabel(user.gender)}</span>
                </td>
                <td className="nums">{user.telephone ?? <span className="muted">—</span>}</td>
                <td className="numeric nums">{user.age}</td>
                <td className="actions-col">
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-action"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${fullName}`}
                      title="Edit"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="icon-action icon-action-danger"
                      onClick={() => onDelete(user)}
                      aria-label={`Delete ${fullName}`}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
