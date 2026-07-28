import { HandCoins, CheckCircle2, Circle, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { summarize, formatINR, formatDate, lateFeeFor } from '../lib/calc'

export default function BorrowerView({ agreement }) {
  const summary = summarize(agreement)
  const percent = summary.total ? (summary.paid / summary.total) * 100 : 0

  return (
    <div className="min-h-screen px-4 py-8 md:py-14">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-11 h-11 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center mb-3">
            <HandCoins size={22} className="text-teal" />
          </div>
          <h1 className="font-display font-bold text-xl">Shared loan ledger</h1>
          <p className="text-mist text-sm mt-1">
            Read-only view — shared by {agreement.lenderName} for {agreement.borrowerName}
          </p>
        </div>

        <GlassCard className="p-6 md:p-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-mist mb-0.5">Principal</p>
              <p className="font-display font-semibold">{formatINR(agreement.principal)}</p>
            </div>
            <div>
              <p className="text-xs text-mist mb-0.5">Interest</p>
              <p className="font-display font-semibold">{agreement.interestRate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-mist mb-0.5">Repaid</p>
              <p className="font-display font-semibold text-teal">{formatINR(summary.paid)} ({Math.round(percent)}%)</p>
            </div>
            <div>
              <p className="text-xs text-mist mb-0.5">Outstanding</p>
              <p className="font-display font-semibold text-gold">{formatINR(summary.outstanding)}</p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-teal rounded-full" style={{ width: `${percent}%` }} />
          </div>
        </GlassCard>

        <div>
          <h2 className="font-display font-semibold text-lg mb-3">Repayment schedule</h2>
          <GlassCard className="divide-y divide-white/8">
            {agreement.schedule.map(item => {
              const overdue = !item.paid && new Date(item.dueDate) < new Date()
              const fee = lateFeeFor(item)
              return (
                <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.paid ? (
                      <CheckCircle2 size={18} className="text-teal shrink-0" />
                    ) : overdue ? (
                      <Clock size={18} className="text-coral shrink-0" />
                    ) : (
                      <Circle size={18} className="text-mist/50 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Installment {item.installment}</p>
                      <p className="text-xs text-mist">
                        {item.paid ? `Paid ${formatDate(item.paidDate)}` : `Due ${formatDate(item.dueDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-display font-semibold text-sm block">{formatINR(item.amount)}</span>
                    {fee > 0 && <span className="text-xs text-coral">+{formatINR(fee)} late fee</span>}
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>

        <p className="text-center text-xs text-mist">
          This is a snapshot shared on {formatDate(agreement.sharedAt)}. Ask {agreement.lenderName} for a fresh link if payments have changed since.
        </p>
      </div>
    </div>
  )
}
