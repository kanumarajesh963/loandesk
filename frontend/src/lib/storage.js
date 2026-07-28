// Local-storage data layer.
// Swap these functions for real fetch() calls to the backend/ API
// once you wire up auth + MongoDB (see backend/README section).

const KEY = 'loandesk_agreements_v1'

export function getAgreements() {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function saveAgreement(agreement) {
  const list = getAgreements()
  list.unshift(agreement)
  persist(list)
  return agreement
}

export function updateAgreement(id, updater) {
  const list = getAgreements()
  const idx = list.findIndex(a => a.id === id)
  if (idx === -1) return null
  list[idx] = updater(list[idx])
  persist(list)
  return list[idx]
}

export function deleteAgreement(id) {
  const list = getAgreements().filter(a => a.id !== id)
  persist(list)
}

export function getAgreement(id) {
  return getAgreements().find(a => a.id === id) || null
}

export function markInstallmentPaid(agreementId, installmentId, note) {
  return updateAgreement(agreementId, (agreement) => {
    const schedule = agreement.schedule.map(item =>
      item.id === installmentId
        ? { ...item, paid: true, paidDate: new Date().toISOString() }
        : item
    )
    const log = agreement.paymentLog || []
    log.unshift({
      id: crypto.randomUUID(),
      installmentId,
      date: new Date().toISOString(),
      note: note || 'Marked as paid'
    })
    return { ...agreement, schedule, paymentLog: log }
  })
}

export function seedDemoData(generateSchedule) {
  if (getAgreements().length > 0) return
  const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  const principal = 50000
  const interestRate = 8
  const tenureMonths = 6
  const schedule = generateSchedule({
    principal, annualRate: interestRate, months: tenureMonths, startDate, repaymentType: 'emi'
  })
  // Mark first installment as paid for a realistic demo
  if (schedule[0]) {
    schedule[0].paid = true
    schedule[0].paidDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  }
  const demo = {
    id: crypto.randomUUID(),
    lenderName: 'You',
    borrowerName: 'Rahul Mehta',
    principal,
    interestRate,
    tenureMonths,
    repaymentType: 'emi',
    collateral: 'None',
    createdAt: new Date().toISOString(),
    startDate,
    paymentLog: [{ id: crypto.randomUUID(), installmentId: schedule[0].id, date: schedule[0].paidDate, note: 'Marked as paid' }],
    schedule
  }
  persist([demo])
}
