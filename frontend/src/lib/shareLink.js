// Encodes a read-only snapshot of an agreement into a URL so it can be
// shared with a borrower who has no account — they open the link and see
// the ledger as it stood at share-time. No backend needed.
//
// Note: this is a SNAPSHOT, not a live sync — if the lender records a new
// payment after sharing, the borrower needs a fresh link to see it. Once
// the backend (see backend/) is wired up, this can become a live view
// instead of a point-in-time snapshot.

export function buildShareLink(agreement) {
  const payload = {
    lenderName: agreement.lenderName,
    borrowerName: agreement.borrowerName,
    principal: agreement.principal,
    interestRate: agreement.interestRate,
    tenureMonths: agreement.tenureMonths,
    repaymentType: agreement.repaymentType,
    collateral: agreement.collateral,
    startDate: agreement.startDate,
    schedule: agreement.schedule,
    sharedAt: new Date().toISOString()
  }
  const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('share', encoded)
  return url.toString()
}

export function decodeShareLink(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))))
    return JSON.parse(json)
  } catch {
    return null
  }
}
