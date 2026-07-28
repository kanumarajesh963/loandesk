import { ArrowLeft, FileDown, CheckCircle2, Circle, Clock } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import TrustRing from '../components/TrustRing'
import { summarize, formatINR, formatDate } from '../lib/calc'
import { markInstallmentPaid } from '../lib/storage'
import { generateAgreementPDF } from '../lib/pdf'

export default function AgreementDetail({ agreement, back, refresh }) {
  if (!agreement) return null
  const summary = summarize(agreement)
  const percent = summary.total ? (summary.paid / summary.total) * 100 : 0

  function handleMarkPaid(installmentId) {
    markInstallmentPaid(agreement.id, installmentId)
    refresh()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={back} className="focus-ring flex items-center gap-1.5 text-sm text-mist hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <GlassCard className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <TrustRing percent={percent} status={summary.status} label="repaid" size={72} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-bold text-xl">{agreement.borrowerName}</h1>
                <StatusBadge status={summary.status} />
              </div>
              <p className="text-sm text-mist">Lender: {agreement.lenderName}</p>
            </div>
          </div>
          <button
            onClick={() => generateAgreementPDF(agreement)}
            className="focus-ring flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <FileDown size={16} /> Download PDF
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-xs text-mist mb-0.5">Principal</p>
            <p className="font-display font-semibold">{formatINR(agreement.principal)}</p>
          </div>
          <div>
            <p className="text-xs text-mist mb-0.5">Interest</p>
            <p className="font-display font-semibold">{agreement.interestRate}% p.a.</p>
          </div>
          <div>
            <p className="text-xs text-mist mb-0.5">Outstanding</p>
            <p className="font-display font-semibold text-gold">{formatINR(summary.outstanding)}</p>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Repayment schedule</h2>
        <GlassCard className="divide-y divide-white/8">
          {agreement.schedule.map(item => {
            const overdue = !item.paid && new Date(item.dueDate) < new Date()
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
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-semibold text-sm">{formatINR(item.amount)}</span>
                  {!item.paid && (
                    <button
                      onClick={() => handleMarkPaid(item.id)}
                      className="focus-ring text-xs font-medium bg-teal/15 text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/20 transition-colors"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </GlassCard>
      </div>

      {agreement.paymentLog?.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg mb-3">Activity log</h2>
          <GlassCard className="divide-y divide-white/8">
            {agreement.paymentLog.map(log => (
              <div key={log.id} className="px-5 py-3 text-sm flex items-center justify-between">
                <span className="text-mist">{log.note}</span>
                <span className="text-xs text-mist">{formatDate(log.date)}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}
    </div>
  )
}
