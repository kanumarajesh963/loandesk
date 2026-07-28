import { useState } from 'react'
import { ArrowLeft, FileDown, CheckCircle2, Circle, Clock, Share2, Copy, Check, ImagePlus, FileSpreadsheet } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import TrustRing from '../components/TrustRing'
import { summarize, formatINR, formatDate, lateFeeFor } from '../lib/calc'
import { recordPayment } from '../lib/storage'
import { generateAgreementPDF } from '../lib/pdf'
import { buildShareLink } from '../lib/shareLink'
import { exportScheduleCSV } from '../lib/csv'

function PaymentModal({ item, onClose, onSubmit }) {
  const remaining = item.amount - (item.amountPaid || 0)
  const [amount, setAmount] = useState(remaining)
  const [proofImage, setProofImage] = useState(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setProofImage(reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <GlassCard strong className="w-full max-w-sm p-6">
        <h3 className="font-display font-semibold text-lg mb-1">Record payment</h3>
        <p className="text-sm text-mist mb-5">Installment {item.installment} · {formatINR(remaining)} remaining</p>

        <label className="block mb-4">
          <span className="text-sm text-mist mb-1.5 block">Amount received (₹)</span>
          <input
            type="number" min="1" max={remaining}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus-ring focus:border-teal/40 outline-none"
          />
        </label>

        <label className="block mb-5">
          <span className="text-sm text-mist mb-1.5 block">Proof of payment (optional)</span>
          <label className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-sm text-mist hover:border-teal/30 transition-colors">
            <ImagePlus size={16} />
            {proofImage ? 'Screenshot attached' : 'Upload screenshot'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </label>

        <div className="flex gap-2">
          <button onClick={onClose} className="focus-ring flex-1 py-2.5 rounded-xl text-sm font-medium text-mist border border-white/10 hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ amount, proofImage })}
            disabled={amount <= 0 || amount > remaining}
            className="focus-ring flex-1 py-2.5 rounded-xl text-sm font-semibold bg-teal text-ink hover:bg-teal/90 disabled:opacity-40"
          >
            Confirm
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

export default function AgreementDetail({ agreement, back, refresh }) {
  const [payingItem, setPayingItem] = useState(null)
  const [copied, setCopied] = useState(false)

  if (!agreement) return null
  const summary = summarize(agreement)
  const percent = summary.total ? (summary.paid / summary.total) * 100 : 0

  function handleSubmitPayment({ amount, proofImage }) {
    recordPayment(agreement.id, payingItem.id, { amount, proofImage })
    setPayingItem(null)
    refresh()
  }

  function handleShare() {
    const link = buildShareLink(agreement)
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleShare}
              className="focus-ring flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {copied ? <Check size={16} className="text-teal" /> : <Share2 size={16} />}
              {copied ? 'Link copied' : 'Share with borrower'}
            </button>
            <button
              onClick={() => exportScheduleCSV(agreement)}
              className="focus-ring flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FileSpreadsheet size={16} /> CSV
            </button>
            <button
              onClick={() => generateAgreementPDF(agreement)}
              className="focus-ring flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FileDown size={16} /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
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
          {summary.lateFees > 0 && (
            <div>
              <p className="text-xs text-mist mb-0.5">Late fees</p>
              <p className="font-display font-semibold text-coral">{formatINR(summary.lateFees)}</p>
            </div>
          )}
        </div>
      </GlassCard>

      <div>
        <h2 className="font-display font-semibold text-lg mb-3">Repayment schedule</h2>
        <GlassCard className="divide-y divide-white/8">
          {agreement.schedule.map(item => {
            const overdue = !item.paid && new Date(item.dueDate) < new Date()
            const fee = lateFeeFor(item)
            const remaining = item.amount - (item.amountPaid || 0)
            const partiallyPaid = !item.paid && (item.amountPaid || 0) > 0

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
                      {partiallyPaid && ` · ${formatINR(item.amountPaid)} paid so far`}
                    </p>
                    {fee > 0 && <p className="text-xs text-coral mt-0.5">+{formatINR(fee)} late fee accrued</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-display font-semibold text-sm">{formatINR(remaining)}</span>
                  {!item.paid && (
                    <button
                      onClick={() => setPayingItem(item)}
                      className="focus-ring text-xs font-medium bg-teal/15 text-teal border border-teal/30 rounded-lg px-3 py-1.5 hover:bg-teal/20 transition-colors"
                    >
                      Record payment
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
              <div key={log.id} className="px-5 py-3 text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-mist truncate">
                    {log.note}{log.amount ? ` — ${formatINR(log.amount)}` : ''}
                  </span>
                  {log.proofImage && (
                    <a href={log.proofImage} target="_blank" rel="noreferrer" className="text-teal text-xs underline shrink-0">
                      view proof
                    </a>
                  )}
                </div>
                <span className="text-xs text-mist shrink-0">{formatDate(log.date)}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      )}

      {payingItem && (
        <PaymentModal
          item={payingItem}
          onClose={() => setPayingItem(null)}
          onSubmit={handleSubmitPayment}
        />
      )}
    </div>
  )
}
