import type { ReactNode } from 'react'

interface AlertProps {
  variant: 'error' | 'success'
  children: ReactNode
  action?: ReactNode
}

export function Alert({ variant, children, action }: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {action}
    </div>
  )
}
