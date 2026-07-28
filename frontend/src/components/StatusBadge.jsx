const STYLES = {
  active: 'bg-teal/15 text-teal border-teal/30',
  overdue: 'bg-coral/15 text-coral border-coral/30',
  closed: 'bg-mist/15 text-mist border-mist/30'
}

const LABELS = {
  active: 'Active',
  overdue: 'Overdue',
  closed: 'Closed'
}

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STYLES[status] || STYLES.active}`}>
      {LABELS[status] || status}
    </span>
  )
}
