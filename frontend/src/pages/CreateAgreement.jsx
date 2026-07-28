import { useState, useMemo } from 'react'
import GlassCard from '../components/GlassCard'
import { calculateEMI, generateSchedule, formatINR } from '../lib/calc'
import { saveAgreement } from '../lib/storage'
import { generateAgreementPDF } from '../lib/pdf'
import { getCurrentUser } from '../lib/auth'
import { FileDown, CheckCircle2 } from 'lucide-react'

const currentUser = getCurrentUser()

const initial = {
  lenderName: currentUser?.name || '',
  borrowerName: '',
  principal: '',
  interestRate: '',
  tenureMonths: '',
  repaymentType: 'emi',
  collateral: '',
  startDate: new Date().toISOString().slice(0, 10)
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-mist mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-mist/60 focus-ring focus:border-teal/40 outline-none transition-colors'

export default function CreateAgreement({ onCreated }) {
  const [form, setForm] = useState(initial)
  const [created, setCreated] = useState(null)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const emi = useMemo(() => {
    const p = Number(form.principal), r = Number(form.interestRate), m = Number(form.tenureMonths)
    if (!p || !m) return 0
    return calculateEMI(p, r, m)
  }, [form.principal, form.interestRate, form.tenureMonths])

  const valid = form.lenderName && form.borrowerName && Number(form.principal) > 0 && Number(form.tenureMonths) > 0

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return

    const principal = Number(form.principal)
    const interestRate = Number(form.interestRate) || 0
    const tenureMonths = Number(form.tenureMonths)

    const schedule = generateSchedule({
      principal, annualRate: interestRate, months: tenureMonths,
      startDate: form.startDate, repaymentType: form.repaymentType
    })

    const agreement = {
      id: crypto.randomUUID(),
      ...form,
      principal, interestRate, tenureMonths,
      createdAt: new Date().toISOString(),
      paymentLog: [],
      schedule
    }

    saveAgreement(agreement)
    setCreated(agreement)
    onCreated()
  }

  if (created) {
    return (
      <GlassCard className="p-8 text-center max-w-md mx-auto">
        <CheckCircle2 className="mx-auto text-teal mb-3" size={40} />
        <h2 className="font-display font-bold text-xl mb-1">Agreement created</h2>
        <p className="text-mist text-sm mb-6">
          The loan for {created.borrowerName} is now on your ledger. Download the signed contract, or view it on the dashboard.
        </p>
        <button
          onClick={() => generateAgreementPDF(created)}
          className="focus-ring inline-flex items-center gap-2 bg-teal/15 text-teal border border-teal/30 rounded-xl px-5 py-2.5 font-medium hover:bg-teal/20 transition-colors"
        >
          <FileDown size={16} /> Download PDF
        </button>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl">New agreement</h1>
        <p className="text-mist text-sm mt-1">Both sides will see the same numbers, from day one.</p>
      </div>

      <GlassCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Lender name">
              <input className={inputClass} value={form.lenderName} onChange={set('lenderName')} placeholder="You" required />
            </Field>
            <Field label="Borrower name">
              <input className={inputClass} value={form.borrowerName} onChange={set('borrowerName')} placeholder="e.g. Priya Sharma" required />
            </Field>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Principal (₹)">
              <input type="number" min="0" className={inputClass} value={form.principal} onChange={set('principal')} placeholder="50000" required />
            </Field>
            <Field label="Interest rate (% p.a.)">
              <input type="number" min="0" step="0.1" className={inputClass} value={form.interestRate} onChange={set('interestRate')} placeholder="8" />
            </Field>
            <Field label="Tenure (months)">
              <input type="number" min="1" className={inputClass} value={form.tenureMonths} onChange={set('tenureMonths')} placeholder="6" required />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Repayment type">
              <select className={inputClass} value={form.repaymentType} onChange={set('repaymentType')}>
                <option value="emi">Equal monthly installments</option>
                <option value="lump_sum">Lump sum at end of tenure</option>
              </select>
            </Field>
            <Field label="Start date">
              <input type="date" className={inputClass} value={form.startDate} onChange={set('startDate')} />
            </Field>
          </div>

          <Field label="Collateral (optional)">
            <input className={inputClass} value={form.collateral} onChange={set('collateral')} placeholder="None" />
          </Field>

          {emi > 0 && form.repaymentType === 'emi' && (
            <div className="rounded-xl bg-teal/10 border border-teal/20 px-4 py-3 text-sm">
              Estimated monthly installment: <span className="font-semibold text-teal">{formatINR(emi)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!valid}
            className="focus-ring w-full bg-teal text-ink font-semibold rounded-xl py-3 hover:bg-teal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create agreement
          </button>
        </form>
      </GlassCard>
    </div>
  )
}
