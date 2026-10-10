import { GENDER_OPTIONS, type Gender, type User } from '../types/user'

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const genderLabel = (gender: Gender) => GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender

// Presentational only: it receives data and reports clicks, it never calls the API.
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
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
                <td className="name-cell">{fullName}</td>
                <td>{user.email}</td>
                <td>{genderLabel(user.gender)}</td>
                <td>{user.telephone ?? <span className="muted">—</span>}</td>
                <td className="numeric">{user.age}</td>
                <td className="actions-col">
                  <div className="row-actions">
                    <button type="button" className="button button-small" onClick={() => onEdit(user)} aria-label={`Edit ${fullName}`}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button button-small button-danger-outline"
                      onClick={() => onDelete(user)}
                      aria-label={`Delete ${fullName}`}
                    >
                      Delete
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
