export default function GlassCard({ children, className = '', strong = false, ...props }) {
  return (
    <div
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl shadow-glass ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
