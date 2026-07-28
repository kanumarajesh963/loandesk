// Local-storage data layer, scoped per logged-in user (see auth.js).
// Swap these functions for real fetch() calls to the backend/ API
// once you wire up auth + MongoDB (see backend/README section).

import { getCurrentUser } from './auth'

function keyFor(userId) {
  return `loandesk_agreements_${userId}`
}

function currentKey() {
  const user = getCurrentUser()
  if (!user) throw new Error('No user is logged in')
  return keyFor(user.id)
}

export function getAgreements() {
  const user = getCurrentUser()
  if (!user) return []
  const raw = localStorage.getItem(keyFor(user.id))
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function persist(list) {
  localStorage.setItem(currentKey(), JSON.stringify(list))
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

export function recordPayment(agreementId, installmentId, { amount, note, proofImage } = {}) {
  return updateAgreement(agreementId, (agreement) => {
    const schedule = agreement.schedule.map(item => {
      if (item.id !== installmentId) return item
      const newAmountPaid = Math.min(item.amount, (item.amountPaid || 0) + (amount || 0))
      return {
        ...item,
        amountPaid: newAmountPaid,
        paid: newAmountPaid >= item.amount,
        paidDate: newAmountPaid >= item.amount ? new Date().toISOString() : item.paidDate
      }
    })
    const log = agreement.paymentLog || []
    log.unshift({
      id: crypto.randomUUID(),
      installmentId,
      date: new Date().toISOString(),
      amount: amount || 0,
      note: note || 'Payment recorded',
      proofImage: proofImage || null
    })
    return { ...agreement, schedule, paymentLog: log }
  })
}

// Kept for backward compatibility — marks an installment fully paid in one go.
export function markInstallmentPaid(agreementId, installmentId, note) {
  const agreement = getAgreement(agreementId)
  const item = agreement?.schedule.find(i => i.id === installmentId)
  if (!item) return null
  const remaining = item.amount - (item.amountPaid || 0)
  return recordPayment(agreementId, installmentId, { amount: remaining, note })
}

function buildAgreement(user, { borrowerName, principal, interestRate, tenureMonths, monthsAgoStart, repaymentType = 'emi', collateral = 'None' }, generateSchedule) {
  const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * monthsAgoStart).toISOString()
  const schedule = generateSchedule({ principal, annualRate: interestRate, months: tenureMonths, startDate, repaymentType })
  return {
    id: crypto.randomUUID(),
    lenderName: user.name,
    borrowerName,
    principal,
    interestRate,
    tenureMonths,
    repaymentType,
    collateral,
    createdAt: new Date().toISOString(),
    startDate,
    paymentLog: [],
    schedule
  }
}

function payInstallment(agreement, index, { full = true, partialAmount, daysAgo = 5, proofImage = null, note } = {}) {
  const item = agreement.schedule[index]
  if (!item) return agreement
  const amount = full ? item.amount : partialAmount
  item.amountPaid = Math.min(item.amount, amount)
  item.paid = item.amountPaid >= item.amount
  item.paidDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString()
  agreement.paymentLog.unshift({
    id: crypto.randomUUID(),
    installmentId: item.id,
    date: item.paidDate,
    amount: item.amountPaid,
    note: note || (item.paid ? 'Marked as paid' : 'Partial payment recorded'),
    proofImage
  })
  return agreement
}

export function seedDemoData(generateSchedule) {
  const user = getCurrentUser()
  if (!user) return
  if (getAgreements().length > 0) return

  // 1. Active, on-time — one installment paid, rest upcoming
  const onTime = buildAgreement(user, {
    borrowerName: 'Rahul Mehta', principal: 50000, interestRate: 8, tenureMonths: 6, monthsAgoStart: 1
  }, generateSchedule)
  payInstallment(onTime, 0, { full: true, daysAgo: 10 })

  // 2. Overdue with late fee accruing — demonstrates late-fee auto-calculation
  const overdue = buildAgreement(user, {
    borrowerName: 'Priya Sharma', principal: 30000, interestRate: 10, tenureMonths: 4, monthsAgoStart: 3
  }, generateSchedule)
  // leave first two installments unpaid and in the past to trigger overdue + late fee

  // 3. Partial payment with proof attached — demonstrates partial payments + proof upload
  const partial = buildAgreement(user, {
    borrowerName: 'Sneha Iyer', principal: 20000, interestRate: 6, tenureMonths: 5, monthsAgoStart: 1
  }, generateSchedule)
  const proofSvg = 'data:image/svg+xml;base64,' + btoa(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180"><rect width="300" height="180" fill="%230b1220"/><text x="20" y="90" fill="%232dd4bf" font-family="sans-serif" font-size="16">UPI payment screenshot (demo)</text></svg>'
  )
  payInstallment(partial, 0, { full: false, partialAmount: Math.round(partial.schedule[0].amount * 0.4), daysAgo: 3, proofImage: proofSvg, note: 'Partial payment via UPI, screenshot attached' })

  // 4. Due very soon — demonstrates the Reminders panel + WhatsApp nudge
  const dueSoon = buildAgreement(user, {
    borrowerName: 'Ankit Verma', principal: 15000, interestRate: 5, tenureMonths: 3, monthsAgoStart: 0.93
  }, generateSchedule)

  // 5. Fully closed loan — demonstrates the "closed" status end-to-end
  const closed = buildAgreement(user, {
    borrowerName: 'Meena Iyengar', principal: 12000, interestRate: 4, tenureMonths: 2, monthsAgoStart: 2.2
  }, generateSchedule)
  closed.schedule.forEach((_, i) => payInstallment(closed, i, { full: true, daysAgo: 30 - i * 15 }))

  persist([onTime, overdue, partial, dueSoon, closed])
}
