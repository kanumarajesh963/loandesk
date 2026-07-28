const STATUS_COLOR = {
  active: '#2dd4bf',
  overdue: '#f2726b',
  closed: '#8fa3c4'
}

export default function TrustRing({ percent = 0, status = 'active', size = 84, label }) {
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = STATUS_COLOR[status] || STATUS_COLOR.active

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display font-bold text-sm">{Math.round(percent)}%</span>
        {label && <span className="text-[10px] text-mist">{label}</span>}
      </div>
    </div>
  )
}
