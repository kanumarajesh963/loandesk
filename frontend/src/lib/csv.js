import { formatDate } from './calc'

function toCSVValue(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCSV(filename, rows) {
  const csv = rows.map(row => row.map(toCSVValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportAgreementsCSV(agreements, summarize) {
  const rows = [
    ['Borrower', 'Lender', 'Principal', 'Interest Rate (%)', 'Tenure (months)', 'Status', 'Total', 'Paid', 'Outstanding', 'Start Date']
  ]
  agreements.forEach(a => {
    const s = summarize(a)
    rows.push([
      a.borrowerName, a.lenderName, a.principal, a.interestRate, a.tenureMonths,
      s.status, s.total, s.paid, s.outstanding, formatDate(a.startDate)
    ])
  })
  downloadCSV('loandesk-agreements.csv', rows)
}

export function exportScheduleCSV(agreement) {
  const rows = [
    ['Installment', 'Due Date', 'Amount', 'Amount Paid', 'Status', 'Paid Date']
  ]
  agreement.schedule.forEach(item => {
    rows.push([
      item.installment,
      formatDate(item.dueDate),
      item.amount,
      item.amountPaid || 0,
      item.paid ? 'Paid' : 'Pending',
      item.paidDate ? formatDate(item.paidDate) : ''
    ])
  })
  downloadCSV(`loandesk-${agreement.borrowerName.replace(/\s+/g, '-')}-schedule.csv`, rows)
}
