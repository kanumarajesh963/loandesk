import { useState } from 'react'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import { summarize, formatINR, formatDate } from '../lib/calc'

const FILTERS = ['all', 'active', 'overdue', 'closed']

export default function Agreements({ agreements, openAgreement }) {
  const [filter, setFilter] = useState('all')

  const enriched = agreements.map(a => ({ ...a, summary: summarize(a) }))
  const filtered = filter === 'all' ? enriched : enriched.filter(a => a.summary.status === filter)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Agreements</h1>
        <p className="text-mist text-sm mt-1">Every loan you've created, in one ledger.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`focus-ring shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-teal/15 text-teal border-teal/30'
                : 'text-mist border-white/10 hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-mist">Nothing here yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <GlassCard
              key={a.id}
              className="p-4 md:p-5 cursor-pointer hover:bg-white/[0.08] transition-colors flex items-center justify-between gap-4"
              onClick={() => openAgreement(a.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-semibold truncate">{a.borrowerName}</p>
                  <StatusBadge status={a.summary.status} />
                </div>
                <p className="text-sm text-mist">
                  {formatINR(a.principal)} · {a.interestRate}% · {a.tenureMonths} months
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-semibold">{formatINR(a.summary.outstanding)}</p>
                <p className="text-xs text-mist">
                  {a.summary.nextDue ? `Due ${formatDate(a.summary.nextDue.dueDate)}` : 'Fully paid'}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
