export function Spinner({ label }: { label: string }) {
  return (
    <div className="spinner-wrapper" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
