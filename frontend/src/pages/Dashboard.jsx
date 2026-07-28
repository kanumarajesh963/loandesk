import { TrendingUp, AlertTriangle, Wallet, Users, Bell, MessageCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import TrustRing from '../components/TrustRing'
import StatusBadge from '../components/StatusBadge'
import { summarize, formatINR, formatDate, daysUntil } from '../lib/calc'

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <GlassCard className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-2.5 md:gap-4">
      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-mist text-xs mb-0.5">{label}</p>
        <p className="font-display font-bold text-lg md:text-xl leading-tight break-words">{value}</p>
      </div>
    </GlassCard>
  )
}

export default function Dashboard({ agreements, openAgreement, setView }) {
  const enriched = agreements.map(a => ({ ...a, summary: summarize(a) }))
  const totalLent = enriched.reduce((s, a) => s + a.principal, 0)
  const totalOutstanding = enriched.reduce((s, a) => s + a.summary.outstanding, 0)
  const overdueCount = enriched.filter(a => a.summary.status === 'overdue').length
  const activeCount = enriched.filter(a => a.summary.status !== 'closed').length

  const reminders = enriched
    .filter(a => a.summary.nextDue)
    .map(a => ({ agreement: a, item: a.summary.nextDue, days: daysUntil(a.summary.nextDue.dueDate) }))
    .filter(r => r.days <= 7)
    .sort((a, b) => a.days - b.days)

  function whatsappLink(r) {
    const text = encodeURIComponent(
      `Hi ${r.agreement.borrowerName}, a friendly reminder — your installment of ${formatINR(r.item.amount)} is ${
        r.days < 0 ? `overdue since ${formatDate(r.item.dueDate)}` : r.days === 0 ? 'due today' : `due on ${formatDate(r.item.dueDate)}`
      }. Thanks!`
    )
    return `https://wa.me/?text=${text}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Good to see you</h1>
        <p className="text-mist text-sm mt-1">Here's where every relationship stands, at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total lent" value={formatINR(totalLent)} tint="bg-teal/15 text-teal" />
        <StatCard icon={TrendingUp} label="Outstanding" value={formatINR(totalOutstanding)} tint="bg-gold/15 text-gold" />
        <StatCard icon={AlertTriangle} label="Overdue loans" value={overdueCount} tint="bg-coral/15 text-coral" />
        <StatCard icon={Users} label="Active relationships" value={activeCount} tint="bg-mist/15 text-mist" />
      </div>

      {reminders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-gold" />
            <h2 className="font-display font-semibold text-lg">Reminders</h2>
          </div>
          <GlassCard className="divide-y divide-white/8">
            {reminders.map(r => (
              <div key={r.item.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.agreement.borrowerName}</p>
                  <p className="text-xs text-mist">
                    {formatINR(r.item.amount)} · {r.days < 0 ? `${Math.abs(r.days)}d overdue` : r.days === 0 ? 'due today' : `due in ${r.days}d`}
                  </p>
                </div>
                <a
                  href={whatsappLink(r)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="focus-ring flex items-center gap-1.5 text-xs font-medium bg-teal/15 text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/20 transition-colors shrink-0"
                >
                  <MessageCircle size={13} /> Remind
                </a>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg">Relationships</h2>
          <button
            onClick={() => setView('create')}
            className="focus-ring text-sm text-teal font-medium hover:underline"
          >
            + New agreement
          </button>
        </div>

        {enriched.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-mist">No agreements yet. Create your first one to start tracking.</p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enriched.map(a => {
              const percent = a.summary.total ? (a.summary.paid / a.summary.total) * 100 : 0
              return (
                <GlassCard
                  key={a.id}
                  className="p-5 cursor-pointer hover:bg-white/[0.08] transition-colors"
                  onClick={() => openAgreement(a.id)}
                >
                  <div className="flex items-center gap-4">
                    <TrustRing percent={percent} status={a.summary.status} label="repaid" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-display font-semibold truncate">{a.borrowerName}</p>
                        <StatusBadge status={a.summary.status} />
                      </div>
                      <p className="text-sm text-mist">
                        {formatINR(a.summary.outstanding)} outstanding of {formatINR(a.summary.total)}
                      </p>
                      {a.summary.nextDue && (
                        <p className="text-xs text-mist mt-1">
                          Next due {formatDate(a.summary.nextDue.dueDate)} · {formatINR(a.summary.nextDue.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
