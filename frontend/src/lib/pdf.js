import { jsPDF } from 'jspdf'
import { formatINR, formatDate, calculateEMI } from './calc'

export function generateAgreementPDF(agreement) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 56
  let y = margin
  const lineHeight = 18
  const pageWidth = doc.internal.pageSize.getWidth()

  const emi = calculateEMI(agreement.principal, agreement.interestRate, agreement.tenureMonths)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('LOAN AGREEMENT', pageWidth / 2, y, { align: 'center' })
  y += lineHeight * 2

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on ${formatDate(new Date())}`, pageWidth / 2, y, { align: 'center' })
  y += lineHeight * 2

  const addLine = (text, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(opts.size || 11)
    const split = doc.splitTextToSize(text, pageWidth - margin * 2)
    doc.text(split, margin, y)
    y += lineHeight * split.length
  }

  addLine('1. PARTIES', { bold: true, size: 12 })
  addLine(`This Loan Agreement ("Agreement") is entered into on ${formatDate(agreement.startDate)} between:`)
  addLine(`Lender: ${agreement.lenderName}`)
  addLine(`Borrower: ${agreement.borrowerName}`)
  y += lineHeight * 0.5

  addLine('2. LOAN DETAILS', { bold: true, size: 12 })
  addLine(`Principal Amount: ${formatINR(agreement.principal)}`)
  addLine(`Interest Rate: ${agreement.interestRate}% per annum`)
  addLine(`Tenure: ${agreement.tenureMonths} months`)
  addLine(`Repayment Type: ${agreement.repaymentType === 'lump_sum' ? 'Lump sum at end of tenure' : 'Equal Monthly Installments (EMI)'}`)
  if (agreement.repaymentType !== 'lump_sum') {
    addLine(`Monthly Installment: ${formatINR(emi)}`)
  }
  addLine(`Collateral: ${agreement.collateral || 'None'}`)
  y += lineHeight * 0.5

  addLine('3. REPAYMENT SCHEDULE', { bold: true, size: 12 })
  addLine('The borrower agrees to repay the loan as per the schedule maintained in the attached ledger, available to both parties at all times via LoanDesk.')
  y += lineHeight * 0.5

  addLine('4. DEFAULT & TERMINATION', { bold: true, size: 12 })
  addLine('In the event of default on any installment beyond 15 days from the due date, the lender reserves the right to demand immediate repayment of the outstanding balance. This Agreement terminates automatically upon full repayment of principal and accrued interest.')
  y += lineHeight * 0.5

  addLine('5. MUTUAL ACKNOWLEDGEMENT', { bold: true, size: 12 })
  addLine('Both parties acknowledge they have reviewed and agreed to the terms above. Digital confirmation on LoanDesk by both parties constitutes acceptance of this Agreement.')
  y += lineHeight * 2

  doc.setFont('helvetica', 'normal')
  doc.text('_____________________________', margin, y)
  doc.text('_____________________________', pageWidth - margin - 180, y)
  y += lineHeight
  doc.text(`${agreement.lenderName} (Lender)`, margin, y)
  doc.text(`${agreement.borrowerName} (Borrower)`, pageWidth - margin - 180, y)

  doc.save(`Loan-Agreement-${agreement.borrowerName.replace(/\s+/g, '-')}.pdf`)
}
