import { useState, type ReactNode } from 'react'
import { getErrorMessage } from '../utils/errors'
import { Alert } from './Alert'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  message: ReactNode
  confirmLabel: string
  workingLabel: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

// Asks before a destructive action and shows progress / errors while it runs.
export function ConfirmDialog({ title, message, confirmLabel, workingLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsWorking(true)
    setError(null)
    try {
      await onConfirm() // on success the parent closes this dialog
    } catch (err) {
      setError(getErrorMessage(err))
      setIsWorking(false)
    }
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <p className="confirm-message">{message}</p>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={onCancel} disabled={isWorking}>
          Cancel
        </button>
        <button type="button" className="button button-danger" onClick={handleConfirm} disabled={isWorking}>
          {isWorking ? workingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
